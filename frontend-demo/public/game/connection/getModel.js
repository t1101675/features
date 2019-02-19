var app = undefined;
var models = undefined;

function wpInit(sign) {
    return new Promise(function (resolve, reject) {
        // initialize WonderPainter and wp model
        if(typeof global === 'undefined' || global.isTesting)
            myWonderPainter = WonderPainter
        else
            var myWonderPainter = global.WonderPainter
        app = new myWonderPainter.App(sign, function onAppCreated(err) {
            if (err) {
                reject(err);
            } else {
                console.log('App created.');
                // lst = app.getModelList();
                // console.log(lst);
                models = app.getModelsInfo();
                console.log(models);
                resolve();
            }
        });
    })
}


function getSprite(name) {
    return new Promise(function (resolve, reject) {
        // Should have a name.png in images/
        // The canvas's id is "input"
        // If function createModel is slow, getModel function can be improved by
        // first create a model, and then create the sprite from the model
        // callback(err, callbackPara, sprite)
        if (!app) {
            reject("Should call appInit(sign) first");
            return;
        }
        // console.log(app);
        // find the index of the name
        let modelIDX = -1;
        for (let i = 0; i < models.length; i++) {
            if (models[i].name === name) {
                modelIDX = i;
                break;
            }
        }
        if (modelIDX === -1) {
            reject("No model named " + name);
            return;
        }
        app.createModel(models[modelIDX].id, function onModelCreated(err, model) {
            if (err) {
                reject("Error in createModel: " + err);
            } else {
                console.log('Model created: ' + name);
                // Create the sprite
                let input = new Image();
                let imgsrc = '/images/' + name + '.png';
                input.onload = function onInputLoaded() {
                    let inputCvs = document.createElement('canvas');
                    document.getElementById('testdiv').appendChild(inputCvs);
                    // console.log(inputCvs);
                    inputCvs.width = 277;
                    inputCvs.height = 547;
                    inputCvs.getContext('2d').drawImage(this, 0, 0);
                    let image = inputCvs.toDataURL('../image/png');
                    inputCvs.parentNode.removeChild(inputCvs);
                    console.log('Creating sprite');
                    model.createSprite(image, function onSpriteCreated(err, sprite) {
                        if (err) {
                            reject("Error in createSprite: " + err);
                        } else {
                            console.log('Sprite created');
                            console.log(sprite);
                            resolve(sprite);
                        }
                    });
                };
                input.onerror = function onInputFailLoad() {
                    reject("Fail to load image: " + imgsrc);
                };
                input.src = imgsrc;
            }
        });
    });
}

export {wpInit, getSprite};
