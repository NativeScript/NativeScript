// Definitions.
import { Point, View as ViewDefinition, dip } from ".";
import { ViewBase } from "../view-base";

import { ios as iosBackground, Background } from "../../styling/background";
// HACK: Webpack. Use a fully-qualified import to allow resolve.extensions(.ios.js) to
// kick in. `../utils` doesn't seem to trigger the webpack extensions mechanism.
import * as uiUtils from "tns-core-modules/ui/utils";

import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories
} from "./view-common";

import {
    Visibility,
    visibilityProperty, opacityProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty,
    backgroundInternalProperty, clipPathProperty
} from "../../styling/style-properties";
import { profile } from "../../../profiling";
import { ios as iosUtils } from "../../../utils/utils";

export * from "./view-common";

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

export class View extends ViewCommon {
    nativeViewProtected: UIView;
    private _hasTransfrom = false;
    private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
    private _cachedFrame: CGRect;
    private _suspendCATransaction = false;
    /**
     * Native background states.
     *  - `unset` - is the default, from this state it transitions to "invalid" in the base backgroundInternalProperty.setNative, overriding it without calling `super` will prevent the background from ever being drawn.
     *  - `invalid` - the view background must be redrawn on the next layot.
     *  - `drawn` - the view background has been property drawn, on subsequent layouts it may need to be redrawn if the background depends on the view's size.
     */
    _nativeBackgroundState: "unset" | "invalid" | "drawn";

    get isLayoutRequired(): boolean {
        return (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
    }

    get isLayoutRequested(): boolean {
        return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
    }

    public requestLayout(): void {
        super.requestLayout();
        this._privateFlags |= PFLAG_FORCE_LAYOUT;

        const parent = <View>this.parent;
        if (parent) {
            parent.requestLayout();
        }

        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            nativeView.setNeedsLayout();
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

    @profile
    public layout(left: number, top: number, right: number, bottom: number, setFrame = true): void {
        const { boundsChanged, sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
        if (setFrame) {
            this.layoutNativeView(left, top, right, bottom);
        }

        if (boundsChanged || (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED) {
            this.onLayout(left, top, right, bottom);
            this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
        }

        this.updateBackground(sizeChanged);
        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
    }

    private updateBackground(sizeChanged: boolean): void {
        if (sizeChanged) {
            this._onSizeChanged();
        } else if (this._nativeBackgroundState === "invalid") {
            const background = this.style.backgroundInternal;
            this._redrawNativeBackground(background);
        }
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        super.setMeasuredDimension(measuredWidth, measuredHeight);
        this._privateFlags |= PFLAG_MEASURED_DIMENSION_SET;
    }

    @profile
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const view = this.nativeViewProtected;
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
                const transform = nativeView.transform;
                nativeView.transform = CGAffineTransformIdentity;
                nativeView.frame = frame;
                nativeView.transform = transform;
            }
            else {
                nativeView.frame = frame;
            }

            const boundsOrigin = nativeView.bounds.origin;
            nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, frame.size.width, frame.size.height);
        }
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this.nativeViewProtected) {
            return;
        }

        const nativeView = this.nativeViewProtected;
        const frame = CGRectMake(layout.toDeviceIndependentPixels(left), layout.toDeviceIndependentPixels(top), layout.toDeviceIndependentPixels(right - left), layout.toDeviceIndependentPixels(bottom - top));
        this._setNativeViewFrame(nativeView, frame);
    }

    public _setLayoutFlags(left: number, top: number, right: number, bottom: number): void {
        const width = right - left;
        const height = bottom - top;
        const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);
        this._setCurrentMeasureSpecs(widthSpec, heightSpec);
        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
        this.setMeasuredDimension(width, height);

        const { sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
        this.updateBackground(sizeChanged);
        this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
        // NOTE: if there is transformation this frame will be incorrect.
        this._cachedFrame = this.nativeViewProtected.frame;
    }

    public focus(): boolean {
        if (this.ios) {
            return this.ios.becomeFirstResponder();
        }

        return false;
    }

    public getLocationInWindow(): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window) {
            return undefined;
        }

        const pointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        return {
            x: pointInWindow.x,
            y: pointInWindow.y
        };
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window) {
            return undefined;
        }

        const pointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        const pointOnScreen = this.nativeViewProtected.window.convertPointToWindow(pointInWindow, null);
        return {
            x: pointOnScreen.x,
            y: pointOnScreen.y
        };
    }

    public getLocationRelativeTo(otherView: ViewDefinition): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window ||
            !otherView.nativeViewProtected || !otherView.nativeViewProtected.window ||
            this.nativeViewProtected.window !== otherView.nativeViewProtected.window) {
            return undefined;
        }

        const myPointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        const otherPointInWindow = otherView.nativeViewProtected.convertPointToView(otherView.nativeViewProtected.bounds.origin, null);
        return {
            x: myPointInWindow.x - otherPointInWindow.x,
            y: myPointInWindow.y - otherPointInWindow.y
        };
    }

    private _onSizeChanged(): void {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }

        const background = this.style.backgroundInternal;
        const backgroundDependsOnSize = background.image
            || !background.hasUniformBorder()
            || background.hasBorderRadius();

        if (this._nativeBackgroundState === "invalid" || (this._nativeBackgroundState === "drawn" && backgroundDependsOnSize)) {
            this._redrawNativeBackground(background);
        }

        const clipPath = this.style.clipPath;
        if (clipPath !== "" && this[clipPathProperty.setNative]) {
            this[clipPathProperty.setNative](clipPath);
        }
    }

    public updateNativeTransform() {
        const scaleX = this.scaleX || 1e-6;
        const scaleY = this.scaleY || 1e-6;
        const rotate = this.rotate || 0;
        let newTransform = CGAffineTransformIdentity;
        newTransform = CGAffineTransformTranslate(newTransform, this.translateX, this.translateY);
        newTransform = CGAffineTransformRotate(newTransform, rotate * Math.PI / 180);
        newTransform = CGAffineTransformScale(newTransform, scaleX, scaleY);
        if (!CGAffineTransformEqualToTransform(this.nativeViewProtected.transform, newTransform)) {
            const updateSuspended = this._isPresentationLayerUpdateSuspeneded();
            if (!updateSuspended) {
                CATransaction.begin();
            }
            this.nativeViewProtected.transform = newTransform;
            this._hasTransfrom = this.nativeViewProtected && !CGAffineTransformEqualToTransform(this.nativeViewProtected.transform, CGAffineTransformIdentity);
            if (!updateSuspended) {
                CATransaction.commit();
            }
        }
    }

    public updateOriginPoint(originX: number, originY: number) {
        const newPoint = CGPointMake(originX, originY);
        this.nativeViewProtected.layer.anchorPoint = newPoint;
        if (this._cachedFrame) {
            this._setNativeViewFrame(this.nativeViewProtected, this._cachedFrame);
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
        return this._suspendCATransaction || this._suspendNativeUpdatesCount;
    }

    [isEnabledProperty.getDefault](): boolean {
        const nativeView = this.nativeViewProtected;
        return nativeView instanceof UIControl ? nativeView.enabled : true;
    }
    [isEnabledProperty.setNative](value: boolean) {
        const nativeView = this.nativeViewProtected;
        if (nativeView instanceof UIControl) {
            nativeView.enabled = value;
        }
    }

    [originXProperty.getDefault](): number {
        return this.nativeViewProtected.layer.anchorPoint.x;
    }
    [originXProperty.setNative](value: number) {
        this.updateOriginPoint(value, this.originY);
    }

    [originYProperty.getDefault](): number {
        return this.nativeViewProtected.layer.anchorPoint.y;
    }
    [originYProperty.setNative](value: number) {
        this.updateOriginPoint(this.originX, value);
    }

    [automationTextProperty.getDefault](): string {
        return this.nativeViewProtected.accessibilityLabel;
    }
    [automationTextProperty.setNative](value: string) {
        this.nativeViewProtected.accessibilityIdentifier = value;
        this.nativeViewProtected.accessibilityLabel = value;
    }

    [isUserInteractionEnabledProperty.getDefault](): boolean {
        return this.nativeViewProtected.userInteractionEnabled;
    }
    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.userInteractionEnabled = value;
    }

    [visibilityProperty.getDefault](): Visibility {
        return this.nativeViewProtected.hidden ? Visibility.COLLAPSE : Visibility.VISIBLE;
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this.nativeViewProtected.hidden = false;
                break;
            case Visibility.HIDDEN:
            case Visibility.COLLAPSE:
                this.nativeViewProtected.hidden = true;
                break;
            default:
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
    }

    [opacityProperty.getDefault](): number {
        return this.nativeViewProtected.alpha;
    }
    [opacityProperty.setNative](value: number) {
        let nativeView = this.nativeViewProtected;
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

    [translateXProperty.getDefault](): dip {
        return 0;
    }
    [translateXProperty.setNative](value: dip) {
        this.updateNativeTransform();
    }

    [translateYProperty.getDefault](): dip {
        return 0;
    }
    [translateYProperty.setNative](value: dip) {
        this.updateNativeTransform();
    }

    [zIndexProperty.getDefault](): number {
        return 0;
    }
    [zIndexProperty.setNative](value: number) {
        this.nativeViewProtected.layer.zPosition = value;
    }

    [backgroundInternalProperty.getDefault](): UIColor {
        return this.nativeViewProtected.backgroundColor;
    }
    [backgroundInternalProperty.setNative](value: UIColor | Background) {
        this._nativeBackgroundState = "invalid";
        if (this.isLayoutValid) {
            this._redrawNativeBackground(value);
        }
    }

    _redrawNativeBackground(value: UIColor | Background): void {
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }

        if (value instanceof UIColor) {
            this.nativeViewProtected.backgroundColor = value;
        } else {
            iosBackground.createBackgroundUIColor(this, (color: UIColor) => {
                this.nativeViewProtected.backgroundColor = color;
            });
            this._setNativeClipToBounds();
        }

        if (!updateSuspended) {
            CATransaction.commit();
        }

        this._nativeBackgroundState = "drawn";
    }

    _setNativeClipToBounds() {
        const backgroundInternal = this.style.backgroundInternal;
        this.nativeViewProtected.clipsToBounds =
            this.nativeViewProtected instanceof UIScrollView ||
            backgroundInternal.hasBorderWidth() ||
            backgroundInternal.hasBorderRadius();
    }
}
View.prototype._nativeBackgroundState = "unset";

export class CustomLayoutView extends View {

    nativeViewProtected: UIView;

    constructor() {
        super();
        this.nativeViewProtected = UIView.alloc().initWithFrame(iosUtils.getter(UIScreen, UIScreen.mainScreen).bounds);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        super._addViewToNativeVisualTree(child, atIndex);

        const parentNativeView = this.nativeViewProtected;
        const childNativeView = child.nativeViewProtected;

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

        if (child.nativeViewProtected) {
            child.nativeViewProtected.removeFromSuperview();
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        const nativeView = this.nativeViewProtected;
        if (nativeView && !this.isCollapsed) {
            const frame = nativeView.frame;
            const origin = frame.origin;
            const size = frame.size;
            return {
                left: layout.toDevicePixels(origin.x),
                top: layout.toDevicePixels(origin.y),
                right: layout.toDevicePixels(origin.x + size.width),
                bottom: layout.toDevicePixels(origin.y + size.height)
            };
        } else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
    }
}

function isScrollable(controller: UIViewController, owner: View): boolean {
    let scrollable = (<any>owner).scrollableContent;
    if (scrollable === undefined) {
        let view: UIView = controller.view.subviews.count > 0 ? controller.view.subviews[0] : null;
        if (!(controller instanceof ios.UILayoutViewController)) {
            // Propbably we are PageViewController. Consider different cases
            if (view && view.subviews.count > 0) {
                // Take page content.
                view = view.subviews[0];
            }
        }

        if (view instanceof UIScrollView) {
            scrollable = true;
        }
    }

    return scrollable === true || scrollable === "true";;
}

const majorVersion = iosUtils.MajorVersion;

interface ExtendedController extends UIViewController {
    scrollable: boolean;
    navBarHidden: boolean;
    hasChildControllers: boolean;

    safeAreaLeft: NSLayoutConstraint;
    safeAreaTop: NSLayoutConstraint;
    safeAreaRight: NSLayoutConstraint;
    safeAreaBottom: NSLayoutConstraint;
    fullscreenTop: NSLayoutConstraint;
    fullscreenBottom: NSLayoutConstraint;
    activeConstraints: NSLayoutConstraint[];
}

export namespace ios {
    function constrainView(controller: ExtendedController, owner: View): void {
        const root = controller.view;
        const view = root.subviews[0];

        if (!controller.safeAreaTop) {
            view.translatesAutoresizingMaskIntoConstraints = false;
            if (majorVersion > 10) {
                const safeArea = root.safeAreaLayoutGuide;
                controller.safeAreaTop = view.topAnchor.constraintEqualToAnchor(safeArea.topAnchor);
                controller.fullscreenTop = view.topAnchor.constraintEqualToAnchor(root.topAnchor);
                controller.safeAreaBottom = view.bottomAnchor.constraintEqualToAnchor(safeArea.bottomAnchor);
                controller.fullscreenBottom = view.bottomAnchor.constraintEqualToAnchor(root.bottomAnchor);
                controller.safeAreaLeft = view.leftAnchor.constraintEqualToAnchor(safeArea.leftAnchor);
                controller.safeAreaRight = view.rightAnchor.constraintEqualToAnchor(safeArea.rightAnchor);
            } else {
                controller.safeAreaTop = view.topAnchor.constraintEqualToAnchor(controller.topLayoutGuide.bottomAnchor);
                controller.fullscreenTop = view.topAnchor.constraintEqualToAnchor(root.topAnchor);
                controller.safeAreaBottom = view.bottomAnchor.constraintEqualToAnchor(controller.bottomLayoutGuide.topAnchor);
                controller.fullscreenBottom = view.bottomAnchor.constraintEqualToAnchor(root.bottomAnchor);
                controller.safeAreaLeft = view.leadingAnchor.constraintEqualToAnchor(root.leadingAnchor);
                controller.safeAreaRight = view.trailingAnchor.constraintEqualToAnchor(root.trailingAnchor);
            }
        }

        const navBarHidden = controller.navBarHidden;
        const scrollable = controller.scrollable;;
        const hasChildControllers = controller.hasChildControllers;
        const constraints = [
            hasChildControllers || scrollable ? controller.fullscreenBottom : controller.safeAreaBottom,
            controller.safeAreaLeft,
            controller.safeAreaRight
        ];

        if (hasChildControllers) {
            // If not inner most extend to fullscreen
            constraints.push(controller.fullscreenTop);
        } else if (!scrollable) {
            // If not scrollable dock under safe area
            constraints.push(controller.safeAreaTop);
        } else if (navBarHidden) {
            // If scrollable but no navigation bar dock under safe area
            constraints.push(controller.safeAreaTop);
        } else {
            // If scrollable and navigation bar extend to fullscreen
            constraints.push(controller.fullscreenTop);
        }

        const activeConstraints = controller.activeConstraints;
        if (activeConstraints) {
            NSLayoutConstraint.deactivateConstraints(<any>activeConstraints);
        }

        NSLayoutConstraint.activateConstraints(<any>constraints);
        controller.activeConstraints = constraints;
    }

    export function updateConstraints(controller: UIViewController, owner: View): void {
        const extendedController = <ExtendedController>controller;
        const navController = controller.navigationController;
        const navBarHidden = navController ? navController.navigationBarHidden : true;
        const scrollable = (owner && isScrollable(controller, owner));
        const hasChildControllers = controller.childViewControllers.count > 0;

        if (extendedController.scrollable !== scrollable
            || extendedController.navBarHidden !== navBarHidden
            || extendedController.hasChildControllers !== hasChildControllers) {
            extendedController.scrollable = scrollable;
            extendedController.navBarHidden = navBarHidden;
            extendedController.hasChildControllers = hasChildControllers;
            constrainView(extendedController, owner);
        }
    }

    export function layoutView(controller: UIViewController, owner: View): void {
        // If we are not most inner controller - don't layout
        if (controller.childViewControllers.count > 0) {
            return;
        }

        const frame = controller.view.subviews[0].bounds;
        const origin = frame.origin;
        const size = frame.size;
        const width = layout.toDevicePixels(size.width);
        const height = layout.toDevicePixels(size.height);

        const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);

        View.measureChild(null, owner, widthSpec, heightSpec);
        const left = layout.toDevicePixels(origin.x);
        const top = layout.toDevicePixels(origin.y);
        View.layoutChild(null, owner, left, top, width + left, height + top, false);

        layoutParent(owner.parent);
    }

    function layoutParent(view: ViewBase): void {
        if (!view) {
            return;
        }

        if (view instanceof View) {
            const frame = view.nativeViewProtected.frame;
            const origin = frame.origin;
            const size = frame.size;
            const left = layout.toDevicePixels(origin.x);
            const top = layout.toDevicePixels(origin.y);
            const width = layout.toDevicePixels(size.width);
            const height = layout.toDevicePixels(size.height);
            view._setLayoutFlags(left, top, width + left, height + top);
        }

        layoutParent(view.parent);
    }

    export class UILayoutViewController extends UIViewController {
        public owner: WeakRef<View>;

        public static initWithOwner(owner: WeakRef<View>): UILayoutViewController {
            const controller = <UILayoutViewController>UILayoutViewController.new();
            controller.owner = owner;
            return controller;
        }

        public viewWillLayoutSubviews(): void {
            super.viewWillLayoutSubviews();
            updateConstraints(this, this.owner.get())
        }

        public viewDidLayoutSubviews(): void {
            super.viewDidLayoutSubviews();
            layoutView(this, this.owner.get());
        }
    }
}
