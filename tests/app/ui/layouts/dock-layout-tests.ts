import * as button from "ui/button";
import { DockLayout } from "ui/layouts/dock-layout";
import * as TKUnit from "../../TKUnit";
import * as helper from "./layout-helper";
import * as testModule from "../../ui-test";
import * as layoutHelper from "./layout-helper";
import * as commonTests from "./common-layout-tests";
import { PercentLength } from "ui/core/view";

// >> dock-layout-require
import * as dockModule from "ui/layouts/dock-layout";
// << dock-layout-require

// >> dock-layout-others
import * as enums from "ui/enums";
// << dock-layout-others

export class DockLayoutTest extends testModule.UITest<DockLayout> {

    public create(): DockLayout {
        let rootLayout = new DockLayout();
        rootLayout.height = { value: 300, unit: "px" };
        rootLayout.width = { value: 300, unit: "px" };
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
        testBtn.width = { value: 20, unit: "px" }
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 0, 20, 300);
    }

    public test_dock_right() {
        var testBtn = new helper.MyButton();
        testBtn.width = { value: 20, unit: "px" };
        dockModule.DockLayout.setDock(testBtn, enums.Dock.right);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 280, 0, 20, 300);
    }

    public test_dock_top() {
        var testBtn = new helper.MyButton();
        testBtn.height = { value: 20, unit: "px" };
        dockModule.DockLayout.setDock(testBtn, enums.Dock.top);
        this.testView.stretchLastChild = false;
        this.testView.addChild(testBtn);

        this.waitUntilTestElementLayoutIsValid();

        helper.assertLayout(testBtn, 0, 0, 300, 20);
    }

    public test_dock_button() {
        var testBtn = new helper.MyButton();
        testBtn.height = { value: 20, unit: "px" };
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
        testBtnLeft.width = { value: 20, unit: "px" };
        this.testView.addChild(testBtnLeft);

        var testBtnTop = new helper.MyButton();
        testBtnTop.height = { value: 20, unit: "px" };
        dockModule.DockLayout.setDock(testBtnTop, enums.Dock.top);
        this.testView.addChild(testBtnTop);

        var testBtnRight = new helper.MyButton();
        testBtnRight.width = { value: 20, unit: "px" }
        dockModule.DockLayout.setDock(testBtnRight, enums.Dock.right);
        this.testView.addChild(testBtnRight);

        var testBtnBottom = new helper.MyButton();
        testBtnBottom.height = { value: 20, unit: "px" }
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
        this.testView.style.paddingLeft = { value: 10, unit: "px" };
        this.testView.style.paddingTop = { value: 20, unit: "px" };
        this.testView.style.paddingRight = { value: 30, unit: "px" };
        this.testView.style.paddingBottom = { value: 40, unit: "px" };

        this.waitUntilTestElementLayoutIsValid();

        helper.assertMeasure(testBtn, 260, 240);
        helper.assertLayout(testBtn, 10, 20, 260, 240);
    }

    public test_codesnippets() {
        // >> dock-layout-create
        var dockLayout = new dockModule.DockLayout();
        //  << dock-layout-create

        // >> dock-layout-addchild
        var btn = new button.Button();
        dockLayout.addChild(btn);
        // << dock-layout-addchild

        // >> dock-layout-removechild
        dockLayout.removeChild(btn);
        // << dock-layout-removechild

        // >> dock-layout-setdocl
        var btnDockedToRight = new button.Button();
        dockModule.DockLayout.setDock(btnDockedToRight, enums.Dock.right);
        dockLayout.addChild(btnDockedToRight);
        // << dock-layout-setdocl
    }

    public test_percent_children_support() {
        commonTests.percent_support_children_test(this);
    }

    public test_percent_support_nativeLayoutParams_are_correct() {
        commonTests.percent_support_nativeLayoutParams_are_correct(this);
    }
}

export function createTestCase(): DockLayoutTest {
    return new DockLayoutTest();
}
