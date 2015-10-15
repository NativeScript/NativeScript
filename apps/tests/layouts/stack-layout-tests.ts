import {Page} from "ui/page";
import {StackLayout} from "ui/layouts/stack-layout";
import {Button} from "ui/button";
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import navHelper = require("../ui/helper");
import enums = require("ui/enums");
import utils = require("utils/utils");
import testModule = require("../ui-test");

export class StackLayoutTest extends testModule.UITest<StackLayout> {

    private rootLayout: helper.MyStackLayout;
    private btn1: helper.MyButton;
    private btn2: helper.MyButton;

    public create(): StackLayout {
        this.rootLayout = new helper.MyStackLayout();
        this.btn1 = new helper.MyButton();
        this.btn1.text = "btn1";
        this.rootLayout.addChild(this.btn1);
        this.btn2 = new helper.MyButton();
        this.btn2.text = "btn2";
        this.rootLayout.addChild(this.btn2);
        return this.rootLayout;
    }

    public test_orientation_DefaultValue() {
        TKUnit.assertEqual(this.rootLayout.orientation, enums.Orientation.vertical, "Default orientation should be Vertical.");
    }

    public test_SetWrongOrientation_ShouldThrowError() {
        TKUnit.assertThrows(() => { this.rootLayout.orientation = "not_valid"; },
            "Setting invalid value for orientation should throw exception.");
    }

    public test_Orientation_Change() {
        this.waitUntilTestElementLayoutIsValid();

        var arrangeCount = this.rootLayout.arrangeCount;
        TKUnit.assert(this.rootLayout.orientation === enums.Orientation.vertical, "Default orientation should be Vertical.");

        this.rootLayout.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.rootLayout.measureCount, 2, "Orientation change should invalidate measure.");
        TKUnit.assertEqual(this.rootLayout.arrangeCount, 2, "Orientation change should invalidate arrange.");
    }

    public test_ShouldMeasureWith_AtMost_OnVertical() {
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.rootLayout.orientation, enums.Orientation.vertical, "StackLayout should be vertical.");
        TKUnit.assert(this.rootLayout.measured, "Layout should be measured.");
        TKUnit.assert(this.rootLayout.arranged, "Layout should be arranged.");

        var specs = this.btn1._getCurrentMeasureSpecs();

        TKUnit.assertEqual(utils.layout.getMeasureSpecMode(specs.heightMeasureSpec), utils.layout.AT_MOST, "Layout should measure child with AT_MOST Height in vertical orientation.");
    }

    public test_ShouldMeasureWith_AtMost_OnHorizontal() {

        this.rootLayout.orientation = enums.Orientation.horizontal;

        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assert(this.rootLayout.measured, "Layout should be measured.");
        TKUnit.assert(this.rootLayout.arranged, "Layout should be arranged.");

        var specs = this.btn1._getCurrentMeasureSpecs();

        TKUnit.assertEqual(utils.layout.getMeasureSpecMode(specs.widthMeasureSpec), utils.layout.AT_MOST, "Layout should measure child with AT_MOST Width in horizontal orientation.");
    }

    public test_DesiredSize_Vertical() {

        this.rootLayout.verticalAlignment = enums.VerticalAlignment.top;
        this.rootLayout.horizontalAlignment = enums.HorizontalAlignment.left;

        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.rootLayout.getMeasuredWidth(), Math.max(this.btn1.getMeasuredWidth(), this.btn2.getMeasuredWidth()), "Layout getMeasuredWidth should be Max of children getMeasuredWidth");
        TKUnit.assertEqual(this.rootLayout.getMeasuredHeight(), (this.btn1.getMeasuredHeight() + this.btn2.getMeasuredHeight()), "Layout getMeasuredHeight should be Sum of children getMeasuredHeight");
    }

    public test_DesiredSize_Horizontal() {

        this.rootLayout.horizontalAlignment = enums.HorizontalAlignment.left;
        this.rootLayout.verticalAlignment = enums.VerticalAlignment.top;
        this.rootLayout.orientation = enums.Orientation.horizontal;

        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.rootLayout.getMeasuredWidth(), (this.btn1.getMeasuredWidth() + this.btn2.getMeasuredWidth()), "Layout getMeasuredWidth should be Sum of children getMeasuredWidth");
        TKUnit.assertEqual(this.rootLayout.getMeasuredHeight(), Math.max(this.btn1.getMeasuredHeight(), this.btn2.getMeasuredHeight()), "Layout getMeasuredHeight should be Max of children getMeasuredHeight");
    }

    public test_Padding_Vertical() {
        this.rootLayout.width = 300;
        this.rootLayout.height = 300;

        this.rootLayout.paddingLeft = 10;
        this.rootLayout.paddingTop = 20;
        this.rootLayout.paddingRight = 30;
        this.rootLayout.paddingBottom = 40;

        this.btn1.height = 50;
        this.btn2.height = 50;

        this.waitUntilTestElementLayoutIsValid();

        helper.assertMeasure(this.btn1, 260, 50);
        helper.assertMeasure(this.btn2, 260, 50);

        helper.assertLayout(this.btn1, 10, 20, 260, 50, "btn1");
        helper.assertLayout(this.btn2, 10, 70, 260, 50, "btn2");
    }

    public test_Padding_Horizontal() {
        this.rootLayout.width = 300;
        this.rootLayout.height = 300;
        this.rootLayout.orientation = enums.Orientation.horizontal;

        this.rootLayout.paddingLeft = 10;
        this.rootLayout.paddingTop = 20;
        this.rootLayout.paddingRight = 30;
        this.rootLayout.paddingBottom = 40;

        this.btn1.width = 50;
        this.btn2.width = 50;

        this.waitUntilTestElementLayoutIsValid();

        helper.assertMeasure(this.btn1, 50, 240);
        helper.assertMeasure(this.btn2, 50, 240);

        helper.assertLayout(this.btn1, 10, 20, 50, 240, "btn1");
        helper.assertLayout(this.btn2, 60, 20, 50, 240, "btn2");
    }

    private assertChildTexts(expected, layout, message) {
        let texts: Array<string> = [];
        layout._eachChildView((child: { text: string }) => texts.push(child.text));
        TKUnit.assertEqual(expected, texts.join('|'), message);
    }

    public test_insertChildAtPosition() {
        this.assertChildTexts("btn1|btn2", this.rootLayout, "initial 2 buttons");

        let newChild = new Button();
        newChild.text = 'in-between';
        this.rootLayout.insertChild(newChild, 1);

        this.assertChildTexts("btn1|in-between|btn2", this.rootLayout, "button inserted at correct location");
    }

    public test_getChildIndex() {
        let lastChildIndex = this.rootLayout.getChildrenCount() - 1;
        let lastButton = <Button>this.rootLayout.getChildAt(lastChildIndex);
        TKUnit.assertEqual("btn2", lastButton.text);
        TKUnit.assertEqual(lastChildIndex, this.rootLayout.getChildIndex(lastButton));

        let nonChild = new Button();
        TKUnit.assertEqual(-1, this.rootLayout.getChildIndex(nonChild));
    }

    public test_codesnippets() {
        // <snippet module="ui/layouts/stack-layout" title="stack-layout">
        // ### import StackLayout and Button classes
        // var StackLayout = require("ui/layouts/stack-layout").StackLayout;
        // var Button = require("ui/button").Button;
        // ### Create StackLayout
        // ``` JavaScript        
        var stackLayout = new StackLayout();
        //  ```

        // ### Declaring a StackLayout.
        //```XML
        // <Page>
        //   <StackLayout orientation="horizontal">
        //     <Label text="This is Label 1" />
        //   </StackLayout>
        // </Page>
        //```
        // </snippet>

        // ### Add child view to layout
        // ``` JavaScript
        var btn = new Button();
        stackLayout.addChild(btn);
        //  ```

        // ### Remove child view from layout
        // ``` JavaScript
        stackLayout.removeChild(btn);
        // ```

        // ### Change layout orientation to Horizontal
        // ``` JavaScript
        stackLayout.orientation = enums.Orientation.horizontal;
        // ```

        // </snippet>
    }
}

export function createTestCase(): StackLayoutTest {
    return new StackLayoutTest();
}