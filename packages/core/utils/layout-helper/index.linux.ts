import * as layoutCommon from './layout-helper-common';

// GTK lays out in logical pixels and scales on its own, so device pixels are DIPs.
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
		return 1;
	}

	export function toDevicePixels(value: number): number {
		return value;
	}

	export function toDeviceIndependentPixels(value: number): number {
		return value;
	}

	export function round(value: number) {
		return layoutCommon.round(value);
	}

	const minimum = new interop.Reference(interop.types.int32, 0);
	const natural = new interop.Reference(interop.types.int32, 0);

	function measureAxis(widget: any, orientation: GtkOrientation, forSize: number): [number, number] {
		gtk_widget_measure(widget, orientation, forSize, minimum, natural, null, null);
		return [minimum.value, natural.value];
	}

	/** Natural size of a GTK widget within the measure constraints (min size is the floor). */
	export function measureNativeView(nativeView: any, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
		if (!nativeView) {
			return { width: 0, height: 0 };
		}
		const [minWidth, naturalWidth] = measureAxis(nativeView, GtkOrientation.HORIZONTAL, -1);
		let measuredWidth = naturalWidth;
		if (widthMode === EXACTLY) {
			measuredWidth = width;
		} else if (widthMode === AT_MOST) {
			measuredWidth = Math.min(naturalWidth, width);
		}
		measuredWidth = Math.max(measuredWidth, minWidth);

		const [minHeight, naturalHeight] = measureAxis(nativeView, GtkOrientation.VERTICAL, measuredWidth);
		let measuredHeight = naturalHeight;
		if (heightMode === EXACTLY) {
			measuredHeight = height;
		} else if (heightMode === AT_MOST) {
			measuredHeight = Math.min(naturalHeight, height);
		}
		measuredHeight = Math.max(measuredHeight, minHeight);
		return { width: measuredWidth, height: measuredHeight };
	}

	export function measureSpecToString(measureSpec: number) {
		return layoutCommon.measureSpecToString(measureSpec);
	}
}
