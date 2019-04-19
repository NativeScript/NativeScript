import { TabContentItem as TabContentItemDefinition } from ".";
import { Font } from "../styling/font";

import {
    TabNavigationBase, TabContentItemBase, itemsProperty, selectedIndexProperty,
    // tabTextColorProperty, tabBackgroundColorProperty, tabTextFontSizeProperty, selectedTabTextColorProperty,
    // androidSelectedTabHighlightColorProperty, androidOffscreenTabLimitProperty,
    fontSizeProperty, fontInternalProperty, layout, traceCategory, traceEnabled,
    traceWrite, Color, traceMissingIcon, TabStripItem
} from "./bottom-navigation-common"
import { textTransformProperty, TextTransform, getTransformedText } from "../text-base";
import { fromFileOrResource } from "../../image-source";
import { RESOURCE_PREFIX, ad } from "../../utils/utils";
import { Frame } from "../frame";

export * from "./bottom-navigation-common";

const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 8;

const TABID = "_tabId";
const INDEX = "_index";
let TabFragment: any;
let BottomNavigationBar: any;

function makeFragmentName(viewId: number, id: number): string {
    return "android:viewpager:" + viewId + ":" + id;
}

function getTabById(id: number): BottomNavigation {
    const ref = tabs.find(ref => {
        const tab = ref.get();
        return tab && tab._domId === id;
    });

    return ref && ref.get();
}

function initializeNativeClasses() {
    if (BottomNavigationBar) {
        return;
    }

    class TabFragmentImplementation extends org.nativescript.widgets.FragmentBase {
        private tab: BottomNavigation;
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
    }

    class BottomNavigationBarImplementation extends org.nativescript.widgets.BottomNavigationBar {

        constructor(context: android.content.Context, public owner: BottomNavigation) {
            super(context);
            return global.__native(this);
        }

        public onSelectedPositionChange(position: number): void {
            this.owner.changeTab(position);
            this.owner.selectedIndex = position;
        }
    }    

    TabFragment = TabFragmentImplementation;
    BottomNavigationBar = BottomNavigationBarImplementation;
}

function createTabItemSpec(item: TabContentItem, tabStripItem: TabStripItem): org.nativescript.widgets.TabItemSpec {
    const result = new org.nativescript.widgets.TabItemSpec();
    result.title = tabStripItem.title; // "test"; // tabStripItem.label.text;

    if (tabStripItem.iconSource) {
        if (tabStripItem.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
            result.iconId = ad.resources.getDrawableId(tabStripItem.iconSource.substr(RESOURCE_PREFIX.length));
            if (result.iconId === 0) {
                traceMissingIcon(tabStripItem.iconSource);
            }
        } else {
            const is = fromFileOrResource(tabStripItem.iconSource);
            if (is) {
                // TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
                result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
            } else {
                traceMissingIcon(tabStripItem.iconSource);
            }
        }
    }

    // result.iconDrawable = null; // tabStripItem.image.android;

    return result;
}

export class TabContentItem extends TabContentItemBase {
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
        (<TabContentItemDefinition>this).canBeLoaded = false;
    }

    public createNativeView() {
        return this.nativeViewProtected;
    }

    public _update(): void {
        // const tv = this.nativeViewProtected;
        // const tabView = this.parent as BottomNavigation;
        // if (tv && tabView) {
        //     this.tabItemSpec = createTabItemSpec(this);
        //     tabView.updateAndroidItemAt(this.index, this.tabItemSpec);
        // }
    }

    public _getChildFragmentManager(): android.support.v4.app.FragmentManager {
        const tabView = this.parent as BottomNavigation;
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
}

function setElevation(grid: org.nativescript.widgets.GridLayout, bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar) {
    const compat = <any>android.support.v4.view.ViewCompat;
    if (compat.setElevation) {
        const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
        compat.setElevation(grid, val);
        compat.setElevation(bottomNavigationBar, val);
    }
}

export const tabs = new Array<WeakRef<BottomNavigation>>();

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
    const rangeStart = Math.max(0, index - eps);
    const rangeEnd = Math.min(index + eps, lastIndex);
    for (let i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}

export class BottomNavigation extends TabNavigationBase {
    private _contentView: org.nativescript.widgets.ContentLayout;
    private _contentViewId: number = -1;
    private _bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar;
    private _currentFragment: android.support.v4.app.Fragment;

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

        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));

        // CONTENT VIEW
        const contentView = new org.nativescript.widgets.ContentLayout(this._context);
        const contentViewLP = new org.nativescript.widgets.CommonLayoutParams();
        contentViewLP.row = 0;
        contentView.setLayoutParams(contentViewLP);
        nativeView.addView(contentView);
        (<any>nativeView).contentView = contentView;

        // TABSTRIP
        const bottomNavigationBar = new BottomNavigationBar(context, this);
        const bottomNavigationBarLP = new org.nativescript.widgets.CommonLayoutParams();
        bottomNavigationBarLP.row = 1;
        bottomNavigationBar.setLayoutParams(bottomNavigationBarLP);
        nativeView.addView(bottomNavigationBar);
        (<any>nativeView).bottomNavigationBar = bottomNavigationBar;

        setElevation(nativeView, bottomNavigationBar);
        
        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        if (primaryColor) {
            bottomNavigationBar.setBackgroundColor(primaryColor);
        }

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this._contentViewId < 0) {
            this._contentViewId = android.view.View.generateViewId();
        }

        const nativeView: any = this.nativeViewProtected;
        this._contentView = (<any>nativeView).contentView;
        this._contentView.setId(this._contentViewId);
        this._bottomNavigationBar = (<any>nativeView).bottomNavigationBar;
        (<any>this._bottomNavigationBar).owner = this;
    }

    public _loadUnloadTabItems(newIndex: number) {
        const items = this.items;
        const lastIndex = this.items.length - 1;
        const offsideItems = 0; // this.androidTabsPosition === "top" ? this.androidOffscreenTabLimit : 1;

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
        this._bottomNavigationBar.setItems(null);
        // this._tabLayout.setItems(null, null);
        // (<any>this._pagerAdapter).owner = null;
        // this._pagerAdapter = null;

        // this._tabLayout = null;
        // this._viewPager = null;
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

    public changeTab(index: number) {
        const containerView = this._contentView;
        const fragmentManager = this._getFragmentManager();
        const transaction = fragmentManager.beginTransaction();

        if (this._currentFragment) {
            const fragment = this._currentFragment;
            transaction.detach(fragment);

            if (this._currentFragment === fragment) {
                this._currentFragment = null;
            }

            // const tabItems = this.owner.items;
            // const tabItem = tabItems ? tabItems[position] : null;
            // if (tabItem) {
            //     tabItem.canBeLoaded = false;
            // }
        }

        const name = makeFragmentName(containerView.getId(), index);

        let fragment: android.support.v4.app.Fragment = fragmentManager.findFragmentByTag(name);
        if (fragment != null) {
            transaction.attach(fragment);
        } else {
            fragment = TabFragment.newInstance(this._domId, index);
            transaction.add(containerView.getId(), fragment, name);
        }

        this._currentFragment = fragment;

        // if (fragment !== this.mCurrentPrimaryItem) {
        //     fragment.setMenuVisibility(false);
        //     fragment.setUserVisibleHint(false);
        // }

        const tabItems = this.items;
        const tabItem = tabItems ? tabItems[index] : null;
        if (tabItem) {
            tabItem.canBeLoaded = true;
            this._loadUnloadTabItems(index);
        }

        transaction.commitNowAllowingStateLoss();
    }

    private shouldUpdateAdapter(items: Array<TabContentItemDefinition>) {
        return true;

        // if (!this._pagerAdapter) {
        //     return false;
        // }

        // const currentPagerAdapterItems = (<any>this._pagerAdapter).items;

        // // if both values are null, should not update
        // if (!items && !currentPagerAdapterItems) {
        //     return false;
        // }

        // // if one value is null, should update
        // if (!items || !currentPagerAdapterItems) {
        //     return true;
        // }

        // // if both are Arrays but length doesn't match, should update
        // if (items.length !== currentPagerAdapterItems.length) {
        //     return true;
        // }

        // const matchingItems = currentPagerAdapterItems.filter((currentItem) => {
        //     return !!items.filter((item) => {
        //         return item._domId === currentItem._domId
        //     })[0];
        // });

        // // if both are Arrays and length matches, but not all items are the same, should update
        // if (matchingItems.length !== items.length) {
        //     return true;
        // }

        // // if both are Arrays and length matches and all items are the same, should not update
        // return false;
    }

    private setAdapterItems(items: Array<TabContentItemDefinition>) {
        if (this.shouldUpdateAdapter(items)) {
            // (<any>this._pagerAdapter).items = items;

            const length = items ? items.length : 0;
            if (length === 0) {
                this._bottomNavigationBar.setItems(null);
                // this._tabLayout.setItems(null, null);
                // this._pagerAdapter.notifyDataSetChanged();
                return;
            }

            const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
            items.forEach((item: TabContentItem, i, arr) => {
                const tabItemSpec = createTabItemSpec(item, this.tabStrip.items[i]);
                item.index = i;
                item.tabItemSpec = tabItemSpec;
                tabItems.push(tabItemSpec);
            });

            // const tabLayout = this._tabLayout;
            // tabLayout.setItems(tabItems, this._viewPager);
            this._bottomNavigationBar.setItems(tabItems);
            // items.forEach((item, i, arr) => {
            //     const tv = tabLayout.getTextViewForItemAt(i);
            //     item.setNativeView(tv);
            // });

            // this._pagerAdapter.notifyDataSetChanged();
        }
    }

    public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
        this._bottomNavigationBar.updateItemAt(index, spec);
    }

    [selectedIndexProperty.setNative](value: number) {
        const smoothScroll = false; // this.androidTabsPosition === "top";

        if (traceEnabled()) {
            traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
        }

        this._bottomNavigationBar.setSelectedPosition(value);
    }

    [itemsProperty.getDefault](): TabContentItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabContentItem[]) {
        this.setAdapterItems(value);
        selectedIndexProperty.coerce(this);
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
