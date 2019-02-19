import {_Entity} from "./entity.js";

class _Scene extends _Entity {
    //在playground中根据config创建一个场景
    constructor(playground, config) {
        super(playground, config);
    }

    init() {
        super.init();
    }

    addChild(child) {
        super.addChild(child);
        this.requireLayerSort();
    }

    /**
     * addChild自动调用此方法
     * 告知场景需要重新根据z-index为每个实体排序
     */
    requireLayerSort() {
        this._needLayerSort = true;
    }

    refresh() {
        super.refresh();
        if (this._needLayerSort) {
            this._entity.children.sort((a, b) => (a._z || 0) - (b._z || 0));
            this._needLayerSort = false;
            // console.log(this._entity.children);
        }
    }
}

export {_Scene};