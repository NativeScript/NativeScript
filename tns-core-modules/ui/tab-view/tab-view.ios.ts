import { TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty, selectedColorProperty, tabsBackgroundColorProperty, traceCategory, 
    Font, View, colorProperty, fontInternalProperty, layout, Color } from "./tab-view-common"

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
            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((this.title), icon, this._parent.items.indexOf(this));
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }

            // TODO: Repeating code. Make TabViewItemBase - ViewBase and move the colorProperty on tabViewItem.
            // Delete the repeating code.
            const states = getTitleAttributesForStates(this._parent);
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
            this._controller.tabBarItem = tabBarItem;
        }
    }
}

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

    private _updateIOSTabBarColorsAndFonts(): void {
        const tabBar = this._ios.tabBar;

        tabBar.tintColor = this.selectedColor ? this.selectedColor.ios : null;
        const states = getTitleAttributesForStates(this);

        for (let i = 0, count = tabBar.items.count; i < count; i++) {
            const item = tabBar.items[i];
            item.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            item.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
        }
    }

    private _onItemsPropertyChangedSetNativeValue() {
        let oldValue = <TabViewItem[]>this.previousItems;
        if (oldValue) {
            this._removeTabs(oldValue);
        }

        let newValue = <TabViewItem[]>this.items;
        if (newValue) {
            this._addTabs(newValue);
        }
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        if (traceEnabled) {
            traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", traceCategories.Debug);
        }

        if (value > -1) {
            this._ios.selectedIndex = value;
        }
    }

    get [itemsProperty.native](): TabViewItemBase[] {
        return null;
    }
    set [itemsProperty.native](value: TabViewItemBase[]) {
        this._onItemsPropertyChangedSetNativeValue();
    }

    get [colorProperty.native](): UIColor {
        return null;
    }
    set [colorProperty.native](value: UIColor) {
        this._updateIOSTabBarColorsAndFonts();
    }

    get [tabsBackgroundColorProperty.native](): UIColor {
        return this._ios.tabBar.barTintColor;
    }
    set [tabsBackgroundColorProperty.native](value: UIColor | Color) {
        this._ios.tabBar.barTintColor = value instanceof Color ? value.ios : value;
    }

    get [fontInternalProperty.native](): Font {
        return null;
    }
    set [fontInternalProperty.native](value: Font) {
        this._updateIOSTabBarColorsAndFonts();
    }
}

function getTitleAttributesForStates(tabView: TabView): { normalState: any, selectedState: any } {
    const normalState = {};
    if (tabView.color instanceof Color) {
        normalState[UITextAttributeTextColor] = tabView.color.ios;
    }

    const selectedState = {};
    if (tabView.selectedColor instanceof Color) {
        selectedState[UITextAttributeTextColor] = tabView.selectedColor.ios;
    }
    else {
        selectedState[UITextAttributeTextColor] = tabView.ios.tabBar.tintColor;
    }

    const defaultFont = UIFont.systemFontOfSize(10);
    const font = tabView.style.fontInternal.getUIFont(defaultFont);
    normalState[NSFontAttributeName] = font;
    selectedState[NSFontAttributeName] = font;

    return {
        normalState: normalState,
        selectedState: selectedState
    };
}
