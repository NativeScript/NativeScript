import { TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty, selectedColorProperty, tabsBackgroundColorProperty, traceCategory } from "./tab-view-common"
import { View, colorProperty, fontInternalProperty } from "ui/core/view";
import { Property } from "ui/core/properties";
import { Bindable } from "ui/core/bindable";
import { isIOS } from "platform";
import { Color } from "color";
import { Font } from "ui/styling/font";
import { fromFileOrResource } from "image-source";
import trace = require("trace");

export * from "./tab-view-common";



const VIEWS_STATES = "_viewStates";
const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

export class TabViewItem extends TabViewItemBase {
    public _parent: TabView;

    public _update() {
        if (this._parent) {
            this._parent._updateTabForItem(this);
        }
    }
}

let PagerAdapterClass;
function ensurePagerAdapterClass() {
    if (PagerAdapterClass) {
        return;
    }

    class PagerAdapterClassInner extends android.support.v4.view.PagerAdapter {
        private owner: TabView;
        private items: Array<TabViewItem>;

        constructor(owner: TabView, items: Array<TabViewItem>) {
            super();

            this.owner = owner;
            this.items = items;

            return global.__native(this);
        }

        getCount() {
            return this.items ? this.items.length : 0;
        }

        getPageTitle(index: number) {
            if (index < 0 || index >= this.items.length) {
                return "";
            }

            return this.items[index].title;
        }

        instantiateItem(container: android.view.ViewGroup, index: number) {
            if (trace.enabled) {
                trace.write("TabView.PagerAdapter.instantiateItem; container: " + container + "; index: " + index, traceCategory);
            }

            let item = this.items[index];
            if (item.view.parent !== this.owner) {
                this.owner._addView(item.view);
            }

            if (this[VIEWS_STATES]) {
                if (trace.enabled) {
                    trace.write("TabView.PagerAdapter.instantiateItem; restoreHierarchyState: " + item.view, traceCategory);
                }
                item.view._nativeView.restoreHierarchyState(this[VIEWS_STATES]);
            }

            container.addView(item.view._nativeView);
            return item.view._nativeView;
        }

        destroyItem(container: android.view.ViewGroup, index: number, _object: any) {
            if (trace.enabled) {
                trace.write("TabView.PagerAdapter.destroyItem; container: " + container + "; index: " + index + "; _object: " + _object, traceCategory);
            }
            let item = this.items[index];
            let nativeView = item.view._nativeView;

            if (nativeView.toString() !== _object.toString()) {
                throw new Error("Expected " + nativeView.toString() + " to equal " + _object.toString());
            }

            container.removeView(nativeView);

            // Note: this.owner._removeView will clear item.view._nativeView.
            // So call this after the native instance is removed form the container. 
            if (item.view.parent === this.owner) {
                this.owner._removeView(item.view);
            }
        }

        isViewFromObject(view: android.view.View, _object: any) {
            return view === _object;
        }

        saveState(): android.os.Parcelable {
            if (trace.enabled) {
                trace.write("TabView.PagerAdapter.saveState", traceCategory);
            }

            let owner: TabView = this.owner;
            if (!owner || owner._childrenCount === 0) {
                return null;
            }

            if (!this[VIEWS_STATES]) {
                this[VIEWS_STATES] = new android.util.SparseArray<android.os.Parcelable>();
            }
            let viewStates = this[VIEWS_STATES];
            let childCallback = function (view: View): boolean {
                let nativeView: android.view.View = view._nativeView;
                if (nativeView && nativeView.isSaveFromParentEnabled && nativeView.isSaveFromParentEnabled()) {
                    nativeView.saveHierarchyState(viewStates);
                }
                return true;
            }
            owner._eachChildView(childCallback);

            let bundle = new android.os.Bundle();
            bundle.putSparseParcelableArray(VIEWS_STATES, viewStates);
            return bundle;
        }

        restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader) {
            if (trace.enabled) {
                trace.write("TabView.PagerAdapter.restoreState", traceCategory);
            }
            let bundle: android.os.Bundle = <android.os.Bundle>state;
            bundle.setClassLoader(loader);
            this[VIEWS_STATES] = bundle.getSparseParcelableArray(VIEWS_STATES);
        }
    };

    PagerAdapterClass = PagerAdapterClassInner;
}

let PageChangedListenerClass;
function ensurePageChangedListenerClass() {
    if (PageChangedListenerClass) {
        return;
    }

    class PageChangedListener extends android.support.v4.view.ViewPager.SimpleOnPageChangeListener {
        private _owner: TabView;
        constructor(owner: TabView) {
            super();
            this._owner = owner;
            return global.__native(this);
        }

        public onPageSelected(position: number) {
            this._owner.selectedIndex = position;
        }
    }

    PageChangedListenerClass = PageChangedListener;
}

export class TabView extends TabViewBase {
    private _grid: org.nativescript.widgets.GridLayout;
    private _tabLayout: org.nativescript.widgets.TabLayout;
    private _viewPager: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _androidViewId: number = -1;

    private _pageChagedListener: android.support.v4.view.ViewPager.SimpleOnPageChangeListener;

    get android(): android.view.View {
        return this._grid;
    }

    public _createUI() {
        if (trace.enabled) {
            trace.write("TabView._createUI(" + this + ");", traceCategory);
        }

        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

        this._tabLayout = new org.nativescript.widgets.TabLayout(this._context);
        this._grid.addView(this._tabLayout);

        this.setElevation();

        let accentColor = utils.ad.resources.getPalleteColor(ACCENT_COLOR, this._context);
        if (accentColor) {
            this._tabLayout.setSelectedIndicatorColors([accentColor]);
        }

        let primaryColor = utils.ad.resources.getPalleteColor(PRIMARY_COLOR, this._context);
        if (primaryColor) {
            this._tabLayout.setBackgroundColor(primaryColor);
        }

        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }

        this._viewPager = new android.support.v4.view.ViewPager(this._context);
        if (this._androidOffscreenTabLimit !== 1) {
            this._viewPager.setOffscreenPageLimit(this._androidOffscreenTabLimit);
        }
        this._viewPager.setId(this._androidViewId);
        let lp = new org.nativescript.widgets.CommonLayoutParams();
        lp.row = 1;
        this._viewPager.setLayoutParams(lp);
        this._grid.addView(this._viewPager);

        ensurePageChangedListenerClass();
        this._pageChagedListener = new PageChangedListenerClass(this);
        (<any>this._viewPager).addOnPageChangeListener(this._pageChagedListener);
    }

    private setElevation() {
        let compat = <any>android.support.v4.view.ViewCompat;
        if (compat.setElevation) {
            let val = DEFAULT_ELEVATION * utils.layout.getDisplayDensity();
            compat.setElevation(this._grid, val);
            compat.setElevation(this._tabLayout, val);
        }
    }

    public _onItemsPropertyChangedSetNativeValue() {
        let oldItems = <TabViewItem[]>this.previousItems;
        if (oldItems) {
            oldItems.forEach((oldItem) => {
                // _removeView is called within destroyItem method 
                oldItem._parent = null;
            });

            this._viewPager.setAdapter(null);
            this._pagerAdapter = null;
            this._tabLayout.setItems(null, null);
        }

        let items = <TabViewItem[]>this.items;
        if (items) {
            let tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
            items.forEach((item, idx, arr) => {
                if (!item.view) {
                    throw new Error("View of TabViewItem at index " + idx + " is " + item.view);
                }

                item._parent = this;
                if (item.view.parent !== this) {
                    this._addView(item.view, idx);
                }
                tabItems.push(this.createTabItem(item));
            });

            ensurePagerAdapterClass();
            // TODO: optimize by reusing the adapter and calling setAdapter(null) then the same adapter.
            this._pagerAdapter = new PagerAdapterClass(this, items);
            this._viewPager.setAdapter(this._pagerAdapter);

            this._tabLayout.setItems(tabItems, this._viewPager);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(items);
    }

    public _updateTabForItem(item: TabViewItem) {
        if (this.items && this.items.length > 0) {
            let index = this.items.indexOf(item);
            if (index >= 0) {
                this._tabLayout.updateItemAt(index, this.createTabItem(item));
            }
        }
    }

    public _onSelectedIndexPropertyChangedSetNativeValue() {
        if (trace.enabled) {
            trace.write("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + data.oldValue + " ---> " + data.newValue + ");", traceCategory);
        }
        super._onSelectedIndexPropertyChangedSetNativeValue(data);

        let index = data.newValue;
        if (!types.isNullOrUndefined(index)) {
            // Select the respective page in the ViewPager
            let viewPagerSelectedIndex = this._viewPager.getCurrentItem();
            if (viewPagerSelectedIndex !== index) {
                if (trace.enabled) {
                    trace.write("TabView this._viewPager.setCurrentItem(" + index + ", true);", traceCategory);
                }
                this._viewPager.setCurrentItem(index, true);
            }
        }

        let args = { eventName: TabView.selectedIndexChangedEvent, object: this, oldIndex: data.oldValue, newIndex: data.newValue };
        this.notify(args);
    }

    private createTabItem(item: TabViewItem): org.nativescript.widgets.TabItemSpec {
        let result = new org.nativescript.widgets.TabItemSpec();
        result.title = item.title;

        if (item.iconSource) {

            if (item.iconSource.indexOf(utils.RESOURCE_PREFIX) === 0) {
                result.iconId = utils.ad.resources.getDrawableId(item.iconSource.substr(utils.RESOURCE_PREFIX.length));
            }
            else {
                let is = imageSource.fromFileOrResource(item.iconSource);
                if (is) {
                    result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
                }
            }
        }

        return result;
    }

    get [itemsProperty.native](): TabViewItemBase[] {
        return null;
    }
    set [itemsProperty.native](value: TabViewItemBase[]) {
        this._onItemsPropertyChangedSetNativeValue();
    }

    get [selectedColorProperty.native](): number {
        //from https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
        return 0xFF33B5E5;
    }
    set [selectedColorProperty.native](value: number | Color) {
        let tabLayout = this._tabLayout;
        let color = value instanceof Color ? value.android : value;
        tabLayout.setSelectedIndicatorColors([color]);
    }

    get [tabsBackgroundColorProperty.native](): android.graphics.drawable.Drawable {
        return this._tabLayout.getBackground();
    }
    set [tabsBackgroundColorProperty.native](value: android.graphics.drawable.Drawable | Color) {
        if (value instanceof Color) {
            this._tabLayout.setBackgroundColor(value.android);
        } else {
            this._tabLayout.setBackground(value);
        }
    }

    get [colorProperty.native](): number {
        let items = this.items;
        if (items && items.length > 0) {
            let tv = this._tabLayout.getTextViewForItemAt(0);
            if (tv) {
                return tv.getTextColors().getDefaultColor();
            }
        }

        return undefined;
    }
    set [colorProperty.native](value: number | Color) {
        let items = this.items;
        if (items && items.length > 0) {
            let color = value instanceof Color ? value.android : value;
            let tabLayout = this._tabLayout;

            for (let i = 0, length = items.length; i < length; i++) {
                let tv = tabLayout.getTextViewForItemAt(i);
                tv.setTextColor(color);
            }
        }
    }

    get [fontInternalProperty.native](): { typeface: android.graphics.Typeface, fontSize: number } {
        let items = this.items;
        if (items && items.length > 0) {
            let tabLayout = this._tabLayout;
            let tv = tabLayout.getTextViewForItemAt(0);
            return {
                typeface: tv.getTypeface(),
                fontSize: tv.getTextSize()
            };
        }

        return {
            typeface: undefined,
            fontSize: undefined
        };
    }
    set [fontInternalProperty.native](value: Font | { typeface: android.graphics.Typeface, fontSize: number }) {
        let typeface: android.graphics.Typeface;
        let fontSize = value.fontSize;
        let isFont: boolean;
        if (value instanceof Font) {
            isFont = true;
            typeface = value.getAndroidTypeface();
        } else {
            typeface = value.typeface;
        }

        let items = this.items;
        if (items && items.length > 0) {
            let tabLayout = this._tabLayout;

            for (let i = 0, length = items.length; i < length; i++) {
                let tv = tabLayout.getTextViewForItemAt(i);
                tv.setTypeface(typeface);

                if (isFont) {
                    tv.setTextSize(fontSize);
                }
                else {
                    tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, fontSize);
                }
            }
        }
    }
}
