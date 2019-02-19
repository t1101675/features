const config = require("./config.js");
const Obj = require("./object.js").Obj;
const Room = require("./room.js").Room;
const EventEmitter = require("events").EventEmitter;
const AI = require("../ai.js").AI;
const mlog = require('../../../../../../web-server/server/controller/mlog');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

class World {
  constructor(roomColumn = config.roomColumn, roomRow = config.roomRow, hasAi = false) {
    this.roomColumn = roomColumn;
    this.roomRow = roomRow;
    this.setBasic();
    this.setDoors();
    if (hasAi) {
      this.setAi();
    }
  }

  /* init function called by constructors*/
  setBasic() {
    this.totalTime = 0;
    this.g = config.g;
    this.timeInterval = config.timeInterval;
    this.roomWidth = config.roomWidth;
    this.roomHeight = config.roomHeight;
    this.background = config.background;
    this.rooms = new Array(this.roomColumn * this.roomRow);
    for (let i = 0; i < this.rooms.length; i++) {
      this.rooms[i] = new Room(i);
    }
    this.players = {};

    /* doors between rooms
      [0, m(n - 1)): vertival
      [m(n - 1), m(n - 1) + (m - 1)n): horizontal
    */
    this.doors = [];

    this.event = new EventEmitter();
    this.event.on("onTransmit", this.changeRoom.bind(this));
    this.bloodMax = config.bloodMax;
    this.transmitTime = config.transmitTime;
    if (global.MOCHA_AI_AMOUNT)
      this.aiAmount = global.MOCHA_AI_AMOUNT;
    else
      this.aiAmount = config.aiAmount;
    this.timmer = {};
    this.timmer.roomTimmer = config.roomCrashInterval;

  }

  setDoors() {
    for (let i = 0; i < this.roomColumn * (this.roomRow - 1); i++) {
      let m = parseInt(i / (this.roomRow - 1)); // the column that the door at
      let doorId = i;
      this.doors[doorId] = new Obj(this, config.doorHeight, config.doorLength, "static");
      this.doors[doorId].setUserData({
        id: doorId, //door's doorId
        left: i + m, //left room number
        right: i + m + 1, //right room number
        a: config.doorA, //indicate where the door is. a * roomHeight is the y of the door
      });
      this.doors[doorId].setImage(config.doorImage);
      this.rooms[this.doors[doorId].userData.left].addDoor(this.doors[doorId], "right");
      this.rooms[this.doors[doorId].userData.right].addDoor(this.doors[doorId], "left");
    }
    for (let i = 0; i < (this.roomColumn - 1) * this.roomRow; i++) {
      let doorId = i + this.roomColumn * (this.roomRow - 1);
      this.doors[doorId] = new Obj(this, config.doorLength, config.doorHeight, "static");
      this.doors[doorId].setUserData({
        id: doorId,
        up: i,
        down: i + this.roomRow,
        a: config.doorA,
      });
      this.doors[doorId].setImage(config.doorImage);
      this.rooms[this.doors[doorId].userData.up].addDoor(this.doors[doorId], "down");
      this.rooms[this.doors[doorId].userData.down].addDoor(this.doors[doorId], "up");
    }
  }

  /*called by gameHandler*/
  /* Here the log is hardcoded, I sugguest there should be a log system (web-server/server/controller/mlog.js) */
  setPlayers(playersInfo) {
    for (let i = 0; i < playersInfo.length; i++) {
      let player = new Obj(this, config.heroWidth, config.heroHeight);
      player.setPos(150, 150);
      if (playersInfo.length > 1) {	
      	player.roomId = getRandomInt(this.roomColumn * this.roomRow);
      }
      player.setAccelerate(0, this.g);
      player.setUserData({
        id: Object.keys(this.players).length,
        name: playersInfo[i].uid,
        ready: false,
        hp: config.bloodMax,
        ai: false,
        head: "https://featuresgame.tk:8001/api/get_profile?username=" + playersInfo[i].uid,
        newPropSend: true, //whether send newProps info to this player
        score: 0,
        getProps: -1,
        attack: -1, //-1: nothing, >=0: index of attacks, cleared when send once
        attacked: -1, //-1: nothing, >=0: index of attacks, cleared when send once
        freeze: -1, //-1: nothing, 1: begin, cleared when send once
        dizzy: -1, //-1: nothing, 1: begin, cleared when send once
        prepare: -1, //-1: nothing, 1: begin. 0: interupt, cleared when send once
        preparingAction: {
          type: "",
          property: { },
        },
        property: {
          WA: 0,
          TLE: 0,
          RE: 0,
        },
      });
      player.setImage("https://featuresgame.tk:8001/api/get_hero?username=" + playersInfo[i].uid + "&slot=" + playersInfo[i].slot);
      this.players[playersInfo[i].uid] = player;
      this.rooms[player.roomId].addPlayer(player);
    }
  }

  setAi() {
    this.ai = new AI(this, this.aiAmount);
    for (let name in this.ai.AIs) {
      let player = this.players[name];
      this.rooms[player.roomId].addPlayer(player);
    }
  }

  setPlayerState(name, ready) {
    this.players[name].getUserData().ready = ready;
  }

  removeLoser() {
    for (let name in this.players) {
      if (this.players[name].userData.hp <= 0) {
        this.players[name].exist = false;
        this.rooms[this.players[name].roomId].generateDeathProp(name);
      }
    }
  }

  updateUserLeave(names) {
    for (let name in this.players) {
      if (this.players[name].exist && !names.includes(name) && !this.players[name].userData.ai) {
        this.players[name].loseHp(this.bloodMax + 1);
        this.setPlayerState(name, true);
      }
    }
  }

  clearTransmitFlag(name) {
    this.players[name].statusFlags.transmitFlag = 0;
  }

  clearAttackPropsFlag() {
    for (let name in this.players) {
      this.players[name].userData.attack = -1;
      this.players[name].userData.attacked = -1;
      this.players[name].userData.getProps = -1;
    }
  }

  /* get init info functions*/
  getInitGameInfo(name) {
    return {
      player: {
        id: this.players[name].userData.id,
        total: Object.keys(this.players).length,
      },
      playerConfig: this.getInitPlayersInfo(),
      scene: this.getInitSceneInfo(),
      roomConfig: this.getInitRoomInfo(name),
    }
  }

  getInitRoomInfo(name) {
    return this.rooms[this.players[name].roomId].getInitRoomInfo();
  }

  getInitSceneInfo() {
    return {
      roomRow: this.roomColumn,
      roomColumn: this.roomRow, //there's a mistake here, the definition of roomColumn and roomRow is different
      width: this.roomWidth,
      height: this.roomHeight,
      image: this.background,
      transTime: this.transmitTime,
    };
  }

  getInitPlayersInfo() {
    let playersInfo = [];
    for (let name in this.players) {
      let player = this.players[name];
      playersInfo.push({
        id: player.userData.id,
        width: player.width,
        height: player.height,
        image: player.image,
        head: config.headImage,
        name: name,
        blood: this.bloodMax,
      });
    }
    return playersInfo;
  }

  /*get tick info functions*/
  getGameInfo(name) {
    let data = this.rooms[this.players[name].roomId].getGameInfo(name);
    data["scores"] = this.getScores();
    data["timestemp"] = this.totalTime;
    data["rooms"] = this.getRoomStatus();
    return data;
  }

  getRoomStatus() {
    let roomStatus = [];
    for (let i = 0; i < this.rooms.length; i++) {
      let s = 0;
      if (this.rooms[i].players.length > 3) {
        s = 1;
      }
      if (this.rooms[i].getMaxPropValue() > 30) {
        s = 2;
      }
      if (this.rooms[i].crashedTime >= 0) {
        s = 3;
      }
      roomStatus.push(s);
    }
    return roomStatus;
  }

  getWinner() {
    let num = 0;
    let winner = "";
    for (let name in this.players) {
      if (this.players[name].exist && this.players[name].userData.ready) {
        winner = name;
        num++;
      }
    }
    if (num == 1) {
      return winner;
    }
    else {
      return undefined;
    }
  }

  getLoser() {
    const loserList = [];
    for (let name in this.players) {
      if (this.players[name].userData.hp <= 0 && this.players[name].exist) {
        loserList.push(name);
      }
    }
    return loserList;
  }

  getScores() {
    let scores = [];
    for (let name in this.players) {
      scores.push(this.players[name].userData.score);
    }
    return scores;
  }

  getPlayerScore(name) {
    return {
      score: this.players[name].userData.score
    }
  }

  getTransmitState(name) {
    return this.players[name].statusFlags.transmitFlag;
  }

  getRankList() {
    let rankList = [];
    for (let name in this.players) {
      rankList.push({
        name: name,
        score: this.players[name].userData.score,
      });
    }
    rankList.sort((a, b) => { return b.score - a.score; });
    return rankList;
  }

  /* check if the player's front has complete loading*/
  isReady() {
    for (let name in this.players) {
      if (this.players[name].exist && !this.players[name].userData.ready) {
        return false;
      }
    }
    return true;
  }

  /* check if the player is lose*/
  isLose(name) {
    return this.players[name].userData.hp <= 0;
  }

  /* check if the game is end, e.g. there is only one player*/
  isEnd() {
    let remainNum  = 0;
    for (let name in this.players) {
      if (this.players[name].exist) {
        remainNum++;
      }
    }
    if (remainNum <= 1) {
      mlog.info('world', 'isEnd', 'Game ends.')
      return true;
    }
    else {
      return false;
    }
  }

  /* solve keys functions*/
  solveKeys(name, keys) {
    for (let keyName in keys) {
      switch (keyName) {
        case "keyLeft": {
          if (this.players[name].canMove()) {
            if (keys[keyName] == "down") {
              this.players[name].setVelocity(config.leftV, this.players[name].vy);
              this.players[name].setMoveLeft(true);
            }
            else if (keys[keyName] == "up") {
              this.players[name].setMoveLeft(false);
              if (this.players[name].moveRight) {
                this.players[name].setVelocity(config.rightV, this.players[name].vy);
              }
              else {
                this.players[name].setVelocity(0, this.players[name].vy);
              }
            }
          }
          break;
        }
        case "keyUp": {
          if (this.players[name].canMove()) {
            if (keys[keyName] == "down") {
              this.players[name].setVelocity(this.players[name].vx, config.upV);
            }
          }
          break;
        }
        case "keyRight": {
          if (this.players[name].canMove()) {
            if (keys[keyName] == "down") {
              this.players[name].setVelocity(config.rightV, this.players[name].vy);
              this.players[name].setMoveRight(true);
            }
            else if (keys[keyName] == "up") {
              this.players[name].setMoveRight(false);
              if (this.players[name].moveLeft) {
                this.players[name].setVelocity(config.leftV, this.players[name].vy);
              }
              else {
                this.players[name].setVelocity(0, this.players[name].vy);
              }
            }
          }
          break;
        }
        case "keyDown": {
          if (this.players[name].canMove()) {
            if (keys[keyName] == "down") {
              this.players[name].setVelocity(this.players[name].vx, config.downV);
            }
          }
          break;
        }
        case "keyF": {
          if (this.players[name].canMove() && keys[keyName] == "down") {
            this.players[name].bePreparing(config.attacks[0].prepareTime, "attack", config.attacks[0]);
          }
          break;
        }
        case "keyD": {
          if (this.players[name].canMove() && keys[keyName] == "down") {
            this.players[name].bePreparing(config.attacks[1].prepareTime, "attack", config.attacks[1]);
          }
          break;
        }
        case "keyV": {
          if (this.players[name].canMove() && keys[keyName] == "down") {
            this.players[name].bePreparing(config.attacks[2].prepareTime, "attack", config.attacks[2]);
          }
          break;
        }
        case "keyC": {
          if (this.players[name].canMove() && keys[keyName] == "down") {
            this.players[name].bePreparing(config.attacks[3].prepareTime, "attack", config.attacks[3]);
          }
          break;
        }
        case "keyX": {
          if (this.players[name].canMove() && keys[keyName] == "down") {
            this.players[name].bePreparing(config.attacks[4].prepareTime, "attack", config.attacks[4]);
          }
          break;
        }
        case "keyR": {
          if (keys[keyName] === "down") {
            this.players[name].propOrTransmit();
          }
          else {
            // up
            this.players[name].stopPreparing();
          }
          break;
        }
      }
    }
   }

   /* comunication between rooms functions*/
  changeRoom(name, from, to, dir, doorId) {
    let door = this.doors[doorId];
    this.rooms[from].leaveRoom(this.players[name], dir, door);
    this.rooms[to].enterRoom(this.players[name], dir, door);
  }

  crashRoom() {
    let r = getRandomInt(this.rooms.length);
    this.rooms[r].crash();
    this.timmer["roomTimmer"] = config.roomCrashInterval;
  }

  solveTimmer() {
    for (let name in this.timmer) {
      if (this.timmer[name] > 0) {
        this.timmer[name]--;
      }
    }
  }

  /* game process control functions*/
  tick() {
    let keysList = [];
    if (this.ai) {
      keysList = this.ai.step();
      if (keysList !== null) {
        for (let j = 0; j < this.aiAmount; j++) {
          let username = "ai" + String(j);
          if (keysList[j]) {
            for (let i in keysList[j]) {
              let v = {};
              v[keysList[j][i]] = "down";
              this.solveKeys(username, v);
            }
          }
        }
      }
    }

    for (let i = 0; i < this.rooms.length; i++) {
      this.rooms[i].tick(this.timeInterval);
    }

    if (this.ai) {
      if (keysList !== null) {
        for (let j = 0; j < this.aiAmount; j++) {
          let username = "ai" + String(j);
          if (keysList[j]) {
            for (let i in keysList[j]) {
              let v = {};
              v[keysList[j][i]] = "up";
              this.solveKeys(username, v);
            }
          }
        }
      }
    }

    this.solveTimmer();
    if (this.timmer["roomTimmer"] <= 0) {
      this.crashRoom();
    }
    this.totalTime += this.timeInterval;
  }

  run() {
    /*run is only controled by game handler*/
    this.timer = setInterval(this.tick.bind(this), this.timeInterval);
  }

  end() {
    /*end is only controled by game handler*/
    mlog.info('world', 'end', 'World ends.')
    clearInterval(this.timer);
  }

}

module.exports.World = World;
