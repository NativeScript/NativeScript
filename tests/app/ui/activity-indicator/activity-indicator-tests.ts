import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import imageModule = require("ui/image");
import platform = require("platform");
import color = require("color");

// >> activity-indicator-require
import activityIndicatorModule = require("ui/activity-indicator");
// << activity-indicator-require

export function test_default_TNS_values() {
    // >> activity-indicator-create
    var indicator = new activityIndicatorModule.ActivityIndicator();
    // << activity-indicator-create

    TKUnit.assertEqual(indicator.busy, false, "Default indicator.busy");
}

export function test_default_native_values() {
    var indicator = new activityIndicatorModule.ActivityIndicator();
    indicator.width = 50;
    indicator.height = 50;

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(getNativeBusy(indicator), false, "Default native indicator.busy");
    };

    helper.buildUIAndRunTest(indicator, testAction);
}

export function test_set_TNS_value_updates_native_value() {
    var indicator = new activityIndicatorModule.ActivityIndicator();
    indicator.width = 50;
    indicator.height = 50;

    function testAction(views: Array<viewModule.View>) {
        indicator.busy = true;
        TKUnit.waitUntilReady(() => getNativeBusy(indicator) === true);
        TKUnit.assertEqual(getNativeBusy(indicator), true, "Native value is different from TNS value.");
    };

    helper.buildUIAndRunTest(indicator, testAction);
}

// Uncomment this when find way to check android Drawable color set by setColorFilter() method.
if (platform.device.os === platform.platformNames.ios) {
    exports.test_set_color = function () {
        var ai = new activityIndicatorModule.ActivityIndicator();
        ai.color = new color.Color("red");

        function testAction(views: Array<viewModule.View>) {
            TKUnit.assertEqual(ai.color.ios.CGColor, ai.ios.color.CGColor, "ai.color");
        };

        helper.buildUIAndRunTest(ai, testAction);
    }
}

// This method is only for the code snippet
/* tslint:disable:no-unused-variable */
function binding_busy_to_image() {
    /* tslint:enable:no-unused-variable */
    
    // >> activity-indicator-loading
    var image = new imageModule.Image();
    var indicator = new activityIndicatorModule.ActivityIndicator();
    indicator.width = 100;
    indicator.height = 100;

    // Bind the busy property of the indicator to the isLoading property of the image
    indicator.bind({
        sourceProperty: "isLoading",
        targetProperty: "busy"
    }, image);
    // << activity-indicator-loading
}

function getNativeBusy(indicator: activityIndicatorModule.ActivityIndicator): boolean {
    if (indicator.android) {
        return indicator.android.getVisibility() === android.view.View.VISIBLE;
    }
    else if (indicator.ios) {
        return indicator.ios.isAnimating();
    }
}
