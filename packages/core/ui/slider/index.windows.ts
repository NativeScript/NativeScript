export * from './slider-common';

import { Background } from '../styling/background';
import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { LinearGradient } from '../styling/linear-gradient';

// Build a LinearGradientBrush from a NativeScript gradient, applying an optional alpha scale per stop.
function buildGradientBrush(gradient: LinearGradient, startPt: any, endPt: any, alphaFactor: number): Microsoft.UI.Xaml.Media.LinearGradientBrush {
	const brush = new Microsoft.UI.Xaml.Media.LinearGradientBrush();
	brush.StartPoint = startPt;
	brush.EndPoint = endPt;
	for (let i = 0; i < gradient.colorStops.length; i++) {
		const stop = gradient.colorStops[i];
		const gs = new Microsoft.UI.Xaml.Media.GradientStop();

		let winColor: Windows.UI.Color;
		const src = stop.color as Color & { windows?: Windows.UI.Color };
		if (src?.windows) {
			const wc = src.windows;
			winColor = { A: Math.max(0, Math.min(255, Math.round(wc.A * alphaFactor))), R: wc.R, G: wc.G, B: wc.B } as unknown as Windows.UI.Color;
		} else {
			const c = stop.color as { r?: number; g?: number; b?: number; a?: number } ?? {};
			const norm = (v: number | undefined) => typeof v === 'number' ? (v <= 1 ? Math.round(v * 255) : Math.round(v)) : 0;
			const a = Math.max(0, Math.min(255, Math.round(norm(c.a ?? 255) * alphaFactor)));
			winColor = { A: a, R: norm(c.r), G: norm(c.g), B: norm(c.b) } as unknown as Windows.UI.Color;
		}
		gs.Color = winColor;

		const offset = stop.offset as { unit?: string; value?: number } | undefined;
		gs.Offset = offset?.unit === '%'
			? Math.max(0, Math.min(1, (offset.value ?? 0) / 100))
			: i / Math.max(1, gradient.colorStops.length - 1);

		brush.GradientStops.Append(gs);
	}
	return brush;
}

export class Slider extends SliderBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.Slider;
	private _windows: Microsoft.UI.Xaml.Controls.Slider;
	private _pendingGradient: LinearGradient | null = null;
	private _valueChangedDelegate: any = null;

	public createNativeView(): Microsoft.UI.Xaml.Controls.Slider {
		this._windows = new Microsoft.UI.Xaml.Controls.Slider();
		if (this._pendingGradient) {
			this._applyGradientToTrack(this._pendingGradient);
			this._pendingGradient = null;
		}
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const ref = new WeakRef(this);
		this._valueChangedDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.Primitives.RangeBaseValueChangedEventHandler', (_sender: any, e: any) => {
			const owner = ref.deref();
			if (owner) valueProperty.nativeValueChange(owner, e.NewValue);
		});
		this.nativeViewProtected.ValueChanged = this._valueChangedDelegate;
	}

	public disposeNativeView(): void {
		this._valueChangedDelegate = null;
		super.disposeNativeView();
	}

	[valueProperty.setNative](value: number) {
		this.nativeViewProtected.Value = value;
	}

	[minValueProperty.setNative](value: number) {
		this.nativeViewProtected.Minimum = value;
	}

	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.nativeViewProtected.Maximum = value;
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		const resources = this.nativeViewProtected.Resources;
		if (value instanceof Color) {
			resources.Insert('SliderThumbBackground', new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows));
		} else {
			resources.Remove('SliderThumbBackground');
		}
	}

	[backgroundColorProperty.getDefault](): number {
		return -1;
	}
	[backgroundColorProperty.setNative](value: number | Color) {
		if (!this.nativeViewProtected) return;
		const resources = this.nativeViewProtected.Resources;
		if (value instanceof Color) {
			resources.Insert('SliderTrackValueFill', new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows));
		} else {
			resources.Remove('SliderTrackValueFill');
		}
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Background) {
		if (!this.nativeViewProtected) {
			this._pendingGradient = value && value.image instanceof LinearGradient ? value.image : null;
			return;
		}
		const resources = this.nativeViewProtected.Resources;
		if (value && value.image instanceof LinearGradient) {
			this._applyGradientToTrack(value.image);
			return;
		}
		resources.Remove('SliderTrackValueFill');
		resources.Remove('SliderTrackBackgroundFill');
	}

	private _applyGradientToTrack(gradient: LinearGradient): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView || !gradient?.colorStops?.length) return;

		const angle = typeof gradient.angle === 'number' ? gradient.angle : 0;
		const rad = (angle * Math.PI) / 180;
		const dx = Math.cos(rad);
		const dy = Math.sin(rad);
		const startPt = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0.5 - dx / 2, 0.5 - dy / 2);
		const endPt = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0.5 + dx / 2, 0.5 + dy / 2);

		const resources = nativeView.Resources;
		resources.Insert('SliderTrackValueFill', buildGradientBrush(gradient, startPt, endPt, 1) as never);
		resources.Insert('SliderTrackBackgroundFill', buildGradientBrush(gradient, startPt, endPt, 0.3) as never);
	}
}
