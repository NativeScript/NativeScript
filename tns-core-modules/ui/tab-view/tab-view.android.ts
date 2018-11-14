import { TabViewItem as TabViewItemDefinition } from ".";
import { Font } from "../styling/font";

import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, tabTextFontSizeProperty, selectedTabTextColorProperty,
    androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty,
    fontSizeProperty, fontInternalProperty, layout, traceCategory, traceEnabled,
    traceWrite, Color, traceMissingIcon
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "../text-base";
import { fromFileOrResource } from "../../image-source";
import { RESOURCE_PREFIX, ad } from "../../utils/utils";
import { Frame } from "../frame";

export * from "./tab-view-common";

const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
    new(owner: TabView): android.support.v4.view.PagerAdapter;
}

const TABID = "_tabId";
const INDEX = "_index";
let PagerAdapter: PagerAdapter;

function makeFragmentName(viewId: number, id: number): string {
    return "android:viewpager:" + viewId + ":" + id;
}

function getTabById(id: number): TabView {
    const ref = tabs.find(ref => {
        const tab = ref.get();
        return tab && tab._domId === id;
    });

    return ref && ref.get();
}

function initializeNativeClasses() {
    if (PagerAdapter) {
        return;
    }

    class TabFragmentImplementation extends android.support.v4.app.Fragment {
        private tab: TabView;
        private index: number;

        constructor() {
            super();
            return global.__native(this);
        }

        static newInstance(tabId: number, index: number): TabFragmentImplementation {

            const args = new android.os.Bundle();
            args.putInt(TABID, tabId);
            args.putInt(INDEX, index);
            const fragment = new TabFragmentImplementation();
            fragment.setArguments(args);
            return fragment;
        }

        public onCreate(savedInstanceState: android.os.Bundle): void {
            super.onCreate(savedInstanceState);
            const args = this.getArguments();
            this.tab = getTabById(args.getInt(TABID));
            this.index = args.getInt(INDEX)
            if (!this.tab) {
                throw new Error(`Cannot find TabView`);
            }
        }

        public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            const tabItem = this.tab.items[this.index];

            return tabItem.view.nativeViewProtected;
        }

        public onDestroyView() {
            super.onDestroyView();
        }
    }

    const POSITION_UNCHANGED = -1;
    const POSITION_NONE = -2;

    class FragmentPagerAdapter extends android.support.v4.view.PagerAdapter {
        public items: Array<TabViewItemDefinition>;
        private mCurTransaction: android.support.v4.app.FragmentTransaction;
        private mCurrentPrimaryItem: android.support.v4.app.Fragment;

        constructor(public owner: TabView) {
            super();
            return global.__native(this);
        }

        getCount() {
            const items = this.items;
            return items ? items.length : 0;
        }

        getPageTitle(index: number) {
            const items = this.items;
            if (index < 0 || index >= items.length) {
                return "";
            }

            return items[index].title;
        }

        startUpdate(container: android.view.ViewGroup): void {
            if (container.getId() === android.view.View.NO_ID) {
                throw new Error(`ViewPager with adapter ${this} requires a view containerId`);
            }
        }

        instantiateItem(container: android.view.ViewGroup, position: number): java.lang.Object {
            const fragmentManager = this.owner._getFragmentManager();
            if (!this.mCurTransaction) {
                this.mCurTransaction = fragmentManager.beginTransaction();
            }

            const itemId = this.getItemId(position);
            const name = makeFragmentName(container.getId(), itemId);

            let fragment: android.support.v4.app.Fragment = fragmentManager.findFragmentByTag(name);
            if (fragment != null) {
                this.mCurTransaction.attach(fragment);
            } else {
                fragment = TabFragmentImplementation.newInstance(this.owner._domId, position);
                this.mCurTransaction.add(container.getId(), fragment, name);
            }

            if (fragment !== this.mCurrentPrimaryItem) {
                fragment.setMenuVisibility(false);
                fragment.setUserVisibleHint(false);
            }

            const tabItems = this.owner.items;
            const tabItem = tabItems ? tabItems[position] : null;
            if (tabItem) {
                tabItem.canBeLoaded = true;
            }

            return fragment;
        }

        getItemPosition(object: java.lang.Object): number {
            return this.items ? POSITION_UNCHANGED : POSITION_NONE;
        }

        destroyItem(container: android.view.ViewGroup, position: number, object: java.lang.Object): void {
            if (!this.mCurTransaction) {
                const fragmentManager = this.owner._getFragmentManager();
                this.mCurTransaction = fragmentManager.beginTransaction();
            }

            const fragment: android.support.v4.app.Fragment = <android.support.v4.app.Fragment>object;
            this.mCurTransaction.detach(fragment);

            if (this.mCurrentPrimaryItem === fragment) {
                this.mCurrentPrimaryItem = null;
            }

            const tabItems = this.owner.items;
            const tabItem = tabItems ? tabItems[position] : null;
            if (tabItem) {
                tabItem.canBeLoaded = false;
            }
        }

        setPrimaryItem(container: android.view.ViewGroup, position: number, object: java.lang.Object): void {
            const fragment = <android.support.v4.app.Fragment>object;
            if (fragment !== this.mCurrentPrimaryItem) {
                if (this.mCurrentPrimaryItem != null) {
                    this.mCurrentPrimaryItem.setMenuVisibility(false);
                    this.mCurrentPrimaryItem.setUserVisibleHint(false);
                }

                if (fragment != null) {
                    fragment.setMenuVisibility(true);
                    fragment.setUserVisibleHint(true);
                }

                this.mCurrentPrimaryItem = fragment;
                this.owner.selectedIndex = position;

                const tab = this.owner;
                const tabItems = tab.items;
                const newTabItem = tabItems ? tabItems[position] : null;

                if (newTabItem) {
                    tab._loadUnloadTabItems(tab.selectedIndex);
                }
            }
        }

        finishUpdate(container: android.view.ViewGroup): void {
            this._commitCurrentTransaction();
        }

        isViewFromObject(view: android.view.View, object: java.lang.Object): boolean {
            return (<android.support.v4.app.Fragment>object).getView() === view;
        }

        saveState(): android.os.Parcelable {
            // Commit the current transaction on save to prevent "No view found for id 0xa" exception on restore.
            // Related to: https://github.com/NativeScript/NativeScript/issues/6466
            this._commitCurrentTransaction();
            return null;
        }

        restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader): void {
            //
        }

        getItemId(position: number): number {
            return position;
        }

        private _commitCurrentTransaction() {
            if (this.mCurTransaction != null) {
                this.mCurTransaction.commitNowAllowingStateLoss();
                this.mCurTransaction = null;
            }
        }
    }
    
    PagerAdapter = FragmentPagerAdapter;
}

function createTabItemSpec(item: TabViewItem): org.nativescript.widgets.TabItemSpec {
    const result = new org.nativescript.widgets.TabItemSpec();
    result.title = item.title;

    if (item.iconSource) {
        if (item.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
            result.iconId = ad.resources.getDrawableId(item.iconSource.substr(RESOURCE_PREFIX.length));
            if (result.iconId === 0) {
                traceMissingIcon(item.iconSource);
            }
        } else {
            const is = fromFileOrResource(item.iconSource);
            if (is) {
                // TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
                result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
            } else {
                traceMissingIcon(item.iconSource);
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

    get _hasFragments(): boolean {
        return true;
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this.nativeViewProtected) {
            this._defaultTransformationMethod = this.nativeViewProtected.getTransformationMethod();
        }
    }

    public onLoaded(): void {
        super.onLoaded();
    }

    public resetNativeView(): void {
        super.resetNativeView();
        if (this.nativeViewProtected) {
            // We reset it here too because this could be changed by multiple properties - whiteSpace, secure, textTransform
            this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
        }
    }

    public disposeNativeView(): void {
        super.disposeNativeView();
        (<TabViewItemDefinition>this).canBeLoaded = false;
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

    public _getChildFragmentManager(): android.support.v4.app.FragmentManager {
        const tabView = this.parent as TabView;
        let tabFragment = null;
        const fragmentManager = tabView._getFragmentManager();
        for (let fragment of (<Array<any>>fragmentManager.getFragments().toArray())) {
            if (fragment.index === this.index) {
                tabFragment = fragment;
                break;
            }
        }

        // TODO: can happen in a modal tabview scenario when the modal dialog fragment is already removed
        if (!tabFragment) {
            if (traceEnabled()) {
                traceWrite(`Could not get child fragment manager for tab item with index ${this.index}`, traceCategory);
            }

            return (<any>tabView)._getRootFragmentManager();
        }

        return tabFragment.getChildFragmentManager();
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

export const tabs = new Array<WeakRef<TabView>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
    const rangeStart = Math.max(0, index - eps);
    const rangeEnd = Math.min(index + eps, lastIndex);
    for (let i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}

export class TabView extends TabViewBase {
    private _tabLayout: org.nativescript.widgets.TabLayout;
    private _viewPager: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _androidViewId: number = -1;

    constructor() {
        super();
        tabs.push(new WeakRef(this));
    }

    get _hasFragments(): boolean {
        return true;
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

    public createNativeView() {
        initializeNativeClasses();
        if (traceEnabled()) {
            traceWrite("TabView._createUI(" + this + ");", traceCategory);
        }

        const context: android.content.Context = this._context;
        const nativeView = new org.nativescript.widgets.GridLayout(context);
        const viewPager = new org.nativescript.widgets.TabViewPager(context);
        const tabLayout = new org.nativescript.widgets.TabLayout(context);
        const lp = new org.nativescript.widgets.CommonLayoutParams();
        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        let accentColor = getDefaultAccentColor(context);

        lp.row = 1;

        if (this.androidTabsPosition === "top") {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

            viewPager.setLayoutParams(lp);
        } else {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

            tabLayout.setLayoutParams(lp);
            viewPager.setSwipePageEnabled(false);
            // set completely transparent accent color for tab selected indicator.
            accentColor = 0x00FFFFFF;
        }

        nativeView.addView(viewPager);
        (<any>nativeView).viewPager = viewPager;

        const adapter = new PagerAdapter(this);
        viewPager.setAdapter(adapter);
        (<any>viewPager).adapter = adapter;

        nativeView.addView(tabLayout);
        (<any>nativeView).tabLayout = tabLayout;

        setElevation(nativeView, tabLayout);

        if (accentColor) {
            tabLayout.setSelectedIndicatorColors([accentColor]);
        }

        if (primaryColor) {
            tabLayout.setBackgroundColor(primaryColor);
        }

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
        this._pagerAdapter = (<any>viewPager).adapter;
        (<any>this._pagerAdapter).owner = this;
    }

    public _loadUnloadTabItems(newIndex: number) {
        const items = this.items;
        const lastIndex = this.items.length - 1;
        const offsideItems = this.androidTabsPosition === "top" ? this.androidOffscreenTabLimit : 1;

        let toUnload = [];
        let toLoad = [];

        iterateIndexRange(newIndex, offsideItems, lastIndex, (i) => toLoad.push(i));

        items.forEach((item, i) => {
            const indexOfI = toLoad.indexOf(i);
            if (indexOfI < 0) {
                toUnload.push(i);
            }
        });

        toUnload.forEach(index => {
            const item = items[index];
            if (items[index]) {
                item.unloadView(item.view);
            }
        });

        const newItem = items[newIndex];
        const selectedView = newItem && newItem.view;
        if (selectedView instanceof Frame) {
            selectedView._pushInFrameStackRecursive();
        }

        toLoad.forEach(index => {
            const item = items[index];
            if (this.isLoaded && items[index]) {
                item.loadView(item.view);
            }
        });
    }

    public onLoaded(): void {
        super.onLoaded();

        this.setAdapterItems(this.items);
    }

    public onUnloaded(): void {
        super.onUnloaded();

        this.setAdapterItems(null);
    }

    public disposeNativeView() {
        this._tabLayout.setItems(null, null);
        (<any>this._pagerAdapter).owner = null;
        this._pagerAdapter = null;

        this._tabLayout = null;
        this._viewPager = null;
        super.disposeNativeView();
    }

    public onBackPressed(): boolean {
        const currentView = this._selectedView;
        if (currentView) {
            return currentView.onBackPressed();
        }

        return false;
    }

    public _onRootViewReset(): void {
        this.disposeCurrentFragments();
        super._onRootViewReset();
    }

    private disposeCurrentFragments(): void {
        const fragmentManager = this._getFragmentManager();
        const transaction = fragmentManager.beginTransaction();
        for (let fragment of (<Array<any>>fragmentManager.getFragments().toArray())) {
            transaction.remove(fragment);
        }
        transaction.commitNowAllowingStateLoss();
    }

    private shouldUpdateAdapter(items: Array<TabViewItemDefinition>) {
        if (!this._pagerAdapter) {
            return false;
        }

        const currentPagerAdapterItems = (<any>this._pagerAdapter).items;

        // if both values are null, should not update
        if (!items && !currentPagerAdapterItems) {
            return false;
        }

        // if one value is null, should update
        if (!items || !currentPagerAdapterItems) {
            return true;
        }

        // if both are Arrays but length doesn't match, should update
        if (items.length !== currentPagerAdapterItems.length) {
            return true;
        }

        const matchingItems = currentPagerAdapterItems.filter((currentItem) => {
            return !!items.filter((item) => {
                return item._domId === currentItem._domId
            })[0];
        });

        // if both are Arrays and length matches, but not all items are the same, should update
        if (matchingItems.length !== items.length) {
            return true;
        }

        // if both are Arrays and length matches and all items are the same, should not update
        return false;
    }

    private setAdapterItems(items: Array<TabViewItemDefinition>) {
        if (this.shouldUpdateAdapter(items)) {
            (<any>this._pagerAdapter).items = items;

            const length = items ? items.length : 0;
            if (length === 0) {
                this._tabLayout.setItems(null, null);
                this._pagerAdapter.notifyDataSetChanged();
                return;
            }

            const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
            items.forEach((item: TabViewItem, i, arr) => {
                const tabItemSpec = createTabItemSpec(item);
                item.index = i;
                item.tabItemSpec = tabItemSpec;
                tabItems.push(tabItemSpec);
            });

            const tabLayout = this._tabLayout;
            tabLayout.setItems(tabItems, this._viewPager);
            items.forEach((item, i, arr) => {
                const tv = tabLayout.getTextViewForItemAt(i);
                item.setNativeView(tv);
            });

            this._pagerAdapter.notifyDataSetChanged();
        }
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

    [tabTextFontSizeProperty.getDefault](): number {
        return this._tabLayout.getTabTextFontSize();
    }
    [tabTextFontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this._tabLayout.setTabTextFontSize(value);
        } else {
            this._tabLayout.setTabTextFontSize(value.nativeSize);
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
