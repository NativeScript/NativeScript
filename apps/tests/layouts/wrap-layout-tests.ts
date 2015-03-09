import TKUnit = require("../TKUnit");
import viewModule = require("ui/core/view");
import labelModule = require("ui/label");
import helper = require("../ui/helper");
import utils = require("utils/utils");
import layoutHelper = require("./layout-helper");

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

var _createWrapLayoutFunc = function (childCount: number, childWidth?: number, childHeight?: number): wrapLayoutModule.WrapLayout {
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
    for (i = 0; i < childCount; i++) {
        label = new labelModule.Label();
        label.text = "" + i;
        label.id = "" + i;

        label.width = childWidth || 100;
        label.height = childHeight || 100;
        wrapLayout.addChild(label);
    }

    return wrapLayout;
}

export function testHorizontalOrientation() {
    var wrapLayout = _createWrapLayoutFunc(2);
    wrapLayout.orientation = enums.Orientation.horizontal;
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(function isReady() {
            return wrapLayout.isLayoutValid;
        }, 1);

        var density = utils.layout.getDisplayDensity();

        var actualValue = viewModule.getViewById(wrapLayout, "0")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 100 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 100 * density, "ActualBottom");

        actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 100 * density, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 200 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 100 * density, "ActualBottom");
    });
}

export function testVerticalOrientation() {
    var wrapLayout = _createWrapLayoutFunc(2);
    // <snippet module="ui/layouts/wrap-layout" title="WrapLayout">
    // ## Setting the orientation of a wrap-layout.
    // ``` JavaScript
    wrapLayout.orientation = enums.Orientation.vertical;
    // ```
    // </snippet>
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(function isReady() {
            return wrapLayout.isLayoutValid;
        }, 1);

        var density = utils.layout.getDisplayDensity();

        var actualValue = viewModule.getViewById(wrapLayout, "0")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 100 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 100 * density, "ActualBottom");

        actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 100 * density, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 100 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 200 * density, "ActualBottom");
    });
}

export function testChangeOrientation() {
    var wrapLayout = _createWrapLayoutFunc(2);
    wrapLayout.orientation = enums.Orientation.horizontal;
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        wrapLayout.orientation = enums.Orientation.vertical;

        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        var density = utils.layout.getDisplayDensity();

        var actualValue = viewModule.getViewById(wrapLayout, "0")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 0, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 100 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 100 * density, "ActualBottom");

        actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds();
        TKUnit.assertEqual(actualValue.left, 0, "ActualLeft");
        TKUnit.assertEqual(actualValue.top, 100 * density, "ActualTop");
        TKUnit.assertEqual(actualValue.right, 100 * density, "ActualRight");
        TKUnit.assertEqual(actualValue.bottom, 200 * density, "ActualBottom");
    });
}

export function testItemWidth() {
    var wrapLayout = _createWrapLayoutFunc(2);
    wrapLayout.itemWidth = 50;
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(function isReady() {
            return wrapLayout.isLayoutValid;
        }, 1);

        var density = utils.layout.getDisplayDensity();
        var actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds().left;
        TKUnit.assertEqual(actualValue, 50 * density, "ActualLeft");
    });
}

export function testChangeItemWidth() {
    var wrapLayout = _createWrapLayoutFunc(2);
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        wrapLayout.itemWidth = 50;

        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        var density = utils.layout.getDisplayDensity();
        var actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds().left;
        TKUnit.assertEqual(actualValue, 50 * density, "ActualLeft");
    });
}

export function testItemHeight() {
    var wrapLayout = _createWrapLayoutFunc(2);
    wrapLayout.itemHeight = 50;
    wrapLayout.orientation = enums.Orientation.vertical;
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(function isReady() {
            return wrapLayout.isLayoutValid;
        }, 1);

        var density = utils.layout.getDisplayDensity();
        var actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(actualValue, 50 * density, "ActualTop");
    });
}

export function testChangeItemHeight() {
    var wrapLayout = _createWrapLayoutFunc(2);
    wrapLayout.orientation = enums.Orientation.vertical;
    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        wrapLayout.itemHeight = 50;

        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        var density = utils.layout.getDisplayDensity();
        var actualValue = viewModule.getViewById(wrapLayout, "1")._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(actualValue, 50 * density, "ActualTop");
    });
}

export function testPaddingLeftAndTop() {
    var wrapLayout = new wrapLayoutModule.WrapLayout();
    wrapLayout.paddingLeft = 20;
    wrapLayout.paddingTop = 30;

    var btn = new layoutHelper.MyButton();
    btn.width = 50;
    btn.height = 50;
    wrapLayout.addChild(btn);

    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        layoutHelper.assertLayout(btn, 20, 30, 50, 50);
    });
}

export function testPaddingRight() {
    var wrapLayout = new wrapLayoutModule.WrapLayout();
    wrapLayout.paddingRight = 30;
    wrapLayout.width = 200;

    var btn1 = new layoutHelper.MyButton();
    wrapLayout.addChild(btn1);
    btn1.width = 100;
    btn1.height = 50;

    var btn2 = new layoutHelper.MyButton();
    btn2.width = 80;
    btn2.height = 50;
    wrapLayout.addChild(btn2);

    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        layoutHelper.assertMeasure(btn1, 100, 50);
        layoutHelper.assertMeasure(btn2, 80, 50);

        // There should be no space left for the button on the first row,
        // because fo the padding (200 - 100 - 30) = 70 button wants 80  
        layoutHelper.assertLayout(btn1, 0, 0, 100, 50, "button1");
        layoutHelper.assertLayout(btn2, 0, 50, 80, 50, "button2");
    });
}

export function testPaddingBottom() {
    var wrapLayout = new wrapLayoutModule.WrapLayout();
    wrapLayout.paddingBottom = 30;
    wrapLayout.height = 200;
    wrapLayout.orientation = enums.Orientation.vertical;

    var btn1 = new layoutHelper.MyButton();
    wrapLayout.addChild(btn1);
    btn1.width = 50;
    btn1.height = 100;

    var btn2 = new layoutHelper.MyButton();
    btn2.width = 50;
    btn2.height = 80;
    wrapLayout.addChild(btn2);

    helper.buildUIAndRunTest(wrapLayout, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => {
            return wrapLayout.isLayoutValid;
        });

        layoutHelper.assertMeasure(btn1, 50, 100);
        layoutHelper.assertMeasure(btn2, 50, 80);

        // There should be no space left for the button on the first row,
        // because fo the padding (200 - 100 - 30) = 70 button wants 80  
        layoutHelper.assertLayout(btn1, 0, 0, 50, 100, "button1");
        layoutHelper.assertLayout(btn2, 50, 0, 50, 80, "button2");
    });
}