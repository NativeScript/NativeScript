import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import viewModule = require("ui/core/view");
import imageSource = require("image-source");
import trace = require("trace");
import utils = require("utils/utils");

declare var exports;
require("utils/module-merge").merge(pageCommon, exports);

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
        trace.write(this._owner + " didRotateFromInterfaceOrientation(" + fromInterfaceOrientation+ ")", trace.categories.ViewHierarchy);
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
        // loaded/unloaded events are handeled in page viewWillAppear/viewDidDisappear
        if (this._enableLoadedEvents) {
            super.onLoaded();
        }
    }
    
    public onUnloaded() {
        // loaded/unloaded events are handeled in page viewWillAppear/viewDidDisappear
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

    public _invalidateOptionsMenu() {
        this.populateMenuItems();
    }

    public populateMenuItems() {
        var items = this.optionsMenu.getItems();

        var navigationItem: UINavigationItem = (<UIViewController>this.ios).navigationItem;
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

        navigationItem.setRightBarButtonItemsAnimated(array, true);
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

    public _updateNavigationBar(hidden: boolean) {
        if (this.ios.navigationController.navigationBarHidden !== hidden) {
            this.ios.navigationController.navigationBarHidden = hidden;
            this.requestLayout();
        }
    }
}

class TapBarItemHandlerImpl extends NSObject {
    static new(): TapBarItemHandlerImpl {
        return <TapBarItemHandlerImpl>super.new();
    }

    private _owner: definition.MenuItem;

    public initWithOwner(owner: definition.MenuItem): TapBarItemHandlerImpl {
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
