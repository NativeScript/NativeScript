import TKUnit = require("../../TKUnit");
import viewModule = require("ui/core/view");
import frame = require("ui/frame");
import page = require("ui/page");
import button = require("ui/button");
import label = require("ui/label");
import types = require("utils/types");
import helper = require("../../ui/helper");
import color = require("color");
import dependensyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import layoutModule = require("ui/layouts/layout");
import observable = require("data/observable");
import bindable = require("ui/core/bindable");
import definition = require("./view-tests");
import enums = require("ui/enums");

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

    helper.do_PageTest_WithButton(test);

    // the test will call goBack to the current frame and will remove the test page
    // verify the first view returned in the helper callback is detached (no parent)
    TKUnit.assert(types.isUndefined(cachedViews[0].parent));

    // the button (second view) should have a parent
    TKUnit.assert(types.isDefined(cachedViews[1].parent));
    TKUnit.assert(cachedViews[1].parent === cachedViews[0]);
}

export var test_domId_IsUnique = function () {
    var btn = new button.Button();
    var topframe = frame.topmost();
    TKUnit.assert(btn._domId !== topframe._domId);
    TKUnit.assert(btn._domId !== topframe.currentPage._domId);
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

export var test_bindingContext_IsInherited = function () {
    var context = {};
    frame.topmost().bindingContext = context;

    var test = function (views: Array<viewModule.View>) {
        var i;
        for (i = 0; i < views.length; i++) {
            TKUnit.assert(views[i].bindingContext === context);
        }
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
    frame.topmost().bindingContext = undefined;
}

export var test_isAddedToNativeVisualTree_IsUpdated = function () {
    var test = function (views: Array<viewModule.View>) {
        var i;
        for (i = 0; i < views.length; i++) {
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
            TKUnit.assert(e.message === "View already has a parent.");
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
    var test = function (views: Array<viewModule.View>) {
        var redColor = new color.Color("red");
        views[0].style.color = redColor;

        var newButton = new TestButton();
        views[1]._addView(newButton);

        TKUnit.assert(newButton.style.color === redColor);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

var inheritanceTestDefaultValue = 42;

var inheritanceTestProperty = new dependensyObservable.Property(
    "inheritanceTest",
    "TestView",
    new proxy.PropertyMetadata(inheritanceTestDefaultValue, dependensyObservable.PropertyMetadataSettings.Inheritable)
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
    TKUnit.assert(actualResult === firstValue, "Actual result: " + actualResult + "; Expected result: " + firstValue);

    model.set(propName, secondValue);
    actualResult = view.get(propName);
    TKUnit.assert(actualResult === secondValue, "Actual result: " + actualResult + "; Expected result: " + secondValue);
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
    TKUnit.assert(actualResult === firstValue, "Actual result: " + actualResult + "; Expected result: " + firstValue);

    model.set(propName, secondValue);
    actualResult = view.style.get(propName);
    TKUnit.assert(actualResult === secondValue, "Actual result: " + actualResult + "; Expected result: " + secondValue);
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
    property_binding_style_test("margin", "1,1,1,1", "2,2,2,2");
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
    property_binding_style_test("padding", "1,1,1,1", "2,2,2,2");
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
    var lbl = new label.Label();
    lbl.borderRadius = 10;
    lbl.borderWidth = 2;
    lbl.borderColor = new color.Color("#FF0000");
    lbl.backgroundColor = new color.Color("#FFFF00");

    return lbl;
}

export var testIsVisible = function () {
    var lbl = new label.Label();

    helper.buildUIAndRunTest(lbl, function (views: Array<viewModule.View>) {
        TKUnit.assert(lbl.visibility === enums.Visibility.visible, "Actual: " + lbl.visibility + "; Expected: " + enums.Visibility.visible);
        TKUnit.assert(lbl._isVisible, "Actual: " + lbl._isVisible + "; Expected: true;");

        lbl.visibility = enums.Visibility.collapse;
        TKUnit.assert(lbl.visibility === enums.Visibility.collapse, "Actual: " + lbl.visibility + "; Expected: " + enums.Visibility.collapse);
        TKUnit.assert(!lbl._isVisible, "Actual: " + lbl._isVisible + "; Expected: false;");

        lbl.visibility = enums.Visibility.collapsed;
        TKUnit.assert(lbl.visibility === enums.Visibility.collapsed, "Actual: " + lbl.visibility + "; Expected: " + enums.Visibility.collapsed);
        TKUnit.assert(!lbl._isVisible, "Actual: " + lbl._isVisible + "; Expected: false;");
    });
}

export var testBorderWidth = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <label.Label>views[0];
        var expectedValue = lbl.borderWidth;
        var actualValue = definition.getNativeBorderWidth(lbl);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testCornerRadius = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <label.Label>views[0];
        var expectedValue = lbl.borderRadius;
        var actualValue = definition.getNativeCornerRadius(lbl);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBorderColor = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <label.Label>views[0];
        TKUnit.assert(definition.checkNativeBorderColor(lbl), "BorderColor not applied correctly!");
    });
}

export var testBackgroundColor = function () {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<viewModule.View>) {
        var lbl = <label.Label>views[0];
        TKUnit.assert(definition.checkNativeBackgroundColor(lbl), "BackgroundColor not applied correctly!");
    });
}

export var testBackgroundImage = function () {
    var lbl = _createLabelWithBorder();
    lbl.cssClass = "myClass";
    helper.buildUIAndRunTest(lbl, function (views: Array<viewModule.View>) {
        var page = <page.Page>views[1];
        page.css = ".myClass { background-image: url('~/logo.png') }";

        TKUnit.assert(definition.checkNativeBackgroundImage(lbl), "Style background-image not loaded correctly.");
    });
}