import * as actionTestsCommon from "./action-bar-tests-common";
import * as TKUnit from "../../TKUnit";
import { ActionItem } from "ui/action-bar";
import { Visibility } from "ui/enums";
import { Button } from "ui/button";

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

export function test_set_actionView_to_attached_actionItem_propagates_context() {
    const actionItem = new ActionItem();
    const actionButton = new Button();
    actionItem.actionView = actionButton;

    const page = actionTestsCommon.createPageAndNavigate();

    // sanity check
    TKUnit.assertNotNull(page.content._context, "Page content context should not be null");

    // assert null before add
    TKUnit.assertNull(actionItem._context, "Action Item context should be null before added");
    TKUnit.assertNull(actionButton._context, "Action button context should not null before added");

    page.actionBar.actionItems.addItem(actionItem);

    // assert not null after add
    TKUnit.assertNotNull(actionItem._context, "Action Item context should not be null after add");
    TKUnit.assertNotNull(actionButton._context, "Action button context should not be null after add");
}

export function test_add_actionItem_with_actionView_propagates_context() {
    const actionItem = new ActionItem();

    const page = actionTestsCommon.createPageAndNavigate();

    // sanity check
    TKUnit.assertNotNull(page.content._context, "Page content context should not be null");

    // add actionItem to the actionBar
    TKUnit.assertNull(actionItem._context, "Action Item context should be null before added");
    page.actionBar.actionItems.addItem(actionItem);
    TKUnit.assertNotNull(actionItem._context, "Action Item context should not be null after add");

    const actionButton = new Button();

    // add actionButton to the actionItem
    TKUnit.assertNull(actionButton._context, "Action button context should be null before added");
    actionItem.actionView = actionButton;
    TKUnit.assertNotNull(actionButton._context, "Action button context should not be null after add");
}
