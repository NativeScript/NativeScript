import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import builder = require("ui/builder");
import actionBar = require("ui/action-bar");
import button = require("ui/button");
import PageModule = require("ui/page");

export function test_actionItem_inherit_bindingContext() {
    var page: PageModule.Page;
    var label: LabelModule.Label;
    var context = { text: "item" };

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.bindingContext = context;
        var actionItem = new actionBar.ActionItem();

        actionItem.bind({
            sourceProperty: "text",
            targetProperty: "text"
        });

        page.actionBar.actionItems.addItem(actionItem);

        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        TKUnit.assertEqual(page.actionBar.actionItems.getItemAt(0).text, "item", "actionItem.text");
    }
    finally {
        helper.goBack();
    }
}

export function test_actionBar_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar title=\"{{ myProp }} \" /> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    TKUnit.assertEqual(p.actionBar.title, "success", "actionBar.title");
};

export function test_actionItem_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.actionItems>" +
        "<ActionItem text=\"{{ myProp }} \" />" + 
        "</ActionBar.actionItems> </ActionBar> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    var actionItem = p.actionBar.actionItems.getItemAt(0);

    TKUnit.assertEqual(actionItem.text, "success", "actionItem.text");
};

export function test_navigationButton_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar>" +
        "<NavigationButton text=\"{{ myProp }} \" />" +
        "</ActionBar> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    var navButton = p.actionBar.navigationButton;
    TKUnit.assertEqual(navButton.text, "success", "actionItem.text");
};

export function test_centerView_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.centerView>" +
        "<Button text=\"{{ myProp }} \" />" +
        "</ActionBar.centerView> </ActionBar> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    var centerBtn = <button.Button>p.actionBar.centerView;
    TKUnit.assert(centerBtn instanceof button.Button, "cneterView not loaded correctly");
    TKUnit.assertEqual(centerBtn.text, "success", "actionItem.text");
};

export function test_centerView_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.centerView>" +
        "<Button/>" +
        "</ActionBar.centerView> </ActionBar> </Page.actionBar> </Page>");

    var centerBtn = <button.Button>p.actionBar.centerView;
    TKUnit.assert(centerBtn instanceof button.Button, "cneterView not loaded correctly");
};

export function test_centerView_inXML_short_definition() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar>" +
        "<Button/>" +
        "</ActionBar> </Page.actionBar> </Page>");

    var centerBtn = <button.Button>p.actionBar.centerView;
    TKUnit.assert(centerBtn instanceof button.Button, "cneterView not loaded correctly");
};

export function test_Setting_ActionItems_doesnt_thrown() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var gotException = false;

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        var actionItem = new actionBar.ActionItem();
        actionItem.text = "Item";
        page.actionBar.actionItems.addItem(actionItem);

        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    try {
        helper.navigate(pageFactory);
    }
    catch (e) {
        gotException = true;
    }

    try {
        TKUnit.assert(!gotException, "Expected: false, Actual: " + gotException);
    }
    finally {
        helper.goBack();
    }
}
