import {_Entity} from "../entity.js";
import {sceneLocalConfig} from "../../control/config.js";
import {mergeObject} from "../../support/support.js";

class _LoadingScene extends _Entity {
    constructor(playground, conf) {
        let config = mergeObject(conf, {
            shape: 'rectangle',
            color: '#00CCFF',
            width: sceneLocalConfig.main.width,
            height: sceneLocalConfig.main.height,
        });
        super(playground, config);
    }

    init() {
        super.init();
        this._loadText = new _Entity(this._playground, {
            shape:'text',
            text: 'loading...',
            textFont: '200px',
            textColor: 'white',
            x: 450,
            y: 350,
        })
        this._loadText.init();
        this.addChild(this._loadText);
    }
}

export {_LoadingScene};