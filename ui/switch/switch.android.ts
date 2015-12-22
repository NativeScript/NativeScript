import common = require("./switch-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils")
import styling = require("ui/styling");
import style = require("ui/styling/style");
import view = require("ui/core/view");

function onCheckedPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var swtch = <Switch>data.object;
    if (!swtch.android) {
        return;
    }

    swtch.android.setChecked(data.newValue);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Switch.checkedProperty.metadata).onSetNativeValue = onCheckedPropertyChanged;

global.moduleMerge(common, exports);

export class Switch extends common.Switch {
    private _android: android.widget.Switch;

    get android(): android.widget.Switch {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.Switch(this._context);

        var that = new WeakRef(this);

        this._android.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener(<utils.Owned & android.widget.CompoundButton.IOnCheckedChangeListener>{
            get owner() {
                return that.get();
            },

            onCheckedChanged: function (sender, isChecked) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.Switch.checkedProperty, isChecked);
                }
            }
        }));
    }
} 

export class SwitchStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var sw = <android.widget.Switch>view._nativeView;

        var drawable = <android.graphics.drawable.StateListDrawable>sw.getThumbDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var sw = <android.widget.Switch>view._nativeView;
        // Do nothing.
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var sw = <android.widget.Switch>view._nativeView;

        var drawable = <android.graphics.drawable.StateListDrawable>sw.getTrackDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        var sw = <android.widget.Switch>view._nativeView;
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SwitchStyler.setColorProperty,
            SwitchStyler.resetColorProperty), "Switch");

        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            SwitchStyler.setBackgroundAndBorderProperty,
            SwitchStyler.resetBackgroundAndBorderProperty), "Switch");

        style.registerHandler(style.borderWidthProperty, style.ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderColorProperty, style.ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderRadiusProperty, style.ignorePropertyHandler, "Switch");
        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "Switch");
    }
}

SwitchStyler.registerHandlers();
