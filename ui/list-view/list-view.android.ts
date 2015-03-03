import observable = require("data/observable");
import common = require("ui/list-view/list-view-common");
import viewModule = require("ui/core/view");
import layout = require("ui/layouts/layout");
import stackLayout = require("ui/layouts/stack-layout");

var ITEMLOADING = common.knownEvents.itemLoading;
var LOADMOREITEMS = common.knownEvents.loadMoreItems;
var ITEMTAP = common.knownEvents.itemTap;
var REALIZED_INDEX = "realizedIndex";

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class ListView extends common.ListView {
    private _android: android.widget.ListView;
    public _realizedItems = {};
    private _androidViewId: number;

    public _createUI() {
        this._android = new android.widget.ListView(this._context);

        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);

        this.android.setAdapter(new ListViewAdapter(this));

        var that = new WeakRef(this);

        // TODO: This causes many marshalling calls, rewrite in Java and generate bindings
        this.android.setOnScrollListener(new android.widget.AbsListView.OnScrollListener({
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

        this.android.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
            onItemClick: function (parent: any, convertView: android.view.View, index: number, id: number) {
                var owner = that.get();
                if (owner) {
                    owner.notify({ eventName: ITEMTAP, object: owner, index: index, view: owner._getRealizedView(convertView, index) });
                }
            }
        }));
    }

    get android(): android.widget.ListView {
        return this._android;
    }

    public refresh() {
        if (!this._android || !this._android.Adapter) {
            return;
        }

        (<ListViewAdapter>this.android.Adapter).notifyDataSetChanged();
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

    public getView(index: number, convertView: android.view.View, parent: any): android.view.View {
        if (!this._listView) {
            return null;
        }

        var view = this._listView._getRealizedView(convertView, index);
        var args = { eventName: ITEMLOADING, object: this._listView, index: index, view: view };
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