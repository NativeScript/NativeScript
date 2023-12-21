// Types.
import { Point, View as ViewDefinition } from '.';

// Requires
import { ViewCommon, isEnabledProperty, originXProperty, originYProperty, isUserInteractionEnabledProperty, testIDProperty } from './view-common';
import { ShowModalOptions, hiddenProperty } from '../view-base';
import { Trace } from '../../../trace';
import { layout, iOSNativeHelper } from '../../../utils';
import { isNumber } from '../../../utils/types';
import { IOSHelper } from './view-helper';
import { ios as iosBackground, Background } from '../../styling/background';
import { perspectiveProperty, visibilityProperty, opacityProperty, rotateProperty, rotateXProperty, rotateYProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty } from '../../styling/style-properties';
import { profile } from '../../../profiling';
import { accessibilityEnabledProperty, accessibilityHiddenProperty, accessibilityHintProperty, accessibilityIdentifierProperty, accessibilityLabelProperty, accessibilityLanguageProperty, accessibilityLiveRegionProperty, accessibilityMediaSessionProperty, accessibilityRoleProperty, accessibilityStateProperty, accessibilityValueProperty, accessibilityIgnoresInvertColorsProperty } from '../../../accessibility/accessibility-properties';
import { IOSPostAccessibilityNotificationType, isAccessibilityServiceEnabled, updateAccessibilityProperties, AccessibilityEventOptions, AccessibilityRole, AccessibilityState } from '../../../accessibility';
import { CoreTypes } from '../../../core-types';
import type { ModalTransition } from '../../transition/modal-transition';
import { SharedTransition } from '../../transition/shared-transition';
import { GestureStateTypes, PanGestureEventData } from '../../gestures';
import { applyRotateTransform } from '../../../utils/ios';
import { NativeScriptUIView } from '../../utils';
import { Application } from '../../../application';

export * from './view-common';
// helpers (these are okay re-exported here)
export * from './view-helper';
// This one can eventually be cleaned up but causes issues with a lot of ui-suite plugins in particular if not exported here
export * from '../properties';

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

const majorVersion = iOSNativeHelper.MajorVersion;

export class View extends ViewCommon implements ViewDefinition {
	// @ts-ignore
	nativeViewProtected: UIView;
	// @ts-ignore
	viewController: UIViewController;
	private _popoverPresentationDelegate: IOSHelper.UIPopoverPresentationControllerDelegateImp;
	private _adaptivePresentationDelegate: IOSHelper.UIAdaptivePresentationControllerDelegateImp;
	private _transitioningDelegate: UIViewControllerTransitioningDelegateImpl;

	/**
	 * Track modal open animated options to use same option upon close
	 */
	private _modalAnimatedOptions: Array<boolean>;
	private _isLaidOut = false;
	private _hasTransform = false;
	private _hasPendingTransform = false;
	private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
	private _cachedFrame: CGRect;
	private _suspendCATransaction = false;
	/**
	 * Native background states.
	 *  - `unset` - is the default, from this state it transitions to "invalid" in the base backgroundInternalProperty.setNative, overriding it without calling `super` will prevent the background from ever being drawn.
	 *  - `invalid` - the view background must be redrawn on the next layot.
	 *  - `drawn` - the view background has been property drawn, on subsequent layouts it may need to be redrawn if the background depends on the view's size.
	 */
	_nativeBackgroundState: 'unset' | 'invalid' | 'drawn';

	get isLayoutRequired(): boolean {
		return (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
	}

	get isLayoutRequested(): boolean {
		return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
	}
	initNativeView() {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		/**
		 * We need to map back from the UIView to the NativeScript View for accessibility.
		 *
		 * We do that by setting the uiView's tag to the View's domId.
		 * This way we can do reverse lookup.
		 */
		nativeView.tag = this._domId;
	}

	requestlayoutIfNeeded() {
		if (this.isLayoutRequired) {
			this._requetLayoutNeeded = false;
			this.requestLayout();
		}
	}

	disposeNativeView() {
		super.disposeNativeView();

		if (this.viewController) {
			this.viewController = null;
		}

		this._cachedFrame = null;
		this._isLaidOut = false;
		this._hasTransform = false;
		this._hasPendingTransform = false;
	}

	public requestLayout(): void {
		if (this.mSuspendRequestLayout) {
			this._requetLayoutNeeded = true;
			return;
		}
		this._requetLayoutNeeded = false;
		this._privateFlags |= PFLAG_FORCE_LAYOUT;
		super.requestLayout();

		const nativeView = this.nativeViewProtected;
		if (nativeView && nativeView.setNeedsLayout) {
			nativeView.setNeedsLayout();
		}

		const controller = this.viewController;
		if (controller && controller.view !== nativeView) {
			controller.view.setNeedsLayout();
		}
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const measureSpecsChanged = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
		const forceLayout = (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
		if (this.nativeViewProtected && (forceLayout || measureSpecsChanged)) {
			// first clears the measured dimension flag
			this._privateFlags &= ~PFLAG_MEASURED_DIMENSION_SET;

			// measure ourselves, this should set the measured dimension flag back
			this.onMeasure(widthMeasureSpec, heightMeasureSpec);
			this._privateFlags |= PFLAG_LAYOUT_REQUIRED;

			// flag not set, setMeasuredDimension() was not invoked, we trace
			// the exception to warn the developer
			if ((this._privateFlags & PFLAG_MEASURED_DIMENSION_SET) !== PFLAG_MEASURED_DIMENSION_SET) {
				if (Trace.isEnabled()) {
					Trace.write('onMeasure() did not set the measured dimension by calling setMeasuredDimension() ' + this, Trace.categories.Layout, Trace.messageType.error);
				}
			}
		}
	}

	@profile
	public layout(left: number, top: number, right: number, bottom: number, setFrame = true): void {
		const { boundsChanged, sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
		if (setFrame) {
			this.layoutNativeView(left, top, right, bottom);
		}

		const needsLayout = boundsChanged || (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
		if (needsLayout) {
			let position = { left, top, right, bottom };
			if (this.nativeViewProtected && majorVersion > 10) {
				// on iOS 11+ it is possible to have a changed layout frame due to safe area insets
				// get the frame and adjust the position, so that onLayout works correctly
				const frame = this.nativeViewProtected.frame;
				position = IOSHelper.getPositionFromFrame(frame);
			}

			this.onLayout(position.left, position.top, position.right, position.bottom);
			this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
		}

		this.updateBackground(sizeChanged, needsLayout);
		if (this._hasPendingTransform) {
			this.updateNativeTransform();
			this._hasPendingTransform = false;
		}
		this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
	}

	private updateBackground(sizeChanged: boolean, needsLayout: boolean): void {
		if (sizeChanged) {
			this._onSizeChanged();
		} else if (this._nativeBackgroundState === 'invalid') {
			const background = this.style.backgroundInternal;
			this._redrawNativeBackground(background);
		} else {
			// Update layers that don't belong to view's layer (e.g. shadow layers)
			if (needsLayout) {
				this.layoutOuterShadows();
			}
		}
	}

	private layoutOuterShadows(): void {
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;
		if (nativeView?.outerShadowContainerLayer) {
			CATransaction.setDisableActions(true);

			nativeView.outerShadowContainerLayer.bounds = nativeView.bounds;
			nativeView.outerShadowContainerLayer.position = nativeView.center;

			CATransaction.setDisableActions(false);
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
		const oldFrame = this._cachedFrame || nativeView.frame;
		if (!CGRectEqualToRect(oldFrame, frame)) {
			if (Trace.isEnabled()) {
				Trace.write(this + ' :_setNativeViewFrame: ' + JSON.stringify(IOSHelper.getPositionFromFrame(frame)), Trace.categories.Layout);
			}
			this._cachedFrame = frame;
			let adjustedFrame = null;
			let transform = null;
			if (this._hasTransform) {
				// Always set identity transform before setting frame;
				transform = nativeView.layer.transform;
				nativeView.layer.transform = CATransform3DIdentity;
				nativeView.frame = frame;
			} else {
				nativeView.frame = frame;
			}

			adjustedFrame = this.applySafeAreaInsets(frame);
			if (adjustedFrame) {
				nativeView.frame = adjustedFrame;
			}

			if (this._hasTransform) {
				// re-apply the transform after the frame is adjusted
				nativeView.layer.transform = transform;
			}

			const boundsOrigin = nativeView.bounds.origin;
			const boundsFrame = adjustedFrame || frame;
			nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, boundsFrame.size.width, boundsFrame.size.height);
			nativeView.layoutIfNeeded();

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
		const frame = IOSHelper.getFrameFromPosition({
			left,
			top,
			right,
			bottom,
		});
		this._setNativeViewFrame(nativeView, frame);
	}

	public _layoutParent() {
		if (this.nativeViewProtected) {
			const frame = this.nativeViewProtected.frame;
			const origin = frame.origin;
			const size = frame.size;
			const left = layout.toDevicePixels(origin.x);
			const top = layout.toDevicePixels(origin.y);
			const width = layout.toDevicePixels(size.width);
			const height = layout.toDevicePixels(size.height);
			this._setLayoutFlags(left, top, width + left, height + top);
		}

		super._layoutParent();
	}

	public _setLayoutFlags(left: number, top: number, right: number, bottom: number): void {
		const width = right - left;
		const height = bottom - top;
		const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
		const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);
		this._setCurrentMeasureSpecs(widthSpec, heightSpec);
		this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
		this.setMeasuredDimension(width, height);

		const { boundsChanged, sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
		this.updateBackground(sizeChanged, boundsChanged);
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
		if (this.iosIgnoreSafeArea) {
			return frame;
		}
		if (!this.iosOverflowSafeArea || !this.iosOverflowSafeAreaEnabled) {
			return IOSHelper.shrinkToSafeArea(this, frame);
		} else if (this.nativeViewProtected && this.nativeViewProtected.window) {
			return IOSHelper.expandBeyondSafeArea(this, frame);
		}

		return null;
	}

	public getSafeAreaInsets(): { left; top; right; bottom } {
		const safeAreaInsets = this.nativeViewProtected && this.nativeViewProtected.safeAreaInsets;
		const insets = { left: 0, top: 0, right: 0, bottom: 0 };
		if (this.iosIgnoreSafeArea) {
			return insets;
		}
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
			y: pointInWindow.y,
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
			y: pointOnScreen.y,
		};
	}

	public getLocationRelativeTo(otherView: ViewDefinition): Point {
		if (!this.nativeViewProtected || !this.nativeViewProtected.window || !otherView.nativeViewProtected || !otherView.nativeViewProtected.window || this.nativeViewProtected.window !== otherView.nativeViewProtected.window) {
			return undefined;
		}

		const myPointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
		const otherPointInWindow = otherView.nativeViewProtected.convertPointToView(otherView.nativeViewProtected.bounds.origin, null);

		return {
			x: myPointInWindow.x - otherPointInWindow.x,
			y: myPointInWindow.y - otherPointInWindow.y,
		};
	}

	_onSizeChanged(): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const background = this.style.backgroundInternal;
		const backgroundDependsOnSize = (background.image && background.image !== 'none') || background.clipPath || !background.hasUniformBorder() || background.hasBorderRadius() || background.hasBoxShadow();

		if (this._nativeBackgroundState === 'invalid' || (this._nativeBackgroundState === 'drawn' && backgroundDependsOnSize)) {
			this._redrawNativeBackground(background);
		}
	}

	public updateNativeTransform() {
		if (!this.isLayoutValid) {
			this._hasPendingTransform = true;
			return;
		}

		const scaleX = this.scaleX || 1e-6;
		const scaleY = this.scaleY || 1e-6;
		const perspective = this.perspective || 300;
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;

		let transform = new CATransform3D(CATransform3DIdentity);

		// Only set perspective if there is 3D rotation
		if (this.rotateX || this.rotateY) {
			transform.m34 = -1 / perspective;
		}

		transform = CATransform3DTranslate(transform, this.translateX, this.translateY, 0);
		transform = applyRotateTransform(transform, this.rotateX, this.rotateY, this.rotate);
		transform = CATransform3DScale(transform, scaleX, scaleY, 1);

		const needsTransform: boolean = !CATransform3DEqualToTransform(this.nativeViewProtected.layer.transform, transform) || (nativeView.outerShadowContainerLayer && !CATransform3DEqualToTransform(nativeView.outerShadowContainerLayer.transform, transform));

		if (needsTransform) {
			const updateSuspended = this._isPresentationLayerUpdateSuspended();
			if (!updateSuspended) {
				CATransaction.begin();
			}
			// Disable CALayer animatable property changes
			CATransaction.setDisableActions(true);

			this.nativeViewProtected.layer.transform = transform;
			if (nativeView.outerShadowContainerLayer) {
				nativeView.outerShadowContainerLayer.transform = transform;
			}
			this._hasTransform = this.nativeViewProtected && !CATransform3DEqualToTransform(this.nativeViewProtected.transform3D, CATransform3DIdentity);

			CATransaction.setDisableActions(false);
			if (!updateSuspended) {
				CATransaction.commit();
			}
		}
	}

	public updateOriginPoint(originX: number, originY: number) {
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;
		const newPoint = CGPointMake(originX, originY);

		// Disable CALayer animatable property changes
		CATransaction.setDisableActions(true);

		nativeView.layer.anchorPoint = newPoint;
		if (this._cachedFrame) {
			this._setNativeViewFrame(nativeView, this._cachedFrame);
		}

		// Make sure new origin also applies to outer shadow layers
		if (nativeView.outerShadowContainerLayer) {
			// This is the new frame after view origin point update
			const frame = nativeView.frame;

			nativeView.outerShadowContainerLayer.anchorPoint = newPoint;
			nativeView.outerShadowContainerLayer.position = CGPointMake(frame.origin.x + frame.size.width * originX, frame.origin.y + frame.size.height * originY);
		}

		CATransaction.setDisableActions(false);
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

	public _isPresentationLayerUpdateSuspended(): boolean {
		return this._suspendCATransaction || this._suspendNativeUpdatesCount > 0;
	}

	protected _showNativeModalView(parent: View, options: ShowModalOptions) {
		let parentWithController = IOSHelper.getParentWithViewController(parent);
		if (!parentWithController) {
			Trace.write(`Could not find parent with viewController for ${parent} while showing modal view.`, Trace.categories.ViewHierarchy, Trace.messageType.error);

			return;
		}

		let parentController = parentWithController.viewController;
		// we loop to ensure we are showing from the top presented view controller
		while (parentController.presentedViewController) {
			parentController = parentController.presentedViewController;
			parentWithController = parentWithController['_modal'] || parentWithController;
		}

		this._setupAsRootView({});

		super._showNativeModalView(<ViewCommon>parentWithController, options);
		let controller: IOSHelper.UILayoutViewController = this.viewController;
		if (!controller) {
			const nativeView = this.ios || this.nativeViewProtected;
			controller = <IOSHelper.UILayoutViewController>IOSHelper.UILayoutViewController.initWithOwner(new WeakRef(this));
			controller.modal = true;

			if (nativeView instanceof UIView) {
				controller.view.addSubview(nativeView);
			}

			this.viewController = controller;
		}
		// we set the parent to root to access all css root variables
		this.parent = Application.getRootView();

		if (options.transition) {
			controller.modalPresentationStyle = UIModalPresentationStyle.Custom;
			if (options.transition.instance) {
				this._transitioningDelegate = UIViewControllerTransitioningDelegateImpl.initWithOwner(new WeakRef(options.transition.instance));
				controller.transitioningDelegate = this._transitioningDelegate;
				this.transitionId = options.transition.instance.id;
				const transitionState = SharedTransition.getState(options.transition.instance.id);
				if (transitionState?.interactive?.dismiss) {
					// interactive transitions via gestures
					// TODO - these could be typed as: boolean | (view: View) => void
					// to allow users to define their own custom gesture dismissals
					options.transition.instance.setupInteractiveGesture(this._closeModalCallback.bind(this), this);
				}
			}
		} else if (options.fullscreen) {
			controller.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
		} else {
			controller.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
			//check whether both height and width is provided and are positive numbers
			// set it has prefered content size to the controller presenting the dialog
			if (options.ios && options.ios.width > 0 && options.ios.height > 0) {
				controller.preferredContentSize = CGSizeMake(options.ios.width, options.ios.height);
			} else {
				//use CSS & attribute width & height if option is not provided
				const handler = () => {
					if (this.viewController) {
						const w = <number>(this.width || this.style.width);
						const h = <number>(this.height || this.style.height);

						//TODO: only numeric value is supported, percentage value is not supported like Android
						if (w > 0 && h > 0) {
							this.viewController.preferredContentSize = CGSizeMake(w, h);
						}
					}

					this.off(View.loadedEvent, handler);
				};

				this.on(View.loadedEvent, handler);
			}
		}

		if (options.ios && options.ios.presentationStyle) {
			const presentationStyle = options.ios.presentationStyle;
			controller.modalPresentationStyle = presentationStyle;

			if (presentationStyle === UIModalPresentationStyle.Popover) {
				this._setupPopoverControllerDelegate(controller, parent);
			}
		}

		const cancelable = options.cancelable !== undefined ? !!options.cancelable : true;

		if (majorVersion >= 13) {
			if (cancelable) {
				// Listen for dismiss modal callback.
				this._setupAdaptiveControllerDelegate(controller);
			} else {
				// Prevent users from dismissing the modal.
				controller.modalInPresentation = true;
			}
		}

		this.horizontalAlignment = 'stretch';
		this.verticalAlignment = 'stretch';

		this._raiseShowingModallyEvent();
		const animated = options.animated === undefined ? true : !!options.animated;
		if (!this._modalAnimatedOptions) {
			// track the user's animated options to use upon close as well
			this._modalAnimatedOptions = [];
		}
		this._modalAnimatedOptions.push(animated);

		// TODO: a11y
		// controller.accessibilityViewIsModal = true;
		// controller.accessibilityPerformEscape = () => {
		//   console.log('accessibilityPerformEscape!!')
		//   return true;
		// }
		parentController.presentViewControllerAnimatedCompletion(controller, animated, null);
		const transitionCoordinator = parentController.transitionCoordinator;
		if (transitionCoordinator) {
			transitionCoordinator.animateAlongsideTransitionCompletion(null, () => this._raiseShownModallyEvent());
		} else {
			// Apparently iOS 9+ stops all transitions and animations upon application suspend and transitionCoordinator becomes null here in this case.
			// Since we are not waiting for any transition to complete, i.e. transitionCoordinator is null, we can directly raise our shownModally event.
			// Take a look at https://github.com/NativeScript/NativeScript/issues/2173 for more info and a sample project.
			this._raiseShownModallyEvent();
		}
		controller = null;
	}

	protected _hideNativeModalView(parent: View, whenClosedCallback: () => void) {
		if (!parent || !parent.viewController) {
			Trace.error('Trying to hide modal view but no parent with viewController specified.');

			return;
		}
		this._raiseClosingModallyEvent();

		// modal view has already been closed by UI, probably as a popover
		if (!parent.viewController.presentedViewController) {
			whenClosedCallback();

			return;
		}

		let parentController = parent.viewController;
		// if a dialog (UIAlertController or custom one defining isAlertController) we need to loop over to get the
		// top presentedViewController to correctly hide without hiding the dialog
		// though we dont want to go "over" to not go into possible top shown modal
		if (parentController.presentedViewController && parentController.presentedViewController.presentedViewController && (parentController.presentedViewController instanceof UIAlertController || parentController.presentedViewController['isAlertController'])) {
			parentController = parentController.presentedViewController;
		}

		// while(parentController.presentedViewController && parentController.presentedViewController.presentedViewController) {
		// }
		let animated = true;
		if (this._modalAnimatedOptions?.length) {
			animated = this._modalAnimatedOptions.slice(-1)[0];
		}
		parentController.dismissViewControllerAnimatedCompletion(animated, () => {
			const transitionState = SharedTransition.getState(this.transitionId);
			if (!transitionState?.interactiveCancelled) {
				this._transitioningDelegate = null;
				// this.off('pan', this._interactiveDismissGesture);
				if (this._modalAnimatedOptions) {
					this._modalAnimatedOptions.pop();
				}
			}
			whenClosedCallback();
		});
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

	[testIDProperty.setNative](value: string) {
		this.setAccessibilityIdentifier(this.nativeViewProtected, value);
	}

	public setAccessibilityIdentifier(view: any, value: string): void {
		view.accessibilityIdentifier = value;

		if (this.testID && this.testID !== value) this.testID = value;
		if (this.accessibilityIdentifier !== value) this.accessibilityIdentifier = value;
	}

	[accessibilityEnabledProperty.setNative](value: boolean): void {
		this.nativeViewProtected.isAccessibilityElement = !!value;

		updateAccessibilityProperties(this);
	}

	[accessibilityIdentifierProperty.getDefault](): string {
		return this.nativeViewProtected.accessibilityIdentifier;
	}

	[accessibilityIdentifierProperty.setNative](value: string): void {
		this.setAccessibilityIdentifier(this.nativeViewProtected, value);
	}

	[accessibilityRoleProperty.setNative](value: AccessibilityRole): void {
		this.accessibilityRole = value;
		updateAccessibilityProperties(this);
	}

	[accessibilityValueProperty.setNative](value: string): void {
		value = value == null ? null : `${value}`;
		this.nativeViewProtected.accessibilityValue = value;
	}

	[accessibilityLabelProperty.setNative](value: string): void {
		value = value == null ? null : `${value}`;
		// not sure if needed for Label:
		// if ((<any>this).nativeTextViewProtected) {
		//   (<any>this).nativeTextViewProtected.accessibilityLabel = value;
		// } else {
		this.nativeViewProtected.accessibilityLabel = value;
		// }
	}

	[accessibilityHintProperty.setNative](value: string): void {
		value = value == null ? null : `${value}`;
		this.nativeViewProtected.accessibilityHint = value;
	}

	[accessibilityIgnoresInvertColorsProperty.setNative](value: boolean) {
		this.nativeViewProtected.accessibilityIgnoresInvertColors = !!value;
	}

	[accessibilityLanguageProperty.setNative](value: string): void {
		value = value == null ? null : `${value}`;
		this.nativeViewProtected.accessibilityLanguage = value;
	}

	[accessibilityHiddenProperty.setNative](value: boolean): void {
		this.nativeViewProtected.accessibilityElementsHidden = !!value;

		updateAccessibilityProperties(this);
	}

	[accessibilityLiveRegionProperty.setNative](): void {
		updateAccessibilityProperties(this);
	}

	[accessibilityStateProperty.setNative](value: AccessibilityState): void {
		this.accessibilityState = value;
		updateAccessibilityProperties(this);
	}

	[accessibilityMediaSessionProperty.setNative](): void {
		updateAccessibilityProperties(this);
	}

	[isUserInteractionEnabledProperty.getDefault](): boolean {
		return this.nativeViewProtected.userInteractionEnabled;
	}
	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.userInteractionEnabled = value;
	}

	[hiddenProperty.getDefault](): boolean {
		return this.nativeViewProtected.hidden;
	}
	[hiddenProperty.setNative](value: boolean) {
		this.nativeViewProtected.hidden = value;
	}

	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		return this.nativeViewProtected.hidden ? CoreTypes.Visibility.collapse : CoreTypes.Visibility.visible;
	}
	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;

		switch (value) {
			case CoreTypes.Visibility.visible:
				nativeView.hidden = false;
				break;
			case CoreTypes.Visibility.hidden:
			case CoreTypes.Visibility.collapse:
				nativeView.hidden = true;
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${CoreTypes.Visibility.visible}", "${CoreTypes.Visibility.hidden}", "${CoreTypes.Visibility.collapse}".`);
		}

		// Apply visibility value to shadows as well
		if (nativeView.outerShadowContainerLayer) {
			nativeView.outerShadowContainerLayer.hidden = nativeView.hidden;
		}
	}

	[opacityProperty.getDefault](): number {
		return this.nativeViewProtected.alpha;
	}
	[opacityProperty.setNative](value: number) {
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;
		const updateSuspended = this._isPresentationLayerUpdateSuspended();
		if (!updateSuspended) {
			CATransaction.begin();
		}
		// Disable CALayer animatable property changes
		CATransaction.setDisableActions(true);

		nativeView.alpha = value;
		// Apply opacity value to shadows as well
		if (nativeView.outerShadowContainerLayer) {
			nativeView.outerShadowContainerLayer.opacity = value;
		}

		CATransaction.setDisableActions(false);
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

	[rotateXProperty.getDefault](): number {
		return 0;
	}
	[rotateXProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[rotateYProperty.getDefault](): number {
		return 0;
	}
	[rotateYProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[perspectiveProperty.getDefault](): number {
		return 300;
	}
	[perspectiveProperty.setNative](value: number) {
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

	[translateXProperty.getDefault](): CoreTypes.dip {
		return 0;
	}
	[translateXProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	[translateYProperty.getDefault](): CoreTypes.dip {
		return 0;
	}
	[translateYProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	[zIndexProperty.getDefault](): number {
		return 0;
	}
	[zIndexProperty.setNative](value: number) {
		const nativeView: NativeScriptUIView = <NativeScriptUIView>this.nativeViewProtected;

		nativeView.layer.zPosition = value;
		// Apply z-index to shadows as well
		if (nativeView.outerShadowContainerLayer) {
			nativeView.outerShadowContainerLayer.zPosition = value;
		}
	}

	[backgroundInternalProperty.getDefault](): UIColor {
		return this.nativeViewProtected.backgroundColor;
	}
	[backgroundInternalProperty.setNative](value: UIColor | Background) {
		this._nativeBackgroundState = 'invalid';
		if (this.isLayoutValid) {
			this._redrawNativeBackground(value);
		}
	}

	public sendAccessibilityEvent(options: Partial<AccessibilityEventOptions>): void {
		if (!isAccessibilityServiceEnabled()) {
			return;
		}

		if (!options.iosNotificationType) {
			return;
		}

		let notification: number;
		let args: string | UIView | null = this.nativeViewProtected;
		if (typeof msg === 'string' && msg) {
			args = msg;
		}

		switch (options.iosNotificationType as IOSPostAccessibilityNotificationType) {
			case IOSPostAccessibilityNotificationType.Announcement: {
				notification = UIAccessibilityAnnouncementNotification;
				break;
			}
			case IOSPostAccessibilityNotificationType.Layout: {
				notification = UIAccessibilityLayoutChangedNotification;
				break;
			}
			case IOSPostAccessibilityNotificationType.Screen: {
				notification = UIAccessibilityScreenChangedNotification;
				break;
			}
			default: {
				return;
			}
		}

		UIAccessibilityPostNotification(notification, args ?? null);
	}

	public accessibilityAnnouncement(msg = this.accessibilityLabel): void {
		this.sendAccessibilityEvent({
			iosNotificationType: IOSPostAccessibilityNotificationType.Announcement,
			message: msg,
		});
	}

	public accessibilityScreenChanged(): void {
		this.sendAccessibilityEvent({
			iosNotificationType: IOSPostAccessibilityNotificationType.Screen,
		});
	}

	_getCurrentLayoutBounds(): {
		left: number;
		top: number;
		right: number;
		bottom: number;
	} {
		const nativeView = this.nativeViewProtected;
		if (nativeView && !this.isCollapsed) {
			const frame = nativeView.frame;
			const origin = frame.origin;
			const size = frame.size;

			return {
				left: Math.round(layout.toDevicePixels(origin.x)),
				top: Math.round(layout.toDevicePixels(origin.y)),
				right: Math.round(layout.toDevicePixels(origin.x + size.width)),
				bottom: Math.round(layout.toDevicePixels(origin.y + size.height)),
			};
		} else {
			return { left: 0, top: 0, right: 0, bottom: 0 };
		}
	}

	_redrawNativeBackground(value: UIColor | Background): void {
		const updateSuspended = this._isPresentationLayerUpdateSuspended();
		if (!updateSuspended) {
			CATransaction.begin();
		}
		// Disable CALayer animatable property changes
		CATransaction.setDisableActions(true);

		const nativeView = this.nativeViewProtected;
		if (nativeView) {
			if (value instanceof UIColor) {
				nativeView.backgroundColor = value;
			} else {
				iosBackground.createBackgroundUIColor(this, (color: UIColor) => {
					nativeView.backgroundColor = color;
				});
				this._setNativeClipToBounds();
			}
		}

		CATransaction.setDisableActions(false);
		if (!updateSuspended) {
			CATransaction.commit();
		}

		this._nativeBackgroundState = 'drawn';
	}

	_setNativeClipToBounds() {
		const view = this.nativeViewProtected;
		if (view) {
			const backgroundInternal = this.style.backgroundInternal;
			view.clipsToBounds = view instanceof UIScrollView || backgroundInternal.hasBorderWidth() || backgroundInternal.hasBorderRadius();
		}
	}

	private _setupPopoverControllerDelegate(controller: UIViewController, parent: View) {
		const popoverPresentationController = controller.popoverPresentationController;
		this._popoverPresentationDelegate = IOSHelper.UIPopoverPresentationControllerDelegateImp.initWithOwnerAndCallback(new WeakRef(this), this._closeModalCallback);
		popoverPresentationController.delegate = <UIPopoverPresentationControllerDelegate>this._popoverPresentationDelegate;
		const view = parent.nativeViewProtected;
		// Note: sourceView and sourceRect are needed to specify the anchor location for the popover.
		// Note: sourceView should be the button triggering the modal. If it the Page the popover might appear "behind" the page content
		popoverPresentationController.sourceView = view;
		popoverPresentationController.sourceRect = CGRectMake(0, 0, view.frame.size.width, view.frame.size.height);
	}

	private _setupAdaptiveControllerDelegate(controller: UIViewController) {
		this._adaptivePresentationDelegate = IOSHelper.UIAdaptivePresentationControllerDelegateImp.initWithOwnerAndCallback(new WeakRef(this), this._closeModalCallback);
		if (controller?.presentationController) {
			controller.presentationController.delegate = <UIAdaptivePresentationControllerDelegate>this._adaptivePresentationDelegate;
		}
	}
}
View.prototype._nativeBackgroundState = 'unset';

@NativeClass
class UIViewControllerTransitioningDelegateImpl extends NSObject implements UIViewControllerTransitioningDelegate {
	owner: WeakRef<ModalTransition>;
	static ObjCProtocols = [UIViewControllerTransitioningDelegate];

	static initWithOwner(owner: WeakRef<ModalTransition>) {
		const delegate = <UIViewControllerTransitioningDelegateImpl>UIViewControllerTransitioningDelegateImpl.new();
		delegate.owner = owner;
		return delegate;
	}

	animationControllerForDismissedController?(dismissed: UIViewController): UIViewControllerAnimatedTransitioning {
		const owner = this.owner?.deref();
		if (owner?.iosDismissedController) {
			return owner.iosDismissedController(dismissed);
		}
		return null;
	}

	animationControllerForPresentedControllerPresentingControllerSourceController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning {
		const owner = this.owner?.deref();
		if (owner?.iosPresentedController) {
			return owner.iosPresentedController(presented, presenting, source);
		}
		return null;
	}

	interactionControllerForDismissal?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		const owner = this.owner?.deref();
		if (owner?.iosInteractionDismiss) {
			const transitionState = SharedTransition.getState(owner.id);
			if (transitionState?.interactiveBegan) {
				return owner.iosInteractionDismiss(animator);
			}
		}
		return null;
	}

	interactionControllerForPresentation?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning {
		const owner = this.owner?.deref();
		if (owner?.iosInteractionPresented) {
			return owner.iosInteractionPresented(animator);
		}
		return null;
	}
}

export class ContainerView extends View {
	constructor() {
		super();
		this.iosOverflowSafeArea = true;
	}
}

export class CustomLayoutView extends ContainerView {
	// @ts-ignore
	nativeViewProtected: UIView;

	createNativeView() {
		return UIView.alloc().initWithFrame(UIScreen.mainScreen.bounds);
	}

	get ios(): UIView {
		return this.nativeViewProtected;
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// Don't call super because it will set MeasureDimension. This method must be overridden and calculate its measuredDimensions.
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
		super._addViewToNativeVisualTree(child, atIndex);

		const parentNativeView = this.nativeViewProtected;
		const childNativeView: NativeScriptUIView = <NativeScriptUIView>child.nativeViewProtected;

		if (parentNativeView && childNativeView) {
			if (typeof atIndex !== 'number' || atIndex >= parentNativeView.subviews.count) {
				parentNativeView.addSubview(childNativeView);
			} else {
				parentNativeView.insertSubviewAtIndex(childNativeView, atIndex);
			}

			// Add outer shadow layer manually as it belongs to parent layer tree (this is needed for reusable views)
			if (childNativeView.outerShadowContainerLayer && !childNativeView.outerShadowContainerLayer.superlayer) {
				parentNativeView.layer.insertSublayerBelow(childNativeView.outerShadowContainerLayer, childNativeView.layer);
			}

			return true;
		}

		return false;
	}

	public _removeFromNativeVisualTree(): void {
		super._removeFromNativeVisualTree();
		if (this.nativeViewProtected) {
			this.nativeViewProtected.removeFromSuperview();
		}
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		super._removeViewFromNativeVisualTree(child);

		if (child.nativeViewProtected) {
			const nativeView: NativeScriptUIView = <NativeScriptUIView>child.nativeViewProtected;

			// Remove outer shadow layer manually as it belongs to parent layer tree
			if (nativeView.outerShadowContainerLayer) {
				nativeView.outerShadowContainerLayer.removeFromSuperlayer();
			}

			nativeView.removeFromSuperview();
		}
	}
}
