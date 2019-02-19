import {_Scene} from './scene.js';
import { _Entity } from './entity.js';
import {sceneLocalConfig} from "../control/config.js";
import {mergeObject} from "../support/support.js";
/**
 * 游戏结束后弹出的界面
 */
class _FinalScene extends _Scene {
    /**
     * @param {*} playground hexi场景的引用 
     * @param {*} config 配置，包括width, height, score, isWin
     */
    constructor(playground, conf) {
        let config = mergeObject(conf, {
            shape: 'rectangle',
            color: 'purple',
            width: sceneLocalConfig.battle.width,
            height: sceneLocalConfig.battle.height,
            x: sceneLocalConfig.battle.x,
            y: sceneLocalConfig.battle.y,
        }) 
        super(playground, config);
    }

    init() {
        super.init();
        this._text = new _Entity(this._playground, {
            shape: 'text',
            text: this._textToShow(),
            textFont: '30px sans',
            textColor: 'white',
            x: 250,
            y: 100,
            width: 100,
            height: 50
        })
        this._text.init();
        this.addChild(this._text);
    }

    _textToShow() {
        let winText = this._config.win ? 'You win!' : 'You lose';
        let scoreText = 'Your score is ' + this._config.score.toString();
        let retureText = winText + '\n' + scoreText;
        return retureText;
    }

    refresh() {
        super.refresh();
    }
}

export {_FinalScene};