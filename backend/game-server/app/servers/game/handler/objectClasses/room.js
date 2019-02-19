var Obj = require("./object.js").Obj;
var config = require("./config.js");
const mlog = require('../../../../../../web-server/server/controller/mlog')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function getRandomIntBetween(min, max) {
  return min + getRandomInt(max - min);
}

class Room {
  constructor(roomId, width = config.roomWidth, height = config.roomHeight) {
    this.height = height;
    this.width = width;
    this.roomId = roomId;

    this.setBasic();
    this.setRoomWalls();
    this.setRandWalls();
    this.setRandProps();
  }

  /*init functions called by constructor*/
  setBasic() {
    this.g = config.g;
    this.timeInterval = config.timeInterval;
    this.timmer = {};
    this.timmer.crashHurtTimmer = 0;
    this.players = {};
    this.walls = [];
    this.props = [];
    this.newPropBuffer = [];
    this.doors = [];
    this.newPropsOffset = 0;
    this.crashedTime = -1;
  }

  setRoomWalls() {
    this.celling = new Obj(this, config.roomWidth, config.wallHeight, "static");
    this.celling.setPos(0, 0);
    this.celling.setImage(config.wallImage);
    this.walls.push(this.celling);

    this.ground = new Obj(this, config.roomWidth, config.wallHeight, "static");
    this.ground.setPos(0, config.roomHeight);
    this.ground.setImage(config.wallImage);
    this.walls.push(this.ground);

    this.leftWall = new Obj(this, config.wallHeight, config.roomHeight, "static");
    this.leftWall.setPos(0, 0);
    this.leftWall.setImage(config.wallImage);
    this.walls.push(this.leftWall);

    this.rightWall = new Obj(this, config.wallHeight, config.roomHeight, "static");
    this.rightWall.setPos(config.roomWidth, 0);
    this.rightWall.setImage(config.wallImage);
    this.walls.push(this.rightWall);
  }

  setRandWalls() {
    let r = getRandomInt(config.centerWalls.length);
    let wallType = config.centerWalls[r];
    for (let i = 0; i < wallType.length; i++) {
      let newWall = undefined;
      if (wallType[i].dir === "h") {
        newWall = new Obj(this, wallType[i].length * config.gridLength, config.wallHeight, "static");
      }
      else {
        newWall = new Obj(this, config.wallHeight, wallType[i].length * config.gridLength, "static");
      }
      newWall.setPos(config.centerWallX + wallType[i].x * config.gridLength, config.centerWallY + wallType[i].y * config.gridLength);
      newWall.setImage(config.wallImage);
      this.walls.push(newWall);
    }
  }

  setRandProps() {
    for (let i = 0; i < config.props["property"].init.length; i++) {
      let r = getRandomInt(100);
      if (r < config.props["property"].init[i].birthP * 100) {
        let newProp = new Obj(this, config.props["property"].width, config.props["property"].height, "static");
        let rr = getRandomInt(3);
        let name = config.props["property"].names[rr];
        let posR = getRandomInt(4);
        let posType = config.propPos[posR];
        newProp.setPos(getRandomIntBetween(posType.xMin, posType.xMax), getRandomIntBetween(posType.yMin, posType.yMax));
        newProp.setImage(config.props["property"].images[rr]);
        newProp.setUserData({
          id: this.props.length,
          name: name,
          value: getRandomIntBetween(config.props["property"].init[i].valueMin, config.props["property"].init[i].valueMax),
        });
        this.props.push(newProp);
      }
    }
    this.timmer["propBlood"] = config.props["blood"].birthTime;
    this.timmer["propProperty"] = config.props["property"].birthTime;
  }

  /* called by world*/
  setRoom(width, height) {
    this.height = height;
    this.width = width;
  }

  addDoor(door, dir) {
    let tempDoor = new Obj(this, door.width, door.height, "static");
    tempDoor.setImage(door.image);
    tempDoor.setUserData(JSON.parse(JSON.stringify(door.userData))); //deep copy object door
    switch(dir) {
      case "left": {
        tempDoor.x = config.wallHeight;
        tempDoor.y = tempDoor.userData.a * this.height;
        break;
      }
      case "right": {
        tempDoor.x = this.width - config.doorHeight;
        tempDoor.y = tempDoor.userData.a * this.height;
        break;
      }
      case "up": {
        tempDoor.x = tempDoor.userData.a * this.width;
        tempDoor.y = config.wallHeight;
        break;
      }
      case "down": {
        tempDoor.x = tempDoor.userData.a * this.width;
        tempDoor.y = this.height - config.doorHeight;
        break;
      }
      default: {
        mlog.err('room', 'addDoor', 'No such name.');
        break;
      }
    }
    this.doors.push(tempDoor);
  }

  crashHurt(hurt) {
    for (let name in this.players) {
      if (this.players[name].exist) {
        this.players[name].userData.attacked = 0;
        this.players[name].loseHp(hurt);
      }
    }
  }

  crash() {
    this.crashedTime = 0;
  }

  addPlayer(player) {
    player.roomId = this.roomId;
    this.players[player.userData.name] = player;
  }

  removePlayer(name) {
    delete this.players[name];
  }

  enterRoom(player, dir, door) {
    let newX = 0, newY = 0;
    switch (dir) {
      case "left": {
        newX = this.width - 4 * config.doorHeight - player.width;
        newY = player.y;
        break;
      }
      case "right": {
        newX = 4 * config.doorHeight
        newY = player.y;
        break;
      }
      case "up": {
        newX = player.x;
        newY = this.height - 4 * config.doorHeight - player.height;
        break;
      }
      case "down": {
        newX = player.x;
        newY = 4 * config.doorHeight;
        break;
      }
    }
    player.setPos(newX, newY);
    player.setVelocity(0, 0);
    this.addPlayer(player);
  }

  leaveRoom(player, dir, door) {
    this.removePlayer(player.userData.name);
  }

  /* get init info functions */
  getInitRoomInfo() {
    return {
      roomId: this.roomId,
      scene: this.getInitSceneInfo(),
      doors: this.getInitDoorInfo(),
      walls: this.getInitWallsInfo(),
      props: this.getInitPropsInfo(),
    }
  }

  getInitDoorInfo() {
    let doorInfo = [];
    for (let i = 0; i < this.doors.length; i++) {
      doorInfo.push({
        x: this.doors[i].x,
        y: this.doors[i].y,
        width: this.doors[i].width,
        height: this.doors[i].height,
        image: this.doors[i].image,
      });
    }
    return doorInfo;
  }

  getInitSceneInfo() {
    return {
      width: this.width,
      height: this.height,
      image: config.background,
    }
  }

  getInitPropsInfo() {
    const propsInitInfo = [];
    for (let i = 0; i < this.props.length; i++) {
      propsInitInfo.push({
        id: this.props[i].userData.id,
        name: this.props[i].userData.name,
        image: this.props[i].image,
        x: this.props[i].x,
        y: this.props[i].y,
        width: this.props[i].width,
        height: this.props[i].height,
        value: this.props[i].userData.value,
      });
    }
    return propsInitInfo;
  }

  getInitWallsInfo() {
    const wallsInfo = [];
    for (let i = 0; i < this.walls.length; i++) {
      wallsInfo.push({
        x: this.walls[i].x,
        y: this.walls[i].y,
        width: this.walls[i].width,
        height: this.walls[i].height,
        image: this.walls[i].image,
      });
    }
    return wallsInfo;
  }

  /* get tick info functions*/
  getGameInfo(name) {
    let data = {
      newProps: [],
      props: this.getPropsInfo(),
      heroes: this.getHeroesInfo(),
    };
    if (!this.players[name].userData.newPropSend) {
      data.newProps = this.getNewPropsInfo();
      this.players[name].userData.newPropSend = true;
    }
    return data;
  }

  getHeroesInfo() {
    const playersInfo = [];
    for (let name in this.players) {
      let player = this.players[name];
      if (player.exist && !player.transmitting) {
        //only push those who is existed and not transmitting
        playersInfo.push({
          id: player.userData.id,
          x: player.x,
          y: player.y,
          vx: player.vx,
          vy: player.vy,
          name: name,
          hp: player.userData.hp,
          // getProps: player.userData.getProps,
          attack: player.userData.attack == -1 ? [] : [{
            id: player.userData.attack,
            dir: player.dir,
          }],
          attacked: player.userData.attacked == -1 ? [] : [{
            id: player.userData.attacked,
            dir: player.dir,
          }],
          fuzzy: player.timmer.dizzyTimeRemain > 0 ? true: false,
          power: player.timmer.prepareTimeRemain > 0 ? true: false,
          property: [player.userData.property["WA"], player.userData.property["TLE"], player.userData.property["RE"]],
        });
      }
    }
    return playersInfo;
  }

  getNewPropsInfo() {
    let newPropsInfo = [];
    for (let i = 0; i < this.newPropBuffer.length; i++) {
      let prop = this.newPropBuffer[i];
      newPropsInfo.push({
        id: prop.userData.id,
        name: prop.userData.name,
        image: prop.image,
        x: prop.x,
        y: prop.y,
        width: prop.width,
        height: prop.height,
        value: prop.userData.value,
      })
    }
    return newPropsInfo;
  }

  getPropsInfo() {
    let propsInfo = [];
    for (let i = 0; i < this.props.length; i++) {
      if (this.props[i].exist) {
        propsInfo.push({
          id: this.props[i].userData.id,
          x: this.props[i].x,
          y: this.props[i].y,
        });
      }
    }
    return propsInfo;
  }

  getMaxPropValue() {
    let max = 0;
    for (let i = 0; i < this.props.length; i++) {
      if (this.props[i].exist && this.props[i].userData.name !== 'blood' && this.props[i].userData.value > max) {
        max = this.props[i].userData.value;
      }
    }
    return max;
  }

  /* called every step in tick*/
  solveTimmer() {
    for (let name in this.timmer) {
      if (this.timmer[name] > 0) {
        this.timmer[name]--;
      }
    }
  }

  generateProp() {
    for (let name in this.players) {
      this.players[name].userData.newPropSend = false;
    }
    this.newPropBuffer = [];
    for (let name in config.props) {
      switch (name) {
        case "blood": {
          if (this.timmer["propBlood"] <= 0) {
            let r = getRandomInt(100);
            if (r < config.props["blood"].birthP * 100) {
              let newProp = new Obj(this, config.props["blood"].width, config.props["blood"].height, "static");
              let posR = getRandomInt(4);
              let posType = config.propPos[posR];
              newProp.setPos(getRandomIntBetween(posType.xMin, posType.xMax), getRandomIntBetween(posType.yMin, posType.yMax));
              newProp.setImage(config.props["blood"].image);
              newProp.setUserData({
                id: this.props.length,
                name: "blood",
                value: config.bloodMax * getRandomIntBetween(config.props["blood"].valueMin, config.props["blood"].valueMax) / 100,
              });
              this.props.push(newProp);
              this.newPropBuffer.push(newProp);
            }
            this.timmer["propBlood"] = config.props["blood"].birthTime;
          }
          break;
        }
        case "property": {
          for (let i = 0; i < config.props["property"].running.length; i++) {
            if (this.timmer["propProperty"] <= 0) {
              let r = getRandomInt(100);
              if (r < config.props["property"].running[i].birthP * 100) {
                let newProp = new Obj(this, config.props["property"].width, config.props["property"].height, "static");
                let posR = getRandomInt(4);
                let posType = config.propPos[posR];
                newProp.setPos(getRandomIntBetween(posType.xMin, posType.xMax), getRandomIntBetween(posType.yMin, posType.yMax));
                let rr = getRandomInt(3);
                newProp.setImage(config.props["property"].images[rr]);
                newProp.setUserData({
                  id: this.props.length,
                  name: config.props["property"].names[rr],
                  value: getRandomIntBetween(config.props["property"].running[i].valueMin, config.props["property"].running[i].valueMax),
                });
                this.props.push(newProp);
                this.newPropBuffer.push(newProp);
              }
              this.timmer["propProperty"] = config.props["property"].birthTime;
            }
          }
          break;
        }
        default: break;
      }
    }
  }

  generateDeathProp(name) {
    for (name in this.players) {
      this.players[name].userData.newPropSend = false;
    }
    this.newPropBuffer = [];
    let player = this.players[name];
    let newPropertyProp = new Obj(this, config.props["property"].width, config.props["property"].height, "static"); /*NOTE "this" may be a bug*/
    newPropertyProp.setPos(player.x, player.y);
    let r = getRandomInt(3);
    let propName = config.props["property"].names[r];
    newPropertyProp.setImage(config.props["property"].images[r]);
    newPropertyProp.setUserData({
      id: this.props.length,
      name: propName,
      value: (player.userData.property["WA"] + player.userData.property["TLE"] + player.userData.property["RE"]) / config.props["death"].value,
    });
    this.props.push(newPropertyProp);
    this.newPropBuffer.push(newPropertyProp);

    let newBloodProp = new Obj(this, config.props["blood"].width, config.props["blood"].height, "static");
    newBloodProp.setPos(player.x + player.width / 2, player.y);
    newBloodProp.setImage(config.props["blood"].image);
    newBloodProp.setUserData({
      id: this.props.length,
      name: "blood",
      value: getRandomIntBetween(config.props["blood"].valueMin, config.props["blood"].valueMax),
    });
    this.props.push(newBloodProp);
    this.newPropBuffer.push(newBloodProp);
  }

  /* game control*/
  tick(timeInterval) {
    for (let name in this.players) {
      this.players[name].move(timeInterval);
    }
    this.solveTimmer();
    this.generateProp();
    if (this.crashedTime >= 0) {
      this.crashedTime++;
      if (this.timmer.crashHurtTimmer <= 0) {
        this.crashHurt(config.roomHurtRate * this.crashedTime);
        this.timmer.crashHurtTimmer = config.crashHurtInterval;
      }
    }
  }

}

module.exports.Room = Room;
