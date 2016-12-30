import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, selectedTabTextColorProperty,
    androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty,
    fontInternalProperty, traceCategory, View, colorProperty, layout, Color, Font, traceEnabled, traceWrite
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "ui/text-base";
import { fromFileOrResource } from "image-source";
import { RESOURCE_PREFIX, ad } from "utils/utils";

export * from "./tab-view-common";

const VIEWS_STATES = "_viewStates";
const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

export class TabViewItem extends TabViewItemBase {

    public _update() {
        const parent = <TabView>this.parent;
        if (parent) {
            parent._updateTabForItem(this);
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
            if (traceEnabled) {
                traceWrite("TabView.PagerAdapter.instantiateItem; container: " + container + "; index: " + index, traceCategory);
            }

            let item = this.items[index];
            // if (item.view.parent !== this.owner) {
            //     this.owner._addView(item.view);
            // }

            if (this[VIEWS_STATES]) {
                if (traceEnabled) {
                    traceWrite("TabView.PagerAdapter.instantiateItem; restoreHierarchyState: " + item.view, traceCategory);
                }
                item.view._nativeView.restoreHierarchyState(this[VIEWS_STATES]);
            }

            if (item.view._nativeView) {
                container.addView(item.view._nativeView);
            }
            return item.view._nativeView;
        }

        destroyItem(container: android.view.ViewGroup, index: number, _object: any) {
            if (traceEnabled) {
                traceWrite("TabView.PagerAdapter.destroyItem; container: " + container + "; index: " + index + "; _object: " + _object, traceCategory);
            }
            let item = this.items[index];
            let nativeView = item.view._nativeView;

            if (!nativeView || !_object) {
                return;
            }

            if (nativeView.toString() !== _object.toString()) {
                throw new Error("Expected " + nativeView.toString() + " to equal " + _object.toString());
            }

            container.removeView(nativeView);

            // Note: this.owner._removeView will clear item.view._nativeView.
            // So call this after the native instance is removed form the container. 
            // if (item.view.parent === this.owner) {
            //     this.owner._removeView(item.view);
            // }
        }

        isViewFromObject(view: android.view.View, _object: any) {
            return view === _object;
        }

        saveState(): android.os.Parcelable {
            if (traceEnabled) {
                traceWrite("TabView.PagerAdapter.saveState", traceCategory);
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
            
            owner.eachChildView(childCallback);

            let bundle = new android.os.Bundle();
            bundle.putSparseParcelableArray(VIEWS_STATES, viewStates);
            return bundle;
        }

        restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader) {
            if (traceEnabled) {
                traceWrite("TabView.PagerAdapter.restoreState", traceCategory);
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
        if (traceEnabled) {
            traceWrite("TabView._createUI(" + this + ");", traceCategory);
        }

        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

        this._tabLayout = new org.nativescript.widgets.TabLayout(this._context);
        this._grid.addView(this._tabLayout);

        this.setElevation();

        const accentColor = ad.resources.getPalleteColor(ACCENT_COLOR, this._context);
        if (accentColor) {
            this._tabLayout.setSelectedIndicatorColors([accentColor]);
        }

        const primaryColor = ad.resources.getPalleteColor(PRIMARY_COLOR, this._context);
        if (primaryColor) {
            this._tabLayout.setBackgroundColor(primaryColor);
        }

        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }

        this._viewPager = new android.support.v4.view.ViewPager(this._context);
        this._viewPager.setId(this._androidViewId);
        const lp = new org.nativescript.widgets.CommonLayoutParams();
        lp.row = 1;
        this._viewPager.setLayoutParams(lp);
        this._grid.addView(this._viewPager);

        ensurePageChangedListenerClass();
        this._pageChagedListener = new PageChangedListenerClass(this);
        (<any>this._viewPager).addOnPageChangeListener(this._pageChagedListener);
        this.nativeView = this._viewPager;
        this._nativeView = this._viewPager;
    }

    private setElevation() {
        const compat = <any>android.support.v4.view.ViewCompat;
        if (compat.setElevation) {
            let val = DEFAULT_ELEVATION * layout.getDisplayDensity();
            compat.setElevation(this._grid, val);
            compat.setElevation(this._tabLayout, val);
        }
    }

    private setAdapter(items: Array<TabViewItem>) {
        const length = items ? items.length : 0;
        if (length === 0) {
            this._viewPager.setAdapter(null);
            this._pagerAdapter = null;
            this._tabLayout.setItems(null, null);
            return;
        }

        const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
        items.forEach((item, idx, arr) => {
            tabItems.push(this.createTabItem(item));
        });

        ensurePagerAdapterClass();
        // TODO: optimize by reusing the adapter and calling setAdapter(null) then the same adapter.
        this._pagerAdapter = new PagerAdapterClass(this, items);
        this._viewPager.setAdapter(this._pagerAdapter);

        this._tabLayout.setItems(tabItems, this._viewPager);

        let selectedIndex = this.selectedIndex;
        if (selectedIndex < 0) {
            this.selectedIndex = this._viewPager.getCurrentItem();
        }
    }

    public _updateTabForItem(item: TabViewItem) {
        let items = this.items;
        if (items && items.length > 0) {
            let index = this.items.indexOf(item);
            if (index >= 0) {
                this._tabLayout.updateItemAt(index, this.createTabItem(item));
            }
        }
    }

    private createTabItem(item: TabViewItem): org.nativescript.widgets.TabItemSpec {
        let result = new org.nativescript.widgets.TabItemSpec();
        result.title = item.title;

        if (item.iconSource) {
            if (item.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
                result.iconId = ad.resources.getDrawableId(item.iconSource.substr(RESOURCE_PREFIX.length));
            } else {
                let is = fromFileOrResource(item.iconSource);
                if (is) {
                    // TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
                    result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
                }
            }
        }

        return result;
    }

    get [androidOffscreenTabLimitProperty.native](): number {
        return this._viewPager.getOffscreenPageLimit();
    }
    set [androidOffscreenTabLimitProperty.native](value: number) {
        this._viewPager.setOffscreenPageLimit(value);
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        if (traceEnabled) {
            traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", true);", traceCategory);
        }
        this._viewPager.setCurrentItem(value, true);
    }

    get [itemsProperty.native](): TabViewItemBase[] {
        return null;
    }
    set [itemsProperty.native](value: TabViewItemBase[]) {
        this.setAdapter(value);
    }

    get [colorProperty.native](): number {
        return this._tabLayout.getTabTextColor();
    }
    set [colorProperty.native](value: number | Color) {
        let color = value instanceof Color ? value.android : value;
        this._tabLayout.setTabTextColor(color);
    }

    get [tabBackgroundColorProperty.native](): android.graphics.drawable.Drawable {
        return this._tabLayout.getBackground();
    }
    set [tabBackgroundColorProperty.native](value: android.graphics.drawable.Drawable | Color) {
        if (value instanceof Color) {
            this._tabLayout.setBackgroundColor(value.android);
        } else {
            this._tabLayout.setBackground(value);
        }
    }

    get [selectedTabTextColorProperty.native](): number {
        return this._tabLayout.getSelectedTabTextColor();
    }
    set [selectedTabTextColorProperty.native](value: number | Color) {
        let color = value instanceof Color ? value.android : value;
        this._tabLayout.setTabTextColor(color);
    }

    get [androidSelectedTabHighlightColorProperty.native](): number {
        //from https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
        return 0xFF33B5E5;
    }
    set [androidSelectedTabHighlightColorProperty.native](value: number | Color) {
        let tabLayout = this._tabLayout;
        let color = value instanceof Color ? value.android : value;
        tabLayout.setSelectedIndicatorColors([color]);
    }

    // TODO: Move this to TabViewItem
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

    // TODO: Move this to TabViewItem
    get [textTransformProperty.native](): TextTransform {
        return "none";
    }
    set [textTransformProperty.native](value: TextTransform) {
        let tabLayout = this._tabLayout;
        let items = this.items;
        if (!items) {
            return;
        }

        for (let i = 0, count = items.length; i < count; i++) {
            const textView = tabLayout.getTextViewForItemAt(i);
            const result = getTransformedText(items[i].title, value);
            textView.setText(result);
        }
    }
}