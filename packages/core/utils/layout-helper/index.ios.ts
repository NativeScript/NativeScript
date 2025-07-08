import * as layoutCommon from './layout-helper-common';
import { ios as iosUtils } from '../native-helper';

export namespace layout {
	// cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Objective C
	// TODO: While this boosts the performance it is error-prone in case Google changes these constants
	export const MODE_SHIFT = 30;
	export const MODE_MASK = 0x3 << MODE_SHIFT;

	export const UNSPECIFIED = 0 << MODE_SHIFT;
	export const EXACTLY = 1 << MODE_SHIFT;
	export const AT_MOST = 2 << MODE_SHIFT;

	export const MEASURED_HEIGHT_STATE_SHIFT = 0x00000010; /* 16 */
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
		return (Math.round(Math.max(0, size)) & ~layoutCommon.MODE_MASK) | (mode & layoutCommon.MODE_MASK);
	}

	export function getDisplayDensity(): number {
		return iosUtils.getMainScreen().scale;
	}

	export function toDevicePixels(value: number): number {
		return value * iosUtils.getMainScreen().scale;
	}

	export function toDeviceIndependentPixels(value: number): number {
		return value / iosUtils.getMainScreen().scale;
	}

	export function round(value: number) {
		return layoutCommon.round(value);
	}

	export function measureNativeView(nativeView: any /* UIView */, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
		const view = <UIView>nativeView;
		const nativeSize = view.sizeThatFits({
			width: widthMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(width),
			height: heightMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(height),
		});

		nativeSize.width = round(toDevicePixels(nativeSize.width));
		nativeSize.height = round(toDevicePixels(nativeSize.height));

		return nativeSize;
	}

	export function measureSpecToString(measureSpec: number) {
		return layoutCommon.measureSpecToString(measureSpec);
	}
}
