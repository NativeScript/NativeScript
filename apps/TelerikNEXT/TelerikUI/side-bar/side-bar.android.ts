import common = require("./side-bar-common");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");

declare var com: any;

function onMainContentPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SideBar>data.object;
    var newContent = <view.View> data.newValue;

    if (bar.android && newContent instanceof view.View) {
        bar.android.setMainContent(newContent.android);
    }
}
(<proxy.PropertyMetadata>common.SideBar.mainContentProperty.metadata).onSetNativeValue = onMainContentPropertyChanged;

function onSlideContentPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SideBar>data.object;
    var newContent = <view.View> data.newValue;

    if (bar.android && newContent instanceof view.View) {
        bar.android.setDrawerContent(newContent.android);
    }
}
(<proxy.PropertyMetadata>common.SideBar.slideContentProperty.metadata).onSetNativeValue = onSlideContentPropertyChanged;

function onSlideContentWidthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <SideBar>data.object;

    if (bar.android) {
        bar.android.setDrawerSize(utils.layout.getDisplayDensity() * data.newValue);
    }
}
(<proxy.PropertyMetadata>common.SideBar.slideContentWidthProperty.metadata).onSetNativeValue = onSlideContentWidthPropertyChanged;

export class SideBar extends common.SideBar {
    public _createUI() {
        this._android = new com.telerik.android.primitives.widget.sidedrawer.RadSideDrawer(this._context);
        this._android.setDrawerSize(utils.layout.getDisplayDensity() * 280);

        if (this.mainContent instanceof view.View) {
            this._addView(this.mainContent);
        }

        if (this.slideContent instanceof view.View) {
            this._addView(this.slideContent);
        }
    }

    private _android: any;
    get android(): any {
        return this._android;
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);

        if (this.mainContent instanceof view.View) {
            this.mainContent.bindingContext = this.bindingContext;
        }

        if (this.slideContent instanceof view.View) {
            this.slideContent.bindingContext = this.bindingContext;
        }
    }
}