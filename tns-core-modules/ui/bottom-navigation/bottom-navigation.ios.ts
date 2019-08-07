// Types
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";
import { TextTransform } from "../text-base";

//Requires
import { TabNavigationBase, itemsProperty, selectedIndexProperty, tabStripProperty } from "../tab-navigation-base/tab-navigation-base";
import { Font } from "../styling/font";
import { getTransformedText } from "../text-base";
import { Frame } from "../frame";
import { ios as iosView, View, CSSType } from "../core/view";
import { ios as iosUtils, layout, isFontIconURI } from "../../utils/utils";
import { device } from "../../platform";
import { Color } from "../../color";
import { fromFileOrResource, fromFontIconCode, ImageSource } from "../../image-source";
// TODO:
// import { profile } from "../../profiling";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

const maxTabsCount = 5;
const majorVersion = iosUtils.MajorVersion;
const isPhone = device.deviceType === "Phone";

class UITabBarControllerImpl extends UITabBarController {

    private _owner: WeakRef<BottomNavigation>;

    public static initWithOwner(owner: WeakRef<BottomNavigation>): UITabBarControllerImpl {
        let handler = <UITabBarControllerImpl>UITabBarControllerImpl.new();
        handler._owner = owner;

        return handler;
    }

    // TODO
    // @profile
    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        // Unify translucent and opaque bars layout
        this.extendedLayoutIncludesOpaqueBars = true;

        iosView.updateAutoAdjustScrollInsets(this, owner);

        if (!owner.parent) {
            owner.callLoaded();
        }
    }

    // TODO
    // @profile
    public viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);
        const owner = this._owner.get();
        if (owner && !owner.parent && owner.isLoaded && !this.presentedViewController) {
            owner.callUnloaded();
        }
    }

    public viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void {
        super.viewWillTransitionToSizeWithTransitionCoordinator(size, coordinator);
        UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion
            .call(coordinator, null, () => {
                const owner = this._owner.get();
                if (owner && owner.items) {
                    // owner.items.forEach(tabItem => tabItem._updateTitleAndIconPositions()); TODO:
                }
            });
    }
}

class UITabBarControllerDelegateImpl extends NSObject implements UITabBarControllerDelegate {
    public static ObjCProtocols = [UITabBarControllerDelegate];

    private _owner: WeakRef<BottomNavigation>;

    public static initWithOwner(owner: WeakRef<BottomNavigation>): UITabBarControllerDelegateImpl {
        let delegate = <UITabBarControllerDelegateImpl>UITabBarControllerDelegateImpl.new();
        delegate._owner = owner;

        return delegate;
    }

    public tabBarControllerShouldSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): boolean {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        let owner = this._owner.get();
        if (owner) {
            // "< More" cannot be visible after clicking on the main tab bar buttons.
            let backToMoreWillBeVisible = false;
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);

            if (tabBarController.viewControllers) {
                const position = tabBarController.viewControllers.indexOfObject(viewController);
                if (position !== NSNotFound) {
                    const tabStripItems = owner.tabStrip && owner.tabStrip.items;
                    if (tabStripItems && tabStripItems[position]) {
                        tabStripItems[position]._emit(TabStripItem.tapEvent);
                    }
                }
            }
        }

        if ((<any>tabBarController).selectedViewController === viewController) {
            return false;
        }

        (<any>tabBarController)._willSelectViewController = viewController;

        return true;
    }

    public tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): void {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        const owner = this._owner.get();
        if (owner) {
            if (tabBarController.viewControllers) {
                const position = tabBarController.viewControllers.indexOfObject(viewController);
                if (position !== NSNotFound) {
                    const prevPosition = owner.selectedIndex;
                    const tabStripItems = owner.tabStrip && owner.tabStrip.items;
                    if (tabStripItems) {
                        if (tabStripItems[position]) {
                            tabStripItems[position]._emit(TabStripItem.selectEvent);
                        }

                        if (tabStripItems[prevPosition]) {
                            tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
                        }
                    }
                }
            }

            owner._onViewControllerShown(viewController);
        }

        (<any>tabBarController)._willSelectViewController = undefined;
    }
}

class UINavigationControllerDelegateImpl extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<BottomNavigation>;

    public static initWithOwner(owner: WeakRef<BottomNavigation>): UINavigationControllerDelegateImpl {
        let delegate = <UINavigationControllerDelegateImpl>UINavigationControllerDelegateImpl.new();
        delegate._owner = owner;

        return delegate;
    }

    navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        // }

        let owner = this._owner.get();
        if (owner) {
            // If viewController is one of our tab item controllers, then "< More" will be visible shortly.
            // Otherwise viewController is the UIMoreListController which shows the list of all tabs beyond the 4th tab.
            let backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
    }

    navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        // }
        // We don't need Edit button in More screen.
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        let owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    }
}

function updateTitleAndIconPositions(tabStripItem: TabStripItem, tabBarItem: UITabBarItem, controller: UIViewController) {
    if (!tabStripItem || !tabBarItem) {
        return;
    }

    // For iOS <11 icon is *always* above the text.
    // For iOS 11 icon is above the text *only* on phones in portrait mode.
    const orientation = controller.interfaceOrientation;
    const isPortrait = orientation !== UIInterfaceOrientation.LandscapeLeft && orientation !== UIInterfaceOrientation.LandscapeRight;
    const isIconAboveTitle = (majorVersion < 11) || (isPhone && isPortrait);

    if (!tabStripItem.iconSource) {
        if (isIconAboveTitle) {
            tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
        } else {
            tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: 0 };
        }
    }

    if (!tabStripItem.title) {
        if (isIconAboveTitle) {
            tabBarItem.imageInsets = new UIEdgeInsets({ top: 6, left: 0, bottom: -6, right: 0 });
        } else {
            tabBarItem.imageInsets = new UIEdgeInsets({ top: 0, left: 0, bottom: 0, right: 0 });
        }
    }
}

@CSSType("BottomNavigation")
export class BottomNavigation extends TabNavigationBase {
    public viewController: UITabBarControllerImpl;
    public items: TabContentItem[];
    public _ios: UITabBarControllerImpl;
    private _delegate: UITabBarControllerDelegateImpl;
    private _moreNavigationControllerDelegate: UINavigationControllerDelegateImpl;
    private _iconsCache = {};

    constructor() {
        super();

        this.viewController = this._ios = UITabBarControllerImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected = this._ios.view;
    }

    initNativeView() {
        super.initNativeView();
        this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(this));
        this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(this));
    }

    disposeNativeView() {
        this._delegate = null;
        this._moreNavigationControllerDelegate = null;
        super.disposeNativeView();
    }

    // TODO
    // @profile
    public onLoaded() {
        super.onLoaded();

        const selectedIndex = this.selectedIndex;
        const selectedView = this.items && this.items[selectedIndex] && this.items[selectedIndex].view;
        if (selectedView instanceof Frame) {
            selectedView._pushInFrameStackRecursive();
        }

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

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        //
    }

    public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
        const items = this.items;
        if (!items) {
            return;
        }

        const oldItem = items[oldIndex];
        if (oldItem) {
            oldItem.canBeLoaded = false;
            oldItem.unloadView(oldItem.view);
        }

        const newItem = items[newIndex];
        if (newItem && this.isLoaded) {
            const selectedView = items[newIndex].view;
            if (selectedView instanceof Frame) {
                selectedView._pushInFrameStackRecursive();
            }

            newItem.canBeLoaded = true;
            newItem.loadView(newItem.view);
        }

        super.onSelectedIndexChanged(oldIndex, newIndex);
    }

    public getTabBarBackgroundColor(): UIColor {
        return this._ios.tabBar.barTintColor;
    }

    public setTabBarBackgroundColor(value: UIColor | Color): void {
        this._ios.tabBar.barTintColor = value instanceof Color ? value.ios : value;
    }

    public getTabBarColor(): UIColor {
        return this._ios.tabBar.tintColor;
    }

    public setTabBarColor(value: UIColor | Color): void {
        this._ios.tabBar.tintColor = value instanceof Color ? value.ios : value;

        if (!this.tabStrip) {
            return;
        }

        const states = getTitleAttributesForStates(this.tabStrip);
        this.tabStrip.items.forEach((tabStripItem) => {
            applyStatesToItem(tabStripItem.nativeView, states);
        });
    }

    public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: UIColor | Color): void {
        if (!this.tabStrip) {
            return;
        }

        let bgView = (<any>tabStripItem).bgView;
        if (!bgView) {
            const index = (<any>tabStripItem).index;
            const width = this.tabStrip.nativeView.frame.size.width / this.tabStrip.items.length;
            const frame = CGRectMake(width * index, 0, width, this.tabStrip.nativeView.frame.size.width);
            bgView = UIView.alloc().initWithFrame(frame);
            this.tabStrip.nativeView.insertSubviewAtIndex(bgView, 0);
            (<any>tabStripItem).bgView = bgView;
        }

        bgView.backgroundColor = value instanceof Color ? value.ios : value;
    }

    public getTabBarItemColor(tabStripItem: TabStripItem): UIColor {
        return this._ios.tabBar.tintColor;
    }

    public setTabBarItemColor(tabStripItem: TabStripItem, value: UIColor | Color): void {
        const states = getTitleAttributesForStates(tabStripItem);
        applyStatesToItem(tabStripItem.nativeView, states);
    }

    public getTabBarItemFontSize(tabStripItem: TabStripItem): number {
        return null;
    }

    public setTabBarItemFontSize(tabStripItem: TabStripItem, value: number | { nativeSize: number }): void {
        const states = getTitleAttributesForStates(tabStripItem);
        applyStatesToItem(tabStripItem.nativeView, states);
    }

    public getTabBarItemFontInternal(tabStripItem: TabStripItem): Font {
        return null;
    }

    public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: Font): void {
        const states = getTitleAttributesForStates(tabStripItem);
        applyStatesToItem(tabStripItem.nativeView, states);
    }

    public getTabBarItemTextTransform(tabStripItem: TabStripItem): TextTransform {
        return null;
    }

    public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: TextTransform): void {
        const title = getTransformedText(tabStripItem.title, value);
        tabStripItem.nativeView.title = title;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public _onViewControllerShown(viewController: UIViewController) {
        // This method could be called with the moreNavigationController or its list controller, so we have to check.
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView._onViewControllerShown(" + viewController + ");", traceCategories.Debug);
        // }
        if (this._ios.viewControllers && this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        } else {
            // TODO
            // if (traceEnabled()) {
            //     traceWrite("TabView._onViewControllerShown: viewController is not one of our viewControllers", traceCategories.Debug);
            // }
        }
    }

    private _actionBarHiddenByTabView: boolean;
    public _handleTwoNavigationBars(backToMoreWillBeVisible: boolean) {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite(`TabView._handleTwoNavigationBars(backToMoreWillBeVisible: ${backToMoreWillBeVisible})`, traceCategories.Debug);
        // }

        // The "< Back" and "< More" navigation bars should not be visible simultaneously.
        const page = this.page || (<any>this)._selectedView.page || (<any>this)._selectedView.currentPage;
        if (!page || !page.frame) {
            return;
        }

        let actionBarVisible = page.frame._getNavBarVisible(page);

        if (backToMoreWillBeVisible && actionBarVisible) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;

            // TODO
            // if (traceEnabled()) {
            //     traceWrite(`TabView hid action bar`, traceCategories.Debug);
            // }
            return;
        }

        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;

            // TODO
            // if (traceEnabled()) {
            //     traceWrite(`TabView restored action bar`, traceCategories.Debug);
            // }
            return;
        }
    }

    private getViewController(item: TabContentItem): UIViewController {
        let newController: UIViewController = item.view ? item.view.viewController : null;

        if (newController) {
            (<any>item).setViewController(newController, newController.view);

            return newController;
        }

        if (item.view.ios instanceof UIViewController) {
            newController = item.view.ios;
            (<any>item).setViewController(newController, newController.view);
        } else if (item.view.ios && item.view.ios.controller instanceof UIViewController) {
            newController = item.view.ios.controller;
            (<any>item).setViewController(newController, newController.view);
        } else {
            newController = iosView.UILayoutViewController.initWithOwner(new WeakRef(item.view)) as UIViewController;
            newController.view.addSubview(item.view.nativeViewProtected);
            item.view.viewController = newController;
            (<any>item).setViewController(newController, item.view.nativeViewProtected);
        }

        return newController;
    }

    private setViewControllers(items: TabContentItem[]) {
        const length = items ? items.length : 0;
        if (length === 0) {
            this._ios.viewControllers = null;

            return;
        }

        // Limit both tabContentItems and tabStripItems to 5 in order to prevent iOS 'more' button
        items = items.slice(0, maxTabsCount);

        const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(length);
        const states = getTitleAttributesForStates(this);

        if (this.tabStrip) {
            this.tabStrip.setNativeView(this._ios.tabBar);
        }

        items.forEach((item, i) => {
            const controller = this.getViewController(item);

            if (this.tabStrip && this.tabStrip.items && this.tabStrip.items[i]) {
                const tabStripItem = <TabStripItem>this.tabStrip.items[i];
                const tabBarItem = this.createTabBarItem(tabStripItem, i);
                updateTitleAndIconPositions(tabStripItem, tabBarItem, controller);

                applyStatesToItem(tabBarItem, states);

                controller.tabBarItem = tabBarItem;
                (<any>tabStripItem).index = i;
                tabStripItem.setNativeView(tabBarItem);
            }

            controllers.addObject(controller);
        });

        this._ios.viewControllers = controllers;
        this._ios.customizableViewControllers = null;

        // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    }

    private createTabBarItem(item: TabStripItem, index: number): UITabBarItem {
        let image: UIImage;
        let title: string;

        image = this._getIcon(item);
        title = item.label ? item.label.text : item.title;

        const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(title, image, index);

        return tabBarItem;
    }

    private _getIconRenderingMode(): UIImageRenderingMode {
        return UIImageRenderingMode.AlwaysOriginal;
    }

    public _getIcon(tabStripItem: TabStripItem): UIImage {
        // Image and Label children of TabStripItem
        // take priority over its `iconSource` and `title` properties
        const iconSource = tabStripItem.image ? tabStripItem.image.src : tabStripItem.iconSource;
        if (!iconSource) {
            return null;
        }

        let image: UIImage = this._iconsCache[iconSource];
        if (!image) {
            let is = new ImageSource;
            if (isFontIconURI(iconSource)) {
                const fontIconCode = iconSource.split("//")[1];
                const font = tabStripItem.style.fontInternal;
                const color = tabStripItem.style.color;
                is = fromFontIconCode(fontIconCode, font, color);
            } else {
                is = fromFileOrResource(iconSource);
            }

            if (is && is.ios) {
                const originalRenderedImage = is.ios.imageWithRenderingMode(this._getIconRenderingMode());
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            } else {
                // TODO
                // traceMissingIcon(iconSource);
            }
        }

        return image;
    }

    // private _updateIOSTabBarColorsAndFonts(): void {
    //     if (!this.tabStrip || !this.tabStrip.items || !this.tabStrip.items.length) {
    //         return;
    //     }

    //     const tabBar = <UITabBar>this.ios.tabBar;
    //     const states = getTitleAttributesForStates(this);
    //     for (let i = 0; i < tabBar.items.count; i++) {
    //         applyStatesToItem(tabBar.items[i], states);
    //     }
    // }

    // TODO: Move this to TabStripItem
    // [fontInternalProperty.getDefault](): Font {
    //     return null;
    // }
    // [fontInternalProperty.setNative](value: Font) {
    //     this._updateIOSTabBarColorsAndFonts();
    // }

    [selectedIndexProperty.setNative](value: number) {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", traceCategories.Debug);
        // }

        if (value > -1) {
            (<any>this._ios)._willSelectViewController = this._ios.viewControllers[value];
            this._ios.selectedIndex = value;
        }
    }

    [itemsProperty.getDefault](): TabContentItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabContentItem[]) {
        this.setViewControllers(value);
        selectedIndexProperty.coerce(this);
    }

    [tabStripProperty.getDefault](): TabStrip {
        return null;
    }

    [tabStripProperty.setNative](value: TabStrip) {
        this.setViewControllers(this.items);
        selectedIndexProperty.coerce(this);
    }
}

interface TabStates {
    normalState?: any;
    selectedState?: any;
}

function getTitleAttributesForStates(view: View): TabStates {
    if (!view) {
        return null;
    }

    const result: TabStates = {};
    const defaultTabItemFontSize = 10;
    const tabItemFontSize = view.style.fontSize || defaultTabItemFontSize;
    const font: UIFont = view.style.fontInternal.getUIFont(UIFont.systemFontOfSize(tabItemFontSize));
    const tabItemTextColor = view.style.color;
    const textColor = tabItemTextColor instanceof Color ? tabItemTextColor.ios : null;
    result.normalState = { [NSFontAttributeName]: font };
    if (textColor) {
        result.normalState[UITextAttributeTextColor] = textColor;
    }

    const tabSelectedItemTextColor = view.style.color;
    const selectedTextColor = tabSelectedItemTextColor instanceof Color ? tabSelectedItemTextColor.ios : null;
    result.selectedState = { [NSFontAttributeName]: font };
    if (selectedTextColor) {
        result.selectedState[UITextAttributeTextColor] = selectedTextColor;
    }

    return result;
}

function applyStatesToItem(item: UITabBarItem, states: TabStates) {
    if (!states) {
        return;
    }

    item.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
    item.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
}
