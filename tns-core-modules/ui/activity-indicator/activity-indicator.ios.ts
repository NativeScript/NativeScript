import aiCommon = require("./activity-indicator-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");
import view = require("ui/core/view");

function onBusyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var indicator = <ActivityIndicator>data.object;
    if (!indicator.ios) {
        return;
    }
 
 let activityIndicator = indicator.ios;
    if (data.newValue) {
        activityIndicator.startAnimating();
    } else {
        activityIndicator.stopAnimating();
    }

    if (activityIndicator.hidesWhenStopped) {
        indicator.requestLayout();
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>aiCommon.ActivityIndicator.busyProperty.metadata).onSetNativeValue = onBusyPropertyChanged;

global.moduleMerge(aiCommon, exports);

export class ActivityIndicator extends aiCommon.ActivityIndicator  {
    private _ios: UIActivityIndicatorView;

    constructor() {
        super();
        this._ios = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.UIActivityIndicatorViewStyleGray);
    }

    get ios(): UIActivityIndicatorView {
        return this._ios;
    }
} 

export class ActivityIndicatorStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UIActivityIndicatorView>view.ios;
        bar.color = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIActivityIndicatorView>view.ios;
        bar.color = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UIActivityIndicatorView>view.ios;
        return bar.color;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setColorProperty,
            ActivityIndicatorStyler.resetColorProperty,
            ActivityIndicatorStyler.getNativeColorValue), "ActivityIndicator");
    }
}

ActivityIndicatorStyler.registerHandlers();
