import common = require("ui/tool-bar/tool-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <ToolBar>data.object;
    if (!view.android) {
        return;
    }
}
(<proxy.PropertyMetadata>common.ToolBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

export class ToolBar extends common.ToolBar {
    private _android: any;

    public _createUI() {
        this._android = new (<any>android.widget).Toolbar(this._context);
    }

    get android(): any {
        return this._android;
    }
}