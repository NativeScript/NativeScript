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
		const positions = Array.create('float', gradient.colorStops.length);
		let hasPositions = false;

		gradient.colorStops.forEach((stop, index) => {
			colors[index] = stop.color.android;
			if (stop.offset) {
				positions[index] = stop.offset.value;
				hasPositions = true;
			} else {
				// Default evenly distributed positions
				positions[index] = index / (gradient.colorStops.length - 1);
			}
		});

		// Calculate gradient direction based on angle
		const alpha = gradient.angle / (Math.PI * 2);
		const startX = Math.pow(Math.sin(Math.PI * (alpha + 0.75)), 2);
		const startY = Math.pow(Math.sin(Math.PI * (alpha + 0.5)), 2);
		const endX = Math.pow(Math.sin(Math.PI * (alpha + 0.25)), 2);
		const endY = Math.pow(Math.sin(Math.PI * alpha), 2);

		// Create the shape drawable with gradient
		const shape = new android.graphics.drawable.shapes.RectShape();
		const shapeDrawable = new android.graphics.drawable.ShapeDrawable(shape);

		// We need to set the bounds and shader in a custom callback since the drawable
		// doesn't have intrinsic dimensions
		const width = nativeView.getWidth() || 1000; // Default width if not yet measured
		const height = nativeView.getHeight() || 50; // Default height for progress drawable

		const linearGradient = new android.graphics.LinearGradient(startX * width, startY * height, endX * width, endY * height, colors, hasPositions ? positions : null, android.graphics.Shader.TileMode.CLAMP);

		shapeDrawable.getPaint().setShader(linearGradient);
		shapeDrawable.setBounds(0, 0, width, height);

		// Create a layer drawable that wraps the gradient for progress
		const progressDrawable = nativeView.getProgressDrawable();

		if (progressDrawable instanceof android.graphics.drawable.LayerDrawable) {
			// The SeekBar progress drawable is typically a LayerDrawable with 3 layers:
			// 0 - background track
			// 1 - secondary progress (buffer)
			// 2 - progress (filled portion)
			const layerDrawable = progressDrawable as android.graphics.drawable.LayerDrawable;

			// Create a clip drawable for the progress layer so it clips based on progress
			const clipDrawable = new android.graphics.drawable.ClipDrawable(shapeDrawable, android.view.Gravity.LEFT, android.graphics.drawable.ClipDrawable.HORIZONTAL);

			// Set the gradient drawable as the progress layer
			layerDrawable.setDrawableByLayerId(android.R.id.progress, clipDrawable);

			// Also set it as the background track for full gradient visibility
			const backgroundShape = new android.graphics.drawable.ShapeDrawable(new android.graphics.drawable.shapes.RectShape());
			const bgGradient = new android.graphics.LinearGradient(startX * width, startY * height, endX * width, endY * height, colors, hasPositions ? positions : null, android.graphics.Shader.TileMode.CLAMP);
			backgroundShape.getPaint().setShader(bgGradient);
			backgroundShape.getPaint().setAlpha(77); // ~30% opacity for background
			backgroundShape.setBounds(0, 0, width, height);
			layerDrawable.setDrawableByLayerId(android.R.id.background, backgroundShape);

			nativeView.setProgressDrawable(layerDrawable);
		} else {
			// Fallback: just set the shape drawable directly
			nativeView.setProgressDrawable(shapeDrawable);
		}
	}
}
