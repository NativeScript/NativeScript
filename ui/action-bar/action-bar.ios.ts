import common = require("./action-bar-common");
import dts = require("ui/action-bar");
import imageSource = require("image-source");
import frameModule = require("ui/frame");
import enums = require("ui/enums");
import view = require("ui/core/view");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class ActionItem extends common.ActionItemBase implements dts.ActionItem {
    private _ios: dts.IOSActionItemSettings = { position: enums.IOSActionItemPosition.left };
    public get ios(): dts.IOSActionItemSettings {
        return this._ios;
    }
    public set ios(value: dts.IOSActionItemSettings) {
        throw new Error("ActionItem.android is read-only");
    }

    // Not used in IOS
    public android: dts.AndroidActionItemSettings;
}

export class ActionBar extends common.ActionBar {
    public update() {
        // Page should be attached to frame to update the action bar.
        if (!(this.page && this.page.parent)) {
            return;
        }

        var viewController = (<UIViewController>this.page.ios);
        var navigationItem: UINavigationItem = viewController.navigationItem;
        var navController = frameModule.topmost().ios.controller;
        var navigationBar = navController.navigationBar;
        var previousController: UIViewController;

        // Set Title
        navigationItem.title = this.title;

        if (this.titleView && this.titleView.ios) {
            console.log("setting center view: " + this.titleView.ios);
            navigationItem.titleView = this.titleView.ios;
        }

        // Find previous ViewController in the navigation stack
        var indexOfViewController = navController.viewControllers.indexOfObject(viewController);
        if (indexOfViewController < navController.viewControllers.count && indexOfViewController > 0) {
            previousController = navController.viewControllers[indexOfViewController - 1];
        }
   
        // Set back button text
        if (previousController) {
            if (this.navigationButton) {
                var tapHandler = TapBarItemHandlerImpl.new().initWithOwner(this.navigationButton);
                var barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(this.navigationButton.text + "", UIBarButtonItemStyle.UIBarButtonItemStylePlain, tapHandler, "tap");
                previousController.navigationItem.backBarButtonItem = barButtonItem;
            }
            else {
                previousController.navigationItem.backBarButtonItem = null;
            }
        }

        // Set back button image
        var img: imageSource.ImageSource;
        if (this.navigationButton && this.navigationButton.icon) {
            img = imageSource.fromFileOrResource(this.navigationButton.icon);
        }

        // TODO: This could cause issue when canceling BackEdge gesture - we will change the backIndicator to 
        // show the one from the old page but the new page will still be visible (because we canceled EdgeBackSwipe gesutre)
        // Consider moving this to new method and call it from - navigationControllerDidShowViewControllerAnimated.
        if (img && img.ios) {
            var image = img.ios.imageWithRenderingMode(UIImageRenderingMode.UIImageRenderingModeAlwaysOriginal)
            navigationBar.backIndicatorImage = image;
            navigationBar.backIndicatorTransitionMaskImage = image;
        }
        else {
            navigationBar.backIndicatorImage = null;
            navigationBar.backIndicatorTransitionMaskImage = null;
        }

        // Populate action items
        this.populateMenuItems(navigationItem);
    }

    private populateMenuItems(navigationItem: UINavigationItem) {
        var items = this.actionItems.getItems();
        var leftBarItems = [];
        var rightBarItems = [];

        for (var i = 0; i < items.length; i++) {
            var barButtonItem = this.createBarButtonItem(items[i]);
            if (items[i].ios.position === enums.IOSActionItemPosition.left) {
                leftBarItems.push(barButtonItem);
            }
            else {
                rightBarItems.push(barButtonItem);
            }
        }

        var leftArray: NSMutableArray = leftBarItems.length > 0 ? NSMutableArray.new() : null;
        leftBarItems.forEach((barItem, i, a) => leftArray.addObject(barItem));

        // Right items should be added in reverse because they are added from right to left
        var rightArray: NSMutableArray = rightBarItems.length > 0 ? NSMutableArray.new() : null;
        rightBarItems.reverse();
        rightBarItems.forEach((barItem, i, a) => rightArray.addObject(barItem));

        navigationItem.leftItemsSupplementBackButton = true;
        navigationItem.setLeftBarButtonItemsAnimated(leftArray, true);
        navigationItem.setRightBarButtonItemsAnimated(rightArray, true);
    }

    private createBarButtonItem(item: dts.ActionItem): UIBarButtonItem {
        var tapHandler = TapBarItemHandlerImpl.new().initWithOwner(item);
        // associate handler with menuItem or it will get collected by JSC.
        (<any>item).handler = tapHandler;

        var barButtonItem: UIBarButtonItem;
        if (item.icon) {
            var img = imageSource.fromFileOrResource(item.icon);
            if (img && img.ios) {
                barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(img.ios, UIBarButtonItemStyle.UIBarButtonItemStylePlain, tapHandler, "tap");
            }
        }
        else {
            barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + "", UIBarButtonItemStyle.UIBarButtonItemStylePlain, tapHandler, "tap");
        }

        return barButtonItem;
    }
    
    public _onTitlePropertyChanged() {
        if (!this.page) {
            return;
        }

        var navigationItem: UINavigationItem = (<UIViewController>this.page.ios).navigationItem;
        navigationItem.title = this.title;
    }

    private _navigationBarHeight: number = 0;
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        
        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        let navBarWidth = 0;
        let navBarHeight = 0;

        let frame = <frameModule.Frame>this.page.frame;
        if (frame) {
            let navBar: UIView = frame.ios.controller.navigationBar;
            if (!navBar.hidden) {
                let navBarSize = navBar.sizeThatFits(CGSizeMake(
                    (widthMode === utils.layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : width,
                    (heightMode === utils.layout.UNSPECIFIED) ? Number.POSITIVE_INFINITY : height));
                navBarWidth = navBarSize.width;
                navBarHeight = navBarSize.height;
            }
        }

        this._navigationBarHeight = navBarHeight;
        if (this.titleView) {
            view.View.measureChild(this, this.titleView,
                utils.layout.makeMeasureSpec(width, utils.layout.AT_MOST),
                utils.layout.makeMeasureSpec(navBarHeight, utils.layout.AT_MOST));
        }

        // We ignore our width/height, minWidth/minHeight dimensions because it is against Apple policy to change height of NavigationBar.
        this.setMeasuredDimension(navBarWidth, navBarHeight);
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        view.View.layoutChild(this, this.titleView, 0, 0, right - left, this._navigationBarHeight);
        super.onLayout(left, top, right, bottom);
    }

    public _shouldApplyStyleHandlers() {
        var topFrame = frameModule.topmost();
        return !!topFrame;
    }
}

class TapBarItemHandlerImpl extends NSObject {
    static new(): TapBarItemHandlerImpl {
        return <TapBarItemHandlerImpl>super.new();
    }

    private _owner: dts.ActionItemBase;

    public initWithOwner(owner: dts.ActionItemBase): TapBarItemHandlerImpl {
        this._owner = owner;
        return this;
    }

    public tap(args) {
        this._owner._raiseTap();
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}
