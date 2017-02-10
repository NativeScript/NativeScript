import * as actionTestsCommon from "./action-bar-tests-common";
import * as PageModule from "ui/page";
import * as TKUnit from "../../TKUnit";
import * as LabelModule from "ui/label";
import * as helper from "../helper";
import * as view from "ui/core/view";
import * as actionBar from "ui/action-bar";
import { Visibility } from "ui/enums";

global.moduleMerge(actionTestsCommon, exports);

export function test_NavBar_isVisible_when_MenuItems_areSet() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var navBarIsVisible = false;

    var handler = function (data) {
        page.off(PageModule.Page.navigatedToEvent, handler);
        navBarIsVisible = (<any>page.frame.ios).showNavigationBar;
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(PageModule.Page.navigatedToEvent, handler);

        var mi = new actionBar.ActionItem();
        mi.text = "B";
        page.actionBar.actionItems.addItem(mi);
        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        TKUnit.assert(navBarIsVisible, "Expected: true, Actual: " + navBarIsVisible);
    }
    finally {
        page.off(view.View.loadedEvent, handler);
    }
}

export function test_NavBarItemsAreClearedFromNativeWhenClearedFromNativeScript() {
    var page: PageModule.Page;
    var label: LabelModule.Label;

    var handler = function (data) {
        page.off(PageModule.Page.navigatedToEvent, handler);
        var menuItems = page.actionBar.actionItems.getItems();
        var i;
        for (i = menuItems.length - 1; i >= 0; i--) {
            page.actionBar.actionItems.removeItem(menuItems[i]);
        }
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(PageModule.Page.navigatedToEvent, handler);

        var mi = new actionBar.ActionItem();
        mi.text = "B";
        page.actionBar.actionItems.addItem(mi);
        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        var navigationItem: UINavigationItem = ((<UIViewController>page.ios).navigationItem);
        var rightBarButtonItemsCount = navigationItem.rightBarButtonItems ? navigationItem.rightBarButtonItems.count : 0;
        TKUnit.assertEqual(rightBarButtonItemsCount, 0, "After remove all items native items should be 0.");
    }
    finally {
        page.off(view.View.loadedEvent, handler);
    }
}

export function test_actionItem_visibility() {
    var actionItem = new actionBar.ActionItem();
    actionItem.text = "Test";
    actionItem.ios.position = "left";
    var page = actionTestsCommon.createPageAndNavigate();

    page.actionBar.actionItems.addItem(actionItem);

    var viewController = (<UIViewController>page.ios);
    var navigationItem: UINavigationItem = viewController.navigationItem;

    var leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;
    TKUnit.assertEqual(leftBarButtonItemsCount, 1, "Visibility does not work");
    actionItem.visibility = Visibility.collapse;

    TKUnit.waitUntilReady(() => {
        leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;

        return leftBarButtonItemsCount === 0;
    });

    leftBarButtonItemsCount = navigationItem.leftBarButtonItems ? navigationItem.leftBarButtonItems.count : 0;
    TKUnit.assertEqual(leftBarButtonItemsCount, 0, "Visibility does not work");
}

export function test_navigationButton_visibility() {
    var actionItem = new actionBar.ActionItem();
    actionItem.text = "Test";
    var page = actionTestsCommon.createPageAndNavigate();

    page.actionBar.navigationButton = actionItem;

    var viewController = (<UIViewController>page.ios);
    var navigationItem: UINavigationItem = viewController.navigationItem;

    TKUnit.assertFalse(navigationItem.hidesBackButton, "Visibility does not work");
    actionItem.visibility = Visibility.collapse;

    TKUnit.waitUntilReady(() => {
        return navigationItem.hidesBackButton;
    });

    TKUnit.assertTrue(navigationItem.hidesBackButton, "Visibility does not work");
}