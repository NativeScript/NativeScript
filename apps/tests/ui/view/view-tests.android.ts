import TKUnit = require("../../TKUnit");
import commonTests = require("./view-tests-common");
import helper = require("../../ui/helper");
import view = require("ui/core/view");
import button = require("ui/button");
import types = require("utils/types");
import stack = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import background = require("ui/styling/background");

import trace = require("trace");
// enable the trace, it is disabled by default
trace.enable();

// merge the exports of the view-tests-common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(commonTests, exports);

export var test_event_onAttached_IsRaised = function () {
    var listener = new Listener("_onAttached");
    trace.addEventListener(listener);

    var test = function (views: Array<view.View>) {
        // 4 onAttached calls: page, stack, button, actionBar
        TKUnit.assertEqual(listener.receivedEvents.length, 4, "onAttached calls");

        var i;
        for (i = 0; i < listener.receivedEvents.length; i++) {
            TKUnit.assertEqual(listener.receivedEvents[i].sender, views[i]);
            TKUnit.assertEqual(listener.receivedEvents[i].name, "_onAttached");
        }
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
    trace.removeEventListener(listener);
}

export var test_event_onAttached_IsRaised_WhenAttached_Dynamically = function () {
    var test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _onAttached event
        var listener = new Listener("_onAttached");
        trace.addEventListener(listener);

        var newButton = new button.Button();
        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_onAttached");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, newButton);

        trace.removeEventListener(listener);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_event_onContextChanged_IsRaised_WhenAttached = function () {
    var listener = new Listener("_onContextChanged");
    trace.addEventListener(listener);

    var test = function (views: Array<view.View>) {
        // 4 onContextChanged calls: page, stack, button, actionBar
        TKUnit.assertEqual(listener.receivedEvents.length, 4, "onContextChanged calls");

        var i;
        for (i = 0; i < listener.receivedEvents.length; i++) {
            TKUnit.assertEqual(listener.receivedEvents[i].sender, views[i]);
            TKUnit.assertEqual(listener.receivedEvents[i].name, "_onContextChanged");
        }
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
    trace.removeEventListener(listener);
}

export var test_event_onContextChanged_IsRaised_WhenAttached_Dynamically = function () {
    var test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _onContextChanged event
        var listener = new Listener("_onContextChanged");
        trace.addEventListener(listener);

        var newButton = new button.Button();
        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_onContextChanged");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, newButton);

        trace.removeEventListener(listener);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_event_onDetached_IsRaised = function () {
    var cachedViews: Array<view.View>;
    var listener: Listener;

    var test = function (views: Array<view.View>) {
        cachedViews = views;

        // once the above method completes goBack on the current frame is called which will detach the tested views
        listener = new Listener("_onDetached");
        trace.addEventListener(listener);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);

    // 4 detached calls: page, stack, button, actionBar
    TKUnit.assertEqual(listener.receivedEvents.length, 4, "onDetached calls");

    var i
    var j;
    // _onDetached event is propagated to nested children first
    for (i = 0, j = listener.receivedEvents.length - 1; i < listener.receivedEvents.length; i++ , j--) {
        // check the sender and remove
        var index = cachedViews.indexOf(<view.View>listener.receivedEvents[i].sender);
        TKUnit.assert(index >= 0, "_onDetached called for unknown sender");
        cachedViews.splice(index, 1);

        TKUnit.assertEqual(listener.receivedEvents[i].name, "_onDetached");
    }

    trace.removeEventListener(listener);
}

export var test_event_onDetached_IsRaised_WhenRemoved_Dynamically = function () {
    var test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _onContextChanged event
        var listener = new Listener("_onDetached");
        trace.addEventListener(listener);

        // remove the button from the layout
        (<stack.StackLayout>views[1]).removeChild(views[2]);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_onDetached");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, views[2]);

        trace.removeEventListener(listener);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_events_onDetachedAndRemovedFromNativeVisualTree_AreRaised_WhenNavigateBack = function () {
    var onDetachedListener = new Listener("_onDetached");
    var removeFromNativeVisualTreeListener = new Listener("childInLayoutRemovedFromNativeVisualTree");

    var test = function (views: Array<view.View>) {
        trace.addEventListener(onDetachedListener);
        trace.addEventListener(removeFromNativeVisualTreeListener);
    };

    var assert = function (views: Array<view.View>) {
        // 4 onDetached calls: page, stack, button, actionBar
        TKUnit.assertEqual(onDetachedListener.receivedEvents.length, 4, "onDetached calls");

        TKUnit.assertEqual(onDetachedListener.receivedEvents[0].name, "_onDetached");
        TKUnit.assertEqual(onDetachedListener.receivedEvents[0].sender, views[2]); // Button
        TKUnit.assertEqual(onDetachedListener.receivedEvents[1].sender, views[1]); // Stack
        TKUnit.assertEqual(onDetachedListener.receivedEvents[2].sender, views[3]); // ActionBar
        TKUnit.assertEqual(onDetachedListener.receivedEvents[3].sender, views[0]); // Page

        // this is an event fired from CustomLayoutView when a child is removed from the native visual tree
        // therefore this event is fired for StackLayout and Button (which is inside StackLayout).
        TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents.length, 2);
        TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[0].name, "childInLayoutRemovedFromNativeVisualTree");
        TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[0].sender, views[1]);

        TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[1].name, "childInLayoutRemovedFromNativeVisualTree");
        TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[1].sender, views[2]);

        trace.removeEventListener(onDetachedListener);
        trace.removeEventListener(removeFromNativeVisualTreeListener);
    };

    helper.do_PageTest_WithStackLayout_AndButton_NavigatedBack(test, assert);
}

export var test_cachedProperties_Applied_WhenNativeWidged_IsCreated = function () {
    var test = function (views: Array<view.View>) {
        var newButton = new button.Button();
        newButton.text = "Test Button";
        TKUnit.assert(types.isUndefined(newButton.android));

        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assert(types.isDefined(newButton.android));
        // TODO: There is currently an issue with the getText conversion to JavaScript string
        TKUnit.assertEqual(newButton.android.getText(), "Test Button");
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export var test_event_onContextChanged_IsNotRaised_WhenAttachedToSameContext = function () {
    var test = function (views: Array<view.View>) {
        var listener = new Listener("_onContextChanged");
        trace.addEventListener(listener);

        views[2]._onAttached(views[0]._context);

        TKUnit.assertEqual(listener.receivedEvents.length, 0, "listener.receivedEvents.length");

        trace.removeEventListener(listener);
    }

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

class Listener implements trace.EventListener {
    public filter: string;
    public receivedEvents: Array<{ sender: Object; name: string }> = [];

    constructor(filter: string) {
        this.filter = filter;
    }

    public on(object: Object, name: string) {
        this.receivedEvents.push({ sender: object, name: name });
    }

    public reset() {
        this.receivedEvents = [];
    }
}

export var test_StylePropertiesDefaultValuesCache = function () {
    var testValue = 35;

    var test = function (views: Array<view.View>) {
        var testLabel = new labelModule.Label();
        var testButton = new button.Button();

        var stack = <stack.StackLayout>views[1];

        stack.addChild(testLabel);
        stack.addChild(testButton);

        var defaultLabelFontSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        var defaultButtonFontSize = (<android.widget.Button>(testButton.android)).getTextSize();

        testLabel.style.fontSize = testValue;
        testButton.style.fontSize = testValue;

        var actualLabelTextSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        var actualButtonTextSize = (<android.widget.Button>(testButton.android)).getTextSize();

        TKUnit.assert(actualLabelTextSize !== defaultLabelFontSize, "Label text size should be different from default!");
        TKUnit.assert(actualButtonTextSize !== defaultButtonFontSize, "Button text size should be different from default!");

        testLabel.style.fontSize = undefined;
        testButton.style.fontSize = undefined;

        actualLabelTextSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        actualButtonTextSize = (<android.widget.Button>(testButton.android)).getTextSize();

        TKUnit.assert(actualLabelTextSize === defaultLabelFontSize, "Label text size should be default!");
        TKUnit.assert(actualButtonTextSize === defaultButtonFontSize, "Button text size should be default!");
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export function getNativeBorderWidth(v: view.View): number {
    var bkg = <any>(<android.view.View>v.android).getBackground();

    return bkg ? bkg.borderWidth : -1;
}

export function getNativeCornerRadius(v: view.View): number {
    var bkg = <any>(<android.view.View>v.android).getBackground();

    return bkg ? bkg.cornerRadius : -1;
}

export function checkNativeBorderColor(v: view.View): boolean {
    var bkg = <background.ad.BorderDrawable>(<android.view.View>v.android).getBackground();

    return v.borderColor && bkg && bkg.borderColor === v.borderColor.android;
}

export function checkNativeBackgroundColor(v: view.View): boolean {
    var bkg = <background.ad.BorderDrawable>(<android.view.View>v.android).getBackground();

    return v.backgroundColor && bkg && bkg.background && bkg.background.color.equals(v.backgroundColor);
}

export function checkNativeBackgroundImage(v: view.View): boolean {
    var bkg = <background.ad.BorderDrawable>(<android.view.View>v.android).getBackground();

    return bkg && bkg.background && !types.isNullOrUndefined(bkg.background.image);
}