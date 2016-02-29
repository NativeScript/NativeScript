import common = require("./button-common");
import utils = require("utils/utils")
import dependencyObservable = require("ui/core/dependency-observable");

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

        this._android.setOnTouchListener(new android.view.View.OnTouchListener(
            <utils.Owned & android.view.View.IOnTouchListener>{
                get owner() {
                    return that.get();
                },

                onTouch: function(v, ev) {
                    if (ev.getAction() === 0) { // down
                        this.owner._goToVisualState("highlighted");
                    }
                    else if (ev.getAction() === 1) { // up
                        this.owner._goToVisualState("normal");
                    }
                    return false;
                }
            }
        ));
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            this.android.setText(data.newValue + "");
        }
    }

    public _setFormattedTextPropertyToNative(value) {
        if (this.android) {
            this.android.setText(value._formattedText);
        }
    }
}
