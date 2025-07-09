// Definitions.
import { Frame, BackstackEntry, NavigationType } from '../frame';

// Types.
import { View, IOSHelper } from '../core/view';
import { PageBase, actionBarHiddenProperty, statusBarStyleProperty } from './page-common';

import { profile } from '../../profiling';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { getLastFocusedViewOnPage, isAccessibilityServiceEnabled } from '../../accessibility';
import { SharedTransition } from '../transition/shared-transition';

export * from './page-common';

const ENTRY = '_entry';
const DELEGATE = '_delegate';
const TRANSITION = '_transition';
const NON_ANIMATED_TRANSITION = 'non-animated';

@NativeClass
class UIViewControllerImpl extends UIViewController {
	// TODO: a11y
	// static ObjCExposedMethods = {
	// 	accessibilityPerformEscape: { returns: interop.types.bool, params: [interop.types.void] },
	// };
	private _owner: WeakRef<Page>;

	public isBackstackSkipped: boolean;
	public isBackstackCleared: boolean;
	private didFirstLayout: boolean;
	// this is initialized in initWithOwner since the constructor doesn't run on native classes
	private _isRunningLayout: number;
	private get isRunningLayout() {
		return this._isRunningLayout !== 0;
	}
	private startRunningLayout() {
		this._isRunningLayout++;
	}
	private finishRunningLayout() {
		this._isRunningLayout--;
		this.didFirstLayout = true;
	}
	private runLayout(cb: () => void) {
		try {
			this.startRunningLayout();
			cb();
		} finally {
			this.finishRunningLayout();
		}
	}

	public static initWithOwner(owner: WeakRef<Page>): UIViewControllerImpl {
		const controller = <UIViewControllerImpl>UIViewControllerImpl.new();
		controller._owner = owner;
		controller._isRunningLayout = 0;
		controller.didFirstLayout = false;

		return controller;
	}

	public viewDidLoad(): void {
		super.viewDidLoad();

		// Unify translucent and opaque bars layout
		// this.edgesForExtendedLayout = UIRectEdgeBottom;
		this.extendedLayoutIncludesOpaqueBars = true;
	}

	public viewWillAppear(animated: boolean): void {
		super.viewWillAppear(animated);
		const owner = this._owner?.deref();
		if (!owner) {
			return;
		}

		const frame: Frame = this.navigationController ? (<any>this.navigationController).owner : null;

		if (frame) {
			const entry: BackstackEntry = this[ENTRY];
			const currentPage = frame.currentPage;

			// Don't raise event if currentPage was showing modal page.
			if (!owner._presentedViewController && entry && currentPage !== owner && !frame._executingContext) {
				const isBack: boolean = frame.backStack.includes(entry);

				frame._executingContext = {
					entry,
					isBackNavigation: isBack,
					navigationType: isBack ? NavigationType.back : NavigationType.forward,
				};
				frame._onNavigatingTo(entry, isBack);
			}

			frame._resolvedPage = owner;

			if (owner.parent === frame) {
				frame._inheritStyles(owner);
			} else {
				if (!owner.parent) {
					if (!frame._styleScope) {
						// Make sure page will have styleScope even if frame doesn't.
						owner._updateStyleScope();
					}

					frame._addView(owner);
				} else {
					throw new Error('Page is already shown on another frame.');
				}
			}

			frame._updateActionBar(owner);
		}

		// Set autoAdjustScrollInsets in will appear - as early as possible
		IOSHelper.updateAutoAdjustScrollInsets(this, owner);

		// Pages in backstack are unloaded so raise loaded here.
		if (!owner.isLoaded) {
			owner.callLoaded();
		} else {
			// Note: Handle the case of canceled backstack navigation. (https://github.com/NativeScript/NativeScript/issues/7430)
			// In this case viewWillAppear will be executed for the previous page and it will change the ActionBar
			// because changes happen in an interactive transition - IOS will animate between the the states.
			// If canceled - viewWillAppear will be called for the current page(which is already loaded) and we need to
			// update the action bar explicitly, so that it is not left styles as the previous page.
			owner.updateWithWillAppear(animated);
		}
	}

	@profile
	public viewDidAppear(animated: boolean): void {
		super.viewDidAppear(animated);

		const owner = this._owner?.deref();
		if (!owner) {
			return;
		}

		const navigationController = this.navigationController;
		const frame: Frame = navigationController ? (<any>navigationController).owner : null;

		if (frame) {
			const newEntry: BackstackEntry = this[ENTRY];

			// There are cases like swipe back navigation that can be cancelled.
			// When that's the case, stop here and unset executing context.
			if (frame._executingContext && frame._executingContext.entry !== newEntry) {
				frame._executingContext = null;
				return;
			}

			// Skip navigation events if modal page is shown.
			if (!owner._presentedViewController) {
				// frame.setCurrent(...) will reset executing context so retrieve it here
				const navigationType = frame._executingContext?.navigationType ?? NavigationType.back;
				const isReplace = navigationType === NavigationType.replace;

				frame.setCurrent(newEntry, navigationType);

				if (isReplace) {
					const controller = newEntry.resolvedPage.ios;
					if (controller) {
						const animated = frame._getIsAnimatedNavigation(newEntry.entry);
						if (animated) {
							controller[TRANSITION] = frame._getNavigationTransition(newEntry.entry);
						} else {
							controller[TRANSITION] = {
								name: NON_ANIMATED_TRANSITION,
							};
						}
					}
				}

				// If page was shown with custom animation - we need to set the navigationController.delegate to the animatedDelegate.
				if (frame.ios?.controller) {
					frame.ios.controller.delegate = this[DELEGATE];
				}

				frame._processNavigationQueue(owner);

				if (!__VISIONOS__) {
					// _processNavigationQueue will shift navigationQueue. Check canGoBack after that.
					// Workaround for disabled backswipe on second custom native transition
					if (frame.canGoBack()) {
						const transitionState = SharedTransition.getState(owner.transitionId);
						if (!transitionState?.interactive) {
							// only consider when interactive transitions are not enabled
							navigationController.interactivePopGestureRecognizer.delegate = navigationController;
							navigationController.interactivePopGestureRecognizer.enabled = owner.enableSwipeBackNavigation;
						}
					} else {
						navigationController.interactivePopGestureRecognizer.enabled = false;
					}
				}
			}
		}

		if (!this.presentedViewController) {
			// clear presented viewController here only if no presented controller.
			// this is needed because in iOS9 the order of events could be - willAppear, willDisappear, didAppear.
			// If we clean it when we have viewController then once presented VC is dismissed then
			owner._presentedViewController = null;
		}
	}

	@profile
	public viewWillDisappear(animated: boolean): void {
		super.viewWillDisappear(animated);

		const owner = this._owner?.deref();
		if (!owner) {
			return;
		}

		// Cache presentedViewController if any. We don't want to raise
		// navigation events in case of presenting view controller.
		if (!owner._presentedViewController) {
			owner._presentedViewController = this.presentedViewController;
		}

		owner.updateWithWillDisappear(animated);
	}

	@profile
	public viewDidDisappear(animated: boolean): void {
		super.viewDidDisappear(animated);

		const owner = this._owner?.deref();

		// Exit if no page or page is hiding because it shows another page modally.
		if (!owner || owner.modal || owner._presentedViewController) {
			return;
		}

		// Forward navigation does not remove page from frame so we raise unloaded manually.
		if (owner.isLoaded) {
			owner.callUnloaded();
		}
	}

	public viewWillLayoutSubviews(): void {
		super.viewWillLayoutSubviews();
		const owner = this._owner?.deref();
		if (owner) {
			IOSHelper.updateConstraints(this, owner);
		}
	}

	public viewSafeAreaInsetsDidChange(): void {
		super.viewSafeAreaInsetsDidChange();
		if (this.isRunningLayout || !this.didFirstLayout) {
			return;
		}
		const owner = this._owner?.deref();
		if (owner) {
			this.runLayout(() => IOSHelper.layoutView(this, owner));
		}
	}

	public viewDidLayoutSubviews(): void {
		this.startRunningLayout();
		super.viewDidLayoutSubviews();
		const owner = this._owner?.deref();
		if (owner) {
			// layout(owner.actionBar)
			// layout(owner.content)

			if (SDK_VERSION >= 11) {
				// Handle nested Page safe area insets application.
				// A Page is nested if its Frame has a parent.
				// If the Page is nested, cross check safe area insets on top and bottom with Frame parent.
				const frame = owner.parent;
				// There is a legacy scenario where Page is not in a Frame - the root of a Modal View, so it has no parent.
				let frameParent = frame && frame.parent;

				// Handle Angular scenario where TabView is in a ProxyViewContainer
				// It is possible to wrap components in ProxyViewContainers indefinitely
				// Not using instanceof ProxyViewContainer to avoid circular dependency
				// TODO: Try moving UIViewControllerImpl out of page module
				while (frameParent && !frameParent.nativeViewProtected) {
					frameParent = frameParent.parent;
				}

				if (frameParent) {
					const parentPageInsetsTop = frameParent.nativeViewProtected.safeAreaInsets.top;
					const parentPageInsetsBottom = frameParent.nativeViewProtected.safeAreaInsets.bottom;
					let currentInsetsTop = this.view.safeAreaInsets.top;
					let currentInsetsBottom = this.view.safeAreaInsets.bottom;

					// Safe area insets include additional safe area insets too, so subtract old values
					if (this.additionalSafeAreaInsets) {
						currentInsetsTop -= this.additionalSafeAreaInsets.top;
						currentInsetsBottom -= this.additionalSafeAreaInsets.bottom;
					}

					const additionalInsetsTop = Math.max(parentPageInsetsTop - currentInsetsTop, 0);
					const additionalInsetsBottom = Math.max(parentPageInsetsBottom - currentInsetsBottom, 0);

					if (additionalInsetsTop > 0 || additionalInsetsBottom > 0) {
						const additionalInsets = new UIEdgeInsets({
							top: additionalInsetsTop,
							left: 0,
							bottom: additionalInsetsBottom,
							right: 0,
						});
						this.additionalSafeAreaInsets = additionalInsets;
					} else {
						this.additionalSafeAreaInsets = null;
					}
				}
			}

			IOSHelper.layoutView(this, owner);
		}
		this.finishRunningLayout();
	}

	// Mind implementation for other controllerss
	public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
		super.traitCollectionDidChange(previousTraitCollection);

		if (SDK_VERSION >= 13) {
			const owner = this._owner?.deref();
			if (owner && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)) {
				owner.notify({
					eventName: IOSHelper.traitCollectionColorAppearanceChangedEvent,
					object: owner,
				});
			}
		}
	}

	// TODO: a11y
	// public accessibilityPerformEscape() {
	// 	const owner = this._owner.get();
	// 	if (!owner) {
	// 		return false;
	// 	}
	// 	console.log('page accessibilityPerformEscape');
	// 	if (owner.onAccessibilityPerformEscape) {
	// 		const result = owner.onAccessibilityPerformEscape();
	// 		return result;
	// 	} else {
	// 		return false;
	// 	}
	// }

	// @ts-ignore
	public get preferredStatusBarStyle(): UIStatusBarStyle {
		const owner = this._owner?.deref();
		if (owner) {
			return owner.statusBarStyle === 'dark' ? UIStatusBarStyle.LightContent : UIStatusBarStyle.Default;
		} else {
			return UIStatusBarStyle.Default;
		}
	}
}

export class Page extends PageBase {
	nativeViewProtected: UIView;
	viewController: UIViewControllerImpl;
	onAccessibilityPerformEscape: () => boolean;

	private _backgroundColor = SDK_VERSION <= 12 && !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
	private _ios: UIViewControllerImpl;
	public _presentedViewController: UIViewController; // used when our page present native viewController without going through our abstraction.

	constructor() {
		super();
		const controller = UIViewControllerImpl.initWithOwner(new WeakRef(this));
		controller.view.backgroundColor = this._backgroundColor;
		this.viewController = this._ios = controller;
	}

	createNativeView() {
		return this.viewController.view;
	}

	disposeNativeView() {
		this.viewController = null;
		this._ios = null;
		super.disposeNativeView();
	}

	// @ts-ignore
	get ios(): UIViewController {
		return this._ios;
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const currentFrame = nativeView.frame;
		// Create a copy of current view frame
		const newFrame = CGRectMake(currentFrame.origin.x, currentFrame.origin.y, currentFrame.size.width, currentFrame.size.height);

		this._setNativeViewFrame(nativeView, newFrame);
	}

	public _modifyNativeViewFrame(nativeView: UIView, frame: CGRect) {
		//
	}

	public _shouldDelayLayout(): boolean {
		return this.frame && this.frame._animationInProgress;
	}

	public onLoaded(): void {
		super.onLoaded();
		if (this.hasActionBar) {
			this.actionBar.update();
		}
	}
	updateWithWillAppear(animated: boolean) {
		// this method is important because it allows plugins to react to modal page close
		// for example allowing updating status bar background color
		if (this.hasActionBar) {
			this.actionBar.update();
		}
		this.updateStatusBar();
	}

	updateWithWillDisappear(animated: boolean) {
		// this method is important because it allows plugins to react to modal page close
		// for example allowing updating status bar background color
	}

	public updateStatusBar() {
		this._updateStatusBarStyle(this.statusBarStyle);
	}

	public _updateStatusBarStyle(value?: string) {
		const frame = this.frame;
		if (frame && value) {
			const navigationController: UINavigationController = frame.ios.controller;
			const navigationBar = navigationController.navigationBar;

			navigationBar.barStyle = value === 'dark' ? UIBarStyle.Black : UIBarStyle.Default;
		}
	}

	public _updateEnableSwipeBackNavigation(enabled: boolean) {
		const navController = this._ios.navigationController;
		if (this.frame && navController && navController.interactivePopGestureRecognizer) {
			// Make sure we don't set true if cannot go back
			enabled = enabled && this.frame.canGoBack();
			navController.interactivePopGestureRecognizer.enabled = enabled;
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		if (this.hasActionBar && this.frame && this.frame._getNavBarVisible(this)) {
			const { width, height } = this.actionBar._getActualSize;
			const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
			const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);
			View.measureChild(this, this.actionBar, widthSpec, heightSpec);
		}

		const result = View.measureChild(this, this.layoutView, widthMeasureSpec, heightMeasureSpec);

		const measureWidth = Math.max(result.measuredWidth, this.effectiveMinWidth);
		const measureHeight = Math.max(result.measuredHeight, this.effectiveMinHeight);

		const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(left: number, top: number, right: number, bottom: number) {
		if (this.hasActionBar) {
			const { width: actionBarWidth, height: actionBarHeight } = this.actionBar._getActualSize;
			View.layoutChild(this, this.actionBar, 0, 0, actionBarWidth, actionBarHeight);
		}

		const insets = this.getSafeAreaInsets();

		if (!__VISIONOS__ && SDK_VERSION <= 10) {
			// iOS 10 and below don't have safe area insets API,
			// there we need only the top inset on the Page
			insets.top = layout.round(layout.toDevicePixels(this.viewController.view.safeAreaLayoutGuide.layoutFrame.origin.y));
		}

		const childLeft = 0 + insets.left;
		const childTop = 0 + insets.top;
		const childRight = right - insets.right;
		const childBottom = bottom - insets.bottom;

		View.layoutChild(this, this.layoutView, childLeft, childTop, childRight, childBottom);
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
		// ActionBar is handled by the UINavigationController
		if (this.hasActionBar && child === this.actionBar) {
			return true;
		}

		const nativeParent = this.nativeViewProtected;
		const nativeChild = child.nativeViewProtected;

		const viewController = child.ios instanceof UIViewController ? child.ios : child.viewController;
		if (viewController) {
			// Adding modal controllers to as child will make app freeze.
			if (this.viewController.presentedViewController === viewController) {
				return true;
			}

			this.viewController.addChildViewController(viewController);
		}

		if (nativeParent && nativeChild) {
			if (typeof atIndex !== 'number' || atIndex >= nativeParent.subviews.count) {
				nativeParent.addSubview(nativeChild);
			} else {
				nativeParent.insertSubviewAtIndex(nativeChild, atIndex);
			}

			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		// ActionBar is handled by the UINavigationController
		if (this.hasActionBar && child === this.actionBar) {
			return;
		}

		const viewController = child.ios instanceof UIViewController ? child.ios : child.viewController;
		if (viewController) {
			viewController.removeFromParentViewController();
		}

		super._removeViewFromNativeVisualTree(child);
	}

	[actionBarHiddenProperty.setNative](value: boolean) {
		this._updateEnableSwipeBackNavigation(value);

		// Invalidate all inner controller.
		invalidateTopmostController(this.viewController);

		const frame = this.frame;
		if (frame) {
			// Update nav-bar visibility with disabled animations
			frame._updateActionBar(this, true);
		}
	}

	[statusBarStyleProperty.getDefault](): UIBarStyle {
		return UIBarStyle.Default;
	}
	[statusBarStyleProperty.setNative](value: string | UIBarStyle) {
		const frame = this.frame;
		if (frame) {
			const navigationBar = (<UINavigationController>frame.ios.controller).navigationBar;
			if (typeof value === 'string') {
				navigationBar.barStyle = value === 'dark' ? UIBarStyle.Black : UIBarStyle.Default;
			} else {
				navigationBar.barStyle = value;
			}
		}
	}

	public accessibilityScreenChanged(refocus = false): void {
		if (!isAccessibilityServiceEnabled()) {
			return;
		}

		if (refocus) {
			const lastFocusedView = getLastFocusedViewOnPage(this);
			if (lastFocusedView) {
				const uiView = lastFocusedView.nativeViewProtected;
				if (uiView) {
					UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, uiView);

					return;
				}
			}
		}

		if (this.actionBarHidden) {
			UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, this.nativeViewProtected);

			return;
		}

		if (this.accessibilityLabel) {
			UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, this.nativeViewProtected);

			return;
		}

		if (this.actionBar.accessibilityLabel || this.actionBar.title) {
			UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, this.actionBar.nativeView);

			return;
		}

		UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, this.nativeViewProtected);
	}
}

function invalidateTopmostController(controller: UIViewController): void {
	if (!controller) {
		return;
	}

	controller.view.setNeedsLayout();

	const presentedViewController = controller.presentedViewController;
	if (presentedViewController) {
		return invalidateTopmostController(presentedViewController);
	}

	const childControllers = controller.childViewControllers;
	let size = controller.childViewControllers.count;
	while (size > 0) {
		const childController = childControllers[--size];
		if (childController instanceof UITabBarController) {
			invalidateTopmostController(childController.selectedViewController);
		} else if (childController instanceof UINavigationController) {
			invalidateTopmostController(childController.topViewController);
		} else if (childController instanceof UISplitViewController) {
			invalidateTopmostController(childController.viewControllers.lastObject);
		} else {
			invalidateTopmostController(childController);
		}
	}
}
