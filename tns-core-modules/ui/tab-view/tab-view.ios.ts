import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, selectedTabTextColorProperty, iosIconRenderingModeProperty,
    Font, View, fontInternalProperty, layout, Color, traceEnabled, traceWrite, traceCategories
} from "./tab-view-common"

import { textTransformProperty, TextTransform, getTransformedText } from "ui/text-base";
import { fromFileOrResource } from "image-source";
import { Page } from "ui/page";

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

    public _update() {
        const parent = <TabView>this.parent;
        let controller = <UIViewController>this.nativeView;
        if (parent && controller) {
            const icon = parent._getIcon(this.iconSource);
            const index = parent.items.indexOf(this);
            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(this.title, icon, index);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }

            // TODO: Repeating code. Make TabViewItemBase - ViewBase and move the colorProperty on tabViewItem.
            // Delete the repeating code.
            const states = getTitleAttributesForStates(parent);
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
            controller.tabBarItem = tabBarItem;
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

    private setViewControllers(items: Array<TabViewItem>) {
        const length = items ? items.length : 0;
        if (length === 0) {
            this._ios.viewControllers = null;
            return;
        }

        const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(length);
        const states = getTitleAttributesForStates(this);

        for (let i = 0; i < length; i++) {
            const item = items[i];
            let newController: UIViewController;

            if (item.view.ios instanceof UIViewController) {
                newController = item.view.ios;
            } else {
                newController = UIViewController.new();
                newController.view.addSubview(item.view.ios);
            }

            item.nativeView = newController;

            const icon = this._getIcon(item.iconSource);
            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            }
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);

            newController.tabBarItem = tabBarItem;
            controllers.addObject(newController);
        }

        this._ios.viewControllers = controllers;
        this._ios.customizableViewControllers = null;

        // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;

        if (this.selectedIndex < 0) {
            this.selectedIndex = this._ios.selectedIndex;
        }
    }

    private _getIconRenderingMode(): UIImageRenderingMode {
        switch (this.iosIconRenderingMode) {
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
            const moreNavBarVisible = !!this._ios.moreNavigationController.navigationBar.window;
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

            measureWidth = Math.max(measureWidth, this.effectiveMinWidth * density);
            measureHeight = Math.max(measureHeight, this.effectiveMinHeight * density);

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
        if (!this.items) {
            return;
        }

        const tabBar = this._ios.tabBar;
        const states = getTitleAttributesForStates(this);

        for (let i = 0, count = tabBar.items.count; i < count; i++) {
            const item = tabBar.items[i];
            item.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
            item.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
        }
    }

    private _updateIOSTabBarTextTransform(newValue: TextTransform): void {
        if (!this.items) {
            return;
        }

        const tabBar = this.ios.tabBar;
        for (let i = 0, count = tabBar.items.count; i < count; i++) {
            const item = tabBar.items[i];
            item.title = getTransformedText(item.title, newValue);
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
        this.setViewControllers(value);
    }

    get [tabTextColorProperty.native](): UIColor {
        return null;
    }
    set [tabTextColorProperty.native](value: UIColor) {
        this._updateIOSTabBarColorsAndFonts();
    }

    get [tabBackgroundColorProperty.native](): UIColor {
        return this._ios.tabBar.barTintColor;
    }
    set [tabBackgroundColorProperty.native](value: UIColor | Color) {
        this._ios.tabBar.barTintColor = value instanceof Color ? value.ios : value;
    }

    get [selectedTabTextColorProperty.native](): UIColor {
        return this._ios.tabBar.tintColor;
    }
    set [selectedTabTextColorProperty.native](value: UIColor) {
        this._ios.tabBar.tintColor = value instanceof Color ? value.ios : value;
        this._updateIOSTabBarColorsAndFonts();
    }

    // TODO: Move this to TabViewItem
    get [textTransformProperty.native](): TextTransform {
        return "none";
    }
    set [textTransformProperty.native](value: TextTransform) {
        this._updateIOSTabBarTextTransform(value);
    }

    // TODO: Move this to TabViewItem
    get [fontInternalProperty.native](): Font {
        return null;
    }
    set [fontInternalProperty.native](value: Font) {
        this._updateIOSTabBarColorsAndFonts();
    }

    // TODO: Move this to TabViewItem
    get [iosIconRenderingModeProperty.native](): "automatic" | "alwaysOriginal" | "alwaysTemplate" {
        return "automatic";
    }
    set [iosIconRenderingModeProperty.native](value: "automatic" | "alwaysOriginal" | "alwaysTemplate") {
        this._iconsCache = {};
        let items = this.items;
        if (items && items.length) {
            for (let i = 0, length = items.length; i < length; i++) {
                const item = items[i];
                if (item.iconSource) {
                    (<TabViewItem>item)._update();
                }
            }
        }
    }
}

function getTitleAttributesForStates(tabView: TabView): { normalState: any, selectedState: any } {
    const normalState = {};
    if (tabView.color instanceof Color) {
        normalState[UITextAttributeTextColor] = tabView.color.ios;
    }

    const selectedState = {};
    let tabItemTextColor = tabView.style.tabTextColor;
    if (tabItemTextColor instanceof Color) {
        selectedState[UITextAttributeTextColor] = tabItemTextColor.ios;
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