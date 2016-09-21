import common = require("./progress-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");
import view = require("ui/core/view");

function onValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var progress = <Progress>data.object;
    progress.ios.progress = data.newValue / progress.maxValue;
}

function onMaxValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var progress = <Progress>data.object;
    progress.ios.progress = progress.value / data.newValue;
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Progress.valueProperty.metadata).onSetNativeValue = onValuePropertyChanged;
(<proxy.PropertyMetadata>common.Progress.maxValueProperty.metadata).onSetNativeValue = onMaxValuePropertyChanged;

global.moduleMerge(common, exports);

export class Progress extends common.Progress {
    private _ios: UIProgressView;

    constructor() {
        super();

        this._ios = UIProgressView.new();
    }

    get ios(): UIProgressView {
        return this._ios;
    }
} 

export class ProgressStyler implements style.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.progressTintColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.progressTintColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UIProgressView>view.ios;
        return bar.progressTintColor;
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.trackTintColor = newValue;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.trackTintColor = nativeValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <UIProgressView>view.ios;
        return bar.trackTintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ProgressStyler.setColorProperty,
            ProgressStyler.resetColorProperty,
            ProgressStyler.getNativeColorValue), "Progress");

        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            ProgressStyler.setBackgroundColorProperty,
            ProgressStyler.resetBackgroundColorProperty,
            ProgressStyler.getBackgroundColorProperty), "Progress");

        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "Progress");
    }
}

ProgressStyler.registerHandlers();
