import { LayoutBaseCommon, clipToBoundsProperty, View, layout } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {
    nativeViewProtected: UIView;
    
    public addChild(child: View): void {
        super.addChild(child);
        this.requestLayout();
    }

    public insertChild(child: View, atIndex: number): void {
        super.insertChild(child, atIndex);
        this.requestLayout();
    }

    public removeChild(child: View): void {
        super.removeChild(child);
        this.requestLayout();
    }

    _setNativeClipToBounds() {
        if (this.clipToBounds) {
            this.nativeViewProtected.clipsToBounds = true;
        } else {
            super._setNativeClipToBounds();
        }
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        // if (!CGRectEqualToRect(nativeView.frame, frame)) {
            // if (traceEnabled()) {
            //     traceWrite(this + ", Native setFrame: = " + NSStringFromCGRect(frame), traceCategories.Layout);
            // }
            // this._cachedFrame = frame;
            // if (this._hasTransfrom) {
            //     // Always set identity transform before setting frame;
            //     const transform = nativeView.transform;
            //     nativeView.transform = CGAffineTransformIdentity;
            //     nativeView.frame = frame;
            //     nativeView.transform = transform;
            // }
            // else {
            //     nativeView.frame = frame;
            // }

            nativeView.frame = frame;

            const safeArea = this.getSafeArea();
            const fullscreen = this.getFullscreenArea();
            const locationOnScreen = this.getLocationOnScreen();
            const onScreenLeft = layout.toDevicePixels(layout.round(locationOnScreen.x));
            const onScreenTop = layout.toDevicePixels(layout.round(locationOnScreen.y));

            let left = layout.toDevicePixels(frame.origin.x);
            let top = layout.toDevicePixels(frame.origin.y);
            let width = layout.toDevicePixels(frame.size.width);
            let height = layout.toDevicePixels(frame.size.height);

            let newLeft = left;
            let newTop = top;
            let newWidth = width;
            let newHeight = height;

            if (onScreenLeft <= layout.toDevicePixels(safeArea.origin.x)) {
                newLeft = layout.toDevicePixels(fullscreen.origin.x);
                newWidth = width + onScreenLeft;
            }

            if (onScreenTop <= layout.toDevicePixels(safeArea.origin.y)) {
                newTop = layout.toDevicePixels(fullscreen.origin.y);
                newHeight = height + onScreenTop;
            }

            if (onScreenLeft + width >= layout.toDevicePixels(safeArea.origin.x) + layout.toDevicePixels(safeArea.size.width)) {
                newWidth = newWidth + (layout.toDevicePixels(fullscreen.size.width) - (onScreenLeft + width));
            }

            if (onScreenTop + height >= layout.toDevicePixels(safeArea.origin.y) + layout.toDevicePixels(safeArea.size.height)) {
                newHeight = newHeight + (layout.toDevicePixels(fullscreen.size.height) - (onScreenTop + height));
            }

            const frameNew = CGRectMake(layout.toDeviceIndependentPixels(newLeft), layout.toDeviceIndependentPixels(newTop), layout.toDeviceIndependentPixels(newWidth), layout.toDeviceIndependentPixels(newHeight));
            nativeView.frame = frameNew;

            // if (leftInset || topInset) {
            //     const frameNew = CGRectMake(layout.toDeviceIndependentPixels(left), layout.toDeviceIndependentPixels(top), layout.toDeviceIndependentPixels(right - left + leftInset), layout.toDeviceIndependentPixels(bottom - top + topInset));
            //     nativeView.frame = frameNew;
            //     const boundsOrigin = nativeView.bounds.origin;
            //     nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, frameNew.size.width, frameNew.size.height);
            // }
            // else {
                const boundsOrigin = nativeView.bounds.origin;
                nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, frameNew.size.width, frameNew.size.height);
            // }
        // }

            return frameNew;
    }
    
    [clipToBoundsProperty.getDefault](): boolean {
        return false;
    }
    [clipToBoundsProperty.setNative](value: boolean) {
        this._setNativeClipToBounds();
    }
}