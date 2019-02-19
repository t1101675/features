class _Wonder {
    constructor() {
    }

    init(sign) {
        return new Promise(function (resolve, reject) {
            // initialize WonderPainter and wp model
            resolve();
        })
    }

    createSprite(id, imagePath) {
        // Promise函数里的this不是_Wonder的this
        let t = this;
        return new Promise(function (resolve, reject) {
            resolve( {
                inTestMode : true, 
                position: {
                    set(x, y) {
                        //do nothing
                    }
                },
                scale: {
                    x: 1,
                    y: 1,
                    set(x, y) {
                        //do nothing
                    }
                },
                alpha: 1,
                play: function (annimation, callBack) {
                    setTimeout(callBack, 100);
                }
            })
        });
    }
}

let WP_test = new _Wonder();

export {WP_test}
