import { Point, View as ViewDefinition } from "ui/core/view";
import { ios } from "ui/styling/background";
import {
    ViewCommon, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty, visibilityProperty, opacityProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty,
    clipPathProperty, layout, traceEnabled, traceWrite, traceCategories, Background, Visibility
} from "./view-common";

export * from "./view-common";

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

export class View extends ViewCommon {
    private _hasTransfrom = false;
    private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
    private _cachedFrame: CGRect;
    private _suspendCATransaction = false;

    public _addViewCore(view: ViewCommon, atIndex?: number) {
        super._addViewCore(view, atIndex);
        this.requestLayout();
    }

    public _removeViewCore(view: ViewCommon) {
        super._removeViewCore(view);
        // TODO: Detach from the context?
        view._onDetached();
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
        let view = this.nativeView;
        let nativeWidth = 0;
        let nativeHeight = 0;

        let width = layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        let height = layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        if (view) {
            if (widthMode === layout.UNSPECIFIED) {
                width = Number.POSITIVE_INFINITY;
            }

            if (heightMode === layout.UNSPECIFIED) {
                height = Number.POSITIVE_INFINITY;
            }

            let nativeSize = view.sizeThatFits(CGSizeMake(width, height));
            nativeWidth = nativeSize.width;
            nativeHeight = nativeSize.height;
        }

        let style = this.style;
        let measureWidth = Math.max(nativeWidth, style.effectiveMinWidth);
        let measureHeight = Math.max(nativeHeight, style.effectiveMinHeight);

        let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        if (!CGRectEqualToRect(nativeView.frame, frame)) {
            if (traceEnabled) {
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

        // This is done because when rotated in iOS7 there is rotation applied on the first subview on the Window which is our frame.nativeView.view.
        // // If we set it it should be transformed so it is correct.
        // // When in landscape in iOS 7 there is transformation on the first subview of the window so we set frame to its subview.
        // // in iOS 8 we set frame to subview again otherwise we get clipped.
        // let nativeView: UIView;
        // if (!this.parent && this.nativeView.subviews.count > 0 && ios.MajorVersion < 8) {
        //     if (traceEnabled) {
        //         traceWrite(this + " has no parent. Setting frame to first child instead.", traceCategories.Layout);
        //     }
        //     nativeView = (<UIView>this.nativeView.subviews[0]);
        // }
        // else {
        let nativeView = this.nativeView;
        // }

        let frame = CGRectMake(left, top, right - left, bottom - top);
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
            x: layout.toDeviceIndependentPixels(pointInWindow.x),
            y: layout.toDeviceIndependentPixels(pointInWindow.y),
        };
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeView || !this.nativeView.window) {
            return undefined;
        }

        let pointInWindow = this.nativeView.convertPointToView(this.nativeView.bounds.origin, null);
        let pointOnScreen = this.nativeView.window.convertPointToWindow(pointInWindow, null);
        return {
            x: layout.toDeviceIndependentPixels(pointOnScreen.x),
            y: layout.toDeviceIndependentPixels(pointOnScreen.y),
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
            x: layout.toDeviceIndependentPixels(myPointInWindow.x - otherPointInWindow.x),
            y: layout.toDeviceIndependentPixels(myPointInWindow.y - otherPointInWindow.y),
        };
    }

    private _onSizeChanged(): void {
        let nativeView = this.nativeView;
        if (!nativeView) {
            return;
        }

        let background = this.style.backgroundInternal;
        if (!background.isEmpty()) {
            this[backgroundInternalProperty.native] = background;
        }

        let clipPath = this.style.clipPath;
        if (clipPath !== "") {
            this[clipPathProperty.native] = clipPath;
        }
    }

    public updateNativeTransform() {
        let translateX = this.translateX || 0;
        let translateY = this.translateY || 0;
        let scaleX = this.scaleX || 1;
        let scaleY = this.scaleY || 1;
        let rotate = this.rotate || 0;
        let newTransform = CGAffineTransformIdentity;
        newTransform = CGAffineTransformTranslate(newTransform, translateX, translateY);
        newTransform = CGAffineTransformRotate(newTransform, rotate * Math.PI / 180);
        newTransform = CGAffineTransformScale(newTransform, scaleX === 0 ? 0.001 : scaleX, scaleY === 0 ? 0.001 : scaleY);
        if (!CGAffineTransformEqualToTransform(this.nativeView.transform, newTransform)) {
            this.nativeView.transform = newTransform;
            this._hasTransfrom = this.nativeView && !CGAffineTransformEqualToTransform(this.nativeView.transform, CGAffineTransformIdentity);
        }
    }

    public updateOriginPoint(originX: number, originY: number) {
        let newPoint = CGPointMake(originX, originY);
        this.nativeView.layer.anchorPoint = newPoint;
        if (this._cachedFrame) {
            this._setNativeViewFrame(this.nativeView, this._cachedFrame);
        }
    }

    public _addToSuperview(superview: any, atIndex: number = Number.POSITIVE_INFINITY): boolean {
        if (superview && this.nativeView) {
            if (atIndex >= superview.subviews.count) {
                superview.addSubview(this.nativeView);
            } else {
                superview.insertSubviewAtIndex(this.nativeView, atIndex);
            }

            return true;
        }

        return false;
    }

    public _removeFromSuperview() {
        if (this.nativeView) {
            this.nativeView.removeFromSuperview();
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
        return this._suspendCATransaction;
    }

    get [isEnabledProperty.native](): boolean {
        let nativeView = this.nativeView;
        return nativeView instanceof UIControl ? nativeView.enabled : true;
    }
    set [isEnabledProperty.native](value: boolean) {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIControl) {
            nativeView.enabled = value;
        }
    }

    get [originXProperty.native](): number {
        return this.nativeView.layer.anchorPoint.x;
    }
    set [originXProperty.native](value: number) {
        this.updateOriginPoint(value, this.originY);
    }

    get [originYProperty.native](): number {
        return this.nativeView.layer.anchorPoint.y;
    }
    set [originYProperty.native](value: number) {
        this.updateOriginPoint(this.originX, value);
    }

    get [automationTextProperty.native](): string {
        return this.nativeView.accessibilityLabel;
    }
    set [automationTextProperty.native](value: string) {
        this.nativeView.accessibilityIdentifier = value;
        this.nativeView.accessibilityLabel = value;
    }

    get [isUserInteractionEnabledProperty.native](): boolean {
        return this.nativeView.userInteractionEnabled;
    }
    set [isUserInteractionEnabledProperty.native](value: boolean) {
        this.nativeView.userInteractionEnabled = value;
    }

    get [visibilityProperty.native](): Visibility {
        return this.nativeView.hidden ? Visibility.COLLAPSE : Visibility.VISIBLE;
    }
    set [visibilityProperty.native](value: Visibility) {
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

    get [opacityProperty.native](): number {
        return this.nativeView.alpha;
    }
    set [opacityProperty.native](value: number) {
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

    get [rotateProperty.native](): number {
        return 0;
    }
    set [rotateProperty.native](value: number) {
        this.updateNativeTransform();
    }

    get [scaleXProperty.native](): number {
        return 1;
    }
    set [scaleXProperty.native](value: number) {
        this.updateNativeTransform();
    }

    get [scaleYProperty.native](): number {
        return 1;
    }
    set [scaleYProperty.native](value: number) {
        this.updateNativeTransform();
    }

    get [translateXProperty.native](): number {
        return 0;
    }
    set [translateXProperty.native](value: number) {
        this.updateNativeTransform();
    }

    get [translateYProperty.native](): number {
        return 0;
    }
    set [translateYProperty.native](value: number) {
        this.updateNativeTransform();
    }

    get [zIndexProperty.native](): number {
        return 0;
    }
    set [zIndexProperty.native](value: number) {
        this.nativeView.layer.zPosition = value;
    }

    get [backgroundInternalProperty.native](): UIColor {
        return this.nativeView.backgroundColor;
    }
    set [backgroundInternalProperty.native](value: UIColor | Background) {
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }

        if (value instanceof UIColor) {
            this.nativeView.backgroundColor = value;
        } else {
            this.nativeView.backgroundColor = ios.createBackgroundUIColor(this);
        }
        if (!updateSuspended) {
            CATransaction.commit();
        }
    }
}

export class CustomLayoutView extends View {

    private _view: UIView;

    constructor() {
        super();
        this._view = UIView.new();
    }

    get ios(): UIView {
        return this._view;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        super._addViewToNativeVisualTree(child, atIndex);

        return child._addToSuperview(this.nativeView, atIndex);
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        child._removeFromSuperview();
    }
}
