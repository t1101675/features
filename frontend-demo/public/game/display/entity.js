import {TimeLine} from "../timeLine/timeLine.js";
// import {deepCopy} from "../support/support.js";

/**
 * 这是*实体*的类
 */
class _Entity {
    constructor(playground, config) {
        //记录一个对于hexi场景的引用
        this._playground = playground;

        //配置信息
        this._config = config;

        //为了实现属性动画，记录每个属性的目标值
        this._destAttr = {};
        //为了实现动画，记录属性变化的速度（单位1/ms）
        this._attrAnimSpeed = {};
        //属性动画播放完毕后要做的事情
        this._onAttrEnd = {};
    }

    /**
     * 必须要在创建后调用init()
     */
    init() {
        this._initShape();
    }

    /**
     * 创建在hexi场景中的物体
     * @private
     */
    _initShape() {
        //基本属性
        this._width = this._config.width || 100;
        this._height = this._config.height || 100;

        //检查类型
        switch (this._config.shape || 'rectangle') {
            case 'rectangle':
                this._entity = this._playground.rectangle(
                        this._width, this._height,
                        this._config.color);
                break;
            // case 'circle':
            //     console.log(this._config);
            //     this._entity = this._playground.circle(
            //         this._config.diameter,
            //         this._config.color || 'black'
            //     );
            //     break;
            case 'text':
                this._entity = this._playground.text(
                        this._config.text || 'null text',
                        this._config.textFont,
                        this._config.textColor
                );
                break;
            case 'group':
                this._entity = this._playground.group();
                break;
            case 'sprite':
                this._entity = this._playground.sprite(
                    this._config.image, undefined, undefined, undefined,
                    this._config.width, this._config.height);
                break;
            case 'circle':
                this._entity = this._playground.circle(
                    this._config.diameter,
                    this._config.color || 'black'
                );
                break;
            default:
                console.log('_Entity._initShape: unsupported entity shape: ' + this._config.shape + ', using rectangle');
                this._entity = this._playground.rectangle(
                        this._width, this._height,
                        this._config.color || 'red');
        }

        this.positionX = this._config.x || 0;
        this.positionY = this._config.y || 0;

        //z-index写在hexi sprite里面
        this._entity._z = this._config.z || 0;
    }

    /**
     * 添加子实例
     * @param child 一个_Entity实例
     */
    addChild(child) {
        this._entity.addChild(child._entity);
        child._parent = this;
    }


    /**
     * 将某一属性经动画过渡进行变化
     * @param attr 属性的名称
     * 包括：scale, ...
     * @param val 目标数值
     * @param time 变化时间，单位毫秒
     */
    attrTransit(attr, val, time, onAttrEnd) {
        // console.log('attr', attr, val, time);
        this._destAttr[attr] = val;
        this._attrAnimSpeed[attr] = (val - this[attr]) / time;
        this._onAttrEnd[attr] = onAttrEnd;
    }

    /**
     * 每一帧都调用一次refresh
     * 虚函数
     */
    refresh() {
        this._refreshAttr();
    }

    /**
     * 更新场景的属性
     * @private
     */
    _refreshAttr() {
        for (let attr in this._destAttr) {
            if (Math.abs(this[attr] - this._destAttr[attr]) <=
                    Math.abs(this._attrAnimSpeed[attr]) * TimeLine.interval) {
                this[attr] = this._destAttr[attr];
                delete this._destAttr[attr];
                if (typeof(this._onAttrEnd[attr]) != "undefined") {
                    // 必须先delete再运行，因为运行的时候会新建*[attr]对象
                    let callback = this._onAttrEnd[attr];
                    delete this._onAttrEnd[attr];
                    callback();
                }
            } else {
                this[attr] = this[attr] + this._attrAnimSpeed[attr] * TimeLine.interval;
            }
        }
    }

    update(data) {
        const keyInData = ['x', 'y'];
        const keyInEntity = ['positionX', 'positionY'];
        for (let i in keyInData) {
            this[keyInEntity[i]] = data[keyInData[i]];
        }
    }


    /**
     * 将界面大小改为width*height,利用scale实现，不改变坐标系统
     * @param {number} width 
     * @param {number} height 
     */
    spaceTo(width, height) {
        this.scaleX = width/this._entity.width;
        this.scaleY = height/this._entity.height;
    }

    /**
     * @param {boolean} val 表示可见性
     */
    set visible(val) {
        this._entity.visible = val;
    }
    
    get scale() {
        return this._entity.scale;
    }
    
    get scaleX() {
        return this._entity.scaleX;
    }

    get scaleY() {
        return this._entity.scaleY;
    }

    set scaleX(val) {
        this._entity.scaleX = val;
    }
    
    set scaleY(val) {
        this._entity.scaleY = val;
    }

    get alpha() {
        return this._entity.alpha;
    }

    set alpha(val) {
        this._entity.alpha = val;
    }

    get positionX() {
        return this._entity.position.x;
    }

    set positionX(val) {
        this._entity.position.x = val;
    }

    get positionY() {
        return this._entity.position.y;
    }

    set positionY(val) {
        this._entity.position.y = val;
    }

    get centerX() {
        return this._entity.centerX;
    }

    get centerY() {
        return this._entity.centerY;
    }
}

export {_Entity}