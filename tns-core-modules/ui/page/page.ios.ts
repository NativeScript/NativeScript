// Definitions.
import { Frame } from "../frame";

// Types.
import { ios as iosView } from "../core/view";
import {
    PageBase, View, ViewBase, layout,
    actionBarHiddenProperty, statusBarStyleProperty,
    traceEnabled, traceWrite, traceCategories, PercentLength, Color
} from "./page-common";
import { ios as iosApp } from "../../application";
import { device } from "../../platform";
// HACK: Webpack. Use a fully-qualified import to allow resolve.extensions(.ios.js) to
// kick in. `../utils` doesn't seem to trigger the webpack extensions mechanism.
import * as uiUtils from "../../ui/utils";
import { profile } from "../../profiling";

export * from "./page-common";

import { ios } from "../../utils/utils";
import getter = ios.getter;

const ENTRY = "_entry";
const DELEGATE = "_delegate";

function isBackNavigationTo(page: Page, entry): boolean {
    const frame = page.frame;
    if (!frame) {
        return false;
    }

    if (frame.navigationQueueIsEmpty()) {
        return true;
    } else {
        const navigationQueue = (<any>frame)._navigationQueue;
        for (let i = 0; i < navigationQueue.length; i++) {
            if (navigationQueue[i].entry === entry) {
                return navigationQueue[i].isBackNavigation;
            }
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

class UIViewControllerImpl extends UIViewController {

    private _owner: WeakRef<Page>;

    public isBackstackSkipped: boolean;
    public isBackstackCleared: boolean;

    public static initWithOwner(owner: WeakRef<Page>): UIViewControllerImpl {
        const controller = <UIViewControllerImpl>UIViewControllerImpl.new();
        controller._owner = owner;
        return controller;
    }

    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        const frame = this.navigationController ? (<any>this.navigationController).owner : null;
        const newEntry = this[ENTRY];
        const modalParent = owner._modalParent;

        // Don't raise event if currentPage was showing modal page.
        if (!owner._presentedViewController && newEntry && (!frame || frame.currentPage !== owner)) {
            const isBack = isBackNavigationTo(owner, newEntry);
            owner.onNavigatingTo(newEntry.entry.context, isBack, newEntry.entry.bindingContext);
        }

        owner._enableLoadedEvents = true;

        // Add page to frame if showing modal page.
        // TODO: This needs refactoring. 
        if (modalParent) {
            modalParent._addView(owner);
        }

        if (frame) {
            if (!owner.parent) {
                if (!frame._currentEntry) {
                    frame._currentEntry = newEntry;
                } else {
                    frame._navigateToEntry = newEntry;
                }

                owner._frame = frame;
                frame._addView(owner);
            } else if (owner.parent !== frame) {
                throw new Error("Page is already shown on another frame.");
            }

            owner.actionBar.update();
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        owner._viewWillDisappear = false;

        // Pages in backstack are unloaded so raise loaded here.
        if (!owner.isLoaded) {
            owner.onLoaded();
        }

        owner._enableLoadedEvents = false;
    }

    public viewDidAppear(animated: boolean): void {
        super.viewDidAppear(animated);

        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        owner._viewWillDisappear = false;

        const frame = this.navigationController ? (<any>this.navigationController).owner : null;
        // Skip navigation events if modal page is shown.
        if (!owner._presentedViewController && frame) {
            const newEntry = this[ENTRY];
            let isBack = isBackNavigationTo(owner, newEntry);
            // We are on the current page which happens when navigation is canceled so isBack should be false.
            if (frame.currentPage === owner && frame._navigationQueue.length === 0) {
                isBack = false;
            }

            frame._navigateToEntry = null;
            frame._currentEntry = newEntry;
            owner.onNavigatedTo(isBack);

            // If page was shown with custom animation - we need to set the navigationController.delegate to the animatedDelegate.
            frame.ios.controller.delegate = this[DELEGATE];

            // Workaround for disabled backswipe on second custom native transition
            if (frame.canGoBack()) {
                this.navigationController.interactivePopGestureRecognizer.delegate = this.navigationController;
                this.navigationController.interactivePopGestureRecognizer.enabled = owner.enableSwipeBackNavigation;
            } else {
                this.navigationController.interactivePopGestureRecognizer.enabled = false;
            }

            frame._processNavigationQueue(owner);
        }

        if (!this.presentedViewController) {
            // clear presented viewController here only if no presented controller.
            // this is needed because in iOS9 the order of events could be - willAppear, willDisappear, didAppear.
            // If we clean it when we have viewController then once presented VC is dismissed then
            owner._presentedViewController = null;
        }
    }

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
        // Skip navigation events if we are hiding because we are about to show modal page
        // or because we are in tab and another controller is selected.
        const tab = this.tabBarController;
        if (!owner._presentedViewController && frame && frame.currentPage === owner) {
            const willSelectViewController = tab && (<any>tab)._willSelectViewController;
            if (!willSelectViewController
                || willSelectViewController === tab.selectedViewController) {
                let isBack = isBackNavigationFrom(this, owner);
                owner.onNavigatingFrom(isBack);
            }
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        owner._viewWillDisappear = true;
    }

    public viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);

        const page = this._owner.get();
        // Exit if no page or page is hiding because it shows another page modally.
        if (!page || page.modal || page._presentedViewController) {
            return;
        }

        const modalParent = page._modalParent;
        page._modalParent = undefined;
        page._UIModalPresentationFormSheet = false;

        // Clear up after modal page has closed.
        if (modalParent) {
            modalParent._removeView(page);
            modalParent._modal = undefined;
        }

        // Manually pop backStack when Back button is pressed or navigating back with edge swipe.
        // Don't pop if we are hiding modally shown page.
        const frame = page.frame;
        // We are not modal page, have frame with backstack and navigation queue is empty and currentPage is closed
        // then pop our backstack.
        // If we are in frame wich is in tab and tab.selectedControler is not the frame
        // skip navigation.
        const tab = this.tabBarController;
        const fireNavigationEvents = !tab
            || tab.selectedViewController === this.navigationController;

        if (!modalParent && frame && frame.backStack.length > 0 && frame.navigationQueueIsEmpty() && frame.currentPage === page) {
            if (fireNavigationEvents) {
                (<any>frame)._backStack.pop();
            }
        }

        page._enableLoadedEvents = true;

        // Remove from parent if page was in frame and we navigated back.
        // Showing page modally will not pass isBack check so currentPage won't be removed from Frame.
        const isBack = isBackNavigationFrom(this, page);
        if (isBack) {
            // Remove parent when navigating back.
            frame._removeView(page);
            page._frame = null;
        }

        // Forward navigation does not remove page from frame so we raise unloaded manually.
        if (page.isLoaded) {
            page.onUnloaded();
        }

        page._enableLoadedEvents = false;

        if (!modalParent && fireNavigationEvents) {
            // Last raise onNavigatedFrom event if we are not modally shown.
            page.onNavigatedFrom(isBack);
        }
    }

    public viewWillLayoutSubviews(): void {
        super.viewWillLayoutSubviews();

        const owner = this._owner.get();
        iosView.updateConstraints(this, owner);
    }

    public viewDidLayoutSubviews(): void {
        super.viewDidLayoutSubviews();

        const owner = this._owner.get();
        iosView.layoutView(this, owner);
    }
}

const whiteColor = new Color("white").ios;
export class Page extends PageBase {
    nativeViewProtected: UIView;
    viewController: UIViewControllerImpl;

    private _ios: UIViewControllerImpl;
    public _enableLoadedEvents: boolean;
    public _modalParent: Page;
    public _UIModalPresentationFormSheet: boolean;
    public _viewWillDisappear: boolean;
    public _presentedViewController: UIViewController; // used when our page present native viewController without going through our abstraction.

    constructor() {
        super();
        const controller = UIViewControllerImpl.initWithOwner(new WeakRef(this));
        const view = UIView.alloc().initWithFrame(getter(UIScreen, UIScreen.mainScreen).bounds);
        controller.view.addSubview(view);
        this.viewController = this._ios = controller;
        this.nativeViewProtected = controller.view;
        this.nativeViewProtected.backgroundColor = whiteColor;
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

    @profile
    public onLoaded() {
        // loaded/unloaded events are handled in page viewWillAppear/viewDidDisappear
        if (this._enableLoadedEvents) {
            super.onLoaded();
        }

        this.updateActionBar();
    }

    public onUnloaded() {
        // loaded/unloaded events are handled in page viewWillAppear/viewDidDisappear
        if (this._enableLoadedEvents) {
            super.onUnloaded();
        }
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        super._showNativeModalView(parent, context, closeCallback, fullscreen);
        this._modalParent = parent;

        if (!parent.ios.view.window) {
            throw new Error("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!");
        }

        if (fullscreen) {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
        } else {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
            this._UIModalPresentationFormSheet = true;
        }

        this._raiseShowingModallyEvent();

        parent.ios.presentViewControllerAnimatedCompletion(this._ios, true, null);
        const transitionCoordinator = getter(parent.ios, parent.ios.transitionCoordinator);
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion.call(transitionCoordinator, null, () => this._raiseShownModallyEvent());
        } else {
            // Apparently iOS 9+ stops all transitions and animations upon application suspend and transitionCoordinator becomes null here in this case.
            // Since we are not waiting for any transition to complete, i.e. transitionCoordinator is null, we can directly raise our shownModally event.
            // Take a look at https://github.com/NativeScript/NativeScript/issues/2173 for more info and a sample project.
            this._raiseShownModallyEvent();
        }
    }

    protected _hideNativeModalView(parent: Page) {
        parent.requestLayout();
        parent._ios.dismissModalViewControllerAnimated(true);

        super._hideNativeModalView(parent);
    }

    private updateActionBar(disableNavBarAnimation: boolean = false) {
        const frame = this.frame;
        if (frame) {
            frame._updateActionBar(this, disableNavBarAnimation);
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

            navigationBar.barStyle = value === "dark" ? UIBarStyle.Black : UIBarStyle.Default;
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

        if (!this._modalParent && this.frame && this.frame._getNavBarVisible(this)) {
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
        View.layoutChild(this, this.layoutView, 0, top, right - left, bottom);
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        // ActionBar is handled by the UINavigationController
        if (child === this.actionBar) {
            return true;
        }

        // Don't add modal pages our visual tree.
        if (child !== this.content) {
            return true;
        }

        const nativeParent = this.nativeViewProtected.subviews[0];
        const nativeChild = child.nativeViewProtected;

        const viewController = child.ios instanceof UIViewController ? child.ios : child.viewController;
        if (viewController) {
            this.viewController.addChildViewController(viewController);
        }

        if (nativeParent && nativeChild) {
            if (typeof atIndex !== "number" || atIndex >= nativeParent.subviews.count) {
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
        invalidateTopmostController(this.viewController);

        // Update nav-bar visibility with disabled animations
        this.updateActionBar(true);
    }

    [statusBarStyleProperty.getDefault](): UIBarStyle {
        return UIBarStyle.Default;
    }
    [statusBarStyleProperty.setNative](value: string | UIBarStyle) {
        const frame = this.frame;
        if (frame) {
            const navigationBar = (<UINavigationController>frame.ios.controller).navigationBar;
            if (typeof value === "string") {
                navigationBar.barStyle = value === "dark" ? UIBarStyle.Black : UIBarStyle.Default;
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