import {_UiScene} from "./uiScene.js";
import {_MinimapPlayerOnly} from "./minimapPlayerOnly.js";
import {_Ranklist} from "./ranklist/ranklist.js";
import {_SoundButton} from "./soundButton.js";
import {_ClockItem} from "./clockItem.js";
import {_PlayerNumber} from "./playerNumber.js";


class _TestUiScene extends _UiScene{
    constructor(playground, config) {
        super(playground, config);
    }

    init() {
        super.init();
        this._minimap = new _MinimapPlayerOnly(this._playground, this._config.sceneConfig);
        this._minimap.init();
        this.addChild(this._minimap);

        this._ranklist = new _Ranklist(this._playground, {
                                           player: this._config.sceneConfig.player,
                                           playerConfig: this._config.sceneConfig.playerConfig,
                                       });
        this._ranklist.init();
        this._ranklist.visible = false;
        this.addChild(this._ranklist);

        this._soundBtn = new _SoundButton(this._playground, {});
        this._soundBtn.init();
        this.addChild(this._soundBtn);

        this._clockItem = new _ClockItem(this._playground, {});
        this._clockItem.init();
        this.addChild(this._clockItem);
        
        this._playerNumberItem = new _PlayerNumber(this._playground, {
            total: this._config.sceneConfig.player.total,
            cur: this._config.sceneConfig.player.total
        })
        this._playerNumberItem.init();
        this.addChild(this._playerNumberItem);

        // this._giveUpBtn = new _Button(this._playground, uiConfig.giveInBtn);
        // this._giveUpBtn.init();
        // this.addChild(this._giveUpBtn);
    }

    someoneLose(loser) {
        this._playerNumberItem.lose(loser.length);
    }

    startGame() {
        this._clockItem.start();
    }

    update(data) {
        if (typeof(this._minimap) != "undefined")
            this._minimap.update(data);
        if (typeof(this._ranklist) != "undefined")
            this._ranklist.update(data);
    }

    changeRoom(roomConfig) {
        this._minimap.changeTo(roomConfig.roomId);
    }

    refresh() {
        super.refresh();
        if (typeof(this._soundBtn) != "undefined")
            this._soundBtn.refresh();
        if (typeof(this._clockItem) != "undefined")
            this._clockItem.refresh();
    }
}

export {_TestUiScene}