/**
  * Token检测系统
  */

const jwt = require('jsonwebtoken')
const User = require('../database/db').User
const mlog = require('../controller/mlog')
const db_api = require('../database/db_api')

/**
  * 检查Token的状态
  * 这里作为必要的一个中间件
  */
module.exports = async (ctx, next) => {
  let username = undefined
  if (ctx.request.body.hasOwnProperty('username')) username = ctx.request.body.username
  else if(ctx.req.hasOwnProperty('body')) username = ctx.req.body.username

  if(ctx.request.header['authorization'] && username){
    let token = ctx.request.header['authorization']
    let doc = await db_api.findUser({username: username})
    // let decoded = jwt.decode(token, 'lyricz')
    if(token && /* decoded && decoded.exp >= new Date() / 1000 && */ doc.token === token) {
      mlog.info('checkToken', 'exports', 'Token passed.')
      return next()
    } else {
      mlog.info('checkToken', 'exports', 'Wrong token.')
      ctx.status = 401
      ctx.body = {
        info_code: -1
      }
    }
  } else {
    mlog.info('checkToken', 'exports', 'No token.')
    ctx.status = 401
    ctx.body = {
      info_code: -2
    }
  }
}
