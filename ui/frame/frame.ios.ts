import frameCommon = require("ui/frame/frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import pages = require("ui/page");
import enums = require("ui/enums");
import utils = require("utils/utils");
import view = require("ui/core/view");

declare var exports;
require("utils/module-merge").merge(frameCommon, exports);

var ENTRY = "_entry";

var navDepth = 0;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;
    public _shouldSkipNativePop: boolean = false;
    public _navigateToEntry: definition.BackstackEntry;

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
        var viewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does have an viewController created.");
        }

        var animated = false;
        if (this.currentPage) {
            animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        }

        this.updateNavigationBar();

        viewController[ENTRY] = backstackEntry;

        navDepth++;
        trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
    }

    public _goBackCore(entry: definition.NavigationEntry) {
        navDepth--;
        trace.write("Frame<" + this._domId + ">.popViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);
        if (!this._shouldSkipNativePop) {
            this._ios.controller.popViewControllerAnimated(this._getIsAnimatedNavigation(entry));
        }
    }

    public updateNavigationBar(page?: pages.Page): void {
        switch (this._ios.navBarVisibility) {
            case enums.NavigationBarVisibility.always:
                this._ios.showNavigationBar = true;
                break;

            case enums.NavigationBarVisibility.never:
                this._ios.showNavigationBar = false;
                break;

            case enums.NavigationBarVisibility.auto:
                var pageInstance: pages.Page = page || this.currentPage;
                this._ios.showNavigationBar = this.backStack.length > 0 || (pageInstance && pageInstance.optionsMenu.getItems().length > 0);
                break;
        }
    }

    public get ios(): iOSFrame {
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

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var result = view.View.measureChild(this, this.currentPage, widthMeasureSpec, utils.layout.makeMeasureSpec(height - this.navigationBarHeight, heightMode));
        if (this._navigateToEntry) {
            view.View.measureChild(this, this._navigateToEntry.resolvedPage, widthMeasureSpec, utils.layout.makeMeasureSpec(height - this.navigationBarHeight, heightMode));
        }

        var widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        view.View.layoutChild(this, this.currentPage, 0, this.navigationBarHeight, right - left, bottom - top);
        if (this._navigateToEntry) {
            view.View.layoutChild(this, this._navigateToEntry.resolvedPage, 0, this.navigationBarHeight, right - left, bottom - top);
        }
    }

    protected get navigationBarHeight(): number {
        var navigationBar = this._ios.controller.navigationBar;
        return (navigationBar && !this._ios.controller.navigationBarHidden) ? navigationBar.frame.size.height : 0;
    }
}

class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    static new(): UINavigationControllerImpl {
        return <UINavigationControllerImpl>super.new();
    }

    private _owner: Frame;

    public initWithOwner(owner: Frame): UINavigationControllerImpl {
        this._owner = owner;
        return this;
    }

    public viewDidLoad(): void {
        this.view.autoresizesSubviews = false;
        this.view.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        this._owner.onLoaded();
    }

    public viewDidLayoutSubviews(): void {
        trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + this._owner.isLoaded, trace.categories.ViewHierarchy);
        this._owner._updateLayout();
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        var frame = this._owner;
        var newEntry: definition.BackstackEntry = viewController[ENTRY];
        var newPage = newEntry.resolvedPage;
        if (!newPage.parent) {
            if (!frame._currentEntry) {
                // First navigation
                frame._currentEntry = newEntry;
            }
            else {
                frame._navigateToEntry = newEntry;
            }

            frame._addView(newPage);
            newPage._invalidateOptionsMenu();
        }
        else if (newPage.parent !== frame) {
            throw new Error("Page is already shown on another frame.");
        }
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {

        var frame: Frame = this._owner;
        var backStack = frame.backStack;
        var currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;
        var newEntry: definition.BackstackEntry = viewController[ENTRY];

        // This code check if navigation happened through UI (e.g. back button or swipe gesture).
        // When calling goBack on frame isBack will be false.
        var isBack: boolean = currentEntry && newEntry === currentEntry;
        if (isBack) {
            try {
                frame._shouldSkipNativePop = true;
                frame.goBack();
            }
            finally {
                frame._shouldSkipNativePop = false;
            }
        }

        var page = frame.currentPage;
        if (page && !navigationController.viewControllers.containsObject(page.ios)) {
            frame._removeView(page);
        }

        frame._navigateToEntry = null;
        frame._currentEntry = newEntry;
        frame.updateNavigationBar();

        var newPage = newEntry.resolvedPage;

        // notify the page
        newPage.onNavigatedTo(newEntry.entry.context);
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
        this._controller = UINavigationControllerImpl.new().initWithOwner(owner);
        this._controller.delegate = this._controller;
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        this.showNavigationBar = false;
        this._navBarVisibility = enums.NavigationBarVisibility.auto;
    }

    public get controller() {
        return this._controller;
    }

    public get showNavigationBar(): boolean {
        return this._showNavigationBar;
    }
    public set showNavigationBar(value: boolean) {
        this._showNavigationBar = value;
        this._controller.navigationBarHidden = !value;
    }

    public get navBarVisibility(): string {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: string) {
        this._navBarVisibility = value;
    }
}
