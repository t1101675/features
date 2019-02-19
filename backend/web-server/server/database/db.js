/**
  * 数据库核心逻辑
  */

const mongoose = require('mongoose')
const sha1 = require('sha1')
const createToken = require('../token/createToken')
const mlog = require('../controller/mlog')

const os = require('os')
let dbURL = 'mongodb://database.FEATURES.secoder.local/'

var options = {
  autoReconnect: true,
  useNewUrlParser: true,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  poolSize: 10,
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000
}

/**
  * 这里是是否重启就清空数据库的一些设置
  */
var willDrop = false
var loadOnce = false

var muModel, mudb
mongoose.Promise = global.Promise

const closedb = function() {
  mlog.info('db', 'closedb', 'Database connection closed')
  mudb.close()
  mongoose.connection.close()
}

/**
  * 用户属性
  */
const userSchema = new mongoose.Schema({
  username: String,
  nickname: String,
  password: String,
  email: String,
  is_activated: Boolean,
  activation_code: String,
  change_code: String,
  token: String,
  is_admin: Boolean,
  create_time: Date,
  score: Number,
  profile: String,
  slot0: String,
  slot1: String,
  slot2: String,
  history: Array,
})

/**
  * 数据库连接完成后
  */
function padding4(num, length) { return (Array(length).join("0") + num).slice(-length); }

const onf = async function() {
    if (willDrop) {
      mlog.info('db', 'onf', 'DB dropped.')
      mudb.dropDatabase()
    }
    mlog.info('db', 'onf', 'Database connected.')
    muModel = mudb.model('User', userSchema)

    for (let i = 0; i < 20; i += 1) {
      (new module.exports.User()({
        username: 'admin' + padding4(i, 2),
        nickname: 'nickname' + padding4(i, 2),
        password: sha1('features'),
        email: 'admin' + padding4(i, 2),
        is_activated: true,
        activation_code: 'none',
        token: createToken('admin'),
        is_admin: true,
        change_code: 'none', /* Here may to a secuity bug */
        create_time: Date.now(),
        score: Math.floor(Math.random() * 100),
        profile: '',
        slot0: '',
        slot1: '',
        slot2: '',
        history: [1, 4, 3]
      })).save(err => console.log);
    }
    /* Finish */
}

/**
  * SECODER数据库连接失败
  * 这里需要尝试本地的地址
  */
const retry_local = function() {
  if (os.release() === '4.9.125-linuxkit') /* Docker-compose 数据库 */
    dbURL = 'mongodb://mongo/'
  else if (os.type() === 'Darwin' || os.type() === 'Linux') /* 本地测试或腾讯云测试服务器数据库 */
    dbURL = 'mongodb://localhost/'

  mudb = mongoose.createConnection(dbURL + 'info_db', options)
  mongoose.Promise = global.Promise

  mudb.on('open', onf)
  mudb.on('error', function() {
    mlog.err('db', 'retry_local', 'Failed to connect database.')
    process.exit(0)
  })
}

/**
  * 加载数据库
  */
const load = (wd = false) => {
  if (loadOnce) return

  willDrop = wd

  loadOnce = true
  mlog.info('db', 'load', 'Trying to connect to database.')
  mudb = mongoose.createConnection(dbURL + 'info_db', options) /* Info DB */

  mudb.on('open', onf)
  mudb.on('error', function() {
    mlog.err('db', 'load', 'Error while connecting to ' + dbURL + ', trying local address.')
    retry_local()
  })
}

module.exports = {
    User: function() { return muModel },
    closeDB: function() { closedb() },
    loadDB: load
}
