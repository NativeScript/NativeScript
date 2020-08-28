// Types.
import { Point, View as ViewDefinition, dip } from '.';

// Requires
import { ViewCommon, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty } from './view-common';
import { ShowModalOptions } from '../view-base';
import { Trace } from '../../../trace';
import { layout, iOSNativeHelper } from '../../../utils';
import { IOSHelper } from './view-helper';
import { ios as iosBackground, Background } from '../../styling/background';
import { perspectiveProperty, Visibility, visibilityProperty, opacityProperty, rotateProperty, rotateXProperty, rotateYProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty, clipPathProperty } from '../../styling/style-properties';
import { profile } from '../../../profiling';

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
	nativeViewProtected: UIView;
	viewController: UIViewController;
	private _popoverPresentationDelegate: IOSHelper.UIPopoverPresentationControllerDelegateImp;
	private _adaptivePresentationDelegate: IOSHelper.UIAdaptivePresentationControllerDelegateImp;

	/**
	 * Track modal open animated options to use same option upon close
	 */
	private _modalAnimatedOptions: Array<boolean>;
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
	_nativeBackgroundState: 'unset' | 'invalid' | 'drawn';

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
		if (nativeView && nativeView.setNeedsLayout) {
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
				throw new Error('onMeasure() did not set the measured dimension by calling setMeasuredDimension() ' + this);
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
				position = IOSHelper.getPositionFromFrame(frame);
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
		} else if (this._nativeBackgroundState === 'invalid') {
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
			if (Trace.isEnabled()) {
				Trace.write(this + ' :_setNativeViewFrame: ' + JSON.stringify(IOSHelper.getPositionFromFrame(frame)), Trace.categories.Layout);
			}
			this._cachedFrame = frame;
			let adjustedFrame = null;
			let transform = null;
			if (this._hasTransfrom) {
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

			if (this._hasTransfrom) {
				// re-apply the transform after the frame is adjusted
				nativeView.layer.transform = transform;
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
			return IOSHelper.shrinkToSafeArea(this, frame);
		} else if (this.nativeViewProtected && this.nativeViewProtected.window) {
			return IOSHelper.expandBeyondSafeArea(this, frame);
		}

		return null;
	}

	public getSafeAreaInsets(): { left; top; right; bottom } {
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
		const backgroundDependsOnSize = background.image || !background.hasUniformBorder() || background.hasBorderRadius();

		if (this._nativeBackgroundState === 'invalid' || (this._nativeBackgroundState === 'drawn' && backgroundDependsOnSize)) {
			this._redrawNativeBackground(background);
		}

		const clipPath = this.style.clipPath;
		if (clipPath !== '' && this[clipPathProperty.setNative]) {
			this[clipPathProperty.setNative](clipPath);
		}
	}

	public updateNativeTransform() {
		const scaleX = this.scaleX || 1e-6;
		const scaleY = this.scaleY || 1e-6;
		const perspective = this.perspective || 300;

		let transform = new CATransform3D(CATransform3DIdentity);

		// Only set perspective if there is 3D rotation
		if (this.rotateX || this.rotateY) {
			transform.m34 = -1 / perspective;
		}

		transform = CATransform3DTranslate(transform, this.translateX, this.translateY, 0);
		transform = iOSNativeHelper.applyRotateTransform(transform, this.rotateX, this.rotateY, this.rotate);
		transform = CATransform3DScale(transform, scaleX, scaleY, 1);
		if (!CATransform3DEqualToTransform(this.nativeViewProtected.layer.transform, transform)) {
			const updateSuspended = this._isPresentationLayerUpdateSuspeneded();
			if (!updateSuspended) {
				CATransaction.begin();
			}
			this.nativeViewProtected.layer.transform = transform;
			this._hasTransfrom = this.nativeViewProtected && !CATransform3DEqualToTransform(this.nativeViewProtected.transform3D, CATransform3DIdentity);
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

	public _isPresentationLayerUpdateSuspeneded(): boolean {
		return this._suspendCATransaction || this._suspendNativeUpdatesCount > 0;
	}

	protected _showNativeModalView(parent: View, options: ShowModalOptions) {
		const parentWithController = IOSHelper.getParentWithViewController(parent);
		if (!parentWithController) {
			Trace.write(`Could not find parent with viewController for ${parent} while showing modal view.`, Trace.categories.ViewHierarchy, Trace.messageType.error);

			return;
		}

		const parentController = parentWithController.viewController;
		if (parentController.presentedViewController) {
			Trace.write('Parent is already presenting view controller. Close the current modal page before showing another one!', Trace.categories.ViewHierarchy, Trace.messageType.error);

			return;
		}

		if (!parentController.view || !parentController.view.window) {
			Trace.write('Parent page is not part of the window hierarchy.', Trace.categories.ViewHierarchy, Trace.messageType.error);

			return;
		}

		this._setupAsRootView({});

		super._showNativeModalView(<ViewCommon>parentWithController, options);
		let controller = this.viewController;
		if (!controller) {
			const nativeView = this.ios || this.nativeViewProtected;
			controller = <UIViewController>IOSHelper.UILayoutViewController.initWithOwner(new WeakRef(this));

			if (nativeView instanceof UIView) {
				controller.view.addSubview(nativeView);
			}

			this.viewController = controller;
		}

		if (options.fullscreen) {
			controller.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
		} else {
			controller.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
			//check whether both height and width is provided and are positive numbers
			// set it has prefered content size to the controller presenting the dialog
			if (options.ios && options.ios.width > 0 && options.ios.height > 0) {
				controller.preferredContentSize = CGSizeMake(options.ios.width, options.ios.height);
			} else {
				//use CSS & attribute width & height if option is not provided
				let handler = () => {
					let w = <number>(this.width || this.style.width);
					let h = <number>(this.height || this.style.height);

					//TODO: only numeric value is supported, percentage value is not supported like Android
					if (w > 0 && h > 0) {
						controller.preferredContentSize = CGSizeMake(w, h);
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
	}

	protected _hideNativeModalView(parent: View, whenClosedCallback: () => void) {
		if (!parent || !parent.viewController) {
			Trace.error('Trying to hide modal view but no parent with viewController specified.');

			return;
		}

		// modal view has already been closed by UI, probably as a popover
		if (!parent.viewController.presentedViewController) {
			whenClosedCallback();

			return;
		}

		const parentController = parent.viewController;
		const animated = this._modalAnimatedOptions ? !!this._modalAnimatedOptions.pop() : true;

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
		this._nativeBackgroundState = 'invalid';
		if (this.isLayoutValid) {
			this._redrawNativeBackground(value);
		}
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

		this._nativeBackgroundState = 'drawn';
	}

	_setNativeClipToBounds() {
		const backgroundInternal = this.style.backgroundInternal;
		this.nativeViewProtected.clipsToBounds = this.nativeViewProtected instanceof UIScrollView || backgroundInternal.hasBorderWidth() || backgroundInternal.hasBorderRadius();
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
		controller.presentationController.delegate = <UIAdaptivePresentationControllerDelegate>this._adaptivePresentationDelegate;
	}
}
View.prototype._nativeBackgroundState = 'unset';

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
			if (typeof atIndex !== 'number' || atIndex >= parentNativeView.subviews.count) {
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
