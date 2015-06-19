import parent = require("ui/list-view/list-view");
import common = require("ui/refreshable-list-view/refreshable-list-view-common");

var REFRESH = common.RefreshableListViewMixin.refreshEvent;
// merge the exports of the parent file with the exports of this file
declare var exports;
require("utils/module-merge").merge(parent, exports);

export class RefreshableListView extends parent.ListView implements common.RefreshableListViewMixin {
    public static refreshEvent = REFRESH;
    private _android: android.widget.ListView;
    private _refreshableView: definition.AndroidListView;
    private _androidViewId: number;

    public _createUI() {
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        var listview = this._createListView();
        var refreshLayout;
        //Init SwipeRefreshLayout if there is refresh event
        if (this.hasListeners(common.RefreshableListViewMixin.refreshEvent)) {
            refreshLayout = this._createRefreshLayout(listview);
            refreshLayout.setId(this._androidViewId);
        } else {
            listview.setId(this._androidViewId);
        }
        
        this._android = listview;
        this._refreshableView = <definition.AndroidListView> {
            RefreshLayout: refreshLayout,
            ListView: listview,
        }
    }
    
    // this._listview
    public _createRefreshLayout(listview: android.widget.ListView): android.support.v4.widget.SwipeRefreshLayout {
        var that = new WeakRef(this);
        var refreshLayout = new android.support.v4.widget.SwipeRefreshLayout(this._context);
        refreshLayout.addView(listview);
        refreshLayout.setOnRefreshListener(new android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener({
            onRefresh: function() {
                var owner = that.get();
                if (owner) {
                    owner.notify(<definition.RefreshEventData>{
                        eventName: REFRESH,
                        object: owner,
                        done: function() { refreshLayout.setRefreshing(false) }
                    });
                }
            }
        }));
        return refreshLayout;
    }
    get android(): definition.AndroidListView {
        return this._refreshableView;
    }
    get _nativeView(): android.view.View {
        var r = this._refreshableView && this._refreshableView.RefreshLayout;
        if (r) {
            return r;
        }
        return this._android;
    }
}
