import TKUnit = require("../TKUnit");
import viewModule = require("ui/core/view");
import labelModule = require("ui/label");
import helper = require("../ui/helper");
import layoutHelper = require("./layout-helper");
import testModule = require("../ui-test");

// <snippet module="ui/layouts/wrap-layout" title="WrapLayout">
// # WrapLayout
// Using a WrapLayout requires the WrapLayout module.
// ``` JavaScript
import wrapLayoutModule = require("ui/layouts/wrap-layout");
// ```

// Other frequently used modules when working with a WrapLayout include:
// ``` JavaScript
import enums = require("ui/enums");
// ```
// </snippet> 

export class WrapLayoutTest extends testModule.UITest<wrapLayoutModule.WrapLayout> {

    public create(): wrapLayoutModule.WrapLayout {
        // <snippet module="ui/layouts/wrap-layout" title="WrapLayout">
        // ## Creating a WrapLayout
        // ``` JavaScript
        var wrapLayout = new wrapLayoutModule.WrapLayout();
        // ```
        // </snippet>

        // ### Declaring a WrapLayout.
        //```XML
        // <Page>
        //   <WrapLayout>
        //     <Label text="This is Label 1" />
        //     <Label text="This is Label 2" />
        //     <Label text="This is Label 3" />
        //     <Label text="This is Label 4" />
        //   </WrapLayout>
        // </Page>
        //```
        // </snippet>

        wrapLayout.width = 200;
        wrapLayout.height = 200;

        var label;
        var i;
        for (i = 0; i < 2; i++) {
            label = new labelModule.Label();
            label.text = "" + i;
            label.id = "" + i;

            label.width = 100;
            label.height = 100;
            wrapLayout.addChild(label);
        }

        return wrapLayout;
    }

    public testHorizontalOrientation() {

        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft on Index 0");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop on Index 0");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(100), "ActualRight on Index 0");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(100), "ActualBottom on Index 0");

        actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, layoutHelper.dip(100), "ActualLeft on Index 1");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop on Index 1");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(200), "ActualRight on Index 1");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(100), "ActualBottom on Index 1");
    }

    public testVerticalOrientation() {
        var wrapLayout = this.testView;
        // <snippet module="ui/layouts/wrap-layout" title="WrapLayout">
        // ## Setting the orientation of a wrap-layout.
        // ``` JavaScript
        wrapLayout.orientation = enums.Orientation.vertical;
        // ```
        // </snippet>
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft on Index 0");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop on Index 0");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(100), "ActualRight on Index 0");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(100), "ActualBottom on Index 0");

        actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft on Index 1");
        TKUnit.assertEqual(actualValue.top, layoutHelper.dip(100), "ActualTop on Index 1");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(100), "ActualRight on Index 1");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(200), "ActualBottom on Index 1");
    }

    public testChangeOrientation() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();
        this.testView.orientation = enums.Orientation.vertical;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(0)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft on Index 0");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop on Index 0");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(100), "ActualRight on Index 0");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(100), "ActualBottom on Index 0");

        actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft on Index 1");
        TKUnit.assertEqual(actualValue.top, layoutHelper.dip(100), "ActualTop on Index 1");
        TKUnit.assertEqual(actualValue.right, layoutHelper.dip(100), "ActualRight on Index 1");
        TKUnit.assertEqual(actualValue.bottom, layoutHelper.dip(200), "ActualBottom on Index 1");
    }

    public testItemWidth() {
        this.testView.itemWidth = 50;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().left;
        TKUnit.assertEqual(actualValue, layoutHelper.dip(50), "ActualLeft on Index 1");
    }

    public testChangeItemWidth() {
        this.waitUntilTestElementLayoutIsValid();
        this.testView.itemWidth = 50;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().left;
        TKUnit.assertEqual(actualValue, layoutHelper.dip(50), "ActualLeft on Index 1");
    }

    public testItemHeight() {
        this.testView.itemHeight = 50;
        this.testView.orientation = enums.Orientation.vertical;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(actualValue, layoutHelper.dip(50), "ActualTop on Index 1");
    }

    public testChangeItemHeight() {
        this.testView.orientation = enums.Orientation.vertical;
        this.waitUntilTestElementLayoutIsValid();
        this.testView.itemHeight = 50;
        this.waitUntilTestElementLayoutIsValid();

        let actualValue = this.testView.getChildAt(1)._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(actualValue, layoutHelper.dip(50), "ActualTop on Index 1");
    }

    public testPaddingLeftAndTop() {
        this.testView.removeChildren();
        this.testView.paddingLeft = 20;
        this.testView.paddingTop = 30;

        var btn = new layoutHelper.MyButton();
        btn.width = 50;
        btn.height = 50;
        this.testView.addChild(btn);

        this.waitUntilTestElementLayoutIsValid();

        layoutHelper.assertLayout(btn, 20, 30, 50, 50);
    }

    public testPaddingRight() {
        this.testView.removeChildren();
        this.testView.paddingRight = 30;
        this.testView.width = 200;

        var btn1 = new layoutHelper.MyButton();
        this.testView.addChild(btn1);
        btn1.width = 100;
        btn1.height = 50;

        var btn2 = new layoutHelper.MyButton();
        btn2.width = 80;
        btn2.height = 50;
        this.testView.addChild(btn2);

        this.waitUntilTestElementLayoutIsValid();

        layoutHelper.assertMeasure(btn1, 100, 50);
        layoutHelper.assertMeasure(btn2, 80, 50);

        // There should be no space left for the button on the first row,
        // because for the padding (200 - 100 - 30) = 70 button wants 80  
        layoutHelper.assertLayout(btn1, 0, 0, 100, 50, "button1");
        layoutHelper.assertLayout(btn2, 0, 50, 80, 50, "button2");
    }

    public testPaddingBottom() {
        this.testView.removeChildren();
        this.testView.paddingBottom = 30;
        this.testView.height = 200;
        this.testView.orientation = enums.Orientation.vertical;

        var btn1 = new layoutHelper.MyButton();
        this.testView.addChild(btn1);
        btn1.width = 50;
        btn1.height = 100;

        var btn2 = new layoutHelper.MyButton();
        btn2.width = 50;
        btn2.height = 80;
        this.testView.addChild(btn2);

        this.waitUntilTestElementLayoutIsValid();

        layoutHelper.assertMeasure(btn1, 50, 100);
        layoutHelper.assertMeasure(btn2, 50, 80);

        // There should be no space left for the button on the first row,
        // because of the padding (200 - 100 - 30) = 70 button wants 80  
        layoutHelper.assertLayout(btn1, 0, 0, 50, 100, "button1");
        layoutHelper.assertLayout(btn2, 50, 0, 50, 80, "button2");
    }
}

export function createTestCase(): WrapLayoutTest {
    return new WrapLayoutTest();
}