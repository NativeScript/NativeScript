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
        constructor(public owner: Slider) {
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
    nativeView: android.widget.SeekBar;

    public createNativeView() {
        initializeSeekBarChangeListener();
        const listener = new SeekBarChangeListener(this);
        const nativeView = new android.widget.SeekBar(this._context);
        nativeView.setOnSeekBarChangeListener(listener);
        (<any>nativeView).listener = listener;
        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = this;
    }

    public disposeNativeView() {
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = null;
        super.disposeNativeView();
    }

    /**
     * There is no minValue in Android. We simulate this by subtracting the minValue from the native value and maxValue. 
     * We need this method to call native setMax and setProgress methods when minValue property is changed,
     * without handling the native value changed callback.
     */
    private setNativeValuesSilently(newValue: number, newMaxValue: number) {
        this._supressNativeValue = true;
        const nativeView = this.nativeView;
        try {
            nativeView.setMax(newMaxValue);
            nativeView.setProgress(newValue);
        } finally {
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
        this.setNativeValuesSilently(value - this.minValue, value);
    }

    [colorProperty.getDefault](): number {
        return -1;
    }
    [colorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this.nativeView.getThumb().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this.nativeView.getThumb().clearColorFilter();
        }
    }

    [backgroundColorProperty.getDefault](): number {
        return -1;
    }
    [backgroundColorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this.nativeView.getProgressDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this.nativeView.getProgressDrawable().clearColorFilter();
        }
    }

    [backgroundInternalProperty.getDefault](): Background {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Background) {
        //
    }
}
