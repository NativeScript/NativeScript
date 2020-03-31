// Types
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";

// Requires
import * as application from "../../application";
import { ad, layout } from "../../utils/utils";
import { Color } from "../core/view";
import { offscreenTabLimitProperty, swipeEnabledProperty, TabsBase } from "./tabs-common.android";
export * from "./tabs-common";

const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

const TABID = "_tabId";
const INDEX = "_index";

interface PagerAdapter {
    new(owner: Tabs): androidx.viewpager.widget.PagerAdapter;
}

let PagerAdapter: PagerAdapter;
let TabsBar: any;
let appResources: android.content.res.Resources;

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
        private owner: Tabs;
        private index: number;
        private backgroundBitmap: android.graphics.Bitmap = null;

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
            this.owner = getTabById(args.getInt(TABID));
            this.index = args.getInt(INDEX);
            if (!this.owner) {
                throw new Error(`Cannot find TabView`);
            }
        }

        public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            const tabItem = this.owner.items[this.index];

            return tabItem.nativeViewProtected;
        }

        public onDestroyView() {
            const hasRemovingParent = this.getRemovingParentFragment();

            // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
            // TODO: Consider removing it when update to androidx.fragment:1.2.0
            if (hasRemovingParent && this.owner.selectedIndex === this.index) {
                const bitmapDrawable = new android.graphics.drawable.BitmapDrawable(appResources, this.backgroundBitmap);
                this.owner._originalBackground = this.owner.backgroundColor || new Color("White");
                this.owner.nativeViewProtected.setBackgroundDrawable(bitmapDrawable);
                this.backgroundBitmap = null;
            }

            super.onDestroyView();
        }

        public onPause(): void {
            const hasRemovingParent = this.getRemovingParentFragment();

            // Get view as bitmap and set it as background. This is workaround for the disapearing nested fragments.
            // TODO: Consider removing it when update to androidx.fragment:1.2.0
            if (hasRemovingParent && this.owner.selectedIndex === this.index) {
                this.backgroundBitmap = this.loadBitmapFromView(this.owner.nativeViewProtected);
            }

            super.onPause();
        }

        private loadBitmapFromView(view: android.view.View): android.graphics.Bitmap {
            // Another way to get view bitmap. Test performance vs setDrawingCacheEnabled
            // const width = view.getWidth();
            // const height = view.getHeight();
            // const bitmap = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.ARGB_8888);
            // const canvas = new android.graphics.Canvas(bitmap);
            // view.layout(0, 0, width, height);
            // view.draw(canvas);

            view.setDrawingCacheEnabled(true);
            const bitmap = android.graphics.Bitmap.createBitmap(view.getDrawingCache());
            view.setDrawingCacheEnabled(false);

            return bitmap;
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

    class TabsBarImplementation extends org.nativescript.widgets.TabsBar {

        constructor(context: android.content.Context, public owner: Tabs) {
            super(context);

            return global.__native(this);
        }

        public onSelectedPositionChange(position: number, prevPosition: number): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }

            const tabStripItems = owner.tabStrip && owner.tabStrip.items;

            if (position >= 0 && tabStripItems && tabStripItems[position]) {
                tabStripItems[position]._emit(TabStripItem.selectEvent);
                owner._setItemColor(tabStripItems[position]);
            }

            if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
                tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
                owner._setItemColor(tabStripItems[prevPosition]);
            }
        }

        public onTap(position: number): boolean {
            const owner = this.owner;
            if (!owner) {
                return false;
            }

            const tabStrip = owner.tabStrip;
            const tabStripItems = tabStrip && tabStrip.items;

            if (position >= 0 && tabStripItems[position]) {
                tabStripItems[position]._emit(TabStripItem.tapEvent);
                tabStrip.notify({ eventName: TabStrip.itemTapEvent, object: tabStrip, index: position });
            }

            if (!owner.items[position]) {
                return false;
            }

            return true;
        }
    }

    PagerAdapter = FragmentPagerAdapter;
    TabsBar = TabsBarImplementation;
    appResources = application.android.context.getResources();
}

let defaultAccentColor: number = undefined;
function getDefaultAccentColor(context: android.content.Context): number {
    if (defaultAccentColor === undefined) {
        //Fallback color: https://developer.android.com/samples/SlidingTabsColors/src/com.example.android.common/view/SlidingTabStrip.html
        defaultAccentColor = ad.resources.getPaletteColor(ACCENT_COLOR, context) || 0xFF33B5E5;
    }

    return defaultAccentColor;
}

function setElevation(grid: org.nativescript.widgets.GridLayout, tabsBar: org.nativescript.widgets.TabsBar, tabsPosition: string) {
    const compat = <any>androidx.core.view.ViewCompat;
    if (compat.setElevation) {
        const val = DEFAULT_ELEVATION * layout.getDisplayDensity();

        if (tabsPosition === "top") {
            compat.setElevation(grid, val);
        }

        compat.setElevation(tabsBar, val);
    }
}

export const tabs = new Array<WeakRef<Tabs>>();

export class Tabs extends TabsBase {
    private _viewPager: androidx.viewpager.widget.ViewPager;
    private _pagerAdapter: androidx.viewpager.widget.PagerAdapter;

    constructor() {
        super();
        tabs.push(new WeakRef(this));
    }

    get _hasFragments(): boolean {
        return true;
    }

    public getTabsBar(): org.nativescript.widgets.TabsBar {
        return <org.nativescript.widgets.TabsBar>(<any>this).nativeBar;
    }

    protected setNativeItems(items: Array<org.nativescript.widgets.TabItemSpec>) {
        this.getTabsBar().setItems(items, items ? this._viewPager : null);
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
        const tabsBar = new TabsBar(context, this);
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

            tabsBar.setLayoutParams(lp);
        }

        nativeView.addView(viewPager);
        (<any>nativeView).viewPager = viewPager;

        const adapter = new PagerAdapter(this);
        viewPager.setAdapter(adapter);
        (<any>viewPager).adapter = adapter;

        nativeView.addView(tabsBar);
        (<any>nativeView).tabsBar = tabsBar;

        setElevation(nativeView, tabsBar, this.tabsPosition);

        if (accentColor) {
            tabsBar.setSelectedIndicatorColors([accentColor]);
        }

        if (primaryColor) {
            tabsBar.setBackgroundColor(primaryColor);
        }

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();

        const viewPager = (<any>this.nativeViewProtected).viewPager;
        viewPager.setId(this._contentViewId);
        this._viewPager = viewPager;
        this._pagerAdapter = (<any>viewPager).adapter;
        (<any>this._pagerAdapter).owner = this;
    }

    protected getOffscreenTabLimit(): number {
        return this.offscreenTabLimit;
    }

    public onLoaded(): void {
        super.onLoaded();

        this.setItems((<any>this.items));

        if (this.tabStrip) {
            this.setTabStripItems(this.tabStrip.items);
        }

        // this.setAdapterItems(this.items);
    }

    public disposeNativeView() {
        this.setNativeItems(null);
        (<any>this._pagerAdapter).owner = null;
        this._pagerAdapter = null;

        this.nativeBar = null;
        this._viewPager = null;
        super.disposeNativeView();
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

    protected setItems(items: Array<TabContentItem>) {
        if (this.shouldUpdateAdapter(items)) {
            (<any>this._pagerAdapter).items = items;

            if (items && items.length) {
                items.forEach((item: TabContentItem, i) => {
                    (<any>item).index = i;
                });
            }

            this._pagerAdapter.notifyDataSetChanged();
        }
    }

    public getTabBarHighlightColor(): number {
        return getDefaultAccentColor(this._context);
    }

    public setTabBarHighlightColor(value: number | Color) {
        const color = value instanceof Color ? value.android : value;
        this.getTabsBar().setSelectedIndicatorColors([color]);
    }

    protected setSelectedItem(value: number) {
        const smoothScroll = true;

        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
        // }

        this._viewPager.setCurrentItem(value, smoothScroll);
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