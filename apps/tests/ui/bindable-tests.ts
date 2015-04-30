import observable = require("data/observable");
import bindable = require("ui/core/bindable");
import dependencyObservableModule = require("ui/core/dependency-observable");
import TKUnit = require("../TKUnit");
import types = require("utils/types");
import helper = require("../ui/helper");
import viewModule = require("ui/core/view");
import buttonModule = require("ui/button");
import utils = require("utils/utils");
import pageModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import bindingBuilder = require("ui/builder/binding-builder");
import labelModule = require("ui/label");

// <snippet module="ui/core/bindable" title="bindable">
// For information and examples how to use bindings please refer to special [**Data binding**](../../../../bindings.md) topic. 
// </snippet>

// <snippet module="ui/core/weak-event-listener" title="weak-event-listener">
// For information and example how to use weak event listeners please refer to special [**Events**](../../../../events.md) topic which has a dedicated part about weak event listeners. 
// </snippet>

export var test_Bindable_Members = function () {
    var obj = new bindable.Bindable();
    TKUnit.assert(types.isDefined(obj.bind), "Bindable.bind not defined");
    TKUnit.assert(types.isDefined(obj.unbind), "Bindable.unbind not defined");
    TKUnit.assert(types.isDefined(obj._updateTwoWayBinding), "Bindable.updateTwoWayBinding not defined");
}

export var test_Bindable_Bind_ToTarget_OneWay = function () {
    var model = new observable.Observable();
    model.set("name", "John");

    var options: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test"
    }

    var obj = new bindable.Bindable();
    obj.bind(options, model);

    TKUnit.assert(obj.get("test") === "John", "Expected result after binding is [test value] === 'John'");

    model.set("name", "Changed");

    TKUnit.assert(obj.get("test") === "Changed", "Expected result after binding is [test value] === 'Changed'");
}

export var test_Bindable_Bind_ToTarget_TwoWay = function () {
    var model = new observable.Observable();
    model.set("name", "John");

    var options: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test",
        twoWay: true
    }

    var obj = new bindable.Bindable();
    obj.bind(options, model);
    obj.set("test", "Changed");

    TKUnit.assert(model.get("name") === "Changed", "Two-way binding not updating the source when target is changed.");

    model.set("name", "John");

    TKUnit.assert(obj.get("test") === "John", "Two-way binding not updating the target when source is changed.");
}

export var test_Bindable_Bind_ToBindingContext_OneWay = function () {
    var model = new observable.Observable();
    model.set("name", "John");

    var options: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test"
    }

    var obj = new bindable.Bindable();
    obj.bind(options);
    obj.set("test", "local");
    obj.bindingContext = model;

    TKUnit.assert(obj.get("test") === "John", "Binding to a context does not update the target property.");
}

export var test_Bindable_Bind_ToBindingContext_TwoWay = function () {
    var model = new observable.Observable();
    model.set("name", "John");

    var options: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test",
        twoWay: true
    }

    var obj = new bindable.Bindable();
    obj.bind(options);

    obj.set("test", "local");
    obj.bindingContext = model;

    TKUnit.assert(obj.get("test") === "John", "Binding to a context does not update the target property.");

    obj.set("test", "local");

    TKUnit.assert(model.get("name") === "local", "Two-way binding to a context does not update the source property.");
}

export var test_Bindable_Unbind = function () {
    var model = new observable.Observable();

    var options: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test"
    }

    var obj = new bindable.Bindable();
    obj.bind(options, model);

    model.set("name", "John");

    TKUnit.assert(obj.get("test") === "John", "Binding does not updates target property.");

    obj.unbind("test");
    model.set("name", "Chaged");

    TKUnit.assert(obj.get("test") === "John", "Unbind does not remove binding.");
}

export var test_bind_NoSource_WillUse_BindingContext = function () {
    var model = new observable.Observable();
    model.set("testProperty", "testValue");

    var test = function (views: Array<viewModule.View>) {
        views[0].bindingContext = model;
        views[1].bind({
            sourceProperty: "testProperty",
            targetProperty: "text"
        });

        var button = <buttonModule.Button>views[1];
        TKUnit.assert(button.text === model.get("testProperty"), "Bind method not working when no source is passed but a valid bindingContext is present.");
    }

    helper.do_PageTest_WithButton(test);
}

export var test_bindingContext_ValueSource_IsInherited = function () {
    var test = function (views: Array<viewModule.View>) {
        var context = {};
        views[0].bindingContext = context;
        TKUnit.assert(views[1].bindingContext === context, "bindingContext not inherited.");
        TKUnit.assert(views[1]._getValueSource(bindable.Bindable.bindingContextProperty) === dependencyObservableModule.ValueSource.Inherited, "bindingContext should be propagated as Inherited.");
    }

    helper.do_PageTest_WithButton(test);
}

export var test_bindingContext_Change_IsReflected_Properly = function () {
    var model = new observable.Observable();
    model.set("testProperty", "testValue");

    var test = function (views: Array<viewModule.View>) {
        views[1].bind({
            sourceProperty: "testProperty",
            targetProperty: "text"
        });

        var button = <buttonModule.Button>views[1];
        TKUnit.assert(button.text === "", "Bind should do nothing when no source and binding context are available.");

        views[0].bindingContext = model;
        TKUnit.assert(button.text === "testValue", "Binding not updated properly when a valid bindingContext is provided.");

        views[0].bindingContext = undefined;
        model.set("testProperty", "updatedValue");
        TKUnit.assert(button.text === "testValue", "Binding not properly detached when bindingContext is cleared.");
    }

    helper.do_PageTest_WithButton(test);
}

export var test_WhenBindingIsSetToAnElement_AndElementIsRemoved_ShouldBeCollectedByGC = function (done) {
    var testFinished = false;
    var pageFactory = function () {
        var page = new pageModule.Page();
        var stack = new stackLayoutModule.StackLayout();

        var expectedValue = "testValue";
        var sourcePropertyName = "testProperty";
        var targetPropertyName = "text";

        page.on(viewModule.View.loadedEvent, () => {
            var model = new observable.Observable();
            model.set(sourcePropertyName, expectedValue);

            function createButton(bindContext) {
                var button = new buttonModule.Button();
                button.bind({
                    sourceProperty: sourcePropertyName,
                    targetProperty: targetPropertyName
                }, bindContext);
                return new WeakRef(button);
            }

            var weakRef = createButton(model);

            try {
                stack.addChild(weakRef.get());
                TKUnit.assert(weakRef.get().text === expectedValue, "Binding is not working properly!");
                stack.removeChild(weakRef.get());
                TKUnit.waitUntilReady(() => { return !weakRef.get().isLoaded });
                utils.GC();
                TKUnit.assert(!weakRef.get(), "UIElement is still alive!");
                testFinished = true;
            }
            catch (e) {
                done(e);
            }
        });

        page.content = stack;
        return page;
    };

    helper.navigate(pageFactory);
    
    TKUnit.waitUntilReady(() => { return testFinished });
    helper.goBack();
    done(null);
}

export var test_OneBindableToBindMoreThanOneProperty_ToSameSource = function () {
    var model = new observable.Observable();

    var firstPropertyOptions: bindable.BindingOptions = {
        sourceProperty: "name",
        targetProperty: "test"
    }

    var secondPropertyOptions: bindable.BindingOptions = {
        sourceProperty: "sourceProperty",
        targetProperty: "targetProperty"
    }

    var obj = new bindable.Bindable();
    obj.bind(firstPropertyOptions, model);
    obj.bind(secondPropertyOptions, model);

    model.set("name", "John");
    model.set("sourceProperty", "testValue");

    TKUnit.assert(obj.get("test") === "John", "Binding does not updates target property.");
    TKUnit.assert(obj.get("targetProperty") === "testValue", "Binding does not updates target property1.");
}

export var test_MoreThanOneBindables_BindToASameSourceAndProperty = function () {
    var model = new observable.Observable();

    var bindingOptions: bindable.BindingOptions = {
        sourceProperty: "sourceProperty",
        targetProperty: "targetProperty"
    };

    var obj1 = new bindable.Bindable();
    obj1.bind(bindingOptions, model);

    var obj2 = new bindable.Bindable();
    obj2.bind(bindingOptions, model);

    model.set("sourceProperty", "testValue");

    TKUnit.assert(obj1.get("targetProperty") === "testValue", "Binding does not updates target property for first object.");
    TKUnit.assert(obj2.get("targetProperty") === "testValue", "Binding does not updates target property for second object.");
}

class TestClass extends bindable.Bindable {
    private _value: string;
    get value(): string {
        return this._value
    }
    set value(v: string) {
        if (v === "invalid") {
            throw new Error("Trying to set invalid value.");
        }
        this._value = v;
    }
};

export function test_WhenBindingSetsInvalidValue_NoExptionIsThrown() {
    var model = new observable.Observable();

    var options: bindable.BindingOptions = {
        sourceProperty: "value",
        targetProperty: "value"
    }

    var obj = new TestClass();
    obj.bind(options, model);

    model.set("value", "valid");
    TKUnit.assert(obj.get("value") === "valid");

    // Try set invalid value - no exception should be thrown and the value should remain the same.
    model.set("value", "invalid");
    TKUnit.assert(obj.get("value") === "valid");
}

export var test_binding_bindingContext_setRootContextFirst = function () {
    var test = function (views: Array<viewModule.View>) {
        var rootContext = new observable.Observable();
        rootContext.set("selectedItem", "item 1");
        views[0].bindingContext = rootContext;

        var stack = <stackLayoutModule.StackLayout>views[1];
        var options: bindable.BindingOptions = {
            sourceProperty: "selectedItem",
            targetProperty: "bindingContext"
        }
        stack.bind(options);

        TKUnit.assertEqual(stack.bindingContext, "item 1", "Initial binding value");
        TKUnit.assertEqual(views[2].bindingContext, "item 1", "Initial binding value");

        rootContext.set("selectedItem", "item 2");

        TKUnit.assertEqual(stack.bindingContext, "item 2", "Changed binding value");
        TKUnit.assertEqual(views[2].bindingContext, "item 2", "Changed binding value");
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_binding_bindingContext_setBindingFirst = function () {
    var test = function (views: Array<viewModule.View>) {
        var rootContext = new observable.Observable();
        rootContext.set("selectedItem", "item 1");

        var stack = <stackLayoutModule.StackLayout>views[1];
        var options: bindable.BindingOptions = {
            twoWay: true,
            sourceProperty: "selectedItem",
            targetProperty: "bindingContext"
        }
        stack.bind(options);

        views[0].bindingContext = rootContext;

        TKUnit.assertEqual(stack.bindingContext, "item 1", "Initial binding value");
        TKUnit.assertEqual(views[2].bindingContext, "item 1", "Initial binding value");

        rootContext.set("selectedItem", "item 2");

        TKUnit.assertEqual(stack.bindingContext, "item 2", "Changed binding value");
        TKUnit.assertEqual(views[2].bindingContext, "item 2", "Changed binding value");
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_Bindable_BindingContext_Number_DoesNotThrow = function () {
    var obj = new bindable.Bindable();
    obj.bindingContext = 42;
}

export var test_Bindable_BindingContext_Boolean_DoesNotThrow = function () {
    var obj = new bindable.Bindable();
    obj.bindingContext = true;
}

export var test_Bindable_BindingContext_String_DoesNotThrow = function () {
    var options: bindable.BindingOptions = {
        sourceProperty: "length",
        targetProperty: "test"
    }

    var obj = new bindable.Bindable();
    obj.bind(options);
    obj.set("test", "local");
    obj.bindingContext = "string";

    TKUnit.assert(obj.get("test") === 6, "Expected: 6; Actual: " + obj.get("test"));
}

export var test_getBindableOptionsFromStringFullFormat = function () {
    var bindingExpression = "bindProperty, bindProperty * 2, false";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual:" + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === false, "Expected: false, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringShortFormatExpression = function () {
    var bindingExpression = "bindProperty * 2";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual: " + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringShortFormatProperty = function () {
    var bindingExpression = "bindProperty";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === undefined, "Expected: null, Actual: " + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringTwoParamsFormat = function () {
    var bindingExpression = "bindProperty, bindProperty * 2";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual:" + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringFullNamedFormat = function () {
    var bindingExpression = "bindProperty, expression = bindProperty * 2, twoWay = false";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual:" + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === false, "Expected: false, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringShortNamedFormatExpression = function () {
    var bindingExpression = "sourceProperty = bindProperty, expression = bindProperty * 2";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual: " + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringShortNamedFormatProperty = function () {
    var bindingExpression = "sourceProperty = bindProperty";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);
    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === undefined, "Expected: null, Actual: " + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_getBindableOptionsFromStringTwoParamsNamedFormat = function () {
    var bindingExpression = "bindProperty, expression = bindProperty * 2";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assert(bindOptions.sourceProperty === "bindProperty", "Expected: bindProperty, Actual: " + bindOptions.sourceProperty);
    TKUnit.assert(bindOptions.targetProperty === "targetBindProperty", "Expected: targetBindProperty, Actual: " + bindOptions.targetProperty);
    TKUnit.assert(bindOptions.expression === "bindProperty * 2", "Expected: bindProperty * 2, Actual:" + bindOptions.expression);
    TKUnit.assert(bindOptions.twoWay === true, "Expected: true, Actual: " + bindOptions.twoWay);
}

export var test_TwoElementsBindingToSameBindingContext = function () {
    var testFunc = function (page: pageModule.Page) {
        var upperStackLabel = <labelModule.Label>(page.getViewById("upperStackLabel"));
        var label1 = <labelModule.Label>(page.getViewById("label1"));
        var label2 = <labelModule.Label>(page.getViewById("label2"));

        TKUnit.assertEqual(upperStackLabel.text, label1.text);
        TKUnit.assertEqual(upperStackLabel.text, label2.text);
    }

    helper.navigateToModuleAndRunTest("./tests/ui/bindingContext_testPage", testFunc);
}