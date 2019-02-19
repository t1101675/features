/**
  * 数据库的上一层接口
  */

const dbs = require('./db')
const mlog = require('../controller/mlog')

const UserDB = dbs.User

/**
  * 写入用户数据到数据库
  */
const savedoc = async (doc) => {
  await new Promise((resolve, reject) => {
    doc.save((err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

/**
  * 找到一个用户
  */
const findUser = (userinfo) => {
  return new Promise((resolve, reject) => {
    UserDB().findOne(userinfo, (err, doc) => {
      if(err) reject(err)
      resolve(doc)
    })
  })
}

/**
  * 删除一个用户
  */
const delUser = function (delUsername) {
  return new Promise((resolve, reject) => {
    UserDB().findOneAndDelete({ username: delUsername }, err => {
      if(err) reject(err)
      resolve()
    })
  })
}

/**
  * 找到满足条件的全部用户
  */
const findUsers = async (userinfo = {}) => {
  return new Promise((resolve, reject) => {
    UserDB().find(userinfo, (err, doc) => {
      if (err) reject(err)
      resolve(doc)
    })
  })
}

/**
  * 游戏结束后把结算信息写回数据库
  * 支持异步和非异步
  */
const updateUserAfterGame = async (username, gameInfo, writeInBackend = true) => {
  let doc = await findUser({username: username})
  if (!doc) {
    mlog.err('db_api', 'updateUserAfterGame', 'User not found.')
    return -1
  }
  doc.score += gameInfo.score
  doc.game_time += gameInfo.game_time
  doc.history.push(gameInfo.score)
  if (writeInBackend) {
    doc.save() /* Note here is an async function due to a hign performance target, but the doc will not be saved very fast */
  } else {
    await new Promise((resolve, reject) => {
      doc.save((err) => {
        if (err) reject(err)
        resolve()
      })
    })
  }
}

/**
  * 得到排行榜
  */
const ranklist = async () => {
  let all = await findUsers({})
  let ret = all.map((info) => {
    return {
      username: info.username,
      name: info.nickname, /* nickname */
      score: info.score,
      game_time: info.game_time
    }
  })
  ret.sort((a, b) => { return b.score - a.score })
  for (let i in ret) {
    ret[i].rank = parseInt(i) + 1;
  }
  return ret
}

/**
  * 加载数据库
  */
const load = async () => {
  dbs.loadDB()
}

/**
  * 关闭数据库
  */
const close = async () => {
  dbs.closeDB()
}

module.exports = {
  savedoc, findUser, delUser,
  findUsers, ranklist, updateUserAfterGame,
  load, close
}
