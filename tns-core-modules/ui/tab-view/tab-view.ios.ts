import { TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty, selectedColorProperty, tabsBackgroundColorProperty, traceCategory } from "./tab-view-common"
import { View, colorProperty, fontInternalProperty, layout } from "ui/core/view";
import { Color } from "color";
import { Font } from "ui/styling/font";
import { fromFileOrResource } from "image-source";
import { Page } from "ui/page";
import { ios } from "utils/utils";
import { enabled as traceEnabled, write as traceWrite, categories as traceCategories } from "trace";

import getter = ios.getter;

export * from "./tab-view-common";

class UITabBarControllerImpl extends UITabBarController {

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UITabBarControllerImpl {
        let handler = <UITabBarControllerImpl>UITabBarControllerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public viewDidLayoutSubviews(): void {
        if (traceEnabled) {
            traceWrite("TabView.UITabBarControllerClass.viewDidLayoutSubviews();", traceCategories.Debug);
        }
        super.viewDidLayoutSubviews();
        let owner = this._owner.get();
        if (owner && owner.isLoaded) {
            owner._updateLayout();
        }
    }
}

class UITabBarControllerDelegateImpl extends NSObject implements UITabBarControllerDelegate {
    public static ObjCProtocols = [UITabBarControllerDelegate];

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UITabBarControllerDelegateImpl {
        let delegate = <UITabBarControllerDelegateImpl>UITabBarControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public tabBarControllerShouldSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): boolean {
        if (traceEnabled) {
            traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        }

        let owner = this._owner.get();
        if (owner) {
            // "< More" cannot be visible after clicking on the main tab bar buttons.
            let backToMoreWillBeVisible = false;
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }

        return true;
    }

    public tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): void {
        if (traceEnabled) {
            traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        }

        let owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    }
}

class UINavigationControllerDelegateImpl extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UINavigationControllerDelegateImpl {
        let delegate = <UINavigationControllerDelegateImpl>UINavigationControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        if (traceEnabled) {
            traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        }

        let owner = this._owner.get();
        if (owner) {
            // If viewController is one of our tab item controllers, then "< More" will be visible shortly.
            // Otherwise viewController is the UIMoreListController which shows the list of all tabs beyond the 4th tab.
            let backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
    }

    navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        if (traceEnabled) {
            traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        }
        // We don't need Edit button in More screen.
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        let owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    }
}

function updateItemTitlePosition(tabBarItem: UITabBarItem): void {
    if (typeof (<any>tabBarItem).setTitlePositionAdjustment === "function") {
        (<any>tabBarItem).setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
    }
    else {
        tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
    }
}

export class TabViewItem extends TabViewItemBase {
    public _controller: UIViewController;
    public _parent: TabView;

    public _update() {
        if (this._parent && this._controller) {
            const icon = this._parent._getIcon(this.iconSource);
	    //TODO: Implement initWithSystemItem to support standard system icons
            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((this.title || ""), icon, this._parent.items.indexOf(this));
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }

            const states = getTitleAttributesForStates(this._parent);
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
            this._controller.tabBarItem = tabBarItem;
        }
    }
}

function selectedColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    const tabView = <TabView>data.object;
    tabView._updateIOSTabBarColorsAndFonts();
}
(<proxy.PropertyMetadata>common.TabView.selectedColorProperty.metadata).onSetNativeValue = selectedColorPropertyChanged;

function tabsBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    const tabView = <TabView>data.object;
    if (data.newValue instanceof color.Color) {
        tabView.ios.tabBar.barTintColor = data.newValue.ios;
    }
}
(<proxy.PropertyMetadata>common.TabView.tabsBackgroundColorProperty.metadata).onSetNativeValue = tabsBackgroundColorPropertyChanged;

export class TabView extends TabViewBase {
    public _ios: UITabBarControllerImpl;
    private _delegate: UITabBarControllerDelegateImpl;
    private _moreNavigationControllerDelegate: UINavigationControllerDelegateImpl;
    private _tabBarHeight: number = 0;
    private _navBarHeight: number = 0;
    private _iconsCache = {};

    constructor() {
        super();

        this._ios = UITabBarControllerImpl.initWithOwner(new WeakRef(this));
        this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(this));
        this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(this));
        //This delegate is set on the last line of _addTabs method.
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        this._ios.moreNavigationController.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITabBarController {
        return this._ios;
    }

    get _nativeView(): UIView {
        return this._ios.view;
    }

    public _onViewControllerShown(viewController: UIViewController) {
        // This method could be called with the moreNavigationController or its list controller, so we have to check.
        if (traceEnabled) {
            traceWrite("TabView._onViewControllerShown(" + viewController + ");", traceCategories.Debug);
        }
        if (this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        }
        else {
            if (traceEnabled) {
                traceWrite("TabView._onViewControllerShown: viewController is not one of our viewControllers", traceCategories.Debug);
            }
        }
    }

    private _actionBarHiddenByTabView: boolean;
    public _handleTwoNavigationBars(backToMoreWillBeVisible: boolean) {
        if (traceEnabled) {
            traceWrite(`TabView._handleTwoNavigationBars(backToMoreWillBeVisible: ${backToMoreWillBeVisible})`, traceCategories.Debug);
        }

        // The "< Back" and "< More" navigation bars should not be visible simultaneously.
        let page = <Page>this.page;
        let actionBarVisible = page.frame._getNavBarVisible(page);

        if (backToMoreWillBeVisible && actionBarVisible) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;
            if (traceEnabled) {
                traceWrite(`TabView hid action bar`, traceCategories.Debug);
            }
            return;
        }

        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;
            if (traceEnabled) {
                traceWrite(`TabView restored action bar`, traceCategories.Debug);
            }
            return;
        }
    }

    public _removeTabs(oldItems: Array<TabViewItem>) {
        if (traceEnabled) {
            traceWrite("TabView._removeTabs(" + oldItems + ");", traceCategories.Debug);
        }
        super._removeTabs(oldItems);

        for (let i = 0, length = oldItems.length; i < length; i++) {
            let oldItem = oldItems[i];
            oldItem._parent = null;
            oldItem._controller = null;
        }

        this._ios.viewControllers = null;
    }

    public _addTabs(newItems: Array<TabViewItem>) {
        if (traceEnabled) {
            traceWrite("TabView._addTabs(" + newItems + ");", traceCategories.Debug);
        }
        super._addTabs(newItems);

        const length = newItems.length;
        const newControllers: NSMutableArray<any> = NSMutableArray.alloc().initWithCapacity(length);
        const states = getTitleAttributesForStates(this);

        for (let i = 0; i < length; i++) {
            const item = <TabViewItem>newItems[i];
            let newController: UIViewController;

            if (item.view.ios instanceof UIViewController) {
                newController = <UIViewController>item.view.ios;
            } else {
                newController = UIViewController.new();
                newController.view.addSubview(item.view.ios);
            }

            item._parent = this;
            item._controller = newController;

            const icon = this._getIcon(item.iconSource);

            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);

            newController.tabBarItem = tabBarItem;
            newControllers.addObject(newController);
        }

        this._ios.viewControllers = newControllers;
        this._ios.customizableViewControllers = null;

        // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;

        if (this._ios.selectedIndex !== this.selectedIndex) {
            this._ios.selectedIndex = this.selectedIndex;
        }
    }

    private _iconRenderingMode: string;
    get iosIconRenderingMode(): string {
        return this._iconRenderingMode;
    }
    set iosIconRenderingMode(value: string) {
        if (this._iconRenderingMode !== value){
            this._iconRenderingMode = value;
            this._iconsCache = {};
            if (this.items && this.items.length){
                for (let i = 0, length = this.items.length; i < length; i++) {
                    if (this.items[i].iconSource) {
                        (<any>this.items[i])._update();
                    }
                }
            }
        }
    }

    private _getIconRenderingMode(): UIImageRenderingMode {
        switch(this._iconRenderingMode) {
            case "alwaysOriginal":
                return UIImageRenderingMode.AlwaysOriginal;
            case "alwaysTemplate":
                return UIImageRenderingMode.AlwaysTemplate;
            case "automatic":
            default:
                return UIImageRenderingMode.Automatic;
        }
    }

    public _getIcon(iconSource: string): UIImage {
        if (!iconSource) {
            return null;
        }

        let image: UIImage = this._iconsCache[iconSource];
        if (!image) {
            const is = fromFileOrResource(iconSource);
            if (is && is.ios) {
                const originalRenderedImage = is.ios.imageWithRenderingMode(this._getIconRenderingMode());
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            }
        }

        return image;
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChangedSetNativeValue(data);

        var newIndex = data.newValue;
        if (traceEnabled) {
            traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + newIndex + ")", traceCategories.Debug);
        }
        if (types.isNullOrUndefined(newIndex)) {
            return;
        }

        this._ios.selectedIndex = data.newValue;

        // We will need to measure and arrange what became this._selectedView
        this.requestLayout();

        var args = { eventName: TabView.selectedIndexChangedEvent, object: this, oldIndex: data.oldValue, newIndex: data.newValue };
        this.notify(args);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const nativeView = this._nativeView;
        if (nativeView) {

            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            this._tabBarHeight = TabView.measureHelper(this._ios.tabBar, width, widthMode, height, heightMode).height;
            let moreNavBarVisible = !!this._ios.moreNavigationController.navigationBar.window;
            this._navBarHeight = moreNavBarVisible ? TabView.measureHelper(this._ios.moreNavigationController.navigationBar, width, widthMode, height, heightMode).height : 0;

            const density = layout.getDisplayDensity();
            let measureWidth = 0;
            let measureHeight = 0;

            const child = this._selectedView;
            if (child) {
                const childHeightMeasureSpec = layout.makeMeasureSpec(height - this._navBarHeight - this._tabBarHeight, heightMode);
                const childSize = View.measureChild(this, child, widthMeasureSpec, childHeightMeasureSpec);

                measureHeight = childSize.measuredHeight;
                measureWidth = childSize.measuredWidth;
            }

            let style = this.style;
            measureWidth = Math.max(measureWidth, style.effectiveMinWidth * density);
            measureHeight = Math.max(measureHeight, style.effectiveMinHeight * density);

            const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        const child = this._selectedView;
        if (child) {
            View.layoutChild(this, child, 0, this._navBarHeight, right, (bottom - this._navBarHeight - this._tabBarHeight));
        }
    }

    private static measureHelper(nativeView: UIView, width: number, widthMode: number, height: number, heightMode: number): CGSize {
        return nativeView.sizeThatFits(CGSizeMake(
            (widthMode === layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : width,
            (heightMode === layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : height));
    }

    public _updateIOSTabBarColorsAndFonts(): void {
        if (!this.items) {
            return;
        }

        const tabBar = this.ios.tabBar;

        tabBar.tintColor = this.selectedColor ? this.selectedColor.ios : null;
        const states = getTitleAttributesForStates(this);

        for (let i = 0; i < tabBar.items.count; i++) {
            const item = <UITabBarItem>tabBar.items[i];
            item.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            item.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
        }
    }

    public _updateIOSTabBarTextTransform(newValue: string): void {
        if (!this.items) {
            return;
        }

        var tabBar = this.ios.tabBar;
        for (let i = 0; i < tabBar.items.count; i++) {
            let item = <UITabBarItem>tabBar.items[i];
            if (types.isNullOrUndefined(newValue)){
                // Reset to original
                item.title = this.items[i].title;
            }
            else {
                item.title = utils.ios.getTransformedText({text: this.items[i].title}, this.items[i].title, newValue);
            }
        }
    }
}

function getTitleAttributesForStates(tabView: TabView): { normalState: any, selectedState: any } {
    const normalState = {};
    if (tabView.tabTextColor instanceof Color) {
        normalState[UITextAttributeTextColor] = tabView.tabTextColor.ios;
    }

    const selectedState = {};
    if (tabView.selectedTabTextColor instanceof Color) {
        selectedState[UITextAttributeTextColor] = tabView.selectedTabTextColor.ios;
    }
    else {
        selectedState[UITextAttributeTextColor] = tabView.ios.tabBar.tintColor;
    }

    const defaultFont = UIFont.systemFontOfSize(10);
    const font = (<any>tabView.style)._fontInternal.getUIFont(defaultFont);
    normalState[NSFontAttributeName] = font;
    selectedState[NSFontAttributeName] = font;

    return {
        normalState: normalState,
        selectedState: selectedState
    };
}

export class TabViewStyler implements style.Styler {
    // font
    private static setFontInternalProperty(v: view.View, newValue: any, nativeValue?: any) {
        var tab = <definition.TabView>v;
        tab._updateIOSTabBarColorsAndFonts();
    }

    private static resetFontInternalProperty(v: view.View, nativeValue: any) {
        var tab = <definition.TabView>v;
        tab._updateIOSTabBarColorsAndFonts();
    }

    private static getNativeFontValue(v: view.View) {
        var tab = <definition.TabView>v;

        let currentFont;

        if (tab.ios && tab.ios.items && tab.ios.items.length > 0) {
            let currentAttrs = tab.ios.items[0].titleTextAttributesForState(UIControlState.Normal);
            if (currentAttrs) {
                currentFont = currentAttrs.objectForKey(NSFontAttributeName);
            }
        }

        if (!currentFont) {
            currentFont = UIFont.systemFontOfSize(getter(UIFont, UIFont.labelFontSize));
        }

        return currentFont;
    }

    // tab-text-color
    private static setTabTextColorProperty(v: view.View, newValue: any) {
        var tabView = <definition.TabView>v;
        tabView._updateIOSTabBarColorsAndFonts();
    }

    private static resetTabTextColorProperty(v: view.View, nativeValue: any) {
        var tabView = <definition.TabView>v;
        tabView._updateIOSTabBarColorsAndFonts();
    }

    // tab-background-color
    private static setTabBackgroundColorProperty(v: view.View, newValue: any) {
        let tabView = <TabView>v;
        tabView.ios.tabBar.barTintColor = newValue;
    }

    private static resetTabBackgroundColorProperty(v: view.View, nativeValue: any) {
        let tabView = <TabView>v;
        tabView.ios.tabBar.barTintColor = nativeValue;
    }

    private static getTabBackgroundColorProperty(v: view.View): any {
        let tabView = <TabView>v;
        return tabView.ios.tabBar.barTintColor;
    }

    // selected-tab-text-color
    private static setSelectedTabTextColorProperty(v: view.View, newValue: any) {
        var tabView = <definition.TabView>v;
        tabView.ios.tabBar.tintColor = newValue;
        tabView._updateIOSTabBarColorsAndFonts();
    }

    private static resetSelectedTabTextColorProperty(v: view.View, nativeValue: any) {
        var tabView = <definition.TabView>v;
        tabView.ios.tabBar.tintColor = nativeValue;
        tabView._updateIOSTabBarColorsAndFonts();
    }

    private static getSelectedTabTextColorProperty(v: view.View) {
        var tabView = <definition.TabView>v;
        return tabView.ios.tabBar.tintColor;
    }

    // text-transform
    private static setTextTransformProperty(v: view.View, newValue: any) {
        var tabView = <TabView>v;
        tabView._updateIOSTabBarTextTransform(newValue);
    }

    private static resetTextTransformProperty(v: view.View, nativeValue: any) {
        var tabView = <TabView>v;
        tabView._updateIOSTabBarTextTransform(nativeValue);
    }

    public static registerHandlers() {
        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setFontInternalProperty,
            TabViewStyler.resetFontInternalProperty,
            TabViewStyler.getNativeFontValue), "TabView");

        style.registerHandler(style.tabTextColorProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setTabTextColorProperty,
            TabViewStyler.resetTabTextColorProperty), "TabView");
        
        style.registerHandler(style.tabBackgroundColorProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setTabBackgroundColorProperty,
            TabViewStyler.resetTabBackgroundColorProperty,
            TabViewStyler.getTabBackgroundColorProperty), "TabView");

        style.registerHandler(style.selectedTabTextColorProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setSelectedTabTextColorProperty,
            TabViewStyler.resetSelectedTabTextColorProperty,
            TabViewStyler.getSelectedTabTextColorProperty), "TabView");

        style.registerHandler(style.textTransformProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setTextTransformProperty,
            TabViewStyler.resetTextTransformProperty), "TabView");
    }
}

TabViewStyler.registerHandlers();
