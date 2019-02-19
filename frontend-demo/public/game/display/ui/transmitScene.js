import {_UiScene} from "./uiScene.js"
// import {_Entity} from '../entity.js';

class _TransmitScene extends _UiScene {
    constructor(playground, config) {
        super(playground, config);
        this._config.shape = 'rectangle';
        this._config.color = 'black';
    }

    init() {
        super.init();
        this.alpha = 0;
        this._entity._z = 90;
    }

    run(onAttrEnd) {
        let t = this;
        this.attrTransit('alpha', 1, t._config.transTime/3, () => {
            if (typeof(t._config.middleFunction) != "undefined")
                t._config.middleFunction();
            t.attrTransit('alpha', 0, t._config.transTime/3*2, onAttrEnd);
        });
    }
}

export {_TransmitScene};