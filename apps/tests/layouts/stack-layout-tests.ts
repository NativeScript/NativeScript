import page = require("ui/page");
import layout = require("ui/layouts/stack-layout");
import button = require("ui/button");
import TKUnit = require("../TKUnit");
import helper = require("./layout-helper");
import navHelper = require("../ui/helper");
import enums = require("ui/enums");
import utils = require("utils/utils");

var ASYNC = 2;

export class MyStackLayout extends layout.StackLayout {
    public measureCount: number = 0;
    public arrangeCount: number = 0;

    public get measured(): boolean {
        return this.measureCount > 0;
    }

    public get arranged(): boolean {
        return this.arrangeCount > 0;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.measureCount++;
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        this.arrangeCount++;
    }
}

var tmp: button.Button;
var newPage: page.Page;
var rootLayout: MyStackLayout;
var btn1: helper.MyButton;
var btn2: helper.MyButton;

export function setUpModule() {
    var pageFactory = function () {
        newPage = new page.Page();
        tmp = new button.Button();
        tmp.text = "Loading test";
        newPage.content = tmp;
        return newPage;
    };

    navHelper.navigate(pageFactory);
}

export function tearDownModule() {
    navHelper.goBack();
    delete tmp;
    delete newPage;
    delete rootLayout;
    delete btn1;
    delete btn2;
}

export function setUp() {
    rootLayout = new MyStackLayout();
    btn1 = new helper.MyButton();
    btn1.text = "btn1";
    rootLayout.addChild(btn1);
    btn2 = new helper.MyButton();
    btn2.text = "btn 2";
    rootLayout.addChild(btn2);
    newPage.content = rootLayout;
}

export function tearDown() {
    newPage.content = tmp;
}

export function test_orientation_DefaultValue() {
    TKUnit.assertEqual(rootLayout.orientation, enums.Orientation.vertical, "Default orientation should be Vertical.");
}

export function test_SetWrongOrientation_ShouldThrowError() {
    TKUnit.assertThrows(() => { rootLayout.orientation = "not_valid"; },
        "Setting invalid value for orientation should throw exception.");
}

export function test_StackLayout_Orientation_Change() {

    TKUnit.waitUntilReady(function () {
        return rootLayout.arranged;
    }, ASYNC);

    var arrangeCount = rootLayout.arrangeCount;
    TKUnit.assert(rootLayout.orientation === enums.Orientation.vertical, "Default orientation should be Vertical.");

    rootLayout.orientation = enums.Orientation.horizontal;

    TKUnit.waitUntilReady(function () {
        return rootLayout.arrangeCount > arrangeCount;
    }, ASYNC);

    TKUnit.assertEqual(rootLayout.measureCount, 2, "Orientation change should invalidate measure.");
    TKUnit.assertEqual(rootLayout.arrangeCount, 2, "Orientation change should invalidate arrange.");
}

export function test_StackLayout_ShouldMeasureWith_AtMost_OnVertical() {

    TKUnit.waitUntilReady(function () {
        return btn1.isLayoutValid;
    }, ASYNC);

    TKUnit.assertEqual(rootLayout.orientation, enums.Orientation.vertical, "StackLayout should be vertical.");
    TKUnit.assert(rootLayout.measured, "Layout should be measured.");
    TKUnit.assert(rootLayout.arranged, "Layout should be arranged.");

    var specs = btn1._getCurrentMeasureSpecs();

    TKUnit.assertEqual(utils.layout.getMeasureSpecMode(specs.heightMeasureSpec), utils.layout.AT_MOST, "Layout should measure child with AT_MOST Height in vertical orientation.");
}

export function test_StackLayout_ShouldMeasureWith_AtMost_OnHorizontal() {

    rootLayout.orientation = enums.Orientation.horizontal;

    TKUnit.waitUntilReady(function () {
        return btn1.arranged;
    }, ASYNC);

    TKUnit.assert(rootLayout.measured, "Layout should be measured.");
    TKUnit.assert(rootLayout.arranged, "Layout should be arranged.");

    var specs = btn1._getCurrentMeasureSpecs();

    TKUnit.assertEqual(utils.layout.getMeasureSpecMode(specs.widthMeasureSpec), utils.layout.AT_MOST, "Layout should measure child with AT_MOST Width in horizontal orientation.");
}

export function test_StackLayout_DesiredSize_Vertical() {

    rootLayout.verticalAlignment = enums.VerticalAlignment.top;
    rootLayout.horizontalAlignment = enums.HorizontalAlignment.left;
    TKUnit.waitUntilReady(function () {
        return btn2.arranged;
    }, ASYNC);

    TKUnit.assertEqual(rootLayout.getMeasuredWidth(), Math.max(btn1.getMeasuredWidth(), btn2.getMeasuredWidth()), "Layout getMeasuredWidth should be Max of children getMeasuredWidth");
    TKUnit.assertEqual(rootLayout.getMeasuredHeight(), (btn1.getMeasuredHeight() + btn2.getMeasuredHeight()), "Layout getMeasuredHeight should be Sum of children getMeasuredHeight");
}

export function test_StackLayout_DesiredSize_Horizontal() {

    rootLayout.horizontalAlignment = enums.HorizontalAlignment.left;
    rootLayout.verticalAlignment = enums.VerticalAlignment.top;
    rootLayout.orientation = enums.Orientation.horizontal;

    TKUnit.waitUntilReady(function () {
        return btn2.arranged;
    }, ASYNC);

    TKUnit.assertEqual(rootLayout.getMeasuredWidth(), (btn1.getMeasuredWidth() + btn2.getMeasuredWidth()), "Layout getMeasuredWidth should be Sum of children getMeasuredWidth");
    TKUnit.assertEqual(rootLayout.getMeasuredHeight(), Math.max(btn1.getMeasuredHeight(), btn2.getMeasuredHeight()), "Layout getMeasuredHeight should be Max of children getMeasuredHeight");
}

export function test_StackLayout_Padding_Vertical() {
    rootLayout.width = 300;
    rootLayout.height = 300;

    rootLayout.paddingLeft = 10;
    rootLayout.paddingTop = 20;
    rootLayout.paddingRight = 30;
    rootLayout.paddingBottom = 40;

    btn1.height = 50;
    btn2.height = 50;

    TKUnit.waitUntilReady(function () {
        return btn2.arranged;
    }, ASYNC);

    helper.assertMeasure(btn1, 260, 50);
    helper.assertMeasure(btn1, 260, 50);

    helper.assertLayout(btn1, 10, 20, 260, 50, "btn1");
    helper.assertLayout(btn2, 10, 70, 260, 50, "btn2");
}

export function test_StackLayout_Padding_Horizontal() {
    rootLayout.width = 300;
    rootLayout.height = 300;
    rootLayout.orientation = enums.Orientation.horizontal;

    rootLayout.paddingLeft = 10;
    rootLayout.paddingTop = 20;
    rootLayout.paddingRight = 30;
    rootLayout.paddingBottom = 40;

    btn1.width = 50;
    btn2.width = 50;

    TKUnit.waitUntilReady(function () {
        return btn2.arranged;
    }, ASYNC);

    helper.assertMeasure(btn1, 50, 240);
    helper.assertMeasure(btn1, 50, 240);

    helper.assertLayout(btn1, 10, 20, 50, 240, "btn1");
    helper.assertLayout(btn2, 60, 20, 50, 240, "btn2");
}

export function test_codesnippets() {
    // <snippet module="ui/layouts/stack-layout" title="stack-layout">
    // ### Create StackLayout
    // ``` JavaScript
    var stackLayout = new layout.StackLayout();
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
    var btn = new button.Button();
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
};