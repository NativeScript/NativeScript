import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, selectedTabTextColorProperty,
    androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty,
    fontSizeProperty, fontInternalProperty, View, layout, Color, Font,
    traceCategory, traceEnabled, traceWrite, initNativeView
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "ui/text-base";
import { fromFileOrResource } from "image-source";
import { RESOURCE_PREFIX, ad } from "utils/utils";

export * from "./tab-view-common";

const VIEWS_STATES = "_viewStates";
const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
    new (owner: TabView, items: Array<TabViewItem>): android.support.v4.view.PagerAdapter;
}

interface PageChangedListener {
    new (owner: TabView): android.support.v4.view.ViewPager.SimpleOnPageChangeListener;
}

let PagerAdapter: PagerAdapter;
let PageChangedListener: PageChangedListener;

function initializeNativeClasses() {
    if (PagerAdapter) {
        return;
    }

    class PagerAdapterImpl extends android.support.v4.view.PagerAdapter {
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
            if (traceEnabled()) {
                traceWrite("TabView.PagerAdapter.instantiateItem; container: " + container + "; index: " + index, traceCategory);
            }

            let item = this.items[index];
            // if (item.view.parent !== this.owner) {
            //     this.owner._addView(item.view);
            // }

            if (this[VIEWS_STATES]) {
                if (traceEnabled()) {
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
            if (traceEnabled()) {
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
            if (traceEnabled()) {
                traceWrite("TabView.PagerAdapter.saveState", traceCategory);
            }

            const owner: TabView = this.owner;
            if (owner._childrenCount === 0) {
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
            if (traceEnabled()) {
                traceWrite("TabView.PagerAdapter.restoreState", traceCategory);
            }
            let bundle: android.os.Bundle = <android.os.Bundle>state;
            bundle.setClassLoader(loader);
            this[VIEWS_STATES] = bundle.getSparseParcelableArray(VIEWS_STATES);
        }
    };

    class PageChangedListenerImpl extends android.support.v4.view.ViewPager.SimpleOnPageChangeListener {
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

    PagerAdapter = PagerAdapterImpl;
    PageChangedListener = PageChangedListenerImpl;
}

function createTabItemSpec(item: TabViewItem): org.nativescript.widgets.TabItemSpec {
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

let defaultAccentColor: number = undefined;
function getDefaultAccentColor(context: android.content.Context): number {
    if (defaultAccentColor === undefined) {
        //Fallback color: https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
        defaultAccentColor = ad.resources.getPalleteColor(ACCENT_COLOR, context) || 0xFF33B5E5;
    }
    return defaultAccentColor;
}

export class TabViewItem extends TabViewItemBase {
    public nativeView: android.widget.TextView;
    public tabItemSpec: org.nativescript.widgets.TabItemSpec;
    public index: number;

    public setNativeView(textView: android.widget.TextView): void {
        this.nativeView = textView;
        if (textView) {
            initNativeView(this);
        }
    }

    public _update(): void {
        const tv = this.nativeView;
        if (tv) {
            const tabLayout = <org.nativescript.widgets.TabLayout>tv.getParent();
            tabLayout.updateItemAt(this.index, this.tabItemSpec);
        }
    }

    get [fontSizeProperty.native](): { nativeSize: number } {
        return { nativeSize: this.nativeView.getTextSize() };
    }
    set [fontSizeProperty.native](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this.nativeView.setTextSize(value);
        } else {
            this.nativeView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    get [fontInternalProperty.native](): android.graphics.Typeface {
        return this.nativeView.getTypeface();
    }
    set [fontInternalProperty.native](value: Font | android.graphics.Typeface) {
        this.nativeView.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    get [textTransformProperty.native](): TextTransform {
        return "none";
    }
    set [textTransformProperty.native](value: TextTransform) {
        const tv = this.nativeView;
        const result = getTransformedText(this.title, value);
        tv.setText(result);
    }
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

    public onItemsChanged(oldItems: TabViewItem[], newItems: TabViewItem[]): void {
        super.onItemsChanged(oldItems, newItems);

        if (oldItems) {
            oldItems.forEach((item: TabViewItem, i, arr) => {
                item.index = 0;
                item.tabItemSpec = null;
                item.setNativeView(null);
            });
        }
    }

    public _createNativeView() {
        initializeNativeClasses();
        if (traceEnabled()) {
            traceWrite("TabView._createUI(" + this + ");", traceCategory);
        }

        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

        this._tabLayout = new org.nativescript.widgets.TabLayout(this._context);
        this._grid.addView(this._tabLayout);

        this.setElevation();

        const accentColor = getDefaultAccentColor(this._context);
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

        this._pageChagedListener = new PageChangedListener(this);
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
        items.forEach((item, i, arr) => {
            const tabItemSpec = createTabItemSpec(item);
            item.index = i;
            item.tabItemSpec = tabItemSpec;
            tabItems.push(tabItemSpec);
        });

        // TODO: optimize by reusing the adapter and calling setAdapter(null) then the same adapter.
        this._pagerAdapter = new PagerAdapter(this, items);
        this._viewPager.setAdapter(this._pagerAdapter);

        const tabLayout = this._tabLayout;
        tabLayout.setItems(tabItems, this._viewPager);
        items.forEach((item, i, arr) => {
            const tv = tabLayout.getTextViewForItemAt(i);
            item.setNativeView(tv);
        });
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
        if (traceEnabled()) {
            traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", true);", traceCategory);
        }
        this._viewPager.setCurrentItem(value, true);
    }

    get [itemsProperty.native](): TabViewItem[] {
        return null;
    }
    set [itemsProperty.native](value: TabViewItem[]) {
        this.setAdapter(value);
    }

    get [tabBackgroundColorProperty.native](): android.graphics.drawable.Drawable.ConstantState {
        return this._tabLayout.getBackground().getConstantState();
    }
    set [tabBackgroundColorProperty.native](value: android.graphics.drawable.Drawable.ConstantState | Color) {
        if (value instanceof Color) {
            this._tabLayout.setBackgroundColor(value.android);
        } else {
            this._tabLayout.setBackground(value.newDrawable());
        }
    }

    get [tabTextColorProperty.native](): number {
        return this._tabLayout.getTabTextColor();
    }
    set [tabTextColorProperty.native](value: number | Color) {
        let color = value instanceof Color ? value.android : value;
        this._tabLayout.setTabTextColor(color);
    }

    get [selectedTabTextColorProperty.native](): number {
        return this._tabLayout.getSelectedTabTextColor();
    }
    set [selectedTabTextColorProperty.native](value: number | Color) {
        let color = value instanceof Color ? value.android : value;
        this._tabLayout.setSelectedTabTextColor(color);
    }

    get [androidSelectedTabHighlightColorProperty.native](): number {
        return getDefaultAccentColor(this._context);
    }
    set [androidSelectedTabHighlightColorProperty.native](value: number | Color) {
        let tabLayout = this._tabLayout;
        let color = value instanceof Color ? value.android : value;
        tabLayout.setSelectedIndicatorColors([color]);
    }
}