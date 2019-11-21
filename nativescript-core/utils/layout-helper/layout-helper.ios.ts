import { round, MODE_MASK } from "./layout-helper-common";

export * from "./layout-helper-common";

let mainScreenScale;

export function makeMeasureSpec(size: number, mode: number): number {
    return (Math.round(Math.max(0, size)) & ~MODE_MASK) | (mode & MODE_MASK);
}

export function getDisplayDensity(): number {
    return mainScreenScale;
}

export function toDevicePixels(value: number): number {
    return value * mainScreenScale;
}

export function toDeviceIndependentPixels(value: number): number {
    return value / mainScreenScale;
}

export function measureNativeView(nativeView: any /* UIView */, width: number, widthMode: number, height: number, heightMode: number): { width: number, height: number } {
    const view = <UIView>nativeView;
    const nativeSize = view.sizeThatFits({
        width: widthMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(width),
        height: heightMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(height)
    });

    nativeSize.width = round(toDevicePixels(nativeSize.width));
    nativeSize.height = round(toDevicePixels(nativeSize.height));

    return nativeSize;
}

mainScreenScale = UIScreen.mainScreen.scale;
