// a fake server, just for test
// When include wonderpainter, you need to include pixi.min.js first

import {Connection} from "../connection/connection.js";
import {sleep} from "../support/support.js";


var blood = [100, 100, 100, 100, 100];
var vx = [0, 0, 0, 0, 0];
var vy = [0, 0, 0, 0, 0];
var props = [
    { id: 1, x: 200, y: 510},
    { id: 2, x: 440, y: 510},
    { id: 3, x: 900, y: 660},
]
var startAttack =  [-1, -1, -1, -1, -1];
var isAttacked = [-1, -1, -1, -1, -1];
var isDie = [false, false, false, false, false];
var heroX = [700, 860, 120, 290, 530];
var heroY = [150, 150, 630, 450, 630];
var visible = [true, true, true, true, true];
var score = [10, 20, 30, 40, 50];
var roomColor = [0, 0, 0, 0, 0, 0];
var property = [
    [0, 0, 0],
    [2, 2, 0],
    [2, 1, 0],
    [0, 2, 2],
    [0, 3, 4],
]
var fuzzy = [true, false, false, false, false];
var power = [false, true, false, true, false];
var roomConfig = {
    roomId: 1,
    scene: {
        width: 1600,
        height: 900,
        image: '/images/bg.jpg'
    },

    walls: [
        { x: 200, y: 600, width: 300, height: 60, image: '/images/wall.png'},
        { x: 700, y: 300, width: 300, height: 60, image: '/images/wall.png'},
        { x: 1170, y: 480, width: 180, height: 60, image: '/images/wall.png'},
        { x: 100, y: 200, width: 60, height: 780, image: '/images/wall.png'},
        { x: 400, y: 400, width: 120, height: 120, image: '/images/wall.png'},
    ],

    doors: [
        { x: 1200, y: 330, width: 150, height: 150, image: '/images/portal1.png'},
    ],

    props: [
        { id: 1, image: '/images/wa.png', name: 'blood', x: 200, y: 480, width: 60, height: 60, value: 1,},
        { id: 2, image: '/images/re.png', name: 'energy', x: 440, y: 480, width: 60, height: 60, value: 10,},
        { id: 3, image: '/images/tle.png', name: 'grave', x: 900, y: 660, width: 60, height: 60, value: 100,}
    ],
}
var newProps = [];
var transmitting = 'end';
class _Server {
    constructor() {
        this._appKey = 'b9406fe8-395c-4eb7-ac1d-549b2a366b2d';
        this._appSecret = 'Eb5djEG4ZHuV7uh4bjy0LErnx7QAiPYiAapr0la4awStQUIjIwis327B5di8NQSJagdzj7fz9ERoJ1YS8tUwYOHnjJaoxNjiJ5khgmz8T4RKCos9Z4JVzZOSJOabfR8N';
        this._status = 'off';
    }

    /**
     * 启动服务器，开始按固定时间间隔发送数据包
     */
    start() {
        this._status = 'on';
        this._sendTick(20);
    }
    /**
     * 停止服务器，结束按固定时间间隔发包
     * WARNING: 服务器停止后应该也不能调用get，但这只是个fake server，故没有实现
     */
    end() {
        this._status = 'off';
    }


    /**
     * 对prop的hide进行测试，按键Z
     */
    modifyScene() {
        props = [
            { id: 1, x: 200, y: 300},
            { id: 2, x: 100, y: 300}
        ]
    }

    /**
     * 对prop的show进行测试，按键X
     */
    modifyScene2() {
        props = [
            { id: 1, x: 200, y: 300},
            { id: 2, x: 200, y: 200},
            { id: 3, x: 400, y: 100}
        ]
    }

    /**
     * 测试新增道具的功能，按键G
     */

    newProps() {
        newProps = [ {
            id: 233,
            name: 'haha',
            image: '/images/panda.png',
            x: 300,
            y: 400,
            width: 90,
            height: 90,
            value: 20,
        }
        ];
    }


    /**
     * 有人输了的测试，按键C
     */
    someoneLose() {
        isDie[0] = isDie[3] = true;
        this.send({
            code: 200,
            type: "TICK",
            name: "someoneLose",
            data: {
                loser: ['heheda', 'julao0']
            }
        }
        )
    }

    /**
     * 游戏胜利测试，按键V
     */
    winGame() {
        this._status = "off";
        this.send( {
                code: 200,
                type: "TICK",
                name: "win",
                data: {
                    score: 200,
                }
            }
        );
        this.end();
    }

    /**
     * 游戏失败测试，按键B
     */
    loseGame() {
        this._status = "off";
        this.send({
            code: 200,
            type: "TICK",
            name: "lose",
            data: {
                score: 100,
            }
        }
        );
        this.end();
    }

    /**
     * 隐藏巨佬3，按键M
     */
    hideMyself() {
        visible[4] = false;
    }

    /**
     * 显示巨佬3，按键'L'
     */
    showMyself() {
        visible[4] = true;
    }

    /**
     * 移动巨佬4，按键N
     */
    moveMyself() {
        //heroX[4] += 50;
        heroY[4] -= 50;
    }

    /**
     * 改变每个人的得分，按键K
     */
    changeScore() {
        score = [10, 30, 50, 30, 10];
    }

    changeBlood() {
        blood = [0, 20, 50, 80, 100];
    }

    /**
     * 改变房间颜色，按键P
     */
    changeRoomColor() {
        roomColor = [0, 1, 2, 3, 2, 1];
    }

    /**
     * 置于眩晕态，按键O
     */
    changeFuzzy() {
        fuzzy = [true, false, true, false, true];
    }

    /**
     * 定期发送数据包
     * @param send_interval 发送时间间隔
     */
    async _sendTick(send_interval) {
        console.log('send regularly');
        while (this._status == 'on') {
            let heroArray = new Array();
            for (let i in newProps) {
                props.push( { id: newProps[i].id, x: newProps[i].x, y: newProps[i].y});
            }
            let propIDs = [];
            for (let i in props)
                propIDs.push(props[i].id);
            for (let i=0; i<5; i++)
                if (!isDie[i] && visible[i])
                    heroArray.push({
                        id: i,
                        x: heroX[i],
                        y: heroY[i],
                        vx: vx[i],
                        vy: vy[i],
                        hp: blood[i],
                        fuzzy: fuzzy[i],
                        power: power[i],
                        property: property[i],
                        attack: startAttack[i] == -1 ? [] : [{
                            id: startAttack[i],
                            dir: startAttack[i] == 0 ? 'left' : 'right',
                        }],
                        attacked: isAttacked[i] == -1 ? [] : [{
                            id: isAttacked[i],
                            dir: isAttacked[i] == 0 ? 'right' : 'left',
                        }],
                        props: i == 4 ? propIDs : [],
                    })
            startAttack =  [-1, -1, -1, -1, -1];
            isAttacked = [-1, -1, -1, -1, -1];
            // console.log('sendtick', vx, vy);
            let data = {
                rooms: roomColor,
                heroes: heroArray,
                props: props,
                newProps: newProps,
                scores: score,
                timestamp: Date.now(),
                // transmitting: transmitting,
            }
            newProps = [];
            this.send({
                code: 200,
                type: 'TICK',
                name: 'gameInfo',
                data: data
            })
            await sleep(send_interval);
        }
        console.log('send regularly end');
    }
    /**
     * 每当收到数据包时被触发，会相应地调用不同receive方法
     * @param pack 服务器传来的数据包
     * @private
     */
    receive(pack) {
        //目前默认数据包完整且合法
        console.log('server receive', pack);
        switch (pack.type) {
            case 'GET':
                this.receiveGetRequest(pack.name, pack.data);
                break;
            case 'POST':
                this.receivePostRequest(pack.name, pack.data);
                break;
            // case 'TICK':
            //     this.receiveTick(pack.name, pack.data);
        }
    }



    /**
     * 使用pomelo的方法发送数据包
     * @param pack
     * @private
     */
    send(pack) {
        Connection._recv(pack);
    }

    sendReturn(name, data) {
        this.send({
            type: 'RETURN',
            name: name,
            data: data
        });
    }

    changeBackground() {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!change background');
        roomConfig.scene.image = '/images/background3.png';
        roomConfig.roomId = 5;
        console.log('room config', roomConfig);
        transmitting = 'on';
        this.send({
            code: 200,
            type: 'TICK',
            name: 'transmitInfo',
            data: roomConfig,
        })
    }

    updateByKeyboard(downKey) {
        console.log('down', downKey);
        vx[4] = function() {
            if (downKey.keyLeft == 'down')
                return -1;
            else if (downKey.keyRight == 'down')
                return 1;
            return 0;
        }();
        vy[4] = function() {
            if (downKey.keyUp == 'down')
                return -1;
            else if (downKey.keyDown == 'down')
                return 1;
            return 0;
        }();
        for (let i in downKey) {
            if (downKey[i] == 'down') {
                switch (i) {
                    case 'keyA':
                        startAttack[4] = 0;
                        isAttacked[3] = 0;
                        break;
                    case 'keyS':
                        startAttack[4] = 1;
                        isAttacked[3] = 1;
                        break;
                    case 'keyD':
                        startAttack[4] = 2;
                        isAttacked[3] = 2;
                        break;
                    case 'keyR':
                        startAttack[4] = 3;
                        isAttacked[3] = 2;
                        break;
                    case 'keyF':
                        startAttack[4] = 4;
                        for (let i = 0; i < 3; i++)
                            isAttacked[i] = 4;
                        break;
                    case 'keyZ':
                        this.modifyScene();
                        break;
                    case 'keyX':
                        this.modifyScene2();
                        break;
                    case 'keyC':
                        this.someoneLose();
                        break;
                    case 'keyV':
                        this.winGame();
                        break;
                    case 'keyB':
                        this.loseGame();
                        break;
                    case 'keyN':
                        this.moveMyself();
                        break;
                    case 'keyM':
                        this.hideMyself();
                        break;
                    case 'keyL':
                        this.showMyself();
                        break;
                    case 'keyK':
                        this.changeScore();
                        break;
                    case 'keyJ':
                        this.changeBlood();
                        break;
                    case 'keyH':
                        this.changeBackground();
                        break;
                    case 'keyG':
                        this.newProps();
                        break;
                    case 'keyP':
                        this.changeRoomColor();
                        break;
                    case 'keyO':
                        this.changeFuzzy();
                        break;
                    default:
                        console.log('Warning: do not support '+downKey[i]);
                }
            }
        }
    }
    /*
    receiveTick(name, data) {
        vx[4] = function() {
            for (let i=0; i<data.downKey.length; i++) {
                if (data.downKey[i] == 'keyLeft')
                    return -1;
                else if (data.downKey[i] == 'keyRight')
                    return 1;
            }
            return 0;
        }();
        vy[4] = function() {
            for (let i=0; i<data.downKey.length; i++) {
                if (data.downKey[i] == 'keyUp')
                    return -1;
                else if (data.downKey[i] == 'keyDown')
                    return 1;
            }
            return 0;
        }();
        for (let i=0; i<data.downKey.length; i++)
            if (data.downKey[i] == 'keyA') {
                startAttack[4] = true;
            }
    }*/

    receivePostRequest(name, data) {
        switch (name) {
            case 'clientReady':{
                console.log('server receive ready');
                this.start();
                let t = this;
                sleep(2000).then(() => t.send({
                    code: 200,
                    type: "TICK",
                    name: "gameStart",
                    data: {}
                }));
                break;
            }
            case 'keyInfo': {
                this.updateByKeyboard(data);
                break;
            }
        }
    }

    receiveGetRequest(name, data) {
        switch (name) {
            case 'gameConfig':
                this.sendReturn(name, {
                    player: {
                        total: 5,
                        id: 4,
                    },
                    playerConfig: [ {
                            id: 4,
                            width: 100,
                            height: 100,
                            image: "/images/police.jpg",
                            head: "/images/head1.jpg",
                            name: 'julao3',
                            blood: 200,
                        }, {
                            id: 3,
                            width: 100,
                            height: 100,
                            image: "/images/good.png",
                            head: "/images/head1.jpg",
                            name: 'heheda',
                            blood: 100,
                        }, {
                            id: 2,
                            width: 100,
                            height: 100,
                            image: "/images/good.png",
                            head: "/images/head0.jpg",
                            name: 'julao2',
                            blood: 200,
                        }, {
                            id: 1,
                            width: 100,
                            height: 100,
                            image: "/images/good.png",
                            head: "/images/head0.jpg",
                            name: 'longername',
                            blood: 200,
                        }, {
                            id: 0,
                            width: 100,
                            height: 100,
                            image: "/images/girl.png",
                            head: "/images/head0.jpg",
                            name: 'julao0',
                            blood: 200,
                        }, ],
                    scene: {
                        roomRow: 2,
                        roomColumn: 3,
                        width: 1600,
                        height: 900,
                        image: "",
                        transTime: 1500,
                    },
                    roomConfig: roomConfig,
                    // assets: {
                    //     music: "./music/bgm.mp3",
                    //     AOEimage: "/images/fire.png",
                    //     all: [
                    //         "./music/bgm.mp3",
                    //     ]
                    // }
                })
                break;
            case 'sdk':
                console.log(WonderPainter.App);
                this.sendReturn(name, { signature: WonderPainter.App.sign(this._appKey, this._appSecret) });
                break;
        }
    }
}

let Server = new _Server();

export {Server};
