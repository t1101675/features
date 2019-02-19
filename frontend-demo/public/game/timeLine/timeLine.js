/**
 * 用于获得时间的类
 * 所有时间单位为ms
 */
class _TimeLine {
    constructor() {
        this._startTime = Date.now();
        this._current = this._lastRefresh = 0;
    }

    /**
     * @returns {number} start()后经过的时间间隔
     */
    get current() {
        return this._current;
    }

    /**
     * @returns {number} 距离上一次refresh的时间间隔
     */
    get interval() {
        return this._current - this._lastRefresh;
    }

    start() {
        this._startTime = this._current = Date.now();
        this._lastRefresh = 0;
    }

    /**
     * 当每次refresh时调用以计算时间
     */
    refresh() {
        if (this._lastRefresh === 0) {
            this._lastRefresh = this._current = Date.now();
        } else {
            this._lastRefresh = this._current;
            this._current = Date.now();
        }
    }
}

let TimeLine = new _TimeLine();

export {TimeLine};