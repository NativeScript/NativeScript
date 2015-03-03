import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import trace = require("trace");

declare var exports;
require("utils/module-merge").merge(pageCommon, exports);

export class Page extends pageCommon.Page {
    private _isBackNavigation = false;

    constructor(options?: definition.Options) {
        super(options);
    }

    public _onDetached(force?: boolean) {
        var skipDetached = !force && this.frame.android.cachePagesOnNavigate && !this._isBackNavigation;

        if (skipDetached) {
            // Do not detach the context and android reference.
            trace.write("Caching Page " + this._domId, trace.categories.NativeLifecycle);
        }
        else {
            super._onDetached();
        }
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        this._isBackNavigation = isBackNavigation;
        super.onNavigatedFrom(isBackNavigation);
    }
}