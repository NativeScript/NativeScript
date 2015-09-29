import definition = require("ui/placeholder");
import common = require("./placeholder-common");

global.moduleMerge(common, exports);

export class Placeholder extends common.Placeholder {
    private _android: android.view.View;

    public _createUI() {
        var args = <definition.CreateViewEventData>{ eventName: common.Placeholder.creatingViewEvent, object: this, view: undefined, context: this._context };
        this.notify(args);
        this._android = <android.view.View>args.view || new android.view.View(this._context);
    }

    get android(): android.view.View {
        return this._android;
    }

    get _nativeView(): android.view.View {
        return this._android;
    }
}
