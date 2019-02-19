import {_Entity} from "./entity.js";
import {mergeObject} from "../support/support.js";
import {propConfig} from "../control/config.js";


class _PropItem extends _Entity {
    constructor(playground, conf) {
        let config = mergeObject(conf, {
            shape: 'group',
        });
        super(playground, config);
    }

    init() {
        super.init();
        this._z = 40;
        
        this._prop = new _Entity(this._playground, {
            shape: 'sprite',
            width: this._config.width,
            height: this._config.height,
            image: this._config.image,
        });
        this._prop.init();
        this.addChild(this._prop);

        this._text = new _Entity(this._playground, mergeObject(propConfig.text, {
            shape: 'text',
            text: this._config.value.toString(),
        }));
        //console.log(this._config.value.toString());
        this._text.init();
        //console.log(this._config.width, this._text._entity.width, this._prop.width);
        this._text.positionX = (this._prop._entity.width - this._text._entity.width)/2;
        this.addChild(this._text);

        this.id = this._config.id;

    }
}

export {_PropItem};