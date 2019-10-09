// Types
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import { TabStrip } from "../tab-navigation-base/tab-strip";
import { TabStripItem } from "../tab-navigation-base/tab-strip-item";
import { TextTransform } from "../text-base";

// Requires
import { Color } from "../../color";
import { ImageSource } from "../../image-source";
import { ios as iosUtils, isFontIconURI, layout } from "../../utils/utils";
import { ios as iosView, View } from "../core/view";
import { Frame } from "../frame";
import { Font } from "../styling/font";
import {
    getIconSpecSize, itemsProperty, selectedIndexProperty, tabStripProperty
} from "../tab-navigation-base/tab-navigation-base";
import { swipeEnabledProperty, TabsBase } from "./tabs-common";

// TODO
// import { profile } from "../../profiling";

export * from "./tabs-common";

const majorVersion = iosUtils.MajorVersion;

// Equivalent to dispatch_async(dispatch_get_main_queue(...)) call
const invokeOnRunLoop = (function() {
    const runloop = CFRunLoopGetMain();

    return (action: () => any) => {
        CFRunLoopPerformBlock(runloop, kCFRunLoopDefaultMode, action);
        CFRunLoopWakeUp(runloop);
    };
}());

class MDCTabBarDelegateImpl extends NSObject implements MDCTabBarDelegate {
    public static ObjCProtocols = [MDCTabBarDelegate];

    private _owner: WeakRef<Tabs>;

    public static initWithOwner(owner: WeakRef<Tabs>): MDCTabBarDelegateImpl {
        let delegate = <MDCTabBarDelegateImpl>MDCTabBarDelegateImpl.new();
        delegate._owner = owner;

        return delegate;
    }

    public tabBarShouldSelectItem(tabBar: MDCTabBar, item: UITabBarItem): boolean {
        const owner = this._owner.get();
        const shouldSelectItem = owner._canSelectItem;
        const selectedIndex = owner.tabBarItems.indexOf(item);

        if (owner.selectedIndex !== selectedIndex) {
            owner._canSelectItem = false;
        }

        const tabStrip = owner.tabStrip;
        const tabStripItems = tabStrip && tabStrip.items;

        if (tabStripItems && tabStripItems[selectedIndex]) {
            tabStripItems[selectedIndex]._emit(TabStripItem.tapEvent);
            tabStrip.notify({ eventName: TabStrip.itemTapEvent, object: tabStrip, index: selectedIndex });
        }

        return shouldSelectItem;
    }

    public tabBarDidSelectItem(tabBar: MDCTabBar, selectedItem: UITabBarItem): void {
        const owner = this._owner.get();
        const tabBarItems = owner.tabBarItems;
        const selectedIndex = tabBarItems.indexOf(selectedItem);

        owner.selectedIndex = selectedIndex;
    }
}

class UIPageViewControllerImpl extends UIPageViewController {
    tabBar: MDCTabBar;
    scrollView: UIScrollView;
    tabBarDelegate: MDCTabBarDelegateImpl;

    private _owner: WeakRef<Tabs>;

    public static initWithOwner(owner: WeakRef<Tabs>): UIPageViewControllerImpl {
        const handler = <UIPageViewControllerImpl>UIPageViewControllerImpl.alloc().initWithTransitionStyleNavigationOrientationOptions(UIPageViewControllerTransitionStyle.Scroll, UIPageViewControllerNavigationOrientation.Horizontal, null);
        handler._owner = owner;

        return handler;
    }

    public viewDidLoad(): void {
        const owner = this._owner.get();

        const tabBarItems = owner.tabBarItems;
        const tabBar = MDCTabBar.alloc().initWithFrame(this.view.bounds);

        if (tabBarItems && tabBarItems.length) {
            tabBar.items = NSArray.arrayWithArray(tabBarItems);
        }

        tabBar.delegate = this.tabBarDelegate = MDCTabBarDelegateImpl.initWithOwner(new WeakRef(owner));

        if (majorVersion <= 12) {
            tabBar.tintColor = UIColor.blueColor;
            tabBar.barTintColor = UIColor.whiteColor;
            tabBar.setTitleColorForState(UIColor.blackColor, MDCTabBarItemState.Normal);
            tabBar.setTitleColorForState(UIColor.blackColor, MDCTabBarItemState.Selected);
        } else {
            tabBar.tintColor = UIColor.systemBlueColor;
            tabBar.barTintColor = UIColor.systemBackgroundColor;
            tabBar.setTitleColorForState(UIColor.labelColor, MDCTabBarItemState.Normal);
            tabBar.setTitleColorForState(UIColor.labelColor, MDCTabBarItemState.Selected);
            tabBar.inkColor = UIColor.clearColor;
        }

        tabBar.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleBottomMargin;
        tabBar.alignment = MDCTabBarAlignment.Leading;
        tabBar.sizeToFit();

        this.tabBar = tabBar;
        this.view.addSubview(tabBar);
    }

    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        iosView.updateAutoAdjustScrollInsets(this, owner);

        // Tabs can be reset as a root view. Call loaded here in this scenario.
        if (!owner.isLoaded) {
            owner.callLoaded();
        }
    }

    public viewDidLayoutSubviews(): void {
        super.viewDidLayoutSubviews();
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        let safeAreaInsetsBottom = 0;
        let safeAreaInsetsTop = 0;

        if (majorVersion > 10) {
            safeAreaInsetsBottom = this.view.safeAreaInsets.bottom;
            safeAreaInsetsTop = this.view.safeAreaInsets.top;
        } else {
            safeAreaInsetsTop = this.topLayoutGuide.length;
        }

        let scrollViewTop = 0;
        let scrollViewHeight = this.view.bounds.size.height + safeAreaInsetsBottom;

        if (owner.tabStrip) {
            scrollViewTop = this.tabBar.frame.size.height;
            scrollViewHeight = this.view.bounds.size.height - this.tabBar.frame.size.height + safeAreaInsetsBottom;
            let tabBarTop = safeAreaInsetsTop;
            let tabBarHeight = this.tabBar.frame.size.height;

            const tabsPosition = owner.tabsPosition;
            if (tabsPosition === "bottom") {
                tabBarTop = this.view.frame.size.height - this.tabBar.frame.size.height - safeAreaInsetsBottom;
                scrollViewTop = this.view.frame.origin.y;
                scrollViewHeight = this.view.frame.size.height - safeAreaInsetsBottom;
            }

            let parent = owner.parent;

            // Handle Angular scenario where Tabs is in a ProxyViewContainer
            // It is possible to wrap components in ProxyViewContainers indefinitely
            while (parent && !parent.nativeViewProtected) {
                parent = parent.parent;
            }

            if (parent && majorVersion > 10) {
                // TODO: Figure out a better way to handle ViewController nesting/Safe Area nesting
                tabBarTop = Math.max(tabBarTop, parent.nativeView.safeAreaInsets.top);
            }

            this.tabBar.frame = CGRectMake(0, tabBarTop, this.tabBar.frame.size.width, tabBarHeight);
        } else {
            this.tabBar.hidden = true;
        }

        const subViews: NSArray<UIView> = this.view.subviews;
        let scrollView: UIScrollView = null;

        for (let i = 0; i < subViews.count; i++) {
            const view: UIView = subViews[i];
            if (view instanceof UIScrollView) {
                scrollView = <UIScrollView>view;
            }
        }

        if (scrollView) {
            // The part of the UIPageViewController that is changing the pages is a UIScrollView
            // We want to expand it to the size of the UIPageViewController as it is not so by default
            this.scrollView = scrollView;

            if (!owner.swipeEnabled) {
                scrollView.scrollEnabled = false;
            }

            scrollView.frame = CGRectMake(0, scrollViewTop, this.view.bounds.size.width, scrollViewHeight); //this.view.bounds;
        }
    }

    // Mind implementation for other controllers
    public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
        super.traitCollectionDidChange(previousTraitCollection);

        if (majorVersion >= 13) {
            const owner = this._owner.get();
            if (owner && this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)) {
                owner.notify({ eventName: iosView.traitCollectionColorAppearanceChangedEvent, object: owner });
            }
        }
    }
}

class UIPageViewControllerDataSourceImpl extends NSObject implements UIPageViewControllerDataSource {
    public static ObjCProtocols = [UIPageViewControllerDataSource];

    private _owner: WeakRef<Tabs>;

    public static initWithOwner(owner: WeakRef<Tabs>): UIPageViewControllerDataSourceImpl {
        let dataSource = <UIPageViewControllerDataSourceImpl>UIPageViewControllerDataSourceImpl.new();
        dataSource._owner = owner;

        return dataSource;
    }

    public pageViewControllerViewControllerBeforeViewController(pageViewController: UIPageViewController, viewController: UIViewController): UIViewController {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        const owner = this._owner.get();
        let selectedIndex = owner.selectedIndex;

        if (selectedIndex === 0) {
            return null;
        }

        selectedIndex--;
        const prevItem = owner.items[selectedIndex];
        let prevViewController = (<any>prevItem).__controller;

        // if (!prevViewController) {
        //     prevViewController = owner.getViewController(prevItem);
        // }

        owner._setCanBeLoaded(selectedIndex);
        owner._loadUnloadTabItems(selectedIndex);

        return prevViewController;
    }

    public pageViewControllerViewControllerAfterViewController(pageViewController: UIPageViewController, viewController: UIViewController): UIViewController {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        const owner = this._owner.get();
        let selectedIndex = owner.selectedIndex;

        if (selectedIndex === owner.items.length - 1) {
            return null;
        }

        selectedIndex++;
        const nextItem = owner.items[selectedIndex];
        let nextViewController = (<any>nextItem).__controller;

        // if (!nextViewController) {
        //     nextViewController = owner.getViewController(nextItem);
        // }

        owner._setCanBeLoaded(selectedIndex);
        owner._loadUnloadTabItems(selectedIndex);
        // nextItem.loadView(nextItem.view);

        return nextViewController;
    }

    public presentationCountForPageViewController(pageViewController: UIPageViewController): number {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        return 0;
    }

    public presentationIndexForPageViewController(pageViewController: UIPageViewController): number {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        // }

        return 0;
    }
}

class UIPageViewControllerDelegateImpl extends NSObject implements UIPageViewControllerDelegate {
    public static ObjCProtocols = [UIPageViewControllerDelegate];

    private _owner: WeakRef<Tabs>;

    public static initWithOwner(owner: WeakRef<Tabs>): UIPageViewControllerDelegateImpl {
        let delegate = <UIPageViewControllerDelegateImpl>UIPageViewControllerDelegateImpl.new();
        delegate._owner = owner;

        return delegate;
    }

    public pageViewControllerWillTransitionToViewControllers(pageViewController: UIPageViewController, viewControllers: NSArray<UIViewController>): void {
        // const owner = this._owner.get();
        // const ownerViewControllers = owner.viewControllers;
        // const selectedIndex = owner.selectedIndex;
        // const nextViewController = viewControllers[0];
        // const nextViewControllerIndex = ownerViewControllers.indexOf(nextViewController);

        // if (selectedIndex > nextViewControllerIndex) {
        //     owner.selectedIndex--;
        // } else {
        //     owner.selectedIndex++;
        // }
    }

    public pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted(pageViewController: UIPageViewController, didFinishAnimating: boolean, previousViewControllers: NSArray<UIViewController>, transitionCompleted: boolean): void {
        if (!transitionCompleted) {
            return;
        }

        const owner = this._owner.get();
        const ownerViewControllers = owner.viewControllers;
        const selectedIndex = owner.selectedIndex;
        const nextViewController = pageViewController.viewControllers[0];
        const nextViewControllerIndex = ownerViewControllers.indexOf(nextViewController);

        if (selectedIndex !== nextViewControllerIndex) {
            owner.selectedIndex = nextViewControllerIndex;
            owner._canSelectItem = true;
        }
    }
}

// class UITabBarControllerImpl extends UITabBarController {

//     private _owner: WeakRef<Tabs>;

//     public static initWithOwner(owner: WeakRef<Tabs>): UITabBarControllerImpl {
//         let handler = <UITabBarControllerImpl>UITabBarControllerImpl.new();
//         handler._owner = owner;
//         return handler;
//     }

//     @profile
//     public viewWillAppear(animated: boolean): void {
//         super.viewWillAppear(animated);
//         const owner = this._owner.get();
//         if (!owner) {
//             return;
//         }

//         // Unify translucent and opaque bars layout
//         this.extendedLayoutIncludesOpaqueBars = true;

//         iosView.updateAutoAdjustScrollInsets(this, owner);

//         if (!owner.parent) {
//             owner.callLoaded();
//         }
//     }

//     @profile
//     public viewDidDisappear(animated: boolean): void {
//         super.viewDidDisappear(animated);
//         const owner = this._owner.get();
//         if (owner && !owner.parent && owner.isLoaded && !this.presentedViewController) {
//             owner.callUnloaded();
//         }
//     }

//     public viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void {
//         super.viewWillTransitionToSizeWithTransitionCoordinator(size, coordinator);
//         UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion
//             .call(coordinator, null, () => {
//                 const owner = this._owner.get();
//                 if (owner && owner.items) {
//                     // owner.items.forEach(tabItem => tabItem._updateTitleAndIconPositions()); TODO:
//                 }
//             });
//     }
// }

// class UITabBarControllerDelegateImpl extends NSObject implements UITabBarControllerDelegate {
//     public static ObjCProtocols = [UITabBarControllerDelegate];

//     private _owner: WeakRef<Tabs>;

//     public static initWithOwner(owner: WeakRef<Tabs>): UITabBarControllerDelegateImpl {
//         let delegate = <UITabBarControllerDelegateImpl>UITabBarControllerDelegateImpl.new();
//         delegate._owner = owner;
//         return delegate;
//     }

//     public tabBarControllerShouldSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): boolean {
//         if (traceEnabled()) {
//             traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
//         }

//         let owner = this._owner.get();
//         if (owner) {
//             // "< More" cannot be visible after clicking on the main tab bar buttons.
//             let backToMoreWillBeVisible = false;
//             owner._handleTwoNavigationBars(backToMoreWillBeVisible);
//         }

//         if ((<any>tabBarController).selectedViewController === viewController) {
//             return false;
//         }

//         (<any>tabBarController)._willSelectViewController = viewController;

//         return true;
//     }

//     public tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): void {
//         if (traceEnabled()) {
//             traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
//         }

//         const owner = this._owner.get();
//         if (owner) {
//             owner._onViewControllerShown(viewController);
//         }

//         (<any>tabBarController)._willSelectViewController = undefined;
//     }
// }

// class UINavigationControllerDelegateImpl extends NSObject implements UINavigationControllerDelegate {
//     public static ObjCProtocols = [UINavigationControllerDelegate];

//     private _owner: WeakRef<Tabs>;

//     public static initWithOwner(owner: WeakRef<Tabs>): UINavigationControllerDelegateImpl {
//         let delegate = <UINavigationControllerDelegateImpl>UINavigationControllerDelegateImpl.new();
//         delegate._owner = owner;
//         return delegate;
//     }

//     navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
//         if (traceEnabled()) {
//             traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
//         }

//         let owner = this._owner.get();
//         if (owner) {
//             // If viewController is one of our tab item controllers, then "< More" will be visible shortly.
//             // Otherwise viewController is the UIMoreListController which shows the list of all tabs beyond the 4th tab.
//             let backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
//             owner._handleTwoNavigationBars(backToMoreWillBeVisible);
//         }
//     }

//     navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
//         if (traceEnabled()) {
//             traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
//         }
//         // We don't need Edit button in More screen.
//         navigationController.navigationBar.topItem.rightBarButtonItem = null;
//         let owner = this._owner.get();
//         if (owner) {
//             owner._onViewControllerShown(viewController);
//         }
//     }
// }

// function updateTitleAndIconPositions(tabStripItem: TabStripItem, tabBarItem: UITabBarItem, controller: UIViewController) {
//     if (!tabStripItem || !tabBarItem) {
//         return;
//     }

//     // For iOS <11 icon is *always* above the text.
//     // For iOS 11 icon is above the text *only* on phones in portrait mode.
//     const orientation = controller.interfaceOrientation;
//     const isPortrait = orientation !== UIInterfaceOrientation.LandscapeLeft && orientation !== UIInterfaceOrientation.LandscapeRight;
//     const isIconAboveTitle = (majorVersion < 11) || (isPhone && isPortrait);

//     if (!tabStripItem.iconSource) {
//         if (isIconAboveTitle) {
//             tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
//         } else {
//             tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: 0 };
//         }
//     }

//     if (!tabStripItem.title) {
//         if (isIconAboveTitle) {
//             tabBarItem.imageInsets = new UIEdgeInsets({ top: 6, left: 0, bottom: -6, right: 0 });
//         } else {
//             tabBarItem.imageInsets = new UIEdgeInsets({ top: 0, left: 0, bottom: 0, right: 0 });
//         }
//     }
// }

function iterateIndexRange(index: number, eps: number, lastIndex: number, callback: (i) => void) {
    const rangeStart = Math.max(0, index - eps);
    const rangeEnd = Math.min(index + eps, lastIndex);
    for (let i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}

export class Tabs extends TabsBase {
    public nativeViewProtected: UIView;
    public selectedIndex: number;
    // public swipeEnabled: boolean;
    // public offscreenTabLimit: number;
    // public tabsPosition: "top" | "bottom";
    public _canSelectItem: boolean;
    public isLoaded: boolean;
    public viewController: UIPageViewControllerImpl;
    public items: TabContentItem[];
    public _ios: UIPageViewControllerImpl;
    public viewControllers: UIViewController[];
    public tabBarItems: UITabBarItem[];
    private _currentNativeSelectedIndex: number;
    private _dataSource: UIPageViewControllerDataSourceImpl;
    private _delegate: UIPageViewControllerDelegateImpl;
    // private _moreNavigationControllerDelegate: UINavigationControllerDelegateImpl;
    private _iconsCache = {};

    constructor() {
        super();

        // this.viewController = this._ios = <UIPageViewControllerImpl>UIPageViewControllerImpl.initWithOwner(new WeakRef(this)); // .alloc().initWithTransitionStyleNavigationOrientationOptions(UIPageViewControllerTransitionStyle.Scroll, UIPageViewControllerNavigationOrientation.Horizontal, null); // UITabBarControllerImpl.initWithOwner(new WeakRef(this));
        this.viewController = this._ios = <UIPageViewControllerImpl>UIPageViewControllerImpl.initWithOwner(new WeakRef(this)); //alloc().initWithTransitionStyleNavigationOrientationOptions(UIPageViewControllerTransitionStyle.Scroll, UIPageViewControllerNavigationOrientation.Horizontal, null);;
    }

    createNativeView() {
        return this._ios.view;
    }

    initNativeView() {
        super.initNativeView();
        this._dataSource = UIPageViewControllerDataSourceImpl.initWithOwner(new WeakRef(this));
        this._delegate = UIPageViewControllerDelegateImpl.initWithOwner(new WeakRef(this));
        // this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(this));
        // this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(this));
    }

    disposeNativeView() {
        this._dataSource = null;
        this._delegate = null;
        this._ios.tabBarDelegate = null;
        this._ios.tabBar = null;
        // this._moreNavigationControllerDelegate = null;
        super.disposeNativeView();
    }

    // TODO
    // @profile
    public onLoaded() {
        super.onLoaded();

        const selectedIndex = this.selectedIndex;
        const selectedView = this.items && this.items[selectedIndex] && this.items[selectedIndex].content;
        if (selectedView instanceof Frame) {
            (<Frame>selectedView)._pushInFrameStackRecursive();
        }

        this._ios.dataSource = this._dataSource;
        this._ios.delegate = this._delegate;

        const tabStripItems = this.tabStrip ? this.tabStrip.items : null;
        this.setTabStripItems(tabStripItems);
    }

    public onUnloaded() {
        this._ios.dataSource = null;
        this._ios.delegate = null;
        // this._ios.moreNavigationController.delegate = null;
        super.onUnloaded();
    }

    get ios(): UIPageViewController {
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

        // const oldItem = items[oldIndex];
        // if (oldItem) {
        //     oldItem.unloadView(oldItem.view);
        // }

        // const newItem = items[newIndex];
        // if (newItem && this.isLoaded) {
        //     const selectedView = items[newIndex].view;
        //     if (selectedView instanceof Frame) {
        //         selectedView._pushInFrameStackRecursive();
        //     }

        //     newItem.loadView(newItem.view);
        // }

        this._loadUnloadTabItems(newIndex);

        super.onSelectedIndexChanged(oldIndex, newIndex);
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
                item.unloadView(item.content);
            }
        });

        const newItem = items[newIndex];
        const selectedView = newItem && newItem.content;
        if (selectedView instanceof Frame) {
            selectedView._pushInFrameStackRecursive();
        }

        toLoad.forEach(index => {
            const item = items[index];
            if (this.isLoaded && items[index]) {
                item.loadView(item.content);
            }
        });
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

    // private _actionBarHiddenByTabView: boolean;
    // public _handleTwoNavigationBars(backToMoreWillBeVisible: boolean) {
    //     // TODO
    //     // if (traceEnabled()) {
    //     //     traceWrite(`TabView._handleTwoNavigationBars(backToMoreWillBeVisible: ${backToMoreWillBeVisible})`, traceCategories.Debug);
    //     // }

    //     // The "< Back" and "< More" navigation bars should not be visible simultaneously.
    //     const page = this.page || this._selectedView.page || (<any>this)._selectedView.currentPage;
    //     if (!page || !page.frame) {
    //         return;
    //     }

    //     let actionBarVisible = page.frame._getNavBarVisible(page);

    //     if (backToMoreWillBeVisible && actionBarVisible) {
    //         page.frame.ios._disableNavBarAnimation = true;
    //         page.actionBarHidden = true;
    //         page.frame.ios._disableNavBarAnimation = false;
    //         this._actionBarHiddenByTabView = true;
    //         // TODO
    //         // if (traceEnabled()) {
    //         //     traceWrite(`TabView hid action bar`, traceCategories.Debug);
    //         // }
    //         return;
    //     }

    //     if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
    //         page.frame.ios._disableNavBarAnimation = true;
    //         page.actionBarHidden = false;
    //         page.frame.ios._disableNavBarAnimation = false;
    //         this._actionBarHiddenByTabView = undefined;
    //         // TODO
    //         // if (traceEnabled()) {
    //         //     traceWrite(`TabView restored action bar`, traceCategories.Debug);
    //         // }
    //         return;
    //     }
    // }

    private getViewController(item: TabContentItem): UIViewController {
        let newController: UIViewController = item.content ? item.content.viewController : null;

        if (newController) {
            (<any>item).setViewController(newController, newController.view);

            return newController;
        }

        if (item.content.ios instanceof UIViewController) {
            newController = item.content.ios;
            (<any>item).setViewController(newController, newController.view);
        } else if (item.content.ios && item.content.ios.controller instanceof UIViewController) {
            newController = item.content.ios.controller;
            (<any>item).setViewController(newController, newController.view);
        } else {
            newController = iosView.UILayoutViewController.initWithOwner(new WeakRef(item.content)) as UIViewController;
            newController.view.addSubview(item.content.nativeViewProtected);
            item.content.viewController = newController;
            (<any>item).setViewController(newController, item.content.nativeViewProtected);
        }

        return newController;
    }

    public _setCanBeLoaded(index: number) {
        const items = this.items;
        const lastIndex = items.length - 1;
        const offsideItems = this.offscreenTabLimit;

        iterateIndexRange(index, offsideItems, lastIndex, (i) => {
            if (items[i]) {
                (<TabContentItem>items[i]).canBeLoaded = true;
            }
        });
    }

    private setViewControllers(items: TabContentItem[]) {
        const length = items ? items.length : 0;
        if (length === 0) {
            // this._ios.setViewControllersDirectionAnimatedCompletion(null, null, false, null);
            return;
        }

        const viewControllers = [];

        items.forEach((item) => {
            const controller = this.getViewController(item);
            viewControllers.push(controller);
        });

        this.viewControllers = viewControllers;

        // const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(length);

        // const selectedItem = items[this.selectedIndex];
        // const controller = this.getViewController(selectedItem);
        // controllers.addObject(controller);

        // this._ios.setViewControllersDirectionAnimatedCompletion(controllers, UIPageViewControllerNavigationDirection.Forward, false, null);

        iterateIndexRange(this.selectedIndex, 1, this.items.length, (index) => {
            (<TabContentItem>items[index]).canBeLoaded = true;
        });

        // (<TabContentItemDefinition>selectedItem).canBeLoaded = true;

        // const nextItem = items[this.selectedIndex + 1];
        // (<TabContentItemDefinition>nextItem).canBeLoaded = true;

        // const states = getTitleAttributesForStates(this);

        // items.forEach((item, i) => {
        //     const controller = this.getViewController(item);

        //     let icon = null;
        //     let title = "";

        //     if (this.tabStrip && this.tabStrip.items && this.tabStrip.items[i]) {
        //         const tabStripItem = <TabStripItem>this.tabStrip.items[i];
        //         icon = this._getIcon(tabStripItem.iconSource);
        //         title = tabStripItem.title;

        //         const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((title || ""), icon, i);
        //         updateTitleAndIconPositions(tabStripItem, tabBarItem, controller);

        //         applyStatesToItem(tabBarItem, states);

        //         controller.tabBarItem = tabBarItem;
        //     }

        //     controllers.addObject(controller);
        //     (<TabContentItemDefinition>item).canBeLoaded = true;
        // });

        // this._ios.viewControllers = controllers;
        // this._ios.customizableViewControllers = null;

        // // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        // this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    }

    private setTabStripItems(items: Array<TabStripItem>) {
        if (!this.tabStrip || !items) {
            return;
        }

        const tabBarItems = [];

        items.forEach((item: TabStripItem, i) => {
            (<any>item).index = i;
            const tabBarItem = this.createTabBarItem(item, i);
            tabBarItems.push(tabBarItem);
            item.setNativeView(tabBarItem);
        });

        this.tabBarItems = tabBarItems;

        if (this.viewController && this.viewController.tabBar) {
            this.viewController.tabBar.itemAppearance = this.getTabBarItemAppearance();
            this.viewController.tabBar.items = NSArray.arrayWithArray(tabBarItems);
            // TODO: investigate why this call is necessary to actually toggle item appearance
            this.viewController.tabBar.sizeToFit();
            this.tabStrip.setNativeView(this.viewController.tabBar);
        }

        // const length = items ? items.length : 0;
        // if (length === 0) {
        //     this._tabLayout.setItems(null, null);
        //     return;
        // }

        // const tabItems = new Array<org.nativescript.widgets.TabItemSpec>();
        // items.forEach((item: TabStripItem, i, arr) => {
        //     const tabItemSpec = createTabItemSpec(item);
        //     (<any>item).index = i;
        //     (<any>item).tabItemSpec = tabItemSpec;
        //     tabItems.push(tabItemSpec);
        // });

        // const tabLayout = this._tabLayout;
        // tabLayout.setItems(tabItems, this._viewPager);
        // items.forEach((item, i, arr) => {
        //     const tv = tabLayout.getTextViewForItemAt(i);
        //     item.setNativeView(tv);
        // });
    }

    private createTabBarItem(item: TabStripItem, index: number): UITabBarItem {
        let image: UIImage;
        let title: string;

        if (item.isLoaded) {
            image = this.getIcon(item);
            title = item.label.text;

            if (!this.tabStrip._hasImage) {
                this.tabStrip._hasImage = !!image;
            }

            if (!this.tabStrip._hasTitle) {
                this.tabStrip._hasTitle = !!title;
            }
        }

        const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(title, image, index);

        return tabBarItem;
    }

    private getTabBarItemAppearance(): MDCTabBarItemAppearance {
        let itemAppearance;
        if (this.tabStrip._hasImage && this.tabStrip._hasTitle) {
            itemAppearance = MDCTabBarItemAppearance.TitledImages;
        } else if (this.tabStrip._hasImage) {
            itemAppearance = MDCTabBarItemAppearance.Images;
        } else {
            itemAppearance = MDCTabBarItemAppearance.Titles;
        }

        return itemAppearance;
    }

    private getIconRenderingMode(): UIImageRenderingMode {
        // MDCTabBar doesn't work with rendering mode AlwaysTemplate
        return UIImageRenderingMode.AlwaysOriginal;
    }

    private getIcon(tabStripItem: TabStripItem): UIImage {
        const iconSource = tabStripItem.image && tabStripItem.image.src;
        if (!iconSource) {
            return null;
        }

        const target = tabStripItem.image;
        const font = target.style.fontInternal;
        const color = tabStripItem.parent.style.color;
        const iconTag = [iconSource, font.fontStyle, font.fontWeight, font.fontSize, font.fontFamily, color].join(";");

        let image: UIImage = this._iconsCache[iconTag];
        if (!image) {
            let is = new ImageSource;
            if (isFontIconURI(iconSource)) {
                const fontIconCode = iconSource.split("//")[1];
                is = ImageSource.fromFontIconCodeSync(fontIconCode, font, color);
            } else {
                is = ImageSource.fromFileOrResourceSync(iconSource);
            }

            if (is && is.ios) {
                image = is.ios;

                if (this.tabStrip && this.tabStrip.isIconSizeFixed) {
                    image = this.getFixedSizeIcon(image);
                }

                const originalRenderedImage = image.imageWithRenderingMode(this.getIconRenderingMode());
                this._iconsCache[iconTag] = originalRenderedImage;
                image = originalRenderedImage;
            } else {
                // TODO
                // traceMissingIcon(iconSource);
            }
        }

        return image;
    }

    private getFixedSizeIcon(image: UIImage): UIImage {
        const inWidth = image.size.width;
        const inHeight = image.size.height;

        const iconSpecSize = getIconSpecSize({ width: inWidth, height: inHeight });

        const widthPts = iconSpecSize.width;
        const heightPts = iconSpecSize.height;

        UIGraphicsBeginImageContextWithOptions({ width: widthPts, height: heightPts }, false, layout.getDisplayDensity());
        image.drawInRect(CGRectMake(0, 0, widthPts, heightPts));
        let resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        return resultImage;
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

    public getTabBarBackgroundColor(): UIColor {
        return this._ios.tabBar.barTintColor;
    }

    public setTabBarBackgroundColor(value: UIColor | Color): void {
        this._ios.tabBar.barTintColor = value instanceof Color ? value.ios : value;
    }

    public getTabBarFontInternal(): UIFont {
        return this._ios.tabBar.unselectedItemTitleFont;
    }

    public setTabBarFontInternal(value: Font): void {
        const defaultTabItemFontSize = 10;
        const tabItemFontSize = this.tabStrip.style.fontSize || defaultTabItemFontSize;
        const font: UIFont = this.tabStrip.style.fontInternal.getUIFont(UIFont.systemFontOfSize(tabItemFontSize));

        this._ios.tabBar.unselectedItemTitleFont = font;
        this._ios.tabBar.selectedItemTitleFont = font;
    }

    public getTabBarTextTransform(): TextTransform {
        return null;
    }

    public setTabBarTextTransform(value: TextTransform): void {
        if (value === "none") {
            this._ios.tabBar.titleTextTransform = MDCTabBarTextTransform.None;
        } else if (value === "uppercase") {
            this._ios.tabBar.titleTextTransform = MDCTabBarTextTransform.Uppercase;
        }
    }

    public getTabBarColor(): UIColor {
        return this._ios.tabBar.titleColorForState(MDCTabBarItemState.Normal);
    }

    public setTabBarColor(value: UIColor | Color): void {
        const nativeColor = value instanceof Color ? value.ios : value;
        this._ios.tabBar.setTitleColorForState(nativeColor, MDCTabBarItemState.Normal);
        this._ios.tabBar.setTitleColorForState(nativeColor, MDCTabBarItemState.Selected);
    }

    public getTabBarHighlightColor(): UIColor {
        return this._ios.tabBar.tintColor;
    }

    public setTabBarHighlightColor(value: UIColor | Color) {
        const nativeColor = value instanceof Color ? value.ios : value;
        this._ios.tabBar.tintColor = nativeColor;
    }

    [selectedIndexProperty.setNative](value: number) {
        // TODO
        // if (traceEnabled()) {
        //     traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", traceCategories.Debug);
        // }

        if (value > -1) {
            const item = this.items[value];
            const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(1);

            let itemController = (<any>item).__controller;

            // if (!itemController) {
            //     itemController = this.getViewController(item);
            // }

            controllers.addObject(itemController);

            let navigationDirection = UIPageViewControllerNavigationDirection.Forward;

            if (this._currentNativeSelectedIndex && this._currentNativeSelectedIndex > value) {
                navigationDirection = UIPageViewControllerNavigationDirection.Reverse;
            }

            this._currentNativeSelectedIndex = value;
            this.viewController.setViewControllersDirectionAnimatedCompletion(controllers, navigationDirection, true, (finished: boolean) => {
                if (finished) {
                    if (majorVersion < 10) {
                        // HACK: UIPageViewController fix; see https://stackoverflow.com/a/17330606
                        invokeOnRunLoop(() => this.viewController.setViewControllersDirectionAnimatedCompletion(controllers, navigationDirection, false, null));
                    }
                    
                    this._canSelectItem = true;
                    this._setCanBeLoaded(value);
                    this._loadUnloadTabItems(value);
                }
            });

            if (this.tabBarItems && this.tabBarItems.length && this.viewController && this.viewController.tabBar) {
                this.viewController.tabBar.setSelectedItemAnimated(this.tabBarItems[value], true);
            }
            // TODO:
            // (<any>this._ios)._willSelectViewController = this._ios.viewControllers[value];
            // this._ios.selectedIndex = value;
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
        this.setTabStripItems(value.items);
    }

    [swipeEnabledProperty.getDefault](): boolean {
        return true;
    }
    [swipeEnabledProperty.setNative](value: boolean) {
        if (this.viewController && this.viewController.scrollView) {
            this.viewController.scrollView.scrollEnabled = value;
        }
    }
}
