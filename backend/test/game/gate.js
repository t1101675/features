/**
  * Gate Server测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')

/**
  * Pomelo设置
  */
const app = require('pomelo/lib/application')
const gateHandler = require('../../game-server/app/servers/gate/handler/gateHandler')
const mockBase = process.cwd() + '/test'

describe('Gate Handler', function() {
  afterEach(function() {
    app.state = 0
    app.settings = {}
  })

  describe('# QueryEntry test', function() {
    it('should get the connector information', function(done) {
      app.init({base: mockBase})
      var newServers = [
        {id: 'connector-server-1', serverType: 'connector', host: '127.0.0.1', port: 1234, clientPort: 3000, frontend: true}
      ]
      app.addServers(newServers)
      var gH = gateHandler(app)
      gH.queryEntry('', '', function(err, info) {
        info.code.should.equal(200)
        info.host.should.equal('127.0.0.1')
        info.port.should.equal('3010')
      })
      done()
    })
  })
})
