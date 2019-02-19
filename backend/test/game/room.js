/**
  * 房间系统测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')

/**
  * Pomelo设置
  */
const app = require('pomelo/lib/application')
const entryHandler = require('../../game-server/app/servers/connector/handler/entryHandler')
const gameHandler = require('../../game-server/app/servers/game/handler/gameHandler')
const gameRemote = require('../../game-server/app/servers/game/remote/gameRemote')
const SessionService = require('pomelo/lib/common/service/sessionService')
const ChannelService = require('pomelo/lib/common/service/channelService')
const mockBase = process.cwd() + '/test'

/**
  * 测试设置
  */
const WAIT_TIME = 1000
const mockRPC = require('../mockRPC')
global.MOCHA_TESTING = true

describe('Room System', function() {
  afterEach(function() {
    app.state = 0
    app.settings = {}
  })

  describe('# Room system test', function() {
    it('should join & leave correctly', function(done) {
      app.init({base: mockBase})
      var sessionService = new SessionService(app)
      var channelService = new ChannelService(app)

      var sid = 1, uid = 1
      var sid2 = 2, uid2 = 2
      var frontendId = 'mock-frontend-id'
      var frontendId2 = 'mock-frontend-id2'
      var username = 'lyricz'
      var username2 = 'dage'

      app.set('sessionService', sessionService)
      app.set('channelService', channelService)
      var session = sessionService.create(sid, frontendId)
      var session2 = sessionService.create(sid2, frontendId2)
      var fsession = session.toFrontendSession()
      var fsession2 = session2.toFrontendSession()
      fsession.uid = username
      fsession2.uid = username2
      fsession.set('username', username)
      fsession2.set('username', username2)

      var gR = mockRPC(gameRemote, app)
      var eH = entryHandler(app, gR)

      /**
        * 流程模拟
        */
      eH.login('', fsession, function(err, info) {
        info.code.should.equal(401)
      })

      eH.login({username: 'lyricz'}, fsession, function (err, info) {
        if (err) console.log(err)
        info.code.should.equal(200)

        eH.login({username: 'dage'}, fsession2, function (err, info) {
          if (err) console.log(err)
          info.code.should.equal(200)

          eH.join({}, fsession, function(err, info) {
            info.code.should.equal(400)
          })
          eH.join({username: 'lyricz', lobby_id: 100}, fsession, function(err, info) {
            info.code.should.equal(400)
          })
          eH.queryLobby('', fsession, function (err, info) {
            info.code.should.equal(400)
          })
          eH.leaveLobby('', fsession, function(err, info) {
            if (err) console.log(err)
            info.code.should.equal(400)
          })

          eH.createLobby('', fsession, function (err, info) {
            let lobby_id = info.lobby_id

            eH.join({username: 'lyricz', lobby_id: lobby_id}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(409)
            })

            /* NOTE: the first parameter can not be ignored */
            eH.queryHall('', fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })
            eH.queryLobby('', fsession, function (err, info) {
              info.code.should.equal(200)
            })

            eH.changeLobbySettings('', fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.changeLobbySettings({lobby_password: 'longlonglonglonglongpassword', max_player: 2}, fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.changeLobbySettings({lobby_password: 'goodbug', max_player: 10000}, fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.changeLobbySettings({lobby_password: 'goodbug', max_player: 3}, fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })

            eH.movePosition('', fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.movePosition({target: 128}, fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })

            eH.movePosition({target: 0}, fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })

            eH.kickPlayer('', fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.kickPlayer({target: 0}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.ready({}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.ready({status: 'none'}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(400)
            })

            eH.ready({status: 'ready'}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })

            eH.ready({status: 'not_ready'}, fsession, function(err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)
            })

            eH.join({username: 'dage', lobby_id: lobby_id}, fsession2, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(403)
            })

            /**
              * 模拟另一个玩家
              */
            eH.join({username: 'dage', lobby_id: lobby_id, lobby_password: 'goodbug'}, fsession2, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)

              eH.kickPlayer({target: 0}, fsession2, function (err, info) {
                if (err) console.log(err)
                info.code.should.equal(403)
              })

              eH.leaveLobby('', fsession, function(err, info) {
                if (err) console.log(err)
                info.code.should.equal(200)
              })
              eH.mochaRemove(fsession)
              done()
            })
          })
        })
      })
    })
  })
})
