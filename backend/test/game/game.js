/**
  * Game主流程测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')

/**
  * Pomelo组件
  */
const app = require('pomelo/lib/application')
const entryHandler = require('../../game-server/app/servers/connector/handler/entryHandler')
const gameHandler = require('../../game-server/app/servers/game/handler/gameHandler')
const gameRemote = require('../../game-server/app/servers/game/remote/gameRemote')
const SessionService = require('pomelo/lib/common/service/sessionService')
const ChannelService = require('pomelo/lib/common/service/channelService')
const backendSessionService = require('pomelo/lib/common/service/backendSessionService')

/**
  * 测试设置
  */
const WAIT_TIME = 1000
const mockBase = process.cwd() + '/test'
const mockRPC = require('../mockRPC')
global.MOCHA_TESTING = true

describe('Game Handler', function() {
  afterEach(function() {
    app.state = 0
    app.settings = {}
  })

  describe('# gameHandler test', function() {
    it('should run normal', function(done) {
      app.init({base: mockBase})
      app.rpcInvoke = function() {}
      app.components.__connector__ = {
        send: function(reqId, route, msg, recvs, opts, cb) {
          app.components.__pushScheduler__.schedule(reqId, route, msg, recvs, opts, cb)
        }
      }
      app.components.__connector__.connector = {}
      app.components.__pushScheduler__ = {
        schedule: function(reqId, route, msg, recvs, opts, cb) {
          var sess
          for(var i=0; i<recvs.length; i++) {
            sess = sessionService.get(recvs[i])
          }
          cb()
        }
      }

      /**
        * Session、Channel、BackendSession设置
        */
      var sessionService = new SessionService(app)
      var channelService = new ChannelService(app)
      var sid = 1, uid = 1 /* Sessions & Users */
      var sid1 = 2, uid1 = 2
      var frontendId = 'mock-frontend-id'
      var frontendId1 = 'mock-frontend-id-1'
      var username = 'lyricz'
      var username1 = 'lyricz1'
      app.set('sessionService', sessionService)
      app.set('channelService', channelService)
      var session = sessionService.create(sid, frontendId)
      var session1 = sessionService.create(sid1, frontendId1)
      var fsession = session.toFrontendSession()
      var fsession1 = session1.toFrontendSession()
      fsession.uid = username
      fsession1.uid = username1
      fsession.set('username', username)
      fsession1.set('username', username1)

      var service = new backendSessionService(app);
      service.name = '__backendSession__';
      app.set('backendSessionService', service, true);
      app.set('localSessionService', service, true);

      var newServers = [
        {id: 'connector-server-1', serverType: 'connector', host: '127.0.0.1', port: 1234, clientPort: 3000, frontend: true}
      ]
      app.addServers(newServers)

      var gR = mockRPC(gameRemote, app)
      var eH = entryHandler(app, gR)
      var gH = gameHandler(app, gR)

      /**
        * 登录流程
        */
      eH.login({username: 'lyricz1'}, fsession1, function (err, info) {

        if (err) console.log(err)
        info.code.should.equal(200)

        eH.login({username: 'lyricz'}, fsession, function (err, info) {

          if (err) console.log(err)
          info.code.should.equal(200)

          eH.createLobby('', fsession, function (err, info) {
            if (err) console.log(err)
            info.code.should.equal(200)

            eH.queryHall('', fsession, function (err, info) {
              if (err) console.log(err)
              info.code.should.equal(200)

              let hall_status = info.hall_status
              var room = hall_status[0]
              room.password.should.equal(false)
              room.in_game.should.equal(false)

              let online_players = info.online_players
              online_players.should.equal(2)

              eH.join({lobby_id: room.lobby_id}, fsession1, function (err, info) {
                if (err) console.log(err)
                info.code.should.equal(200)

                eH.leaveLobby({}, fsession1, function (err, info) {
                  if (err) console.log(err)
                  info.code.should.equal(200)

                  eH.join({lobby_id: room.lobby_id}, fsession1, function (err, info) {
                    if (err) console.log(err)
                    info.code.should.equal(200)

                    eH.ready({status: 'not_ready'}, fsession1, function (err, info) {
                      if (err) console.log(err)
                      info.code.should.equal(200)
                    })

                    eH.ready({status: 'ready'}, fsession1, function (err, info) {
                      if (err) console.log(err)
                      info.code.should.equal(200)
                    })

                    /**
                      * 游戏开始
                      */
                    gH.requestGameStart({slot: 0}, fsession, function (err, info) {
                      if (err) console.log(err)
                      info.code.should.equal(200)

                      let msg = {
                        type: 'NONE',
                        name: 'none'
                      }

                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(500)
                      })

                      msg = {
                        type: 'GET',
                        name: 'none'
                      }
                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(500)
                      })

                      msg = {
                        type: 'POST',
                        name: 'none'
                      }

                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(500)
                      })

                      msg = {
                        type: 'GET',
                        name: 'gameConfig'
                      }
                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(200)
                        info.type.should.equal('RETURN')
                      })

                      msg = {
                        type: 'GET',
                        name: 'sdk'
                      }
                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(200)
                      })

                      msg = {
                        type: 'POST',
                        name: 'clientReady'
                      }
                      gH.startConfig(msg, fsession, function (err, info) {
                        info.code.should.equal(200)
                      })

                      gH.key({type: 'POST', name: 'none'}, fsession, function (err, info) {
                        info.code.should.equal(400)
                      })

                      msg = { name: 'keyInfo', data: { 'keyLeft': 'down' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyLeft': 'up' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyRight': 'down' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyRight': 'up' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyUp': 'down' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyUp': 'up' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyDown': 'down' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyDown': 'up' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })
                      msg = { name: 'keyInfo', data: { 'keyA': 'down' } }; gH.key(msg, fsession, function (err, info) { info.code.should.equal(200) })


                      /**
                        * 结束游戏
                        */
                      gH._send(app, room.lobby_id)
                    })
                  })
                })
              })

              eH.logout('', fsession, function() {
                if (err) console.log(err)
                info.code.should.equal(200)

                done()
              })
            })
          })
        })
      })
    })
  })
})
