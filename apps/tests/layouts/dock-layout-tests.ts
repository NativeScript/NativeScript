import pageModule = require("ui/page");
import button = require("ui/button");
import {DockLayout} from "ui/layouts/dock-layout";
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import navHelper = require("../ui/helper");
import testModule = require("../ui-test");
import layoutHelper = require("./layout-helper");

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
//    <Button dock="left" text="left" style="background-color: red; margin: 5;"/ >/ >
//    <Button dock="top" text="top" style="background-color: lightblue; margin: 5;"/ >
//    <Button dock="right" text="right" style="background-color: lightgreen; margin: 5;"/ >
//    <Button dock="bottom" text="bottom" style="background-color: lightpink; margin: 5;"/ >
//    <Button text="fill" style="background-color: wheat; margin: 5;"/ >
//  </DockLayout >
//</Page>
//```
// </snippet>

// Other frequently used modules when working with a DockLayout include:
// ``` JavaScript
import enums = require("ui/enums");
// ```
// </snippet> 

export class DockLayoutTest extends testModule.UITest<DockLayout> {

    public create(): DockLayout {
        let rootLayout = new DockLayout();
        rootLayout.height = layoutHelper.dp(300);
        rootLayout.width = layoutHelper.dp(300);
        return rootLayout;
    }

    public test_stretchLastChild_DefaultValue() {
        TKUnit.assertEqual(this.testView.stretchLastChild, true, "Default stretchLastChild.");
    }

    public test_dock_DefaultValue() {
        var testBtn = new button.Button();
        var value = dockModule.DockLayout.getDock(testBtn);
        TKUnit.assertEqual(value, enums.Dock.left, "Default dock value.");
    }

    public test_setInvalidDock_Throws() {
        var testBtn = new button.Button();

        TKUnit.assertThrows(() => {
            dockModule.DockLayout.setDock(testBtn, "invalid");
        });
    }

    public test_dock_left() {
        var testBtn = new helper.MyButton();
        testBtn.width = layoutHelper.dp(20);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 0, 20, 300);
    }

    public test_dock_right() {
        var testBtn = new helper.MyButton();
        testBtn.width = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtn, enums.Dock.right);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 280, 0, 20, 300);
    }

    public test_dock_top() {
        var testBtn = new helper.MyButton();
        testBtn.height = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtn, enums.Dock.top);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 0, 300, 20);
    }

    public test_dock_button() {
        var testBtn = new helper.MyButton();
        testBtn.height = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtn, enums.Dock.bottom);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 280, 300, 20);
    }

    public test_dock_left_stretched() {
        var testBtn = new helper.MyButton();
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 0, 300, 300);
    }

    public test_dock_left_top_righ_bottom_fill() {
        var testBtnLeft = new helper.MyButton();
        testBtnLeft.width = layoutHelper.dp(20);
        this.testView.addChild(testBtnLeft);

        var testBtnTop = new helper.MyButton();
        testBtnTop.height = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtnTop, enums.Dock.top);
        this.testView.addChild(testBtnTop);

        var testBtnRight = new helper.MyButton();
        testBtnRight.width = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtnRight, enums.Dock.right);
        this.testView.addChild(testBtnRight);

        var testBtnBottom = new helper.MyButton();
        testBtnBottom.height = layoutHelper.dp(20);
        dockModule.DockLayout.setDock(testBtnBottom, enums.Dock.bottom);
        this.testView.addChild(testBtnBottom);

        var testBtnFill = new helper.MyButton();
        dockModule.DockLayout.setDock(testBtnFill, enums.Dock.bottom);
        this.testView.addChild(testBtnFill);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtnLeft, 0, 0, 20, 300, "Left button");
        helper.assertLayout(testBtnTop, 20, 0, 280, 20, "Top button");
        helper.assertLayout(testBtnRight, 280, 20, 20, 280, "Right button");
        helper.assertLayout(testBtnBottom, 20, 280, 260, 20, "Bottom button");
        helper.assertLayout(testBtnFill, 20, 20, 260, 260, "Fill button");
    }

    public test_padding() {
        var testBtn = new helper.MyButton();
        this.testView.addChild(testBtn);
        this.testView.paddingLeft = layoutHelper.dp(10);
        this.testView.paddingTop = layoutHelper.dp(20);
        this.testView.paddingRight = layoutHelper.dp(30);
        this.testView.paddingBottom = layoutHelper.dp(40);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertMeasure(testBtn, 260, 240);
        helper.assertLayout(testBtn, 10, 20, 260, 240);
    }

    public test_codesnippets() {
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
}

export function createTestCase(): DockLayoutTest {
    return new DockLayoutTest();
}