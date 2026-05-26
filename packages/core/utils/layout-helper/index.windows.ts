import * as layoutCommon from './layout-helper-common';

export namespace layout {
	export const MODE_SHIFT = 30;
	export const MODE_MASK = 0x3 << MODE_SHIFT;

	export const UNSPECIFIED = 0 << MODE_SHIFT;
	export const EXACTLY = 1 << MODE_SHIFT;
	export const AT_MOST = 2 << MODE_SHIFT;

	export const MEASURED_HEIGHT_STATE_SHIFT = 0x00000010;
	export const MEASURED_STATE_TOO_SMALL = 0x01000000;
	export const MEASURED_STATE_MASK = 0xff000000;
	export const MEASURED_SIZE_MASK = 0x00ffffff;

	export function getMode(mode: number) {
		return layoutCommon.getMode(mode);
	}

	export function getMeasureSpecMode(spec: number): number {
		return layoutCommon.getMeasureSpecMode(spec);
	}

	export function getMeasureSpecSize(spec: number) {
		return layoutCommon.getMeasureSpecSize(spec);
	}

	export function makeMeasureSpec(size: number, mode: number): number {
		return (Math.round(Math.max(0, size)) & ~MODE_MASK) | (mode & MODE_MASK);
	}

	export function hasRtlSupport(): boolean {
		return true;
	}

	export function getDisplayDensity(): number {
		try {
			return Windows.Graphics.Display.DisplayInformation.GetForCurrentView().RawPixelsPerViewPixel || 1;
		} catch {
			return 1;
		}
	}

	export function toDevicePixels(value: number): number {
		return value * getDisplayDensity();
	}

	export function toDeviceIndependentPixels(value: number): number {
		return value / getDisplayDensity();
	}

	export function round(value: number) {
		return layoutCommon.round(value);
	}

	export function measureNativeView(nativeView: any, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {

		if (nativeView && nativeView.Measure) {
			const size = new Windows.Foundation.Size(
				widthMode === 0 /* layout.UNSPECIFIED */ ? Number.NaN : toDeviceIndependentPixels(width),
				heightMode === 0 /* layout.UNSPECIFIED */ ? Number.NaN : toDeviceIndependentPixels(height),
			);

			(nativeView as Windows.UI.Xaml.FrameworkElement).Measure(size);


			const ret = (nativeView as Windows.UI.Xaml.FrameworkElement).DesiredSize;

			return {
				width: round(toDevicePixels(ret.Width)),
				height: round(toDevicePixels(ret.Height)),
			};

		}

		return { width: 0, height: 0 };
	}

	export function measureSpecToString(measureSpec: number) {
		return layoutCommon.measureSpecToString(measureSpec);
	}
}
