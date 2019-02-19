import {_Hero} from "./hero.js"
import {deepCopy} from "../support/support.js";
import {_Entity} from "./entity.js";

class _Heroes extends _Entity{
    constructor(playground, conf, sortStage) {
        let config = deepCopy(conf);
        config.shape = 'group';
        config.sort((a, b) => a.id - b.id);
        // console.log('game main : ', sortStage);
        config.sortStage = sortStage;
        super(playground, config);
    }
    init() {
        super.init();
        this._config.sortStage();
        this._playerTotal = this._config.length;
        this._heroes = new Array(this._playerTotal);
        let heroInitPromises = new Array();
        for (let i = 0; i < this._playerTotal; i++) {
            heroInitPromises.push(this._heroInit(i));
        }
        return Promise.all(heroInitPromises).then(() => this._loaded = true).catch(console.error);
    }
    
    _heroInit(id) {
        let config = this._config[id];
        config.x = config.y = 50*id+80;
        this._heroes[id] = new _Hero(this._playground, config);
        let t = this;
        return this._heroes[id].init().then(() => { t.addChild(t._heroes[id]); }).catch(console.error);
    }

    get heroes() {
        return this._heroes;
    }
    
}

export {_Heroes}