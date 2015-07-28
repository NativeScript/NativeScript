import aiCommon = require("ui/activity-indicator/activity-indicator-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onBusyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var indicator = <ActivityIndicator>data.object;
    if (!indicator.ios) {
        return;
    }

    if (data.newValue) {
        indicator.ios.startAnimating();
    } else {
        indicator.ios.stopAnimating();
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