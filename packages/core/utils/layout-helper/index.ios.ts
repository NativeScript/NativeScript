import { round, MODE_MASK } from './layout-helper-common';

export * from './layout-helper-common';

export function makeMeasureSpec(size: number, mode: number): number {
	return (Math.round(Math.max(0, size)) & ~MODE_MASK) | (mode & MODE_MASK);
}

export function getDisplayDensity(): number {
	return UIScreen.mainScreen.scale;
}

export function toDevicePixels(value: number): number {
	return value * UIScreen.mainScreen.scale;
}

export function toDeviceIndependentPixels(value: number): number {
	return value / UIScreen.mainScreen.scale;
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
