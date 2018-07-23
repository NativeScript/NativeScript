import { ScrollEventData } from ".";
import { View, layout, ScrollViewBase, scrollBarIndicatorVisibleProperty } from "./scroll-view-common";
import { ios as iosUtils } from "../../utils/utils";
// HACK: Webpack. Use a fully-qualified import to allow resolve.extensions(.ios.js) to
// kick in. `../utils` doesn't seem to trigger the webpack extensions mechanism.
import * as uiUtils from "tns-core-modules/ui/utils";

export * from "./scroll-view-common";

const majorVersion = iosUtils.MajorVersion;

class UIScrollViewDelegateImpl extends NSObject implements UIScrollViewDelegate {
    private _owner: WeakRef<ScrollView>;

    public static initWithOwner(owner: WeakRef<ScrollView>): UIScrollViewDelegateImpl {
        let impl = <UIScrollViewDelegateImpl>UIScrollViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    }

    public scrollViewDidScroll(sv: UIScrollView): void {
        let owner = this._owner.get();
        if (owner) {
            owner.notify(<ScrollEventData>{
                object: owner,
                eventName: "scroll",
                scrollX: owner.horizontalOffset,
                scrollY: owner.verticalOffset
            });
        }
    }

    public static ObjCProtocols = [UIScrollViewDelegate];
}

export class ScrollView extends ScrollViewBase {
    public nativeViewProtected: UIScrollView;
    private _contentMeasuredWidth: number = 0;
    private _contentMeasuredHeight: number = 0;
    private _delegate: UIScrollViewDelegateImpl;

    constructor() {
        super();
        this.nativeViewProtected = UIScrollView.new();
        this._setNativeClipToBounds();
    }

    _setNativeClipToBounds() {
        // Always set clipsToBounds for scroll-view
        this.nativeViewProtected.clipsToBounds = true;
    }

    protected attachNative() {
        this._delegate = UIScrollViewDelegateImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected.delegate = this._delegate;
    }

    protected dettachNative() {
        this.nativeViewProtected.delegate = null;
    }

    protected updateScrollBarVisibility(value) {
        if (this.orientation === "horizontal") {
            this.nativeViewProtected.showsHorizontalScrollIndicator = value;
        } else {
            this.nativeViewProtected.showsVerticalScrollIndicator = value;
        }
    }

    get horizontalOffset(): number {
        return this.nativeViewProtected.contentOffset.x;
    }

    get verticalOffset(): number {
        return this.nativeViewProtected.contentOffset.y;
    }

    get scrollableWidth(): number {
        if (this.orientation !== "horizontal") {
            return 0;
        }

        return Math.max(0, this.nativeViewProtected.contentSize.width - this.nativeViewProtected.bounds.size.width);
    }

    get scrollableHeight(): number {
        if (this.orientation !== "vertical") {
            return 0;
        }

        return Math.max(0, this.nativeViewProtected.contentSize.height - this.nativeViewProtected.bounds.size.height);
    }

    [scrollBarIndicatorVisibleProperty.getDefault](): boolean {
        return true;
    }
    [scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
        this.updateScrollBarVisibility(value);
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        if (this.orientation === "vertical") {
            const bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(0, value, bounds.width, bounds.height), animated);
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        if (this.orientation === "horizontal") {
            const bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(value, 0, bounds.width, bounds.height), animated);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call measure because it will measure content twice.
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const child = this.layoutView;
        this._contentMeasuredWidth = this.effectiveMinWidth;
        this._contentMeasuredHeight = this.effectiveMinHeight;

        // // `_automaticallyAdjustsScrollViewInsets` is set to true only if the first child 
        // // of UIViewController (Page, TabView e.g) is UIScrollView (ScrollView, ListView e.g).
        // // On iOS 11 by default UIScrollView automatically adjusts the scroll view insets, but they s
        // if (majorVersion > 10) {
        //     // Disable automatic adjustment of scroll view insets when ScrollView 
        //     // is not the first child of UIViewController.
        //     this.nativeViewProtected.contentInsetAdjustmentBehavior = 2;
        // }

        if (child) {
            let childSize: { measuredWidth: number; measuredHeight: number };
            if (this.orientation === "vertical") {
                childSize = View.measureChild(this, child, widthMeasureSpec, layout.makeMeasureSpec(0, layout.UNSPECIFIED));
            } else {
                childSize = View.measureChild(this, child, layout.makeMeasureSpec(0, layout.UNSPECIFIED), heightMeasureSpec);
            }

            // const w = layout.toDeviceIndependentPixels(childSize.measuredWidth);
            // const h = layout.toDeviceIndependentPixels(childSize.measuredHeight);
            // this.nativeViewProtected.contentSize = CGSizeMake(w, h);

            this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.effectiveMinWidth);
            this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.effectiveMinHeight);
        }

        const widthAndState = View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number, insets?: {left, top, right, bottom}): void {
        let width = (right - left);
        let height = (bottom - top);

        if (majorVersion > 10) {
            // Disable automatic adjustment of scroll view insets
            // Consider exposing this as property with all 4 modes
            // https://developer.apple.com/documentation/uikit/uiscrollview/contentinsetadjustmentbehavior
            this.nativeViewProtected.contentInsetAdjustmentBehavior = 2;
        }

        // let verticalInset: number;
        const nativeView = this.nativeViewProtected;
        // const inset = nativeView.adjustedContentInset;
        // // Prior iOS 11
        // if (inset === undefined) {
        //     verticalInset = 0;
        //     // verticalInset = -layout.toDevicePixels(nativeView.contentOffset.y);
        //     // verticalInset += getTabBarHeight(this);
        // } else {
        //     verticalInset = layout.toDevicePixels(inset.bottom + inset.top);
        // }

        if (this.orientation === "horizontal") {
            width = Math.max(this._contentMeasuredWidth + insets.left + insets.right, width);
        }
        else {
            height = Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, height);
        }

        nativeView.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(width), layout.toDeviceIndependentPixels(height));
        View.layoutChild(this, this.layoutView, 0, 0, width, height);

        // if (this.orientation === "horizontal") {
        //     nativeView.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(this._contentMeasuredWidth + insets.left + insets.right), layout.toDeviceIndependentPixels(height));
        //     View.layoutChild(this, this.layoutView, 0, 0, Math.max(this._contentMeasuredWidth + insets.left + insets.right, width), height);
        // } else {
        //     nativeView.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(width), layout.toDeviceIndependentPixels(this._contentMeasuredHeight + insets.top + insets.bottom));
        //     View.layoutChild(this, this.layoutView, 0, 0, width, Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, height));
        // }
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
            const locationOnScreen = this.getLocationInWindow();
            const onScreenLeft = layout.toDevicePixels(layout.round(locationOnScreen.x));
            const onScreenTop = layout.toDevicePixels(layout.round(locationOnScreen.y));

            let left = layout.toDevicePixels(frame.origin.x);
            let top = layout.toDevicePixels(frame.origin.y);
            let width = layout.toDevicePixels(frame.size.width);
            let height = layout.toDevicePixels(frame.size.height);

            if (majorVersion > 10) {
                let newLeft = left;
                let newTop = top;
                let newWidth = width;
                let newHeight = height;

                if (left !== 0 && onScreenLeft <= layout.toDevicePixels(safeArea.origin.x)) {
                    newLeft = layout.toDevicePixels(fullscreen.origin.x);
                    newWidth = width + onScreenLeft;
                }

                if (top !== 0 && onScreenTop <= layout.toDevicePixels(safeArea.origin.y)) {
                    newTop = layout.toDevicePixels(fullscreen.origin.y);
                    newHeight = height + onScreenTop;
                }

                if (width && width < layout.toDevicePixels(fullscreen.size.width) && onScreenLeft + width >= layout.toDevicePixels(safeArea.origin.x) + layout.toDevicePixels(safeArea.size.width)) {
                    newWidth = newWidth + (layout.toDevicePixels(fullscreen.size.width) - (onScreenLeft + width));
                }

                if (height && height < layout.toDevicePixels(fullscreen.size.height) && onScreenTop + height >= layout.toDevicePixels(safeArea.origin.y) + layout.toDevicePixels(safeArea.size.height)) {
                    newHeight = newHeight + (layout.toDevicePixels(fullscreen.size.height) - (onScreenTop + height));
                }

                const frameNew = CGRectMake(layout.toDeviceIndependentPixels(newLeft), layout.toDeviceIndependentPixels(newTop), layout.toDeviceIndependentPixels(newWidth), layout.toDeviceIndependentPixels(newHeight));
                nativeView.frame = frameNew;
            }

            // if (leftInset || topInset) {
            //     const frameNew = CGRectMake(layout.toDeviceIndependentPixels(left), layout.toDeviceIndependentPixels(top), layout.toDeviceIndependentPixels(right - left + leftInset), layout.toDeviceIndependentPixels(bottom - top + topInset));
            //     nativeView.frame = frameNew;
            //     const boundsOrigin = nativeView.bounds.origin;
            //     nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, frameNew.size.width, frameNew.size.height);
            // }
            // else {
                const boundsOrigin = nativeView.bounds.origin;
                nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, nativeView.frame.size.width, nativeView.frame.size.height);
            // }
        // }

            return nativeView.frame;
    }

    public _onOrientationChanged() {
        this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
    }
}

function getTabBarHeight(scrollView: ScrollView): number {
    let parent = scrollView.parent;
    while (parent) {
        const controller = parent.viewController;
        if (controller instanceof UITabBarController) {
            return uiUtils.ios.getActualHeight(controller.tabBar);
        }

        parent = parent.parent;
    }

    return 0;
}

ScrollView.prototype.recycleNativeView = "auto";