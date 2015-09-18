import common = require("ui/button/button-common");
import utils = require("utils/utils")

global.moduleMerge(common, exports);

export class Button extends common.Button {
    private _android: android.widget.Button;
    private _isPressed: boolean;

    constructor() {
        super();

        this._isPressed = false;
    }

    get android(): android.widget.Button {
        return this._android;
    }

    public _createUI() {

        var that = new WeakRef(this);

        this._android = new android.widget.Button(this._context);

        this._android.setOnClickListener(new android.view.View.OnClickListener(
            <utils.Owned & android.view.View.IOnClickListener>{
            get owner() {
                return that.get();
            },

            onClick: function (v) {
                if (this.owner) {
                    this.owner._emit(common.Button.tapEvent);
                }
            }
        }));
    }
}
