import * as TKUnit from "../../TKUnit";
import * as viewModule from "ui/core/view";
import * as frame from "ui/frame";
import * as page from "ui/page";
import * as button from "ui/button";
import * as labelModule from "ui/label";
import * as types from "utils/types";
import * as helper from "../../ui/helper";
import * as color from "color";
import * as dependensyObservable from "ui/core/dependency-observable";
import * as proxy from "ui/core/proxy";
import * as layoutModule from "ui/layouts/layout";
import * as observable from "data/observable";
import * as bindable from "ui/core/bindable";
import * as definition from "./view-tests";
import * as enums from "ui/enums";
import * as absoluteLayoutModule from "ui/layouts/absolute-layout";

export var test_eachDescendant = function () {
    var test = function (views: Array<viewModule.View>) {

        // traverse the visual tree and verify the hierarchy
        var counter = 0;
        var callback = function (child: viewModule.View): boolean {
            TKUnit.assert(child === views[counter]);
            counter++;
            return true;
        }

        viewModule.eachDescendant(frame.topmost(), callback);
        // Descendants: page, actionBar, button
        TKUnit.assertEqual(counter, 3, "descendants");
    }

    helper.do_PageTest_WithButton(test);
}

export var test_getViewById_Static = function () {
    var test = function (views: Array<viewModule.View>) {
        views[1].id = "myLayout";

        // traverse the visual tree and verify the hierarchy
        var result = viewModule.getViewById(frame.topmost(), "myLayout");

        TKUnit.assert(result === views[1]);
    }

    helper.do_PageTest_WithButton(test);
}

export var test_getViewById_Instance = function () {
    var test = function (views: Array<viewModule.View>) {
        views[1].id = "myLayout";

        // traverse the visual tree and verify the hierarchy
        var result = frame.topmost().getViewById<viewModule.View>("myLayout");

        TKUnit.assert(result === views[1]);
    }

    helper.do_PageTest_WithButton(test);
}

export var test_eachDescendant_Break_Iteration = function () {
    var test = function (views: Array<viewModule.View>) {
        // traverse the visual tree and verify the hierarchy
        var counter = 0;
        var callback = function (child: viewModule.View): boolean {
            TKUnit.assert(child === views[0]);
            counter++;
            return false;
        }

        viewModule.eachDescendant(frame.topmost(), callback);
        TKUnit.assert(counter === 1);
    }

    helper.do_PageTest_WithButton(test);
}

export var test_parent_IsValid_WhenAttached_ToVisualTree = function () {
    var test = function (views: Array<viewModule.View>) {
        // views[0] is a Page instance, its parent should be the topmost frame
        TKUnit.assert(types.isDefined(views[0].parent));
        TKUnit.assert(views[0].parent === frame.topmost());

        // views[1] is a Button instance, its parent should be the Page (views[0])
        TKUnit.assert(types.isDefined(views[1].parent));
        TKUnit.assert(views[1].parent === views[0]);
    }

    helper.do_PageTest_WithButton(test);
}

export var test_parent_IsReset_WhenDetached_FromVisualTree = function () {
    var cachedViews: Array<viewModule.View>;

    var test = function (views: Array<viewModule.View>) {
        cachedViews = views;
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);

    TKUnit.assert(types.isUndefined(cachedViews[1].parent));
    TKUnit.assert(types.isDefined(cachedViews[2].parent));
    TKUnit.assert(cachedViews[2].parent === cachedViews[1]);
}

export var test_domId_IsUnique = function () {
    var btn = new button.Button();
    var topframe = frame.topmost();
    TKUnit.assert(btn._domId !== topframe._domId);
    TKUnit.assert(btn._domId !== topframe.currentPage._domId);
}

export var test_Id_WillNotCrash_WhenSetToNumber = function () {
    var btn = new button.Button();
    btn.id = "1";
    TKUnit.assert(btn.id === "1");
}

export var test_event_LoadedUnloaded_IsRaised = function () {
    var test = function (views: Array<viewModule.View>) {
        var i;
        for (i = 0; i < views.length; i++) {
            TKUnit.assert(views[i].isLoaded);
        }

        // change the page's content and verify the proper events
        var layoutUnloaded = false,
            buttonUnloaded = false;

        views[1].on(viewModule.View.unloadedEvent, (data) => {
            layoutUnloaded = true;
        });

        views[2].on(viewModule.View.unloadedEvent, (data) => {
            buttonUnloaded = true;
        });

        var newButton = new button.Button(),
            buttonLoaded = false;

        newButton.on(viewModule.View.loadedEvent, (data) => {
            buttonLoaded = true;
        });

        (<page.Page>views[0]).content = newButton;
        TKUnit.assert(layoutUnloaded);
        TKUnit.assert(buttonUnloaded);
        TKUnit.assert(buttonLoaded);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function test_bindingContext_IsInherited() {
    var context = {};
    var test = function (views: Array<viewModule.View>) {
        views[0].bindingContext = context;
        for (let i = 0; i < views.length; i++) {
            TKUnit.assertEqual(views[i].bindingContext, context);
        }
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
    frame.topmost().bindingContext = undefined;
}

export var test_isAddedToNativeVisualTree_IsUpdated = function () {
    var test = function (views: Array<viewModule.View>) {

        for (let i = 0; i < views.length; i++) {
            TKUnit.assert(views[i]._isAddedToNativeVisualTree);
        }

        var newButton = new button.Button();
        TKUnit.assert(!newButton._isAddedToNativeVisualTree);

        views[1]._addView(newButton);
        TKUnit.assert(newButton._isAddedToNativeVisualTree);
        views[1]._removeView(newButton);
        TKUnit.assert(!newButton._isAddedToNativeVisualTree);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_addView_WillThrow_IfView_IsAlreadyAdded = function () {
    var test = function (views: Array<viewModule.View>) {
        var newButton = new button.Button();
        views[1]._addView(newButton);

        var thrown = false;
        try {
            views[1]._addView(newButton);
        } catch (e) {
            thrown = true;
            TKUnit.assert(e.message.indexOf("View already has a parent.") >= 0);
        }

        TKUnit.assert(thrown);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_addToNativeVisualTree_WillThrow_IfView_IsAlreadyAdded = function () {
    var test = function (views: Array<viewModule.View>) {
        var newButton = new button.Button();
        views[1]._addView(newButton);

        var thrown = false;
        try {
            views[1]._addViewToNativeVisualTree(newButton);
        } catch (e) {
            thrown = true;
            TKUnit.assert(e.message === "Child already added to the native visual tree.");
        }

        TKUnit.assert(thrown);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_InheritableStyleProperties_AreInherited = function () {
    var test = function (views: Array<viewModule.View>) {
        var redColor = new color.Color("red");
        views[0].style.color = redColor;

        var newButton = new button.Button();
        views[1]._addView(newButton);

        TKUnit.assert(newButton.style.color === redColor);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export class TestButton extends button.Button {

}

export var test_InheritableStylePropertiesWhenUsedWithExtendedClass_AreInherited = function () {
    let page = frame.topmost().currentPage;
    let redColor = new color.Color("red");
    page.style.color = redColor;

    let newButton = new TestButton();
    page.content = newButton;

    TKUnit.assertEqual(newButton.style.color, redColor);
}

var inheritanceTestDefaultValue = 42;

var inheritanceTestProperty = new dependensyObservable.Property(
    "inheritanceTest",
    "TestView",
    new proxy.PropertyMetadata(inheritanceTestDefaultValue, dependensyObservable.PropertyMetadataSettings.Inheritable)
    );

var booleanInheritanceTestDefaultValue = true;

var booleanInheritanceTestProperty = new dependensyObservable.Property(
    "booleanInheritanceTest",
    "TestView",
    new proxy.PropertyMetadata(booleanInheritanceTestDefaultValue, dependensyObservable.PropertyMetadataSettings.Inheritable)
);

var dummyProperty = new dependensyObservable.Property(
    "dummy",
    "TestView",
    new proxy.PropertyMetadata(0)
    );

class TestView extends layoutModule.Layout {

    constructor(name: string) {
        super();
        this._tralala = name;
    }

    private _tralala: string;

    get tralala(): string {
        return this._tralala;
    }
    set tralala(value: string) {
        this._tralala = value;
    }

    get inheritanceTest(): number {
        return this._getValue(inheritanceTestProperty);
    }
    set inheritanceTest(value: number) {
        this._setValue(inheritanceTestProperty, value);
    }

    get booleanInheritanceTest(): boolean {
        return this._getValue(booleanInheritanceTestProperty);
    }
    set booleanInheritanceTest(value: boolean) {
        this._setValue(booleanInheritanceTestProperty, value);
    }

    get dummy(): number {
        return this._getValue(dummyProperty);
    }
    set dummy(value: number) {
        this._setValue(dummyProperty, value);
    }

    public toString() {
        return super.toString() + "." + this.tralala;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this.setMeasuredDimension(100, 100);
    }
}

export var test_InheritableProperties_getValuesFromParent = function () {
    var testValue = 35;
    var test = function (views: Array<viewModule.View>) {
        var bottomView = <TestView>views[3]

        TKUnit.assert(bottomView.inheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.inheritanceTest);
    }

    var firstView = new TestView("firstView");
    firstView.inheritanceTest = testValue;
    var secondView = new TestView("secondView");
    var thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
}

export var test_BooleanInheritableProperties_getValuesFromParent = function () {
    var testValue = false;
    var test = function (views: Array<viewModule.View>) {
        var bottomView = <TestView>views[3]

        TKUnit.assert(bottomView.booleanInheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.booleanInheritanceTest);
    }

    var firstView = new TestView("firstView");
    firstView.booleanInheritanceTest = testValue;
    var secondView = new TestView("secondView");
    var thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
}

export var test_InheritableProperties_resetValuesOnRemoveFromVisualTree = function () {
    var testValue = 35;
    var test = function (views: Array<viewModule.View>) {
        var bottomView = <TestView>views[3];

        TKUnit.assert(bottomView.inheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.inheritanceTest);

        (<TestView>views[2]).removeChild(bottomView);

        TKUnit.assert(bottomView.inheritanceTest === inheritanceTestDefaultValue, "Expected: " + inheritanceTestDefaultValue + " Actual: " + bottomView.inheritanceTest);
    }

    var firstView = new TestView("firstView");
    firstView.inheritanceTest = testValue;
    var secondView = new TestView("secondView");
    var thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
}

export var test_InheritableProperties_DefaultValue = function () {
    var test = function (views: Array<viewModule.View>) {
        var bottomView = <TestView>views[3]

        TKUnit.assert(bottomView.inheritanceTest === inheritanceTestDefaultValue, "Expected: " + inheritanceTestDefaultValue + " Actual: " + bottomView.inheritanceTest);
    }

    var firstView = new TestView("firstView");
    var secondView = new TestView("secondView");
    var thirdView = new TestView("thirdView");

    secondView.addChild(thirdView);
    firstView.addChild(secondView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
}

export var test_InheritableProperties_ChangeNotification = function () {
    var testValue = 35;
    var test = function (views: Array<viewModule.View>) {
        var topView = <TestView>views[1];
        topView.inheritanceTest = testValue;

        var bottomView = <TestView>views[3];
        bottomView.bind({ targetProperty: "dummy", sourceProperty: "inheritanceTest" }, bottomView);

        TKUnit.assert(bottomView.dummy === testValue, "Expected: " + testValue + " Actual: " + bottomView.dummy);
    }

    var firstView = new TestView("firstView");
    var secondView = new TestView("secondView");
    var thirdView = new TestView("thirdView");

    secondView.addChild(thirdView);
    firstView.addChild(secondView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
}

function property_binding_test(propName: string, firstValue: any, secondValue: any, view?: viewModule.View) {
    var actualResult;
    var model = new observable.Observable();
    model.set(propName, firstValue);

    var options: bindable.BindingOptions = {
        sourceProperty: propName,
        targetProperty: propName
    }

    if (!view) {
        view = new TestView("view");
    }

    view.bind(options, model);

    actualResult = view.get(propName);
    TKUnit.assertEqual(actualResult, firstValue);

    model.set(propName, secondValue);
    actualResult = view.get(propName);
    TKUnit.assertEqual(actualResult, secondValue);
}

function property_binding_style_test(propName: string, firstValue: any, secondValue: any, view?: viewModule.View) {
    var actualResult;
    var model = new observable.Observable();
    model.set(propName, firstValue);

    var options: bindable.BindingOptions = {
        sourceProperty: propName,
        targetProperty: "style." + propName
    }

    if (!view) {
        view = new TestView("view");
    }

    view.bind(options, model);

    actualResult = view.style.get(propName);
    TKUnit.assertEqual(actualResult, firstValue);

    model.set(propName, secondValue);
    actualResult = view.style.get(propName);
    TKUnit.assertEqual(actualResult, secondValue);
}

export var test_binding_width = function () {
    property_binding_test("width", 42, 43);
}

export var test_binding_height = function () {
    property_binding_test("height", 42, 43);
}

export var test_binding_minWidth = function () {
    property_binding_test("minWidth", 42, 43);
}

export var test_binding_minHeight = function () {
    property_binding_test("minHeight", 42, 43);
}

export var test_binding_horizontalAlignment = function () {
    property_binding_test("horizontalAlignment", "left", "right");
}

export var test_binding_verticalAlignment = function () {
    property_binding_test("verticalAlignment", "top", "bottom");
}

export var test_binding_marginLeft = function () {
    property_binding_test("marginLeft", 42, 43);
}

export var test_binding_marginTop = function () {
    property_binding_test("marginTop", 42, 43);
}

export var test_binding_marginRight = function () {
    property_binding_test("marginRight", 42, 43);
}

export var test_binding_marginBottom = function () {
    property_binding_test("marginBottom", 42, 43);
}

export var test_binding_visibility = function () {
    property_binding_test("visibility", "collapsed", "visible");
}

export var test_binding_isEnabled = function () {
    property_binding_test("isEnabled", false, true);
}

export var test_binding_isUserInteractionEnabled = function () {
    property_binding_test("isUserInteractionEnabled", false, true);
}

export var test_binding_id = function () {
    property_binding_test("id", "id1", "id2");
}

export var test_binding_cssClass = function () {
    property_binding_test("cssClass", "class1", "class2");
}

export var test_binding_className = function () {
    property_binding_test("className", "class1", "class2");
}

export var test_binding_style_color = function () {
    property_binding_style_test("color", new color.Color("#FF0000"), new color.Color("#00FF00"));
}

export var test_binding_style_backgroundColor = function () {
    property_binding_style_test("backgroundColor", new color.Color("#FF0000"), new color.Color("#00FF00"));
}

export var test_binding_style_fontSize = function () {
    property_binding_style_test("fontSize", 5, 10);
}

export var test_binding_style_textAlignment = function () {
    property_binding_style_test("textAlignment", "right", "center");
}

export var test_binding_style_width = function () {
    property_binding_style_test("width", 42, 43);
}

export var test_binding_style_height = function () {
    property_binding_style_test("height", 42, 43);
}

export var test_binding_style_minWidth = function () {
    property_binding_style_test("minWidth", 42, 43);
}

export var test_binding_style_minHeight = function () {
    property_binding_style_test("minHeight", 42, 43);
}

export var test_binding_style_margin = function () {
    property_binding_style_test("margin", "1 1 1 1", "2 2 2 2");
}

export var test_binding_style_marginLeft = function () {
    property_binding_style_test("marginLeft", 42, 43);
}

export var test_binding_style_marginTop = function () {
    property_binding_style_test("marginTop", 42, 43);
}

export var test_binding_style_marginRight = function () {
    property_binding_style_test("marginRight", 42, 43);
}

export var test_binding_style_marginBottom = function () {
    property_binding_style_test("marginBottom", 42, 43);
}

export var test_binding_style_padding = function () {
    property_binding_style_test("padding", "1 1 1 1", "2 2 2 2");
}

export var test_binding_style_paddingLeft = function () {
    property_binding_style_test("paddingLeft", 42, 43);
}

export var test_binding_style_paddingTop = function () {
    property_binding_style_test("paddingTop", 42, 43);
}

export var test_binding_style_paddingRight = function () {
    property_binding_style_test("paddingRight", 42, 43);
}

export var test_binding_style_paddingBottom = function () {
    property_binding_style_test("paddingBottom", 42, 43);
}

export var test_binding_style_horizontalAlignment = function () {
    property_binding_style_test("horizontalAlignment", "left", "right");
}

export var test_binding_style_verticalAlignment = function () {
    property_binding_style_test("verticalAlignment", "top", "bottom");
}

export var test_binding_style_visibility = function () {
    property_binding_style_test("visibility", "collapsed", "visible");
}

export var test_binding_style_opacity = function () {
    property_binding_style_test("opacity", 0.5, 0.6);
}

function _createLabelWithBorder(): viewModule.View {
    var lbl = new labelModule.Label();
    lbl.borderRadius = 10;
    lbl.borderWidth = 2;
    lbl.borderColor = new color.Color("#FF0000");
    lbl.backgroundColor = new color.Color("#FFFF00");

    return lbl;
}

export var testIsVisible = function () {
    var lbl = new labelModule.Label();

    helper.buildUIAndRunTest(lbl, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(lbl.visibility, "visible");
        TKUnit.assertEqual(lbl.isCollapsed, false);

        lbl.visibility = "collapse";
        TKUnit.assertEqual(lbl.visibility, "collapse");
        TKUnit.assertEqual(lbl.isCollapsed, true);

        lbl.visibility = "collapsed";
        TKUnit.assertEqual(lbl.visibility, "collapsed");
        TKUnit.assertEqual(lbl.isCollapsed, true);
    });
}

export var testSetInlineStyle = function () {
    var lbl = new labelModule.Label();

    var expectedColor = "#ff0000";
    var expectedBackgroundColor = "#ff0000";

    lbl.setInlineStyle(`color: ${expectedColor};background-color: ${expectedBackgroundColor};`);

    helper.buildUIAndRunTest(lbl, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(lbl.color.hex, expectedColor);
        TKUnit.assertEqual(lbl.backgroundColor.hex, expectedBackgroundColor);
    });
}

export var testBorderWidth = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <labelModule.Label>views[0];
        var expectedValue = lbl.borderWidth;
        var actualValue = definition.getUniformNativeBorderWidth(lbl);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export var testCornerRadius = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <labelModule.Label>views[0];
        var expectedValue = lbl.borderRadius;
        var actualValue = definition.getUniformNativeCornerRadius(lbl);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export var testBorderColor = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <labelModule.Label>views[0];
        TKUnit.assertEqual(definition.checkUniformNativeBorderColor(lbl), true, "BorderColor not applied correctly!");
    });
}

export var testBackgroundColor = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <labelModule.Label>views[0];
        TKUnit.assertEqual(definition.checkNativeBackgroundColor(lbl), true, "BackgroundColor not applied correctly!");
    });
}

export var testBackgroundImage = function () {
    var lbl = _createLabelWithBorder();
    lbl.className = "myClass";
    helper.buildUIAndRunTest(lbl, function (views: Array<viewModule.View>) {
        var page = <page.Page>views[1];
        page.css = ".myClass { background-image: url('~/logo.png') }";
        TKUnit.assertEqual(definition.checkNativeBackgroundImage(lbl), true, "Style background-image not loaded correctly.");
    });
}

export function test_automation_text_default_value() {
    let view = new button.Button();
    TKUnit.assertTrue(view.automationText === undefined, "AutomationText default value should be UNDEFINED.");
}

export var test_getLocationInWindow_IsUndefinedWhenNotInTheVisualTree = function () {
    var label = new labelModule.Label();
    TKUnit.assertNull(label.getLocationInWindow());
}

export var test_getLocationOnScreen_IsUndefinedWhenNotInTheVisualTree = function () {
    var label = new labelModule.Label();
    TKUnit.assertNull(label.getLocationOnScreen());
}

var delta = 1;
export var test_getLocationRelativeToOtherView = function () {
    var a1 = new absoluteLayoutModule.AbsoluteLayout();
    a1.width = 200;
    a1.height = 200;
    a1.backgroundColor = new color.Color("red");

    var a2 = new absoluteLayoutModule.AbsoluteLayout();
    a2.width = 100;
    a2.height = 100;
    absoluteLayoutModule.AbsoluteLayout.setLeft(a2, 10);
    absoluteLayoutModule.AbsoluteLayout.setTop(a2, 10);
    a2.backgroundColor = new color.Color("green");

    var label = new labelModule.Label();
    label.text = "label";
    label.id = "label";
    label.width = 70;
    label.height = 30;
    absoluteLayoutModule.AbsoluteLayout.setLeft(label, 10);
    absoluteLayoutModule.AbsoluteLayout.setTop(label, 10);
    a2.backgroundColor = new color.Color("yellow");

    a2.addChild(label);
    a1.addChild(a2);

    helper.buildUIAndRunTest(a1, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => a1.isLayoutValid);

        var labelInA2 = label.getLocationRelativeTo(a2);
        var labelInA1 = label.getLocationRelativeTo(a1);
        var a2InA1 = a2.getLocationRelativeTo(a1);

        TKUnit.assertAreClose(labelInA2.x, 10, delta, "labelInA2.x");
        TKUnit.assertAreClose(labelInA2.y, 10, delta, "labelInA2.y");

        TKUnit.assertAreClose(labelInA1.x, 20, delta, "labelInA1.x");
        TKUnit.assertAreClose(labelInA1.y, 20, delta, "labelInA1.y");

        TKUnit.assertAreClose(a2InA1.x, 10, delta, "a2InA1.x");
        TKUnit.assertAreClose(a2InA1.y, 10, delta, "a2InA1.y");
    });
}

export var test_getActualSize = function () {
    var label = new labelModule.Label();
    label.width = 100;
    label.height = 200;
    helper.buildUIAndRunTest(label, function (views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => label.isLayoutValid);
        var actualSize = label.getActualSize();
        TKUnit.assertAreClose(actualSize.width, 100, delta, "actualSize.width");
        TKUnit.assertAreClose(actualSize.height, 200, delta, "actualSize.height");
    });
}