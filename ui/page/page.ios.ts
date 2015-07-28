import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import viewModule = require("ui/core/view");
import trace = require("trace");
import utils = require("utils/utils");
import types = require("utils/types");

global.moduleMerge(pageCommon, exports);

class UIViewControllerImpl extends UIViewController {
    static new(): UIViewControllerImpl {
        return <UIViewControllerImpl>super.new();
    }

    private _owner: Page;

    public initWithOwner(owner: Page): UIViewControllerImpl {
        this._owner = owner;
        this.automaticallyAdjustsScrollViewInsets = false;
        return this;
    }

    public didRotateFromInterfaceOrientation(fromInterfaceOrientation: number) {
        trace.write(this._owner + " didRotateFromInterfaceOrientation(" + fromInterfaceOrientation + ")", trace.categories.ViewHierarchy);
        if ((<any>this._owner)._isModal) {
            var parentBounds = (<any>this._owner)._UIModalPresentationFormSheet ? (<UIView>this._owner._nativeView).superview.bounds : UIScreen.mainScreen().bounds;
            utils.ios._layoutRootView(this._owner, parentBounds);
        }
    }

    public viewDidLoad() {
        trace.write(this._owner + " viewDidLoad", trace.categories.ViewHierarchy);
        this.view.autoresizesSubviews = false;
        this.view.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
    }

    public viewDidLayoutSubviews() {
        trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + this._owner.isLoaded, trace.categories.ViewHierarchy);
        this._owner._updateLayout();
    }

    public viewWillAppear() {
        trace.write(this._owner + " viewWillAppear", trace.categories.Navigation);
        this._owner._enableLoadedEvents = true;
        this._owner.onLoaded();
        this._owner._enableLoadedEvents = false;
    }

    public viewDidDisappear() {
        trace.write(this._owner + " viewDidDisappear", trace.categories.Navigation);
        this._owner._enableLoadedEvents = true;
        this._owner.onUnloaded();
        this._owner._enableLoadedEvents = false;
    }
}

export class Page extends pageCommon.Page {
    private _ios: UIViewController;
    public _enableLoadedEvents: boolean;

    constructor(options?: definition.Options) {
        super(options);
        this._ios = UIViewControllerImpl.new().initWithOwner(this);
    }

    public _onContentChanged(oldView: viewModule.View, newView: viewModule.View) {
        super._onContentChanged(oldView, newView);
        this._removeNativeView(oldView);
        this._addNativeView(newView);
    }

    public onLoaded() {
        // loaded/unloaded events are handled in page viewWillAppear/viewDidDisappear
        if (this._enableLoadedEvents) {
            super.onLoaded();
        }
    }

    public onUnloaded() {
        // loaded/unloaded events are handled in page viewWillAppear/viewDidDisappear
        if (this._enableLoadedEvents) {
            super.onUnloaded();
        }
    }

    private _addNativeView(view: viewModule.View) {
        if (view) {
            trace.write("Native: Adding " + view + " to " + this, trace.categories.ViewHierarchy);
            if (view.ios instanceof UIView) {
                this._ios.view.addSubview(view.ios);
            } else if (view.ios instanceof UIViewController) {
                this._ios.addChildViewController(view.ios);
                this._ios.view.addSubview(view.ios.view);
            }
        }
    }

    private _removeNativeView(view: viewModule.View) {
        if (view) {
            trace.write("Native: Removing " + view + " from " + this, trace.categories.ViewHierarchy);
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

    get _nativeView(): any {
        return this.ios.view;
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        (<any>this)._isModal = true;

        if (!parent.ios.view.window) {
            throw new Error("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!");
        }

        if (fullscreen) {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationFullScreen;
            utils.ios._layoutRootView(this, UIScreen.mainScreen().bounds);
        }
        else {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationFormSheet;
            (<any>this)._UIModalPresentationFormSheet = true;
        }

        var that = this;
        parent.ios.presentViewControllerAnimatedCompletion(this._ios, false, function completion() {
            if (!fullscreen) {
                // We can measure and layout the modal page after we know its parent's dimensions.
                utils.ios._layoutRootView(that, that._nativeView.superview.bounds);
            }

            that._raiseShownModallyEvent(parent, context, closeCallback);
        });
    }

    protected _hideNativeModalView(parent: Page) {
        parent._ios.dismissModalViewControllerAnimated(false);
        (<any>this)._isModal = false;
        (<any>this)._UIModalPresentationFormSheet = false;
    }

    public _updateActionBar(hidden: boolean) {
        if (types.isDefined(hidden) && this.ios.navigationController.navigationBarHidden !== hidden) {
            this.ios.navigationController.navigationBarHidden = hidden;
            this.requestLayout();
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        viewModule.View.measureChild(this, this.actionBar, widthMeasureSpec, heightMeasureSpec);
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        viewModule.View.layoutChild(this, this.actionBar, 0, 0, right - left, bottom - top);
        super.onLayout(left, top, right, bottom);
    }
}
