import definition = require("ui/tool-bar");
import common = require("ui/tool-bar/tool-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <ToolBar>data.object;
    if (!bar.ios) {
        return;
    }

    var items = new NSMutableArray();
    for (var element in <Array<definition.ToolBarItem>>data.newValue) {
        if (element.view instanceof view.View) {
            bar._addView(element.view);
            items.addObject(element.view.ios);
        }
    }

    bar.ios.setItemsAnimated(items, false);
}
(<proxy.PropertyMetadata>common.ToolBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

export class ToolBar extends common.ToolBar {
    private _ios: UIToolbar;

    constructor() {
        super();

        this._ios = UIToolbar.new();
    }

    get ios(): UIToolbar {
        return this._ios;
    }
}