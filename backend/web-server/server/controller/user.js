/**
  * 用户管理系统
  * 目前大部分的请求接口都在这里了，后面有时间会移动一些函数增加可读性
  */

const User = require('../database/db').User
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')
const sha1 = require('sha1')
const createToken = require('../token/createToken')
const mailVerify = require('./mail')
const mlog = require('./mlog')
const api = require('../database/db_api')
const koaSend = require('koa-send')
const config = require('../config/config')
const utility = require('../utility/utility')

const savedoc = api.savedoc
const findUser = api.findUser
const findUsers = api.findUsers
const delUser = api.delUser
const legitTest = utility.legitTest
const randStr = utility.randString

/**
  * 用户登录
  */
const Login = async (ctx) => {
  let username = ctx.request.body.username
  let password = sha1(ctx.request.body.password)

  let doc = await findUser({username: username}) || await findUser({email: username});
  if (!doc) {
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
    mlog.info('user', 'Login', 'Account not existed.')
  } else if (doc.password === password){
    if (doc.is_activated) {
      let token = createToken(username)
      doc.token = token
      savedoc(doc)

      mlog.info('user', 'Login', 'Logined successfully.')
      ctx.status = 200
      ctx.body = {
        info_code: 0,
        username,
        token,
        nickname: doc.nickname,
        isact: doc.is_activated
      }
    } else {
      mlog.info('user', 'Login', 'Not activated.')
      ctx.status = 200;
      ctx.body = {
        info_code: 3,
      }
    }
  } else {
    mlog.info('user', 'Login', 'Incorrect password.')
    ctx.status = 200
    ctx.body = {
      info_code: 2
    }
  }
}

/**
 * 检验用户名、邮箱是否已经被注册
 */
const CheckAvailable = async (ctx) => {
  let username = ctx.request.body.username;
  let email = ctx.request.body.email;

  let info_code = 0;
  if (username) {
    if (legitTest.username(username)) {
      if (await findUser({username: username})) {
        mlog.info('user', 'CheckAvailable', 'Username already used.')
        info_code |= 1;
      }
    } else {
      mlog.info('user', 'CheckAvailable', 'CAU Illegal.')
      return;
    }
  }
  if (email) {
    if (legitTest.email(email)) {
      if (await findUser({email: email})) {
        mlog.info('user', 'CheckAvailable', 'Email already used.')
        info_code |= 2;
      }
    } else {
      mlog.info('user', 'CheckAvailable', 'CAU Illegal.')
      return;
    }
  }
  ctx.status = 200;
  ctx.body = {
    info_code,
  };
}

/**
 * 用户注册
 */
const Register = async (ctx) => {
  let user = new User()({
    username: ctx.request.body.username,
    nickname: 'player' + Math.random().toString(36).substring(2, 10),
    password: sha1(ctx.request.body.password),
    email: ctx.request.body.email,
    is_activated: false,
    is_admin: false,
    change_code: 'none',
    token: createToken(this.username),
    score: 0,
    history: []
  })

  user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss')

  let doc = await findUser({username: user.username})
  let doc_email = await findUser({email: user.email})
  if (doc) {
    mlog.info('user', 'Register', 'Account existed.')
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
  } else if(doc_email) {
    mlog.info('user', 'Register', 'Account email existed.')
    ctx.status = 200
    ctx.body = {
      info_code: 3
    }
  } else {
    user.activation_code = randStr(8)

    let sendOut = await mailVerify.sendCode(user.username, user.email, user.activation_code)
    if (!sendOut) {
      mlog.err('user', 'Register', 'Error while sending mail of activation.')
      ctx.status = 200
      ctx.body = {
        info_code: 2
      }
    } else {
      mlog.info('user', 'Register', user.username + ' registered successfully.')
      savedoc(user)

      ctx.status = 200
      ctx.body = {
        info_code: 0
      }
    }
  }
}

/**
 * 激活用户
 * 这里是一个链接的形式，成功后会redirect到首页
 */
const ActivateUser = async (ctx) => {
  let username = ctx.query.username;
  let activation_code = ctx.query.code;
  let doc = await findUser({username: username})

  if(activation_code === doc.activation_code) {
    await new Promise((resolve, reject) => {
      doc.updateOne({is_activated: true}, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
    mlog.info('user', 'ActivateUser', username + ' activated successfully.')
    if (!global.MOCHA_TESTING)
      ctx.redirect('https://featuresgame.tk');
    ctx.body = '账户激活成功，正在跳转至登录页面';
  } else {
    mlog.info('user', 'ActivateUser', 'Code incorrect, username: ' + username)
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
  }
}

/**
 * 得到用户列表
 * 只有管理员可以做这件事情
 */
const GetAllUsers = async (ctx) => {
  let username = ctx.request.body.username
  let req_user = await findUser({username: username})
  if(!req_user.is_admin) {
    mlog.info('user', 'GetAllUsers', 'Not admin.')
    ctx.status = 404
  } else {
    mlog.info('user', 'GetAllUsers', 'Success.')
    let doc = await findUsers()
    ctx.status = 200
    ctx.body = {
      info_code: 0,
      userlist: doc
    }
  }
}

/**
 * 删除一个用户
 * 只有管理员可以做这件事情
 */
const DeleteUser = async (ctx) => {
  let username = ctx.request.body.username
  let req_user = await findUser({username: username})
  if(!req_user.is_admin) {
    mlog.info('user', 'DeleteUser', 'Not admin.')
    ctx.status = 404
  } else {
    let delusername = ctx.request.body.delusername
    mlog.info('user', 'DeleteUser', 'Success.')
    await delUser(delusername)
    ctx.status = 200
    ctx.body = {
      info_code: 0
    }
  }
}

/**
 * 这是修改用户密码
 */
const ChangePassword = async (ctx) => {
  let username = ctx.request.body.username
  let orgpw = sha1(ctx.request.body.orgpw), newpw = sha1(ctx.request.body.newpw)

  let doc = await findUser({username: username})
  if(doc.password === orgpw) {
    mlog.info('user', 'ChangePassword', 'Success.')
    doc.password = newpw
    savedoc(doc)
    ctx.status = 200
    ctx.body = {
      info_code: 0
    }
  } else {
    mlog.info('user', 'ChangePassword', 'Incorrect password.')
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
  }
}

/**
 * 修改昵称
 */
const ChangeNickname = async ctx => {
  let username = ctx.request.body.username;
  let nickname = ctx.request.body.nickname;
  let doc = await findUser({username});
  if (!doc || !legitTest.nickname(nickname)) {
    return;
  }
  mlog.info('user', 'ChangeNickname', 'Success.')
  doc.nickname = nickname;
  savedoc(doc);
  ctx.status = 200;
  ctx.body = {
    info_code: 0,
  }
}

/**
 * 询问昵称
 * GET方法，参数为usernames
 * usernames string 可以为多个用户名，以逗号分隔
 */
const QueryNickname = async (ctx) => {
  let usernames = ctx.query.usernames;
  if (!usernames) {
    return;
  }
  let list = usernames.split(',');

  // 拒绝不合法请求
  if (list.length >= 100) {
    return;
  }
  for (let item of list) {
    if (!legitTest.username(item)) {
      return;
    }
  }

  await Promise.all(list.map(uid => findUser({username: uid})))
    .then(docList => {
      ctx.status = 200;
      ctx.body = {
        nickname_list: docList.map(doc => doc.nickname)
      }
    })
};

/**
 * 得到一个用户的激活码
 * 这里是为了单元测试开的洞
 */
const GetActivationCode = async (ctx) => {
  let pass_be = ctx.request.body.pass_be
  let username = ctx.request.body.username
  if (pass_be === 'd89a3dh8') {
    mlog.info('user', 'GetActCode', 'Success.')
    let doc = await findUser({username: username})
    ctx.status = 200
    ctx.body = {
      info_code: 0,
      actcode: doc.activation_code
    }
  } else {
    mlog.info('user', 'GetActCode', 'Wrong password.')
    ctx.status = 404
  }
}

/**
 * 得到一个用户的修改密码请求
 * 这里是为了单元测试开的洞
 */
const GetChangeCode = async (ctx) => {
  let pass_be = ctx.request.body.pass_be
  let username = ctx.request.body.username
  if (pass_be === 'd89a3dh8') {
    mlog.info('user', 'GetActCode', 'Success.')
    let doc = await findUser({username: username})
    ctx.status = 200
    ctx.body = {
      info_code: 0,
      change_code: doc.change_code
    }
  } else {
    mlog.info('user', 'GetActCode', 'Wrong password.')
    ctx.status = 404
  }
}

/**
 * 用户修改密码
 */
const RequestNewPassword = async (ctx) => {
  let username = ctx.request.body.username;
  let email = ctx.request.body.email;
  let doc = await findUser({username: username})

  if (!doc || doc.email !== email) {
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
    mlog.info('user', 'RequestNewPassword', 'Account not existed.')
  } else {
    doc.change_code = randStr(8)
    let sendOut = await mailVerify.sendChangeReq(doc.email, doc.change_code)
    if (!sendOut) {
      mlog.err('user', 'RequestNewPassword', 'Error sending mail.')
      ctx.status = 200
      ctx.body = {
        info_code: 2
      }
    } else {
      mlog.info('user',' RequestNewPassword', 'Mail sent.')
      savedoc(doc)
      ctx.status = 200
      ctx.body = {
        info_code: 0
      }
    }
  }
}

/**
 * 修改为新的密码
 */
const NewPassword = async (ctx) => {
  let username = ctx.request.body.username, change_code = ctx.request.body.change_code, newpw = sha1(ctx.request.body.newpw)
  let doc = await findUser({username: username})

  if (!doc) {
    mlog.info('user', 'NewPassword', 'Account not existed.')
    ctx.status = 200
    ctx.body = {
      info_code: 1
    }
  } else {
    if (change_code !== doc.change_code) {
      mlog.info('user', 'NewPassword', 'Wrong changecode.')
      ctx.status = 200
      ctx.body = {
        info_code: 2
      }
    } else {
      mlog.info('user', 'NewPassword', 'Success.')
      doc.password = newpw
      savedoc(doc)
      ctx.status = 200
      ctx.body = {
        info_code: 0
      }
    }
  }
}

/**
 * 进入游戏
 * 这个函数也许没用，后面会删掉
 */
const Game = async (ctx) => {
  ctx.status = 200
  ctx.body = {
    info_code: 0
  }
  mlog.info('user', 'Game', 'Success.')
}

/**
 * 得到排行榜
 */
const Ranklist = async (ctx) => {
  ctx.status = 200;
  ctx.body = await api.ranklist();
  mlog.info('user', 'Ranklist', 'Success.')
};

/**
 * 得到个人战绩
 */
const History = async (ctx) => {
  let username = ctx.request.body.username
  let doc = await findUser({username: username})

  if (!doc) {
    mlog.info('user', 'History', 'Not such user.')
    ctx.status = 404
  } else {
    ctx.status = 200
    ctx.body = {
      history: doc.history
    }
  }
}

const getLast = (path, attr) => {
  if (!path) {
    if (attr === 'profile') return 'profile.jpg'
    return 'hero.png'
  }
  let sp = path.split('/')
  return sp[sp.length - 1]
}

/**
 * 上传头像
 */
const UploadProfile = async (ctx) => {
  let username = ctx.req.body.username
  let doc = await findUser({username: username})

  if(!doc || !legitTest.profile(ctx.req.file)) {
    mlog.info('user', 'UploadProfile', 'Profile invaild.')
    ctx.status = 403
  } else {
    ctx.status = 200
    doc.profile = ctx.req.file.path
    savedoc(doc)
    mlog.info('user', 'UploadProfile', 'Success.')
  }
}

/**
 * 得到用户的头像
 */
const GetProfile = async (ctx) => {
  let username = ctx.query.username
  let doc = await findUser({username: username})

  if (!doc) {
    mlog.info('user', 'GetProfile', 'Not such user.')
    ctx.status = 403
  } else {
    ctx.status = 200
    let profile_path = getLast(doc.profile, 'profile')
    ctx.redirect('/' + profile_path)
    mlog.info('user', 'GetProfile', 'Success.')
  }
}

/**
 * 上传英雄
 */
const UploadHero = async (ctx) => {
  let username = ctx.req.body.username
  let slot = ctx.req.body.slot
  let doc = await findUser({username: username})

  if (!doc || !legitTest.hero(ctx.req.file) || !legitTest.slot(slot)) {
    mlog.info('user', 'UploadHero', 'Hero invaild.')
  } else {
    ctx.status = 200
    doc['slot' + slot] = ctx.req.file.path
    savedoc(doc)
    mlog.info('user', 'UploadHero', 'Success.')
  }
}

/**
  * 得到某个用户的英雄图片
  */
const GetHero = async (ctx) => {
  let slot = ctx.query.slot
  let username = ctx.query.username
  let doc = await findUser({username: username})

  if (!doc || !legitTest.slot(slot)) {
    ctx.status = 403
    mlog.info('user', 'GetHero', 'Hero invaild.')
  } else {
    ctx.status = 200
    slot = 'slot' + slot
    let slot_path = getLast(doc[slot], 'hero')
    ctx.redirect('/' + slot_path)
    mlog.info('user', 'GetHero', 'Success.')
  }
}

/**
  * 清除某个用户的某个槽的英雄
  */
const ClearHero = async (ctx) => {
  let slot = ctx.request.body.slot
  let username = ctx.request.body.username
  let doc = await findUser({username: username})
  if (!doc || !legitTest.slot(slot)) {
    mlog.info('user', 'ClearHero', 'Invaild.')
    ctx.status = 404
  } else {
    ctx.status = 200
    slot = 'slot' + slot
    doc[slot] = ''
    savedoc(doc)
    mlog.info('user', 'ClearHero', 'Success.')
  }
}


module.exports = {
  Login, CheckAvailable, Register, ActivateUser, GetAllUsers,
  QueryNickname, DeleteUser, GetActivationCode, Game, ChangePassword, ChangeNickname,
  RequestNewPassword, NewPassword, GetChangeCode, Ranklist,
  UploadProfile, GetProfile, History,
  UploadHero, GetHero, ClearHero
}
