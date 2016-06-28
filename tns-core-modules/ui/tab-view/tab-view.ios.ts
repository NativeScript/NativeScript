import common = require("./tab-view-common");
import definition = require("ui/tab-view");
import dependencyObservable = require("ui/core/dependency-observable");
import trace = require("trace");
import utils = require("utils/utils");
import view = require("ui/core/view");
import types = require("utils/types");
import proxy = require("ui/core/proxy");
import color = require("color");
import * as imageSourceModule from "image-source";
import style = require("ui/styling/style");
import { Page } from "ui/page";

global.moduleMerge(common, exports);

var imageSource: typeof imageSourceModule;
function ensureImageSource() {
    if (!imageSource) {
        imageSource = require("image-source");
    }
}

class UITabBarControllerImpl extends UITabBarController {

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UITabBarControllerImpl {
        let handler = <UITabBarControllerImpl>UITabBarControllerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public viewDidLayoutSubviews(): void {
        if (trace.enabled) {
            trace.write("TabView.UITabBarControllerClass.viewDidLayoutSubviews();", trace.categories.Debug);
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
        if (trace.enabled) {
            trace.write("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", trace.categories.Debug);
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
        if (trace.enabled) {
            trace.write("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", trace.categories.Debug);
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
        if (trace.enabled) {
            trace.write("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", trace.categories.Debug);
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
        if (trace.enabled) {
            trace.write("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", trace.categories.Debug);
        }
        // We don't need Edit button in More screen.
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        let owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    }
}

export class TabViewItem extends common.TabViewItem {
    public _controller: UIViewController;
    public _parent: TabView;

    public _update() {
        if (this._parent && this._controller) {
            var icon = this._parent._getIcon(this.iconSource);
            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((this.title || ""), icon, this._parent.items.indexOf(this));
            if (!icon) {
                if (types.isFunction(tabBarItem.setTitlePositionAdjustment)) {
                    tabBarItem.setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
                }
                else {
                    (<any>tabBarItem).titlePositionAdjustment = { horizontal: 0, vertical: -20 };
                }
            }

            var states = getTitleAttributesForStates(this._parent);
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.UIControlStateNormal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.UIControlStateSelected);
            this._controller.tabBarItem = tabBarItem;
        }
    }
}

function selectedColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var tabView = <TabView>data.object;
    tabView._updateIOSTabBarColorsAndFonts();
}
(<proxy.PropertyMetadata>common.TabView.selectedColorProperty.metadata).onSetNativeValue = selectedColorPropertyChanged;

function tabsBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var tabView = <TabView>data.object;
    if (data.newValue instanceof color.Color) {
        tabView.ios.tabBar.barTintColor = data.newValue.ios;
    }
}
(<proxy.PropertyMetadata>common.TabView.tabsBackgroundColorProperty.metadata).onSetNativeValue = tabsBackgroundColorPropertyChanged;

export class TabView extends common.TabView {
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
        if (trace.enabled) {
            trace.write("TabView._onViewControllerShown(" + viewController + ");", trace.categories.Debug);
        }
        if (this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        }
        else {
            if (trace.enabled) {
                trace.write("TabView._onViewControllerShown: viewController is not one of our viewControllers", trace.categories.Debug);
            }
        }
    }
    
    private _actionBarHiddenByTabView: boolean;
    public _handleTwoNavigationBars(backToMoreWillBeVisible: boolean){
        if (trace.enabled) {
            trace.write(`TabView._handleTwoNavigationBars(backToMoreWillBeVisible: ${backToMoreWillBeVisible})`, trace.categories.Debug);
        }
 
        // The "< Back" and "< More" navigation bars should not be visible simultaneously.
        let page = <Page>this.page;
        let actionBarVisible = page.frame._getNavBarVisible(page);
        
        if (backToMoreWillBeVisible && actionBarVisible){
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;
            if (trace.enabled) {
                trace.write(`TabView hid action bar`, trace.categories.Debug);
            }
            return;
        }
        
        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView){
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;
            if (trace.enabled) {
                trace.write(`TabView restored action bar`, trace.categories.Debug);
            }
            return;
        }
    }

    public _removeTabs(oldItems: Array<definition.TabViewItem>) {
        if (trace.enabled) {
            trace.write("TabView._removeTabs(" + oldItems + ");", trace.categories.Debug);
        }
        super._removeTabs(oldItems);

        var i: number;
        var length = oldItems.length;
        var oldItem: TabViewItem;
        for (i = 0; i < length; i++) {
            oldItem = <TabViewItem>oldItems[i];
            oldItem._parent = null;
            oldItem._controller = null;
        }

        this._ios.viewControllers = null;
    }

    public _addTabs(newItems: Array<definition.TabViewItem>) {
        if (trace.enabled) {
            trace.write("TabView._addTabs(" + newItems + ");", trace.categories.Debug);
        }
        super._addTabs(newItems);

        var i: number;
        var length = newItems.length;
        var item: TabViewItem;
        var newControllers: NSMutableArray = NSMutableArray.alloc().initWithCapacity(length);
        var newController: UIViewController;

        var states = getTitleAttributesForStates(this);

        for (i = 0; i < length; i++) {
            item = <TabViewItem>newItems[i];

            if (item.view.ios instanceof UIViewController) {
                newController = <UIViewController>item.view.ios;
            } else {
                newController = new UIViewController();
                newController.view.addSubview(item.view.ios);
            }

            item._parent = this;
            item._controller = newController;

            var icon = this._getIcon(item.iconSource);

            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            if (!icon) {
                if (types.isFunction(tabBarItem.setTitlePositionAdjustment)) {
                    tabBarItem.setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
                }
                else {
                    (<any>tabBarItem).titlePositionAdjustment = { horizontal: 0, vertical: -20 };
                }
            }
            tabBarItem.setTitleTextAttributesForState(states.normalState, UIControlState.UIControlStateNormal);
            tabBarItem.setTitleTextAttributesForState(states.selectedState, UIControlState.UIControlStateSelected);

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

    public _getIcon(iconSource: string): UIImage {
        if (!iconSource) {
            return null;
        }

        var image: UIImage;
        image = this._iconsCache[iconSource];
        if (!image) {
            ensureImageSource();

            var is = imageSource.fromFileOrResource(iconSource);
            if (is && is.ios) {
                var originalRenderedImage = is.ios.imageWithRenderingMode(UIImageRenderingMode.UIImageRenderingModeAlwaysOriginal);
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            }
        }

        return image;
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChangedSetNativeValue(data);

        var newIndex = data.newValue;
        if (trace.enabled) {
            trace.write("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + newIndex + ")", trace.categories.Debug);
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
        var nativeView = this._nativeView;
        if (nativeView) {

            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            this._tabBarHeight = TabView.measureHelper(this._ios.tabBar, width, widthMode, height, heightMode).height;
            let moreNavBarVisible = !!this._ios.moreNavigationController.navigationBar.window;
            this._navBarHeight = moreNavBarVisible ? TabView.measureHelper(this._ios.moreNavigationController.navigationBar, width, widthMode, height, heightMode).height : 0;

            var density = utils.layout.getDisplayDensity();
            var measureWidth = 0;
            var measureHeight = 0;

            var child = this._selectedView;
            if (child) {
                var childHeightMeasureSpec = utils.layout.makeMeasureSpec(height - this._navBarHeight - this._tabBarHeight, heightMode);
                var childSize = view.View.measureChild(this, child, widthMeasureSpec, childHeightMeasureSpec);

                measureHeight = childSize.measuredHeight;
                measureWidth = childSize.measuredWidth;
            }

            measureWidth = Math.max(measureWidth, this.minWidth * density);
            measureHeight = Math.max(measureHeight, this.minHeight * density);

            var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        var child = this._selectedView;
        if (child) {
            view.View.layoutChild(this, child, 0, this._navBarHeight, right, (bottom - this._navBarHeight - this._tabBarHeight));
        }
    }

    private static measureHelper(nativeView: UIView, width: number, widthMode: number, height: number, heightMode: number): CGSize {
        return nativeView.sizeThatFits(CGSizeMake(
            (widthMode === utils.layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : width,
            (heightMode === utils.layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : height));
    }

    public _updateIOSTabBarColorsAndFonts(): void {
        if (!this.items) {
            return;
        }

        var tabBar = this.ios.tabBar;

        tabBar.tintColor = this.selectedColor ? this.selectedColor.ios : null;
        var states = getTitleAttributesForStates(this);

        for (var i = 0; i < tabBar.items.count; i++) {
            var item = <UITabBarItem>tabBar.items[i];
            item.setTitleTextAttributesForState(states.normalState, UIControlState.UIControlStateNormal);
            item.setTitleTextAttributesForState(states.selectedState, UIControlState.UIControlStateSelected);
        }
    }
}

function getTitleAttributesForStates(tabView: TabView): { normalState: any, selectedState: any } {
    var normalState = {};
    if (tabView.color instanceof color.Color) {
        normalState[UITextAttributeTextColor] = tabView.color.ios;
    }

    var selectedState = {};
    if (tabView.selectedColor instanceof color.Color) {
        selectedState[UITextAttributeTextColor] = tabView.selectedColor.ios;
    }
    else {
        selectedState[UITextAttributeTextColor] = tabView.ios.tabBar.tintColor;
    }

    var defaultFont = UIFont.systemFontOfSize(10);
    var font = (<any>tabView.style)._fontInternal.getUIFont(defaultFont);
    normalState[NSFontAttributeName] = font;
    selectedState[NSFontAttributeName] = font;

    return {
        normalState: normalState,
        selectedState: selectedState
    };
}

export class TabViewStyler implements style.Styler {
    // color
    private static setColorProperty(v: view.View, newValue: any) {
        var tab = <definition.TabView>v;
        tab._updateIOSTabBarColorsAndFonts();
    }

    private static resetColorProperty(v: view.View, nativeValue: any) {
        var tab = <definition.TabView>v;
        tab._updateIOSTabBarColorsAndFonts();
    }

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
            let currentAttrs = tab.ios.items[0].titleTextAttributesForState(UIControlState.UIControlStateNormal);
            if (currentAttrs) {
                currentFont = currentAttrs.objectForKey(NSFontAttributeName);
            }
        }

        if (!currentFont) {
            currentFont = UIFont.systemFontOfSize(UIFont.labelFontSize());
        }

        return currentFont;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setColorProperty,
            TabViewStyler.resetColorProperty), "TabView");

        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            TabViewStyler.setFontInternalProperty,
            TabViewStyler.resetFontInternalProperty,
            TabViewStyler.getNativeFontValue), "TabView");
    }
}

TabViewStyler.registerHandlers();
