import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
import color = require("color");
import platform = require("platform");
// >> article-require-switch
import switchModule = require("ui/switch");
// << article-require-switch

// ### Binding the Switch checked property and Button isEanbled property to a observable view-model property.

// >> article-binding-switch-property
function pageLoaded(args) {
  var page = args.object;
  var obj = new observable.Observable();
  obj.set("someProperty", false);
  page.bindingContext = obj;
}
exports.pageLoaded = pageLoaded;
// << article-binding-switch-property

export function test_default_TNS_values() {
    // >> article-create-switch
    var mySwitch = new switchModule.Switch();
    // << article-create-switch
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
        // >> article-setting-checked-property
        mySwitch.checked = true;
        // << article-setting-checked-property
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
        // >> aricle-binding-checked-property
        var model = new observable.Observable();
        model.set("enabled", true);
        var options: bindable.BindingOptions = {
            sourceProperty: "enabled",
            targetProperty: "checked"
        };
        mySwitch.bind(options, model);
        //// mySwitch.checked is now true
        // >> (hide)
        TKUnit.assertEqual(mySwitch.checked, true, "mySwitch.checked");
        // << (hide)
        model.set("enabled", false);
        //// mySwitch.checked is now false
        // >> (hide)
        TKUnit.assertEqual(mySwitch.checked, false, "mySwitch.checked");
        // << (hide)
        // << aricle-binding-checked-property
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
