import {
    SliderBase, valueProperty, minValueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty,
    Color, Background
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

    get [valueProperty.native](): number {
        return 0;
    }
    set [valueProperty.native](value: number) {
        this.setNativeValuesSilently(value - this.minValue, this.maxValue - this.minValue);
    }
    get [minValueProperty.native](): number {
        return 0;
    }
    set [minValueProperty.native](value: number) {
        this.setNativeValuesSilently(this.value - value, this.maxValue - value);
    }
    get [maxValueProperty.native](): number {
        return 100;
    }
    set [maxValueProperty.native](value: number) {
        this._android.setMax(value - this.minValue);
    }

    get [colorProperty.native](): number {
        return -1;
    }
    set [colorProperty.native](value: number | Color) {
        if (value instanceof Color) {
            this._android.getThumb().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getThumb().clearColorFilter();
        }
    }

    get [backgroundColorProperty.native](): number {
        return -1;
    }
    set [backgroundColorProperty.native](value: number | Color) {
        if (value instanceof Color) {
            this._android.getProgressDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getProgressDrawable().clearColorFilter();
        }
    }

    get [backgroundInternalProperty.native](): Background {
        return null;
    }
    set [backgroundInternalProperty.native](value: Background) {
        //
    }
}