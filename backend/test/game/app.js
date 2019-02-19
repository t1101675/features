/**
  * Game App启动测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')

global.MOCHA_TESTING = true

describe('App creator', function() {
  describe('# App entry test', function() {
    it('should create an app', function(done) {
      var app = require('../../game-server/app')
      done()
    })
  })
})
