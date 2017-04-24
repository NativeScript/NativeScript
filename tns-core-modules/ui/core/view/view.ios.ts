// Definitions.
import { Point, View as ViewDefinition } from ".";

import { ios, Background } from "../../styling/background";
import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories
} from "./view-common";

import {
    Visibility, Length,
    visibilityProperty, opacityProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty,
    backgroundInternalProperty, clipPathProperty
} from "../../styling/style-properties";

export * from "./view-common";

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

export class View extends ViewCommon {
    nativeView: UIView;
    private _hasTransfrom = false;
    private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
    private _cachedFrame: CGRect;
    private _suspendCATransaction = false;

    // get nativeView(): UIView {
    //     return this.ios;
    // }

    public _addViewCore(view: ViewCommon, atIndex?: number) {
        super._addViewCore(view, atIndex);
        this.requestLayout();
    }

    public _removeViewCore(view: ViewCommon) {
        super._removeViewCore(view);
        this.requestLayout();
    }

    get isLayoutRequired(): boolean {
        return (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
    }

    get isLayoutRequested(): boolean {
        return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
    }

    public requestLayout(): void {
        super.requestLayout();
        this._privateFlags |= PFLAG_FORCE_LAYOUT;

        let parent = <View>this.parent;
        if (parent && !parent.isLayoutRequested) {
            parent.requestLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let measureSpecsChanged = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        let forceLayout = (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
        if (forceLayout || measureSpecsChanged) {

            // first clears the measured dimension flag
            this._privateFlags &= ~PFLAG_MEASURED_DIMENSION_SET;

            // measure ourselves, this should set the measured dimension flag back
            this.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this._privateFlags |= PFLAG_LAYOUT_REQUIRED;

            // flag not set, setMeasuredDimension() was not invoked, we raise
            // an exception to warn the developer
            if ((this._privateFlags & PFLAG_MEASURED_DIMENSION_SET) !== PFLAG_MEASURED_DIMENSION_SET) {
                throw new Error("onMeasure() did not set the measured dimension by calling setMeasuredDimension() " + this);
            }
        }
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        let { boundsChanged, sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
        this.layoutNativeView(left, top, right, bottom);
        if (boundsChanged || (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED) {
            this.onLayout(left, top, right, bottom);
            this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
        }

        if (sizeChanged) {
            this._onSizeChanged();
        }

        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        super.setMeasuredDimension(measuredWidth, measuredHeight);
        this._privateFlags |= PFLAG_MEASURED_DIMENSION_SET;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const view = this.nativeView;
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let nativeWidth = 0;
        let nativeHeight = 0;
        if (view) {
            const nativeSize = layout.measureNativeView(view, width, widthMode, height, heightMode);
            nativeWidth = nativeSize.width;
            nativeHeight = nativeSize.height;
        }

        const measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
        const measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);

        const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        if (!CGRectEqualToRect(nativeView.frame, frame)) {
            if (traceEnabled()) {
                traceWrite(this + ", Native setFrame: = " + NSStringFromCGRect(frame), traceCategories.Layout);
            }
            this._cachedFrame = frame;
            if (this._hasTransfrom) {
                // Always set identity transform before setting frame;
                let transform = nativeView.transform;
                nativeView.transform = CGAffineTransformIdentity;
                nativeView.frame = frame;
                nativeView.transform = transform;
            }
            else {
                nativeView.frame = frame;
            }
            let boundsOrigin = nativeView.bounds.origin;
            nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, frame.size.width, frame.size.height);
        }
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this.nativeView) {
            return;
        }

        let nativeView = this.nativeView;

        let frame = CGRectMake(layout.toDeviceIndependentPixels(left), layout.toDeviceIndependentPixels(top), layout.toDeviceIndependentPixels(right - left), layout.toDeviceIndependentPixels(bottom - top));
        this._setNativeViewFrame(nativeView, frame);
    }

    public _updateLayout() {
        let oldBounds = this._getCurrentLayoutBounds();
        this.layoutNativeView(oldBounds.left, oldBounds.top, oldBounds.right, oldBounds.bottom);
    }

    public focus(): boolean {
        if (this.ios) {
            return this.ios.becomeFirstResponder();
        }

        return false;
    }

    public getLocationInWindow(): Point {
        if (!this.nativeView || !this.nativeView.window) {
            return undefined;
        }

        let pointInWindow = this.nativeView.convertPointToView(this.nativeView.bounds.origin, null);
        return {
            x: pointInWindow.x,
            y: pointInWindow.y
        };
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeView || !this.nativeView.window) {
            return undefined;
        }

        let pointInWindow = this.nativeView.convertPointToView(this.nativeView.bounds.origin, null);
        let pointOnScreen = this.nativeView.window.convertPointToWindow(pointInWindow, null);
        return {
            x: pointOnScreen.x,
            y: pointOnScreen.y
        };
    }

    public getLocationRelativeTo(otherView: ViewDefinition): Point {
        if (!this.nativeView || !this.nativeView.window ||
            !otherView.nativeView || !otherView.nativeView.window ||
            this.nativeView.window !== otherView.nativeView.window) {
            return undefined;
        }

        let myPointInWindow = this.nativeView.convertPointToView(this.nativeView.bounds.origin, null);
        let otherPointInWindow = otherView.nativeView.convertPointToView(otherView.nativeView.bounds.origin, null);
        return {
            x: myPointInWindow.x - otherPointInWindow.x,
            y: myPointInWindow.y - otherPointInWindow.y
        };
    }

    private _onSizeChanged(): void {
        let nativeView = this.nativeView;
        if (!nativeView) {
            return;
        }

        let background = this.style.backgroundInternal;
        if (!background.isEmpty() && this[backgroundInternalProperty.setNative]) {
            this[backgroundInternalProperty.setNative](background);
        }

        let clipPath = this.style.clipPath;
        if (clipPath !== "" && this[clipPathProperty.setNative]) {
            this[clipPathProperty.setNative](clipPath);
        }
    }

    public updateNativeTransform() {
        let translateX = layout.toDeviceIndependentPixels(Length.toDevicePixels(this.translateX || 0, 0));
        let translateY = layout.toDeviceIndependentPixels(Length.toDevicePixels(this.translateY || 0, 0));
        let scaleX = this.scaleX || 1e-6;
        let scaleY = this.scaleY || 1e-6;
        let rotate = this.rotate || 0;
        let newTransform = CGAffineTransformIdentity;
        newTransform = CGAffineTransformTranslate(newTransform, translateX, translateY);
        newTransform = CGAffineTransformRotate(newTransform, rotate * Math.PI / 180);
        newTransform = CGAffineTransformScale(newTransform, scaleX, scaleY);
        if (!CGAffineTransformEqualToTransform(this.nativeView.transform, newTransform)) {
            let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
            if (!updateSuspended) {
                CATransaction.begin();
            }
            this.nativeView.transform = newTransform;
            this._hasTransfrom = this.nativeView && !CGAffineTransformEqualToTransform(this.nativeView.transform, CGAffineTransformIdentity);
            if (!updateSuspended) {
                CATransaction.commit();
            }
        }
    }

    public updateOriginPoint(originX: number, originY: number) {
        let newPoint = CGPointMake(originX, originY);
        this.nativeView.layer.anchorPoint = newPoint;
        if (this._cachedFrame) {
            this._setNativeViewFrame(this.nativeView, this._cachedFrame);
        }
    }

    // By default we update the view's presentation layer when setting backgroundColor and opacity properties.
    // This is done by calling CATransaction begin and commit methods.
    // This action should be disabled when updating those properties during an animation.
    public _suspendPresentationLayerUpdates() {
        this._suspendCATransaction = true;
    }

    public _resumePresentationLayerUpdates() {
        this._suspendCATransaction = false;
    }

    public _isPresentationLayerUpdateSuspeneded() {
        return this._suspendCATransaction || this._batchUpdateScope;
    }

    [isEnabledProperty.getDefault](): boolean {
        let nativeView = this.nativeView;
        return nativeView instanceof UIControl ? nativeView.enabled : true;
    }
    [isEnabledProperty.setNative](value: boolean) {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIControl) {
            nativeView.enabled = value;
        }
    }

    [originXProperty.getDefault](): number {
        return this.nativeView.layer.anchorPoint.x;
    }
    [originXProperty.setNative](value: number) {
        this.updateOriginPoint(value, this.originY);
    }

    [originYProperty.getDefault](): number {
        return this.nativeView.layer.anchorPoint.y;
    }
    [originYProperty.setNative](value: number) {
        this.updateOriginPoint(this.originX, value);
    }

    [automationTextProperty.getDefault](): string {
        return this.nativeView.accessibilityLabel;
    }
    [automationTextProperty.setNative](value: string) {
        this.nativeView.accessibilityIdentifier = value;
        this.nativeView.accessibilityLabel = value;
    }

    [isUserInteractionEnabledProperty.getDefault](): boolean {
        return this.nativeView.userInteractionEnabled;
    }
    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        this.nativeView.userInteractionEnabled = value;
    }

    [visibilityProperty.getDefault](): Visibility {
        return this.nativeView.hidden ? Visibility.COLLAPSE : Visibility.VISIBLE;
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this.nativeView.hidden = false;
                break;
            case Visibility.HIDDEN:
            case Visibility.COLLAPSE:
                this.nativeView.hidden = true;
                break;
            default:
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
    }

    [opacityProperty.getDefault](): number {
        return this.nativeView.alpha;
    }
    [opacityProperty.setNative](value: number) {
        let nativeView = this.nativeView;
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }
        nativeView.alpha = value;
        if (!updateSuspended) {
            CATransaction.commit();
        }
    }

    [rotateProperty.getDefault](): number {
        return 0;
    }
    [rotateProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [scaleXProperty.getDefault](): number {
        return 1;
    }
    [scaleXProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [scaleYProperty.getDefault](): number {
        return 1;
    }
    [scaleYProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [translateXProperty.getDefault](): Length | number {
        return 0;
    }
    [translateXProperty.setNative](value: Length) {
        this.updateNativeTransform();
    }

    [translateYProperty.getDefault](): Length | number {
        return 0;
    }
    [translateYProperty.setNative](value: Length) {
        this.updateNativeTransform();
    }

    [zIndexProperty.getDefault](): number {
        return 0;
    }
    [zIndexProperty.setNative](value: number) {
        this.nativeView.layer.zPosition = value;
    }

    [backgroundInternalProperty.getDefault](): UIColor {
        return this.nativeView.backgroundColor;
    }
    [backgroundInternalProperty.setNative](value: UIColor | Background) {
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }

        if (value instanceof UIColor) {
            this.nativeView.backgroundColor = value;
        } else {
            ios.createBackgroundUIColor(this, (color: UIColor) => {
                this.nativeView.backgroundColor = color;
            });
            this._setNativeClipToBounds();
        }

        if (!updateSuspended) {
            CATransaction.commit();
        }
    }

    _setNativeClipToBounds() {
        let backgroundInternal = this.style.backgroundInternal;
        this.nativeView.clipsToBounds = backgroundInternal.hasBorderWidth() || backgroundInternal.hasBorderRadius();
    }
}

export class CustomLayoutView extends View {

    nativeView: UIView;

    constructor() {
        super();
        this.nativeView = UIView.new();
    }

    get ios(): UIView {
        return this.nativeView;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        super._addViewToNativeVisualTree(child, atIndex);

        const parentNativeView = this.nativeView;
        const childNativeView = child.nativeView;

        if (parentNativeView && childNativeView) {
            if (typeof atIndex !== "number" || atIndex >= parentNativeView.subviews.count) {
                parentNativeView.addSubview(childNativeView);
            } else {
                parentNativeView.insertSubviewAtIndex(childNativeView, atIndex);
            }

            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (child.nativeView) {
            child.nativeView.removeFromSuperview();
        }
    }
}