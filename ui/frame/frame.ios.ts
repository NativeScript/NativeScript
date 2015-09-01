import frameCommon = require("ui/frame/frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import pages = require("ui/page");
import enums = require("ui/enums");
import utils = require("utils/utils");
import view = require("ui/core/view");
import types = require("utils/types");

global.moduleMerge(frameCommon, exports);

var ENTRY = "_entry";
var PREV_ENTRY = "_prevEntry";
var NAV_DEPTH = "_navDepth";

var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;
    public _navigateToEntry: definition.BackstackEntry;
    public _goBackScheduled: boolean;

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

        navDepth++;

        var animated = false;
        if (this.currentPage) {
            animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;
        this._navigateToEntry = backstackEntry;
        
        trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);

        this._updateActionBar(backstackEntry.resolvedPage);
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write("Frame<" + this._domId + ">.popViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);

        var controller = backstackEntry.resolvedPage.ios;
        var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        this._navigateToEntry = backstackEntry;
        //this._updateActionBar(backstackEntry.resolvedPage);
        this._ios.controller.popToViewControllerAnimated(controller, animated);
    }

    public _updateActionBar(page?: pages.Page): void {
        super._updateActionBar(page);

        var previousValue = !!this._ios.showNavigationBar;
        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
        if (previousValue !== newValue) {
            this.requestLayout();
        }
    }

    public _getNavBarVisible(page: pages.Page) {
        if (!page) {
            return false;
        }

        var newValue = false;

        switch (this._ios.navBarVisibility) {
            case enums.NavigationBarVisibility.always:
                newValue = true;
                break;

            case enums.NavigationBarVisibility.never:
                newValue = false;
                break;

            case enums.NavigationBarVisibility.auto:
                if (page && types.isDefined(page.actionBarHidden)) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.backStack.length > 0 || (page && !page.actionBar._isEmpty());
                }
                newValue = !!newValue; // Make sure it is boolean
                break;
        }

        return !!newValue;
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

class UINavigationBarImpl extends UINavigationBar {
    public static ObjCProtocols = [UINavigationBarDelegate];

    static new(): UINavigationBarImpl {
        return <UINavigationBarImpl>super.new();
    }

    private _originalDelegate: UINavigationBarDelegate;

    get controller(): UINavigationControllerImpl {
        return <UINavigationControllerImpl>this._originalDelegate;
    }

    get ownerFrame(): Frame {
        return this.controller.owner;
    }

    get delegate() {
        return this;
    }
    set delegate(value: UINavigationBarDelegate) {
        this._originalDelegate = value;
        (<any>this).super.delegate = this;
    }

    public setItemsAnimated(items: NSArray, animated: boolean) {
        if (items) {
            trace.write("updating navigation bar items stack; original items count: " + items.count, trace.categories.Navigation);

            items = this.controller._getNavBarItems();

            trace.write("updated navigation bar items stack; new items count: " + items.count, trace.categories.Navigation);
        }

        super.setItemsAnimated(items, animated);
    }

    public navigationBarShouldPopItem(navBar: UINavigationBar, item: UINavigationItem): boolean {
        // should pop will be called only when the NavigationBar is visible and in the following cases:
        // 1. The user has pressed the back button - we need to manually call 'goBack' on the Frame
        // 2. The user has programmatically called goBack on the Frame - in this case the '_popScheduled' flag is set to true
        if (!this.controller._popScheduled) {
            this.ownerFrame.goBack();
        }
        return true;
    }

    public navigationBarShouldPushItem(navBar: UINavigationBar, item: UINavigationItem): boolean {
        var entry = this.ownerFrame._navigateToEntry || this.ownerFrame._currentEntry;
        if (!entry) {
            return true;
        }

        var prevEntry: definition.BackstackEntry = entry[PREV_ENTRY];
        if (!prevEntry) {
            return true;
        }

        return this.ownerFrame._isEntryBackstackVisible(prevEntry);
    }

    //private _callBaseDelegateMethod() {
    //    //var controller = UINavigationController.alloc().init();
    //    //var methodSignature = controller.methodSignatureForSelector("navigationBar:shouldPopItem:");
    //    //if (methodSignature != null) {
    //    //    var invocation = NSInvocation.invocationWithMethodSignature(methodSignature);
    //    //    invocation.target = controller;
    //    //    invocation.selector = "navigationBar:shouldPopItem:";

    //    //    invocation.setArgumentAtIndex(new interop.Reference(UINavigationBar, UINavigationBar.alloc().init()), 2);
    //    //    invocation.setArgumentAtIndex(new interop.Reference(UINavigationItem, UINavigationItem.alloc().init()), 3);

    //    //    invocation.invoke();

    //    //    var result = new interop.Reference(interop.types.bool, false);
    //    //    invocation.getReturnValue(result);

    //    //    console.log(result.value);
    //    //}
    //}
}

class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    static new(): UINavigationControllerImpl {
        return new UINavigationControllerImpl(UINavigationBarImpl.class(), null);
    }

    private _owner: Frame;
    public _popScheduled;

    public initWithOwner(owner: Frame): UINavigationControllerImpl {
        this._owner = owner;
        return this;
    }

    public _getNavBarItems(): NSArray {
        var frame = this._owner;
        var backstack = frame.backStack;
        var length = backstack.length;
        var entry: definition.BackstackEntry;

        var navItems = NSMutableArray.alloc().init();
        for (let i = 0; i < length; i++) {
            entry = backstack[i];
            var controller: UIViewController = entry.resolvedPage.ios;
            navItems.addObject(controller.navigationItem);
        }

        // add the top controller
        entry = frame._navigateToEntry || frame._currentEntry;
        if (entry) {
            var topController = entry.resolvedPage.ios;
            if (topController) {
                navItems.addObject(topController.navigationItem);
            }
        }

        return navItems;
    }

    get owner(): Frame {
        return this._owner;
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

    public popToViewControllerAnimated(controller: UIViewController, animated: boolean): NSArray {
        // our _goBackCore routine uses popToViewController, hence it is granted this method is called through the navbar back button click
        this._popScheduled = true;
        return super.popToViewControllerAnimated(controller, animated);
    }

    navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        //// In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        //var frame = this._owner;
        //var newEntry: definition.BackstackEntry = viewController[ENTRY];
        //var newPage = newEntry.resolvedPage;
        //if (!newPage.parent) {
        //    if (!frame._currentEntry) {
        //        // First navigation
        //        frame._currentEntry = newEntry;
        //    }
        //    else {
        //        frame._navigateToEntry = newEntry;
        //    }

        //    frame._addView(newPage);
        //}
        //else if (newPage.parent !== frame) {
        //    throw new Error("Page is already shown on another frame.");
        //}

        //newPage.actionBar.update();
        var currEntry = this._owner._currentEntry;
        if (currEntry) {
            this._owner._removeView(currEntry.resolvedPage);
            //delete currEntry[PREV_ENTRY];
        }

        var newEntry: definition.BackstackEntry = viewController[ENTRY];
        var newPage = newEntry.resolvedPage;

        newEntry[PREV_ENTRY] = currEntry;
        this._owner._currentEntry = newEntry;
        this._owner._navigateToEntry = undefined;
        this._owner._addView(newEntry.resolvedPage);
        this._owner._updateActionBar(newEntry.resolvedPage);

        newPage.onNavigatedTo();
        newPage.actionBar.update();
    }

    navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        this._popScheduled = false;
        var entry: definition.BackstackEntry = viewController[ENTRY];
        this._owner._processNavigationQueue(entry.resolvedPage);

        //var frame: Frame = this._owner;
        //var backStack = frame.backStack;
        //var currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;
        //var newEntry: definition.BackstackEntry = viewController[ENTRY];

        //// This code check if navigation happened through UI (e.g. back button or swipe gesture).
        //// When calling goBack on frame isBack will be false.
        //var isBack: boolean = currentEntry && newEntry === currentEntry;
        //if (isBack) {
        //    try {
        //        frame._shouldSkipNativePop = true;
        //        frame.goBack();
        //    }
        //    finally {
        //        frame._shouldSkipNativePop = false;
        //    }
        //}

        //var page = frame.currentPage;
        //if (page && !navigationController.viewControllers.containsObject(page.ios)) {
        //    frame._removeView(page);
        //}

        //frame._navigateToEntry = null;
        //frame._currentEntry = newEntry;
        //frame.updateNavigationBar();

        //frame.ios.controller.navigationBar.backIndicatorImage

        //var newPage = newEntry.resolvedPage;

        //// notify the page
        //newPage.onNavigatedTo();
        //frame._processNavigationQueue(newPage);
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
