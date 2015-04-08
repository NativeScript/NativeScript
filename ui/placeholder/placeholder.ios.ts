import definition = require("ui/placeholder");
import common = require("ui/placeholder/placeholder-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class Placeholder extends common.Placeholder {
    private _ios: UIView;

    get ios(): UIView {
        if (!this._ios) {
            console.trace();
            var args = <definition.CreateViewEventData>{ eventName: common.knownEvents.creatingView, object: this, view: undefined, context: undefined };
            super.notify(args);
            this._ios = args.view;
        }
        return this._ios;
    }

    get _nativeView(): UIView {
        return this.ios;
    }

} 