import {
    mount,
    createLocalVue
} from '@vue/test-utils'
import {
    GameMain
} from "../public/game/gameMain.js";
import {
    sleep
} from "../public/game/support/support.js";
import {
    KeyBoard
} from "../public/game/control/keyBoard.js";
import {
    _SoundButton
} from "../public/game/display/ui/soundButton.js";

import flushPromises from 'flush-promises'
import {
    resolve
} from 'path';
var WonderPainter = {
    App: {
        sign: function (appKey, appSecret) {
            return {
                key: appKey,
                secret: appSecret,
            }
        }
    }
};
global.WonderPainter = WonderPainter

var isTesting = true;

global.isTesting = true
var Hexi = {};
global.Hexi = {}
class TestSprite {
    constructor(config) {
        this.scale = {x: 1, y: 1};
        this.position = {x: 0, y: 0};
        this.visible = true;
        this.alpha = 1;
        this.height = 100;
        this.width = 100;
        this.x = 0;
        this.y = 0;
        for (let i in config)
            this[i] = config[i];
        this.children = [];
        this.onEvents = {};
    }

    addChild(s) {
        this.children.push(s);
    }
    
    get centerX() {
        return this.x + this.width/2;
    }

    get centerY() {
        return this.y + this.height/2;
    }

    on(event, func) {
        this.onEvents[event] = func;
    }

    onEvent(event) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.onEvent[event]);
        if (typeof(this.onEvent[event]) != 'undefined')
            this.onEvent[event]();
    }

}

global.TestSprite = TestSprite
class TestSound {
    constructor(music) {
        this.music = music;
        this.on = false;
    }
    play() {
        this.on = true;
    }
    pause() {
        this.on = false;
    }


}

global.TestSound = TestSound

let globalsleep = time => new Promise(resolve => setTimeout(resolve, time));
global.sleep = globalsleep

function startHexi() {
    while (true) {
        return new Promise(async (resolve, reject) => {
            while (true) {
                if (typeof(Hexi.state) != 'undefined')
                    Hexi.state();
                await sleep(15);
            }
        })
    }
}

global.startHexi =  startHexi

function hexi(width, height, callBack, list) {
    console.log(list);
    setTimeout(callBack, 10);
    Hexi.width = width;
    Hexi.height = height;
    Hexi.start = () => {
        startHexi();
    }
    Hexi.group = () => {
        return new TestSprite({
            type: 'group'
        });
    }
    Hexi.stage = new Hexi.group();
    Hexi.rectangle = (width, height, color) => {
        let t = new TestSprite({
            type: 'rectangle',
            width: width,
            height: height,
            color: color,
        });
        Hexi.stage.addChild(t);
        return t;
    }
    Hexi.circle = (diameter, color) => {
        let t = new TestSprite({
            type: 'circle',
            diameter: diameter,
            color: color,
        })
        Hexi.stage.addChild(t);
        return t;
    }
    Hexi.text = (text, font, color) => {
        let t = new TestSprite({
            type: 'text',
            content: text,
            font: font,
            color: color,
        })
        Hexi.stage.addChild(t);
        return t;
    }
    Hexi.sprite = (image, a, b, c, width, height) => {
        let t = new TestSprite({
            type: 'sprite',
            image: image,
            width: width,
            height: height,
            playAnimation: (para) => { console.log('play annimation', para); },
        })
        Hexi.stage.addChild(t);
        return t;
    }
    Hexi.sound = (music) => {
        let t = new TestSound(music);
        Hexi.stage.addChild(t);
        return t;
    }
    Hexi.createParticles = (a, b, c) => {
        if (typeof(c) != "undefined")
            c();
        return {};
    }
    Hexi.filmstrip = (img, dx, dy) => {
        return {
            image: img,
            dx: dx,
            dy: dy,
        }
    }
    return Hexi;
}
global.hexi = hexi

describe('public', () => {
    it('public', (done) => {
        GameMain.start();
        let keyBoard = KeyBoard;
        sleep(500).then(() => {
            //console.log('Keyboard', KeyBoard);
            let keyOrder = ['keyUp', 'keyDown', 'keyLeft', 'keyRight', 'keyA', 'keyS', 'keyD', 'keyF',
                'keyZ', 'keyX', 'keyC', 'keyN', 'keyM', 'keyL', 'keyK', 'keyJ', 'keyH', 'keyG', 'keyR', 'keyP', 'keyO', 'keyV', 'keyB'
            ];
            for (let i in keyOrder) {
                let key = keyOrder[i];
                sleep(i * 500).then(() => keyBoard.key(key)._press())
                sleep(i * 500 + 500).then(() => keyBoard.key(key)._release());
            }
            sleep(11000).then(() => {
                let soundButton = new _SoundButton(global.Hexi, {});
                soundButton.init();
                soundButton._onButton._entity.onEvent('click');
                soundButton._offButton._entity.onEvent('click');
            })
            setTimeout(done, 15000)
        });
    })
})