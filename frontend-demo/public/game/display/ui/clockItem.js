import {_Entity} from "../entity.js";
import {uiConfig} from "../../control/config.js";
import {mergeObject, deepCopy} from "../../support/support.js";
import {TimeLine} from "../../timeLine/timeLine.js";

class _ClockItem extends _Entity {
    constructor(playground, conf) {
        let config = mergeObject(conf, {
            shape: 'group',
        });
        super(playground, config);
    }

    init() {
        super.init();

        let clockConfig = deepCopy(uiConfig.clock.image);
        clockConfig.shape = "sprite";
        this._clock = new _Entity(this._playground, clockConfig);
        this._clock.init();
        this.addChild(this._clock);

        let textConfig = deepCopy(uiConfig.clock.text);
        textConfig.shape = "text";
        textConfig.text = "00:00";
        this._timeText = new _Entity(this._playground, textConfig);
        this._timeText.init();
        this.addChild(this._timeText);
    }

    start() {
        this._isStart = true;
        this._startTime = TimeLine.current;
    }

    //%02d
    formatNumber(x) {
        let s = x.toString();
        if (s.length < 2)
            s = '0' + s;
        return s;
    }

    refresh() {
        let time = TimeLine.current - this._startTime;
        time = Math.floor(time / 1000);
        if (time > 3599)
            time = 3599;
        let m = Math.floor(time / 60);
        let s = time % 60;
        this._timeText._entity.content = this.formatNumber(m)+':'+this.formatNumber(s);
    }
}

export {_ClockItem};