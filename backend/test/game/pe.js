/**
  * 物理引擎测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')


const PE = require('../../game-server/app/servers/game/handler/objectClasses/world').World

/**
  * 测试设置
  */
const TEST_NUMS = 40000
const T_INTERVAL = 4
global.MOCHA_TESTING = true

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

describe('Physical Engine Test', function() {
  it('should run normally', function(done) {
    global.MOCHA_AI_AMOUNT = 2
    let pe = new PE(2, 2, true)
    let players = [{uid: 'lyricz', roomId: 1}, {uid: 'liuchang', roomId: 1}, {uid: 'dage', roomId: 1}, {uid: 'gushen', roomId: 1}]
    let actions = ['keyLeft', 'keyUp', 'keyRight', 'keyDown', 'keyF', 'keyD', 'keyV', 'keyC', 'keyX', 'keyR']
    let udr = ['up', 'down']
    pe.setPlayers(players)

    for (let i = 0; i < 4; ++ i) {
      pe.setPlayerState(players[i].uid, true)
    }
    pe.isReady().should.equal(true)

    pe.run()

    /**
      * Object系统测试
      */
    let t_obj = pe.players['lyricz']

    t_obj.move(1)
    t_obj.solveContact()
    t_obj.solveDoorAction()
    t_obj.solveAttack({
      type: 0,
      addWidth: 10,
      strength: 10
    })
    t_obj.solveProps()
    t_obj.solvePreparingAction()
    t_obj.solveTimmer()
    t_obj.move(1)
    t_obj.loseHp(10)
    t_obj.setImage('none')
    t_obj.setMoveRight(true)
    t_obj.setMoveLeft(true)
    t_obj.setPos(0, 0)
    t_obj.setVelocity(0, 0)
    t_obj.setAccelerate(0, 0)
    t_obj.getUserData()
    t_obj.transmitTimeRemain = 1
    t_obj.move(1)
    t_obj.canMove()
    t_obj.beFreeze()
    t_obj.beDizzy()
    t_obj.bePreparing()
    t_obj.stopPreparing()

    t_obj.bePreparing(2, 'attack', {})
    t_obj.solvePreparingAction()
    t_obj.move(1)
    t_obj.stopPreparing()

    t_obj.bePreparing(2, 'prop', {})
    t_obj.solvePreparingAction()
    t_obj.move(1)
    t_obj.stopPreparing()

    t_obj.bePreparing(2, 'transmit', {})
    t_obj.solvePreparingAction()
    t_obj.move(1)
    t_obj.stopPreparing()

    pe.isReady()
    pe.clearTransmitFlag('lyricz')
    pe.getInitGameInfo('lyricz')
    pe.getInitRoomInfo('lyricz')
    pe.getInitSceneInfo()
    pe.getInitPlayersInfo()
    pe.getGameInfo('lyricz')
    pe.getRoomStatus()

    let room = t_obj.world.rooms[t_obj.roomId]
    room.setRandProps()

    /**
      * 随机动作模拟
      */
    for (let i = 0; i < TEST_NUMS / T_INTERVAL; ++ i) {
      let keys = {}
      let player = getRandomInt(4)
      for(let j = 0; j < T_INTERVAL; ++ j)
        keys[actions[getRandomInt(10)]] = udr[getRandomInt(2)]
      pe.solveKeys(players[player].uid, keys)
      pe.tick()
      pe.clearAttackPropsFlag()
      pe.clearAttackPropsFlag()
      pe.removeLoser()
      pe.updateUserLeave(['lyricz'])

      t_obj.move(1)
      t_obj.solveProps()
    }

    pe.isLose('lyricz')
    pe.isEnd()
    pe.getWinner()
    pe.getLoser()
    pe.clearTransmitFlag('lyricz')
    pe.getTransmitState('lyricz')
    pe.getPlayerScore('lyricz')
    pe.getScores()

    t_obj.move(1)
    t_obj.setUserData(1)
    t_obj.getUserData().should.equal(1)

    pe.end()
    done()
  })
})
