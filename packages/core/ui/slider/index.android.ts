import { Background } from '../styling/background';
import { SliderBase, valueProperty, minValueProperty, maxValueProperty, minTrackGradientProperty, maxTrackGradientProperty } from './index.shared';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AndroidHelper } from '../core/view';
import { LinearGradient } from '../styling/linear-gradient';
import { GradientDrawable } from './gradient-drawable.android';

export * from './index.shared';

interface OwnerSeekBar extends android.widget.SeekBar {
	owner: Slider;
}

let SeekBar: typeof android.widget.SeekBar;
let SeekBarChangeListener: android.widget.SeekBar.OnSeekBarChangeListener;

function initializeListenerClass(): void {
	if (!SeekBarChangeListener) {
		@NativeClass
		@Interfaces([android.widget.SeekBar.OnSeekBarChangeListener])
		class SeekBarChangeListenerImpl extends java.lang.Object implements android.widget.SeekBar.OnSeekBarChangeListener {
			constructor() {
				super();

				return global.__native(this);
			}

			onProgressChanged(seekBar: OwnerSeekBar, progress: number, fromUser: boolean): void {
				const owner = seekBar.owner;
				if (owner && !owner._supressNativeValue) {
					const newValue = progress + owner.minValue;
					valueProperty.nativeValueChange(owner, newValue);
				}
			}

			onStartTrackingTouch(seekBar: OwnerSeekBar): void {
				//
			}

			onStopTrackingTouch(seekBar: OwnerSeekBar): void {
				//
			}
		}

		SeekBarChangeListener = new SeekBarChangeListenerImpl();
	}
}

function getListener(): android.widget.SeekBar.OnSeekBarChangeListener {
	return SeekBarChangeListener;
}

export class Slider extends SliderBase {
	_supressNativeValue: boolean;
	nativeViewProtected: OwnerSeekBar;

	public createNativeView() {
		if (!SeekBar) {
			SeekBar = android.widget.SeekBar;
		}

		return new SeekBar(this._context);
	}

	private _defaultProgressDrawable: android.graphics.drawable.Drawable;

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		nativeView.owner = this;
		initializeListenerClass();
		const listener = getListener();
		nativeView.setOnSeekBarChangeListener(listener);
	}

	public disposeNativeView() {
		this.nativeViewProtected.owner = null;
		super.disposeNativeView();
	}

	public resetNativeView(): void {
		super.resetNativeView();
		const nativeView = this.nativeViewProtected;
		nativeView.setMax(100);
		nativeView.setProgress(0);
		nativeView.setKeyProgressIncrement(1);
	}

	/**
	 * There is no minValue in Android. We simulate this by subtracting the minValue from the native value and maxValue.
	 * We need this method to call native setMax and setProgress methods when minValue property is changed,
	 * without handling the native value changed callback.
	 */
	private setNativeValuesSilently() {
		this._supressNativeValue = true;
		const nativeView = this.nativeViewProtected;
		try {
			nativeView.setMax(this.maxValue - this.minValue);
			nativeView.setProgress(this.value - this.minValue);
		} finally {
			this._supressNativeValue = false;
		}
	}

	[valueProperty.setNative](value: number) {
		this.setNativeValuesSilently();
	}

	[minValueProperty.setNative](value: number) {
		this.setNativeValuesSilently();
	}

	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.setNativeValuesSilently();
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		const drawable = this.nativeViewProtected.getThumb();
		if (value instanceof Color) {
			AndroidHelper.setDrawableColor(value.android, drawable);
		} else {
			AndroidHelper.clearDrawableColor(drawable);
		}
	}

	[backgroundColorProperty.getDefault](): number {
		return -1;
	}
	[backgroundColorProperty.setNative](value: number | Color) {
		const drawable = this.nativeViewProtected.getProgressDrawable();
		if (value instanceof Color) {
			AndroidHelper.setDrawableColor(value.android, drawable);
		} else {
			AndroidHelper.clearDrawableColor(drawable);
		}
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Background) {
		//
	}

	[minTrackGradientProperty.setNative](value: LinearGradient | null) {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}
		if (!this._defaultProgressDrawable) {
			this._defaultProgressDrawable = nativeView.getProgressDrawable();
		}

		if (!value) {
			// restore original drawable
			nativeView.setProgressDrawable(this._defaultProgressDrawable);
			return;
		}

		// Create a new drawable with shader-based gradient
		const drawable = new GradientDrawable(value, this._defaultProgressDrawable);
		nativeView.setProgressDrawable(drawable);
	}

	[maxTrackGradientProperty.setNative](value: LinearGradient | null) {
		// For now apply same drawable as min track as SeekBar uses a single progress drawable.
		this[minTrackGradientProperty.setNative](value as any);
	}
}
