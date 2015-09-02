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
var NAV_DEPTH = "_navDepth";

var navDepth = -1;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;
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

        navDepth++;

        var animated = false;
        if (this.currentPage) {
            animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;
        this._navigateToEntry = backstackEntry;

        this._updateActionBar(backstackEntry.resolvedPage);

        if (this._currentEntry && !this._isEntryBackstackVisible(this._currentEntry)) {
            var newControllers = NSMutableArray.alloc().initWithArray(this._ios.controller.viewControllers);
            if (newControllers.count === 0) {
                throw new Error("Wrong controllers count.");
            }

            var newController: UIViewController = backstackEntry.resolvedPage.ios;

            // the code below fixes a phantom animation that appears in this case
            // TODO: investigate why the animation happens at first place before working around it
            newController.navigationItem.hidesBackButton = this.backStack.length === 0;

            // swap the top entry with the new one
            newControllers.removeLastObject();
            newControllers.addObject(newController);

            // replace the controllers instead of pushing directly
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
        }
        else {
            this._ios.controller.pushViewControllerAnimated(viewController, animated);
        }
        
        trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);
    }

    public _goBackCore(backstackEntry: definition.BackstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write("Frame<" + this._domId + ">.popViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);

        var controller = backstackEntry.resolvedPage.ios;
        var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
        this._navigateToEntry = backstackEntry;

        this._updateActionBar(backstackEntry.resolvedPage);
        this._ios.controller.popToViewControllerAnimated(controller, animated);
    }

    public _updateActionBar(page?: pages.Page): void {
        super._updateActionBar(page);

        var page = page || this.currentPage;
        var newValue = this._getNavBarVisible(page);

        this._ios.showNavigationBar = newValue;
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

class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    static new(): UINavigationControllerImpl {
        return new UINavigationControllerImpl();
    }

    private _owner: Frame;

    public initWithOwner(owner: Frame): UINavigationControllerImpl {
        this._owner = owner;
        return this;
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

    public popViewControllerAnimated(animated: boolean): UIViewController {
        // this method is called when the Back button on the NavBar is pressed
        // we are always using the other method - 'popToViewControllerAnimated', so it is safe to call goBack on the Frame here
        this._owner.goBack();

        // skip the base implementation
        return null;
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // In this method we need to layout the new page otherwise page will be shown empty and update after that which is bad UX.
        var currEntry = this._owner._currentEntry;
        if (currEntry) {
            this._owner._removeView(currEntry.resolvedPage);
        }

        var newEntry: definition.BackstackEntry = viewController[ENTRY];
        var newPage = newEntry.resolvedPage;

        this._owner._currentEntry = newEntry;
        this._owner._navigateToEntry = undefined;
        this._owner._addView(newEntry.resolvedPage);
        this._owner._updateActionBar(newEntry.resolvedPage);

        newPage.onNavigatedTo();
        newPage.actionBar.update();
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        var entry: definition.BackstackEntry = viewController[ENTRY];
        this._owner._processNavigationQueue(entry.resolvedPage);
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
        var change = this._showNavigationBar !== value;
        this._showNavigationBar = value;
        this._controller.navigationBarHidden = !value;

        if (change) {
            this._controller.owner.requestLayout();
        }
    }

    public get navBarVisibility(): string {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: string) {
        this._navBarVisibility = value;
    }
}
