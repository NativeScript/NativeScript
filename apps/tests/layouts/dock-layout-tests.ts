import pageModule = require("ui/page");
import button = require("ui/button");
import {DockLayout} from "ui/layouts/dock-layout";
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import navHelper = require("../ui/helper");

// <snippet module="ui/layouts/dock-layout" title="dock-layout">
// # DockLayout
// Using a DockLayout requires the DockLayout module.
// ``` JavaScript
import dockModule = require("ui/layouts/dock-layout");
// ```

// ### Declaring a DockLayout.
//```XML
//<Page>
//  <DockLayout stretchLastChild="true" >
//    <Button dock="left" text = "left" style ="background-color: red; margin: 5;"/ >/ >
//    <Button dock="top" text = "top" style ="background-color: lightblue; margin: 5;"/ >
//    <Button dock="right" text = "right" style ="background-color: lightgreen; margin: 5;"/ >
//    <Button dock="bottom" text = "bottom" style ="background-color: lightpink; margin: 5;"/ >
//    <Button text="fill" style ="background-color: wheat; margin: 5;"/ >
//  </DockLayout >
//</Page>
//```
// </snippet>

// Other frequently used modules when working with a DockLayout include:
// ``` JavaScript
import enums = require("ui/enums");
// ```
// </snippet> 

var testPage: pageModule.Page;
var rootLayout: DockLayout;
var tmp: button.Button;

export function setUpModule() {
    var pageFactory = function () {
        testPage = new pageModule.Page();
        tmp = new button.Button();
        tmp.text = "Loading test";
        testPage.content = tmp;
        return testPage;
    };

    navHelper.navigate(pageFactory);
}

export function tearDownModule() {
    navHelper.goBack();
    delete testPage;
    delete rootLayout;
    delete tmp;
}

export function setUp() {
    rootLayout = new DockLayout();
    rootLayout.height = 300;
    rootLayout.width = 300;
    testPage.content = rootLayout;
}

export function tearDown() {
    testPage.content = tmp;
}

export function test_stretchLastChild_DefaultValue() {
    TKUnit.assertEqual(rootLayout.stretchLastChild, true, "Default stretchLastChild.");
}

export function test_dock_DefaultValue() {
    var testBtn = new button.Button();
    var value = dockModule.DockLayout.getDock(testBtn);
    TKUnit.assertEqual(value, enums.Dock.left, "Default dock value.");
}

export function test_setInvalidDock_Throws() {
    var testBtn = new button.Button();

    TKUnit.assertThrows(() => {
        dockModule.DockLayout.setDock(testBtn, "invalid");
    });
}

export function test_dock_left() {
    var testBtn = new helper.MyButton();
    testBtn.width = 20;
    rootLayout.stretchLastChild = false;
    rootLayout.addChild(testBtn);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtn, 0, 0, 20, 300);
}

export function test_dock_right() {
    var testBtn = new helper.MyButton();
    testBtn.width = 20;
    dockModule.DockLayout.setDock(testBtn, enums.Dock.right);
    rootLayout.stretchLastChild = false;
    rootLayout.addChild(testBtn);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtn, 280, 0, 20, 300);
}

export function test_dock_top() {
    var testBtn = new helper.MyButton();
    testBtn.height = 20;
    dockModule.DockLayout.setDock(testBtn, enums.Dock.top);
    rootLayout.stretchLastChild = false;
    rootLayout.addChild(testBtn);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtn, 0, 0, 300, 20);
}

export function test_dock_button() {
    var testBtn = new helper.MyButton();
    testBtn.height = 20;
    dockModule.DockLayout.setDock(testBtn, enums.Dock.bottom);
    rootLayout.stretchLastChild = false;
    rootLayout.addChild(testBtn);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtn, 0, 280, 300, 20);
}

export function test_dock_left_stretched() {
    var testBtn = new helper.MyButton();
    rootLayout.addChild(testBtn);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtn, 0, 0, 300, 300);
}

export function test_dock_left_top_righ_bottom_fill() {
    var testBtnLeft = new helper.MyButton();
    testBtnLeft.width = 20;
    rootLayout.addChild(testBtnLeft);

    var testBtnTop = new helper.MyButton();
    testBtnTop.height = 20;
    dockModule.DockLayout.setDock(testBtnTop, enums.Dock.top);
    rootLayout.addChild(testBtnTop);

    var testBtnRight = new helper.MyButton();
    testBtnRight.width = 20;
    dockModule.DockLayout.setDock(testBtnRight, enums.Dock.right);
    rootLayout.addChild(testBtnRight);

    var testBtnBottom = new helper.MyButton();
    testBtnBottom.height = 20;
    dockModule.DockLayout.setDock(testBtnBottom, enums.Dock.bottom);
    rootLayout.addChild(testBtnBottom);

    var testBtnFill = new helper.MyButton();
    dockModule.DockLayout.setDock(testBtnFill, enums.Dock.bottom);
    rootLayout.addChild(testBtnFill);

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertLayout(testBtnLeft, 0, 0, 20, 300, "Left button");
    helper.assertLayout(testBtnTop, 20, 0, 280, 20, "Top button");
    helper.assertLayout(testBtnRight, 280, 20, 20, 280, "Right button");
    helper.assertLayout(testBtnBottom, 20, 280, 260, 20, "Bottom button");
    helper.assertLayout(testBtnFill, 20, 20, 260, 260, "Fill button");
}

export function test_padding() {
    var testBtn = new helper.MyButton();
    rootLayout.addChild(testBtn);
    rootLayout.paddingLeft = 10;
    rootLayout.paddingTop = 20;
    rootLayout.paddingRight = 30;
    rootLayout.paddingBottom = 40;

    TKUnit.waitUntilReady(() => { return rootLayout.isLayoutValid; });

    helper.assertMeasure(testBtn, 260, 240);
    helper.assertLayout(testBtn, 10, 20, 260, 240);
}

export function test_codesnippets() {
    // <snippet module="ui/layouts/dock-layout" title="dock-layout">
    // ## Create DockLayout
    // ``` JavaScript
    var dockLayout = new dockModule.DockLayout();
    //  ```

    // ## Add child view to layout
    // ``` JavaScript
    var btn = new button.Button();
    dockLayout.addChild(btn);
    //  ```

    // ## Remove child view from layout
    // ``` JavaScript
    dockLayout.removeChild(btn);
    // ```

    // ## Setting the dock proeprty
    // ``` JavaScript
    var btnDockedToRight = new button.Button();
    dockModule.DockLayout.setDock(btnDockedToRight, enums.Dock.right);
    dockLayout.addChild(btnDockedToRight);
    // ```
    // </snippet>
}