/**
 * 这个模块用来处理大厅和房间的逻辑，对用户不可见
 */

let settings = require('../../settings');
const mlog = require('../../../../../web-server/server/controller/mlog');

module.exports = function (app) {
  return new GameRemote(app);
};

var GameRemote = function (app) {
  this.app = app;

  this.sessionService = this.sessionService || this.app.get('sessionService');
  this.channelService = this.channelService || this.app.get('channelService');

  this.initialize();
};

/**
 * 初始化房间和玩家信息
 */
GameRemote.prototype.initialize = function () {

  // player_status对每个玩家的uid存储一个字典
  this.player_status = {};

  // lobby_channels存放每个lobby对应的channel
  this.lobby_channels = {};

  // lobby_status的格式同通信协议中queryLobbies返回的lobbies
  this.lobby_status = {};

  // 计lobby数量
  this.lobby_count = 0;

  // 大厅（未加入房间玩家）的channel
  this.hall_channel = this.channelService.createChannel('hall');
};

/*
lobby_status 的格式：
{
  lobby_id: lobby_id,
  players: [
    {
      uid: 'uid1',
      ready: false,
      slot: 2, //所选择的人物图片
    },
    {...}, ...
  ]
  password: '',
  in_game: false,
}
 */

let countPlayer = function (lobby) {
  let player_count = 0;
  for (let player of lobby.players) {
    if (player !== null) {
      player_count += 1;
    }
  }
  return player_count;
};

/**
 * 只要房间数量没有达到settings.max_lobby，便创建一个房间及其channel
 * @returns int lobby_id
 *    如果房间数量已达上限则返回-1
 * @private
 */
GameRemote.prototype._createLobby = function () {
  if (this.lobby_count >= settings.max_lobby) {
    return -1;
  }
  this.lobby_count += 1;
  let lobby_id = Math.floor(Math.random() * settings.max_lobby_id);
  while (this.lobby_status.hasOwnProperty(lobby_id)) {
    lobby_id = Math.floor(Math.random() * settings.max_lobby_id);
  }
  this.lobby_channels[lobby_id] = this.channelService.createChannel('lobby' + lobby_id.toString());
  this.lobby_status[lobby_id] = {
    lobby_id,
    players: Array.from({length: settings.default_max_player}, () => null),
    password: '',
    in_game: false,
  };
  return lobby_id;
};

/**
 * 关闭一个房间
 * @param lobby_id
 * @private
 */
GameRemote.prototype._destroyLobby = function (lobby_id) {
  this.lobby_count -= 1;
  this.channelService.destroyChannel(lobby_id.toString());
  if (!global.MOCHA_TESTING)
    delete this.lobby_status[lobby_id]
};

/**
 * 将玩家从房间中移除
 * 前置条件：该玩家在一个房间中
 */
GameRemote.prototype._removePlayerFromLobby = function (uid, sid) {
  const lobby_id = this.player_status[uid].lobby;
  const lobby = this.lobby_status[lobby_id];

  this.player_status[uid].lobby = null;

  //从channel中移除
  this.lobby_channels[lobby_id].leave(uid, sid);

  //如果房间只有一个人，就直接关闭房间，方法结束
  if (countPlayer(lobby) === 1) {
    this._destroyLobby(lobby_id);
    return;
  }

  //从lobby中移除，如果房主离开则找人接替
  let index = lobby.players.findIndex(p => p && p.uid === uid);
  lobby.players[index] = null;
  if (index === 0) {
    for (let i = 1; i < lobby.players.length; i += 1) {
      if (lobby.players[i] !== null) {
        lobby.players[0] = lobby.players[i];
        lobby.players[0].ready = true;
        lobby.players[i] = null;
        break;
      }
    }
  }
};

/**
 * 将玩家从大厅添加到房间
 * @private
 */
GameRemote.prototype._addPlayerToLobby = function (uid, sid, lobby_id) {
  this.hall_channel.leave(uid, sid);
  this.lobby_channels[lobby_id].add(uid, sid);
  this.player_status[uid].lobby = lobby_id;
  const lobby = this.lobby_status[lobby_id];
  for (let i = 0; i < lobby.players.length; i += 1) {
    if (lobby.players[i] === null) {
      lobby.players[i] = {
        uid,
        ready: i === 0,
        slot: -1,
      };
      break;
    }
  }
};

/**
 * 生成大厅信息
 * @private
 */
GameRemote.prototype._getHallStatus = function () {
  const hall_status = [];
  for (let key in this.lobby_status) {
    if (this.lobby_status.hasOwnProperty(key)) {
      const lobby = this.lobby_status[key];
      hall_status.push({
        lobby_id: lobby.lobby_id,
        players: lobby.players,
        password: lobby.password !== '',
        in_game: lobby.in_game,
      });
    }
  }
  return {
    hall_status,
    online_players: Object.keys(this.player_status).length,
  };
};

/**
 * 返回大厅信息
 * 由entryHandler调用
 */
GameRemote.prototype.getHallStatus = function (callback) {
  callback = callback || (() => {
  });
  callback(this._getHallStatus());
};

/**
 * 返回自己所在的房间信息
 * 由entryHandler调用
 * 会返回明文房间密码
 */
GameRemote.prototype.getLobbyStatus = function (uid, lobby_id, callback) {
  callback = callback || (() => {
  });

  if (!this.player_status.hasOwnProperty(uid) ||
      this.player_status[uid].lobby !== lobby_id) {
    callback({
      code: 400,
      info: 'invalid request',
    });
    return;
  }

  callback({
    code: 200,
    lobby: this.lobby_status[lobby_id],
  });
};

/**
 * 定时广播房间信息
 * @param stop 当值为'stop'时，停止循环
 * @private
 */
GameRemote.prototype._broadcastLobbyStatus = function (stop) {
  if (this._broadcastLobbyStatusCycle) {
    clearTimeout(this._broadcastLobbyStatusCycle);
  }
  if (stop === 'stop') {
    return;
  }
  this._broadcastLobbyStatusCycle = setTimeout(() => this._broadcastLobbyStatus(), 1000);

  // 向大厅广播大厅信息
  this.hall_channel.pushMessage('hall_status', this._getHallStatus());

  // 向房间广播房间信息
  for (let lobby_id in this.lobby_status) {
    this.lobby_channels[lobby_id].pushMessage('lobby_status', this.lobby_status[lobby_id]);
  }
};

/**
 * 当玩家登录时
 * 返回：
 * 200-成功
 * 400-用户不存在
 * 409-用户重复
 */
GameRemote.prototype.onLogin = function (uid, sid, callback) {
  callback = callback || (() => {
  });

  if (!uid) {
    callback({
      code: 400,
      info: 'no username',
    });
    return;
  }

  //duplicate log in
  if (this.player_status[uid]) {
    callback({
      code: 409,
      info: 'duplicate login',
    });
    return;
  }

  this.player_status[uid] = {
    lobby: null,
  };

  if (!this._broadcastLobbyStatusCycle) {
    this._broadcastLobbyStatus();
  }

  this.hall_channel.add(uid, sid);

  callback({
    code: 200,
    state: 'success',
  });
};

/**
 * 当玩家点击加入房间时
 * （由entryHandler来判断请求来源是否合法）
 * 返回：
 * 200-成功
 * 400-不存在相应房间id
 * 403-房间密码错误
 * 409-已在房间
 * 503-加入失败
 */
GameRemote.prototype.onJoinLobby = function (uid, lobby_id, lobby_password, sid, callback) {
  callback = callback || (() => {
  });

  const channel = this.lobby_channels[lobby_id];
  const lobby = this.lobby_status[lobby_id];

  if (!channel || !lobby) {
    callback({
      code: 400,
      info: 'invalid lobby id',
    });
    return;
  }
  if (this.player_status[uid].lobby !== null) {
    callback({
      code: 409,
      info: 'already in lobby',
    });
    return;
  }
  if (lobby.in_game) {
    callback({
      code: 503,
      info: 'Game has already started in that lobby.',
    });
    return;
  }
  if (lobby.players.length === countPlayer(lobby)) {
    callback({
      code: 503,
      info: 'The lobby is full.',
    });
    return;
  }
  if (lobby.password !== '' && lobby.password !== lobby_password) {
    callback({
      code: 403,
      info: 'wrong password',
    });
    return;
  }

  this._addPlayerToLobby(uid, sid, lobby_id);

  callback({
    code: 200,
    lobby: lobby,
  });
};

/**
 * 当玩家在房间点击退出时
 * （由entryHandler来判断请求来源是否合法）
 * 返回：
 * 200-成功
 * 400-不存在相应房间id
 * 409-未在房间
 */
GameRemote.prototype.onLeaveLobby = function (uid, lobby_id, sid, callback) {
  callback = callback || (() => {
  });

  if (lobby_id !== this.player_status[uid].lobby) {
    callback({
      code: 409,
      info: 'you\'ve been kicked out of the lobby',
    });
    return;
  }

  this._removePlayerFromLobby(uid, sid);
  callback({
    code: 200,
  });
};

/**
 * 当玩家切换房间中的位置时
 * 返回：
 * 200-成功或未移动
 * 403-不在房间
 */
GameRemote.prototype.onMovePosition = function (uid, lobby_id, target, callback) {
  const lobby = this.lobby_status[lobby_id];

  if (lobby_id !== this.player_status[uid].lobby) {
    callback({
      code: 403,
      info: 'you\'ve been kicked out of the lobby',
    });
    return;
  }

  if (lobby.players[target] !== null) {
    callback({
      code: 200,
      info: 'target position is occupied',
      lobby,
    });
    return;
  }

  const index = lobby.players.findIndex(p => p && p.uid === uid);
  if (index !== target) {
    lobby.players[target] = lobby.players[index];
    lobby.players[target].ready = target === 0;
    lobby.players[index] = null;
  }
  callback({
    code: 200,
    info: 'move successful',
    lobby: lobby,
  });

};

/**
 * 当房主踢人时
 * @param target 所要踢的人在房间的位置
 * 返回：
 * 200-成功
 * 400-目标不能被踢
 * 403-不是房主
 * 510-目标不存在
 */
GameRemote.prototype.onKickPlayer = function (uid, lobby_id, sid, target, callback) {
  const lobby = this.lobby_status[lobby_id];

  if (lobby.players[0].uid !== uid) {
    callback({
      code: 403,
      info: 'you are not the lobby owner',
    });
    return;
  }
  if (!lobby.players[target]) {
    callback({
      code: 510,
      info: 'target is no longer there',
    });
    return;
  }
  if (target === 0) {
    callback({
      code: 400,
      info: 'you cannot kick yourself',
    });
    return;
  }
  if (lobby.players[target].ready) {
    callback({
      code: 400,
      info: 'you cannot kick a prepared player',
    });
    return;
  }

  const kicked = lobby.players[target].uid;
  this.channelService.pushMessageByUids('kicked', {}, [{uid: kicked, sid}], null, () => {
    mlog.info('gameRemote', 'onKickPlayer', 'Kicked.')
    this._removePlayerFromLobby(kicked, sid);
    callback({
      code: 200,
      lobby: lobby,
      kicked: kicked,
    });
  });
};

/**
 * 当玩家点击创建房间时
 * （由entryHandler来判断请求来源是否合法）
 * 返回：
 * 200-成功
 * 409-已在房间
 * 503-创建失败，房间已达上限
 */
GameRemote.prototype.onCreateLobby = function (uid, sid, callback) {
  if (this.player_status[uid].lobby !== null) {
    callback({
      code: 409,
      info: 'already in lobby',
    });
    return;
  }
  const lobby_id = this._createLobby();
  if (lobby_id === -1) {
    callback({
      code: 503,
      info: 'lobby count reached maximum',
    });
    return;
  }

  // 将该玩家移动到新创建的房间中
  this._addPlayerToLobby(uid, sid, lobby_id);
  callback({
    code: 200,
    lobby_id: lobby_id,
    lobby: this.lobby_status[lobby_id],
  });

};

/**
 * 当玩家断线时
 * - 从用户列表和房间中都删除这个玩家
 * - 从channel中移除连接
 */
GameRemote.prototype.onDisconnect = function (uid, sid, callback) {
  callback = callback || (() => {
  });

  // 从用户列表和房间中都删除这个玩家
  if (!this.player_status.hasOwnProperty(uid)) {
    mlog.err('gameRemote', 'onDisconnect', 'Player not recorded.')
    return;
  }

  let lobby_id = this.player_status[uid].lobby;
  if (lobby_id === null) {
    this.hall_channel.leave(uid, sid);
    delete this.player_status[uid];
    mlog.info('gameRemote', 'onDisconnect', 'Player removed from hall.')
  } else {
    //从channel中移除连接
    this._removePlayerFromLobby(uid, sid);
    delete this.player_status[uid];
    mlog.info('gameRemote', 'onDisconnect', 'Player removed from lobby.')
  }

};

/**
 * 当玩家点击"准备"/"取消准备"时
 * 返回：
 * 200-成功
 * 400-不合法请求
 * 409-不在相应房间
 */
GameRemote.prototype.onReady = function (uid, lobby_id, status, slot, callback) {
  callback = callback || (() => {
  });

  if (!this.player_status.hasOwnProperty(uid) ||
      lobby_id !== this.player_status[uid].lobby) {
    callback({
      code: 400,
      info: 'no such player',
    });
    return;
  }

  let lobby = this.lobby_status[lobby_id];
  let index = lobby.players.findIndex(p => p && p.uid === uid);
  if (index === -1) {
    mlog.err('gameRemote', 'onReady', 'lobby_status error.')
    callback({
      code: 500,
      info: 'Internal Error XVEPM',
    });
    return;
  }
  switch (status) {
    case 'ready':
      lobby.players[index].slot = slot;
      lobby.players[index].ready = true;
      callback({code: 200, lobby});
      return;
    case 'not_ready':
      lobby.players[index].ready = false;
      callback({code: 200, lobby});
      return;
    default:
      callback({
        code: 400,
        info: 'invalid status message',
      });
  }
};

/**
 * 房主点击"开始"
 */
GameRemote.prototype.onRequestGameStart = function (uid, lobby_id, slot, callback) {
  callback = callback || (() => {
  });


  let lobby = this.lobby_status[lobby_id];
  let index = lobby.players.findIndex(p => p && p.uid === uid);

  if (!this.player_status.hasOwnProperty(uid) ||
      !lobby ||
      this.player_status[uid].lobby !== lobby_id ||
      lobby.in_game) {
    callback({
      code: 400,
      info: 'invalid request',
    });
    mlog.err('gameRemote', 'onReady', 'Invaild request.')
    return;
  }

  lobby.players[index].slot = slot;
  lobby.in_game = true;
  this.lobby_channels[lobby_id].pushMessage('gameStart', {});
  callback({
    code: 200,
    hasAi: lobby.players.length === 1,
    players: lobby.players,
  });
};

/**
 * 房主修改房间属性
 * 返回：
 * 200-成功
 * 412-无法修改，最大人数不能小于当前人数
 * 400-非法请求
 */
GameRemote.prototype.onChangeLobbySetting = function (uid, lobby_id, set, callback) {
  callback = callback || (() => {
  });

  const mp = set.max_player;

  if (!this.player_status.hasOwnProperty(uid) ||
      this.player_status[uid].lobby !== lobby_id ||
      !Number.isInteger(mp) ||
      mp < settings.min_max_player ||
      mp > settings.max_max_player) {
    callback({
      code: 400,
      info: 'invalid request',
    });
    mlog.err('gameRemote', 'onChangeLobbySetting', 'Invalid request.');
    return;
  }

  if (set.lobby_password.length > 10) {
    callback({
      code: 400,
      info: 'invalid request',
    });
    mlog.err('gameRemote', 'onChangeLobbySetting', 'Too long.')
    return;
  }

  const lobby = this.lobby_status[lobby_id];
  if (mp < countPlayer(lobby)) {
    callback({
      code: 412,
      info: 'max_player smaller than current player_count',
      lobby: lobby,
    });
    mlog.err('gameRemote', 'onChangeLobbySetting', 'Exceed max.')
    return;
  }

  if (mp < lobby.players.length) {
    const to_pop = lobby.players.length - mp;
    for (let i = 0; i < to_pop; i += 1) {
      let player = lobby.players.pop();
      if (player === null) {
        continue;
      }
      let index = lobby.players.indexOf(null);
      lobby.players[index] = player;
    }
  } else if (mp > lobby.players.length) {
    while (lobby.players.length < mp) {
      lobby.players.push(null);
    }
  }
  lobby.password = set.lobby_password;

  callback({
    code: 200,
    info: 'success',
    lobby: lobby,
  });
  mlog.info('gameRemote', 'onChangeLobbySetting', 'Success.')
};
