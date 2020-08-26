// Definitions.
import { Frame, BackstackEntry, NavigationType } from '../frame';

// Types.
import { View, IOSHelper } from '../core/view';
import { PageBase, actionBarHiddenProperty, statusBarStyleProperty } from './page-common';

import { profile } from '../../profiling';
import { iOSNativeHelper, layout } from '../../utils';

export * from './page-common';

const ENTRY = '_entry';
const DELEGATE = '_delegate';
const TRANSITION = '_transition';
const NON_ANIMATED_TRANSITION = 'non-animated';

const majorVersion = iOSNativeHelper.MajorVersion;

function isBackNavigationTo(page: Page, entry): boolean {
	const frame = page.frame;
	if (!frame) {
		return false;
	}

	// if executing context is null here this most probably means back navigation through iOS back button
	const navigationContext = frame._executingContext || {
		navigationType: NavigationType.back,
	};
	const isReplace = navigationContext.navigationType === NavigationType.replace;
	if (isReplace) {
		return false;
	}

	if (frame.navigationQueueIsEmpty()) {
		return true;
	}

	const navigationQueue = (<any>frame)._navigationQueue;
	for (let i = 0; i < navigationQueue.length; i++) {
		if (navigationQueue[i].entry === entry) {
			return navigationQueue[i].navigationType === NavigationType.back;
		}
	}

	return false;
}

function isBackNavigationFrom(controller: UIViewControllerImpl, page: Page): boolean {
	if (!page.frame) {
		return false;
	}

	// Controller is cleared or backstack skipped
	if (controller.isBackstackCleared || controller.isBackstackSkipped) {
		return false;
	}

	if (controller.navigationController && controller.navigationController.viewControllers.containsObject(controller)) {
		return false;
	}

	return true;
}

@NativeClass
class UIViewControllerImpl extends UIViewController {
	private _owner: WeakRef<Page>;

	public isBackstackSkipped: boolean;
	public isBackstackCleared: boolean;

	public static initWithOwner(owner: WeakRef<Page>): UIViewControllerImpl {
		const controller = <UIViewControllerImpl>UIViewControllerImpl.new();
		controller._owner = owner;

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
		const owner = this._owner.get();
		if (!owner) {
			return;
		}

		const frame = this.navigationController ? (<any>this.navigationController).owner : null;
		const newEntry = this[ENTRY];

		// Don't raise event if currentPage was showing modal page.
		if (!owner._presentedViewController && newEntry && (!frame || frame.currentPage !== owner)) {
			const isBack = isBackNavigationTo(owner, newEntry);
			owner.onNavigatingTo(newEntry.entry.context, isBack, newEntry.entry.bindingContext);
		}

		if (frame) {
			if (!owner.parent) {
				owner._frame = frame;
				if (!frame._styleScope) {
					// Make sure page will have styleScope even if frame don't.
					owner._updateStyleScope();
				}

				frame._addView(owner);
			} else if (owner.parent !== frame) {
				throw new Error('Page is already shown on another frame.');
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
			owner.actionBar.update();
		}
	}

	@profile
	public viewDidAppear(animated: boolean): void {
		super.viewDidAppear(animated);

		const owner = this._owner.get();
		if (!owner) {
			return;
		}

		const navigationController = this.navigationController;
		const frame: Frame = navigationController ? (<any>navigationController).owner : null;
		// Skip navigation events if modal page is shown.
		if (!owner._presentedViewController && frame) {
			const newEntry: BackstackEntry = this[ENTRY];

			// frame.setCurrent(...) will reset executing context so retrieve it here
			// if executing context is null here this most probably means back navigation through iOS back button
			const navigationContext = frame._executingContext || {
				navigationType: NavigationType.back,
			};
			const isReplace = navigationContext.navigationType === NavigationType.replace;

			frame.setCurrent(newEntry, navigationContext.navigationType);

			if (isReplace) {
				let controller = newEntry.resolvedPage.ios;
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
			frame.ios.controller.delegate = this[DELEGATE];

			frame._processNavigationQueue(owner);

			// _processNavigationQueue will shift navigationQueue. Check canGoBack after that.
			// Workaround for disabled backswipe on second custom native transition
			if (frame.canGoBack()) {
				navigationController.interactivePopGestureRecognizer.delegate = navigationController;
				navigationController.interactivePopGestureRecognizer.enabled = owner.enableSwipeBackNavigation;
			} else {
				navigationController.interactivePopGestureRecognizer.enabled = false;
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

		const owner = this._owner.get();
		if (!owner) {
			return;
		}

		// Cache presentedViewController if any. We don't want to raise
		// navigation events in case of presenting view controller.
		if (!owner._presentedViewController) {
			owner._presentedViewController = this.presentedViewController;
		}

		const frame = owner.frame;
		// Skip navigation events if we are hiding because we are about to show a modal page,
		// or because we are closing a modal page,
		// or because we are in tab and another controller is selected.
		const tab = this.tabBarController;
		if (owner.onNavigatingFrom && !owner._presentedViewController && !this.presentingViewController && frame && frame.currentPage === owner) {
			const willSelectViewController = tab && (<any>tab)._willSelectViewController;
			if (!willSelectViewController || willSelectViewController === tab.selectedViewController) {
				const isBack = isBackNavigationFrom(this, owner);
				owner.onNavigatingFrom(isBack);
			}
		}
	}

	@profile
	public viewDidDisappear(animated: boolean): void {
		super.viewDidDisappear(animated);

		const page = this._owner.get();
		// Exit if no page or page is hiding because it shows another page modally.
		if (!page || page.modal || page._presentedViewController) {
			return;
		}
		// Forward navigation does not remove page from frame so we raise unloaded manually.
		if (page.isLoaded) {
			page.callUnloaded();
		}
	}

	public viewWillLayoutSubviews(): void {
		super.viewWillLayoutSubviews();
		const owner = this._owner.get();
		if (owner) {
			IOSHelper.updateConstraints(this, owner);
		}
	}

	public viewDidLayoutSubviews(): void {
		super.viewDidLayoutSubviews();
		const owner = this._owner.get();
		if (owner) {
			// layout(owner.actionBar)
			// layout(owner.content)

			if (majorVersion >= 11) {
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
					const currentInsetsTop = this.view.safeAreaInsets.top;
					const additionalInsetsTop = Math.max(parentPageInsetsTop - currentInsetsTop, 0);

					const parentPageInsetsBottom = frameParent.nativeViewProtected.safeAreaInsets.bottom;
					const currentInsetsBottom = this.view.safeAreaInsets.bottom;
					const additionalInsetsBottom = Math.max(parentPageInsetsBottom - currentInsetsBottom, 0);

					if (additionalInsetsTop > 0 || additionalInsetsBottom > 0) {
						const additionalInsets = new UIEdgeInsets({
							top: additionalInsetsTop,
							left: 0,
							bottom: additionalInsetsBottom,
							right: 0,
						});
						this.additionalSafeAreaInsets = additionalInsets;
					}
				}
			}

			IOSHelper.layoutView(this, owner);
		}
	}

	// Mind implementation for other controllerss
	public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
		super.traitCollectionDidChange(previousTraitCollection);

		if (majorVersion >= 13) {
			const owner = this._owner.get();
			if (owner && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)) {
				owner.notify({
					eventName: IOSHelper.traitCollectionColorAppearanceChangedEvent,
					object: owner,
				});
			}
		}
	}

	public get preferredStatusBarStyle(): UIStatusBarStyle {
		const owner = this._owner.get();
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

	private _backgroundColor = majorVersion <= 12 && !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
	private _ios: UIViewControllerImpl;
	public _presentedViewController: UIViewController; // used when our page present native viewController without going through our abstraction.

	constructor() {
		super();
		const controller = UIViewControllerImpl.initWithOwner(new WeakRef(this));
		this.viewController = this._ios = controller;

		// Make transitions look good
		controller.view.backgroundColor = this._backgroundColor;
	}

	createNativeView() {
		return this.viewController.view;
	}

	get ios(): UIViewController {
		return this._ios;
	}

	get frame(): Frame {
		return this._frame;
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		//
	}

	public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
		//
	}

	public _shouldDelayLayout(): boolean {
		return this._frame && this._frame._animationInProgress;
	}

	public onLoaded(): void {
		super.onLoaded();
		if (this.hasActionBar) {
			this.actionBar.update();
		}
	}

	public updateStatusBar() {
		this._updateStatusBarStyle(this.statusBarStyle);
	}

	public _updateStatusBarStyle(value?: string) {
		const frame = this.frame;
		if (this.frame && value) {
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

		if (this.frame && this.frame._getNavBarVisible(this)) {
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
		const { width: actionBarWidth, height: actionBarHeight } = this.actionBar._getActualSize;
		View.layoutChild(this, this.actionBar, 0, 0, actionBarWidth, actionBarHeight);

		const insets = this.getSafeAreaInsets();

		if (majorVersion <= 10) {
			// iOS 10 and below don't have safe area insets API,
			// there we need only the top inset on the Page
			insets.top = layout.round(layout.toDevicePixels(this.viewController.view.safeAreaLayoutGuide.layoutFrame.origin.y));
		}

		const childLeft = 0 + insets.left;
		const childTop = 0 + insets.top;
		const childRight = right - insets.right;
		let childBottom = bottom - insets.bottom;

		View.layoutChild(this, this.layoutView, childLeft, childTop, childRight, childBottom);
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
		// ActionBar is handled by the UINavigationController
		if (child === this.actionBar) {
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
		if (child === this.actionBar) {
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
