import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import {View} from "ui/core/view";
import trace = require("trace");
import uiUtils = require("ui/utils");
import utils = require("utils/utils");

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
        if (this._owner._isModal) {
            var parentBounds = (<any>this._owner)._UIModalPresentationFormSheet ? (<UIView>this._owner._nativeView).superview.bounds : UIScreen.mainScreen().bounds;
            uiUtils.ios._layoutRootView(this._owner, parentBounds);
        }
    }

    public viewDidLoad() {
        trace.write(this._owner + " viewDidLoad", trace.categories.ViewHierarchy);
        this.view.autoresizesSubviews = false;
        this.view.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
    }

    public viewDidLayoutSubviews() {
        trace.write(this._owner + " viewDidLayoutSubviews, isLoaded = " + this._owner.isLoaded, trace.categories.ViewHierarchy);
        if (this._owner._isModal) {
            var parentBounds = (<any>this._owner)._UIModalPresentationFormSheet ? this._owner._nativeView.superview.bounds : UIScreen.mainScreen().bounds;
            uiUtils.ios._layoutRootView(this._owner, parentBounds);
        }
        else {
            this._owner._updateLayout();
        }
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
    public _isModal: boolean = false;

    constructor(options?: definition.Options) {
        super(options);
        this._ios = UIViewControllerImpl.new().initWithOwner(this);
    }

    public requestLayout(): void {
        super.requestLayout();
        if (!this.parent && this.ios && this._nativeView) {
            this._nativeView.setNeedsLayout();
        }
    }

    public _onContentChanged(oldView: View, newView: View) {
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

    private _addNativeView(view: View) {
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

    private _removeNativeView(view: View) {
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

    get _nativeView(): UIView {
        return this.ios.view;
    }

    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        this._isModal = true;

        if (!parent.ios.view.window) {
            throw new Error("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!");
        }

        if (fullscreen) {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationFullScreen;
            uiUtils.ios._layoutRootView(this, UIScreen.mainScreen().bounds);
        }
        else {
            this._ios.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationFormSheet;
            (<any>this)._UIModalPresentationFormSheet = true;
        }

        var that = this;
        parent.ios.presentViewControllerAnimatedCompletion(this._ios, false, function completion() {
            if (!fullscreen) {
                // We can measure and layout the modal page after we know its parent's dimensions.
                uiUtils.ios._layoutRootView(that, that._nativeView.superview.bounds);
            }

            that._raiseShownModallyEvent(parent, context, closeCallback);
        });
    }

    protected _hideNativeModalView(parent: Page) {
        parent._ios.dismissModalViewControllerAnimated(false);
        this._isModal = false;
        (<any>this)._UIModalPresentationFormSheet = false;
    }

    public _updateActionBar(hidden: boolean) {
        var frame = this.frame;
        if (frame) {
            frame._updateActionBar(this);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        let navigationBarHeight = this.frame ? this.frame.navigationBarHeight : 0;
        let heightSpec = utils.layout.makeMeasureSpec(height - navigationBarHeight, heightMode);

        // Measure ActionBar with the full height. 
        let actionBarSize = View.measureChild(this, this.actionBar, widthMeasureSpec, heightMeasureSpec);

        // Measure content with height - navigationBarHeight. Here we could use actionBarSize.measuredHeight probably.
        let result = View.measureChild(this, this.content, widthMeasureSpec, heightSpec);

        let measureWidth = Math.max(actionBarSize.measuredWidth, result.measuredWidth, this.minWidth);
        let measureHeight = Math.max(result.measuredHeight + actionBarSize.measuredHeight, this.minHeight);

        let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        View.layoutChild(this, this.actionBar, 0, 0, right - left, bottom - top);

        let navigationBarHeight = this.frame ? this.frame.navigationBarHeight : 0;
        View.layoutChild(this, this.content, 0, navigationBarHeight, right - left, bottom - top);
    }

    public _addViewToNativeVisualTree(view: View): boolean {
        // ActionBar is added to the native visual tree by default
        if (view === this.actionBar) {
            return true;
        }

        return super._addViewToNativeVisualTree(view);
    }
}
