import { IOSActionItemSettings, ActionItem as ActionItemDefinition } from ".";
import { ActionItemBase, ActionBarBase, isVisible, View, colorProperty, backgroundColorProperty, backgroundInternalProperty, flatProperty, layout, Color } from "./action-bar-common";
import { ImageSource, fromFileOrResource } from "../../image-source";

export * from "./action-bar-common";

class TapBarItemHandlerImpl extends NSObject {
    private _owner: WeakRef<ActionItemDefinition>;

    public static initWithOwner(owner: WeakRef<ActionItemDefinition>): TapBarItemHandlerImpl {
        let handler = <TapBarItemHandlerImpl>TapBarItemHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public tap(args) {
        let owner = this._owner.get();
        if (owner) {
            owner._raiseTap();
        }
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}

export class ActionItem extends ActionItemBase {
    private _ios: IOSActionItemSettings = {
        position: "left",
        systemIcon: undefined
    };

    public get ios(): IOSActionItemSettings {
        return this._ios;
    }
    public set ios(value: IOSActionItemSettings) {
        throw new Error("ActionItem.ios is read-only");
    }
}

export class NavigationButton extends ActionItem {

}

export class ActionBar extends ActionBarBase {

    get ios(): UIView {
        let page = this.page;
        if (!page || !page.parent) {
            return;
        }

        let viewController = (<UIViewController>page.ios);
        if (viewController.navigationController !== null) {
            return viewController.navigationController.navigationBar;
        }

        return null;
    }

    public createNativeView(): UIView {
        return this.ios;
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        } else if (value instanceof ActionItem) {
            this.actionItems.addItem(value);
        } else if (value instanceof View) {
            this.titleView = value;
        }
    }

    public update() {
        const page = this.page;
        // Page should be attached to frame to update the action bar.
        if (!page || !page.parent) {
            return;
        }

        let viewController = (<UIViewController>page.ios);
        let navigationItem: UINavigationItem = viewController.navigationItem;
        let navController = <UINavigationController>page.frame.ios.controller;
        let navigationBar = navController ? navController.navigationBar : null;
        let previousController: UIViewController;

        // Set Title
        navigationItem.title = this.title;

        if (this.titleView && this.titleView.ios) {
            navigationItem.titleView = this.titleView.ios;
        } else {
            navigationItem.titleView = null;
        }

        // Find previous ViewController in the navigation stack
        const indexOfViewController = navController.viewControllers.indexOfObject(viewController);
        if (indexOfViewController < navController.viewControllers.count && indexOfViewController > 0) {
            previousController = navController.viewControllers[indexOfViewController - 1];
        }

        // Set back button text
        if (previousController) {
            if (this.navigationButton) {
                let tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(this.navigationButton));
                let barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(this.navigationButton.text + "", UIBarButtonItemStyle.Plain, tapHandler, "tap");
                previousController.navigationItem.backBarButtonItem = barButtonItem;
            } else {
                previousController.navigationItem.backBarButtonItem = null;
            }
        }

        // Set back button image
        let img: ImageSource;
        if (this.navigationButton && isVisible(this.navigationButton) && this.navigationButton.icon) {
            img = fromFileOrResource(this.navigationButton.icon);
        }

        // TODO: This could cause issue when canceling BackEdge gesture - we will change the backIndicator to
        // show the one from the old page but the new page will still be visible (because we canceled EdgeBackSwipe gesutre)
        // Consider moving this to new method and call it from - navigationControllerDidShowViewControllerAnimated.
        if (img && img.ios) {
            let image = img.ios.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal);
            navigationBar.backIndicatorImage = image;
            navigationBar.backIndicatorTransitionMaskImage = image;
        } else {
            navigationBar.backIndicatorImage = null;
            navigationBar.backIndicatorTransitionMaskImage = null;
        }

        // Set back button visibility
        if (this.navigationButton) {
            navigationItem.setHidesBackButtonAnimated(!isVisible(this.navigationButton), true);
        }

        // Populate action items
        this.populateMenuItems(navigationItem);

        // update colors explicitly - they may have to be cleared form a previous page
        this.updateColors(navigationBar);

        // the 'flat' property may have changed in between pages
        this.updateFlatness(navigationBar);
    }

    private populateMenuItems(navigationItem: UINavigationItem) {
        const items = this.actionItems.getVisibleItems();
        const leftBarItems = [];
        const rightBarItems = [];
        for (let i = 0; i < items.length; i++) {
            const barButtonItem = this.createBarButtonItem(items[i]);
            if (items[i].ios.position === "left") {
                leftBarItems.push(barButtonItem);
            } else {
                rightBarItems.splice(0, 0, barButtonItem);
            }
        }

        navigationItem.setLeftBarButtonItemsAnimated(<any>leftBarItems, false);
        navigationItem.setRightBarButtonItemsAnimated(<any>rightBarItems, false);
        if (leftBarItems.length > 0) {
            navigationItem.leftItemsSupplementBackButton = true;
        }
    }

    private createBarButtonItem(item: ActionItemDefinition): UIBarButtonItem {
        const tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(item));
        // associate handler with menuItem or it will get collected by JSC.
        (<any>item).handler = tapHandler;

        let barButtonItem: UIBarButtonItem;
        if (item.actionView && item.actionView.ios) {
            let recognizer = UITapGestureRecognizer.alloc().initWithTargetAction(tapHandler, "tap");
            item.actionView.ios.addGestureRecognizer(recognizer);
            barButtonItem = UIBarButtonItem.alloc().initWithCustomView(item.actionView.ios);
        } else if (item.ios.systemIcon !== undefined) {
            let id: number = item.ios.systemIcon;
            if (typeof id === "string") {
                id = parseInt(id);
            }

            barButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(id, tapHandler, "tap");
        } else if (item.icon) {
            const img = fromFileOrResource(item.icon);
            if (img && img.ios) {
                barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(img.ios, UIBarButtonItemStyle.Plain, tapHandler, "tap");
            } else {
                throw new Error("Error loading icon from " + item.icon);
            }
        } else {
            barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + "", UIBarButtonItemStyle.Plain, tapHandler, "tap");
        }

        if (item.text) {
            barButtonItem.isAccessibilityElement = true;
            barButtonItem.accessibilityLabel = item.text;
            barButtonItem.accessibilityTraits = UIAccessibilityTraitButton;
        }

        return barButtonItem;
    }

    private updateColors(navBar: UINavigationBar) {
        const color = this.color;
        if (color) {
            navBar.titleTextAttributes = <any>{ [NSForegroundColorAttributeName]: color.ios };
            navBar.tintColor = color.ios;
        } else {
            navBar.titleTextAttributes = null;
            navBar.tintColor = null;
        }

        const bgColor = <Color>this.backgroundColor;
        navBar.barTintColor = bgColor ? bgColor.ios : null;
    }

    public _onTitlePropertyChanged() {
        const page = this.page;
        if (!page) {
            return;
        }

        if (page.frame) {
            page.frame._updateActionBar();
        }

        let navigationItem: UINavigationItem = (<UIViewController>page.ios).navigationItem;
        navigationItem.title = this.title;
    }

    private updateFlatness(navBar: UINavigationBar) {
        if (this.flat) {
            navBar.setBackgroundImageForBarMetrics(UIImage.new(), UIBarMetrics.Default);
            navBar.shadowImage = UIImage.new();
            navBar.translucent = false;
        } else {
            navBar.setBackgroundImageForBarMetrics(null, null);
            navBar.shadowImage = null;
            navBar.translucent = true;
        }
    }

    private _navigationBarHeight: number = 0;
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let navBarWidth = 0;
        let navBarHeight = 0;

        const frame = this.page.frame;
        if (frame) {
            let navBar: UIView = frame.ios.controller.navigationBar;
            if (!navBar.hidden) {
                const desiredSize = layout.measureNativeView(navBar, width, widthMode, height, heightMode);
                navBarWidth = desiredSize.width;
                navBarHeight = desiredSize.height;
            }
        }

        this._navigationBarHeight = navBarHeight;
        if (this.titleView) {
            View.measureChild(this, this.titleView,
                layout.makeMeasureSpec(width, layout.AT_MOST),
                layout.makeMeasureSpec(navBarHeight, layout.AT_MOST));
        }

        this.actionItems.getItems().forEach((actionItem) => {
            if (actionItem.actionView) {
                View.measureChild(this, actionItem.actionView,
                    layout.makeMeasureSpec(width, layout.AT_MOST),
                    layout.makeMeasureSpec(navBarHeight, layout.AT_MOST));
            }
        });

        // We ignore our width/height, minWidth/minHeight dimensions because it is against Apple policy to change height of NavigationBar.
        this.setMeasuredDimension(navBarWidth, navBarHeight);
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        View.layoutChild(this, this.titleView, 0, 0, right - left, this._navigationBarHeight);
        this.actionItems.getItems().forEach((actionItem) => {
            if (actionItem.actionView && actionItem.actionView.ios) {
                let measuredWidth = actionItem.actionView.getMeasuredWidth();
                let measuredHeight = actionItem.actionView.getMeasuredHeight();
                View.layoutChild(this, actionItem.actionView, 0, 0, measuredWidth, measuredHeight);
            }
        });

        super.onLayout(left, top, right, bottom);
        let navigationBar = this.ios;
        if (navigationBar) {
            navigationBar.setNeedsLayout();
        }
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number) {
        return;
    }

    // public _shouldApplyStyleHandlers() {
    //     let topFrame = frameModule.topmost();
    //     return !!topFrame;
    // }

    private get navBar(): UINavigationBar {
        const page = this.page;
        // Page should be attached to frame to update the action bar.
        if (!page || !page.frame) {
            return undefined;
        }

        return (<UINavigationController>page.frame.ios.controller).navigationBar;
    }

    [colorProperty.getDefault](): UIColor {
        return null;
    }
    [colorProperty.setNative](color: Color) {
        const navBar = this.navBar;
        if (color) {
            navBar.tintColor = color.ios;
            navBar.titleTextAttributes = <any>{ [NSForegroundColorAttributeName]: color.ios };
        } else {
            navBar.tintColor = null;
            navBar.titleTextAttributes = null;
        }
    }

    [backgroundColorProperty.getDefault](): UIColor {
        // This getter is never called.
        // CssAnimationProperty use default value form their constructor.
        return null;
    }
    [backgroundColorProperty.setNative](value: UIColor | Color) {
        let navBar = this.navBar;
        if (navBar) {
            let color = value instanceof Color ? value.ios : value;
            navBar.barTintColor = color;
        }
    }

    [backgroundInternalProperty.getDefault](): UIColor {
        return null;
    }
    [backgroundInternalProperty.setNative](value: UIColor) { // tslint:disable-line
    }

    [flatProperty.setNative](value: boolean) { // tslint:disable-line
        let navBar = this.navBar;
        if (navBar) {
            this.updateFlatness(navBar);
        }
    }
}