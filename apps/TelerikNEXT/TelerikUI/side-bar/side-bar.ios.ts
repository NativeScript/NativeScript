import common = require("./side-bar-common");
import view = require("ui/core/view");
import contentView = require("ui/content-view");
import frame = require("ui/frame");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");

declare var TKSideDrawer: any;

function onMainContentPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SideBar>data.object;
    var newContent = <view.View> data.newValue;

    if (newContent instanceof view.View) {
        bar._mainContentHost.content = newContent;
    }
}
(<proxy.PropertyMetadata>common.SideBar.mainContentProperty.metadata).onSetNativeValue = onMainContentPropertyChanged;

function onSlideContentPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SideBar>data.object;
    var newContent = <view.View> data.newValue;

    if (newContent instanceof view.View) {
        bar._slideContentHost.content = newContent;
    }
}
(<proxy.PropertyMetadata>common.SideBar.slideContentProperty.metadata).onSetNativeValue = onSlideContentPropertyChanged;

class SideBarContent extends contentView.ContentView {
    public _bar: SideBar

    constructor(bar: SideBar) {
        super();

        this._bar = bar;
    }

    public requestLayout() {
        super.requestLayout();

        this._bar.requestLayout();
    }
}

export class SideBar extends common.SideBar {
    public _mainContentHost: contentView.ContentView
    public _slideContentHost: contentView.ContentView

    constructor() {
        super();

        this._mainContentHost = new SideBarContent(this);
        this._slideContentHost = new contentView.ContentView();

        this._ios = TKSideDrawer.alloc().initWithHostview(this._mainContentHost.ios);
        this._ios.content = this._slideContentHost.ios
        this._ios.headerView = null;
        this._ios.footerView = null;
    }

    private _ios: any;
    get ios(): any {
        return this._ios;
    }

    get _nativeView(): UIView {
        return this._ios;
    }

    public openSlideContent(): void {
        this.ios.show();
    }

    public closeSlideContent(): void {
        this.ios.dismiss();
    }

    public onLoaded() {
        this.parent._addView(this._mainContentHost);
        this._addView(this._slideContentHost);

        super.onLoaded();

        this.ios.viewController = frame.topmost().currentPage.ios;
    }
    
    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);

        if (this._mainContentHost instanceof view.View) {
            this._mainContentHost.bindingContext = this.bindingContext;
        }

        if (this._slideContentHost instanceof view.View) {
            this._slideContentHost.bindingContext = this.bindingContext;
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        var width = right - left;
        var height = bottom - top;
        this._slideContentHost.layout(0, 0, this.slideContentWidth, height);
        this._mainContentHost.layout(0, 0, width, height);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        view.View.measureChild(this, this._slideContentHost, utils.layout.makeMeasureSpec(this.slideContentWidth, utils.layout.EXACTLY), heightMeasureSpec);

        var result = view.View.measureChild(this, this._mainContentHost, widthMeasureSpec, heightMeasureSpec);

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var widthAndState = view.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }
}