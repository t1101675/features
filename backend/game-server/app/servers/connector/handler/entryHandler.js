/**
 * 这个模块用来处理大厅和房间的连接
 */

let settings = require('../../settings');
const mlog = require('../../../../../web-server/server/controller/mlog')

const Handler = function(app, rpc_call) {
  this.app = app;
  this.app.gameRemote = rpc_call || this.app.rpc.game.gameRemote;
};
module.exports = function(app, rpc_call) {
  return new Handler(app, rpc_call);
};


function removeConnection(session) {
  let uid = session.get('username');
  if (!uid) {
    mlog.err('entryHandler', 'removeConnection', 'Unknown UID.');
    return;
  }
  let sid = this.app.get('serverId');
  mlog.info('entryHandler', 'removeConnection', 'UID removed.');
  if (!sid) {
    mlog.err('entryHandler', 'removeConnection', 'Unknown SID');
    return;
  }

  this.app.gameRemote.onDisconnect(session, uid, sid, () => {});

  session.set('username', undefined);
  session.set('lobby_id', undefined);
  session.push('lobby_id', () => {});
}

/**
 * 踢人的时候，不知道怎么获取被踢的人的session，就没法从他的session中移除lobby_id属性
 * 存在可能被利用的漏洞，这里先保存了被踢的人的名字，具体怎么处理之后再搞
 */
const kicked = {};

Handler.prototype.mochaRemove = function(session) {
  (removeConnection.bind(this))(session)
};

Handler.prototype.queryHall = function(message, session, next) {
  /*
  这里可以加对于message和session的验证处理
   */
  this.app.gameRemote.getHallStatus(session, ({hall_status, online_players}) => {
    next(null, {
      code: 200,
      hall_status,
      online_players,
    });
  });
};

Handler.prototype.queryLobby = function(message, session, next) {
  const uid = session.get('username');
  const lobby_id = session.get('lobby_id');

  if (uid === undefined || lobby_id === undefined) {
    next(null, {
      code: 400,
    });
    return;
  }

  this.app.gameRemote.getLobbyStatus(session, uid, lobby_id, ret => {
    next(null, ret);
  });
};

Handler.prototype.login = function(message, session, next) {
  // 我们现在假设用户传递一个独一无二的username
  // 实际上我们应该让用户传递一个类似于token的东西然后从后端数据库调username
  let uid = message.username;
  if (!uid) {
    next(null, {
      code: 401,
      info: 'invalid login',
    });
    mlog.err('entryHandler', 'login', 'Invaild request.');
    return;
  }

  this.app.gameRemote.onLogin(session, uid, this.app.get('serverId'), result => {
    if (result.code === 200) {
      session.bind(uid);
      session.set('username', uid);
      session.push('username', null);
      session.on('closed', removeConnection.bind(this));
      mlog.info('entryHandler', 'login', 'Success.');
      next(null, result);
    } else if (result.code === 409) {
      this.app.backendSessionService.kickByUid(this.app.get('serverId'), uid, () => {
        this.app.gameRemote.onLogin(session, uid, this.app.get('serverId'), result => {
          if (result.code === 200) {
            session.bind(uid);
            session.set('username', uid);
            session.push('username', null);
            session.on('closed', removeConnection.bind(this));
            mlog.info('entryHandler', 'login', 'Success.');
            next(null, result);
          } else {
            mlog.info('entryHandler', 'login2', result.info);
            next(null, result);
          }
        });
      });
    } else {
      next(null, result);
    }
  });
};

Handler.prototype.join = function(message, session, next) {

  const lobby_id = message.lobby_id;
  const uid = session.get('username');
  const sid = this.app.get('serverId');

  if (lobby_id === undefined || uid === undefined || sid === undefined) {
    next(null, {
      code: 400,
    });
    mlog.err('entryHandler', 'join', 'Invaild request.');
    return;
  }

  this.app.gameRemote.onJoinLobby(session, uid, lobby_id, message.lobby_password, sid, result => {
    if (result.code === 200) {
      session.set('lobby_id', lobby_id);
      session.push('lobby_id', function(err) {});
      mlog.info('entryHandler', 'join', 'Success.');
      next(null, result);
    } else {
      mlog.err('entryHandler', 'join', result.info);
      next(null, result);
    }
  });
};

Handler.prototype.ready = function(message, session, next) {

  const uid = session.get('username');
  const lobby_id = session.get('lobby_id');

  if (uid === undefined || message.status === undefined) {
    next(null, {
      code: 400,
    });
    mlog.err('entryHandler', 'ready', 'Invaild request.');
    return;
  }

  this.app.gameRemote.onReady(session, uid, lobby_id, message.status, message.slot, ret => {
    if (ret.code === 200) {
      mlog.info('entryHandler', 'ready', 'Success.');
      next(null, ret);
    } else {
      mlog.err('entryHandler', 'ready', 'Invaild request.');
      next(null, ret);
    }
  });

};

Handler.prototype.leaveLobby = function(message, session, next) {

  const lobby_id = session.get('lobby_id');
  const uid = session.get('username');
  const sid = this.app.get('serverId');

  if (lobby_id === undefined || uid === undefined || sid === undefined) {
    next(null, {
      code: 400,
    });
    mlog.err('entryHandler', 'leaveLobby', 'Invaild request.');
    return;
  }

  this.app.gameRemote.onLeaveLobby(session, uid, lobby_id, sid, result => {
    if (result.code === 200) {
      session.set('lobby_id', undefined);
      mlog.info('entryHandler', 'leaveLobby', 'Success.');
      next(null, result);
    } else {
      mlog.err('entryHandler', 'leaveLobby', result.info);
      next(null, result);
    }
  });
};

Handler.prototype.createLobby = function(message, session, next) {
  const uid = session.get('username');

  if (uid === undefined) {
    next(null, {
      code: 400,
    });
    mlog.err('entryHandler', 'createLobby', 'Invaild request.');
    return;
  }

  this.app.gameRemote.onCreateLobby(session, uid, this.app.get('serverId'), ret => {
    session.set('lobby_id', ret.lobby_id);
    session.push('lobby_id', function(err) {});
    next(null, ret);
  });
};

Handler.prototype.kickPlayer = function(message, session, next) {
  const uid = session.get('username');
  const lobby_id = session.get('lobby_id');
  const target = message.target;

  if (uid === undefined || lobby_id === undefined || target === undefined) {
    next(null, {
      code: 400,
    });
    return;
  }

  this.app.gameRemote.onKickPlayer(session, uid, lobby_id, this.app.get('serverId'), target, ret => {
    if (ret.kicked !== undefined) {
      kicked[ret.kicked] = true;
      delete ret.kicked;
    }
    next(null, ret);
  });
};

Handler.prototype.movePosition = function(message, session, next) {
  const uid = session.get('username');
  const lobby_id = session.get('lobby_id');
  const target = message.target;

  if (uid === undefined || lobby_id === undefined || target === undefined) {
    next(null, {
      code: 400,
    });
    return;
  }

  this.app.gameRemote.onMovePosition(session, uid, lobby_id, target, ret => {
    next(null, ret);
  });
};

Handler.prototype.changeLobbySettings = function(message, session, next) {
  const uid = session.get('username');
  const lobby_id = session.get('lobby_id');

  if (uid === undefined || lobby_id === undefined) {
    next(null, {
      code: 400,
    });
    return;
  }

  this.app.gameRemote.onChangeLobbySetting(session, uid, lobby_id, message, ret => {
    next(null, ret);
  });
};

Handler.prototype.logout = function(message, session, next) {
  mlog.info('entryHandler', 'logout', 'Logout.');
  next(null, {
    code: 200
  });
};
