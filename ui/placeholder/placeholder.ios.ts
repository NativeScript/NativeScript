import definition = require("ui/placeholder");
import common = require("ui/placeholder/placeholder-common");

global.moduleMerge(common, exports);

export class Placeholder extends common.Placeholder {
    private _ios: UIView;

    get ios(): UIView {
        if (!this._ios) {
            var args = <definition.CreateViewEventData>{ eventName: common.Placeholder.creatingViewEvent, object: this, view: undefined, context: undefined };
            super.notify(args);
            this._ios = args.view || new UIView();
        }
        return this._ios;
    }

    get _nativeView(): UIView {
        return this.ios;
    }
} 