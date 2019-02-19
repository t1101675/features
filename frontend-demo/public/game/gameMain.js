import {_TestBattleScene} from "./display/testBattleScene.js";
import {TimeLine} from "./timeLine/timeLine.js";
import {WP} from './wonder/wonder.js';
import {WP_test} from "./wonder/wonder-test.js";
import {Connection} from "./connection/connection.js";
import {_TestUiScene} from "./display/ui/testUiScene.js";
import {KeyBoard} from "./control/keyBoard.js"
import {_FinalScene} from "./display/finalScene.js"
import {sceneLocalConfig} from "./control/config.js";
import {_Heroes} from "./display/heroes.js";
import {_TransmitScene} from "./display/ui/transmitScene.js"
import {mergeObject} from "./support/support.js";
import {_LoadingScene} from "./display/ui/loading.js";

class _GameMain {
    constructor() {
        //用于存储各种配置数据
        this._config = {}
    }

    start() {
        //let sign = Server._generateSign();
        /*
        在使用Promise的时候，传递的参数如果是函数，是不会传递this信息的
        所以我们需要用一个箭头函数把this包裹进去
         */
        Connection.getData('sdk').then(received => {
            if (typeof global === 'undefined' || global.isTesting === undefined)
                return WP.init(received.signature);
            else
                WP_test.init(received.signature);
        })
                .then(() => this._fetchConfig('gameConfig'))
                .then(() => this._createPlayground())
                .then(() => this._onLoadFinish())
                .catch(console.error);
        this._startTime = Date.now();

        this._needLayerSort = false;
    }

    startGame() {
        // this._bgm = new _Sound(this._playground, {
        //     bgm_name : this._config.gameConfig.assets.music,
        //     bgm_loop: true,
        // });
        //this._bgm.init();
        this._loadingScene.visible = false;
        TimeLine.start();
        this._uiScene.startGame();
        window.gameLoadCallback();
    }

    /**
     * 调用Connection.getData来获取配置数据并存储在this._config中
     * @param name
     * @returns {Promise<T>}
     * @private
     */
    _fetchConfig(name) {
        return Connection.getData(name)
                .then(result => this._config[name] = result);
    }

    _createPlayground() {
        let t = this;
        return new Promise(async (resolve, reject) => {
            t._config.gameConfig.width = t._config.gameConfig.roomConfig.scene.width;
            t._config.gameConfig.height = t._config.gameConfig.roomConfig.scene.height;

            if(typeof global === 'undefined' || !global.isTesting)
                myhexi = hexi
                else {
                  var myhexi = global.hexi
                }
            // var myhexi = hexi;
            t._playground = myhexi(
                sceneLocalConfig.main.width,
                sceneLocalConfig.main.height,
                () => {
                    console.log('callback visited');
                    t._loadingScene = new _LoadingScene(t._playground, {});
                    t._loadingScene.init();
                    t._loadingScene._entity._z = 1000;
                    t._sortStage();
                    let tt = t;
                    t._heroes = new _Heroes(t._playground, t._config.gameConfig.playerConfig, 
                                            () => { tt._sortStage(); });
                    t._heroes.init()
                        .then(() => t._sceneInit())
                        .then(() => t._startPlayground())
                        .then(resolve)
                        .catch(reject);
                },
                ['/images/bgmOff.png', '/images/bgmOn.png', '/music/bounce.mp3', '/images/fuzzy.png', '/images/power.png', '/images/round.png']);
            t._playground.start();
            console.log('t._playground run');
        });
    }

    _sceneInit() {
        this._scene = this._getBattleScene();
        this._uiScene = this._getUiScene();
        this._sortStage();
    }

    _startPlayground() {
        this._playground.state = () => this.refresh();
    }

    _getBattleScene(visible = true, addHeroes = true) {
        let t = new _TestBattleScene(this._playground, mergeObject(
            this._config.gameConfig.roomConfig,
            { playerConfig: this._config.gameConfig.playerConfig }));
        t.init();
        t.visible = visible;
        // t.spaceTo(sceneLocalConfig.battle.width, sceneLocalConfig.battle.height);
        t.positionX = sceneLocalConfig.battle.x;
        t.positionY = sceneLocalConfig.battle.y;
        if (addHeroes)
            t.addHeroes(this._heroes.heroes);

        return t;
    }

    _getUiScene(visible = true) {
        let uiScene = new _TestUiScene(this._playground, {
            shape: 'group',
            sceneConfig: this._config.gameConfig
        });
        uiScene.init();
        uiScene.visible = visible;
        return uiScene;
    }


    _onLoadFinish() {
        Connection.postData('clientReady');
        KeyBoard.start();
    }

    someoneLose(loser) {
        this._scene.someoneLose(loser);
        this._uiScene.someoneLose(loser);
    }

    /**
     * 显示游戏结束界面
     * @param {boolean} isWin 是否胜利
     * @param {number} score 游戏最终得分
     */
    _showFinalScene(isWin, score) {
        this._scene.visible = false;
        // this._uiScene.visible = false;
        this._finalScene = new _FinalScene(this._playground, {
            width: this._config.gameConfig.roomConfig.width,
            height: this._config.gameConfig.roomConfig.height,
            score: score,
            win: isWin,
        })
        this._finalScene.init();
        this._playground.state = () => this.finalStateRefresh();
    }

    winGame(score) {
        this._showFinalScene(true, score);
    }

    loseGame(score) {
        this._showFinalScene(false, score);
    }

    changeRoom(roomConfig) {
        let t = this;
        t._config.gameConfig.roomConfig = roomConfig;
        let newScene = t._getBattleScene(false, false);
        t._transScene = new _TransmitScene(t._playground, {
            width: sceneLocalConfig.battle.width,
            height: sceneLocalConfig.battle.height,
            x: sceneLocalConfig.battle.x,
            y: sceneLocalConfig.battle.y,
            alpha0: 1,
            alpha1: 0,
            transTime: t._config.gameConfig.scene.transTime,
            middleFunction: () => {
                t._scene = newScene;
                t._scene.addHeroes(t._heroes.heroes);
                t._scene.visible = true;
                t._uiScene.changeRoom(roomConfig);
            }
        });
        t._transScene.init();
        t._sortStage();
        t._transScene.run(() => {
            delete t._transScene;
        });
    }

    _sortStage() {
        this._playground.stage.children.sort((a, b) => (a._z || 0) - (b._z || 0));
    }

    /**
     * 根据收到的数据包进行更新
     * @param data 游戏信息
     */
    update(data) {
        if (typeof(this._scene) != 'undefined')
            this._scene.update(data);
        if (typeof(this._uiScene) != 'undefined')
            this._uiScene.update(data);
    }

    refresh() {
        TimeLine.refresh();
        if (typeof(this._scene) != 'undefined')
            this._scene.refresh();
        if (typeof(this._uiScene) != 'undefined')
            this._uiScene.refresh();
        if (typeof(this._transScene) != 'undefined') {
            this._transScene.refresh();
        }
    }

    finalStateRefresh() {
        this._finalScene.refresh();
    }

}


let GameMain = new _GameMain();

export {GameMain};
