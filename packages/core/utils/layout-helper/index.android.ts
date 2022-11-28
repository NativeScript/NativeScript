import * as layoutCommon from './layout-helper-common';
import { ad } from '../native-helper';

// export * from './layout-helper-common';

let density: number;

let sdkVersion: number;
let useOldMeasureSpec = false;

export namespace layout {
	// cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
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
		if (sdkVersion === undefined) {
			// check whether the old layout is needed
			sdkVersion = ad.getApplicationContext().getApplicationInfo().targetSdkVersion;
			useOldMeasureSpec = sdkVersion <= 17;
		}

		if (useOldMeasureSpec) {
			return size + mode;
		}

		return (size & ~layoutCommon.MODE_MASK) | (mode & layoutCommon.MODE_MASK);
	}

	export function getDisplayDensity(): number {
		if (density === undefined) {
			density = ad.getResources().getDisplayMetrics().density;
		}

		return density;
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

	export function measureNativeView(nativeView: any /* android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
		const view = <android.view.View>nativeView;
		view.measure(makeMeasureSpec(width, widthMode), makeMeasureSpec(height, heightMode));

		return {
			width: view.getMeasuredWidth(),
			height: view.getMeasuredHeight(),
		};
	}

	export function measureSpecToString(measureSpec: number) {
		return layoutCommon.measureSpecToString(measureSpec);
	}
}
