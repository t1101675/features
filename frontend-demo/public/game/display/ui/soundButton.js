import {mergeObject} from "../../support/support.js";
import {uiConfig} from "../../control/config.js";
import { _Entity } from "../entity.js";

class _SoundButton extends _Entity {
    constructor(playground, conf) {
        let config = mergeObject(conf, uiConfig.soundBtn);
        config = mergeObject(config, {
            shape: 'group',
            image: uiConfig.soundBtn.onImage,
        });
        super(playground, config);        
    }
    init() {
        super.init();
        
        this._onButton = new _Entity(this._playground, {
            shape: 'sprite',
            height: this._config.height,
            width: this._config.width,
            image: this._config.onImage,
        })
        this._onButton.init();
        this.addChild(this._onButton);

        this._offButton = new _Entity(this._playground, {
            shape: 'sprite',
            height: this._config.height,
            width: this._config.width,
            image: this._config.offImage,
        })
        this._offButton.init();
        this.addChild(this._offButton);

        let t = this;
        this._onButton._entity.interactive = true;
        this._onButton._entity.on('click', () => {
            t._offButton.visible = true;
            t._onButton.visible = false;
            t._sound.pause();
        });
        
        this._offButton._entity.interactive = true;
        this._offButton._entity.on('click', () => {
            t._onButton.visible = true;
            t._offButton.visible = false;
            t._sound.play();
        });

        this._sound = this._playground.sound(this._config.music);
        this._sound.loop = this._config.bgm_loop;

        this._onButton.visible = false;
        this._offButton.visible = true;
        this._sound.pause();

    }
}

export {_SoundButton};