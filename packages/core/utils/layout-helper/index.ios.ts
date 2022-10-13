import * as layoutCommon from './layout-helper-common';

// export * from './layout-helper-common';

export namespace layout {
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
		return UIScreen.mainScreen.scale;
	}

	export function toDevicePixels(value: number): number {
		return value * UIScreen.mainScreen.scale;
	}

	export function toDeviceIndependentPixels(value: number): number {
		return value / UIScreen.mainScreen.scale;
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
