import {_Entity} from "../../entity.js";
import {ranklistConfig, uiConfig} from "../../../control/config.js";
import {_RankItem} from "./rankItem.js";
import {deepCopy, mergeObject} from "../../../support/support.js";

class _Ranklist extends _Entity {
    constructor(playground, conf) {
        let config = deepCopy(conf);
        config = mergeObject(config, ranklistConfig);
        config = mergeObject(config, uiConfig.ranklist);
        super(playground, config);
    }

    init() {
        super.init();
        this._title = new _Entity(this._playground, ranklistConfig.text);
        this._title.init();
        this.addChild(this._title);
        this._bd = new _Entity(this._playground, {
            shape: 'hh', // for coverage
            height: 10,
            width: 10,
            x: 10,
            y: 10,
        });
        this._bd.init();
        this.addChild(this._bd);
        this._bd.visible = false;
        this._initRankItem();
    }

    _initRankItem() {
        let n = this._config.player.total;
        let id = this._config.player.id;
        let config = ranklistConfig.item;
        this._rankItems = [];
        for (let i = 0, y = config.yStart; i < n; i++, y+= config.height + config.margin) {
            let itemConfig = {
                x: config.x,
                y: y,
                width: config.width,
                height: config.height,
                color: i == id ? config.myColor :                
                                 config.otherColor,
                player: this._config.playerConfig[i],
            }
            let rankItem = new _RankItem(this._playground, itemConfig);
            rankItem.init();
            this.addChild(rankItem);
            this._rankItems.push(rankItem);
        }
    }

    update(data) {
        let n = this._config.player.total;
        let config = ranklistConfig.item;
        let toSort = [];
        for (let i=0; i<n; i++)
            toSort.push([i, data.scores[i]]);
        let cmp = (a, b) => b[1] - a[1];
        toSort.sort(cmp);
        for (let i = 0, y = config.yStart; i < n; i++, y+= config.height + config.margin) {
            this._rankItems[toSort[i][0]].positionY = y;
            this._rankItems[toSort[i][0]].score = toSort[i][1];
        }
    }
}

export {_Ranklist};