import frameCommon = require("./frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import pages = require("ui/page");
import enums = require("ui/enums");
import utils = require("utils/utils");
import view = require("ui/core/view");
import types = require("utils/types");
import uiUtils = require("ui/utils");

global.moduleMerge(frameCommon, exports);

var ENTRY = "_entry";
var NAV_DEPTH = "_navDepth";

var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;

    public _shouldSkipNativePop: boolean = false;
    public _navigateToEntry: definition.BackstackEntry;
    public _widthMeasureSpec: number;
    public _heightMeasureSpec: number;
    public _layoutWidth: number;
    public _layoutheight: number;

    constructor() {
        super();
        this._ios = new iOSFrame(this);
    }

    public onLoaded() {
        super.onLoaded();

        if (this._paramToNavigate) {
            this.navigate(this._paramToNavigate);
            this._paramToNavigate = undefined;
        }
    }

    public navigate(param: any) {
        if (this.isLoaded) {
            super.navigate(param);
        }
        else {
            this._paramToNavigate = param;
        }
    }

    public _navigateCore(backstackEntry: definition.BackstackEntry) {
        var viewController: UIViewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does have an viewController created.");
        }

        navDepth++;

        var animated = false;
        if (this.currentPage) {
            animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;
        this._navigateToEntry = backstackEntry;

        this._updateActionBar(backstackEntry.resolvedPage);

        // First navigation.
        if (!this._currentEntry) {
            this._ios.controller.pushViewControllerAnimated(viewController, animated);
            trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated(newController) depth = " + navDepth, trace.categories.Navigation);
            return;
        }

        // We should clear the entire history.
        if (backstackEntry.entry.clearHistory) {
            viewController.navigationItem.hidesBackButton = true;
            var newControllers = NSMutableArray.alloc().initWithCapacity(1);
            newControllers.addObject(viewController);
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            trace.write("Frame<" + this._domId + ">.setViewControllersAnimated([newController]) depth = " + navDepth, trace.categories.Navigation);
            return;

        }

        // We should hide the current entry from the back stack.
        if (!this._isEntryBackstackVisible(this._currentEntry)) {
            var newControllers = NSMutableArray.alloc().initWithArray(this._ios.controller.viewControllers);
            if (newControllers.count === 0) {
                throw new Error("Wrong controllers count.");
            }

            // the code below fixes a phantom animation that appears on the Back button in this case
            // TODO: investigate why the animation happens at first place before working around it
            viewController.navigationItem.hidesBackButton = this.backStack.length === 0;

            // swap the top entry with the new one
            newControllers.removeLastObject();
            newControllers.addObject(viewController);

            // replace the controllers instead of pushing directly
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            trace.write("Frame<" + this._domId + ">.setViewControllersAnimated([originalControllers - lastController + newController]) depth = " + navDepth, trace.categories.Navigation);
            return;
        }

        // General case.
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
        trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated(newController) depth = " + navDepth, trace.categories.Navigation);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write("Frame<" + this._domId + ">.popViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);

        if (!this._shouldSkipNativePop) {
            var controller = backstackEntry.resolvedPage.ios;
            var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
            this._navigateToEntry = backstackEntry;

            this._updateActionBar(backstackEntry.resolvedPage);
            this._ios.controller.popToViewControllerAnimated(controller, animated);
        }
    }

    public _updateActionBar(page?: pages.Page): void {
        super._updateActionBar(page);

        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
    }

    public _getNavBarVisible(page: pages.Page): boolean {
        switch (this._ios.navBarVisibility) {
            case enums.NavigationBarVisibility.always:
                return true;

            case enums.NavigationBarVisibility.never:
                return false;

            case enums.NavigationBarVisibility.auto:
                let newValue: boolean;
                if (page && types.isDefined(page.actionBarHidden)) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.backStack.length > 0 || (page && page.actionBar && !page.actionBar._isEmpty());
                }

                newValue = !!newValue; // Make sure it is boolean
                return newValue;
        }
    }

    public get ios(): definition.iOSFrame {
        return this._ios;
    }

    get _nativeView(): any {
        return this._ios.controller.view;
    }

    public static get defaultAnimatedNavigation(): boolean {
        return frameCommon.Frame.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        frameCommon.Frame.defaultAnimatedNavigation = value;
    }

    public requestLayout(): void {
        super.requestLayout();
        // Invalidate our Window so that layout is triggered again.
        var window = this._nativeView.window;
        if (window) {
            window.setNeedsLayout();
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        this._widthMeasureSpec = widthMeasureSpec;
        this._heightMeasureSpec = heightMeasureSpec;

        let result = this.measurePage(this.currentPage);
        let widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        let heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public measurePage(page: pages.Page): { measuredWidth: number; measuredHeight: number } {
        
        // If background does not span under statusbar - reduce available height.
        let heightSpec: number = this._heightMeasureSpec;
        if (page && !page.backgroundSpanUnderStatusBar) {
            let height = utils.layout.getMeasureSpecSize(this._heightMeasureSpec);
            let heightMode = utils.layout.getMeasureSpecMode(this._heightMeasureSpec);
            let statusBarHeight = uiUtils.ios.getStatusBarHeight();
            heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, heightMode);
        }

        return view.View.measureChild(this, page, this._widthMeasureSpec, heightSpec);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        this._layoutWidth = right - left;
        this._layoutheight = bottom - top;
        this.layoutPage(this.currentPage);
    }

    public layoutPage(page: pages.Page): void {
        // If background does not span under statusbar - reduce available height and adjust top offset.
        let statusBarHeight = (page && !page.backgroundSpanUnderStatusBar) ? uiUtils.ios.getStatusBarHeight() : 0;

        view.View.layoutChild(this, page, 0, statusBarHeight, this._layoutWidth, this._layoutheight);
    }

    public get navigationBarHeight(): number {
        var navigationBar = this._ios.controller.navigationBar;
        return (navigationBar && !this._ios.controller.navigationBarHidden) ? navigationBar.frame.size.height : 0;
    }
}

class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<Frame>;

    public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
        var controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
        controller._owner = owner;
        return controller;
    }

    get owner(): Frame {
        return this._owner.get();
    }

    public viewDidLoad(): void {
        let owner = this._owner.get();
        if (owner) {
            owner.onLoaded();
    }
    }

    public viewDidLayoutSubviews(): void {
        let owner = this._owner.get();
        if (owner) {
            trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + owner.isLoaded, trace.categories.ViewHierarchy);
            owner._updateLayout();
    }
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let newEntry: definition.BackstackEntry = viewController[ENTRY];
        let newPage = newEntry.resolvedPage;
        if (!newPage.parent) {
            if (!frame._currentEntry) {
                // First navigation
                frame._currentEntry = newEntry;
            }
            else {
                frame._navigateToEntry = newEntry;
            }

            frame._addView(newPage);
            frame.measurePage(newPage);
            frame.layoutPage(newPage)
        }
        else if (newPage.parent !== frame) {
            throw new Error("Page is already shown on another frame.");
        }

        newPage.actionBar.update();
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        let frame = this._owner.get();
        if (!frame) {
            return;
        }

        let backStack = frame.backStack;
        let currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;
        let newEntry: definition.BackstackEntry = viewController[ENTRY];

        // This code check if navigation happened through UI (e.g. back button or swipe gesture).
        // When calling goBack on frame isBack will be false.
        let isBack: boolean = currentEntry && newEntry === currentEntry;
        if (isBack) {
            try {
                frame._shouldSkipNativePop = true;
                frame.goBack();
            }
            finally {
                frame._shouldSkipNativePop = false;
            }
        }

        let page = frame.currentPage;
        if (page && !navigationController.viewControllers.containsObject(page.ios)) {
            frame._removeView(page);
        }

        frame._navigateToEntry = null;
        frame._currentEntry = newEntry;

        let newPage = newEntry.resolvedPage;

        // In iOS we intentionally delay the raising of the 'loaded' event so both platforms behave identically.
        // The loaded event must be raised AFTER the page is part of the windows hierarchy and 
        // frame.topmost().currentPage is set to the page instance.
        // https://github.com/NativeScript/NativeScript/issues/779
        (<any>newPage)._delayLoadedEvent = false;
        newPage._emit(view.View.loadedEvent);

        frame._updateActionBar(newPage);

        // notify the page
        newPage.onNavigatedTo();
        frame._processNavigationQueue(newPage);
    }

    public supportedInterfaceOrientation(): number {
        return UIInterfaceOrientationMask.UIInterfaceOrientationMaskAll;
    }
}

/* tslint:disable */
class iOSFrame implements definition.iOSFrame {
    /* tslint:enable */
    private _controller: UINavigationControllerImpl;
    private _showNavigationBar: boolean;
    private _navBarVisibility: string;

    constructor(owner: Frame) {
        this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(owner));
        this._controller.delegate = this._controller;
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        //this.showNavigationBar = false;
        this._navBarVisibility = enums.NavigationBarVisibility.auto;
    }

    public get controller() {
        return this._controller;
    }

    public get showNavigationBar(): boolean {
        return this._showNavigationBar;
    }
    public set showNavigationBar(value: boolean) {
        var change = this._showNavigationBar !== value;
        this._showNavigationBar = value;
        this._controller.navigationBarHidden = !value;

        let owner = this._controller.owner;
        if (owner && change) {
            owner.requestLayout();
        }
    }

    public get navBarVisibility(): string {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: string) {
        this._navBarVisibility = value;
    }
}
