import {Connection} from "../connection/connection.js"

class _Key {
    /**
     * 键盘上的一个按键
     * @param {按键的名字} name
     * @param {按键在键盘上的编号} code
     * @param {_KeyBoard} keyBoard 所属的键盘
     */
    constructor(name, code, keyBoard, useful = false) {
        this._name = name;
        this._code = code;
        this._keyBoard = keyBoard;
        this._isDown = false;
        this._enemy = Array(0);
        this.useful = useful;
        this._downHandler = event => {
            if (event.keyCode === this._code) {
                if (this._isDown == false) {
                    this._press();
                }
                event.preventDefault();
            }
        }
        this._upHandler = event => {
            if (event.keyCode === this._code) {
                if (event.keyCode == this._code) {
                    if (this._isDown == true) {
                        this._release();
                    }
                    event.preventDefault();
                }
            }
        }
        if (typeof global !== 'undefined' && global.isTesting) {
        //if (isTesting){
            //console.log('is testing, return');
            return;
        }
        window.addEventListener(
            "keydown", this._downHandler.bind(() => this), false
        );
        window.addEventListener(
            "keyup", this._upHandler.bind(() => this), false
        );
    }

    _press() {
        console.log('pressed', this.name);
        this.isDown = true;
        for (let i=0; i<this._enemy.length; i++) {
            console.log('keyboard up', this._enemy[i].isDown);
            console.log(this._keyBoard.downKey);
            this._enemy[i].isDown = false;
        }
        //this._keyBoard.changed();
        let dict = {}
        dict[this.name] = 'down';
        if (this.useful ||
            (typeof global != 'undefined' && (global.isTesting || global.gameOnly))) {
            Connection.postData('keyInfo', dict);
        }
    }

    _release() {
        this.isDown = false;
        //this._keyBoard.changed();
        let dict = {}
        dict[this.name] = 'up';
        Connection.postData('keyInfo', dict);
    }

    /**
     * 添加一个与它互斥的按键
     * @param {_Key} enemy
     */
    addEnemy(enemy) {
        this._enemy.push(enemy);
    }

    get isDown() {
        return this._isDown;
    }

    set isDown(status) {
        this._isDown = status;
    }

    get name() {
        return this._name;
    }
}

class _KeyBoard {
    /**
     * 开始监控按键
     */
    start() {
        this._keys = {
            keyLeft: new _Key('keyLeft', 37, this, true),
            keyUp: new _Key('keyUp', 38, this, true),
            keyRight: new _Key('keyRight', 39, this, true),
            keyDown: new _Key('keyDown', 40, this, true),
            keyA: new _Key('keyA', 65, this),
            keyS: new _Key('keyS', 83, this),
            keyB: new _Key('keyB', 66, this),
            keyC: new _Key('keyC', 67, this, true),
            keyD: new _Key('keyD', 68, this, true),
            keyF: new _Key('keyF', 70, this, true),
            keyG: new _Key('keyG', 71, this),
            keyH: new _Key('keyH', 72, this),
            keyJ: new _Key('keyJ', 74, this),
            keyK: new _Key('keyK', 75, this),
            keyL: new _Key('keyL', 76, this),
            keyM: new _Key('keyM', 77, this),
            keyN: new _Key('keyN', 78, this),
            keyO: new _Key('keyO', 79, this),
            keyP: new _Key('keyP', 80, this),
            keyR: new _Key('keyR', 82, this, true),
            keyV: new _Key('keyV', 86, this, true),
            keyX: new _Key('keyX', 88, this, true),
            keyZ: new _Key('keyZ', 90, this),
        }
        this._setEnemyPair(this._keys.keyM, this._keys.keyN);
    }

    /**
     * 把两个键设为不能同时按下
     * @param {_Key} key1
     * @param {_Key} key2
     */
    _setEnemyPair(key1, key2) {
        key1.addEnemy(key2);
        key2.addEnemy(key1);
    }

    /**
     * 以数组的形式返回被按下的键的名字
     * WARNING: 是按下的状态，因此左键右键可能同时被按下
     */
    get downKey() {
        let ret = {}
        for (let i in this._keys) {
            let key = this._keys[i];
            ret[key.name] = key.isDown ? 'down' : 'up';
        }
        // console.log('down: ', ret);
        return ret;
    }

    /**
     * 返回代号为name的按键对象
     * @param {string} name
     */
    key(name) {
        return this._keys[name];
    }
}

let KeyBoard = new _KeyBoard;
export {KeyBoard}
