class _Wonder {
    constructor() {
        this.init = this.init.bind(this);
    }
    /**
     * wonder painter的初始化
     * @param {*} sign 生成的签名，用以验证身份
     */
    init(sign) {
        // Promise函数里的this不是_Wonder的this
        let t = this;
        return new Promise(function (resolve, reject) {
            // initialize WonderPainter and wp model
            // console.log('t', t);
            if (typeof global === 'undefined' || !global.isTesting)
                myWonderPainter = WonderPainter
                else {
                  var myWonderPainter = global.WonderPainter
                }
            t._app = new myWonderPainter.App(sign, function onAppCreated(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log('App created.');
                    t._models = t._app.getModelsInfo();
                    // console.log(t._models);
                    resolve();
                }
            });
        })
    }

    /**
     * 生成一个WonderPainter的精灵，通过resolve(sprite)返回
     * @param {string} name 精灵类型名
     * @param {string} imagePath 精灵的图片的存储路径, 是与html的相对路径
     * @returns {Promise<any>}
     */
    createSprite(id, imagePath) {
        // Promise函数里的this不是_Wonder的this
        console.log('createSprite', imagePath);
        let t = this;
        return new Promise(function (resolve, reject) {
            if (!t._app) {
                reject("Should call appInit(sign) first");
                return;
            }
            // find the index of the name
            let modelIDX = -1;
            for (let i = 0; i < t._models.length; i++) {
                if (t._models[i].id === id) {
                    modelIDX = i;
                    break;
                }
            }
            if (modelIDX === -1) {
                reject("No model " + id);
                return;
            }
            t._app.createModel(t._models[modelIDX].id, function onModelCreated(err, model) {
                if (err) {
                    reject("Error in createModel: " + err);
                } else {
                    console.log('Model created: ' + name);
                    // Create the sprite
                    let input = new Image();
                    //let imgsrc = '/images/' + name + '.png';
                    input.crossOrigin = 'Anonymous';
                    input.onload = function onInputLoaded() {
                        let inputCvs = document.createElement('canvas');
                        document.getElementById('testdiv').appendChild(inputCvs);
                        // 以下两个参数是乱设的
                        inputCvs.width = 500;
                        inputCvs.height = 500;
                        inputCvs.getContext('2d').drawImage(this, 0, 0);
                        let image = inputCvs.toDataURL('image/jpg');
                        inputCvs.parentNode.removeChild(inputCvs);
                        model.createSprite(image, {
                            fromScreen: true,
                            fps: 24
                        }, function onSpriteCreated(err, sprite) {
                            if (err) {
                                reject("Error in createSprite: " + err);
                            } else {
                                console.log('Sprite created');
                                // console.log(sprite);
                                resolve(sprite);
                            }
                        });
                    };
                    input.onerror = function onInputFailLoad() {
                        reject("Fail to load image: " + imagePath);
                    };
                    input.src = imagePath;
                }
            });
        });
    }
}

let WP = new _Wonder();

export {
    WP
}
