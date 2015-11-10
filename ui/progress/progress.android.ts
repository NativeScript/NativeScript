import common = require("./progress-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

const R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;

function onValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var progress = <Progress>data.object;
    if (!progress.android) {
        return;
    }

    progress.android.setProgress(data.newValue);
}

function onMaxValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var progress = <Progress>data.object;
    if (!progress.android) {
        return;
    }

    progress.android.setMax(data.newValue);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Progress.valueProperty.metadata).onSetNativeValue = onValuePropertyChanged;
(<proxy.PropertyMetadata>common.Progress.maxValueProperty.metadata).onSetNativeValue = onMaxValuePropertyChanged;

global.moduleMerge(common, exports);

export class Progress extends common.Progress {
    private _android: android.widget.ProgressBar;

    public _createUI() {
        this._android = new android.widget.ProgressBar(this._context, null, R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL);
    }

    get android(): android.widget.ProgressBar {
        return this._android;
    }
}
