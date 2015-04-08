import definition = require("ui/placeholder");
import common = require("ui/placeholder/placeholder-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class Placeholder extends common.Placeholder {
    private _android: android.view.View;

    public _createUI() {
        var args = <definition.CreateViewEventData>{ eventName: common.knownEvents.creatingView, object: this, view: undefined, context: this._context };
        this.notify(args);
        this._android = <android.view.View>args.view;
    }

    get android(): android.view.View {
        return this._android;
    }

    get _nativeView(): android.view.View {
        return this._android;
    }
}