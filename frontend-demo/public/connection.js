import {Server} from "../_server/server.js";
import {sleep} from "../support/support.js";
import {GameMain} from "../gameMain.js";

//简单的等待函数，用法：await sleep(ms);
// let sleep = time => new Promise(resolve => setTimeout(resolve, time));

/**
 * 这个类用于处理连接，以及保存一些信息
 * _receive()和_send()需要用pomelo的方法
 */
class _Connection {
    constructor() {
        //receive收到的data
        this._data = {};
        // this._sendingTick = false;
        // this._sendTick(1000);
    }

    /***************
     PUBLIC INTERFACE
     ***************/

    /**
     * 从服务器请求信息
     * 限制：短时间内请求相同内容有可能导致某一次请求超时
     * @param name 信息的名称
     * @param timeout 超时时限
     * @param check_interval 每次查收的间隔
     * @returns {Promise<any>}
     */
    getData(name, timeout = 3000, check_interval = 100) {
        return new Promise(async (resolve, reject) => {

            delete this._data[name];

            this._send({
                type: 'GET',
                name: name,
            });

            let startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                if (this._data[name]) {
                    let result = this._data[name];
                    delete this._data[name];
                    console.log('data received');
                    console.log(result);
                    resolve(result);
                    break;
                }
                await sleep(check_interval);
            }
            reject('timeout on fetching ' + name);
        });
    }

    // startSendTick() {
    //     this._sendingTick = true;
    // }

    // endSendTick() {
    //     this._sendingTick = false;
    // }

    postData(name, data) {
        this._send({
            type: 'POST',
            name: name,
            data: data||{}
        })
    }

    /******
     PRIVATE
     ******/


    /**
     * 每当收到数据包时被触发，会相应地调用不同receive方法
     * @param pack 服务器传来的数据包
     * @private
     */
     _recv(pack) {
         //console.log('pack received', pack);
         //这里先默认数据包是完整且合法的
         switch (pack.type) {
             case 'RETURN':
                 this._receiveData(pack.name, pack.data);
                 break;
             case 'TICK':
                 this._receiveTick(pack);
                 break;
             // 通信协议变更，现在没有Post要接收
             // case 'POST':
             //     this._receivePost(pack.name, pack.data);
             //     break;
         }
     }

    /**
     * 使用pomelo的方法发送数据包
     * @param pack
     * @private
     */
     _send(pack) {
         // if (Server === undefined) {
         //     console.warn('Server is undefined');
         //     return;
         // }
         // //console.log('pack send', pack);
         // Server.receive(pack);
         var route;
         switch(pack.name) {
           case "sceneConfig":
           case "clientReady":
             route = "game.gameHandler.startConfig";
             break;
           case "keyInfo":
             route = "game.gameHandler.key";
             break;
           case "sdk":
             Server.receive(pack);
             return;
           default:
             console.log("no such name");
             return;
         }
         pomelo.request(route, pack, function(data) {
           // console.log(data);
           this._recv(data);
         }.bind(this));
     }

    _receiveData(name, data) {
        this._data[name] = data;
    }

    // 通信协议变更，现在server不发送游戏开始
    // _receivePost(name, data) {
    //     switch (name) {
    //         case 'gameStart':
    //             // this.startSendTick();
    //             break;
    //     }
    // }

    _receiveTick(pack) {
        if (pack.code != 200) {
            console.error(pack.msg);
            return;
        }
        switch (pack.name) {
            case 'gameInfo': {
                GameMain.update(pack.data);
                break;
            }
            case 'someoneLose': {
                GameMain.someoneLose(pack.data.loser);
                break;
            }
            case 'win': {
                GameMain.winGame(pack.data.score);
                break;
            }
            case 'lose': {
                GameMain.loseGame(pack.data.score);
                break;
            }
        }

    }

    /**
     * 改逻辑了，暂时用不到这个函数了
     * 在对象的生命周期内一直运行
     * this._sendingTick 为true的时候发包，为false的时候不发包
     * @param send_interval 发送时间间隔
     */
    // async _sendTick(send_interval) {
    //     console.log('connection send regularly');
    //     while (true) {
    //         await sleep(send_interval); //因为循环中有continue，这句话不能放到while循环最后
    //         if (!this._sendingTick)
    //             continue;
    //         let data = {
    //             downKey: KeyBoard.downKey
    //         }
    //         this._send({
    //             type: 'TICK',
    //             name: 'update',
    //             data: data
    //         })
    //     }
    // }

}

let Connection = new _Connection();

export {Connection}
