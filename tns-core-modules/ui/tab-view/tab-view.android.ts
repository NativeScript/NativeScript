import { Font } from "../styling/font";

import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, selectedTabTextColorProperty,
    androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty,
    fontSizeProperty, fontInternalProperty, View, layout,
    traceCategory, traceEnabled, traceWrite, Color
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "../text-base";
import { fromFileOrResource } from "../../image-source";
import { RESOURCE_PREFIX, ad } from "../../utils/utils";

export * from "./tab-view-common";

const VIEWS_STATES = "_viewStates";
const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
    new(owner: TabView, items: Array<TabViewItem>): android.support.v4.view.PagerAdapter;
}

interface PageChangedListener {
    new(owner: TabView): android.support.v4.view.ViewPager.SimpleOnPageChangeListener;
}

let PagerAdapter: PagerAdapter;
let PageChangedListener: PageChangedListener;

function initializeNativeClasses() {
    if (PagerAdapter) {
        return;
    }

    class PagerAdapterImpl extends android.support.v4.view.PagerAdapter {
        constructor(public owner: TabView, public items: Array<TabViewItem>) {
            super();
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

            const item = this.items[index];
            if (this[VIEWS_STATES]) {
                if (traceEnabled()) {
                    traceWrite("TabView.PagerAdapter.instantiateItem; restoreHierarchyState: " + item.view, traceCategory);
                }
                item.view.nativeViewProtected.restoreHierarchyState(this[VIEWS_STATES]);
            }

            if (item.view.nativeViewProtected) {
                container.addView(item.view.nativeViewProtected);
            }

            return item.view.nativeViewProtected;
        }

        destroyItem(container: android.view.ViewGroup, index: number, nativeView: android.view.View) {
            if (traceEnabled()) {
                traceWrite("TabView.PagerAdapter.destroyItem; container: " + container + "; index: " + index + "; nativeView: " + nativeView, traceCategory);
            }

            if (!nativeView) {
                return;
            }

            container.removeView(nativeView);

            // Note: this.owner._removeView will clear item.view.nativeView.
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
            // no owner could happen when tabView was shown as modal.
            if (!owner || owner._childrenCount === 0) {
                return null;
            }

            if (!this[VIEWS_STATES]) {
                this[VIEWS_STATES] = new android.util.SparseArray<android.os.Parcelable>();
            }

            const viewStates = this[VIEWS_STATES];
            const childCallback = function (view: View): boolean {
                const nativeView: android.view.View = view.nativeViewProtected;
                if (nativeView && nativeView.isSaveFromParentEnabled()) {
                    nativeView.saveHierarchyState(viewStates);
                }
                return true;
            }

            owner.eachChildView(childCallback);

            const bundle = new android.os.Bundle();
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
        defaultAccentColor = ad.resources.getPaletteColor(ACCENT_COLOR, context) || 0xFF33B5E5;
    }
    return defaultAccentColor;
}

export class TabViewItem extends TabViewItemBase {
    nativeViewProtected: android.widget.TextView;
    public tabItemSpec: org.nativescript.widgets.TabItemSpec;
    public index: number;
    private _defaultTransformationMethod: android.text.method.TransformationMethod;

    public initNativeView(): void {
        super.initNativeView();
        if (this.nativeViewProtected) {
            this._defaultTransformationMethod = this.nativeViewProtected.getTransformationMethod();
        }
    }

    public resetNativeView(): void {
        super.resetNativeView();
        if (this.nativeViewProtected) {
            // We reset it here too because this could be changed by multiple properties - whiteSpace, secure, textTransform
            this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
        }
    }

    public createNativeView() {
        return this.nativeViewProtected;
    }

    public _update(): void {
        const tv = this.nativeViewProtected;
        const tabView = this.parent as TabView;
        if (tv && tabView) {
            this.tabItemSpec = createTabItemSpec(this);
            tabView.updateAndroidItemAt(this.index, this.tabItemSpec);
        }
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        return { nativeSize: this.nativeViewProtected.getTextSize() };
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this.nativeViewProtected.setTextSize(value);
        } else {
            this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    [fontInternalProperty.getDefault](): android.graphics.Typeface {
        return this.nativeViewProtected.getTypeface();
    }
    [fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
        this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    [textTransformProperty.getDefault](): "default" {
        return "default";
    }
    [textTransformProperty.setNative](value: TextTransform | "default") {
        const tv = this.nativeViewProtected;
        if (value === "default") {
            tv.setTransformationMethod(this._defaultTransformationMethod);
            tv.setText(this.title);
        } else {
            const result = getTransformedText(this.title, value);
            tv.setText(result);
            tv.setTransformationMethod(null);
        }
    }
}

function setElevation(grid: org.nativescript.widgets.GridLayout, tabLayout: org.nativescript.widgets.TabLayout) {
    const compat = <any>android.support.v4.view.ViewCompat;
    if (compat.setElevation) {
        const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
        compat.setElevation(grid, val);
        compat.setElevation(tabLayout, val);
    }
}

export class TabView extends TabViewBase {

    private _tabLayout: org.nativescript.widgets.TabLayout;
    private _viewPager: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _androidViewId: number = -1;

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

    public createNativeView() {
        initializeNativeClasses();
        if (traceEnabled()) {
            traceWrite("TabView._createUI(" + this + ");", traceCategory);
        }

        const context: android.content.Context = this._context;
        const nativeView = new org.nativescript.widgets.GridLayout(context);
        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

        const tabLayout = new org.nativescript.widgets.TabLayout(context);
        nativeView.addView(tabLayout);
        (<any>nativeView).tabLayout = tabLayout;

        setElevation(nativeView, tabLayout);

        const accentColor = getDefaultAccentColor(context);
        if (accentColor) {
            tabLayout.setSelectedIndicatorColors([accentColor]);
        }

        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        if (primaryColor) {
            tabLayout.setBackgroundColor(primaryColor);
        }

        const viewPager = new android.support.v4.view.ViewPager(context);
        const lp = new org.nativescript.widgets.CommonLayoutParams();
        lp.row = 1;
        viewPager.setLayoutParams(lp);
        nativeView.addView(viewPager);
        (<any>nativeView).viewPager = viewPager;

        const listener = new PageChangedListener(this);
        (<any>viewPager).addOnPageChangeListener(listener);
        (<any>viewPager).listener = listener;

        const adapter = new PagerAdapter(this, null);
        viewPager.setAdapter(adapter);
        (<any>viewPager).adapter = adapter;

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }

        const nativeView: any = this.nativeViewProtected;
        this._tabLayout = (<any>nativeView).tabLayout;

        const viewPager = (<any>nativeView).viewPager;
        viewPager.setId(this._androidViewId);
        this._viewPager = viewPager;
        (<any>viewPager).listener.owner = this;

        this._pagerAdapter = (<any>viewPager).adapter;
        (<any>this._pagerAdapter).owner = this;
    }

    public disposeNativeView() {
        this._pagerAdapter.notifyDataSetChanged();
        (<any>this._pagerAdapter).owner = null;
        this._pagerAdapter = null;

        this._tabLayout = null;
        (<any>this._viewPager).listener.owner = null;
        this._viewPager = null;
        super.disposeNativeView();
    }

    private setAdapterItems(items: Array<TabViewItem>) {
        (<any>this._pagerAdapter).items = items;

        const length = items ? items.length : 0;
        if (length === 0) {
            this._tabLayout.setItems(null, null);
            this._pagerAdapter.notifyDataSetChanged();
            return;
        }

        const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
        items.forEach((item, i, arr) => {
            const tabItemSpec = createTabItemSpec(item);
            item.index = i;
            item.tabItemSpec = tabItemSpec;
            tabItems.push(tabItemSpec);
        });

        // // TODO: optimize by reusing the adapter and calling setAdapter(null) then the same adapter.
        // this._pagerAdapter = new PagerAdapter(this, items);
        // this._viewPager.setAdapter(this._pagerAdapter);

        const tabLayout = this._tabLayout;
        tabLayout.setItems(tabItems, this._viewPager);
        items.forEach((item, i, arr) => {
            const tv = tabLayout.getTextViewForItemAt(i);
            item.setNativeView(tv);
        });

        this._pagerAdapter.notifyDataSetChanged();
    }

    public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
        this._tabLayout.updateItemAt(index, spec);
    }

    [androidOffscreenTabLimitProperty.getDefault](): number {
        return this._viewPager.getOffscreenPageLimit();
    }
    [androidOffscreenTabLimitProperty.setNative](value: number) {
        this._viewPager.setOffscreenPageLimit(value);
    }

    [selectedIndexProperty.setNative](value: number) {
        if (traceEnabled()) {
            traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", true);", traceCategory);
        }

        this._viewPager.setCurrentItem(value, true);
    }

    [itemsProperty.getDefault](): TabViewItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabViewItem[]) {
        this.setAdapterItems(value);
        selectedIndexProperty.coerce(this);
    }

    [tabBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable {
        return this._tabLayout.getBackground();
    }
    [tabBackgroundColorProperty.setNative](value: android.graphics.drawable.Drawable | Color) {
        if (value instanceof Color) {
            this._tabLayout.setBackgroundColor(value.android);
        } else {
            this._tabLayout.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources));
        }
    }

    [tabTextColorProperty.getDefault](): number {
        return this._tabLayout.getTabTextColor();
    }
    [tabTextColorProperty.setNative](value: number | Color) {
        const color = value instanceof Color ? value.android : value;
        this._tabLayout.setTabTextColor(color);
    }

    [selectedTabTextColorProperty.getDefault](): number {
        return this._tabLayout.getSelectedTabTextColor();
    }
    [selectedTabTextColorProperty.setNative](value: number | Color) {
        const color = value instanceof Color ? value.android : value;
        this._tabLayout.setSelectedTabTextColor(color);
    }

    [androidSelectedTabHighlightColorProperty.getDefault](): number {
        return getDefaultAccentColor(this._context);
    }
    [androidSelectedTabHighlightColorProperty.setNative](value: number | Color) {
        let tabLayout = this._tabLayout;
        const color = value instanceof Color ? value.android : value;
        tabLayout.setSelectedIndicatorColors([color]);
    }
}

function tryCloneDrawable(value: android.graphics.drawable.Drawable, resources: android.content.res.Resources): android.graphics.drawable.Drawable {
    if (value) {
        const constantState = value.getConstantState();
        if (constantState) {
            return constantState.newDrawable(resources);
        }
    }

    return value;
}