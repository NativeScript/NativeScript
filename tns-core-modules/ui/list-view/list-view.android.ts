import { ItemEventData, ItemsSource } from "ui/list-view";
import {
    ListViewBase, View, KeyedTemplate, Length, unsetValue, Observable, Color,
    separatorColorProperty, itemTemplatesProperty
} from "./list-view-common";
import { StackLayout } from "ui/layouts/stack-layout";
import { ProxyViewContainer } from "ui/proxy-view-container";
import { LayoutBase } from "ui/layouts/layout-base";

export * from "./list-view-common";

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;

@Interfaces([android.widget.AdapterView.OnItemClickListener])
class ItemClickListener extends java.lang.Object implements android.widget.AdapterView.OnItemClickListener {
    constructor(private owner: WeakRef<ListView>) {
        super();
        return global.__native(this);
    }

    onItemClick<T extends android.widget.Adapter>(parent: android.widget.AdapterView<T>, convertView: android.view.View, index: number, id: number) {
        let owner = this.owner.get();
        if (owner) {
            let view = owner._realizedTemplates.get(owner._getItemTemplate(index).key).get(convertView);
            owner.notify({ eventName: ITEMTAP, object: owner, index: index, view: view });
        }
    }
}

export class ListView extends ListViewBase {
    private _androidViewId: number = -1;
    private _android: android.widget.ListView;
    private _itemClickListener: android.widget.AdapterView.OnItemClickListener;
    public _realizedItems = new Map<android.view.View, View>();
    public _realizedTemplates = new Map<string, Map<android.view.View, View>>();

    public _createUI() {
        this._android = new android.widget.ListView(this._context);
        this._android.setDescendantFocusability(android.view.ViewGroup.FOCUS_AFTER_DESCENDANTS);
        this.updateEffectiveRowHeight();

        // Fixes issue with black random black items when scrolling
        this._android.setCacheColorHint(android.graphics.Color.TRANSPARENT);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);

        ensureListViewAdapterClass();
        this._android.setAdapter(new ListViewAdapterClass(this));

        this._itemClickListener = this._itemClickListener || new ItemClickListener(new WeakRef(this));
        this.android.setOnItemClickListener(this._itemClickListener);
    }

    get android(): android.widget.ListView {
        return this._android;
    }

    public refresh() {
        if (!this._android || !this._android.getAdapter()) {
            return;
        }

        // clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
        this._realizedItems.forEach((view, nativeView, map) => {
            if (!(view.bindingContext instanceof Observable)) {
                view.bindingContext = null;
            }
        });

        (<android.widget.BaseAdapter>this._android.getAdapter()).notifyDataSetChanged();
    }

    public scrollToIndex(index: number) {
        if (this._android) {
            this._android.setSelection(index);
        }
    }

    public _onDetached(force?: boolean) {
        super._onDetached(force);
        this.clearRealizedCells();
    }

    get _childrenCount(): number {
        return this._realizedItems.size;
    }

    public eachChildView(callback: (child: View) => boolean): void {
        this._realizedItems.forEach((view, nativeView, map) => {
            if (view.parent instanceof ListView) {
                callback(view);
            }
            else {
                // in some cases (like item is unloaded from another place (like angular) view.parent becomes undefined)
                if (view.parent) {
                    callback(<View>view.parent);
                }
            }
        });
    }

    public _dumpRealizedTemplates() {
        console.log(`Realized Templates:`);
        this._realizedTemplates.forEach((value, index, map) => {
            console.log(`\t${index}:`);
            value.forEach((value, index, map) => {
                console.log(`\t\t${index.hashCode()}: ${value}`);
            });
        });
        console.log(`Realized Items Size: ${this._realizedItems.size}`);
    }

    private clearRealizedCells(): void {
        // clear the cache
        this._realizedItems.forEach((view, nativeView, map) => {
            if (view.parent) {
                // This is to clear the StackLayout that is used to wrap non LayoutBase & ProxyViewContainer instances.
                if (!(view.parent instanceof ListView)) {
                    this._removeView(view.parent);
                }
                view.parent._removeView(view);
            }
        });

        this._realizedItems.clear();
        this._realizedTemplates.clear();
    }

    get [separatorColorProperty.native](): { dividerHeight: number, divider: android.graphics.drawable.Drawable } {
        let nativeView = this._android;
        return {
            dividerHeight: nativeView.getDividerHeight(),
            divider: nativeView.getDivider()
        };
    }
    set [separatorColorProperty.native](value: Color | { dividerHeight: number, divider: android.graphics.drawable.Drawable }) {
        let nativeView = this._android;
        if (value instanceof Color) {
            nativeView.setDivider(new android.graphics.drawable.ColorDrawable(value.android));
            nativeView.setDividerHeight(1);
        } else {
            nativeView.setDivider(value.divider);
            nativeView.setDividerHeight(value.dividerHeight);
        }
    }

    get [itemTemplatesProperty.native](): KeyedTemplate[] {
        return null;
    }
    set [itemTemplatesProperty.native](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }

        this.android.setAdapter(new ListViewAdapterClass(this));
        this.refresh();
    }
}

let ListViewAdapterClass;
function ensureListViewAdapterClass() {
    if (ListViewAdapterClass) {
        return;
    }

    class ListViewAdapter extends android.widget.BaseAdapter {
        private _listView: ListView;

        constructor(listView: ListView) {
            super();
            this._listView = listView;
            return global.__native(this);
        }

        public getCount() {
            return this._listView && this._listView.items && this._listView.items.length ? this._listView.items.length : 0;
        }

        public getItem(i: number) {
            if (this._listView && this._listView.items && i < this._listView.items.length) {
                let getItem = (<ItemsSource>this._listView.items).getItem
                return getItem ? getItem(i) : this._listView.items[i];
            }

            return null;
        }

        public getItemId(i: number) {
            return long(i);
        }

        public hasStableIds(): boolean {
            return true;
        }

        public getViewTypeCount() {
            return this._listView._itemTemplatesInternal.length;
        }

        public getItemViewType(index: number) {
            let template = this._listView._getItemTemplate(index);
            let itemViewType = this._listView._itemTemplatesInternal.indexOf(template);
            return itemViewType;
        }

        public getView(index: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View {
            //this._listView._dumpRealizedTemplates();

            if (!this._listView) {
                return null;
            }

            let totalItemCount = this._listView.items ? this._listView.items.length : 0;
            if (index === (totalItemCount - 1)) {
                this._listView.notify({ eventName: LOADMOREITEMS, object: this._listView });
            }

            // Recycle an existing view or create a new one if needed.
            let template = this._listView._getItemTemplate(index);
            let view: View;
            if (convertView) {
                view = this._listView._realizedTemplates.get(template.key).get(convertView);
                if (!view) {
                    throw new Error(`There is no entry with key '${convertView}' in the realized views cache for template with key'${template.key}'.`);
                }
            }
            else {
                view = template.createView();
            }

            let args: ItemEventData = {
                eventName: ITEMLOADING, object: this._listView, index: index, view: view,
                android: parent,
                ios: undefined
            };

            this._listView.notify(args);

            if (!args.view) {
                args.view = this._listView._getDefaultItemContent(index);
            }

            if (args.view) {
                if (this._listView._effectiveRowHeight > -1) {
                    args.view.height = this._listView.rowHeight;
                }
                else {
                    args.view.height = <Length>unsetValue;
                }

                this._listView._prepareItem(args.view, index);
                if (!args.view.parent) {
                    // Proxy containers should not get treated as layouts.
                    // Wrap them in a real layout as well.
                    if (args.view instanceof LayoutBase &&
                        !(args.view instanceof ProxyViewContainer)) {
                        this._listView._addView(args.view);
                        convertView = args.view.android;
                    } else {
                        let sp = new StackLayout();
                        sp.addChild(args.view);
                        this._listView._addView(sp);

                        convertView = sp.android;
                    }
                }

                // Cache the view for recycling
                let realizedItemsForTemplateKey = this._listView._realizedTemplates.get(template.key);
                if (!realizedItemsForTemplateKey) {
                    realizedItemsForTemplateKey = new Map<android.view.View, View>();
                    this._listView._realizedTemplates.set(template.key, realizedItemsForTemplateKey);
                }
                realizedItemsForTemplateKey.set(convertView, args.view);
                this._listView._realizedItems.set(convertView, args.view);
            }

            return convertView;
        }
    }

    ListViewAdapterClass = ListViewAdapter;
}