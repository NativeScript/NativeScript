import * as TKUnit from "../../TKUnit";
import * as LabelModule from "ui/label";
import * as helper from "../helper";
import * as builder from "ui/builder";
import * as button from "ui/button";
import * as PageModule from "ui/page";
import * as viewModule from "ui/core/view";
import * as fs from "file-system";
import { Observable } from "data/observable";

// >> actionbar-common-require
import * as actionBarModule from "ui/action-bar";
// << actionbar-common-require

export function test_actionItem_inherit_bindingContext() {
    var page: PageModule.Page;
    var label: LabelModule.Label;
    var context = { text: "item" };

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.bindingContext = context;
        var actionItem = new actionBarModule.ActionItem();

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

    TKUnit.assertEqual(page.actionBar.actionItems.getItemAt(0).text, "item", "actionItem.text");
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

export function test_actionItem_page_property_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.actionItems>" +
        "<ActionItem text=\"test\" />" +
        "</ActionBar.actionItems> </ActionBar> </Page.actionBar> </Page>");

    var actionItem = p.actionBar.actionItems.getItemAt(0);

    TKUnit.assertEqual(actionItem.page, p, "actionItem.page");
};

export function test_actionItem_actionView_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>" +
        "<Label/>" +
        "</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>");

    var label = <LabelModule.Label>p.actionBar.actionItems.getItemAt(0).actionView;
    TKUnit.assert(label instanceof LabelModule.Label, "ActionItem.actionView not loaded correctly");
};

export function test_actionItem_actionView_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>" +
        "<Label text=\"{{ myProp }} \" />" +
        "</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    var label = <LabelModule.Label>p.actionBar.actionItems.getItemAt(0).actionView;
    TKUnit.assert(label instanceof LabelModule.Label, "ActionItem.actionView not loaded correctly");
    TKUnit.assertEqual(label.text, "success", "ActionItem.actionView");
};

export function test_ActionBar_is_not_empty_when_actionItem_actionView_is_set() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionItem> <ActionItem.actionView>" +
        "<Label text=\"test\" />" +
        "</ActionItem.actionView> </ActionItem> </ActionBar> </Page.actionBar> </Page>");

    TKUnit.assertFalse(p.actionBar._isEmpty(), "ActionItem.actionView is set but ActionBar reports empty");
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

export function test_titleView_inherit_bindingContext_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>" +
        "<Button text=\"{{ myProp }} \" />" +
        "</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>");
    p.bindingContext = { myProp: "success" };

    var centerBtn = <button.Button>p.actionBar.titleView;
    TKUnit.assert(centerBtn instanceof button.Button, "titleView not loaded correctly");
    TKUnit.assertEqual(centerBtn.text, "success", "actionItem.text");
};

export function test_titleView_inXML() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>" +
        "<Button/>" +
        "</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>");

    var centerBtn = <button.Button>p.actionBar.titleView;
    TKUnit.assert(centerBtn instanceof button.Button, "titleView not loaded correctly");
};

export function test_titleView_inXML_short_definition() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar>" +
        "<Button/>" +
        "</ActionBar> </Page.actionBar> </Page>");

    var centerBtn = <button.Button>p.actionBar.titleView;
    TKUnit.assert(centerBtn instanceof button.Button, "titleView not loaded correctly");
};

export function test_ActionBar_is_not_empty_when_titleView_is_set() {
    var p = <PageModule.Page>builder.parse(
        "<Page> <Page.actionBar> <ActionBar> <ActionBar.titleView>" +
        "<Button text=\"test\" />" +
        "</ActionBar.titleView> </ActionBar> </Page.actionBar> </Page>");

    TKUnit.assertFalse(p.actionBar._isEmpty(), "titleView is set but ActionBar reports empty");
};

export function test_ActionBarItemBindingToEvent() {
    var p = <PageModule.Page>builder.parse('<Page><Page.actionBar><ActionBar><ActionBar.actionItems><ActionItem tap="{{ test }}"/></ActionBar.actionItems></ActionBar></Page.actionBar></Page>');

    var testAction = function (views: Array<viewModule.View>) {
        var page = <PageModule.Page>views[0];
        var firstHandlerCallCounter = 0;
        var secondHandlerCallCounter = 0;
        var firstHandler = function () { firstHandlerCallCounter++; };
        var secondHandler = function () { secondHandlerCallCounter++; };

        page.bindingContext = new Observable({ "test": firstHandler });

        var actionBarItem = page.actionBar.actionItems.getItemAt(0);

        TKUnit.assertEqual((<any>actionBarItem)._observers["tap"].length, 1, "There should be only one listener");
        TKUnit.assertEqual((<any>actionBarItem)._observers["tap"][0].callback + "", "function () { firstHandlerCallCounter++; }", "First handler is not equal");

        p.bindingContext.set("test", secondHandler);

        TKUnit.assertEqual((<any>actionBarItem)._observers["tap"].length, 1, "There should be only one listener");
        TKUnit.assertEqual((<any>actionBarItem)._observers["tap"][0].callback + "", "function () { secondHandlerCallCounter++; }", "Second handler is not equal");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_Setting_ActionItems_doesnt_thrown() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var gotException = false;

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        var actionItem = new actionBarModule.ActionItem();
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

    TKUnit.assert(!gotException, "Expected: false, Actual: " + gotException);
}

export function test_Setting_ActionItemsWithNumberAsText_doesnt_thrown() {

    var gotException = false;

    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);

    try {
        helper.navigateToModule(moduleName + "/ActionBar_NumberAsText");
    }
    catch (e) {
        gotException = true;
    }

    TKUnit.assert(!gotException, "Expected: false, Actual: " + gotException);
}

export function test_CanDefineEverythingAsContentBetweenTheTwoTags() {
    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(moduleName + "/ActionBar_BetweenTags", undefined, (page: PageModule.Page) => {

        TKUnit.assertNotNull(page.actionBar.navigationButton);
        TKUnit.assertEqual(page.actionBar.navigationButton.text, "nb");

        TKUnit.assertNull(page.actionBar.title);
        TKUnit.assertNotNull(page.actionBar.titleView);
        TKUnit.assertTrue(page.actionBar.titleView instanceof LabelModule.Label);
        TKUnit.assertEqual((<LabelModule.Label>page.actionBar.titleView).text, "tv");

        TKUnit.assertNotNull(page.actionBar.actionItems);
        var items = page.actionBar.actionItems.getItems();
        TKUnit.assertEqual(items.length, 3);

        TKUnit.assertEqual(items[0].text, "i1");
        TKUnit.assertEqual(items[1].text, "i2");
        TKUnit.assertEqual(items[2].text, "i3");
    });
}

export function test_LoadedEventsOrder() {
    var loadedEvents = new Array<string>();
    var pageFactory = function (): PageModule.Page {
        var page = new PageModule.Page();
        page.on(viewModule.View.loadedEvent, () => {
            loadedEvents.push("page");
        });

        page.actionBar.on(viewModule.View.loadedEvent, () => {
            loadedEvents.push("action-bar");
        });

        var content = new LabelModule.Label();
        content.on(viewModule.View.loadedEvent, () => {
            loadedEvents.push("content");
        });
        page.content = content;

        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.arrayAssert(loadedEvents, new Array<string>("content", "action-bar", "page"));
}

export function test_LoadedEventsOrder_WithoutPageContent() {
    var loadedEvents = new Array<string>();
    var pageFactory = function (): PageModule.Page {
        var page = new PageModule.Page();
        page.on(viewModule.View.loadedEvent, () => {
            loadedEvents.push("page");
        });

        page.actionBar.on(viewModule.View.loadedEvent, () => {
            loadedEvents.push("action-bar");
        });

        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.arrayAssert(loadedEvents, new Array<string>("action-bar", "page"));
}

export function test_setId() {
    var pageFactory = function (): PageModule.Page {
        var page = new PageModule.Page();
        page.actionBar.id = "myId";

        return page;
    };

    try {
        helper.navigate(pageFactory);
    }
    catch (e) {
        TKUnit.assert(false, "Failed to apply property 'id' to actionBar before its nativeView is ready.");
    }
}

export function createPageAndNavigate() {
    var page: PageModule.Page;
    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();

        var label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    return page;
}
