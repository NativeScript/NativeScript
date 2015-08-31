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
import textFieldModule = require("ui/text-field");
import fs = require("file-system");
import appModule = require("application");
import repeaterModule = require("ui/repeater");
import gestureModule = require("ui/gestures");
import layoutBaseModule = require("ui/layouts/layout-base");

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

export var test_getBindingOptionsFromStringWithFunctionWitnMoreParams = function () {
    var bindingExpression = "bindProperty, converter(bindProperty, param1)";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assertEqual(bindOptions.sourceProperty, "bindProperty");
    TKUnit.assertEqual(bindOptions.targetProperty, "targetBindProperty");
    TKUnit.assertEqual(bindOptions.expression, "converter(bindProperty, param1)");
    TKUnit.assertEqual(bindOptions.twoWay, true);
}

export var test_getBindingOptionsFromStringWithFunctionArrayParams = function () {
    var bindingExpression = "bindProperty, converter(bindProperty, [param1, param2])";
    var bindOptions = bindingBuilder.getBindingOptions("targetBindProperty", bindingExpression);

    TKUnit.assertEqual(bindOptions.sourceProperty, "bindProperty");
    TKUnit.assertEqual(bindOptions.targetProperty, "targetBindProperty");
    TKUnit.assertEqual(bindOptions.expression, "converter(bindProperty, [param1, param2])");
    TKUnit.assertEqual(bindOptions.twoWay, true);
}

export var test_bindingToNestedPropertyWithValueSyntax = function () {
    var bindingSource = new observable.Observable();
    bindingSource.set("testProperty", "testValue");

    var testElement = new bindable.Bindable();
    testElement.bind({
        sourceProperty: "$value.testProperty",
        targetProperty: "targetPropertyName"
    }, bindingSource);

    TKUnit.assertEqual(testElement.get("targetPropertyName"), "testValue");
}

export var test_TwoElementsBindingToSameBindingContext = function () {
    var testFunc = function (page: pageModule.Page) {
        var upperStackLabel = <labelModule.Label>(page.getViewById("upperStackLabel"));
        var label1 = <labelModule.Label>(page.getViewById("label1"));
        var label2 = <labelModule.Label>(page.getViewById("label2"));

        TKUnit.assertEqual(upperStackLabel.text, label1.text);
        TKUnit.assertEqual(upperStackLabel.text, label2.text);
    }
    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(("." + moduleName + "/bindingContext_testPage"), null, testFunc);
}

export var test_BindingContext_NavigatingForwardAndBack = function () {
    var expectedValue = "Tralala";
    var testFunc = function (page: pageModule.Page) {
        var innerTestFunc = function (childPage: pageModule.Page) {
            var testTextField: textFieldModule.TextField = <textFieldModule.TextField>(childPage.getViewById("testTextField"));
            testTextField.text = expectedValue;
        };
        var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
        helper.navigateToModuleAndRunTest(("." + moduleName + "/bindingContext_testPage2"), page.bindingContext, innerTestFunc);
        var testLabel: labelModule.Label = <labelModule.Label>(page.getViewById("testLabel"));
        TKUnit.assertEqual(testLabel.text, expectedValue);
    }

    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(("." + moduleName + "/bindingContext_testPage1"), null, testFunc);
}

export var test_RepeaterItemsGestureBindings = function () {
    var testFunc = function (page: pageModule.Page) {
        var repeater = <repeaterModule.Repeater>(page.getViewById("repeater"));
        var hasObservers = false;
        var eachChildCallback = function (childItem: viewModule.View) {
            if (childItem instanceof labelModule.Label) {
                var gestureObservers = childItem.getGestureObservers(gestureModule.GestureTypes.tap);
                hasObservers = gestureObservers ? gestureObservers.length > 0 : false;
            }
            else if (childItem instanceof layoutBaseModule.LayoutBase) {
                childItem._eachChildView(eachChildCallback);
            }
            return true;
        }

        repeater._eachChildView(eachChildCallback);

        TKUnit.assertEqual(hasObservers, true, "Every item should have tap observer!");
    }

    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(("." + moduleName + "/repeaterItems-bindingToGestures"), null, testFunc);
}

export var test_BindingToSource_FailsAfterBindingContextChange = function () {
    var createLabel = function () {
        var label = new labelModule.Label();
        return label;
    }
    var labelViewModel = new observable.Observable();
    var expectedValue = "testValue";
    labelViewModel.set("testProperty", expectedValue);

    var testFunc = function (views: Array<viewModule.View>) {
        var testLabel = <labelModule.Label>(views[0]);
        testLabel.bind({ sourceProperty: "testProperty", targetProperty: "text" }, labelViewModel);

        var page = <pageModule.Page>(views[1]);
        page.bindingContext = new observable.Observable;

        TKUnit.assertEqual(testLabel.text, expectedValue);
    }

    helper.buildUIAndRunTest(createLabel(), testFunc);
}

export function test_BindingToDictionaryAtAppLevel() {
    var createLabel = function () {
        var label = new labelModule.Label();
        return label;
    }
    var pageViewModel = new observable.Observable();
    var testPropertyName = "testValue";
    var expectedValue = "expectedValue";
    pageViewModel.set("testProperty", testPropertyName);
    var dict = {};
    dict[testPropertyName] = expectedValue;
    appModule.resources["dict"] = dict;

    var testFunc = function (views: Array<viewModule.View>) {
        var testLabel = <labelModule.Label>(views[0]);
        testLabel.bind({ sourceProperty: "testProperty", targetProperty: "text", expression: "dict[testProperty]" });

        var page = <pageModule.Page>(views[1]);
        page.bindingContext = pageViewModel;

        TKUnit.assertEqual(testLabel.text, expectedValue);
    }

    helper.buildUIAndRunTest(createLabel(), testFunc);
}

export function test_UpdatingNestedPropertyViaBinding() {
    var expectedValue1 = "Alabala";
    var expectedValue2 = "Tralala";
    var viewModel = new observable.Observable();
    var parentViewModel = new observable.Observable();
    viewModel.set("parentView", parentViewModel);
    parentViewModel.set("name", expectedValue1);

    var testElement: bindable.Bindable = new bindable.Bindable();

    testElement.bind({
        sourceProperty: "parentView.name",
        targetProperty: "targetName",
        twoWay: true
    }, viewModel);

    var testElement2: bindable.Bindable = new bindable.Bindable();

    testElement2.bind({
        sourceProperty: "parentView.name",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(testElement.get("targetName"), expectedValue1);

    testElement.set("targetName", expectedValue2);

    TKUnit.assertEqual(parentViewModel.get("name"), expectedValue2);
    TKUnit.assertEqual(testElement2.get("targetProperty"), expectedValue2);
}

class Person extends observable.Observable {
    private _firstName: string;
    private _lastName: string;

    public get FirstName(): string {
        return this._firstName;
    }

    public set FirstName(value: string) {
        if (this._firstName !== value) {
            this._firstName = value;
            this.notifyPropertyChange("FirstName", value);
        }
    }

    public get LastName(): string {
        return this._lastName;
    }

    public set LastName(value: string) {
        if (this._lastName !== value) {
            this._lastName = value;
            this.notifyPropertyChange("LastName", value);
        }
    }
}

class Activity extends observable.Observable {
    private _text: string;
    private _owner: Person;

    public get Text(): string {
        return this._text;
    }

    public set Text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this.notifyPropertyChange("Text", value);
        }
    }

    public get Owner(): Person {
        return this._owner;
    }

    public set Owner(value: Person) {
        if (this._owner !== value) {
            this._owner = value;
            this.notifyPropertyChange("Owner", value);
        }
    }

    constructor(text: string, firstName: string, lastName: string) {
        super();
        this._text = text;
        var owner = new Person();
        owner.FirstName = firstName;
        owner.LastName = lastName;
        this.Owner = owner;
    }
}

export function test_NestedPropertiesBinding() {
    var expectedValue = "Default Text";
    var viewModel = new observable.Observable();
    viewModel.set("activity", new Activity(expectedValue, "Default First Name", "Default Last Name"));

    var target1 = new bindable.Bindable();
    target1.bind({
        sourceProperty: "activity.Text",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(target1.get("targetProperty"), expectedValue);

    var newExpectedValue = "Alabala";
    var act = new Activity(newExpectedValue, "Default First Name", "Default Last Name");

    viewModel.set("activity", act);

    TKUnit.assertEqual(target1.get("targetProperty"), newExpectedValue);
}

export function test_NestedPropertiesBindingTwoTargets() {
    var expectedText = "Default Text";
    var expectedFirstName = "Default First Name";
    var expectedLastName = "Default Last Name";
    var viewModel = new observable.Observable();
    viewModel.set("activity", new Activity(expectedText, expectedFirstName, expectedLastName));

    var target1 = new bindable.Bindable();
    target1.bind({
        sourceProperty: "activity.Text",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    var target2 = new bindable.Bindable();
    target2.bind({
        sourceProperty: "activity.Owner.FirstName",
        targetProperty: "targetProp",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(target1.get("targetProperty"), expectedText);
    TKUnit.assertEqual(target2.get("targetProp"), expectedFirstName);

    var newExpectedText = "Alabala";
    var newExpectedFirstName = "First Tralala";
    var newExpectedLastName = "Last Tralala";
    var act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

    viewModel.set("activity", act);

    TKUnit.assertEqual(target1.get("targetProperty"), newExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), newExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndSecondChange() {
    var expectedText = "Default Text";
    var expectedFirstName = "Default First Name";
    var expectedLastName = "Default Last Name";
    var viewModel = new observable.Observable();
    viewModel.set("activity", new Activity(expectedText, expectedFirstName, expectedLastName));

    var target1 = new bindable.Bindable();
    target1.bind({
        sourceProperty: "activity.Text",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    var target2 = new bindable.Bindable();
    target2.bind({
        sourceProperty: "activity.Owner.FirstName",
        targetProperty: "targetProp",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(target1.get("targetProperty"), expectedText);
    TKUnit.assertEqual(target2.get("targetProp"), expectedFirstName);

    var newExpectedText = "Alabala";
    var newExpectedFirstName = "First Tralala";
    var newExpectedLastName = "Last Tralala";
    var act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

    viewModel.set("activity", act);

    TKUnit.assertEqual(target1.get("targetProperty"), newExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), newExpectedFirstName);

    var secondExpectedText = "Second expected text";
    var secondExpectedFirstName = "Second expected first name";
    var secondExpectedLastName = "Second expected last name";
    var act1 = new Activity(secondExpectedText, secondExpectedFirstName, secondExpectedLastName);

    viewModel.set("activity", act1);

    TKUnit.assertEqual(target1.get("targetProperty"), secondExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), secondExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndRegularChange() {
    var expectedText = "Default Text";
    var expectedFirstName = "Default First Name";
    var expectedLastName = "Default Last Name";
    var viewModel = new observable.Observable();
    viewModel.set("activity", new Activity(expectedText, expectedFirstName, expectedLastName));

    var target1 = new bindable.Bindable();
    target1.bind({
        sourceProperty: "activity.Text",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    var target2 = new bindable.Bindable();
    target2.bind({
        sourceProperty: "activity.Owner.FirstName",
        targetProperty: "targetProp",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(target1.get("targetProperty"), expectedText);
    TKUnit.assertEqual(target2.get("targetProp"), expectedFirstName);

    var newExpectedText = "Alabala";
    var newExpectedFirstName = "First Tralala";
    var newExpectedLastName = "Last Tralala";
    var act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

    viewModel.set("activity", act);

    TKUnit.assertEqual(target1.get("targetProperty"), newExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), newExpectedFirstName);

    var newAct = viewModel.get("activity");
    var secondExpectedText = "Second expected text";
    newAct.Text = secondExpectedText;
    var secondExpectedFirstName = "Second expected First Name";
    newAct.Owner.FirstName = secondExpectedFirstName;

    TKUnit.assertEqual(target1.get("targetProperty"), secondExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), secondExpectedFirstName);
}

export function test_NestedPropertiesBindingTwoTargetsAndReplacingSomeNestedObject() {
    var expectedText = "Default Text";
    var expectedFirstName = "Default First Name";
    var expectedLastName = "Default Last Name";
    var viewModel = new observable.Observable();
    viewModel.set("activity", new Activity(expectedText, expectedFirstName, expectedLastName));

    var target1 = new bindable.Bindable();
    target1.bind({
        sourceProperty: "activity.Text",
        targetProperty: "targetProperty",
        twoWay: true
    }, viewModel);

    var target2 = new bindable.Bindable();
    target2.bind({
        sourceProperty: "activity.Owner.FirstName",
        targetProperty: "targetProp",
        twoWay: true
    }, viewModel);

    TKUnit.assertEqual(target1.get("targetProperty"), expectedText);
    TKUnit.assertEqual(target2.get("targetProp"), expectedFirstName);

    var newExpectedText = "Alabala";
    var newExpectedFirstName = "First Tralala";
    var newExpectedLastName = "Last Tralala";
    var act = new Activity(newExpectedText, newExpectedFirstName, newExpectedLastName);

    viewModel.set("activity", act);

    TKUnit.assertEqual(target1.get("targetProperty"), newExpectedText);
    TKUnit.assertEqual(target2.get("targetProp"), newExpectedFirstName);

    var secondExpectedFirstName = "Second expected first name";
    var newPerson = new Person();
    newPerson.FirstName = secondExpectedFirstName;
    newPerson.LastName = "Last Name";

    var act1 = viewModel.get("activity");
    (<Activity>act1).Owner = newPerson;

    TKUnit.assertEqual(target2.get("targetProp"), secondExpectedFirstName);
}

export function test_NullSourcePropertyShouldNotCrash() {
	var expectedValue = "Expected Value";
	var target = new bindable.Bindable();
	var convFunc = function (value) {
		return value + "Converted";
	}
	var model = new observable.Observable();
	model.set("field", expectedValue);
	model.set("convFunc", convFunc);
	target.bind({
		sourceProperty: null,
		targetProperty: "targetProp",
		expression: "convFunc(field)"
	}, model);

	TKUnit.assertEqual(target.get("targetProp"), convFunc(expectedValue)); 
}