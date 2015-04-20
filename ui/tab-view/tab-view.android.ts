import common = require("ui/tab-view/tab-view-common");
import definition = require("ui/tab-view");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import trace = require("trace");
import imageSource = require("image-source");
import types = require("utils/types");

var VIEWS_STATES = "_viewStates";

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class ViewPagerClass extends android.support.v4.view.ViewPager {
    private owner: TabView;

    constructor(ctx, owner: TabView) {
        super(ctx);

        this.owner = owner;
        return global.__native(this);
    }

    protected onVisibilityChanged(changedView: android.view.View, visibility: number) {
        super.onVisibilityChanged(changedView, visibility);

        this.owner._onVisibilityChanged(changedView, visibility);
    }
};

class PagerAdapterClass extends android.support.v4.view.PagerAdapter {
    private owner: TabView;
    private items: any;

    constructor(owner: TabView, items) {
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
        trace.write("TabView.PagerAdapter.instantiateItem; container: " + container + "; index: " + index, common.traceCategory);

        var item = this.items[index];
        if (item.view.parent !== this.owner) {
            this.owner._addView(item.view);
        }

        if (this[VIEWS_STATES]) {
            trace.write("TabView.PagerAdapter.instantiateItem; restoreHierarchyState: " + item.view, common.traceCategory);
            item.view.android.restoreHierarchyState(this[VIEWS_STATES]);
        }

        container.addView(item.view.android);
        return item.view.android;
    }

    destroyItem(container: android.view.ViewGroup, index: number, _object: any) {
        trace.write("TabView.PagerAdapter.destroyItem; container: " + container + "; index: " + index + "; _object: " + _object, common.traceCategory);
        var item = this.items[index];
        var nativeView = item.view.android;

        if (nativeView.toString() !== _object.toString()) {
            throw new Error("Expected " + nativeView.toString() + " to equal " + _object.toString());
        }

        if (!this[VIEWS_STATES]) {
            this[VIEWS_STATES] = new android.util.SparseArray<android.os.Parcelable>();
        }
        nativeView.saveHierarchyState(this[VIEWS_STATES]);

        container.removeView(nativeView);

        // Note: this.owner._removeView will clear item.view.android.
        // So call this after the native instance is removed form the container. 
        if (item.view.parent === this.owner) {
            this.owner._removeView(item.view);
        }
    }

    isViewFromObject(view: android.view.View, _object: any) {
        return view === _object;
    }

    saveState(): android.os.Parcelable {
        trace.write("TabView.PagerAdapter.saveState", common.traceCategory);

        var owner: TabView = this.owner;
        if (!owner || owner._childrenCount === 0) {
            return null;
        }

        if (!this[VIEWS_STATES]) {
            this[VIEWS_STATES] = new android.util.SparseArray<android.os.Parcelable>();
        }
        var viewStates = this[VIEWS_STATES];
        var childCallback = function (view: view.View): boolean {
            var nativeView: android.view.View = view.android;
            if (nativeView && nativeView.isSaveFromParentEnabled && nativeView.isSaveFromParentEnabled()) {
                nativeView.saveHierarchyState(viewStates);
            }
            return true;
        }
        owner._eachChildView(childCallback);

        var bundle = new android.os.Bundle();
        bundle.putSparseParcelableArray(VIEWS_STATES, viewStates);
        return bundle;
    }

    restoreState(state: android.os.Parcelable, loader: java.lang.ClassLoader) {
        trace.write("TabView.PagerAdapter.restoreState", common.traceCategory);
        var bundle: android.os.Bundle = <android.os.Bundle>state;
        bundle.setClassLoader(loader);
        this[VIEWS_STATES] = bundle.getSparseParcelableArray(VIEWS_STATES);
    }
};

export class TabView extends common.TabView {
    private _android: android.support.v4.view.ViewPager;
    private _pagerAdapter: android.support.v4.view.PagerAdapter;
    private _tabListener: android.app.ActionBar.TabListener;
    private _pageChangeListener: android.support.v4.view.ViewPager.OnPageChangeListener;
    private _originalActionBarNavigationMode: number;
    private _originalActionBarIsShowing: boolean;
    private _listenersSuspended = false;
    private _tabsAddedByMe = new Array<android.app.ActionBar.Tab>();
    private _tabsCache = {};
    private _androidViewId: number;
    private _iconsCache = {};

    constructor() {
        super();

        var that = new WeakRef(this);

        this._tabListener = new android.app.ActionBar.TabListener({
            get owner() {
                return that.get();
            },

            onTabSelected: function (tab: android.app.ActionBar.Tab, transaction) {
                var owner = this.owner;
                if (!owner) {
                    return;
                }

                if (owner._listenersSuspended || !owner.isLoaded) {
                    // Don't touch the selectedIndex property if the control is not yet loaded
                    // or if we are currently rebinding it -- i.e. _removeTabs and _addTabs.
                    return;
                }

                var index = owner._tabsCache[tab.hashCode()];
                trace.write("TabView.TabListener.onTabSelected(" + index + ");", common.traceCategory);
                owner.selectedIndex = index;
            },
            onTabUnselected: function (tab: android.app.ActionBar.Tab, transaction) {
                //
            },
            onTabReselected: function (tab: android.app.ActionBar.Tab, transaction) {
                //
            }
        });

        this._pageChangeListener = new android.support.v4.view.ViewPager.OnPageChangeListener({
            get owner() {
                return that.get();
            },

            onPageSelected: function (index: number) {
                var owner = this.owner;
                if (!owner) {
                    return;
                }

                if (owner._listenersSuspended || !owner.isLoaded) {
                    // Don't touch the selectedIndex property if the control is not yet loaded
                    // or if we are currently rebinding it -- i.e. _removeTabs and _addTabs.
                    return;
                }

                trace.write("TabView.OnPageChangeListener.onPageSelected(" + index + ");", common.traceCategory);
                owner.selectedIndex = index;
            },
            onPageScrollStateChanged: function (state: number) {
                //
            },
            onPageScrolled: function (index: number, offset: number, offsetPixels: number) {
                //
            }
        });
    }

    get android(): android.support.v4.view.ViewPager {
        return this._android;
    }

    public _createUI() {
        trace.write("TabView._createUI(" + this._android + ");", common.traceCategory);

        this._android = new ViewPagerClass(this._context, this);

        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);

        this._android.setOnPageChangeListener(this._pageChangeListener);
    }

    /* tslint:disable */
    public _onVisibilityChanged(changedView: android.view.View, visibility: number) {
        /* tslint:enable */
        trace.write("TabView._onVisibilityChanged:" + this.android + " isShown():" + this.android.isShown(), common.traceCategory);

        if (this.isLoaded && this.android && this.android.isShown()) {
            this._addTabsIfNeeded();
            this._setNativeSelectedIndex(this.selectedIndex);
        }
        else {
            // Remove the tabs from the ActionBar only when navigating away from a cached page containing a TabView.
            if (TabView._isProxyOfOrDescendantOfNativeView(this, changedView)) {
                this._removeTabsIfNeeded();
            }
            // If the application is being brought to the background (i.e. minimized with the Home Button) we do not need to remove anything.
        }
    }

    private static _isProxyOfOrDescendantOfNativeView(view: view.View, nativeView: android.view.View): boolean {
        if (view.android === nativeView) {
            return true;
        }

        if (!view.parent) {
            return false;
        }

        return TabView._isProxyOfOrDescendantOfNativeView(view.parent, nativeView);
    }

    public _onAttached(context: android.content.Context) {
        trace.write("TabView._onAttached(" + context + ");", common.traceCategory);
        super._onAttached(context);
    }

    public _onDetached(force?: boolean) {
        trace.write("TabView._onDetached(" + force + ");", common.traceCategory);
        super._onDetached(force);
    }

    public onLoaded() {
        trace.write("TabView.onLoaded(); selectedIndex: " + this.selectedIndex +"; items: " + this.items + ";", common.traceCategory);
        super.onLoaded();

        // If we are loading a TabView inside a hidden fragment this check will prevent it from polluting the action bar.
        if (this.android && this.android.isShown()) {
            this._addTabsIfNeeded();
            this._setNativeSelectedIndex(this.selectedIndex);
        }
    }

    public onUnloaded() {
        trace.write("TabView.onUnloaded();", common.traceCategory);
        this._removeTabsIfNeeded();
        super.onUnloaded();
    }

    private _addTabsIfNeeded() {
        if (this.items && this.items.length > 0 && this._tabsAddedByMe.length === 0) {
            this._listenersSuspended = true;
            this._addTabs(this.items);
            this._listenersSuspended = false;
        }
    }

    private _removeTabsIfNeeded() {
        if (this._tabsAddedByMe.length > 0) {
            this._listenersSuspended = true;
            this._removeTabs(this.items);
            this._listenersSuspended = false;
        }
    }

    public _onItemsPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        trace.write("TabView._onItemsPropertyChangedSetNativeValue(" + data.oldValue + " ---> " + data.newValue + ");", common.traceCategory);

        this._listenersSuspended = true;

        if (data.oldValue) {
            this._removeTabs(data.oldValue);
            this._unsetAdapter();
        }

        if (data.newValue) {
            this._addTabs(data.newValue);
            this._setAdapter(data.newValue);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);

        this._listenersSuspended = false;
    }

    private _setAdapter(items) {
        this._pagerAdapter = new PagerAdapterClass(this, items);
        this._android.setAdapter(this._pagerAdapter);
    }

    private _unsetAdapter() {
        if (this._pagerAdapter) {
            this._android.setAdapter(null);
            this._pagerAdapter = null;
        }
    }

    public _addTabs(newItems: Array<definition.TabViewItem>) {
        trace.write("TabView._addTabs(" + newItems + ");", common.traceCategory);
        super._addTabs(newItems);

        var actionBar = this._getActionBar();
        if (!actionBar) {
            return;
        }

        if (this._tabsAddedByMe.length > 0) {
            throw new Error("TabView has already added its tabs to the ActionBar.");
        }

        // Save the original navigation mode so we can restore it later.
        this._originalActionBarNavigationMode = actionBar.getNavigationMode();

        // Tell the action-bar to display tabs.
        actionBar.setNavigationMode(android.app.ActionBar.NAVIGATION_MODE_TABS);

        this._originalActionBarIsShowing = actionBar.isShowing();
        actionBar.show();

        // TODO: Where will be the support for more ActionBar settings like Title, Navigation buttons, etc.?
        var i: number = 0;
        var length = newItems.length;
        var item: definition.TabViewItem;
        var tab: android.app.ActionBar.Tab;

        for (i; i < length; i++) {
            item = newItems[i];
            tab = actionBar.newTab();
            tab.setText(item.title);
            this._setIcon(item.iconSource, tab);

            tab.setTabListener(this._tabListener);

            actionBar.addTab(tab);
            this._tabsCache[tab.hashCode()] = i;
            this._tabsAddedByMe.push(tab);
        }
    }

    private _setIcon(iconSource: string, tab: android.app.ActionBar.Tab): void {
        if (!iconSource) {
            return;
        }
        
        var drawable: android.graphics.drawable.BitmapDrawable;
        drawable = this._iconsCache[iconSource];
        if (!drawable) {
            var is = imageSource.fromFileOrResource(iconSource);
            if (is) {
                drawable = new android.graphics.drawable.BitmapDrawable(is.android);
                this._iconsCache[iconSource] = drawable;
            }
        }
        
        if (drawable) {
            tab.setIcon(drawable);
        }
    }

    public _removeTabs(oldItems: Array<definition.TabViewItem>) {
        trace.write("TabView._removeTabs(" + oldItems + ");", common.traceCategory);
        super._removeTabs(oldItems);

        var actionBar = this._getActionBar();
        if (!actionBar) {
            return;
        }

        // Remove all the existing tabs added by this instance
        var i: number = actionBar.getTabCount() - 1;
        var tab: android.app.ActionBar.Tab;
        var index;
        for (i; i >= 0; i--) {
            tab = actionBar.getTabAt(i);
            index = this._tabsAddedByMe.indexOf(tab);
            if (index > -1) {// This tab was added by me.
                actionBar.removeTabAt(i);
                tab.setTabListener(null);
                delete this._tabsCache[tab.hashCode()];
                this._tabsAddedByMe.splice(index, 1);// Remove the tab from this._tabsAddedByMe
            }
        }

        if (this._tabsAddedByMe.length > 0) {
            throw new Error("TabView did not remove all of its tabs from the ActionBar.");
        }

        if (this._originalActionBarNavigationMode !== undefined) {
            actionBar.setNavigationMode(this._originalActionBarNavigationMode);
        }

        if (!this._originalActionBarIsShowing) {
            actionBar.hide();
        }
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        trace.write("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + data.oldValue + " ---> " + data.newValue + ");", common.traceCategory);
        super._onSelectedIndexPropertyChangedSetNativeValue(data);
        
        this._setNativeSelectedIndex(data.newValue);
    }

    private _setNativeSelectedIndex(index: number) {
        if (types.isNullOrUndefined(index)) {
            return;
        }

        // Select the respective tab in the ActionBar.
        var actionBar = this._getActionBar();
        if (actionBar) {
            var actionBarSelectedIndex = actionBar.getSelectedNavigationIndex();
            if (actionBarSelectedIndex !== index) {
                trace.write("TabView actionBar.setSelectedNavigationItem("+index+")", common.traceCategory);
                actionBar.setSelectedNavigationItem(index);
            }
        }

        // Select the respective page in the ViewPager
        var viewPagerSelectedIndex = this._android.getCurrentItem();
        if (viewPagerSelectedIndex !== index) {
            trace.write("TabView this._android.setCurrentItem("+index+", true);", common.traceCategory);
            this._android.setCurrentItem(index, true);
        }
    }

    public _loadEachChildView() {
        // Do nothing here, since the children will be loaded and 
        // attached when PageAdapter.instantiateItem is called by Android.
    }

    public _unloadEachChildView() {
        // Do nothing here, since the children will be unloaded and 
        // detached when PageAdapter.destroyItem is called by Android.
    }

    private _getActionBar(): android.app.ActionBar {
        if (!this._android) {
            // TODO: We may have the ActionBar not enabled as a Window feature. We may extend the control to support custom tabs through the PageTabStrip component.
            return undefined;
        }

        var activity = <android.app.Activity>this._android.getContext();
        return activity.getActionBar();
    }
} 