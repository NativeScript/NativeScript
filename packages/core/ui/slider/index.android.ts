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

		// Create colors array from gradient stops
		const colors = Array.create('int', gradient.colorStops.length);
		gradient.colorStops.forEach((stop, index) => {
			colors[index] = stop.color.android;
		});

		// Get width for gradient
		const width = nativeView.getWidth() || 1000;

		// Create LinearGradient shader (left to right)
		const shader = new android.graphics.LinearGradient(0, 0, width, 0, colors, null, android.graphics.Shader.TileMode.CLAMP);

		// Create ShapeDrawable with the gradient for the progress layer
		const progressShape = new android.graphics.drawable.ShapeDrawable(new android.graphics.drawable.shapes.RectShape());
		progressShape.getPaint().setShader(shader);

		// Wrap in ClipDrawable so it clips based on progress level
		const progressClip = new android.graphics.drawable.ClipDrawable(progressShape, android.view.Gravity.LEFT, android.graphics.drawable.ClipDrawable.HORIZONTAL);

		// Create a semi-transparent version for the background track
		const bgColors = Array.create('int', gradient.colorStops.length);
		gradient.colorStops.forEach((stop, index) => {
			// Make background 30% opacity
			const color = stop.color;
			const alpha = Math.round(color.a * 0.3);
			bgColors[index] = android.graphics.Color.argb(alpha, color.r, color.g, color.b);
		});
		const bgShader = new android.graphics.LinearGradient(0, 0, width, 0, bgColors, null, android.graphics.Shader.TileMode.CLAMP);
		const bgShape = new android.graphics.drawable.ShapeDrawable(new android.graphics.drawable.shapes.RectShape());
		bgShape.getPaint().setShader(bgShader);

		// Create LayerDrawable with background and progress layers
		const layers = Array.create(android.graphics.drawable.Drawable, 2);
		layers[0] = bgShape;
		layers[1] = progressClip;

		const layerDrawable = new android.graphics.drawable.LayerDrawable(layers);
		layerDrawable.setId(0, android.R.id.background);
		layerDrawable.setId(1, android.R.id.progress);

		// Apply to slider
		nativeView.setProgressDrawable(layerDrawable);

		// Force refresh progress to apply clipping
		const currentProgress = nativeView.getProgress();
		nativeView.setProgress(0);
		nativeView.setProgress(currentProgress);
	}
}
