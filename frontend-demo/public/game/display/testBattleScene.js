import {_Scene} from "./scene.js";
import {_Entity} from "./entity.js";
// import {_Hero} from "./hero.js";
import {_PropItem} from "./prop.js";
import {updateByID, updateByIdDict} from "../support/updateByID.js";
import {sceneLocalConfig, battleConfig} from "../control/config.js"
import { deepCopy, sleep } from "../support/support.js";

class _TestBattleScene extends _Scene {
    constructor(playground, conf) {
        let config = deepCopy(conf);
        super(playground, config);
    }
    init() {
        this._config.shape = 'sprite';
        this._config.width = sceneLocalConfig.battle.width;
        this._config.height = sceneLocalConfig.battle.height;
        this._config.image = this._config.scene.image;
        super.init();
        // this._setBackground(this._config.scene);
        this._drawRoomID(this._config.roomId);
        this._drawWalls();
        this._drawDoors();
        this._heroConfig = this._config.heroes;
        this._props = new Array();
        this._addProps(this._config.props);
        this._fires = [];
        this._propInfo = new _Entity(this._playground, {
            shape: 'text',
            x: 400,
            y: 0,
            text: 'No Prop',
            textFont: '30px',
        });
        this._propInfo.init();
        this._propInfo._entity._z = 200;
        this._propInfo.visible = false;
        this.addChild(this._propInfo);
    }

    addHeroes(heroes) {
        this._heroes = heroes;
        for (let i in this._heroes) {
            this.addChild(this._heroes[i]);
            this._heroes[i].visible = true;
        }
    }

    _drawWalls() {
        let walls = this._config.walls;
        for (let i in walls) {
            for (let j = 0; j < walls[i].width; j += battleConfig.wallWidth) {
                for (let k = 0; k < walls[i].height; k += battleConfig.wallHeight) {
                    let child = new _Entity(this._playground, {
                        width: battleConfig.wallWidth,
                        height: battleConfig.wallHeight,
                        x: walls[i].x + j,
                        y: walls[i].y + k,
                        shape: 'sprite',
                        image: walls[i].image,
                    });
                    child.init();
                    child._z = 20;
                    this.addChild(child);
                }
            }
        }
    }

    _drawDoors() {
        let doors = this._config.doors;
        for (let i in doors) {
            let child = new _Entity(this._playground, {
                width: doors[i].width*1.5,
                height: doors[i].height*1.5,
                x: doors[i].x-doors[i].width*0.25,
                y: doors[i].y-doors[i].height*0.25,
                shape: 'sprite',
                image: doors[i].image
            });
            child.init();
            child._z = 30;
            this.addChild(child);
        }
    }

    _drawRoomID(id) {
        this._roomIdText = new _Entity(this._playground, {
            shape: 'text',
            text: 'Room: '+id.toString(),
            textColor: 'white',
            textFont: '40px',
            x: 800,
            y: 0
        })
        this._roomIdText.init();
        this._roomIdText.visible = false;
        this.addChild(this._roomIdText);
    }

    _addProps(props, toConfig = false) {
        for (let i in props) {
            let prop = new _PropItem(this._playground, props[i])
            prop.init();
            this._props.push(prop);
            this.addChild(prop);
            if (toConfig)
                this._config.props.push(props[i]);
        }

    }

    // _heroInit(id) {
    //     // console.log("in hero init", id);
    //     let config = this._config.heroes[id];
    //     config.x = config.y = 50*id+80;
    //     this._heroes[id] = new _Hero(this._playground, config);
    //     return this._heroes[id].init().then(()=>this.addChild(this._heroes[id])).catch(console.error);
    // }

    // _setBackground(scene) {
    //     this._background = new _Entity(this._playground, {
    //         shape: 'sprite',
    //         image: scene.image,
    //         width: scene.width,
    //         height: scene.height
    //     });
    //     this._background.init();
    //     this.addChild(this._background);
    //     //this._background._entity.addChild(this._entity);
    // }

    someoneLose(losers) {
        console.log('loser:', losers);
        for (let i in losers) {
            let loser = losers[i];
            for (let j in this._heroes)
                if (this._heroes[j].name == loser) {
                    let t = this._heroes[j];
                    t.goDie();
                }
        }
    }

    _updateAOE(heroes) {
        //注意heroes[i]不一定编号为i
        for (let i in heroes) {
            for (let j in heroes[i].attack)
                if (heroes[i].attack[j].id == 4) {
                    for (let k = 0; k < heroes.length; k++)
                        if (k != i) {
                            //BUG：如果两个人在同一帧里放大招，会显示成两个人都向这两个人能打到的人的并集发火焰
                            let attackedByAOE = false;
                            for (let s in heroes[k].attacked)
                                if (heroes[k].attacked[s].id == 4) {
                                    attackedByAOE = true;
                                    break;
                                }
                            if (!attackedByAOE)
                                continue;
                            let fire = new _Entity(this._playground, {
                                shape: 'sprite',
                                image: battleConfig.AOEimage,
                                width: 30,
                                height: 30,
                                x: heroes[i].x,
                                y: heroes[i].y,
                            });
                            fire.init();
                            this._fires.push(fire);
                            this.addChild(fire);
                            fire.visible = false;
                            sleep(300).then( () => {
                                fire.visible = true;
                                fire.attrTransit('positionX', heroes[k].x + 50, 300, () => {
                                    fire.xEnded = true;
                                    if (fire.yEnded)
                                        fire.visible = false;
                                });
                                fire.attrTransit('positionY', heroes[k].y + 50, 300, () => {
                                    fire.yEnded = true;
                                    if (fire.xEnded)
                                        fire.visible = false;
                                })
                            })
                        }
                } 
        }
    }

    _showProps(heroes) {
        let propInfo = "";
        for (let i in heroes) {
            let name = '';
            for (let j in this._config.playerConfig)
                if (this._config.playerConfig[j].id == heroes[i].id) {
                    name = this._config.playerConfig[j].name;
                }
            propInfo += name + ':';
            for (let j in heroes[i].props) {
                let id = heroes[i].props[j];
                let name = "";
                for (let k in this._config.props) {
                    if (this._config.props[k].id == id) {
                        name = this._config.props[k].name;
                        break;
                    }
                }
                propInfo += '('+id+','+name+')';
            }
            propInfo += '\n';
        }
        this._propInfo._entity.content = propInfo;
    }

    update(data) {
        this._updateAOE(data.heroes);
        this._addProps(data.newProps, true);
        this._showProps(data.heroes);
        updateByID(this._heroes, data.heroes);
        updateByIdDict(this._props, data.props);
    }

    refresh() {
        super.refresh();
        this._refreshHeroes();
        this._refreshFires();
    }

    //怀疑有BUG，和entity类的实现有关系
    _refreshHeroes() {
        for (let i in this._heroes) {
            if (this._heroes[i] === undefined) {
                continue;
            }
            this._heroes[i].refresh();
        }
    }

    _refreshFires() {
        for (let i in this._fires)
            this._fires[i].refresh();
    }
}

export {_TestBattleScene};