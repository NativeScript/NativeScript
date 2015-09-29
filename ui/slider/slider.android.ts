import common = require("./slider-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

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
