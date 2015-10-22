import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
import color = require("color");
import platform = require("platform");
// <snippet module="ui/switch" title="switch">
// # Switch
// Using a switch requires the Switch module.
// ``` JavaScript
import switchModule = require("ui/switch");
// ```

// ### Binding the Switch checked property and Button isEanbled property to a observable view-model property.
//```XML
// <Page loaded="pageLoaded">
//  <StackLayout orientation="vertical">
//    {%raw%}<Switch checked="{{ someProperty }}" />
//    <Button isEanbled="{{ someProperty }}" text="This is a Button!" />{%endraw%}
//  </StackLayout>
// </Page>
//```
//```JS
// function pageLoaded(args) {
//   var page = args.object;
//   var obj = new observable.Observable();
//   obj.set("someProperty", false);
//   page.bindingContext = obj;
// }
// exports.pageLoaded = pageLoaded;
//```

// </snippet>

export function test_default_TNS_values() {
    // <snippet module="ui/switch" title="switch">
    // ### Creating a switch
    // ``` JavaScript
    var mySwitch = new switchModule.Switch();
    // ```
    // </snippet>
    TKUnit.assertEqual(mySwitch.checked, false, "Default switch.checked");
}

export function test_default_native_values() {
    var mySwitch = new switchModule.Switch();

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(getNativeValue(mySwitch), false, "Default native switch.checked");
    };

    helper.buildUIAndRunTest(mySwitch, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.
if (platform.device.os === platform.platformNames.ios) {
    exports.test_set_color = function () {
        var mySwitch = new switchModule.Switch();
        mySwitch.color = new color.Color("red");

        function testAction(views: Array<viewModule.View>) {
            TKUnit.assert(mySwitch.color.ios.isEqual(mySwitch.ios.thumbTintColor), "mySwitch.color");
        };

        helper.buildUIAndRunTest(mySwitch, testAction);
    }

    exports.test_set_backgroundColor = function () {
        var mySwitch = new switchModule.Switch();
        mySwitch.backgroundColor = new color.Color("red");

        function testAction(views: Array<viewModule.View>) {
            TKUnit.assert(CGColorEqualToColor(mySwitch.backgroundColor.ios.CGColor, mySwitch.ios.onTintColor.CGColor), "mySwitch.color");
        };

        helper.buildUIAndRunTest(mySwitch, testAction);
    }
}

export function test_set_TNS_checked_updates_native_checked() {
    var mySwitch = new switchModule.Switch();
    function testAction(views: Array<viewModule.View>) {
        // <snippet module="ui/switch" title="switch">
        // ### Setting the checked property of a switch
        // ``` JavaScript
        mySwitch.checked = true;
        // ```
        // </snippet>
        TKUnit.assertEqual(getNativeValue(mySwitch), true, "Native checked is different from TNS checked.");
    };

    helper.buildUIAndRunTest(mySwitch, testAction);
}

export function test_set_native_checked_updates_TNS_checked() {
    var mySwitch = new switchModule.Switch();
    function testAction(views: Array<viewModule.View>) {
        setNativeValue(mySwitch, true);
        TKUnit.assertEqual(mySwitch.checked, true, "Native checked is different from TNS checked.");
    };

    helper.buildUIAndRunTest(mySwitch, testAction);
}

export function test_set_native_checked_triggers_propertyChanged() {
    var mySwitch = new switchModule.Switch();
    function testAction(views: Array<viewModule.View>) {
        var checkedChanged = false;
        var allChanges = 0;
        mySwitch.on(observable.Observable.propertyChangeEvent, function (data: observable.EventData) {
            allChanges++;
            var propertyData = <observable.PropertyChangeData>data;
            if (propertyData && propertyData.propertyName === "checked" && propertyData.value === true) {
                checkedChanged = true;
            }
        });

        setNativeValue(mySwitch, true);

        mySwitch.off(observable.Observable.propertyChangeEvent);

        TKUnit.assert(checkedChanged, "Property changed for checked not called.");
        TKUnit.assertEqual(allChanges, 1, "Property changed callbacks.");
    }

    helper.buildUIAndRunTest(mySwitch, testAction);
};

export function test_binding_value_to_model() {
    var mySwitch = new switchModule.Switch()

    function testAction(views: Array<viewModule.View>) {
        // <snippet module="ui/switch" title="switch">
        // ### Binding checked property to a model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("enabled", true);
        var options: bindable.BindingOptions = {
            sourceProperty: "enabled",
            targetProperty: "checked"
        };
        mySwitch.bind(options, model);
        //// mySwitch.checked is now true
        // <hide>
        TKUnit.assertEqual(mySwitch.checked, true, "mySwitch.checked");
        // </hide>
        model.set("enabled", false);
        //// mySwitch.checked is now false
        // <hide>
        TKUnit.assertEqual(mySwitch.checked, false, "mySwitch.checked");
        // </hide>
        // ```
        // </snippet>
    }

    helper.buildUIAndRunTest(mySwitch, testAction);
}

function getNativeValue(mySwitch: switchModule.Switch): boolean {
    if (mySwitch.android) {
        return mySwitch.android.isChecked();
    }
    else if (mySwitch.ios) {
        return mySwitch.ios.on;
    }
}

function setNativeValue(mySwitch: switchModule.Switch, value: boolean) {
    if (mySwitch.android) {
        mySwitch.android.setChecked(value);
    }
    else if (mySwitch.ios) {
        mySwitch.ios.on = value;

        // setting value trough code does not send notification, so simulate that manually.
        mySwitch.ios.sendActionsForControlEvents(UIControlEvents.UIControlEventValueChanged);
    }
}
