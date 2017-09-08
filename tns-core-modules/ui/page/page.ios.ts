import {
    PageBase, View, layout,
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
    let frame = page.frame;
    if (!frame) {
        return false;
    }

    if (frame.navigationQueueIsEmpty()) {
        return true;
    }
    else {
        let navigationQueue = (<any>frame)._navigationQueue;
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
    public shown: boolean;

    public static initWithOwner(owner: WeakRef<Page>): UIViewControllerImpl {
        let controller = <UIViewControllerImpl>UIViewControllerImpl.new();
        controller._owner = owner;
        controller.automaticallyAdjustsScrollViewInsets = false;
        controller.shown = false;
        return controller;
    }

    public viewDidLayoutSubviews() {
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        if (traceEnabled()) {
            traceWrite(owner + " viewDidLayoutSubviews, isLoaded = " + owner.isLoaded, traceCategories.ViewHierarchy);
        }

        if (!owner.isLoaded) {
            return;
        }

        const modalParent = owner._modalParent;
        if (modalParent) {
            // if inside horizontally compact environment - fullScreen will be forced
            let isFullScreen = !owner._UIModalPresentationFormSheet ||
                (modalParent.nativeViewProtected.traitCollection.horizontalSizeClass === UIUserInterfaceSizeClass.Compact);

            let frame = isFullScreen ? getter(UIScreen, UIScreen.mainScreen).bounds : this.view.frame;
            let size = frame.size;
            let width = layout.toDevicePixels(size.width);
            let height = layout.toDevicePixels(size.height);
            let mode: number = layout.EXACTLY;

            let superViewRotationRadians;
            if (this.view.superview) {
                let transform = this.view.superview.transform;
                superViewRotationRadians = atan2f(transform.b, transform.a);
            }

            let bottom = height;
            let statusBarHeight = uiUtils.ios.getStatusBarHeight();
            let statusBarVisible = !getter(UIApplication, UIApplication.sharedApplication).statusBarHidden;
            let backgroundSpanUnderStatusBar = owner.backgroundSpanUnderStatusBar;
            if (statusBarVisible && !backgroundSpanUnderStatusBar) {
                height -= statusBarHeight;
            }

            let widthSpec = layout.makeMeasureSpec(width, mode);
            let heightSpec = layout.makeMeasureSpec(height, mode);

            View.measureChild(modalParent, owner, widthSpec, heightSpec);
            let top = ((backgroundSpanUnderStatusBar && isFullScreen) || !isFullScreen) ? 0 : statusBarHeight;
            View.layoutChild(modalParent, owner, 0, top, width, bottom);

            if (traceEnabled()) {
                traceWrite(owner + ", native frame = " + NSStringFromCGRect(this.view.frame), traceCategories.Layout);
            }
        }
        else {
            if (!iosApp.window) {
                uiUtils.ios._layoutRootView(owner, getter(UIScreen, UIScreen.mainScreen).bounds);
            }
            owner._updateLayout();
        }
    }

    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        this.shown = false;
        let page = this._owner.get();

        if (traceEnabled) {
            traceWrite(page + " viewWillAppear", traceCategories.Navigation);
        }

        if (!page) {
            return;
        }

        const frame = this.navigationController ? (<any>this.navigationController).owner : null;
        const newEntry = this[ENTRY];
        const modalParent = page._modalParent;

        // Don't raise event if currentPage was showing modal page.
        if (!page._presentedViewController && newEntry && (!frame || frame.currentPage !== page)) {
            let isBack = isBackNavigationTo(page, newEntry);
            page.onNavigatingTo(newEntry.entry.context, isBack, newEntry.entry.bindingContext);
        }

        page._enableLoadedEvents = true;

        // Add page to frame if showing modal page.
        if (modalParent) {
            modalParent.frame._addView(page);
        }

        if (frame) {
            if (!page.parent) {
                if (!frame._currentEntry) {
                    frame._currentEntry = newEntry;
                } else {
                    frame._navigateToEntry = newEntry;
                }

                frame._addView(page);
                frame.remeasureFrame();
            } else if (page.parent !== frame) {
                throw new Error("Page is already shown on another frame.");
            }

            page.actionBar.update();
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        page._viewWillDisappear = false;

        // Pages in backstack are unloaded so raise loaded here.
        if (!page.isLoaded) {
            page.onLoaded();
        }

        page._enableLoadedEvents = false;
    }

    public viewDidAppear(animated: boolean): void {
        super.viewDidAppear(animated);
        this.shown = true;
        let page = this._owner.get();
        if (traceEnabled()) {
            traceWrite(page + " viewDidAppear", traceCategories.Navigation);
        }
        if (!page) {
            return;
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        page._viewWillDisappear = false;

        let frame = this.navigationController ? (<any>this.navigationController).owner : null;
        // Skip navigation events if modal page is shown.
        if (!page._presentedViewController && frame) {
            let newEntry = this[ENTRY];
            let isBack = isBackNavigationTo(page, newEntry);
            // We are on the current page which happens when navigation is canceled so isBack should be false.
            if (frame.currentPage === page && frame._navigationQueue.length === 0) {
                isBack = false;
            }

            frame._navigateToEntry = null;
            frame._currentEntry = newEntry;
            frame.remeasureFrame();
            frame._updateActionBar(page);

            page.onNavigatedTo(isBack);

            // If page was shown with custom animation - we need to set the navigationController.delegate to the animatedDelegate.
            frame.ios.controller.delegate = this[DELEGATE];

            // Workaround for disabled backswipe on second custom native transition
            if (frame.canGoBack()) {
                this.navigationController.interactivePopGestureRecognizer.delegate = this.navigationController;
                this.navigationController.interactivePopGestureRecognizer.enabled = page.enableSwipeBackNavigation;
            } else {
                this.navigationController.interactivePopGestureRecognizer.enabled = false;
            }

            frame._processNavigationQueue(page);
        }

        if (!this.presentedViewController) {
            // clear presented viewController here only if no presented controller.
            // this is needed because in iOS9 the order of events could be - willAppear, willDisappear, didAppear.
            // If we clean it when we have viewController then once presented VC is dismissed then
            page._presentedViewController = null;
        }
    };

    public viewWillDisappear(animated: boolean): void {
        super.viewWillDisappear(animated);

        let page = this._owner.get();
        if (traceEnabled()) {
            traceWrite(page + " viewWillDisappear", traceCategories.Navigation);
        }
        if (!page) {
            return;
        }

        // Cache presentedViewController if any. We don't want to raise
        // navigation events in case of presenting view controller.
        if (!page._presentedViewController) {
            page._presentedViewController = this.presentedViewController;
        }

        const frame = page.frame;
        // Skip navigation events if we are hiding because we are about to show modal page.
        if (!page._presentedViewController && frame && frame.currentPage === page) {
            let isBack = isBackNavigationFrom(this, page);
            page.onNavigatingFrom(isBack);
        }

        //https://github.com/NativeScript/NativeScript/issues/1201
        page._viewWillDisappear = true;
    }

    public viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);

        const page = this._owner.get();
        if (traceEnabled()) {
            traceWrite(page + " viewDidDisappear", traceCategories.Navigation);
        }
        // Exit if no page or page is hiding because it shows another page modally.
        if (!page || page.modal || page._presentedViewController) {
            return;
        }

        const modalParent = page._modalParent;
        page._modalParent = undefined;
        page._UIModalPresentationFormSheet = false;

        // Clear up after modal page has closed.
        if (modalParent) {
            modalParent.frame._removeView(page);
            modalParent._modal = undefined;
        }

        // Manually pop backStack when Back button is pressed or navigating back with edge swipe.
        // Don't pop if we are hiding modally shown page.
        let frame = page.frame;
        // We are not modal page, have frame with backstack and navigation queue is empty and currentPage is closed
        // then pop our backstack.
        if (!modalParent && frame && frame.backStack.length > 0 && frame.navigationQueueIsEmpty() && frame.currentPage === page) {
            (<any>frame)._backStack.pop();
        }

        page._enableLoadedEvents = true;

        // Remove from parent if page was in frame and we navigated back.
        // Showing page modally will not pass isBack check so currentPage won't be removed from Frame.
        let isBack = isBackNavigationFrom(this, page);
        if (isBack) {
            // Remove parent when navigating back.
            frame._removeView(page);
        }

        // Forward navigation does not remove page from frame so we raise unloaded manually.
        if (page.isLoaded) {
            page.onUnloaded();
        }

        page._enableLoadedEvents = false;

        if (!modalParent) {
            // Last raise onNavigatedFrom event if we are not modally shown.
            page.onNavigatedFrom(isBack);
        }
    }
}

export class Page extends PageBase {
    nativeViewProtected: UIView;

    private _ios: UIViewControllerImpl;
    public _enableLoadedEvents: boolean;
    public _modalParent: Page;
    public _UIModalPresentationFormSheet: boolean;
    public _viewWillDisappear: boolean;
    public _presentedViewController: UIViewController; // used when our page present native viewController without going through our abstraction.

    constructor() {
        super();
        this._ios = UIViewControllerImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected = this._ios.view;
        this.nativeViewProtected.backgroundColor = new Color("white").ios;
    }

    public requestLayout(): void {
        super.requestLayout();
        if ((!this.parent || this._modalParent) && this.ios && this.nativeViewProtected) {
            this.nativeViewProtected.setNeedsLayout();
        }
    }

    public _onContentChanged(oldView: View, newView: View) {
        super._onContentChanged(oldView, newView);
        this._removeNativeView(oldView);
        this._addNativeView(newView);
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

    private _addNativeView(view: View) {
        if (view) {
            if (traceEnabled()) {
                traceWrite("Native: Adding " + view + " to " + this, traceCategories.ViewHierarchy);
            }
            if (view.ios instanceof UIView) {
                this._ios.view.addSubview(view.ios);
            } else if (view.ios instanceof UIViewController) {
                this._ios.addChildViewController(view.ios);
                this._ios.view.addSubview(view.ios.view);
            }
        }
    }

    private _removeNativeView(view: View) {
        if (view) {
            if (traceEnabled()) {
                traceWrite("Native: Removing " + view + " from " + this, traceCategories.ViewHierarchy);
            }
            if (view.ios instanceof UIView) {
                (<UIView>view.ios).removeFromSuperview();
            } else if (view.ios instanceof UIViewController) {
                (<UIViewController>view.ios).removeFromParentViewController();
                (<UIViewController>view.ios).view.removeFromSuperview();
            }
        }
    }

    get ios(): UIViewController {
        return this._ios;
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        super._showNativeModalView(parent, context, closeCallback, fullscreen);
        this._modalParent = parent;

        if (!parent.ios.view.window) {
            throw new Error("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!");
        }

        if (fullscreen) {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
        }
        else {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
            this._UIModalPresentationFormSheet = true;
        }

        super._raiseShowingModallyEvent();

        parent.ios.presentViewControllerAnimatedCompletion(this._ios, true, null);
        let transitionCoordinator = getter(parent.ios, parent.ios.transitionCoordinator);
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion.call(transitionCoordinator, null, () => this._raiseShownModallyEvent());
        }
        else {
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
            let navigationController = frame.ios.controller;
            let navigationBar = navigationController.navigationBar;

            navigationBar.barStyle = value === "dark" ? 1 : 0;
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

    public _updateEffectiveLayoutValues(parent: View): void {
        super._updateEffectiveLayoutValues(parent);

        // Patch vertical margins to respect status bar height
        if (!this.backgroundSpanUnderStatusBar) {
            const style = this.style;

            let parentHeightMeasureSpec = parent._currentHeightMeasureSpec;
            let parentHeightMeasureSize = layout.getMeasureSpecSize(parentHeightMeasureSpec) - uiUtils.ios.getStatusBarHeight();
            let parentHeightMeasureMode = layout.getMeasureSpecMode(parentHeightMeasureSpec);
            let parentAvailableHeight = parentHeightMeasureMode === layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;

            this.effectiveMarginTop = PercentLength.toDevicePixels(style.marginTop, 0, parentAvailableHeight);
            this.effectiveMarginBottom = PercentLength.toDevicePixels(style.marginBottom, 0, parentAvailableHeight);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        let width = layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        let height = layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let actionBarWidth: number = 0;
        let actionBarHeight: number = 0;

        // If background span under statusbar reduce available height for page content.
        let statusBarHeight = this.backgroundSpanUnderStatusBar ? uiUtils.ios.getStatusBarHeight() : 0;

        // If this page is inside nested frame - don't substract statusBarHeight again.
        if (this.frame && this.frame.parent) {
            statusBarHeight = 0;
        }

        // Phones does not support fullScreen=false for modal pages so we reduce statusbar only when on tablet and not in fullscreen
        if (this._modalParent && this._UIModalPresentationFormSheet && device.deviceType === "Tablet") {
            statusBarHeight = 0;
        }

        if (!this._modalParent && this.frame && this.frame._getNavBarVisible(this)) {
            // Measure ActionBar with the full height.
            let actionBarSize = View.measureChild(this, this.actionBar, widthMeasureSpec, layout.makeMeasureSpec(height, layout.AT_MOST));
            actionBarWidth = actionBarSize.measuredWidth;
            actionBarHeight = actionBarSize.measuredHeight;
        }

        let heightSpec = layout.makeMeasureSpec(height - actionBarHeight - statusBarHeight, heightMode);

        // Measure content with height - navigationBarHeight. Here we could use actionBarSize.measuredHeight probably.
        let result = View.measureChild(this, this.layoutView, widthMeasureSpec, heightSpec);

        let measureWidth = Math.max(actionBarWidth, result.measuredWidth, this.effectiveMinWidth);
        let measureHeight = Math.max(result.measuredHeight + actionBarHeight, this.effectiveMinHeight);

        let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        View.layoutChild(this, this.actionBar, 0, 0, right - left, bottom - top);

        let navigationBarHeight: number = 0;
        if (this.frame && this.frame._getNavBarVisible(this)) {
            navigationBarHeight = this.actionBar.getMeasuredHeight();
        }

        // Navigation bar height should be ignored when it is visible and not translucent
        if (this.frame && this.frame.ios &&
            this.frame.ios.controller.navigationBar &&
            !this.frame.ios.controller.navigationBar.translucent &&
            !this._ios.shown) {
            navigationBarHeight = 0;
        }

        let statusBarHeight = this.backgroundSpanUnderStatusBar ? uiUtils.ios.getStatusBarHeight() : 0;

        // If this page is inside nested frame - don't substract statusBarHeight again.
        if (this.frame && this.frame.parent) {
            statusBarHeight = 0;
        }

        // Phones does not support fullScreen=false for modal pages so we reduce statusbar only when on tablet and not in fullscreen
        if (this._modalParent && this._UIModalPresentationFormSheet && device.deviceType === "Tablet") {
            statusBarHeight = 0;
        }

        View.layoutChild(this, this.layoutView, 0, navigationBarHeight + statusBarHeight, right - left, bottom - top);
    }

    public _addViewToNativeVisualTree(view: View): boolean {
        // ActionBar is handled by the UINavigationController
        if (view === this.actionBar) {
            return true;
        }

        return super._addViewToNativeVisualTree(view);
    }

    public _removeViewFromNativeVisualTree(view: View): void {
        // ActionBar is handled by the UINavigationController
        if (view === this.actionBar) {
            return;
        }

        super._removeViewFromNativeVisualTree(view);
    }

    [actionBarHiddenProperty.getDefault](): boolean {
        return undefined;
    }
    [actionBarHiddenProperty.setNative](value: boolean) {
        this._updateEnableSwipeBackNavigation(value);
        if (this.isLoaded) {
            // Update nav-bar visibility with disabled animations
            this.updateActionBar(true);
        }
    }

    [statusBarStyleProperty.getDefault](): UIBarStyle {
        return UIBarStyle.Default;
    }
    [statusBarStyleProperty.setNative](value: string | UIBarStyle) {
        let frame = this.frame;
        if (frame) {
            let navigationBar = (<UINavigationController>frame.ios.controller).navigationBar;
            if (typeof value === "string") {
                navigationBar.barStyle = value === "dark" ? UIBarStyle.Black : UIBarStyle.Default;
            } else {
                navigationBar.barStyle = value;
            }
        }
    }
}
