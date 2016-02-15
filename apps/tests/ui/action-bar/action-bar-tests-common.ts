import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import builder = require("ui/builder");
import button = require("ui/button");
import PageModule = require("ui/page");
import viewModule = require("ui/core/view");
import fs = require("file-system");
import { Observable } from "data/observable";

// <snippet module="ui/action-bar" title="ActionBar">
// # ActionBar
// Using a ActionBar requires the action-bar module.
// ``` JavaScript
import actionBarModule = require("ui/action-bar");
// ```
// 
// ## Setting Title and Icon
//```XML
// <Page>
//   <Page.actionBar>
//     {%raw%}<ActionBar title="{{ title }}" android.icon="res://is_custom_home_icon"/>{%endraw%}
//   </Page.actionBar>
//   ...
// </Page>
//```
//The icon can only be set in Android platform. It is hidden by default, but you explicitly control its visibility with the `android.iconVisibility' property.
//
// 
// ## Setting Custom Title View 
//```XML
// <Page loaded="pageLoaded">
//   <Page.actionBar>
//     <ActionBar title="Title">
//       <ActionBar.titleView>
//         <StackLayout orientation="horizontal">
//           <Button text="1st" />
//           <Button text="2nd" />
//           <Button text="3rd" />
//         </StackLayout>
//       </ActionBar.titleView>
//     </ActionBar>
//   </Page.actionBar>
//   ...
// </Page>
//```
//
// ## Setting Action Items
//```XML
// <Page>
//   <Page.actionBar>
//     <ActionBar title="Title">
//       <ActionBar.actionItems>
//         <ActionItem text="left"  ios.position="left"/>
//         <ActionItem text="right" ios.position="right"/>
//         <ActionItem text="pop"   ios.position="right"  android.position="popup"/>
//       </ActionBar.actionItems>
//     </ActionBar>
//   </Page.actionBar>
//   ...
// </Page>
//```
//
//The position option is platform specific. The available values are as follows:
// * **Android** - `actionBar`, `actionBarIfRoom` and `popup`. The default is `actionBar`.
// * **iOS** - `left` and `right`. The default is `left`.
//
// ## Displaying Platform-Specific System Icons on Action Items
//```XML
// <Page>
//   <Page.actionBar>
//     <ActionBar>
//       <ActionBar.actionItems>
//          <ActionItem ios.systemIcon="12" android.systemIcon = "ic_menu_search" />
//          <ActionItem ios.systemIcon="15" android.systemIcon = "ic_menu_camera" />
//          <ActionItem ios.systemIcon="16" android.systemIcon = "ic_menu_delete" />
//       </ActionBar.actionItems>
//     </ActionBar>
//   </Page.actionBar>
//   ...
// </Page>
//```
//
//### iOS
//Set `ios.systemIcon` to a number representing the iOS system item to be displayed.
//Use this property instead of `ActionItem.icon` if you want to diplsay a built-in iOS system icon.
//Note: systemIcon is not supported on NavigationButton in iOS
//The value should be a number from the `UIBarButtonSystemItem` enumeration
//(https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIBarButtonItem_Class/#//apple_ref/c/tdef/UIBarButtonSystemItem)
//0: Done
//1: Cancel
//2: Edit
//3: Save
//4: Add
//5: FlexibleSpace
//6: FixedSpace
//7: Compose
//8: Reply
//9: Action
//10: Organize
//11: Bookmarks
//12: Search
//13: Refresh
//14: Stop
//15: Camera
//16: Trash
//17: Play
//18: Pause
//19: Rewind
//20: FastForward
//21: Undo
//22: Redo
//23: PageCurl
//
//### Android
//Set `android.systemIcon` the name of the system drawable resource to be displayed.
//Use this property instead of `ActionItem.icon` if you want to diplsay a built-in Android system icon.
//The value should be a string such as 'ic_menu_search' if you want to display the built-in Android Menu Search icon for example.
//For a full list of Android drawable names, please visit http://androiddrawables.com
//
// ## Displaying Custom View in Action Items
//```XML
// <Page>
//   <Page.actionBar>
//     <ActionBar>
//       <ActionBar.actionItems>
//			<ActionItem>
//			  <ActionItem.actionView>
//				  <StackLayout orientation="horizontal">
//				    <Label text="Green" color="green"/>
//				    <Label text="Red" color="red"/>
//				  </StackLayout>
//			  </ActionItem.actionView>
//			</ActionItem>
//       </ActionBar.actionItems>
//     </ActionBar>
//   </Page.actionBar>
//   ...
// </Page>
//```
//
// ## Setting Navigation Button
//```XML
// <Page>
//   <Page.actionBar>
//     <ActionBar title="Title">
//       <NavigationButton text="go back" android.systemIcon = "ic_menu_back"/>
//     </ActionBar>
//   ...
// </Page>
//```
//Setting `text` for the navigation button is not supported in Android. You can use `icon` or `android.systemIcon` to set the image in Android.
//Setting `ios.systemIcon` for the navigation button is not supported in iOS.
//
// </snippet>

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
    try {
        testAction([p]);
    }
    finally {
        helper.goBack();
    }
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

    try {
        TKUnit.assert(!gotException, "Expected: false, Actual: " + gotException);
    }
    finally {
        helper.goBack();
    }
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

    try {
        TKUnit.assert(!gotException, "Expected: false, Actual: " + gotException);
    }
    finally {
        helper.goBack();
    }
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