import {_Entity} from "../../entity.js";
import {rankItemConfig} from "../../../control/config.js";
import {mergeObject} from "../../../support/support.js";

/**
 * ranklist中的一个人,信息包括x,y,width,height,head(头像的图片路径),name,score
 */
class _RankItem extends _Entity {
    init() {
        super.init();
        this._head = new _Entity(this._playground,
                                 mergeObject(rankItemConfig.head, {
                                            shape: 'sprite',
                                            image: this._config.player.head
                                        }));
        this._head.init();
        this.addChild(this._head);

        this._name = new _Entity(this._playground,
            mergeObject(rankItemConfig.name, {
                       shape: 'text',
                       text: this._config.player.name,
                   }));
        this._name.init();
        this.addChild(this._name);

        this._score = new _Entity(this._playground,
            mergeObject(rankItemConfig.score, {
                       shape: 'text',
                       text: "0",
                   }));
        this._score.init();
        this.addChild(this._score);
    }

    set score(s) {
        this._score._entity.content = s.toString();
    }
}

export {_RankItem};