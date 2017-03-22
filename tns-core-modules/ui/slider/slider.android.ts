import { Background } from "../styling/background";
import {
    SliderBase, valueProperty, minValueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty, Color
} from "./slider-common";

export * from "./slider-common";

interface SeekBarChangeListener {
    new (owner: Slider): android.widget.SeekBar.OnSeekBarChangeListener;
}

let SeekBarChangeListener: SeekBarChangeListener;

function initializeSeekBarChangeListener(): void {
    if (SeekBarChangeListener) {
        return;
    }

    @Interfaces([android.widget.SeekBar.OnSeekBarChangeListener])
    class SeekBarChangeListenerImpl extends java.lang.Object implements android.widget.SeekBar.OnSeekBarChangeListener {
        constructor(private owner: Slider) {
            super();
            return global.__native(this);
        }

        onProgressChanged(seekBar: android.widget.SeekBar, progress: number, fromUser: boolean): void {
            const owner = this.owner;
            if (!owner._supressNativeValue) {
                let newValue: number = seekBar.getProgress() + owner.minValue;
                valueProperty.nativeValueChange(owner, newValue);
            }
        }

        onStartTrackingTouch(seekBar: android.widget.SeekBar): void {
            //
        }

        onStopTrackingTouch(seekBar: android.widget.SeekBar): void {
            //
        }
    }

    SeekBarChangeListener = SeekBarChangeListenerImpl;
}

export class Slider extends SliderBase {
    _supressNativeValue: boolean;
    private _android: android.widget.SeekBar;
    private changeListener: android.widget.SeekBar.OnSeekBarChangeListener;

    public _createNativeView() {
        initializeSeekBarChangeListener();
        this.changeListener = this.changeListener || new SeekBarChangeListener(this);
        this._android = new android.widget.SeekBar(this._context);
        this._android.setOnSeekBarChangeListener(this.changeListener);
        return this._android;
    }

    get android(): android.widget.SeekBar {
        return this._android;
    }

    /**
     * There is no minValue in Android. We simulate this by subtracting the minValue from the native value and maxValue. 
     * We need this method to call native setMax and setProgress methods when minValue property is changed,
     * without handling the native value changed callback.
     */
    private setNativeValuesSilently(newValue: number, newMaxValue: number) {
        this._supressNativeValue = true;
        try {
            this.android.setMax(newMaxValue);
            this.android.setProgress(newValue);
        }
        finally {
            this._supressNativeValue = false;
        }
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this.setNativeValuesSilently(value - this.minValue, this.maxValue - this.minValue);
    }
    [minValueProperty.getDefault](): number {
        return 0;
    }
    [minValueProperty.setNative](value: number) {
        this.setNativeValuesSilently(this.value - value, this.maxValue - value);
    }
    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this._android.setMax(value - this.minValue);
    }

    [colorProperty.getDefault](): number {
        return -1;
    }
    [colorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this._android.getThumb().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getThumb().clearColorFilter();
        }
    }

    [backgroundColorProperty.getDefault](): number {
        return -1;
    }
    [backgroundColorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this._android.getProgressDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getProgressDrawable().clearColorFilter();
        }
    }

    [backgroundInternalProperty.getDefault](): Background {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Background) {
        //
    }
}
