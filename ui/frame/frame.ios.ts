import frameCommon = require("ui/frame/frame-common");
import definition = require("ui/frame");
import trace = require("trace");
import imageSource = require("image-source");
import pages = require("ui/page");
import enums = require("ui/enums");

declare var exports;
require("utils/module-merge").merge(frameCommon, exports);

var ENTRY = "_entry";

var navDepth = 0;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;
    public shouldSkipNativePop: boolean = false;

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
        if (!this.shouldSkipNativePop) {
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

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        // We don't call super here because we set frame on our first subview.
        // This is done because when rotated in iOS7 there is rotation applied on the first subview on the Window which is our frame.nativeView.view.
        // If we set it it should be transformed so it is correct. 

        var frame = CGRectMake(left, top, right - left, bottom - top);
        var nativeView: UIView;

        // When in landscape in iOS 7 there is transformation on the first subview of the window so we set frame to its subview.
        // in iOS 8 we set frame to subview again otherwise we get clipped.
        if (!this.parent && this._nativeView.subviews.count > 0) {
            nativeView = (<UIView>this._nativeView.subviews[0]);
        }
        else {
            nativeView = this._nativeView;
        }

        if (!CGRectEqualToRect(nativeView.frame, frame)) {
            trace.write(this + ", Native setFrame: " + NSStringFromCGRect(frame), trace.categories.Layout);
            nativeView.frame = frame;
        }
    }

    protected get navigationBarHeight(): number {
        var navigationBar = this._ios.controller.navigationBar;
        return (navigationBar && !this._ios.controller.navigationBarHidden) ? navigationBar.frame.size.height : 0;
    }

    public _invalidateOptionsMenu() {
        this.populateMenuItems(this.currentPage);
    }

    populateMenuItems(page: pages.Page) {
        var items = page.optionsMenu.getItems();

        var navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
        var array: NSMutableArray = items.length > 0 ? NSMutableArray.new() : null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var tapHandler = TapBarItemHandlerImpl.new().initWithOwner(item);
            // associate handler with menuItem or it will get collected by JSC.
            (<any>item).handler = tapHandler;

            var barButtonItem: UIBarButtonItem;
            if (item.icon) {
                var img = imageSource.fromResource(item.icon);
                barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(img.ios, UIBarButtonItemStyle.UIBarButtonItemStylePlain, tapHandler, "tap");
            }
            else {
                barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text, UIBarButtonItemStyle.UIBarButtonItemStylePlain, tapHandler, "tap");
            }

            array.addObject(barButtonItem);
        }

        if (array) {
            navigationItem.setRightBarButtonItemsAnimated(array, true);
        }
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

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {

        var frame: Frame = this._owner;
        var backStack = frame.backStack;
        var currentEntry = backStack.length > 0 ? backStack[backStack.length - 1] : null;
        var newEntry: definition.BackstackEntry = viewController[ENTRY];

        if (newEntry === currentEntry && currentEntry) {
            try {
                frame.shouldSkipNativePop = true;
                frame.goBack();
            }
            finally {
                frame.shouldSkipNativePop = false;
            }
        }

        var page = frame.currentPage;
        if (page) {
            frame._removeView(page);
        }

        var newPage = newEntry.resolvedPage;

        frame._currentEntry = newEntry;
        frame._addView(newPage);
        frame.populateMenuItems(newPage);
        frame.updateNavigationBar();
        
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

class TapBarItemHandlerImpl extends NSObject {
    static new(): TapBarItemHandlerImpl {
        return <TapBarItemHandlerImpl>super.new();
    }

    private _owner: pages.MenuItem;

    public initWithOwner(owner: pages.MenuItem): TapBarItemHandlerImpl {
        this._owner = owner;
        return this;
    }

    public tap(args) {
        this._owner._raiseTap();
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}