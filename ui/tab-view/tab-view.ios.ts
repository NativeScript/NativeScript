import common = require("./tab-view-common");
import definition = require("ui/tab-view");
import dependencyObservable = require("ui/core/dependency-observable");
import trace = require("trace");
import utils = require("utils/utils");
import uiUtils = require("ui/utils");
import view = require("ui/core/view");
import imageSource = require("image-source");
import types = require("utils/types");

global.moduleMerge(common, exports);

class UITabBarControllerImpl extends UITabBarController {
    static new(): UITabBarControllerImpl {
        return <UITabBarControllerImpl>super.new();
    }

    private _owner: TabView;

    public initWithOwner(owner: TabView): UITabBarControllerImpl {
        this._owner = owner;
        return this;
    }

    public viewDidLayoutSubviews(): void {
        trace.write("TabView.UITabBarControllerClass.viewDidLayoutSubviews();", trace.categories.Debug);
        super.viewDidLayoutSubviews();
        if (this._owner.isLoaded) {
            this._owner._updateLayout();
        }
    }
}

class UITabBarControllerDelegateImpl extends NSObject implements UITabBarControllerDelegate {
    public static ObjCProtocols = [UITabBarControllerDelegate];

    static new(): UITabBarControllerDelegateImpl {
        return <UITabBarControllerDelegateImpl>super.new();
    }

    private _owner: TabView;

    public initWithOwner(owner: TabView): UITabBarControllerDelegateImpl {
        this._owner = owner;
        return this;
    }

    public tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): void {
        trace.write("TabView.UITabBarControllerDelegateClass.tabBarControllerDidSelectViewController(" + tabBarController + ", " + viewController + ");", trace.categories.Debug);
        this._owner._onViewControllerShown(viewController);
    }
}

class UINavigationControllerDelegateImpl extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    static new(): UINavigationControllerDelegateImpl {
        return <UINavigationControllerDelegateImpl>super.new();
    }

    private _owner: TabView;

    public initWithOwner(owner: TabView): UINavigationControllerDelegateImpl {
        this._owner = owner;
        return this;
    }

    navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        trace.write("TabView.UINavigationControllerDelegateClass.navigationControllerDidShowViewControllerAnimated(" + navigationController + ", " + viewController + ", " + animated + ");", trace.categories.Debug);
        // We don't need Edit button in More screen.
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        this._owner._onViewControllerShown(viewController);
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
                if (utils.ios.MajorVersion <= 8) {
                    tabBarItem.setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
                }
                else if (utils.ios.MajorVersion > 8) {
                    (<any>tabBarItem).titlePositionAdjustment = { horizontal: 0, vertical: -20 };
                }
            }
            this._controller.tabBarItem = tabBarItem;
        }
    }
}

export class TabView extends common.TabView {
    private _ios: UITabBarControllerImpl;
    private _delegate: UITabBarControllerDelegateImpl;
    private _moreNavigationControllerDelegate: UINavigationControllerDelegateImpl;
    private _tabBarHeight: number = 0;
    private _navBarHeight: number = 0;
    private _iconsCache = {};

    constructor() {
        super();

        this._ios = UITabBarControllerImpl.new().initWithOwner(this);

        this._delegate = UITabBarControllerDelegateImpl.new().initWithOwner(this);

        this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.new().initWithOwner(this);
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

    get ios(): UIViewController {
        return this._ios;
    }

    get _nativeView(): UIView {
        return this._ios.view;
    }

    public _onViewControllerShown(viewController: UIViewController) {
        // This method could be called with the moreNavigationController or its list controller, so we have to check.
        trace.write("TabView._onViewControllerShown(" + viewController + ");", trace.categories.Debug);
        if (this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);;
        }
        else {
            trace.write("TabView._onViewControllerShown: viewController is not one of our viewControllers", trace.categories.Debug);
        }
    }

    public _removeTabs(oldItems: Array<definition.TabViewItem>) {
        trace.write("TabView._removeTabs(" + oldItems + ");", trace.categories.Debug);
        super._removeTabs(oldItems);

        var i: number;
        var length = oldItems.length;
        var oldItem: TabViewItem;
        for (i = 0; i < length; i++) {
            oldItem = <TabViewItem>oldItems[i];
            oldItem._parent = null;
            oldItem._controller = null;
            this._removeView(oldItem.view);
        }

        this._ios.viewControllers = null;
    }

    public _addTabs(newItems: Array<definition.TabViewItem>) {
        trace.write("TabView._addTabs(" + newItems + ");", trace.categories.Debug);
        super._addTabs(newItems);

        var i: number;
        var length = newItems.length;
        var item: TabViewItem;
        var newControllers: NSMutableArray = NSMutableArray.alloc().initWithCapacity(length);
        var newController: UIViewController;

        for (i = 0; i < length; i++) {
            item = <TabViewItem>newItems[i];

            this._addView(item.view);

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
                if (utils.ios.MajorVersion <= 8) {
                    tabBarItem.setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
                }
                else if (utils.ios.MajorVersion > 8) {
                    (<any>tabBarItem).titlePositionAdjustment = { horizontal: 0, vertical: -20 };
                }
            }
            newController.tabBarItem = tabBarItem;
            newControllers.addObject(newController);
        }

        this._ios.viewControllers = newControllers;
        this._ios.customizableViewControllers = null;

        // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    }

    public _getIcon(iconSource: string): UIImage {
        if (!iconSource) {
            return null;
        }

        var image: UIImage;
        image = this._iconsCache[iconSource];
        if (!image) {
            var is = imageSource.fromFileOrResource(iconSource);
            if (is && is.ios) {
                is.ios.renderingMode = UIImageRenderingMode.UIImageRenderingModeAlwaysOriginal;
                this._iconsCache[iconSource] = is.ios;
                image = is.ios;
            }
        }

        return image;
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChangedSetNativeValue(data);

        var newIndex = data.newValue;
        trace.write("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + newIndex + ")", trace.categories.Debug);
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

            this._tabBarHeight = uiUtils.ios.getActualHeight(this._ios.tabBar);
            this._navBarHeight = uiUtils.ios.getActualHeight(this._ios.moreNavigationController.navigationBar);

            var density = utils.layout.getDisplayDensity();
            var measureWidth = 0;
            var measureHeight = 0;

            var child = this._selectedView;
            if (child) {
                var childHeightMeasureSpec = utils.layout.makeMeasureSpec(height - (this._navBarHeight + this._tabBarHeight), heightMode);
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

}
