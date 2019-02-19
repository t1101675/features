/**
  * AI系统测试文件
  */
const AI = require('../../game-server/app/servers/game/handler/ai').AI
const PE = require('../../game-server/app/servers/game/handler/objectClasses/world').World

/**
  * 测试设置
  */
const TEST_NUMS = 100000
const AI_AMOUNT = 30

global.MOCHA_AI_AMOUNT = AI_AMOUNT

describe('AI System Test', function() {
  it('should end the game normally', function() {
    let pe = new PE(2, 2, true)

    pe.run()
    for(let i = 0; i < TEST_NUMS; ++ i)
      pe.tick()

    pe.end()
  })
})
