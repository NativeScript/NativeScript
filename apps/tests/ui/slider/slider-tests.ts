import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import pagesModule = require("ui/page");
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
// <snippet module="ui/slider" title="slider">
// # Slider
// Using a slider requires the Slider module.
// ``` JavaScript
import sliderModule = require("ui/slider");
// ```

// ### Binding the Progress and Slider value properties to a observable view-model property.
//```XML
// <Page loaded="pageLoaded">
//  <StackLayout orientation="vertical">
//    {%raw%}<Progress value="{{ someProperty }}" />
//    <Slider value="{{ someProperty }}" />{%endraw%}
//  </StackLayout>
// </Page>
//```
//```JS
// function pageLoaded(args) {
//   var page = args.object;
//   var obj = new observable.Observable();
//   obj.set("someProperty", 42);
//   page.bindingContext = obj;
// }
// exports.pageLoaded = pageLoaded;
//```

// </snippet>

var TEST_VALUE = 5;

export function test_set_TNS_value_updates_native_value() {
    // <snippet module="ui/slider" title="slider">
    // ### Creating a slider
    // ``` JavaScript
    var slider = new sliderModule.Slider();
    // ```
    // </snippet>

    function testAction(views: Array<viewModule.View>) {
        slider.value = TEST_VALUE;
        TKUnit.assertEqual(getNativeValue(slider), TEST_VALUE, "Native value is different from TNS value.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_native_value_updates_TNS_value() {
    var slider = new sliderModule.Slider();
    function testAction(views: Array<viewModule.View>) {
        setNativeValue(slider, TEST_VALUE);
        TKUnit.assertEqual(slider.value, TEST_VALUE, "Native value is different from TNS value.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_native_value_triggers_propertyChanged() {
    var slider = new sliderModule.Slider();
    function testAction(views: Array<viewModule.View>) {
        var valueChanged = false;
        var allChanges = 0;
        slider.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            var propertyData = <observable.PropertyChangeData>data;
            if (propertyData && propertyData.propertyName === "value" && propertyData.value === TEST_VALUE) {
                valueChanged = true;
            }
        });

        setNativeValue(slider, TEST_VALUE);

        slider.off(observable.knownEvents.propertyChange);

        TKUnit.assert(valueChanged, "Property changed for value not called.");
        TKUnit.assertEqual(allChanges, 1, "Property changed callbacks.");
    }

    helper.buildUIAndRunTest(slider, testAction);
};

export function test_default_TNS_values() {
    var slider = new sliderModule.Slider();
    TKUnit.assertEqual(slider.value, 0, "Default slider.value");
    TKUnit.assertEqual(slider.minValue, 0, "Default slider.minValue");
    TKUnit.assertEqual(slider.maxValue, 100, "Default slider.maxValue");
}

export function test_default_native_values() {
    var slider = new sliderModule.Slider();

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(getNativeValue(slider), 0, "Default native slider.value");
        TKUnit.assertEqual(getNativeMaxValue(slider), 100, "Default native slider.maxValue");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_less_than_min_should_set_value_to_min() {
    var slider = new sliderModule.Slider();

    function testAction(views: Array<viewModule.View>) {
        slider.value = -10;
        TKUnit.assertEqual(slider.value, 0, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_greater_than_max_should_set_value_to_max() {
    var slider = new sliderModule.Slider();

    function testAction(views: Array<viewModule.View>) {
        slider.maxValue = 10;
        slider.value = 20;
        TKUnit.assertEqual(slider.value, 10, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_maxValue_should_adjust_value() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        slider.maxValue = 40;

        TKUnit.assertEqual(slider.maxValue, 40, "slider.maxValue");
        TKUnit.assertEqual(slider.value, 40, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_maxValue_should_adjust_value_and_minValue() {
    var slider = new sliderModule.Slider();

    // <snippet module="ui/slider" title="slider">
    // ### Setting the slider value and bounds
    // ``` JavaScript
    slider.maxValue = 120;
    slider.value = 80;
    slider.minValue = 50;
    // ```
    // </snippet>

    function testAction(views: Array<viewModule.View>) {
        slider.maxValue = 30;

        TKUnit.assertEqual(slider.maxValue, 30, "slider.maxValue");
        TKUnit.assertEqual(slider.minValue, 30, "slider.minValue");
        TKUnit.assertEqual(slider.value, 30, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_minValue_should_adjust_value() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        slider.minValue = 60;

        TKUnit.assertEqual(slider.minValue, 60, "slider.minValue");
        TKUnit.assertEqual(slider.value, 60, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_minValue_should_adjust_value_and_maxValue() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        slider.minValue = 120;

        TKUnit.assertEqual(slider.minValue, 120, "slider.minValue");
        TKUnit.assertEqual(slider.maxValue, 120, "slider.maxValue");
        TKUnit.assertEqual(slider.value, 120, "slider.value");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_minValue_no_adjust() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        var changedProperties = {};
        var allChanges = 0;
        slider.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            changedProperties[(<observable.PropertyChangeData>data).propertyName] = true;
        });

        // Act
        slider.minValue = 10;
        slider.off(observable.knownEvents.propertyChange);

        // Assert
        TKUnit.assert(changedProperties["minValue"], "Property changed for minValue not called.");
        TKUnit.assertEqual(allChanges, 1, "Property changed callbacks.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_minValue_with_adjust() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        var changedProperties = {};
        var allChanges = 0;
        slider.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            changedProperties[(<observable.PropertyChangeData>data).propertyName] = true;
        });

        // Act
        slider.minValue = 60;
        slider.off(observable.knownEvents.propertyChange);

        // Assert
        TKUnit.assert(changedProperties["value"], "Property changed for 'value' not called.");
        TKUnit.assert(changedProperties["minValue"], "Property changed for 'minValue' not called.");
        TKUnit.assertEqual(allChanges, 2, "Property changed callbacks.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_maxValue_no_adjust() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        var changedProperties = {};
        var allChanges = 0;
        slider.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            changedProperties[(<observable.PropertyChangeData>data).propertyName] = true;
        });

        // Act
        slider.maxValue = 200;
        slider.off(observable.knownEvents.propertyChange);

        // Assert
        TKUnit.assert(changedProperties["maxValue"], "Property changed for maxValue not called.");
        TKUnit.assertEqual(allChanges, 1, "Property changed callbacks.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_property_changed_event_when_setting_maxValue_with_adjust() {
    var slider = new sliderModule.Slider();
    slider.maxValue = 100;
    slider.value = 50;
    slider.minValue = 0;

    function testAction(views: Array<viewModule.View>) {
        var changedProperties = {};
        var allChanges = 0;
        slider.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            changedProperties[(<observable.PropertyChangeData>data).propertyName] = true;
        });

        // Act
        slider.maxValue = 40;
        slider.off(observable.knownEvents.propertyChange);

        // Assert
        TKUnit.assert(changedProperties["value"], "Property changed for 'value' not called.");
        TKUnit.assert(changedProperties["maxValue"], "Property changed for 'maxValue' not called.");
        TKUnit.assertEqual(allChanges, 2, "Property changed callbacks.");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_binding_value_to_model() {
    var slider = new sliderModule.Slider()

    function testAction(views: Array<viewModule.View>) {
        // <snippet module="ui/slider" title="slider">
        // ### Binding value property to a model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("age", 21);
        var options: bindable.BindingOptions = {
            sourceProperty: "age",
            targetProperty: "value"
        };
        slider.bind(options, model);
        //// slider.value is now 21
        // <hide>
        TKUnit.assertEqual(slider.value, 21, "slider.value");
        // </hide>
        model.set("age", 22);
        //// slider.value is now 22
        // <hide>
        TKUnit.assertEqual(slider.value, 22, "slider.value");
        // </hide>
        // ```
        // </snippet>
    }

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_binding_value_to_bindingContext() {
    var slider = new sliderModule.Slider()

    function testAction(views: Array<viewModule.View>) {
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("age", 21);
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "age",
            targetProperty: "value"
        };
        slider.bind(options);

        TKUnit.assertEqual(slider.value, 21, "slider.value");
        model.set("age", 22);
        TKUnit.assertEqual(slider.value, 22, "slider.value");
    }

    helper.buildUIAndRunTest(slider, testAction);
}

export function test_set_value_min_max_have_correct_values_after_load() {
    var slider = new sliderModule.Slider();
    slider.minValue = 10;
    slider.maxValue = 300;
    slider.value = 250;

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(slider.minValue, 10, "slider.minValue");
        TKUnit.assertEqual(slider.value, 250, "slider.value");
        TKUnit.assertEqual(slider.maxValue, 300, "slider.maxValue");
    };

    helper.buildUIAndRunTest(slider, testAction);
}

function getNativeValue(slider: sliderModule.Slider): number {
    if (slider.android) {
        return slider.android.Progress;
    }
    else if (slider.ios) {
        return slider.ios.value;
    }
}

function getNativeMaxValue(slider: sliderModule.Slider): number {
    if (slider.android) {
        return slider.android.getMax();
    }
    else if (slider.ios) {
        return slider.ios.maximumValue;
    }
}

function setNativeValue(slider: sliderModule.Slider, value: number) {
    if (slider.android) {
        slider.android.setProgress(value);
    }
    else if (slider.ios) {
        slider.ios.value = value;

        // setting value trough code does not send notification, so simulate that manually.
        slider.ios.sendActionsForControlEvents(UIControlEvents.UIControlEventValueChanged);
    }
}
