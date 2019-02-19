import {_Entity} from "../entity.js"
import {mergeObject} from "../../support/support.js";
import {uiConfig} from "../../control/config.js";

/**
 * total: 游戏玩家总数
 * cur: 存活玩家数
 */

class _PlayerNumber extends _Entity {
    constructor(playground, conf) {
        let config = mergeObject(conf, {
            shape: 'text',
            text: "",
        });
        config = mergeObject(config, uiConfig.playerNumber);
        super(playground, config);
    }

    _updateText(x) {
        this._entity.content = "玩家数："+this._config.cur.toString()+"/"+this._config.total.toString();
    }

    // x表示新增的死亡玩家数
    lose(x) {
        this._config.cur -= x;
        this._updateText();
    }

    init() {
        super.init();
        this._updateText();
    }
} 

export {_PlayerNumber};