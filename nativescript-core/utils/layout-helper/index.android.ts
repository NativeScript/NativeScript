import { MODE_MASK } from './layout-helper-common';
import { ad } from '../native-helper';

export * from './layout-helper-common';

let density: number;

let sdkVersion: number;
let useOldMeasureSpec = false;

export function makeMeasureSpec(size: number, mode: number): number {
	if (sdkVersion === undefined) {
		// check whether the old layout is needed
		sdkVersion = ad.getApplicationContext().getApplicationInfo().targetSdkVersion;
		useOldMeasureSpec = sdkVersion <= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1;
	}

	if (useOldMeasureSpec) {
		return size + mode;
	}

	return (size & ~MODE_MASK) | (mode & MODE_MASK);
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

export function measureNativeView(nativeView: any /* android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
	const view = <android.view.View>nativeView;
	view.measure(makeMeasureSpec(width, widthMode), makeMeasureSpec(height, heightMode));

	return {
		width: view.getMeasuredWidth(),
		height: view.getMeasuredHeight(),
	};
}
