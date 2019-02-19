/**
  * Web Server主程序入口
  */
const Koa = require('koa')
const app = new Koa()
const path = require('path')
const static = require('koa-static')
const cors = require('koa-cors')

/**
  * 路由
  */
const Router = require('koa-router')
const router = new Router()

app.use(cors({credentials: true}))

/**
  * 静态文件服务器
  */
app.use(static(path.join(process.cwd(), './uploads')))
app.use(static(path.join(process.cwd(), './default')))


/**
  * CORS和路由
  */
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

const loginRouter = require('./server/routes/user')
router.use('/api', loginRouter.routes(), loginRouter.allowedMethods())

app.use(router.routes()).use(router.allowedMethods())

/**
  * 数据库
  */
const db = require('./server/database/db.js')
db.loadDB(true)

/**
  * 服务器
  */
var backendPort = 8002
var server = app.listen(backendPort, () => {
    console.log('The outer server is running on port ' + backendPort)
})
server.closeDB = () => {
  db.closeDB()
}

module.exports = server
