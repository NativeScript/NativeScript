import frameCommon = require("ui/frame/frame-common");
import definition = require("ui/frame");
import trace = require("trace");

declare var exports;
require("utils/module-merge").merge(frameCommon, exports);

var ENTRY = "_entry";

var navDepth = 0;

export class Frame extends frameCommon.Frame {
    private _ios: iOSFrame;
    private _paramToNavigate: any;

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

        if (this.backStack.length > 0) {
            this._ios.showNavigationBar = true;
        }

        viewController[ENTRY] = backstackEntry;

        navDepth++;
        trace.write("Frame<" + this._domId + ">.pushViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
    }

    public _goBackCore(entry: definition.NavigationEntry) {
        navDepth--;
        trace.write("Frame<" + this._domId + ">.popViewControllerAnimated depth = " + navDepth, trace.categories.Navigation);

        this._ios.controller.allowPop = true;
        this._ios.controller.popViewControllerAnimated(this._getIsAnimatedNavigation(entry));
        this._ios.controller.allowPop = false;

        if (this.backStack.length === 0) {
            this._ios.showNavigationBar = false;
        }
    }

    public get ios(): any {
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
}

/* tslint:disable */
class UINavigationControllerImpl extends UINavigationController implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    static new(): UINavigationControllerImpl {
        return <UINavigationControllerImpl>super.new();
    }

    private _owner: frameCommon.Frame;
    
    public initWithOwner(owner: frameCommon.Frame): UINavigationControllerImpl {
        this._owner = owner;
        return this;
    }

    private _allowPop: boolean;
    public get allowPop(): boolean {
        return this._allowPop;
    }
    public set allowPop(value: boolean) {
        this._allowPop = value;
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
        if (this.allowPop) {
            return super.popViewControllerAnimated(animated);
        }
        else {
            var currentControler = this._owner.currentPage.ios;
            this._owner.goBack();
            return currentControler;
        }
    }

    public navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        var frame = this._owner;
        var page = frame.currentPage;
        if (page) {
            frame._removeView(page);
        }

        var newEntry: definition.BackstackEntry = viewController[ENTRY];
        var newPage = newEntry.resolvedPage;

        frame._currentEntry = newEntry;
        frame._addView(newPage);

        // notify the page
        newPage.onNavigatedTo(newEntry.entry.context);
    }

    public navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        var frame: frameCommon.Frame = this._owner;
        var newEntry: definition.BackstackEntry = viewController[ENTRY];
        var newPage = newEntry.resolvedPage;

        frame._processNavigationQueue(newPage);
    }

    public supportedInterfaceOrientation(): number {
        return UIInterfaceOrientationMask.UIInterfaceOrientationMaskAll;
    }
}

class iOSFrame implements definition.iOSFrame {
    /* tslint:enable */
    private _controller: UINavigationControllerImpl;
    private _showNavigationBar: boolean;

    constructor(owner: frameCommon.Frame) {
        this._controller = UINavigationControllerImpl.new().initWithOwner(owner);
        this._controller.delegate = this._controller;
        this._controller.automaticallyAdjustsScrollViewInsets = false;
        this.showNavigationBar = false;
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
} 