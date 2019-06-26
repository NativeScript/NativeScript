// Definitions.
import { Point, View as ViewDefinition, dip } from ".";
import { ViewBase } from "../view-base";

import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories, traceError, traceMessageType, ShowModalOptions
} from "./view-common";

import { ios as iosBackground, Background } from "../../styling/background";
import { ios as iosUtils } from "../../../utils/utils";
import {
    Visibility,
    visibilityProperty, opacityProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty,
    backgroundInternalProperty, clipPathProperty
} from "../../styling/style-properties";
import { profile } from "../../../profiling";

export * from "./view-common";

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

const majorVersion = iosUtils.MajorVersion;

export class View extends ViewCommon {
    nativeViewProtected: UIView;
    viewController: UIViewController;
    private _popoverPresentationDelegate: ios.UIPopoverPresentationControllerDelegateImp;

    private _isLaidOut = false;
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

        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            nativeView.setNeedsLayout();
        }

        if (this.viewController && this.viewController.view !== nativeView) {
            this.viewController.view.setNeedsLayout();
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
            let position = { left, top, right, bottom };
            if (this.nativeViewProtected && majorVersion > 10) {
                // on iOS 11+ it is possible to have a changed layout frame due to safe area insets
                // get the frame and adjust the position, so that onLayout works correctly
                const frame = this.nativeViewProtected.frame;
                position = ios.getPositionFromFrame(frame);
            }

            this.onLayout(position.left, position.top, position.right, position.bottom);
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

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect): void {
        let oldFrame = this._cachedFrame || nativeView.frame;
        if (!CGRectEqualToRect(oldFrame, frame)) {
            if (traceEnabled()) {
                traceWrite(this + " :_setNativeViewFrame: " + JSON.stringify(ios.getPositionFromFrame(frame)), traceCategories.Layout);
            }
            this._cachedFrame = frame;
            let adjustedFrame = null;
            let transform = null;
            if (this._hasTransfrom) {
                // Always set identity transform before setting frame;
                transform = nativeView.transform;
                nativeView.transform = CGAffineTransformIdentity;
                nativeView.frame = frame;
            } else {
                nativeView.frame = frame;
            }

            adjustedFrame = this.applySafeAreaInsets(frame);
            if (adjustedFrame) {
                nativeView.frame = adjustedFrame;
            }

            if (this._hasTransfrom) {
                // re-apply the transform after the frame is adjusted
                nativeView.transform = transform;
            }

            const boundsOrigin = nativeView.bounds.origin;
            const boundsFrame = adjustedFrame || frame;
            nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, boundsFrame.size.width, boundsFrame.size.height);

            this._raiseLayoutChangedEvent();
            this._isLaidOut = true;
        } else if (!this._isLaidOut) {
            // Rects could be equal on the first layout and an event should be raised.
            this._raiseLayoutChangedEvent();
            // But make sure event is raised only once if rects are equal on the first layout as
            // this method is called twice with equal rects in landscape mode (vs only once in portrait)
            this._isLaidOut = true;
        }
    }

    get isLayoutValid(): boolean {
        if (this.nativeViewProtected) {
            return this._isLayoutValid;
        }

        return false;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this.nativeViewProtected) {
            return;
        }

        const nativeView = this.nativeViewProtected;
        const frame = ios.getFrameFromPosition({ left, top, right, bottom });
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
    }

    public focus(): boolean {
        if (this.ios) {
            return this.ios.becomeFirstResponder();
        }

        return false;
    }

    protected applySafeAreaInsets(frame: CGRect): CGRect {
        if (majorVersion <= 10) {
            return null;
        }

        if (!this.iosOverflowSafeArea || !this.iosOverflowSafeAreaEnabled) {
            return ios.shrinkToSafeArea(this, frame);
        } else if (this.nativeViewProtected && this.nativeViewProtected.window) {
            return ios.expandBeyondSafeArea(this, frame);
        }

        return null;
    }

    public getSafeAreaInsets(): { left, top, right, bottom } {
        const safeAreaInsets = this.nativeViewProtected && this.nativeViewProtected.safeAreaInsets;
        let insets = { left: 0, top: 0, right: 0, bottom: 0 };

        if (safeAreaInsets) {
            insets.left = layout.round(layout.toDevicePixels(safeAreaInsets.left));
            insets.top = layout.round(layout.toDevicePixels(safeAreaInsets.top));
            insets.right = layout.round(layout.toDevicePixels(safeAreaInsets.right));
            insets.bottom = layout.round(layout.toDevicePixels(safeAreaInsets.bottom));
        }

        return insets;
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

    protected _showNativeModalView(parent: View, options: ShowModalOptions) {
        const parentWithController = ios.getParentWithViewController(parent);
        if (!parentWithController) {
            traceWrite(`Could not find parent with viewController for ${parent} while showing modal view.`,
                traceCategories.ViewHierarchy, traceMessageType.error);

            return;
        }

        const parentController = parentWithController.viewController;
        if (parentController.presentedViewController) {
            traceWrite("Parent is already presenting view controller. Close the current modal page before showing another one!",
                traceCategories.ViewHierarchy, traceMessageType.error);

            return;
        }

        if (!parentController.view || !parentController.view.window) {
            traceWrite("Parent page is not part of the window hierarchy.",
                traceCategories.ViewHierarchy, traceMessageType.error);

            return;
        }

        this._setupAsRootView({});

        super._showNativeModalView(parentWithController, options);
        let controller = this.viewController;
        if (!controller) {
            const nativeView = this.ios || this.nativeViewProtected;
            controller = ios.UILayoutViewController.initWithOwner(new WeakRef(this));

            if (nativeView instanceof UIView) {
                controller.view.addSubview(nativeView);
            }

            this.viewController = controller;
        }

        if (options.fullscreen) {
            controller.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
        } else {
            controller.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
        }

        if (options.ios && options.ios.presentationStyle) {
            const presentationStyle = options.ios.presentationStyle;
            controller.modalPresentationStyle = presentationStyle;

            if (presentationStyle === UIModalPresentationStyle.Popover) {
                const popoverPresentationController = controller.popoverPresentationController;
                this._popoverPresentationDelegate = ios.UIPopoverPresentationControllerDelegateImp.initWithOwnerAndCallback(new WeakRef(this), this._closeModalCallback);
                popoverPresentationController.delegate = this._popoverPresentationDelegate;
                const view = parent.nativeViewProtected;
                // Note: sourceView and sourceRect are needed to specify the anchor location for the popover.
                // Note: sourceView should be the button triggering the modal. If it the Page the popover might appear "behind" the page content
                popoverPresentationController.sourceView = view;
                popoverPresentationController.sourceRect = CGRectMake(0, 0, view.frame.size.width, view.frame.size.height);
            }
        }

        this.horizontalAlignment = "stretch";
        this.verticalAlignment = "stretch";

        this._raiseShowingModallyEvent();
        const animated = options.animated === undefined ? true : !!options.animated;
        (<any>controller).animated = animated;
        parentController.presentViewControllerAnimatedCompletion(controller, animated, null);
        const transitionCoordinator = parentController.transitionCoordinator;
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion
                .call(transitionCoordinator, null, () => this._raiseShownModallyEvent());
        } else {
            // Apparently iOS 9+ stops all transitions and animations upon application suspend and transitionCoordinator becomes null here in this case.
            // Since we are not waiting for any transition to complete, i.e. transitionCoordinator is null, we can directly raise our shownModally event.
            // Take a look at https://github.com/NativeScript/NativeScript/issues/2173 for more info and a sample project.
            this._raiseShownModallyEvent();
        }
    }

    protected _hideNativeModalView(parent: View, whenClosedCallback: () => void) {
        if (!parent || !parent.viewController) {
            traceError("Trying to hide modal view but no parent with viewController specified.");

            return;
        }

        // modal view has already been closed by UI, probably as a popover
        if (!parent.viewController.presentedViewController) {
            whenClosedCallback();

            return;
        }

        const parentController = parent.viewController;
        const animated = (<any>this.viewController).animated;

        parentController.dismissViewControllerAnimatedCompletion(animated, whenClosedCallback);
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

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        const nativeView = this.nativeViewProtected;
        if (nativeView && !this.isCollapsed) {
            const frame = nativeView.frame;
            const origin = frame.origin;
            const size = frame.size;

            return {
                left: Math.round(layout.toDevicePixels(origin.x)),
                top: Math.round(layout.toDevicePixels(origin.y)),
                right: Math.round(layout.toDevicePixels(origin.x + size.width)),
                bottom: Math.round(layout.toDevicePixels(origin.y + size.height))
            };
        } else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
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

export class ContainerView extends View {

    public iosOverflowSafeArea: boolean;

    constructor() {
        super();
        this.iosOverflowSafeArea = true;
    }
}

export class CustomLayoutView extends ContainerView {

    nativeViewProtected: UIView;

    createNativeView() {
        return UIView.alloc().initWithFrame(UIScreen.mainScreen.bounds);
    }

    get ios(): UIView {
        return this.nativeViewProtected;
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
}

export namespace ios {
    export function getParentWithViewController(view: View): View {
        while (view && !view.viewController) {
            view = view.parent as View;
        }

        // Note: Might return undefined if no parent with viewController is found
        return view;
    }

    export function updateAutoAdjustScrollInsets(controller: UIViewController, owner: View): void {
        if (majorVersion <= 10) {
            owner._automaticallyAdjustsScrollViewInsets = false;
            // This API is deprecated, but has no alternative for <= iOS 10
            // Defaults to true and results to appliyng the insets twice together with our logic
            // for iOS 11+ we use the contentInsetAdjustmentBehavior property in scrollview
            // https://developer.apple.com/documentation/uikit/uiviewcontroller/1621372-automaticallyadjustsscrollviewin
            controller.automaticallyAdjustsScrollViewInsets = false;
        }
    }

    export function updateConstraints(controller: UIViewController, owner: View): void {
        if (majorVersion <= 10) {
            const layoutGuide = initLayoutGuide(controller);
            (<any>controller.view).safeAreaLayoutGuide = layoutGuide;
        }
    }

    function initLayoutGuide(controller: UIViewController) {
        const rootView = controller.view;
        const layoutGuide = UILayoutGuide.alloc().init();
        rootView.addLayoutGuide(layoutGuide);
        NSLayoutConstraint.activateConstraints(<any>[
            layoutGuide.topAnchor.constraintEqualToAnchor(controller.topLayoutGuide.bottomAnchor),
            layoutGuide.bottomAnchor.constraintEqualToAnchor(controller.bottomLayoutGuide.topAnchor),
            layoutGuide.leadingAnchor.constraintEqualToAnchor(rootView.leadingAnchor),
            layoutGuide.trailingAnchor.constraintEqualToAnchor(rootView.trailingAnchor)
        ]);

        return layoutGuide;
    }

    export function layoutView(controller: UIViewController, owner: View): void {
        let layoutGuide = controller.view.safeAreaLayoutGuide;
        if (!layoutGuide) {
            traceWrite(`safeAreaLayoutGuide during layout of ${owner}. Creating fallback constraints, but layout might be wrong.`,
                traceCategories.Layout, traceMessageType.error);

            layoutGuide = initLayoutGuide(controller);
        }
        const safeArea = layoutGuide.layoutFrame;
        let position = ios.getPositionFromFrame(safeArea);
        const safeAreaSize = safeArea.size;

        const hasChildViewControllers = controller.childViewControllers.count > 0;
        if (hasChildViewControllers) {
            const fullscreen = controller.view.frame;
            position = ios.getPositionFromFrame(fullscreen);
        }

        const safeAreaWidth = layout.round(layout.toDevicePixels(safeAreaSize.width));
        const safeAreaHeight = layout.round(layout.toDevicePixels(safeAreaSize.height));

        const widthSpec = layout.makeMeasureSpec(safeAreaWidth, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(safeAreaHeight, layout.EXACTLY);

        View.measureChild(null, owner, widthSpec, heightSpec);
        View.layoutChild(null, owner, position.left, position.top, position.right, position.bottom);

        layoutParent(owner.parent);
    }

    export function getPositionFromFrame(frame: CGRect): { left, top, right, bottom } {
        const left = layout.round(layout.toDevicePixels(frame.origin.x));
        const top = layout.round(layout.toDevicePixels(frame.origin.y));
        const right = layout.round(layout.toDevicePixels(frame.origin.x + frame.size.width));
        const bottom = layout.round(layout.toDevicePixels(frame.origin.y + frame.size.height));

        return { left, right, top, bottom };
    }

    export function getFrameFromPosition(position: { left, top, right, bottom }, insets?: { left, top, right, bottom }): CGRect {
        insets = insets || { left: 0, top: 0, right: 0, bottom: 0 };

        const left = layout.toDeviceIndependentPixels(position.left + insets.left);
        const top = layout.toDeviceIndependentPixels(position.top + insets.top);
        const width = layout.toDeviceIndependentPixels(position.right - position.left - insets.left - insets.right);
        const height = layout.toDeviceIndependentPixels(position.bottom - position.top - insets.top - insets.bottom);

        return CGRectMake(left, top, width, height);
    }

    export function shrinkToSafeArea(view: View, frame: CGRect): CGRect {
        const insets = view.getSafeAreaInsets();
        if (insets.left || insets.top) {
            const position = ios.getPositionFromFrame(frame);
            const adjustedFrame = ios.getFrameFromPosition(position, insets);

            if (traceEnabled()) {
                traceWrite(this + " :shrinkToSafeArea: " + JSON.stringify(ios.getPositionFromFrame(adjustedFrame)), traceCategories.Layout);
            }

            return adjustedFrame;
        }

        return null;
    }

    export function expandBeyondSafeArea(view: View, frame: CGRect): CGRect {
        const availableSpace = getAvailableSpaceFromParent(view, frame);
        const safeArea = availableSpace.safeArea;
        const fullscreen = availableSpace.fullscreen;
        const inWindow = availableSpace.inWindow;

        const position = ios.getPositionFromFrame(frame);
        const safeAreaPosition = ios.getPositionFromFrame(safeArea);
        const fullscreenPosition = ios.getPositionFromFrame(fullscreen);
        const inWindowPosition = ios.getPositionFromFrame(inWindow);

        const adjustedPosition = position;

        if (position.left && inWindowPosition.left <= safeAreaPosition.left) {
            adjustedPosition.left = fullscreenPosition.left;
        }

        if (position.top && inWindowPosition.top <= safeAreaPosition.top) {
            adjustedPosition.top = fullscreenPosition.top;
        }

        if (inWindowPosition.right < fullscreenPosition.right && inWindowPosition.right >= safeAreaPosition.right + fullscreenPosition.left) {
            adjustedPosition.right += fullscreenPosition.right - inWindowPosition.right;
        }

        if (inWindowPosition.bottom < fullscreenPosition.bottom && inWindowPosition.bottom >= safeAreaPosition.bottom + fullscreenPosition.top) {
            adjustedPosition.bottom += fullscreenPosition.bottom - inWindowPosition.bottom;
        }

        const adjustedFrame = CGRectMake(layout.toDeviceIndependentPixels(adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.top), layout.toDeviceIndependentPixels(adjustedPosition.right - adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.bottom - adjustedPosition.top));

        if (traceEnabled()) {
            traceWrite(view + " :expandBeyondSafeArea: " + JSON.stringify(ios.getPositionFromFrame(adjustedFrame)), traceCategories.Layout);
        }

        return adjustedFrame;
    }

    function layoutParent(view: ViewBase): void {
        if (!view) {
            return;
        }

        if (view instanceof View && view.nativeViewProtected) {
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

    function getAvailableSpaceFromParent(view: View, frame: CGRect): { safeArea: CGRect, fullscreen: CGRect, inWindow: CGRect } {
        if (!view) {
            return;
        }

        let scrollView = null;
        let viewControllerView = null;

        if (view.viewController) {
            viewControllerView = view.viewController.view;
        } else {
            let parent = view.parent as View;
            while (parent && !parent.viewController && !(parent.nativeViewProtected instanceof UIScrollView)) {
                parent = parent.parent as View;
            }

            if (parent.nativeViewProtected instanceof UIScrollView) {
                scrollView = parent.nativeViewProtected;
            } else if (parent.viewController) {
                viewControllerView = parent.viewController.view;
            }
        }

        let fullscreen = null;
        let safeArea = null;

        if (viewControllerView) {
            safeArea = viewControllerView.safeAreaLayoutGuide.layoutFrame;
            fullscreen = viewControllerView.frame;
        }
        else if (scrollView) {
            const insets = scrollView.safeAreaInsets;
            safeArea = CGRectMake(insets.left, insets.top, scrollView.contentSize.width - insets.left - insets.right, scrollView.contentSize.height - insets.top - insets.bottom);
            fullscreen = CGRectMake(0, 0, scrollView.contentSize.width, scrollView.contentSize.height);
        }

        const locationInWindow = view.getLocationInWindow();
        let inWindowLeft = locationInWindow.x;
        let inWindowTop = locationInWindow.y;

        if (scrollView) {
            inWindowLeft += scrollView.contentOffset.x;
            inWindowTop += scrollView.contentOffset.y;
        }

        const inWindow = CGRectMake(inWindowLeft, inWindowTop, frame.size.width, frame.size.height);

        return { safeArea: safeArea, fullscreen: fullscreen, inWindow: inWindow };
    }

    export class UILayoutViewController extends UIViewController {
        public owner: WeakRef<View>;

        public static initWithOwner(owner: WeakRef<View>): UILayoutViewController {
            const controller = <UILayoutViewController>UILayoutViewController.new();
            controller.owner = owner;

            return controller;
        }

        public viewDidLoad(): void {
            super.viewDidLoad();

            // Unify translucent and opaque bars layout
            // this.edgesForExtendedLayout = UIRectEdgeBottom;
            this.extendedLayoutIncludesOpaqueBars = true;
        }

        public viewWillLayoutSubviews(): void {
            super.viewWillLayoutSubviews();
            const owner = this.owner.get();
            if (owner) {
                updateConstraints(this, owner);
            }
        }

        public viewDidLayoutSubviews(): void {
            super.viewDidLayoutSubviews();
            const owner = this.owner.get();
            if (owner) {
                if (majorVersion >= 11) {
                    // Handle nested UILayoutViewController safe area application.
                    // Currently, UILayoutViewController can be nested only in a TabView.
                    // The TabView itself is handled by the OS, so we check the TabView's parent (usually a Page, but can be a Layout).
                    const tabViewItem = owner.parent;
                    const tabView = tabViewItem && tabViewItem.parent;
                    let parent = tabView && tabView.parent;

                    // Handle Angular scenario where TabView is in a ProxyViewContainer
                    // It is possible to wrap components in ProxyViewContainers indefinitely
                    // Not using instanceof ProxyViewContainer to avoid circular dependency
                    // TODO: Try moving UILayoutViewController out of view module
                    while (parent && !parent.nativeViewProtected) {
                        parent = parent.parent;
                    }

                    if (parent) {
                        const parentPageInsetsTop = parent.nativeViewProtected.safeAreaInsets.top;
                        const currentInsetsTop = this.view.safeAreaInsets.top;
                        const additionalInsetsTop = Math.max(parentPageInsetsTop - currentInsetsTop, 0);

                        const parentPageInsetsBottom = parent.nativeViewProtected.safeAreaInsets.bottom;
                        const currentInsetsBottom = this.view.safeAreaInsets.bottom;
                        const additionalInsetsBottom = Math.max(parentPageInsetsBottom - currentInsetsBottom, 0);

                        if (additionalInsetsTop > 0 || additionalInsetsBottom > 0) {
                            const additionalInsets = new UIEdgeInsets({ top: additionalInsetsTop, left: 0, bottom: additionalInsetsBottom, right: 0 });
                            this.additionalSafeAreaInsets = additionalInsets;
                        }
                    }
                }

                layoutView(this, owner);
            }
        }

        public viewWillAppear(animated: boolean): void {
            super.viewWillAppear(animated);
            const owner = this.owner.get();
            if (!owner) {
                return;
            }

            updateAutoAdjustScrollInsets(this, owner);

            if (!owner.parent) {
                owner.callLoaded();
            }
        }

        public viewDidDisappear(animated: boolean): void {
            super.viewDidDisappear(animated);
            const owner = this.owner.get();
            if (owner && !owner.parent) {
                owner.callUnloaded();
            }
        }
    }

    export class UIPopoverPresentationControllerDelegateImp extends NSObject implements UIPopoverPresentationControllerDelegate {
        public static ObjCProtocols = [UIPopoverPresentationControllerDelegate];

        private owner: WeakRef<View>;
        private closedCallback: Function;

        public static initWithOwnerAndCallback(owner: WeakRef<View>, whenClosedCallback: Function): UIPopoverPresentationControllerDelegateImp {
            const instance = <UIPopoverPresentationControllerDelegateImp>super.new();
            instance.owner = owner;
            instance.closedCallback = whenClosedCallback;

            return instance;
        }

        public popoverPresentationControllerDidDismissPopover(popoverPresentationController: UIPopoverPresentationController) {
            const owner = this.owner.get();
            if (owner && typeof this.closedCallback === "function") {
                this.closedCallback();
            }
        }
    }
}
