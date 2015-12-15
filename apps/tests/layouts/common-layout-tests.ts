import TKUnit = require("../TKUnit");
import layoutHelper = require("./layout-helper");
import enums = require("ui/enums");
import testModule = require("../ui-test");
import {LayoutBase} from "ui/layouts/layout-base";
import {widthProperty} from "ui/styling/style"

export function percent_support_test(test: testModule.UITest<LayoutBase>) {
    let layout: LayoutBase = test.testView;
    layout.removeChildren();
    layout.width = layoutHelper.dp(200);
    layout.height = layoutHelper.dp(200);

    let btn = new layoutHelper.MyButton();
    btn.horizontalAlignment = enums.HorizontalAlignment.left;
    btn.verticalAlignment = enums.VerticalAlignment.top;
    (<any>btn).width = "50%";
    (<any>btn).height = "50%";
    btn.margin = "10%";
    btn.text = "1";
    layout.addChild(btn);

    test.waitUntilTestElementLayoutIsValid();

    TKUnit.assertEqual(btn.getMeasuredWidth(), 100, "Button MeasuredWidth incorrect");
    TKUnit.assertEqual(btn.getMeasuredHeight(), 100, "Button MeasuredHeight incorrect");

    let bounds = btn._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 20, "TopLeft layout LEFT incorrect");
    TKUnit.assertEqual(bounds.top, 20, "TopLeft layout TOP incorrect");
    TKUnit.assertEqual(bounds.right, 120, "TopLeft layout RIGHT incorrect");
    TKUnit.assertEqual(bounds.bottom, 120, "TopLeft layout BOTTOM incorrect");

    btn.horizontalAlignment = enums.HorizontalAlignment.center;
    btn.verticalAlignment = enums.VerticalAlignment.center;
    test.waitUntilTestElementLayoutIsValid();

    bounds = btn._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 50, "Center layout LEFT incorrect");
    TKUnit.assertEqual(bounds.top, 50, "Center layout TOP incorrect");
    TKUnit.assertEqual(bounds.right, 150, "Center layout RIGHT incorrect");
    TKUnit.assertEqual(bounds.bottom, 150, "Center layout BOTTOM incorrect");

    btn.horizontalAlignment = enums.HorizontalAlignment.stretch;
    btn.verticalAlignment = enums.VerticalAlignment.stretch;
    test.waitUntilTestElementLayoutIsValid();

    bounds = btn._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 50, "Stretch layout LEFT incorrect");
    TKUnit.assertEqual(bounds.top, 50, "Stretch layout TOP incorrect");
    TKUnit.assertEqual(bounds.right, 150, "Stretch layout RIGHT incorrect");
    TKUnit.assertEqual(bounds.bottom, 150, "Stretch layout BOTTOM incorrect");

    btn.horizontalAlignment = enums.HorizontalAlignment.right;
    btn.verticalAlignment = enums.VerticalAlignment.bottom;
    test.waitUntilTestElementLayoutIsValid();

    bounds = btn._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 200 - 100 - 20, "BottomRight layout LEFT incorrect");
    TKUnit.assertEqual(bounds.top, 200 - 100 - 20, "BottomRight layout TOP incorrect");
    TKUnit.assertEqual(bounds.right, 200 - 20, "BottomRight layout RIGHT incorrect");
    TKUnit.assertEqual(bounds.bottom, 200 - 20, "BottomRight layout BOTTOM incorrect");

    //reset values.
    btn.height = Number.NaN;
    (<any>btn.style)._resetValue(widthProperty);
    btn.margin = "0";
    btn.horizontalAlignment = enums.HorizontalAlignment.stretch;
    btn.verticalAlignment = enums.VerticalAlignment.stretch;
    btn.height = Number.NaN;

    TKUnit.assertEqual(btn.marginLeft, 0, "marginLeft");
    TKUnit.assertEqual(btn.marginTop, 0, "marginTop");
    TKUnit.assertEqual(btn.marginRight, 0, "marginRight");
    TKUnit.assertEqual(btn.marginBottom, 0, "marginBottom");
    TKUnit.assert(isNaN(btn.width), "width");
    TKUnit.assert(isNaN(btn.height), "height");

    test.waitUntilTestElementLayoutIsValid();

    bounds = btn._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 0, "Reset Stretch layout LEFT incorrect");
    TKUnit.assertEqual(bounds.top, 0, "Reset Stretch layout TOP incorrect");
    TKUnit.assertEqual(bounds.right, 200, "Reset Stretch layout RIGHT incorrect");
    TKUnit.assertEqual(bounds.bottom, 200, "Reset Stretch layout BOTTOM incorrect");
}