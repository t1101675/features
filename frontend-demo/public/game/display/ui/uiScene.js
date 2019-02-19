import {_Scene} from "../scene.js";

class _UiScene extends _Scene {
    constructor(playground, config) {
        super(playground, config);
    }

    init() {
        super.init();
        this._entity._z = 100;
    }
}

export {_UiScene};