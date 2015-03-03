import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import observable = require("data/observable");
// <snippet module="ui/progress" title="progress">
// # Progress
// Using the progress view requires the Progress module.
// ``` JavaScript
import progressModule = require("ui/progress");
// ```

// Binding the Progress value property to a view-model property.
//```XML
// <Page loaded="pageLoaded">
//   {%raw%}<Progress value="{{ someProperty }}" />{%endraw%}
// </Page>
//```
//```JS
// function pageLoaded(args) {
//   var page = args.object;
//   page.bindingContext = { someProperty : 42 };
// }
// exports.pageLoaded = pageLoaded;
//```
// </snippet>

export function test_default_TNS_values() {
    // <snippet module="ui/progress" title="progress">
    // ### Creating a progress view
    // ``` JavaScript
    var progress = new progressModule.Progress();
    // ```
    // </snippet>

    TKUnit.assertEqual(progress.value, 0, "Default progress.value");
    TKUnit.assertEqual(progress.maxValue, 100, "Default progress.maxValue");
}

export function test_default_native_values() {
    var progress = new progressModule.Progress();

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(getNativeValue(progress), 0, "Default native progress.value");
        TKUnit.assertEqual(getNativeMaxValue(progress), 100, "Default native progress.maxValue");
    };

    helper.buildUIAndRunTest(progress, testAction);
}

export function test_set_TNS_value_updates_native_value() {
    var progress = new progressModule.Progress();

    function testAction(views: Array<viewModule.View>) {
        progress.value = 5;
        TKUnit.assertAreClose(getNativeValue(progress), 5, 0.001, "Native value is different from TNS value.");
    };

    helper.buildUIAndRunTest(progress, testAction);
}

export function test_set_value_greater_than_max_should_set_value_to_max() {
    var progress = new progressModule.Progress();

    function testAction(views: Array<viewModule.View>) {
        progress.maxValue = 10;
        progress.value = 20;
        TKUnit.assertEqual(progress.value, 10, "progress.value");
    };

    helper.buildUIAndRunTest(progress, testAction);
}

export function test_set_maxValue_should_adjust_value() {
    var progress = new progressModule.Progress();

    // <snippet module="ui/progress" title="progress">
    // ### Setting up the progress view
    // ``` JavaScript
    progress.maxValue = 255;
    progress.value = 16;
    // ```
    // </snippet>

    function testAction(views: Array<viewModule.View>) {
        progress.maxValue = 10;

        TKUnit.assertEqual(progress.maxValue, 10, "progress.maxValue");
        TKUnit.assertEqual(progress.value, 10, "progress.value");
    };

    helper.buildUIAndRunTest(progress, testAction);
}

export function test_property_changed_event_when_setting_maxValue_with_adjust() {
    var progress = new progressModule.Progress();
    progress.maxValue = 100;
    progress.value = 50;

    function testAction(views: Array<viewModule.View>) {
        var changedProperties = {};
        var allChanges = 0;
        progress.on(observable.knownEvents.propertyChange, function (data: observable.EventData) {
            allChanges++;
            changedProperties[(<observable.PropertyChangeData>data).propertyName] = true;
        });

        // Act
        progress.maxValue = 40;
        progress.off(observable.knownEvents.propertyChange);

        // Assert
        TKUnit.assert(changedProperties["value"], "Property changed for 'value' not called.");
        TKUnit.assert(changedProperties["maxValue"], "Property changed for 'maxValue' not called.");
        TKUnit.assertEqual(allChanges, 2, "Property changed callbacks.");
    };

    helper.buildUIAndRunTest(progress, testAction);
}

function getNativeValue(progress: progressModule.Progress): number {
    if (progress.android) {
        return progress.android.Progress;
    }
    else if (progress.ios) {
        return progress.ios.progress * progress.maxValue;
    }
}

function getNativeMaxValue(progress: progressModule.Progress): number {
    if (progress.android) {
        return progress.android.getMax();
    }
    else if (progress.ios) {
        // there is no max value in ios - the range is always [0, 1]
        return progress.maxValue;
    }
}
