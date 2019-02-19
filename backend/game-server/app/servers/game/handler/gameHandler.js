var settings = require("../../settings");
var World = require("./objectClasses/world.js").World;
var db = require("../../../../../web-server/server/database/db_api.js");
const config = require("./objectClasses/config.js");
const mlog = require('../../../../../web-server/server/controller/mlog');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');

var worlds = {};
var sendInterval = 5;
var sendTimer = {};
var checkInterval = 5;
var checkReadyTimer = {};

module.exports = function(app, rpc_call) {
  return new Handler(app, rpc_call);
};

var Handler = function(app, rpc_call) {
  /*rewrite rpc for unit test*/
  this.app = app;
  this.app.gameRemote = rpc_call || this.app.rpc.game.gameRemote;

  /*load database*/
  db.load();
};

function sign(appKey, appSecret, expiresIn = 60) {
  let unique = uniqid(); // generate a unique string
  let payload = {
      app: appKey,
      unique: unique
      /* exp: Math.floor(Date.now() / 1000) + expiresIn */
      // No need to add 'exp' here, jsonwebtoken lib add it automatically when you add 'expiresIn' in options
  };
  let jwtSign = jwt.sign(payload, appSecret, {
      algorithm: 'HS512',
      expiresIn: expiresIn
  });
  return {
      appKey: appKey,
      jwt: jwtSign
  };
}

function start(app, lobby_id) {
  /*start simulation*/
  mlog.info('gameHandler', 'start', 'Start simulation.')
  worlds[lobby_id].run();
  /*start sending game info*/
  startSend(app, lobby_id);
}

function end(app, lobby_id) {
  worlds[lobby_id].end();
  /*write data to database*/
  for (name in worlds[lobby_id].players) {
    db.updateUserAfterGame(name, {
      score: worlds[lobby_id].players[name].userData.score,
      game_time: 0,
    }, false);
  }
  endSend(lobby_id);

  let channelService = app.get("channelService");
  let channel = channelService.getChannel('lobby' + lobby_id.toString(), false);
  if (channel) {
    channel.pushMessage("onGameEnd", {
      code: 200,
      type: "END",
      name: "rankList",
      data: {
        rankList: worlds[lobby_id].getRankList(),
      },
    });
  }
  else {
    mlog.err('gameHandler', 'end', 'No such channel.')
  }
  delete worlds[lobby_id];
  channel.destroy();
  mlog.info('gameHandler', 'end', 'Game ends.')
}

function startSend(app, lobby_id) {
  mlog.info('gameHandler', 'startSend', 'Start to send info.')
  /*start send game info at a interval*/
  sendTimer[lobby_id] = setInterval(send.bind(null, app, lobby_id), sendInterval);
}

function endSend(lobby_id) {
  /*end sending gameinfos*/
  clearInterval(sendTimer[lobby_id]);
}

function send(app, lobby_id) {

  /*send messages to all members in lobby_id, including
    1. game info: all heros, all props, timestemp
    2. lose info: if a hero has lost the game, send this message
    3. me lose info: if a hero lose the game send message to all loser personally

    NOTE: attack and getProp flag is also clear in this function
          losers are set to invisible in this function
          whether the game is end is checked in this function
  */

  let channelService = app.get('channelService');
  let channel = channelService.getChannel('lobby' + lobby_id.toString(), false);
  /*firstly check if the world has only one player*/
  if (worlds[lobby_id].isEnd() || global.MOCHA_TESTING_END) {
    sendWinnerInfo(app, channel, lobby_id);
    end(app, lobby_id);
    return;
  }
  if (!channel) {
    mlog.err('gameHandler', 'send', 'No such channel.')
    end(app, lobby_id);
    return;
  }

  /*send game info to all players in the lobby
   NOTE: the message may be different for each player*/
  sendGameInfo(app, channel, lobby_id);

  /*attack and props flag only send one time, if it's sent, clear the flags*/
  worlds[lobby_id].clearAttackPropsFlag();
  /*if there is user who leaves the lobby*/
  worlds[lobby_id].updateUserLeave(channel.getMembers());

  /*send transmitInfo*/
  sendTransmitInfo(app, channel, lobby_id);

  /*send loser info to all players*/
  sendLoserInfo(app, channel, lobby_id);

  if (global.MOCHA_TESTING)
    sendWinnerInfo(app, channel, lobby_id)
}

function sendGameInfo(app, channel, lobby_id) {
  let members = channel.getMembers();
  for (let i = 0; i < members.length; i++) {
    let uid = members[i];
    let msg = {
      code: 200,
      type: "TICK",
      name: "gameInfo",
      data: worlds[lobby_id].getGameInfo(uid),
    };
    sendToPlayer(app, channel, uid, "onGameMsg", msg);
  }
}

function sendTransmitInfo(app, channel, lobby_id) {
  let members = channel.getMembers();
  for (let i = 0; i < members.length; i++) {
    let uid = members[i];
    let status = worlds[lobby_id].getTransmitState(uid);
    if (status <= 0) continue;
    let msg = {
      code: 200,
      type: "TICK",
      name: "transmitInfo",
      data: worlds[lobby_id].getInitRoomInfo(uid),
    };
    sendToPlayer(app, channel, uid, "onGameMsg", msg);
    worlds[lobby_id].clearTransmitFlag(uid);
  }
}

function sendWinnerInfo(app, channel, lobby_id) {
  let winner = worlds[lobby_id].getWinner();
  if (winner) {
    if (worlds[lobby_id].players[winner].userData.ai) {
      return;
    }
    let uid = winner;
    let msg = {
      code: 200,
      type: "TICK",
      name: "win",
      score: worlds[lobby_id].getPlayerScore(uid),
      rankList: worlds[lobby_id].getRankList(),
    };
    sendToPlayer(app, channel, uid, "gameEnd", msg);
  }
}

function sendLoserInfo(app, channel, lobby_id) {
  let loserList = worlds[lobby_id].getLoser();
  if (loserList.length > 0) {
    /*loser info*/
    channel.pushMessage("onGameMsg", {
      code: 200,
      type: "TICK",
      name: "someoneLose",
      data: {
        loser: loserList,
        rankList: worlds[lobby_id].getRankList(),
      },
    });

    for (let i = 0; i < loserList.length; i++) {
      /*me lose info */
      let uid = loserList[i];
      let msg = {
        code: 200,
        type: "TICK",
        name: "lose",
        data: worlds[lobby_id].getPlayerScore(uid),
        rankList: worlds[lobby_id].getRankList(),
      };
      sendToPlayer(app, channel, uid, "gameEnd", msg);
    }
    /*when the loser info are send, the loser will be removed from the world*/
    worlds[lobby_id].removeLoser();
  }
}

function sendToPlayer(app, channel, uid, route, msg) {
  let channelService = app.get("channelService");
  let member = channel.getMember(uid);
  if (member) {
    let sid = member["sid"];
    channelService.pushMessageByUids(route, msg, [{ uid: uid, sid: sid }], undefined, function(err) {
      if (err) {
        mlog.err('gameHandler', 'sendToPlayer', err)
      }
    });
  }
  else {
    mlog.err('gameHandler', 'sendToPlayer', 'No such UID.')
  }
}

function checkReady(app, channel, lobby_id) {
  worlds[lobby_id].updateUserLeave(channel.getMembers());
  if (worlds[lobby_id].isReady()) {
    /*new protocol, push gameStart when all players are ready.*/
    channel.pushMessage("onGameMsg", {
      code: 200,
      type: "TICK",
      name: "gameStart",
      data: {},
    });
    /*start game*/
    start(app, lobby_id);
    clearInterval(checkReadyTimer[lobby_id]);
  }
}

Handler.prototype._send = function(app, lobby_id) {
  send(app, lobby_id)
}

Handler.prototype.key = function(msg, session, next) {
  /*deal with the key information*/
  let lobby_id = session.get("lobby_id");
  if (msg.type === "POST") {
    if (msg.name === "keyInfo") {
      worlds[lobby_id].solveKeys(session.uid, msg.data);
      next(null, {
        code: 200
      })
    } else {
      mlog.err('gameHandler', 'key', 'No such key.')
      next(null, {
        code: 400
      })
    }
  }
};

Handler.prototype.requestGameStart = function(msg, session, next) {
  /*handle start request from players
    1. when a player clicked start, this function will be called
    2. a flag in session will be set to true
    3. if all players in the lobby clicked start, 'onGameStart' will be send to the front,
      these fronts begin to send config request.
    NOTE: function startConfig will handle config request
  */

  let uid = session.uid;
  let lobby_id = session.get("lobby_id");
  let slot = msg.slot;

  /*call the game remote to mark that the play has started*/
  this.app.gameRemote.onRequestGameStart(session, uid, lobby_id, slot, data => {
    if (data.code !== 200) {
      next(null, data);
      return;
    }

    /**
     * 这里，data.players是一个列表，每一项包含以下内容
     * （有一些列表项是null，表示房间里的空位）
     * {
     *   uid: 'username',
     *   ready: 'true',
     *   slot: 0~2
     * }'
     * 应当让前端pixi访问
     * 'http://domain:8001/api/get_hero?username=`uid`&slot=`slot`'
     * 来获取每个玩家的人物图片
     */
    let playersInfo = [];
    for (let i = 0; i < data.players.length; i++) {
      if (data.players[i]) {
        playersInfo.push(data.players[i]);
      }
    }
    /*get start state from session*/
    let channelService = this.app.get("channelService");
    let channel = channelService.getChannel('lobby' + lobby_id.toString(), false);
    // let members = channel.getMembers();

    mlog.info('gameHandler', 'requestGameStart', 'All players ready.')
    worlds[lobby_id] = new World(config.roomColumn, config.roomRow, data.hasAi);
    worlds[lobby_id].setPlayers(playersInfo);
    checkReadyTimer[lobby_id] = setInterval(checkReady.bind(null, this.app, channel, lobby_id), checkInterval);
    channel.pushMessage('onGameStart', {});
    next(null, {
      code: 200,
      msg: "game start"
    });
  });
};

Handler.prototype.startConfig = function(msg, session, next) {
  /*handle start configuerations including:
    1. the size of the scene
    2. all walls state
    3. all heros state
    4. all props state
    *5. sdk image(not done yet)

    NOTE: when the front complete all start config, it will send 'clientReady'
          if all clients are ready, function start will be called.
    NOTE: if a client leave the game for any reason, the game will start normally, but his hp will be set to 0
  */
  let lobby_id = session.get("lobby_id");
  let uid = session.uid;
  if (msg.type === "GET") {
    switch (msg.name) {
      case "gameConfig": {
        /*this is the new protocol*/
        next(null, {
          code: 200,
          type: "RETURN",
          name: msg.name,
          data: worlds[lobby_id].getInitGameInfo(uid),
        });
        break;
      }
      case "sdk": {
        next(null, {
          code: 200,
          type: "RETURN",
          name: msg.name,
          data: {
            signature: sign('b9406fe8-395c-4eb7-ac1d-549b2a366b2d', 'Eb5djEG4ZHuV7uh4bjy0LErnx7QAiPYiAapr0la4awStQUIjIwis327B5di8NQSJagdzj7fz9ERoJ1YS8tUwYOHnjJaoxNjiJ5khgmz8T4RKCos9Z4JVzZOSJOabfR8N'),
          },
        });
        break;
      }
      default:
        mlog.err('gameHandler', 'startConfig', 'No such config.')
        next(null, {
          code: 500,
          type: "RETURN",
          name: msg.name,
          msg: "no such name",
        })
    }
  } else if (msg.type === "POST") {
    if (msg.name === "clientReady") {
      /*set the players state to ready, if all players are ready, then the world start*/
      worlds[lobby_id].setPlayerState(uid, true);
      next(null, {
        code: 200,
        type: 'POST',
        name: "set ready",
        data: {}
      });
    } else {
      mlog.err('gameHandler', 'startConfig', 'No such post name.')
      return;
    }
  }
  else {
    next(null, {
      code: 500,
      type: "RETURN",
      name: "error",
      data: "request type error",
    });
  }
};
