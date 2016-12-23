import * as actionTestsCommon from "./action-bar-tests-common";
import * as TKUnit from "../../TKUnit";
import { ActionItem } from "ui/action-bar";
import { Visibility } from "ui/enums";

global.moduleMerge(actionTestsCommon, exports);

export function test_actionItem_visibility() {
    const actionItem = new ActionItem();
    actionItem.text = "Test";
    const page = actionTestsCommon.createPageAndNavigate();
    page.actionBar.actionItems.addItem(actionItem);
    const toolbar = <android.support.v7.widget.Toolbar>(<any>page.actionBar)._toolbar;
    const menu = toolbar.getMenu();

    TKUnit.assertTrue(menu.hasVisibleItems(), "Visibility does not work");
    actionItem.visibility = Visibility.collapse;
    TKUnit.assertFalse(menu.hasVisibleItems(), "Visibility does not work");
}

export function test_navigationButton_visibility() {
    const actionItem = new ActionItem();
    actionItem.icon = "~/small-image.png";
    const page = actionTestsCommon.createPageAndNavigate();
    page.actionBar.navigationButton = actionItem;

    const toolbar = <android.support.v7.widget.Toolbar>(<any>page.actionBar)._toolbar;

    TKUnit.assertNotNull(toolbar.getNavigationIcon(), "Visibility does not work");
    actionItem.visibility = Visibility.collapse;
    TKUnit.assertNull(toolbar.getNavigationIcon(), "Visibility does not work");
}