// Types
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";

// Requires
import { selectedIndexProperty, itemsProperty, tabStripProperty } from "../tab-navigation-base/tab-navigation-base";
import { TabsBase, swipeEnabledProperty, offscreenTabLimitProperty } from "./tabs-common";
import { Frame } from "../frame";
import { fromFileOrResource } from "../../image-source";
import { RESOURCE_PREFIX, ad, layout } from "../../utils/utils";
import * as application from "../../application";

export * from "./tabs-common";

const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
    new(owner: Tabs): androidx.viewpager.widget.PagerAdapter;
}

const TABID = "_tabId";
const INDEX = "_index";
let PagerAdapter: PagerAdapter;

function makeFragmentName(viewId: number, id: number): string {
    return "android:viewpager:" + viewId + ":" + id;
}

function getTabById(id: number): Tabs {
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

    class TabFragmentImplementation extends org.nativescript.widgets.FragmentBase {
        private tab: Tabs;
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
            this.index = args.getInt(INDEX);
            if (!this.tab) {
                throw new Error(`Cannot find TabView`);
            }
        }

        public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            const tabItem = this.tab.items[this.index];

            return tabItem.view.nativeViewProtected;
        }
    }

    const POSITION_UNCHANGED = -1;
    const POSITION_NONE = -2;

    class FragmentPagerAdapter extends androidx.viewpager.widget.PagerAdapter {
        public items: Array<TabContentItem>;
        private mCurTransaction: androidx.fragment.app.FragmentTransaction;
        private mCurrentPrimaryItem: androidx.fragment.app.Fragment;

        constructor(public owner: Tabs) {
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

            return ""; // items[index].title;
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

            let fragment: androidx.fragment.app.Fragment = fragmentManager.findFragmentByTag(name);
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

            const fragment: androidx.fragment.app.Fragment = <androidx.fragment.app.Fragment>object;
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
            const fragment = <androidx.fragment.app.Fragment>object;
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
            return (<androidx.fragment.app.Fragment>object).getView() === view;
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

function createTabItemSpec(item: TabStripItem): org.nativescript.widgets.TabItemSpec {
    const result = new org.nativescript.widgets.TabItemSpec();
    result.title = item.title;

    if (item.iconSource) {
        if (item.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
            result.iconId = ad.resources.getDrawableId(item.iconSource.substr(RESOURCE_PREFIX.length));
            if (result.iconId === 0) {
                // TODO
                // traceMissingIcon(item.iconSource);
            }
        } else {
            const is = fromFileOrResource(item.iconSource);
            if (is) {
                // TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
                result.iconDrawable = new android.graphics.drawable.BitmapDrawable(application.android.context.getResources(), is.android);
            } else {
                // TODO
                // traceMissingIcon(item.iconSource);
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

function setElevation(grid: org.nativescript.widgets.GridLayout, tabLayout: org.nativescript.widgets.TabLayout) {
    const compat = <any>androidx.core.view.ViewCompat;
    if (compat.setElevation) {
        const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
        compat.setElevation(grid, val);
        compat.setElevation(tabLayout, val);
    }
}

export const tabs = new Array<WeakRef<Tabs>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
    const rangeStart = Math.max(0, index - eps);
    const rangeEnd = Math.min(index + eps, lastIndex);
    for (let i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}

export class Tabs extends TabsBase {
    private _tabLayout: org.nativescript.widgets.TabLayout;
    private _viewPager: androidx.viewpager.widget.ViewPager;
    private _pagerAdapter: androidx.viewpager.widget.PagerAdapter;
    private _androidViewId: number = -1;

    constructor() {
        super();
        tabs.push(new WeakRef(this));
    }

    get _hasFragments(): boolean {
        return true;
    }

    public onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void {
        super.onItemsChanged(oldItems, newItems);

        if (oldItems) {
            oldItems.forEach((item: TabContentItem, i, arr) => {
                (<any>item).index = 0;
                (<any>item).tabItemSpec = null;
                item.setNativeView(null);
            });
        }
    }

    public createNativeView() {
        initializeNativeClasses();
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView._createUI(" + this + ");", traceCategory);
        // }

        const context: android.content.Context = this._context;
        const nativeView = new org.nativescript.widgets.GridLayout(context);
        const viewPager = new org.nativescript.widgets.TabViewPager(context);
        const tabLayout = new org.nativescript.widgets.TabLayout(context);
        const lp = new org.nativescript.widgets.CommonLayoutParams();
        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        let accentColor = getDefaultAccentColor(context);

        lp.row = 1;

        if (this.tabsPosition === "top") {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

            viewPager.setLayoutParams(lp);
        } else {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

            tabLayout.setLayoutParams(lp);
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
        const offsideItems = this.offscreenTabLimit;

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
            (<Frame>selectedView)._pushInFrameStackRecursive();
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

        this.setItems((<any>this.items));
        this.setTabStripItems(this.tabStrip.items);

        // this.setAdapterItems(this.items);
    }

    public onUnloaded(): void {
        super.onUnloaded();

        this.setItems(null);
        this.setTabStripItems(null);

        // this.setAdapterItems(null);
    }

    public disposeNativeView() {
        this._tabLayout.setItems(null, null);
        (<any>this._pagerAdapter).owner = null;
        this._pagerAdapter = null;

        this._tabLayout = null;
        this._viewPager = null;
        super.disposeNativeView();
    }

    public _onRootViewReset(): void {
        super._onRootViewReset();
        
        // call this AFTER the super call to ensure descendants apply their rootview-reset logic first
        // i.e. in a scenario with tab frames let the frames cleanup their fragments first, and then
        // cleanup the tab fragments to avoid
        // android.content.res.Resources$NotFoundException: Unable to find resource ID #0xfffffff6
        this.disposeCurrentFragments();
    }

    private disposeCurrentFragments(): void {
        const fragmentManager = this._getFragmentManager();
        const transaction = fragmentManager.beginTransaction();
        for (let fragment of (<Array<any>>fragmentManager.getFragments().toArray())) {
            transaction.remove(fragment);
        }
        transaction.commitNowAllowingStateLoss();
    }

    private shouldUpdateAdapter(items: Array<TabContentItem>) {
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
                return item._domId === currentItem._domId;
            })[0];
        });

        // if both are Arrays and length matches, but not all items are the same, should update
        if (matchingItems.length !== items.length) {
            return true;
        }

        // if both are Arrays and length matches and all items are the same, should not update
        return false;
    }

    private setItems(items: Array<TabContentItem>) {
        if (this.shouldUpdateAdapter(items)) {
            (<any>this._pagerAdapter).items = items;
            this._pagerAdapter.notifyDataSetChanged();
        }
    }

    private setTabStripItems(items: Array<TabStripItem>) {
        const length = items ? items.length : 0;
        if (length === 0) {
            this._tabLayout.setItems(null, null);

            return;
        }

        const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
        items.forEach((item: TabStripItem, i, arr) => {
            const tabItemSpec = createTabItemSpec(item);
            (<any>item).index = i;
            (<any>item).tabItemSpec = tabItemSpec;
            tabItems.push(tabItemSpec);
        });

        const tabLayout = this._tabLayout;
        tabLayout.setItems(tabItems, this._viewPager);
        items.forEach((item, i, arr) => {
            const tv = tabLayout.getTextViewForItemAt(i);
            item.setNativeView(tv);
        });
    }

    // private setAdapterItems(items: Array<TabStripItem>) {
    //     if (this.shouldUpdateAdapter(items)) {
    //         (<any>this._pagerAdapter).items = items;

    //         const length = items ? items.length : 0;
    //         if (length === 0) {
    //             this._tabLayout.setItems(null, null);
    //             this._pagerAdapter.notifyDataSetChanged();
    //             return;
    //         }

    //         const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
    //         items.forEach((item: TabStripItem, i, arr) => {
    //             const tabItemSpec = createTabItemSpec(item);
    //             (<any>item).index = i;
    //             (<any>item).tabItemSpec = tabItemSpec;
    //             tabItems.push(tabItemSpec);
    //         });

    //         const tabLayout = this._tabLayout;
    //         tabLayout.setItems(tabItems, this._viewPager);
    //         items.forEach((item, i, arr) => {
    //             const tv = tabLayout.getTextViewForItemAt(i);
    //             item.setNativeView(tv);
    //         });

    //         this._pagerAdapter.notifyDataSetChanged();
    //     }
    // }

    public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
        this._tabLayout.updateItemAt(index, spec);
    }

    [selectedIndexProperty.setNative](value: number) {
        const smoothScroll = true;

        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
        // }

        this._viewPager.setCurrentItem(value, smoothScroll);
    }

    [itemsProperty.getDefault](): TabContentItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabContentItem[]) {
        this.setItems(value);
        selectedIndexProperty.coerce(this);
    }

    [tabStripProperty.getDefault](): TabStrip {
        return null;
    }
    [tabStripProperty.setNative](value: TabStrip) {
        this.setTabStripItems(value.items);
    }

    [swipeEnabledProperty.getDefault](): boolean {
        // TODO: create native method and get native?
        return true;
    }
    [swipeEnabledProperty.setNative](value: boolean) {
        (<any>this._viewPager).setSwipePageEnabled(value);
    }

    [offscreenTabLimitProperty.getDefault](): number {
        return this._viewPager.getOffscreenPageLimit();
    }
    [offscreenTabLimitProperty.setNative](value: number) {
        this._viewPager.setOffscreenPageLimit(value);
    }
}
