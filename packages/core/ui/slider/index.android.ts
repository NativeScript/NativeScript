import { Background } from '../styling/background';
import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AndroidHelper } from '../core/view';
import { LinearGradient } from '../styling/linear-gradient';

export * from './slider-common';

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
		if (value && value.image instanceof LinearGradient) {
			this._applyGradientToTrack(value.image);
		}
	}

	private _applyGradientToTrack(gradient: LinearGradient): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		// Get dimensions
		const density = nativeView.getContext().getResources().getDisplayMetrics().density;
		const width = nativeView.getWidth() || 1000;
		const trackHeight = Math.round(3 * density); // 3dp track height to match iOS
		const cornerRadius = trackHeight / 2;

		// Create colors array from gradient stops
		const colors = Array.create('int', gradient.colorStops.length);
		gradient.colorStops.forEach((stop, index) => {
			colors[index] = stop.color.android;
		});

		// Create semi-transparent colors for background
		const bgColors = Array.create('int', gradient.colorStops.length);
		gradient.colorStops.forEach((stop, index) => {
			const color = stop.color;
			const alpha = Math.round(color.a * 0.3);
			bgColors[index] = android.graphics.Color.argb(alpha, color.r, color.g, color.b);
		});

		// Create rounded corner radii
		const radii = Array.create('float', 8);
		for (let i = 0; i < 8; i++) {
			radii[i] = cornerRadius;
		}

		// Background track - use GradientDrawable for proper sizing
		const bgDrawable = new android.graphics.drawable.GradientDrawable();
		bgDrawable.setOrientation(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT);
		bgDrawable.setColors(bgColors);
		bgDrawable.setCornerRadius(cornerRadius);
		bgDrawable.setShape(android.graphics.drawable.GradientDrawable.RECTANGLE);

		// Progress track - use GradientDrawable
		const progressDrawable = new android.graphics.drawable.GradientDrawable();
		progressDrawable.setOrientation(android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT);
		progressDrawable.setColors(colors);
		progressDrawable.setCornerRadius(cornerRadius);
		progressDrawable.setShape(android.graphics.drawable.GradientDrawable.RECTANGLE);

		// Wrap progress in ClipDrawable for clipping based on progress
		const progressClip = new android.graphics.drawable.ClipDrawable(progressDrawable, android.view.Gravity.LEFT, android.graphics.drawable.ClipDrawable.HORIZONTAL);

		// Create LayerDrawable with both layers
		const layers = Array.create(android.graphics.drawable.Drawable, 2);
		layers[0] = bgDrawable;
		layers[1] = progressClip;

		const layerDrawable = new android.graphics.drawable.LayerDrawable(layers);
		layerDrawable.setId(0, android.R.id.background);
		layerDrawable.setId(1, android.R.id.progress);

		// Set layer height using setLayerSize (API 23+) or setLayerInset
		// Use setLayerHeight to constrain the actual drawable height
		const thumbHeight = Math.round(20 * density); // Approximate thumb size
		const verticalInset = Math.round((thumbHeight - trackHeight) / 2);

		layerDrawable.setLayerInset(0, 0, verticalInset, 0, verticalInset);
		layerDrawable.setLayerInset(1, 0, verticalInset, 0, verticalInset);

		// Apply to slider
		nativeView.setProgressDrawable(layerDrawable);

		// Disable split track to remove the gap behind thumb
		nativeView.setSplitTrack(false);

		// Set max height to constrain the SeekBar
		nativeView.setMaxHeight(thumbHeight);
		nativeView.setMinHeight(thumbHeight);

		// Force refresh progress
		const currentProgress = nativeView.getProgress();
		nativeView.setProgress(0);
		nativeView.setProgress(currentProgress);
	}
}
