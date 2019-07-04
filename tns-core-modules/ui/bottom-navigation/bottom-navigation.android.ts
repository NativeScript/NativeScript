// Types
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TextTransform } from "../text-base";

// Requires
import { TabNavigationBase, itemsProperty, selectedIndexProperty, tabStripProperty } from "../tab-navigation-base/tab-navigation-base";
import { Font } from "../styling/font";
import { getTransformedText } from "../text-base";
import { CSSType, Color } from "../core/view";
import { Frame } from "../frame";
import { RESOURCE_PREFIX, ad, layout } from "../../utils/utils";
import { fromFileOrResource } from "../../image-source";
// TODO: Impl trace
// import { isEnabled as traceEnabled, write as traceWrite } from "../../../trace";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 8;

const TABID = "_tabId";
const INDEX = "_index";
let TabFragment: any;
let BottomNavigationBar: any;

function makeFragmentName(viewId: number, id: number): string {
    return "android:bottomnavigation:" + viewId + ":" + id;
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
            this.index = args.getInt(INDEX);
            if (!this.tab) {
                throw new Error(`Cannot find BottomNavigation`);
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

        public onSelectedPositionChange(position: number, prevPosition: number): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }

            owner.changeTab(position);
            if (position !== prevPosition) {
                const tabStripItems = owner.tabStrip && owner.tabStrip.items;

                if (position >= 0 && tabStripItems && tabStripItems[position]) {
                    tabStripItems[position]._emit(TabStripItem.selectEvent);
                }

                if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
                    tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
                }

                owner.selectedIndex = position;
            }
        }

        public onTap(position: number): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }

            const tabStripItems = owner.tabStrip && owner.tabStrip.items;

            if (position >= 0 && tabStripItems[position]) {
                tabStripItems[position]._emit(TabStripItem.tapEvent);
            }
        }
    }

    TabFragment = TabFragmentImplementation;
    BottomNavigationBar = BottomNavigationBarImplementation;
}

function createTabItemSpec(tabStripItem: TabStripItem): org.nativescript.widgets.TabItemSpec {
    const result = new org.nativescript.widgets.TabItemSpec();
    result.title = tabStripItem.title;

    if (tabStripItem.backgroundColor) {
        if (tabStripItem.backgroundColor instanceof Color) {
            result.backgroundColor = tabStripItem.backgroundColor.android;
        }
    }

    if (tabStripItem.iconSource) {
        if (tabStripItem.iconSource.indexOf(RESOURCE_PREFIX) === 0) {
            result.iconId = ad.resources.getDrawableId(tabStripItem.iconSource.substr(RESOURCE_PREFIX.length));
            if (result.iconId === 0) {
                // TODO:
                // traceMissingIcon(tabStripItem.iconSource);
            }
        } else {
            const is = fromFileOrResource(tabStripItem.iconSource);
            if (is) {
                // TODO: Make this native call that accepts string so that we don't load Bitmap in JS.
                // tslint:disable-next-line:deprecation
                result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
            } else {
                // TODO:
                // traceMissingIcon(tabStripItem.iconSource);
            }
        }
    }

    return result;
}

function setElevation(grid: org.nativescript.widgets.GridLayout, bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar) {
    const compat = <any>androidx.core.view.ViewCompat;
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

@CSSType("BottomNavigation")
export class BottomNavigation extends TabNavigationBase {
    private _contentView: org.nativescript.widgets.ContentLayout;
    private _contentViewId: number = -1;
    private _bottomNavigationBar: org.nativescript.widgets.BottomNavigationBar;
    private _currentFragment: androidx.fragment.app.Fragment;

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
        // if (traceEnabled()) {
        //     traceWrite("BottomNavigation._createUI(" + this + ");", traceCategory);
        // }

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
        const offsideItems = 0;

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

        this.changeTab(this.selectedIndex);
        this.setTabStripItems();
    }

    public onUnloaded(): void {
        super.onUnloaded();

        this.setTabStripItems();
    }

    public disposeNativeView() {
        this._bottomNavigationBar.setItems(null);
        this._bottomNavigationBar = null;

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
        // this is the case when there are no items
        if (index === -1) {
            return;
        }

        const containerView = this._contentView;
        const fragmentManager = this._getFragmentManager();
        const transaction = fragmentManager.beginTransaction();

        if (this._currentFragment) {
            const fragment = this._currentFragment;
            transaction.detach(fragment);

            if (this._currentFragment === fragment) {
                this._currentFragment = null;
            }
        }

        const name = makeFragmentName(containerView.getId(), index);

        let fragment: androidx.fragment.app.Fragment = fragmentManager.findFragmentByTag(name);
        if (fragment != null) {
            transaction.attach(fragment);
        } else {
            fragment = TabFragment.newInstance(this._domId, index);
            transaction.add(containerView.getId(), fragment, name);
        }

        this._currentFragment = fragment;

        const tabItems = this.items;
        const tabItem = tabItems ? tabItems[index] : null;
        if (tabItem) {
            tabItem.canBeLoaded = true;
            this._loadUnloadTabItems(index);
        }

        transaction.commitNowAllowingStateLoss();
    }

    private setTabStripItems() {
        if (this.tabStrip && this.tabStrip.items) {
            const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
            this.tabStrip.items.forEach((item, i, arr) => {
                (<any>item).index = i;
                if (this.tabStrip.items[i]) {
                    const tabItemSpec = createTabItemSpec(this.tabStrip.items[i]);
                    tabItems.push(tabItemSpec);
                }
            });

            this._bottomNavigationBar.setItems(tabItems);
            this.tabStrip.setNativeView(this._bottomNavigationBar);
            this.tabStrip.items.forEach((item, i, arr) => {
                const tv = this._bottomNavigationBar.getTextViewForItemAt(i);
                item.setNativeView(tv);
            });
        } else {
            this._bottomNavigationBar.setItems(null);
        }
    }

    public updateAndroidItemAt(index: number, spec: org.nativescript.widgets.TabItemSpec) {
        this._bottomNavigationBar.updateItemAt(index, spec);
    }

    public getTabBarBackgroundColor(): android.graphics.drawable.Drawable {
        return this._bottomNavigationBar.getBackground();
    }

    public setTabBarBackgroundColor(value: android.graphics.drawable.Drawable | Color): void {
        if (value instanceof Color) {
            this._bottomNavigationBar.setBackgroundColor(value.android);
        } else {
            this._bottomNavigationBar.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources));
        }
    }

    public getTabBarColor(): number {
        return this._bottomNavigationBar.getTabTextColor();
    }

    public setTabBarColor(value: number | Color): void {
        if (value instanceof Color) {
            this._bottomNavigationBar.setTabTextColor(value.android);
            this._bottomNavigationBar.setSelectedTabTextColor(value.android);
        } else {
            this._bottomNavigationBar.setTabTextColor(value);
            this._bottomNavigationBar.setSelectedTabTextColor(value);
        }
    }

    public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: android.graphics.drawable.Drawable | Color): void {
        // TODO: Should figure out a way to do it directly with the the nativeView
        const tabStripItemIndex = this.tabStrip.items.indexOf(tabStripItem);
        const tabItemSpec = createTabItemSpec(tabStripItem);
        this.updateAndroidItemAt(tabStripItemIndex, tabItemSpec);
    }

    public getTabBarItemColor(tabStripItem: TabStripItem): number {
        return tabStripItem.nativeViewProtected.getCurrentTextColor();
    }

    public setTabBarItemColor(tabStripItem: TabStripItem, value: number | Color): void {
        if (typeof value === "number") {
            tabStripItem.nativeViewProtected.setTextColor(value);
        } else {
            tabStripItem.nativeViewProtected.setTextColor(value.android);
        }
    }

    public getTabBarItemFontSize(tabStripItem: TabStripItem): { nativeSize: number } {
        return { nativeSize: tabStripItem.nativeViewProtected.getTextSize() };
    }

    public setTabBarItemFontSize(tabStripItem: TabStripItem, value: number | { nativeSize: number }): void {
        if (typeof value === "number") {
            tabStripItem.nativeViewProtected.setTextSize(value);
        } else {
            tabStripItem.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    public getTabBarItemFontInternal(tabStripItem: TabStripItem): android.graphics.Typeface {
        return tabStripItem.nativeViewProtected.getTypeface();
    }

    public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: Font | android.graphics.Typeface): void {
        tabStripItem.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    private _defaultTransformationMethod: android.text.method.TransformationMethod;

    public getTabBarItemTextTransform(tabStripItem: TabStripItem): "default" {
        return "default";
    }

    public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: TextTransform | "default"): void {
        const tv = tabStripItem.nativeViewProtected;

        this._defaultTransformationMethod = this._defaultTransformationMethod || tv.getTransformationMethod();

        if (value === "default") {
            tv.setTransformationMethod(this._defaultTransformationMethod);
            tv.setText(tabStripItem.title);
        } else {
            const result = getTransformedText(tabStripItem.title, value);
            tv.setText(result);
            tv.setTransformationMethod(null);
        }
    }

    [selectedIndexProperty.setNative](value: number) {
        // const smoothScroll = false;

        // if (traceEnabled()) {
        //     traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", " + smoothScroll + ");", traceCategory);
        // }

        this._bottomNavigationBar.setSelectedPosition(value);
    }

    [itemsProperty.getDefault](): TabContentItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabContentItem[]) {
        if (value) {
            value.forEach((item: TabContentItem, i) => {
                (<any>item).index = i;
            });
        }

        selectedIndexProperty.coerce(this);
    }

    [tabStripProperty.getDefault](): TabStrip {
        return null;
    }
    [tabStripProperty.setNative](value: TabStrip) {
        this.setTabStripItems();
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
