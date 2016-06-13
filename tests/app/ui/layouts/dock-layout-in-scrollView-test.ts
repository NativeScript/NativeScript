import {Button} from "ui/button";
import {Label} from "ui/label";
import {DockLayout} from "ui/layouts/dock-layout";
import {StackLayout} from "ui/layouts/stack-layout";
import {ScrollView} from "ui/scroll-view";
import TKUnit = require("../../TKUnit");
import testModule = require("../../ui-test");
import enums = require("ui/enums");

export class DockLayoutInScrollViewTest extends testModule.UITest<ScrollView> {
    public create(): ScrollView {
        let scrollView = new ScrollView();
        return scrollView;
    }

    public test_dockLayout_in_scrollView() {
        let stackLayout = new StackLayout();
        this.testView.content = stackLayout;

        let dockLayout = new DockLayout();
        stackLayout.addChild(dockLayout);

        let label = new Label();
        label.text = "test";
        DockLayout.setDock(label, enums.Dock.right);
        dockLayout.addChild(label);

        let button = new Button();
        button.text = "test2";
        DockLayout.setDock(button, enums.Dock.left);
        dockLayout.addChild(button);

        this.waitUntilTestElementLayoutIsValid();

        var height = label.getMeasuredHeight();

        TKUnit.assertTrue(height > 0 && height < 100, "Label height in DockLayout is wrong: " + height);
    }
}

export function createTestCase(): DockLayoutInScrollViewTest {
    return new DockLayoutInScrollViewTest();
}
