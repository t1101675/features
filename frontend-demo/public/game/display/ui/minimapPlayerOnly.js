import {_UiScene} from './uiScene.js';
// import {deepCopy} from '../../support/support.js';
import {minimapPlayerOnlyConfig} from '../../control/config.js';
import {_Entity} from '../entity.js';
//import { updateByID, updateSingleEntity } from '../../support/updateByID.js';

//配置，包括player, scene, walls, heros, props

class _MinimapPlayerOnly extends _UiScene {
    constructor(playground, conf) {
        let config = {
            shape: 'rectangle',
            color: minimapPlayerOnlyConfig.backColor,
            height: minimapPlayerOnlyConfig.pixelHeight*conf.scene.roomRow,
            width: minimapPlayerOnlyConfig.pixelWidth*conf.scene.roomColumn,
            roomRow: conf.scene.roomRow,
            roomColumn: conf.scene.roomColumn,
            roomTotal: conf.scene.roomRow * conf.scene.roomColumn,
            roomWidth: conf.scene.width,
            roomHeight: conf.scene.height,
            playerID: conf.player.id,
            x: minimapPlayerOnlyConfig.x,
            y: minimapPlayerOnlyConfig.y,
            roomID: conf.roomConfig.roomId,
        }
        super(playground, config);
    }

    init() {
        super.init();
        this.alpha = minimapPlayerOnlyConfig.alpha;
        this._bounds = Array();
        //画横线
        for (let i = 0; i <= this._config.roomRow; i++) {
            let bound = new _Entity(this._playground, {
                shape: 'rectangle',
                color: 'black',
                width: this._config.width+minimapPlayerOnlyConfig.lineWidth,
                height: minimapPlayerOnlyConfig.lineWidth,
                x: -minimapPlayerOnlyConfig.lineWidth/2,
                y: i*minimapPlayerOnlyConfig.pixelHeight-minimapPlayerOnlyConfig.lineWidth/2,
            })
            bound.init();
            this._bounds.push(bound);
            this.addChild(bound);
        }
        //画竖线
        for (let i = 0; i <= this._config.roomColumn; i++) {
            let bound = new _Entity(this._playground, {
                shape: 'rectangle',
                color: 'black',
                width:  minimapPlayerOnlyConfig.lineWidth,
                height: this._config.height+minimapPlayerOnlyConfig.lineWidth,
                x: i*minimapPlayerOnlyConfig.pixelWidth-minimapPlayerOnlyConfig.lineWidth/2,
                y: -minimapPlayerOnlyConfig.lineWidth/2,
            })
            bound.init();
            this._bounds.push(bound);
            this.addChild(bound);
        }
        // 画矩形
        this._rects = Array(this._config.roomTotal);
        for (let i = 0; i < this._config.roomTotal; i++) {
            this._rects[i] = new Array(minimapPlayerOnlyConfig.roomColor.length);
            for (let j = 0; j < minimapPlayerOnlyConfig.roomColor.length; j++) {
                this._rects[i][j] = new _Entity(this._playground, {
                    shape: 'rectangle',
                    color: minimapPlayerOnlyConfig.roomColor[j],
                    width: minimapPlayerOnlyConfig.pixelWidth - minimapPlayerOnlyConfig.lineWidth,
                    height: minimapPlayerOnlyConfig.pixelHeight - minimapPlayerOnlyConfig.lineWidth
                });
                this._rects[i][j].init();
                this.addChild(this._rects[i][j]);
                this._rects[i][j].positionX = this._getRoomX(i);
                this._rects[i][j].positionY = this._getRoomY(i);
                if (j != 0) {
                    this._rects[i][j].visible = false;
                }
            }
        }
        
        this._player = new _Entity(this._playground, {
            shape: 'circle',
            color: minimapPlayerOnlyConfig.playerColor,
            diameter: minimapPlayerOnlyConfig.playerDiameter,
        })
        this._player.init();
        this.addChild(this._player);
        this._player.positionX = this._getPlayerX();
        this._player.positionY = this._getPlayerY();

        this.spaceTo(minimapPlayerOnlyConfig.width, minimapPlayerOnlyConfig.height);
    }

    changeTo(roomID) {
        this._config.roomID = roomID;
        this._player.positionX = this._getPlayerX();
        this._player.positionY = this._getPlayerY();
    }

    //对应格子的中间位置
    _getPlayerX() {
        return (this._config.roomID % this._config.roomColumn + 0.5)*minimapPlayerOnlyConfig.pixelWidth-minimapPlayerOnlyConfig.playerDiameter/2;
    }
    //对应格子的中间位置
    _getPlayerY() {
        return (Math.floor(this._config.roomID / this._config.roomColumn) + 0.5)*minimapPlayerOnlyConfig.pixelHeight-minimapPlayerOnlyConfig.playerDiameter/2;
    }

    _getRoomX(id) {
        return (id % this._config.roomColumn)*minimapPlayerOnlyConfig.pixelWidth + minimapPlayerOnlyConfig.lineWidth/2;
    }

    _getRoomY(id) {
        return (Math.floor(id / this._config.roomColumn))*minimapPlayerOnlyConfig.pixelHeight+minimapPlayerOnlyConfig.lineWidth/2;
    }

    update(data) {
        if (typeof(this._rects) != 'undefined') {
            let rooms = data.rooms;
            for (let i in rooms) {
                for (let j in minimapPlayerOnlyConfig.roomColor)
                    this._rects[i][j].visible = (rooms[i] == j);
            }
        }
    }
}

export {_MinimapPlayerOnly};