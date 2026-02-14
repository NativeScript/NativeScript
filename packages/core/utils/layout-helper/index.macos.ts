import * as layoutCommon from './layout-helper-common';

function getMainScreenScale(): number {
	return NSScreen.mainScreen?.backingScaleFactor ?? 1;
}

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
		return getMainScreenScale();
	}

	export function toDevicePixels(value: number): number {
		return value * getMainScreenScale();
	}

	export function toDeviceIndependentPixels(value: number): number {
		return value / getMainScreenScale();
	}

	export function round(value: number) {
		return layoutCommon.round(value);
	}

	export function measureNativeView(nativeView: any, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
		const view = nativeView as NSView;
		const fittingSize = view?.fittingSize;

		const measuredWidth = widthMode === EXACTLY ? width : toDevicePixels(fittingSize?.width ?? 0);
		const measuredHeight = heightMode === EXACTLY ? height : toDevicePixels(fittingSize?.height ?? 0);

		return {
			width: round(measuredWidth),
			height: round(measuredHeight),
		};
	}

	export function measureSpecToString(measureSpec: number) {
		return layoutCommon.measureSpecToString(measureSpec);
	}
}
