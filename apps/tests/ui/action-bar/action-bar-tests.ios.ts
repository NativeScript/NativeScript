import actionTestsCommon = require("./action-bar-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import view = require("ui/core/view");
import actionBar = require("ui/action-bar");
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
        helper.goBack();
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
        helper.goBack();
    }
}

export function test_actionItem_visibility() {
    var actionItem = new actionBar.ActionItem();
    actionItem.text = "Test";
    actionItem.ios.position = "left";
    var page = actionTestsCommon.createPageAndNavigate();

    try {
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
    finally {
        helper.goBack();
    }
}

export function test_navigationButton_visibility() {
    var actionItem = new actionBar.ActionItem();
    actionItem.text = "Test";
    var page = actionTestsCommon.createPageAndNavigate();
    try {
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
    finally {
        helper.goBack();
    }
}
