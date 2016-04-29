import common = require("./progress-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");
import view = require("ui/core/view");

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

export class ProgressStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getProgressDrawable().clearColorFilter();
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        var progressDrawable = <android.graphics.drawable.LayerDrawable>bar.getProgressDrawable();

        if (progressDrawable.getNumberOfLayers && progressDrawable.getNumberOfLayers() > 0) {
            var backgroundDrawable = progressDrawable.getDrawable(0);
            if (backgroundDrawable) {
                backgroundDrawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
            }
        }
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ProgressStyler.setColorProperty,
            ProgressStyler.resetColorProperty), "Progress");

        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            ProgressStyler.setBackgroundAndBorderProperty,
            ProgressStyler.resetBackgroundAndBorderProperty), "Progress");

        style.registerHandler(style.borderWidthProperty, style.ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderColorProperty, style.ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderRadiusProperty, style.ignorePropertyHandler, "Progress");
        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "Progress");
    }
}

ProgressStyler.registerHandlers();
