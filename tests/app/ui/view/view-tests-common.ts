import * as TKUnit from "../../TKUnit";
import { View, eachDescendant, getViewById, InheritedProperty, CssProperty, CssAnimationProperty, Property, Style } from "tns-core-modules/ui/core/view";
import { topmost } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { Label } from "tns-core-modules/ui/label";
import { Color } from "tns-core-modules/color";
import { Layout } from "tns-core-modules/ui/layouts/layout";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { AbsoluteLayout } from "tns-core-modules/ui/layouts/absolute-layout";
import * as utils from "tns-core-modules/utils/utils";
import * as types from "tns-core-modules/utils/types";
import * as helper from "../../ui/helper";
import * as observable from "tns-core-modules/data/observable";
import * as bindable from "tns-core-modules/ui/core/bindable";
import * as definition from "./view-tests";
import { isIOS } from "tns-core-modules/platform";

export function test_eachDescendant() {
    const test = function (views: Array<View>) {

        // traverse the visual tree and verify the hierarchy
        let counter = 0;
        const callback = function (child: View): boolean {
            TKUnit.assert(child === views[counter]);
            counter++;
            return true;
        };

        eachDescendant(topmost(), callback);
        // Descendants: page, actionBar, button
        TKUnit.assertEqual(counter, 3, "descendants");
    };

    helper.do_PageTest_WithButton(test);
};

export function test_getViewById_Static() {
    const test = function (views: Array<View>) {
        views[1].id = "myLayout";

        // traverse the visual tree and verify the hierarchy
        const result = getViewById(topmost(), "myLayout");

        TKUnit.assert(result === views[1]);
    };

    helper.do_PageTest_WithButton(test);
};

export function test_getViewById_Instance() {
    const test = function (views: Array<View>) {
        views[1].id = "myLayout";

        // traverse the visual tree and verify the hierarchy
        const result = topmost().getViewById<View>("myLayout");

        TKUnit.assert(result === views[1]);
    };

    helper.do_PageTest_WithButton(test);
};

export function test_eachDescendant_Break_Iteration() {
    const test = function (views: Array<View>) {
        // traverse the visual tree and verify the hierarchy
        let counter = 0;
        const callback = function (child: View): boolean {
            TKUnit.assert(child === views[0]);
            counter++;
            return false;
        };

        eachDescendant(topmost(), callback);
        TKUnit.assert(counter === 1);
    };

    helper.do_PageTest_WithButton(test);
};

export function test_parent_IsValid_WhenAttached_ToVisualTree() {
    const test = function (views: Array<View>) {
        // views[0] is a Page instance, its parent should be the topmost frame
        TKUnit.assert(types.isDefined(views[0].parent));
        TKUnit.assert(views[0].parent === topmost());

        // views[1] is a Button instance, its parent should be the Page (views[0])
        TKUnit.assert(types.isDefined(views[1].parent));
        TKUnit.assert(views[1].parent === views[0]);
    };

    helper.do_PageTest_WithButton(test);
};

export function test_parent_IsReset_WhenDetached_FromVisualTree() {
    let cachedViews: Array<View>;

    const test = function (views: Array<View>) {
        cachedViews = views;
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);

    TKUnit.assert(types.isUndefined(cachedViews[1].parent));
    TKUnit.assert(types.isDefined(cachedViews[2].parent));
    TKUnit.assert(cachedViews[2].parent === cachedViews[1]);
};

export function test_domId_IsUnique() {
    const btn = new Button();
    const topframe = topmost();
    TKUnit.assert(btn._domId !== topframe._domId);
    TKUnit.assert(btn._domId !== topframe.currentPage._domId);
};

export function test_Id_WillNotCrash_WhenSetToNumber() {
    const btn = new Button();
    btn.id = "1";
    TKUnit.assert(btn.id === "1");
};

export function test_event_LoadedUnloaded_IsRaised() {
    const test = function (views: Array<View>) {
        let i;
        for (i = 0; i < views.length; i++) {
            TKUnit.assert(views[i].isLoaded);
        }

        // change the page's content and verify the proper events
        let layoutUnloaded = false;
        let buttonUnloaded = false;

        views[1].on(View.unloadedEvent, (data) => {
            layoutUnloaded = true;
        });

        views[2].on(View.unloadedEvent, (data) => {
            buttonUnloaded = true;
        });

        const newButton = new Button();
        let buttonLoaded = false;

        newButton.on(View.loadedEvent, (data) => {
            buttonLoaded = true;
        });

        (<Page>views[0]).content = newButton;
        TKUnit.assert(layoutUnloaded);
        TKUnit.assert(buttonUnloaded);
        TKUnit.assert(buttonLoaded);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function test_bindingContext_IsInherited() {
    const context = {};
    const test = function (views: Array<View>) {
        views[0].bindingContext = context;
        for (let i = 0; i < views.length; i++) {
            TKUnit.assertEqual(views[i].bindingContext, context);
        }
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
    topmost().bindingContext = undefined;
}

export function test_isAddedToNativeVisualTree_IsUpdated() {
    const test = function (views: Array<View>) {

        for (let i = 0; i < views.length; i++) {
            TKUnit.assert(views[i]._isAddedToNativeVisualTree, `View ${views[i]} not initially added`);
        }

        const newButton = new Button();
        TKUnit.assert(!newButton._isAddedToNativeVisualTree, "Button is not added initially");

        views[1]._addView(newButton);
        TKUnit.assert(newButton._isAddedToNativeVisualTree, "Button is not added after _addView");
        views[1]._removeView(newButton);
        TKUnit.assert(!newButton._isAddedToNativeVisualTree, "Button is removed after _removeView");
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function test_addView_WillThrow_IfView_IsAlreadyAdded() {
    const test = function (views: Array<View>) {
        const newButton = new Button();
        views[1]._addView(newButton);

        let thrown = false;
        try {
            views[1]._addView(newButton);
        } catch (e) {
            thrown = true;
            TKUnit.assert(e.message.indexOf("View already has a parent.") >= 0);
        }

        TKUnit.assert(thrown);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function test_addToNativeVisualTree_WillThrow_IfView_IsAlreadyAdded() {
    const test = function (views: [Page, StackLayout, View, View]) {
        const newButton = new Button();
        views[1]._addView(newButton);

        let thrown = false;
        try {
            views[1]._addViewToNativeVisualTree(newButton);
        } catch (e) {
            thrown = true;
            TKUnit.assert(e.message === "Child already added to the native visual tree.");
        }

        TKUnit.assert(thrown);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function test_InheritableStyleProperties_AreInherited() {
    helper.do_PageTest_WithStackLayout_AndButton((views) => {
        const redColor = new Color("red");
        views[0].style.color = redColor;

        const newButton = new Button();
        views[1].addChild(newButton);

        TKUnit.assertEqual(newButton.style.color, redColor, "Color should be inherited");
    });
};

export class TestButton extends Button {

}

export function test_InheritableStylePropertiesWhenUsedWithExtendedClass_AreInherited() {
    let page = topmost().currentPage;
    let redColor = new Color("red");
    page.style.color = redColor;

    let newButton = new TestButton();
    page.content = newButton;

    TKUnit.assertEqual(newButton.style.color, redColor);
}

// TestView definition START
const customCssProperty = new CssProperty<Style, string>({ name: "customCssProperty", cssName: "custom-css-property" });
const customCssAnimationProperty = new CssAnimationProperty<Style, string>({ name: "customCssAnimationProperty", cssName: "custom-css-animation-property" });
const customViewProperty = new Property<TestView, string>({ name: "custom" });

class TestView extends Layout {
    public inheritanceTest: number;
    public booleanInheritanceTest: boolean;
    public dummy: number;

    public viewPropGetDefaultCounter: number = 0;
    public viewPropCounter: number = 0;
    public viewPropNativeValue: string;

    public cssPropGetDefaultCounter: number = 0;
    public cssPropCounter: number = 0;
    public cssPropNativeValue: string;

    public cssAnimPropGetDefaultCounter: number = 0;
    public cssAnimPropCounter: number = 0;
    public cssAnimPropNativeValue: string;

    public custom: string;
    get customCssProperty(): string {
        return this.style["customCssProperty"];
    }
    set customCssProperty(value: string) {
        this.style["customCssProperty"] = value;
    }

    get customCssAnimationProperty(): string {
        return this.style["customCssAnimationProperty"];
    }
    set customCssAnimationProperty(value: string) {
        this.style["customCssAnimationProperty"] = value;
    }

    private _nativeView;
    constructor(public name: string) {
        super();
        this._nativeView = this.nativeView;
        this.nativeView = undefined;
    }

    public createNativeView() {
        if (isIOS) {
            return this._nativeView;
        }

        return super.createNativeView();
    }

    public toString() {
        return super.toString() + "." + this.name;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this.setMeasuredDimension(100, 100);
    }

    [customViewProperty.getDefault](): string {
        this.viewPropGetDefaultCounter++;
        return "customViewPropertyDefaultValue";
    }
    [customViewProperty.setNative](value: string) {
        this.viewPropCounter++;
        this.viewPropNativeValue = value;
    }

    [customCssProperty.getDefault](): string {
        this.cssPropGetDefaultCounter++;
        return "customCssPropertyDefaultValue";
    }
    [customCssProperty.setNative](value: string) {
        this.cssPropCounter++;
        this.cssPropNativeValue = value;
    }

    [customCssAnimationProperty.getDefault](): string {
        this.cssAnimPropGetDefaultCounter++;
        return "customCssAnimationPropertyDefaultValue";
    }
    [customCssAnimationProperty.setNative](value: string) {
        this.cssAnimPropCounter++;
        this.cssAnimPropNativeValue = value;
    }
}

customCssProperty.register(Style);
customCssAnimationProperty.register(Style);
customViewProperty.register(TestView);

const inheritanceTestDefaultValue = 42;
const inheritanceTestProperty = new InheritedProperty<TestView, number>({ name: "inheritanceTest", defaultValue: inheritanceTestDefaultValue });
inheritanceTestProperty.register(TestView);

const booleanInheritanceTestDefaultValue = true;
const booleanInheritanceTestProperty = new InheritedProperty<TestView, boolean>({ name: "booleanInheritanceTest", defaultValue: booleanInheritanceTestDefaultValue });
booleanInheritanceTestProperty.register(TestView);

const dummyProperty = new InheritedProperty<TestView, number>({ name: "dummy", defaultValue: 0 });
dummyProperty.register(TestView);

/////// TestView definition END

export function test_NativeSetter_not_called_when_property_is_not_set() {
    const testView = new TestView("view");

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.viewPropCounter, 0, "Native setter should not be called if value is not set.");
        TKUnit.assertEqual(testView.cssPropCounter, 0, "Native setter should not be called if value is not set.");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 0, "Native setter should not be called if value is not set.");
    });
};

export function test_GetDefault_not_called_when_property_is_not_set() {
    const testView = new TestView("view");

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.viewPropGetDefaultCounter, 0, "Get default should not be called if value is not set.");
        TKUnit.assertEqual(testView.cssPropGetDefaultCounter, 0, "Get default should not be called if value is not set.");
        TKUnit.assertEqual(testView.cssAnimPropGetDefaultCounter, 0, "Get default should not be called if value is not set.");
    });
};

export function test_NativeSetter_called_only_once_with_localValue() {
    const testView = new TestView("view");
    testView.customCssProperty = "testCssValue";
    testView.customCssAnimationProperty = "testCssAnimValue";
    testView.custom = "testViewValue";

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.cssPropNativeValue, "testCssValue", "Native value");
        TKUnit.assertEqual(testView.cssAnimPropNativeValue, "testCssAnimValue", "Native value");
        TKUnit.assertEqual(testView.viewPropNativeValue, "testViewValue", "Native value");

        TKUnit.assertEqual(testView.cssPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.viewPropCounter, 1, "NativeSetter count called once");

        TKUnit.assertEqual(testView.cssPropGetDefaultCounter, 1, "GetDefault count called once");
        TKUnit.assertEqual(testView.cssAnimPropGetDefaultCounter, 1, "GetDefault count called once");
        TKUnit.assertEqual(testView.viewPropGetDefaultCounter, 1, "GetDefault count called once");
    });
};

export function test_NativeSetter_called_only_once_with_localValue_after_added_to_visual_tree() {
    const testView = new TestView("view");

    helper.buildUIAndRunTest(testView, () => {

        testView.customCssProperty = "testCssValue";
        testView.customCssAnimationProperty = "testCssAnimValue";
        testView.custom = "testViewValue";

        TKUnit.assertEqual(testView.cssPropNativeValue, "testCssValue", "Native value");
        TKUnit.assertEqual(testView.cssAnimPropNativeValue, "testCssAnimValue", "Native value");
        TKUnit.assertEqual(testView.viewPropNativeValue, "testViewValue", "Native value");

        TKUnit.assertEqual(testView.cssPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.viewPropCounter, 1, "NativeSetter count called once");

        TKUnit.assertEqual(testView.cssPropGetDefaultCounter, 1, "GetDefault count called once");
        TKUnit.assertEqual(testView.cssAnimPropGetDefaultCounter, 1, "GetDefault count called once");
        TKUnit.assertEqual(testView.viewPropGetDefaultCounter, 1, "GetDefault count called once");
    });
};

export function test_NativeSetter_called_only_once_with_cssValue() {
    const testView = new TestView("view");
    testView.id = "myID";
    const pageCSS = `
    #myID { 
        custom: testViewValue; 
        custom-css-property: testCssValue; 
        custom-css-animation-property: testCssAnimValue; 
    }`;

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.cssPropCounter, 1, "CssNativeSetter count called once");
        TKUnit.assertEqual(testView.viewPropCounter, 1, "ViewNativeSetter count called once");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 1, "CssAnimationNativeSetter count called once");

        TKUnit.assertEqual(testView.cssPropNativeValue, "testCssValue", "Native value");
        TKUnit.assertEqual(testView.cssAnimPropNativeValue, "testCssAnimValue", "Native value");
        TKUnit.assertEqual(testView.viewPropNativeValue, "testViewValue", "Native value");
    }, pageCSS);
};

export function test_NativeSetter_called_only_once_with_cssValue_and_localValue() {
    const testView = new TestView("view");
    testView.id = "myID";
    testView.customCssProperty = "testCssValueLocal";
    testView.customCssAnimationProperty = "testCssAnimationValueLocal";
    testView.custom = "testViewValueLocal";
    const pageCSS = `
    #myID { 
        custom-css-property: testCssValueCSS; 
        custom: testViewValueCSS; 
        custom-css-animation-property: testCssAnimValueCSS;         
    }`;

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.cssPropCounter, 1, "CssNativeSetter count called once");
        TKUnit.assertEqual(testView.viewPropCounter, 1, "ViewNativeSetter count called once");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 1, "CssAnimNativeSetter count called once");

        // CSS property set form css has CSS value source, which is weaker than local value
        TKUnit.assertEqual(testView.cssPropNativeValue, "testCssValueLocal", "Native value");
        TKUnit.assertEqual(testView.cssAnimPropNativeValue, "testCssAnimationValueLocal", "Native value");
        // View property set from CSS sets local value
        TKUnit.assertEqual(testView.viewPropNativeValue, "testViewValueCSS", "Native value");
    }, pageCSS);
};

export function test_NativeSetter_called_only_once_with_multiple_sets() {
    const testView = new TestView("view");
    testView.custom = "testViewValue1";
    testView.custom = "testViewValue2";
    testView.customCssProperty = "testCssValue1";
    testView.customCssProperty = "testCssValue2";

    testView.customCssAnimationProperty = "testCssAnimValue1";
    testView.customCssAnimationProperty = "testCssAnimValue2";

    helper.buildUIAndRunTest(testView, () => {
        TKUnit.assertEqual(testView.cssPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.cssAnimPropCounter, 1, "NativeSetter count called once");
        TKUnit.assertEqual(testView.viewPropCounter, 1, "NativeSetter count called once");

        TKUnit.assertEqual(testView.cssPropNativeValue, "testCssValue2", "Native value");
        TKUnit.assertEqual(testView.cssAnimPropNativeValue, "testCssAnimValue2", "Native value");
        TKUnit.assertEqual(testView.viewPropNativeValue, "testViewValue2", "Native value");
    });
};

export function test_NativeSetter_called_when_add_and_remove() {
    const firstView = new TestView("firstView");
    const secondView = new TestView("secondView");
    secondView.customCssProperty = "testCssValue";
    secondView.custom = "testViewValue";

    helper.buildUIAndRunTest(firstView, () => {
        TKUnit.assertEqual(secondView.cssPropCounter, 0, "1");
        TKUnit.assertEqual(secondView.viewPropCounter, 0, "2");

        // Add to visual tree
        firstView.addChild(secondView);
        TKUnit.assertEqual(secondView.cssPropCounter, 1, "3");
        TKUnit.assertEqual(secondView.viewPropCounter, 1, "4");

        // Set new value
        secondView.customCssProperty = "test2";
        secondView.custom = "test2";
        TKUnit.assertEqual(secondView.cssPropCounter, 2, "5");
        TKUnit.assertEqual(secondView.viewPropCounter, 2, "6");

        // Remove from visual tree
        firstView.removeChild(secondView);
        TKUnit.assertEqual(secondView.cssPropCounter, 2, "7");
        TKUnit.assertEqual(secondView.viewPropCounter, 2, "8");
    });
};

export function test_NativeSetter_called_when_add_and_remove_and_recycled() {
    const firstView = new TestView("firstView");
    const secondView = new TestView("secondView");
    secondView.recycleNativeView = !isIOS;
    secondView.customCssProperty = "testCssValue";
    secondView.custom = "testViewValue";

    helper.buildUIAndRunTest(firstView, () => {
        TKUnit.assertEqual(secondView.cssPropCounter, 0, "1");
        TKUnit.assertEqual(secondView.viewPropCounter, 0, "2");

        // Add to visual tree
        firstView.addChild(secondView);
        TKUnit.assertEqual(secondView.cssPropCounter, 1, "3");
        TKUnit.assertEqual(secondView.viewPropCounter, 1, "4");

        // Set new value
        secondView.customCssProperty = "test2";
        secondView.custom = "test2";
        TKUnit.assertEqual(secondView.cssPropCounter, 2, "5");
        TKUnit.assertEqual(secondView.viewPropCounter, 2, "6");

        // Remove from visual tree
        firstView.removeChild(secondView);

        // we don't recycle nativeViews on iOS yet so reset is not called.
        TKUnit.assertEqual(secondView.cssPropCounter, isIOS ? 2 : 3, "7");
        TKUnit.assertEqual(secondView.viewPropCounter, isIOS ? 2 : 3, "8");
    });
};

export function test_InheritableProperties_getValuesFromParent() {
    const testValue = 35;
    const test = function (views: Array<View>) {
        const bottomView = <TestView>views[3];

        TKUnit.assert(bottomView.inheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.inheritanceTest);
    };

    const firstView = new TestView("firstView");
    firstView.inheritanceTest = testValue;
    const secondView = new TestView("secondView");
    const thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
};

export function test_BooleanInheritableProperties_getValuesFromParent() {
    const testValue = false;
    const test = function (views: Array<View>) {
        const bottomView = <TestView>views[3];

        TKUnit.assert(bottomView.booleanInheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.booleanInheritanceTest);
    };

    const firstView = new TestView("firstView");
    firstView.booleanInheritanceTest = testValue;
    const secondView = new TestView("secondView");
    const thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
};

export function test_InheritableProperties_resetValuesOnRemoveFromVisualTree() {
    const testValue = 35;
    const test = function (views: Array<View>) {
        const bottomView = <TestView>views[3];

        TKUnit.assert(bottomView.inheritanceTest === testValue, "Expected: " + testValue + " Actual: " + bottomView.inheritanceTest);

        (<TestView>views[2]).removeChild(bottomView);

        TKUnit.assert(bottomView.inheritanceTest === inheritanceTestDefaultValue, "Expected: " + inheritanceTestDefaultValue + " Actual: " + bottomView.inheritanceTest);
    };

    const firstView = new TestView("firstView");
    firstView.inheritanceTest = testValue;
    const secondView = new TestView("secondView");
    const thirdView = new TestView("thirdView");

    firstView.addChild(secondView);
    secondView.addChild(thirdView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
};

export function test_InheritableProperties_DefaultValue() {
    const test = function (views: Array<View>) {
        const bottomView = <TestView>views[3];

        TKUnit.assert(bottomView.inheritanceTest === inheritanceTestDefaultValue, "Expected: " + inheritanceTestDefaultValue + " Actual: " + bottomView.inheritanceTest);
    };

    const firstView = new TestView("firstView");
    const secondView = new TestView("secondView");
    const thirdView = new TestView("thirdView");

    secondView.addChild(thirdView);
    firstView.addChild(secondView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
};

export function test_InheritableProperties_ChangeNotification() {
    const testValue = 35;
    const test = function (views: Array<View>) {
        const topView = <TestView>views[1];
        topView.inheritanceTest = testValue;

        const bottomView = <TestView>views[3];
        bottomView.bind({ targetProperty: "dummy", sourceProperty: "inheritanceTest" }, bottomView);

        TKUnit.assert(bottomView.dummy === testValue, "Expected: " + testValue + " Actual: " + bottomView.dummy);
    };

    const firstView = new TestView("firstView");
    const secondView = new TestView("secondView");
    const thirdView = new TestView("thirdView");

    secondView.addChild(thirdView);
    firstView.addChild(secondView);

    helper.do_PageTest(test, firstView, secondView, thirdView);
};

function property_binding_test(propName: string, firstValue: any, secondValue: any, view?: View) {
    let actualResult;
    const model = new observable.Observable();
    model.set(propName, firstValue);

    const options: bindable.BindingOptions = {
        sourceProperty: propName,
        targetProperty: propName
    };

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

function property_binding_style_test(propName: string, firstValue: any, secondValue: any, view?: View) {
    let actualResult;
    const model = new observable.Observable();
    model.set(propName, firstValue);

    const options: bindable.BindingOptions = {
        sourceProperty: propName,
        targetProperty: "style." + propName
    };

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

export function test_binding_width() {
    property_binding_test("width", 42, 43);
};

export function test_binding_height() {
    property_binding_test("height", 42, 43);
};

export function test_binding_minWidth() {
    property_binding_test("minWidth", 42, 43);
};

export function test_binding_minHeight() {
    property_binding_test("minHeight", 42, 43);
};

export function test_binding_horizontalAlignment() {
    property_binding_test("horizontalAlignment", "left", "right");
};

export function test_binding_verticalAlignment() {
    property_binding_test("verticalAlignment", "top", "bottom");
};

export function test_binding_marginLeft() {
    property_binding_test("marginLeft", 42, 43);
};

export function test_binding_marginTop() {
    property_binding_test("marginTop", 42, 43);
};

export function test_binding_marginRight() {
    property_binding_test("marginRight", 42, 43);
};

export function test_binding_marginBottom() {
    property_binding_test("marginBottom", 42, 43);
};

export function test_binding_visibility() {
    property_binding_test("visibility", "collapse", "visible");
};

export function test_binding_isEnabled() {
    property_binding_test("isEnabled", false, true);
};

export function test_binding_isUserInteractionEnabled() {
    property_binding_test("isUserInteractionEnabled", false, true);
};

export function test_binding_id() {
    property_binding_test("id", "id1", "id2");
};

export function test_binding_cssClass() {
    property_binding_test("cssClass", "class1", "class2");
};

export function test_binding_className() {
    property_binding_test("className", "class1", "class2");
};

export function test_binding_style_color() {
    property_binding_style_test("color", new Color("#FF0000"), new Color("#00FF00"));
};

export function test_binding_style_backgroundColor() {
    property_binding_style_test("backgroundColor", new Color("#FF0000"), new Color("#00FF00"));
};

export function test_binding_style_fontSize() {
    property_binding_style_test("fontSize", 5, 10);
};

export function test_binding_style_textAlignment() {
    property_binding_style_test("textAlignment", "right", "center");
};

export function test_binding_style_width() {
    property_binding_style_test("width", 42, 43);
};

export function test_binding_style_height() {
    property_binding_style_test("height", 42, 43);
};

export function test_binding_style_minWidth() {
    property_binding_style_test("minWidth", 42, 43);
};

export function test_binding_style_minHeight() {
    property_binding_style_test("minHeight", 42, 43);
};

export function test_binding_style_margin() {
    property_binding_style_test("margin", "1 2 3 4", "2 3 2 3");
};

export function test_binding_style_marginLeft() {
    property_binding_style_test("marginLeft", 42, 43);
};

export function test_binding_style_marginTop() {
    property_binding_style_test("marginTop", 42, 43);
};

export function test_binding_style_marginRight() {
    property_binding_style_test("marginRight", 42, 43);
};

export function test_binding_style_marginBottom() {
    property_binding_style_test("marginBottom", 42, 43);
};

export function test_binding_style_padding() {
    property_binding_style_test("padding", "1 2 3 4", "2 3 2 3");
};

export function test_binding_style_paddingLeft() {
    property_binding_style_test("paddingLeft", 42, 43);
};

export function test_binding_style_paddingTop() {
    property_binding_style_test("paddingTop", 42, 43);
};

export function test_binding_style_paddingRight() {
    property_binding_style_test("paddingRight", 42, 43);
};

export function test_binding_style_paddingBottom() {
    property_binding_style_test("paddingBottom", 42, 43);
};

export function test_binding_style_horizontalAlignment() {
    property_binding_style_test("horizontalAlignment", "left", "right");
};

export function test_binding_style_verticalAlignment() {
    property_binding_style_test("verticalAlignment", "top", "bottom");
};

export function test_binding_style_visibility() {
    property_binding_style_test("visibility", "collapse", "visible");
};

export function test_binding_style_opacity() {
    property_binding_style_test("opacity", 0.5, 0.6);
};

function _createLabelWithBorder(): View {
    const lbl = new Label();
    lbl.borderRadius = 10;
    lbl.borderWidth = 2;
    lbl.borderColor = new Color("#FF0000");
    lbl.backgroundColor = new Color("#FFFF00");

    return lbl;
}

export function testIsVisible() {
    const lbl = new Label();

    helper.buildUIAndRunTest(lbl, function (views: Array<View>) {
        TKUnit.assertEqual(lbl.visibility, "visible");
        TKUnit.assertEqual(lbl.isCollapsed, false);

        lbl.visibility = "collapse";
        TKUnit.assertEqual(lbl.visibility, "collapse");
        TKUnit.assertEqual(lbl.isCollapsed, true);
    });
};

export function testSetInlineStyle() {
    const lbl = new Label();

    const expectedColor = "#FF0000";
    const expectedBackgroundColor = "#FF0000";

    lbl.setInlineStyle(`color: ${expectedColor};background-color: ${expectedBackgroundColor};`);

    helper.buildUIAndRunTest(lbl, function (views: Array<View>) {
        TKUnit.assertEqual(lbl.color.hex, expectedColor);
        TKUnit.assertEqual(lbl.backgroundColor.hex, expectedBackgroundColor);
    });
};

export function testBorderWidth() {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
        const lbl = views[0];
        helper.waitUntilLayoutReady(lbl);
        const expectedValue = Math.round(<number>lbl.borderWidth * utils.layout.getDisplayDensity());
        const actualValue = definition.getUniformNativeBorderWidth(lbl);
        TKUnit.assertAreClose(actualValue, expectedValue, 0.01, "borderWidth");
    });
};

export function testCornerRadius() {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
        const lbl = views[0];
        helper.waitUntilLayoutReady(lbl);
        const expectedValue = Math.round(<number>lbl.borderRadius * utils.layout.getDisplayDensity());
        const actualValue = definition.getUniformNativeCornerRadius(lbl);
        TKUnit.assertAreClose(actualValue, expectedValue, 0.01, "borderRadius");
    });
};

export function testBorderColor() {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
        const lbl = views[0];
        helper.waitUntilLayoutReady(lbl);
        TKUnit.assertEqual(definition.checkUniformNativeBorderColor(lbl), true, "BorderColor not applied correctly!");
    });
};

export function testBackgroundColor() {
    helper.buildUIAndRunTest(_createLabelWithBorder(), function (views: Array<View>) {
        const lbl = views[0];
        helper.waitUntilLayoutReady(lbl);
        TKUnit.assertEqual(definition.checkNativeBackgroundColor(lbl), true, "BackgroundColor not applied correctly!");
    });
};

export function testBackgroundImage() {
    const lbl = _createLabelWithBorder();
    lbl.className = "myClass";
    helper.buildUIAndRunTest(lbl, function (views: Array<View>) {
        const page = <Page>views[1];
        page.css = ".myClass { background-image: url('~/logo.png') }";
        TKUnit.assertEqual(definition.checkNativeBackgroundImage(lbl), true, "Style background-image not loaded correctly.");
    });
};

export function test_automation_text_default_value() {
    let view = new Button();
    TKUnit.assertTrue(view.automationText === undefined, "AutomationText default value should be UNDEFINED.");
}

export function test_getLocationInWindow_IsUndefinedWhenNotInTheVisualTree() {
    const label = new Label();
    TKUnit.assertNull(label.getLocationInWindow());
};

export function test_getLocationOnScreen_IsUndefinedWhenNotInTheVisualTree() {
    const label = new Label();
    TKUnit.assertNull(label.getLocationOnScreen());
};

const delta = 1;
export function test_getLocationRelativeToOtherView() {
    const a1 = new AbsoluteLayout();
    a1.width = 200;
    a1.height = 200;
    a1.backgroundColor = new Color("red");

    const a2 = new AbsoluteLayout();
    a2.width = 100;
    a2.height = 100;
    AbsoluteLayout.setLeft(a2, 10);
    AbsoluteLayout.setTop(a2, 10);
    a2.backgroundColor = new Color("green");

    const label = new Label();
    label.text = "label";
    label.id = "label";
    label.width = 70;
    label.height = 30;
    AbsoluteLayout.setLeft(label, 10);
    AbsoluteLayout.setTop(label, 10);
    a2.backgroundColor = new Color("yellow");

    a2.addChild(label);
    a1.addChild(a2);

    helper.buildUIAndRunTest(a1, function (views: Array<View>) {
        helper.waitUntilLayoutReady(a1);

        const labelInA2 = label.getLocationRelativeTo(a2);
        const labelInA1 = label.getLocationRelativeTo(a1);
        const a2InA1 = a2.getLocationRelativeTo(a1);

        TKUnit.assertAreClose(labelInA2.x, 10, delta, "labelInA2.x");
        TKUnit.assertAreClose(labelInA2.y, 10, delta, "labelInA2.y");

        TKUnit.assertAreClose(labelInA1.x, 20, delta, "labelInA1.x");
        TKUnit.assertAreClose(labelInA1.y, 20, delta, "labelInA1.y");

        TKUnit.assertAreClose(a2InA1.x, 10, delta, "a2InA1.x");
        TKUnit.assertAreClose(a2InA1.y, 10, delta, "a2InA1.y");
    });
};

export function test_getActualSize() {
    const label = new Label();
    label.width = 100;
    label.height = 200;
    helper.buildUIAndRunTest(label, function (views: Array<View>) {
        helper.waitUntilLayoutReady(label);
        const actualSize = label.getActualSize();
        TKUnit.assertAreClose(actualSize.width, 100, delta, "actualSize.width");
        TKUnit.assertAreClose(actualSize.height, 200, delta, "actualSize.height");
    });
};

export function test_background_image_doesnt_throw() {
    var btn = new Button();
    btn.style.backgroundImage = 'https://www.bodybuilding.com/images/2016/june/8-benefits-to-working-out-in-the-morning-header-v2-830x467.jpg';
    helper.buildUIAndRunTest(btn, function (views: Array<View>) {
        helper.waitUntilLayoutReady(btn);
    });
}