var config = require("./config.js");
var events = require("events");

const mlog = require('../../../../../../web-server/server/controller/mlog')

class Obj {
  constructor(world, width, height, type) {

    // 空间信息
    this.width = width;
    this.height = height;
    this.m = 1;
    this.vx = 0;
    this.vy = 0;
    this.x = 0;
    this.y = 0;
    this.ax = 0;
    this.ay = 0;
    this.dir = 'right'; // 目前朝向
    this.roomId = 0;

    // 游戏信息
    this.hp = world.bloodMax;

    /*
      Transforming indicates whether the object is transmitting to other rooms.
      When it's transmitting, it's move action will stop.
    */
    // this.transmitTimeRemain = 0;

    /*when is 1, begin transmitting. After send, this will be set to 0. When is -1, end transmitting, after send, set to 0*/
    this.statusFlags = {};
    this.statusFlags.transmitFlag = false;
    /*this is necessary because even if transmitTimeRemain === 0,
    frontend is likely to load very slow. So when the front onload, this flag wiil be set to false*/
    // this.transmitting = false;

    /*
      type indicates whether this object is a static object which will not be simulated
    */
    this.type = "";

    /* when moving left(right) key pressed, this will be set to true. Only when the key is up, this is set to false*/
    this.moveLeft = false;
    this.moveRight = false;

    this.world = world;
    this.userData = {};
    this.sleep = false;
    this.exist = true;
    this.image = "";
    this.timmer = {};
    this.timmer.transmitTimeRemain = 0;
    this.timmer.freezeTimeRemain = 0;
    this.timmer.dizzyTimeRemain = 0;
    this.timmer.prepareTimeRemain = 0;
  }

  solveContact() {
    let room = this.world.rooms[this.roomId];
    let objList = [];
    for (let i = 0; i < room.walls.length; i++) {
      let obj = room.walls[i];
      if (this.x < obj.x) {
        if (this.vx > 0 &&
            obj.x - this.x <= this.width &&
            obj.y - this.y - this.height < -2 &&
            this.y - obj.y - obj.height < -2)
        {
          this.vx = 0;
          objList.push(obj);
        }
      }
      else {
        if (this.vx < 0 &&
            this.x - obj.x <= obj.width &&
            obj.y - this.y - this.height < -2 &&
            this.y - obj.y - obj.height < -2)
        {
          this.vx = 0;
          objList.push(obj);
        }
      }
      if (this.y < obj.y) {
        if (this.vy > 0 &&
            obj.y - this.y <= this.height &&
            this.x - obj.x - obj.width < -2 &&
            obj.x - this.x - this.width < -2)
        {
          this.vy = 0;
          objList.push(obj);
        }
      }
      else {
        if (this.vy < 0 &&
            this.y - obj.y <= obj.height &&
            this.x - obj.x - obj.width < -2 &&
            obj.x - this.x - this.width < -2)
        {
          this.vy = 0;
          objList.push(obj);
        }
      }
    }
    return objList;
  }

  solveDoorAction() {
    let room = this.world.rooms[this.roomId];
    for (let i = 0; i < room.doors.length; i++) {
      if (room.doors[i].x - this.x < this.width &&
          this.x - room.doors[i].x < room.doors[i].width &&
          room.doors[i].y - this.y < this.height &&
          this.y - room.doors[i].y < room.doors[i].height)
      {
        let door = room.doors[i];
        let from = this.roomId, to = -1, dir = "";
        if (door.userData.left === this.roomId) {
          to = door.userData.right;
          dir = "right";
        }
        else if (door.userData.right === this.roomId) {
          to = door.userData.left;
          dir = "left";
        }
        else if (door.userData.up === this.roomId) {
          to = door.userData.down;
          dir = "down";
        }
        else if (door.userData.down === this.roomId) {
          to = door.userData.up;
          dir = "up";
        }
        else {
          mlog.err('object', 'solveDoorAction', 'Transmit error.')
          return undefined;
        }
        return {
            name: this.userData.name,
            from: from,
            to: to,
            dir: dir,
            doorId: door.userData.id,
        }
      }
    }
    return undefined;
  }

  solveAttack(attack) {
    let timmerName = "attack" + String(attack.type);
    if (this.timmer[timmerName] && this.timmer[timmerName] > 0) {
      return;
    }
    let maxPropertyName = this.getMaxProperty();
    if (this.userData.property[maxPropertyName] < attack.property) {
      return;
    }
    let room = this.world.rooms[this.roomId];
    this.userData.attack = attack.type;

    if (attack.property === 50) {
      //只有大招需要消耗属性值
      this.userData.property[maxPropertyName] -= attack.property;
    }

    let attackScore = 0;
    let attackX = 0, attackY = 0;
    if (attack.name !== 'all') {
      if (this.dir === 'right') {
        attackX = this.x;
        attackY = this.y;
      }
      if (this.dir === 'left') {
        attackX = this.x - attack.addWidth;
        attackY = this.y;
      }
    }
    let attackW = this.width + attack.addWidth;
    let attackH = this.height + attack.addHeight;
    for (let name in room.players) {
      if (name !== this.userData.name) {
        let other = room.players[name];
        if (other.x - attackX < attackW &&
            attackX - other.x < other.width &&
            other.y - attackY < attackH &&
            attackY - other.y < other.height)
        {
          other.userData.attacked = attack.type;
          let strength = attack.strength;
          other.loseHp(attack.strength);
          other.beDizzy(attack.dizzyTime);
          attackScore += strength;
        }
      }
    }
    this.timmer[timmerName] = attack.cdTime;
    this.userData.score += attackScore;
  }

  solveProps() {
    let room = this.world.rooms[this.roomId];
    for (let i = 0; i < room.props.length; i++) {
      if (room.props[i].exist) {
        if (global.MOCHA_TESTING || ((room.props[i].x - this.x < this.width)
         && (this.x - room.props[i].x < room.props[i].width)
         && (room.props[i].y - this.y < this.height)
         && (this.y - room.props[i].y < room.props[i].height)))
        {
          room.props[i].exist = false;
          switch(room.props[i].userData.name) {
            case "blood": {
              this.userData.hp += room.props[i].userData.value;
              if (this.userData.hp > this.world.bloodMax) {
                this.userData.hp = this.world.bloodMax;
              }
              break;
            }
            case "WA":
            case "TLE":
            case "RE":
            {
              this.userData.property[room.props[i].userData.name] += room.props[i].userData.value;
              if (this.userData.property[room.props[i].userData.name] > config.propertyMax) {
                this.userData.property[room.props[i].userData.name] = config.propertyMax;
              }
              break;
            }
            default: {
              mlog.err('object', 'solveProps', 'No such prop name.')
            }
          }
        }
      }
    }
  }

  solvePreparingAction() {
    let proper = this.userData.preparingAction.property;
    switch (this.userData.preparingAction.type) {
      case "attack": {
        this.solveAttack(proper);
        break;
      }
      case "prop": {
        this.solveProps();
        break;
      }
      case "transmit": {
        if (!global.MOCHA_TESTING) {
          this.world.event.emit("onTransmit", proper.name, proper.from, proper.to, proper.dir, proper.doorId);
        }

        this.timmer.transmitTimeRemain = config.transmitTime;
        this.statusFlags.transmitFlag = 1;
        break;
      }
      default: {
        break;
      }
    }
    this.userData.preparingAction.type = "";
    this.userData.preparingAction.property = {};
  }

  solveTimmer() {
    for (let name in this.timmer) {
      if (this.timmer[name] > 0) {
        this.timmer[name]--;
      }
    }
  }

  move(time) {
    if (this.type === "static" ) return;
    if (this.timmer.transmitTimeRemain <= 0
      && this.timmer.freezeTimeRemain <= 0
      && this.timmer.prepareTimeRemain <= 0)
    {
      if (this.timmer.dizzyTimeRemain > 0) {
        this.vx = 0;
      }
      this.vx += this.ax * time;
      this.vy += this.ay * time;
      this.solveContact();
      // this.solveProps();
      if (this.vx > 0) this.dir = 'right';
      else if (this.vx < 0) this.dir = 'left';
      this.x += this.vx * time;
      this.y += this.vy * time;

      // this.solveDoorAction();
      this.solveTimmer();
      this.solvePreparingAction();
    }
    else {
      this.setVelocity(0, 0);
      if (this.timmer.transmitTimeRemain > 0 || this.timmer.prepareTimeRemain > 0) {
        this.solveTimmer();
        if (this.timmer.transmitTimeRemain <= 0) {
          /* transmit end */
          this.statusFlags.transmitFlag = -1;
        }
      }
      else {
        this.solveTimmer();
      }
    }
  }

  canMove() {
    return this.timmer.dizzyTimeRemain <= 0 && this.timmer.prepareTimeRemain <= 0;
  }

  beFreeze(time) {
    this.timmer.freezeTimeRemain = time;
    this.userData.freeze = 1;
  }

  beDizzy(time) {
    this.timmer.dizzyTimeRemain = time;
    this.userData.dizzy = 1;
  }

  propOrTransmit() {
    let temp = this.solveDoorAction();
    if (temp) {
      this.bePreparing(config.transmitPrepareTime, "transmit", temp);
    }
    else {
      this.bePreparing(config.propPrepareTime, "prop", {});
    }
  }

  bePreparing(time, type, property) {
    /*
    type: attack, prop, transmit
    */
    this.timmer.prepareTimeRemain = time;
    this.userData.prepare = 1;
    this.userData.preparingAction.type = type;
    this.userData.preparingAction.property = property;
  }

  stopPreparing() {
    this.timmer.prepareTimeRemain = 0;
    this.userData.prepare = 0;
    this.userData.preparingAction.type = "";
    this.userData.preparingAction.property = {};
  }

  loseHp(strength) {
    if (this.userData.hp >= 0) {
      this.userData.hp -= strength;
    }
  }

  setImage(imagePath) {
    this.image = imagePath
  }

  setMoveRight(flag) {
    this.moveRight = flag;
  }

  setMoveLeft(flag) {
    this.moveLeft = flag;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  setAccelerate(ax, ay) {
    this.ax = ax;
    this.ay = ay;
  }

  setUserData(userData) {
    this.userData = userData;
  }

  getUserData() {
    return this.userData;
  }

  getMaxProperty() {
    let max = "WA";
    if (this.userData.property["WA"] < this.userData.property["TLE"]) {
      max = "TLE";
    }
    if (this.userData.property[max] < this.userData.property["RE"]) {
      max = "RE";
    }
    return max;
  }
}

module.exports.Obj = Obj;
