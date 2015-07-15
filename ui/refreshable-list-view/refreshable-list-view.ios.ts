/* *
// error: `tns_modules/ui/refreshable-list-view/refreshable-list-view.ios.ts(1,25): error TS2306: File 'tns_modules/ui/list-view/list-view.d.ts' is not an external module.
import parent = require("ui/list-view/list-view");
/* */
import parent = require("ui/list-view/list-view.ios");
import definition = require("ui/refreshable-list-view");
import common = require("ui/refreshable-list-view/refreshable-list-view-common");

var REFRESH = common.RefreshableListViewMixin.refreshEvent;

class RefreshHandlerImpl extends NSObject {
    static new(): RefreshHandlerImpl {
        return <RefreshHandlerImpl>super.new();
    }

    private _owner: RefreshableListView;
    private _UIRefreshControl: UIRefreshControl;

    public initWithOwner(owner: RefreshableListView): RefreshHandlerImpl {
        this._owner = owner;
        this._UIRefreshControl = new UIRefreshControl();
        owner.ios.addSubview(this._UIRefreshControl);
        this._UIRefreshControl.addTargetActionForControlEvents(this, "refresh", UIControlEvents.UIControlEventValueChanged);
        return this;
    }

    public refresh(sender: UIRefreshControl) {
        this._owner.notify(<definition.RefreshEventData>{
            eventName: REFRESH,
            object: this._owner,
            done: sender.endRefreshing.bind(sender)
        });
    }

    public static ObjCExposedMethods = {
        'refresh': { returns: interop.types.void, params: [UIRefreshControl] }
    };
}

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(parent, exports);

export class RefreshableListView extends parent.ListView implements common.RefreshableListViewMixin {
    public static refreshEvent = REFRESH;
    private _refreshHandler: RefreshHandlerImpl;

    public onLoaded() {
        super.onLoaded();
        if (this.hasListeners(REFRESH)) {
            this._refreshHandler = RefreshHandlerImpl.new().initWithOwner(this);
        }
    }

    public onUnloaded() {
        this._refreshHandler = null;
        super.onUnloaded();
    }

}
