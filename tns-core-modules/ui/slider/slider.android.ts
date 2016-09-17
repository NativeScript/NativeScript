import common = require("./slider-common");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");

function onValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    if (!slider.android) {
        return;
    }

    slider._setNativeValuesSilently(data.newValue - slider.minValue, slider.maxValue - slider.minValue);
}

function onMinValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    if (!slider.android) {
        return;
    }

    // There is no minValue in Android, so we translate the value and maxValue to simulate it.
    slider._setNativeValuesSilently(slider.value - data.newValue, slider.maxValue - data.newValue);
}

function onMaxValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    if (!slider.android) {
        return;
    }

    slider.android.setMax(data.newValue - slider.minValue);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Slider.valueProperty.metadata).onSetNativeValue = onValuePropertyChanged;
(<proxy.PropertyMetadata>common.Slider.minValueProperty.metadata).onSetNativeValue = onMinValuePropertyChanged;
(<proxy.PropertyMetadata>common.Slider.maxValueProperty.metadata).onSetNativeValue = onMaxValuePropertyChanged;

global.moduleMerge(common, exports);

export class Slider extends common.Slider {
    private _supressNativeValue: boolean;
    private _android: android.widget.SeekBar;
    private _changeListener: android.widget.SeekBar.OnSeekBarChangeListener;

    public _createUI() {
        this._android = new android.widget.SeekBar(this._context);

        var that = new WeakRef(this);

        this._changeListener = new android.widget.SeekBar.OnSeekBarChangeListener({

            onProgressChanged: function (seekBar: android.widget.SeekBar, progress: number, fromUser: boolean) {
                var owner = <Slider>that.get();
                if (owner) {
                    if (!owner._supressNativeValue) {
                        var newValue: number = seekBar.getProgress() + owner.minValue;
                        owner._onPropertyChangedFromNative(common.Slider.valueProperty, newValue);
                    }
                }
            },

            onStartTrackingTouch: (seekBar: android.widget.SeekBar) => {
                //
            },

            onStopTrackingTouch: (seekBar: android.widget.SeekBar) => {
                //
            }
        });

        this._android.setOnSeekBarChangeListener(this._changeListener);
    }

    get android(): android.widget.SeekBar {
        return this._android;
    }

    /**
     * There is no minValue in Android. We simulate this by subtracting the minValue from the native value and maxValue. 
     * We need this method to call native setMax and setProgress methods when minValue property is changed,
     * without handling the native value changed callback.
     */
    public _setNativeValuesSilently(newValue: number, newMaxValue: number) {
        if (!this.android) {
            return;
        }

        this._supressNativeValue = true;
        try {
            this.android.setMax(newMaxValue);
            this.android.setProgress(newValue);
        }
        finally {
            this._supressNativeValue = false;
        }
    }
}

export class SliderStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getThumb().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getThumb().clearColorFilter();
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SliderStyler.setColorProperty,
            SliderStyler.resetColorProperty), "Slider");

        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            SliderStyler.setBackgroundAndBorderProperty,
            SliderStyler.resetBackgroundAndBorderProperty), "Slider");

        style.registerHandler(style.borderTopColorProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderRightColorProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderBottomColorProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderLeftColorProperty, style.ignorePropertyHandler, "Slider");

        style.registerHandler(style.borderTopWidthProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderRightWidthProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderBottomWidthProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderLeftWidthProperty, style.ignorePropertyHandler, "Slider");
        
        style.registerHandler(style.borderTopLeftRadiusProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderTopRightRadiusProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderBottomRightRadiusProperty, style.ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderBottomLeftRadiusProperty, style.ignorePropertyHandler, "Slider");

        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "Slider");
    }
}

SliderStyler.registerHandlers();
