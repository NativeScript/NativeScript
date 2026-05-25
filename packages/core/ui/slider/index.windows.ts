export * from './slider-common';

import { Background } from '../styling/background';
import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { AndroidHelper } from '../core/view';
import { LinearGradient } from '../styling/linear-gradient';

export class Slider extends SliderBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.Slider;
	private _windows: Windows.UI.Xaml.Controls.Slider;
	private _pendingGradient: any = null;
	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.Slider();
	}
	public createNativeView() {
		// If a gradient was set before native view creation, apply it now.
		if (this._pendingGradient) {
			try { this._applyGradientToTrack(this._pendingGradient); } catch (_e) { }
			this._pendingGradient = null;
		}
		return this._windows;
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
			resources.Insert('SliderThumbBackground', new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never);
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
			resources.Insert('SliderTrackValueFill', new Windows.UI.Xaml.Media.SolidColorBrush(value.windows) as never);
		} else {
			resources.Remove('SliderTrackValueFill');
		}
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Background) {
		try { console.log(`[Slider.Windows] backgroundInternal.setNative called for view=${(this && (this as any).constructor && (this as any).constructor.name) || '(Slider)'} hasImage=${!!(value && value.image)}`); } catch (_e) {}
		// If native view isn't created yet, stash the gradient for later.
		if (!this.nativeViewProtected) {
			if (value && value.image) {
				this._pendingGradient = (value as any).image;
			} else {
				this._pendingGradient = null;
			}
			return;
		}
		const resources = this.nativeViewProtected.Resources;
		if (value && value.image) {
			const image = value.image as any;
			if (image instanceof LinearGradient || (image && image.colorStops)) {
				this._applyGradientToTrack(image);
				return;
			}
		}
		// No usable gradient — remove any previously inserted resources
		try { resources.Remove('SliderTrackValueFill'); resources.Remove('SliderTrackBackgroundFill'); } catch (_e) { }
	}

	private _applyGradientToTrack(gradient: LinearGradient | any): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView || !gradient || !gradient.colorStops || gradient.colorStops.length === 0) {
			try { console.log(`[Slider.Windows] _applyGradientToTrack skipped: no gradient or stops`); } catch (_e) {}
			return;
		}
		try { console.log(`[Slider.Windows] _applyGradientToTrack applying ${gradient.colorStops.length} stops`); } catch (_e) {}

		const resources = nativeView.Resources;

		// Helper to map CSS angle to StartPoint/EndPoint
		const angle = typeof gradient.angle === 'number' ? gradient.angle : 0;
		const rad = (angle * Math.PI) / 180;
		const dx = Math.cos(rad);
		const dy = Math.sin(rad);
		const startPt = Windows.UI.Xaml.PointHelper.FromCoordinates(0.5 - dx / 2, 0.5 - dy / 2);
		const endPt = Windows.UI.Xaml.PointHelper.FromCoordinates(0.5 + dx / 2, 0.5 + dy / 2);

		// Build filled (value) gradient brush
		const valueBrush = new Windows.UI.Xaml.Media.LinearGradientBrush();
		valueBrush.StartPoint = startPt;
		valueBrush.EndPoint = endPt;
			for (let i = 0; i < gradient.colorStops.length; i++) {
				const stop = gradient.colorStops[i];
				const gs = new Windows.UI.Xaml.Media.GradientStop();
				// If the stop already provides a Windows color (via `Color.windows`), use it directly
				let winColor: any = null;
				if (stop.color && (stop.color as any).windows) {
					winColor = (stop.color as any).windows;
				} else {
					const c = stop.color || { r: 0, g: 0, b: 0, a: 255 };
					// Support colors specified as 0..1 normalized or 0..255 integers.
					const normalizeChannel = (v: any) => {
						if (typeof v !== 'number') return 0;
						if (v <= 1) return Math.round(v * 255);
						return Math.round(v);
					};
					const aCh = normalizeChannel(c.a ?? 255);
					const rCh = normalizeChannel(c.r ?? 0);
					const gCh = normalizeChannel(c.g ?? 0);
					const bCh = normalizeChannel(c.b ?? 0);
					winColor = Windows.UI.ColorHelper.FromArgb(aCh, rCh, gCh, bCh);
				}
				gs.Color = winColor;
				if (stop.offset && (stop.offset as any).unit === '%') {
					const v = (stop.offset as any).value || 0;
					gs.Offset = Math.max(0, Math.min(1, v / 100));
				} else {
					gs.Offset = i / Math.max(1, gradient.colorStops.length - 1);
				}
				valueBrush.GradientStops.Append(gs);
				try {
					const hex = '#' + ('000000' + ((winColor.A << 24) >>> 0 | (winColor.R << 16) | (winColor.G << 8) | winColor.B).toString(16).toUpperCase()).slice(-8);
					console.log(`[Slider.Windows] Gradient stop ${i}: r=${c.r} g=${c.g} b=${c.b} a=${c.a} -> ${hex}`);
				} catch (_e) { }
			}

		// Build background (faded) gradient brush
		const bgBrush = new Windows.UI.Xaml.Media.LinearGradientBrush();
		bgBrush.StartPoint = startPt;
		bgBrush.EndPoint = endPt;
		for (let i = 0; i < gradient.colorStops.length; i++) {
			const stop = gradient.colorStops[i];
			const gs = new Windows.UI.Xaml.Media.GradientStop();
				let r: number, g: number, b: number, aRaw: number;
				if (stop.color && (stop.color as any).windows) {
					const wc = (stop.color as any).windows;
					r = wc.R; g = wc.G; b = wc.B; aRaw = wc.A;
				} else {
					const c = stop.color || { r: 0, g: 0, b: 0, a: 255 };
					const normalizeChannel = (v: any) => {
						if (typeof v !== 'number') return 0;
						if (v <= 1) return Math.round(v * 255);
						return Math.round(v);
					};
					r = normalizeChannel(c.r ?? 0);
					g = normalizeChannel(c.g ?? 0);
					b = normalizeChannel(c.b ?? 0);
					aRaw = normalizeChannel(c.a ?? 255);
				}
				const a = Math.max(0, Math.min(255, Math.round(aRaw * 0.3)));
				gs.Color = Windows.UI.ColorHelper.FromArgb(a, r, g, b);
			if (stop.offset && (stop.offset as any).unit === '%') {
				const v = (stop.offset as any).value || 0;
				gs.Offset = Math.max(0, Math.min(1, v / 100));
			} else {
				gs.Offset = i / Math.max(1, gradient.colorStops.length - 1);
			}
			bgBrush.GradientStops.Append(gs);
		}

		resources.Insert('SliderTrackValueFill', valueBrush as never);
		resources.Insert('SliderTrackBackgroundFill', bgBrush as never);

	}
}
