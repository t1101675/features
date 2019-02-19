import {_Entity} from "./entity.js";
import {WP} from "../wonder/wonder.js";
import {WP_test} from "../wonder/wonder-test.js";
import {heroLocalConfig, attackName} from "../control/config.js"
import {sleep} from "../support/support.js";

class _Hero extends _Entity {
    /**
     * @param playground hexi场景
     * @param config 配置
     */
    constructor(playground,  config) {
        super(playground, config);
    }

    init() {
        let t = this;
        return new Promise(async (resolve, reject) => {
            t._width = t._config.width || 100;
            t._height = t._config.height || 100;
            t._name = t._config.name;

            t._entity = t._playground.group();
            t._entity._z = 50;
            t.positionX = t._config.x || 0;
            t.positionY = t._config.y || 0;

            t._backGround = new _Entity(t._playground, {
                width: t._config.width,
                height: t._config.height,
                shape: 'rectangle',
                color: 'yellow',
            })
            t._backGround.init();
            t._backGround.visible = false;
            t.addChild(t._backGround);
            t.visible = false; //英雄默认不可见
            if (typeof global === 'undefined' || global.isTesting === undefined) {
                WP.createSprite(heroLocalConfig.heroWpID, this._config.image)
                .then(sprite => t._initAdorns(sprite, resolve))
                .catch(reject);
            } else {
                WP_test.createSprite(heroLocalConfig.heroWpID, this._config.image)
                .then(sprite => t._initAdorns(sprite, resolve))
                .catch(reject);
            }

        })
    }

    _initAdorns(sprite, resolve) {
        this._initSprite(sprite);
        this._initBlood(this._width, heroLocalConfig.bloodHeight);
        this._initName(this.name);
        this._initFuzzy();
        this._initProperty();
        this._initPower();
        this._initRound();
        this.blood = this._config.blood;
        this._entity.children.sort((a, b) => (a._z || 0) - (b._z || 0));
        this._property = 0;
        resolve();
    }
    /**
     * 加入血条
     * @param {number} w 血条宽度
     * @param {number} h 血条高度
     */
    _initBlood(w, h) {
        this._bloodBack = new _Entity (this._playground, {
            width: w,
            height: h,
            x: 0,
            y: heroLocalConfig.bloodY,
            color: 'black'
        })
        this._bloodBack.init();
        this.addChild(this._bloodBack);

        this._bloodFront = new _Entity (this._playground, {
            width: w,
            height: h,
            x: 0,
            y: heroLocalConfig.bloodY,
            color: 'red'
        })
        this._bloodFront.init();
        this.addChild(this._bloodFront);
    }

    /**
     * 加入SDK生成的精灵
     * @param sprite SDK生成的精灵
     */
    _initSprite(sprite) {
        sprite.position.set(heroLocalConfig.heroX,heroLocalConfig.heroY);
        // magic number
        sprite.scale.set(this._width/300, this._width/400);
        // WARNING wp.sprite没有继承自entity
        this._entity.addChild(sprite);
        this._sprite = sprite;
        this._sprite._z = 100;
        let t = this;
        sprite.onPlayEnd = function onPlayEnd(err, animation) {
            if (err) {
                console.log(err);
                return;
            }
            if (!(t._visibleRequired === undefined))
                t._entity.visible = t._visibleRequired;
            t._play('raw');
        }
        this._play('raw');
    }

    _initName(name) {
        this._nameEntity = new _Entity(this._playground, {
            shape: 'text',
            text: name,
            textColor: 'orange',
            textFont: '18px',
            x: 0,
            y: heroLocalConfig.nameY,
        })
        this._nameEntity.init();
        this._nameEntity.positionX = this._width/2 - this._nameEntity.centerX;
        console.log(this._nameEntity.centerY); // for test coverage
        this.addChild(this._nameEntity);
    }

    /**
     * 加入眩晕效果
     */
    _initFuzzy() {
        let fuzzy = this._playground.filmstrip(heroLocalConfig.fuzzy.image, 
                                               heroLocalConfig.fuzzy.imageWidth,
                                               heroLocalConfig.fuzzy.imageHeight);
        this._fuzzy = new _Entity(this._playground, {
            shape: 'sprite',
            image: fuzzy,
            width: heroLocalConfig.fuzzy.width,
            height: heroLocalConfig.fuzzy.height,
            x: heroLocalConfig.fuzzy.x,
            y: heroLocalConfig.fuzzy.y,
        })
        this._fuzzy.init();
        this.addChild(this._fuzzy);
        this._fuzzy._entity._z = 200;
        this._fuzzy._entity.playAnimation([0, 7]);
        this._fuzzy.visible = false;
    }

    /**
     * 蓄力效果
     */
    _initPower() {
        let power = this._playground.filmstrip('/images/power.png', 667, 432);
        this._power = new _Entity(this._playground, {
            shape: 'sprite',
            image: power,
            width: 120,
            height: 100,
            x: -15,
            y: 23,
        });
        this._power.init();
        this._power.visible = false;
        this.addChild(this._power);
        this._power._entity.playAnimation([0, 7]);
    }

    _initProperty() {
        this._propertyItem = new Array(heroLocalConfig.property.total);
        for (let i = 0; i < heroLocalConfig.property.total; i++) {
            this._propertyItem[i] = new _Entity(this._playground, {
                shape: 'sprite',
                x: 0,
                y: 0,
                width: this._config.width,
                height: this._config.height,
                image: heroLocalConfig.background[i],
            });
            this._propertyItem[i].init();
            this.addChild(this._propertyItem[i]);
            this._propertyItem[i].visible = false;
        }
    }

    /**
     * 周围喷一圈火
     */
    _initRound() {
        this._roundFire = new Array(heroLocalConfig.property.total);
        for (let i = 0; i < heroLocalConfig.property.total; i++) {
            this._roundFire[i] = new _Entity(this._playground, {
                shape: 'sprite',
                image: heroLocalConfig.round[i].image,
                width: this._config.width,
                height: this._config.height,
                x: 0,
                y: 0,
            })
            this._roundFire[i].init();
            this.addChild(this._roundFire[i]);
            this._roundFire[i].alpha = 0;
            this._roundFire[i]._entity._z = 300;
        }
        this._roundFireScale0 = {
            x: this._roundFire[0].scaleX,
            y: this._roundFire[0].scaleY,
        }
        this._roundFireCenter = {
            x: this._roundFire[0].centerX,
            y: this._roundFire[0].centerY,
        }
    }

    _getFireScaleX(scale) {
        return scale * this._roundFireScale0.x;
    }

    _getFireScaleY(scale) {
        return scale * this._roundFireScale0.y;
    }

    _getFireX(scale) {
        return this._roundFireCenter.x - this._config.width/2 * scale;
    }

    _getFireY(scale) {
        return this._roundFireCenter.y - this._config.height/2 * scale;
    }

    get name() {
        return this._name;
    }

    _play(animation) {
        let s = this._sprite;
        this._animation = animation;
        s.play(animation, s.onPlayEnd);
    }

    /**
     * 开始播放攻击动画
     * @param {number} id 攻击的编号
     */
    _startAttack(id, dir) {
        switch (id) {
            case 2: {
                this._play(attackName[id]);
                let t = this;
                let property = t._property;
                sleep(200).then(
                    () => {
                        let x = dir == 'left' ? -30 : 130;
                        this._playground.createParticles(x, 100, function () {
                            return t._playground.sprite(heroLocalConfig.stars[property]);
                        }, this._entity, 100, 0, true, 4.4, 5.0, 0, 35, 2, 4);
                    }
                )
                break;
            }
            case 3: {
                this._play(attackName[id]);
                let t = this;
                let property = t._property;
                sleep(50).then(
                    () => {
                        let conf = heroLocalConfig.round[property];
                        let scale0 = 0.5, scale1 = conf.scale, transTime = conf.scale*150;
                        t._roundFire[property].positionX = t._getFireX(scale0);
                        t._roundFire[property].positionY = t._getFireY(scale0);
                        t._roundFire[property].scaleX = t._getFireScaleX(scale0);
                        t._roundFire[property].scaleY = t._getFireScaleY(scale0);
                        t._roundFire[property].alpha = 1;
                        
                        t._roundFire[property].attrTransit(
                            'positionX',
                            t._getFireX(scale1),
                            transTime
                        );
                        t._roundFire[property].attrTransit(
                            'positionY',
                            t._getFireY(scale1),
                            transTime
                        );
                        t._roundFire[property].attrTransit(
                            'scaleX',
                            t._getFireScaleX(scale1),
                            transTime
                        );
                        t._roundFire[property].attrTransit(
                            'scaleY',
                            t._getFireScaleY(scale1),
                            transTime
                        );
                        t._roundFire[property].attrTransit(
                            'alpha',
                            0,
                            transTime
                        );
                    }
                )
                break;
            }
            default: {
                this._play(attackName[id]);
            }
        }
    }

    /**
     * 开始播放被打动画
     * @param {number} id 攻击的编号
     */
    _startAttacked() {
        let t = this;
        sleep(400).then(() => t.attrTransit('alpha', 0.5, 200, () => t.attrTransit('alpha', 1, 200)));
        //this._play(attackedName[id]);
    }

    goDie() {
        this._play('die');
    }

    /**
     * 在播放除了raw以外的动画的时候不隐藏,但记下需求，播完隐藏
     */
    set visible(val) {
        this._visibleRequired = val;
        if (this._animation != 'raw') {
            super.visible = true;
            return;
        }
        super.visible = val;
    }

    /**
     * 将精灵的血量置为x
     * @param {number} x
     */
    _setBlood(x)  {
        this.blood = x;
        if (this._bloodFront === undefined)
            return;
        this._bloodFront.scale.x = x / this._config.blood;
    }

    /**
     * 根据精灵移动方向进行翻转
     */
    _updateDirection() {
        if ( (this._entity.vx > 0 && this._sprite.scale.x > 0) ||
             (this._entity.vx < 0 && this._sprite.scale.x < 0) )
            this._sprite.scale.x *= -1;
    }

    /**
     * 更新属性信息
     * 属性值应当 >= 0
     */
    _updateProperty(data) {
        if (this._propertyItem === undefined)
            return;
        let id = 0, mx = 0;
        for (let i = 0; i < heroLocalConfig.property.total; i++) {
            if (data[i] > mx) {
                mx = data[i];
                id = i;
            }
        }
        this._property = id;
        for (let i = 0; i < heroLocalConfig.property.total; i++)
            this._propertyItem[i].visible = (id == i);

    }

    // 根据收到的TICK更新精灵信息
    update(data) {
        this._entity.x = data.x;
        this._entity.y = data.y;
        this._entity.vx = data.vx;
        this._entity.vy = data.vy;
        let upperZero = (isUpper, raw) => {
            if (isUpper == raw > 0)
                return raw;
            else
                return -raw;
        }
        if (data.attack.length != 0) {
            this._sprite.scale.x = upperZero(data.attack[0].dir == 'left', this._sprite.scale.x);
            this._startAttack(data.attack[0].id, data.attack[0].dir);
        }
        if (data.attacked.length != 0) {
            //this._sprite.scale.x = upperZero(data.attacked[0].dir == 'left', this._sprite.scale.x)
            this._startAttacked();
        }
        this._setBlood(data.hp);
        this._fuzzy.visible = data.fuzzy;
        this._power.visible = data.power;
        this._updateProperty(data.property);
        this._updateDirection();
    }

    refresh() {
        this._entity.x += this._entity.vx;
        this._entity.y += this._entity.vy;
        this._refreshAttr();
        for (let i in this._roundFire)
            this._roundFire[i].refresh();
    }

    get alpha() {
        return this._sprite.alpha;
    }

    set alpha(x) {
        this._sprite.alpha = x;
    }
}

export {_Hero};
