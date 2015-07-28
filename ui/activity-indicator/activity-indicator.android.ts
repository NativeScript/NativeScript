import aiCommon = require("ui/activity-indicator/activity-indicator-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");

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