import aiCommon = require("./activity-indicator-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");
import style = require("ui/styling/style");
import view = require("ui/core/view");

function onBusyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var indicator = <ActivityIndicator>data.object;
    if (!indicator.android) {
        return;
    }

    if (indicator.visibility === enums.Visibility.visible) {
        indicator.android.setVisibility(data.newValue ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>aiCommon.ActivityIndicator.busyProperty.metadata).onSetNativeValue = onBusyPropertyChanged;

global.moduleMerge(aiCommon, exports);

export class ActivityIndicator extends aiCommon.ActivityIndicator {
    private _android: android.widget.ProgressBar;

    public _createUI() {
        this._android = new android.widget.ProgressBar(this._context);
        this._android.setVisibility(android.view.View.INVISIBLE);
        this._android.setIndeterminate(true);
    }

    get android(): android.widget.ProgressBar {
        return this._android;
    }
} 

export class ActivityIndicatorStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getIndeterminateDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getIndeterminateDrawable().clearColorFilter();
    }

    //Visibility methods
    public static setActivityIndicatorVisibilityProperty(view: view.View, newValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, newValue, view._nativeView);
    }

    public static resetActivityIndicatorVisibilityProperty(view: view.View, nativeValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, enums.Visibility.visible, view._nativeView);
    }

    public static setIndicatorVisibility(isBusy: boolean, visibility: string, nativeView: android.view.View) {
        if (visibility === enums.Visibility.collapsed || visibility === enums.Visibility.collapse) {
            nativeView.setVisibility(android.view.View.GONE);
        }
        else {
            nativeView.setVisibility(isBusy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setColorProperty,
            ActivityIndicatorStyler.resetColorProperty), "ActivityIndicator");

        style.registerHandler(style.visibilityProperty, new style.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setActivityIndicatorVisibilityProperty,
            ActivityIndicatorStyler.resetActivityIndicatorVisibilityProperty), "ActivityIndicator");
    }
}

ActivityIndicatorStyler.registerHandlers();
