import observable = require("data/observable");
import common = require("ui/list-view/list-view-common");
import viewModule = require("ui/core/view");
import layout = require("ui/layouts/layout");
import stackLayout = require("ui/layouts/stack-layout");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");
import definition = require("ui/list-view");

var ITEMLOADING = common.ListView.itemLoadingEvent;
var LOADMOREITEMS = common.ListView.loadMoreItemsEvent;
var ITEMTAP = common.ListView.itemTapEvent;
var REALIZED_INDEX = "realizedIndex";
var REFRESH = common.ListView.refreshEvent;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function onSeparatorColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <ListView>data.object;
    if (!bar.android) {
        return;
    }

    if (data.newValue instanceof color.Color) {
        bar.android.ListView.setDivider(new android.graphics.drawable.ColorDrawable((<color.Color>data.newValue).android));
        bar.android.ListView.setDividerHeight(1);
    }
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.ListView.separatorColorProperty.metadata).onSetNativeValue = onSeparatorColorPropertyChanged;

export class ListView extends common.ListView {
    private _listview: android.widget.ListView;
    private _refreshlayout: android.support.v4.widget.SwipeRefreshLayout;
    private _android: definition.AndroidListView;
    public _realizedItems = {};
    private _androidListViewId: number;
    private _androidRefreshLayoutId: number;

    public _createUI() {
        var listview = new android.widget.ListView(this._context);

        // Fixes issue with black random black items when scrolling
        listview.setCacheColorHint(android.graphics.Color.TRANSPARENT);
        if (!this._androidListViewId) {
            this._androidListViewId = android.view.View.generateViewId();
        }
        listview.setId(this._androidListViewId);

        listview.setAdapter(new ListViewAdapter(this));

        var that = new WeakRef(this);

        // TODO: This causes many marshalling calls, rewrite in Java and generate bindings
        listview.setOnScrollListener(new android.widget.AbsListView.OnScrollListener({
            onScrollStateChanged: function (view: android.widget.AbsListView, scrollState: number) {
                var owner: ListView = this.owner;
                if (!owner) {
                    return;
                }

                if (scrollState === android.widget.AbsListView.OnScrollListener.SCROLL_STATE_IDLE) {
                    owner._setValue(common.ListView.isScrollingProperty, false);
                    owner._notifyScrollIdle();
                } else {
                    owner._setValue(common.ListView.isScrollingProperty, true);
                }
            },
            onScroll: function (view: android.widget.AbsListView, firstVisibleItem: number, visibleItemCount: number, totalItemCount: number) {
                var owner: ListView = this.owner;
                if (!owner) {
                    return;
                }

                if (totalItemCount > 0 && firstVisibleItem + visibleItemCount === totalItemCount) {
                    owner.notify(<observable.EventData>{ eventName: LOADMOREITEMS, object: owner });
                }
            },

            get owner() {
                return that.get();
            }
        }));

        listview.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
            onItemClick: function (parent: any, convertView: android.view.View, index: number, id: number) {
                var owner = that.get();
                if (owner) {
                    owner.notify({ eventName: ITEMTAP, object: owner, index: index, view: owner._getRealizedView(convertView, index) });
                }
            }
        }));
        this._listview = listview;

        //Init SwipeRefreshLayout if there is refresh event
        if (this.hasListeners(common.ListView.refreshEvent)) {
           var refreshLayout = new android.support.v4.widget.SwipeRefreshLayout(this._context);
           refreshLayout.addView(this._listview);
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
           if (!this._androidRefreshLayoutId) {
               this._androidRefreshLayoutId = android.view.View.generateViewId();
           }
           refreshLayout.setId(this._androidRefreshLayoutId);
           this._refreshlayout = refreshLayout;
        }
        this._android = <definition.AndroidListView> {
           RefreshLayout: this._refreshlayout,
           ListView: this._listview,
       }
    }

    get android(): definition.AndroidListView {
        return this._android;
    }

    get _nativeView(): android.view.View {
        if (this._refreshlayout) {
            return this._refreshlayout
        }
        return this._listview;
    }

    public refresh() {
        if (!this._listview || !this._listview.getAdapter()) {
            return;
        }

        (<ListViewAdapter>this._listview.getAdapter()).notifyDataSetChanged();
    }

    public _onDetached(force?: boolean) {
        super._onDetached(force);

        // clear the cache
        var keys = Object.keys(this._realizedItems);
        var i;
        var length = keys.length;
        var view: viewModule.View;
        var key;

        for (i = 0; i < length; i++) {
            key = keys[i];
            view = this._realizedItems[key];
            view.parent._removeView(view);
            delete this._realizedItems[key];
        }
    }

    public _getRealizedView(convertView: android.view.View, index: number) {
        if (!convertView) {
            return this._getItemTemplateContent(index);
        }

        return this._realizedItems[convertView.hashCode()];
    }

    public _notifyScrollIdle() {
        var keys = Object.keys(this._realizedItems);
        var i;
        var length = keys.length;
        var view: viewModule.View;
        var key;

        for (i = 0; i < length; i++) {
            key = keys[i];
            view = this._realizedItems[key];

            this.notify({
                eventName: ITEMLOADING,
                object: this,
                index: view[REALIZED_INDEX],
                view: view
            });
        }
    }
}

class ListViewAdapter extends android.widget.BaseAdapter {
    private _listView: ListView;

    constructor(listView: ListView) {
        super();

        this._listView = listView;

        return global.__native(this);
    }

    public getCount() {
        return this._listView && this._listView.items ? this._listView.items.length : 0;
    }

    public getItem(i: number) {
        if (this._listView && this._listView.items && i < this._listView.items.length) {
            return this._listView.items.getItem ? this._listView.items.getItem(i) : this._listView.items[i];
        }

        return null;
    }

    public getItemId(i: number) {
        return long(i);
    }

    public hasStableIds(): boolean {
        return true;
    }

    public getView(index: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View {
        if (!this._listView) {
            return null;
        }

        var view = this._listView._getRealizedView(convertView, index);
        var args = <definition.ItemEventData>{
            eventName: ITEMLOADING, object: this._listView, index: index, view: view,
            android: parent,
            ios: undefined
        };
        this._listView.notify(args);

        if (!args.view) {
            args.view = this._listView._getDefaultItemContent(index);
        }

        if (args.view) {
            if (!args.view.parent) {
                if (args.view instanceof layout.Layout) {
                    this._listView._addView(args.view);
                    convertView = args.view.android;
                } else {
                    var sp = new stackLayout.StackLayout();
                    sp.addChild(args.view);
                    this._listView._addView(sp);

                    convertView = sp.android;
                }
            }

            this._listView._realizedItems[convertView.hashCode()] = args.view;
            // cache the realized index (used to raise the ItemLoading event upon scroll stop)
            args.view[REALIZED_INDEX] = index;

            this._listView._prepareItem(args.view, index);
        }

        return convertView;
    }
}
