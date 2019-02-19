const Obj = require('./objectClasses/object').Obj;
const config = require('./objectClasses/config.js');
const mlog = require('../../../../../web-server/server/controller/mlog')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

class AI {
  constructor(world, amount) {
    this.initSetting(world, amount)
    this.createAIObj()
  }

  /* Init the settings */
  initSetting(world, amount) {
    this.world = world
    this.amount = amount
    this.gameEnd = false

    this.keysAmount = config.keysAmount /* The numbers of the actions created in a time interval */
    this.targetMax = config.targetMax/* The max tracing target steps */
    this.attackingRange = config.attackingRange
    this.xRange = config.xRange /* Disabled */
  }

  createAIObj() {
    this.AIs = {} /* ID */
    for (let i = 0; i < this.amount; ++ i) {
      let player = new Obj(this.world, config.heroWidth, config.heroHeight)
      let uname = 'ai' + String(i)
      player.setPos(config.wallHeight + getRandomInt(config.randomRange), config.wallHeight + getRandomInt(config.randomRange))
      player.setAccelerate(0, this.world.g);
      player.setUserData({
        id: Object.keys(this.world.players).length,
        name: uname,
        ready: true,
        hp: config.bloodMax,
        ai: true,
        props: {},
        score: 0,
        getProps: -1,
        attack: -1,
        attacked: -1,
        prepare: -1,
        freeze: -1,
        dizzy: -1,
        preparingAction: {
          type: "",
          property: {},
        },
        property: {
          WA: 0,
          TLE: 0,
          RE: 0,
        },
      });

      for (let name in config.props) {
        player.userData.props[name] = {
          num: 0,
          value: 0,//this value can represent many things
        };
      }
      this.AIs[uname] = {
        id: Object.keys(this.world.players).length,
        target: -1,
        targetStep: 0
      }
      player.roomId = 0;
      player.setImage(config.heroImage);
      this.world.players[uname] = player
    }
  }

  sqr(v) {
    return v * v
  }

  inAttackingRange(p1, p2) {
    return Math.sqrt(this.sqr(p1.x - p2.x) + this.sqr(p1.y - p2.y)) <= this.attackingRange
  }

  getDirection(ai, ta, runAway) {
    if(Math.abs(ai.x - ta.x) < this.xRange) {
      let results = ['keyUp', 'keyDown'], idx
      if (ai.y > ta.y) idx = 1
      else idx = 0
      if (runAway) idx = 1 - idx
      return results[idx]
    }

    let results = ['keyLeft', 'keyRight'], idx
    if (ai.x < ta.x) idx = 1
    else idx = 0
    if (runAway) idx = 1 - idx
    return results[idx]
  }

  stepOneAI(gID) {
    /* Whether alive */
    if(this.world.players[gID].userData.hp <= 0) return null

    /* Lock target */
    if(this.AIs[gID].target === -1 || this.AIs[gID].targetStep > this.targetMax) {
      let avas = []
      for(let i in this.world.players) {
        if(this.world.players[i].userData.hp <=0 || i === gID) continue
        avas.push(i)
      }

      let rID = getRandomInt(avas.length)
      this.AIs[gID].target = avas[rID]
      this.AIs[gID].targetStep = 0
      if (this.AIs[gID].target === undefined)
        mlog.err('ai', 'stepOneAI', 'Player amount error.')
    }

    /* Go and attack */
    let keySolutions = []
    this.AIs[gID].targetStep ++
    let target = this.AIs[gID].target

    if (this.inAttackingRange(this.world.players[target], this.world.players[gID])) {
      let rr = getRandomInt(5);
      switch (rr) {
        case 0: {
          keySolutions.push('keyF');
          break;
        }
        case 1: {
          keySolutions.push('keyD');
          break;
        }
        case 2: {
          keySolutions.push('keyC');
          break;
        }
        case 3: {
          keySolutions.push('keyV');
          break;
        }
        case 4: {
          keySolutions.push('keyX');
          break;
        }
      }
      let bDir = this.getDirection(this.world.players[gID], this.world.players[target], true)
      for(let i = 0; i < this.keysAmount - 2; ++ i) {
        keySolutions.push(bDir)
      }
    } else {
      let fDir = this.getDirection(this.world.players[gID], this.world.players[target], false)
      let moves = getRandomInt(2)

      for(let i = 0; i < moves; ++ i) {
        keySolutions.push(fDir)
      }
    }

    return keySolutions
  }

  /* This one means the end of the ai system (all die), but not human players */
  judgeEnd() {
    let ai_remaining = 0, players_all = 0
    for(let i in this.AIs) {
      if(this.world.players[i].userData.hp > 0) ai_remaining += 1
    }
    for(let i in this.world.players) {
      if(this.world.players[i].userData.hp > 0) players_all += 1
    }
    return (ai_remaining == 0) || (players_all <= 1)
  }

  /* During one interval */
  step() {
    if(this.gameEnd) return null
    let keys = []
    for(let i in this.AIs) {
      keys.push(this.stepOneAI(i))
    }
    this.gameEnd = this.judgeEnd()
    return keys
  }
}

module.exports.AI = AI
