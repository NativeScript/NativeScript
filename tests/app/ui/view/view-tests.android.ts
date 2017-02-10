import * as TKUnit from "../../TKUnit";
import * as commonTests from "./view-tests-common";
import * as helper from "../../ui/helper";
import * as view from "ui/core/view";
import * as button from "ui/button";
import * as types from "utils/types";
import * as stack from "ui/layouts/stack-layout";
import * as labelModule from "ui/label";
import * as frame from "ui/frame";
import * as trace from "trace";
import { Color } from "color";
// enable the trace, it is disabled by default
trace.enable();

global.moduleMerge(commonTests, exports);

export const test_event_setupUI_IsRaised = function () {
    const listener = new Listener("_setupUI");
    trace.addEventListener(listener);

    const test = function (views: Array<view.View>) {
        // 2 setupUI calls: stack, button
        TKUnit.assertEqual(listener.receivedEvents.length, 2, "setupUI calls");

        for (let i = 0; i < listener.receivedEvents.length; i++) {
            TKUnit.assertEqual(listener.receivedEvents[i].sender, views[i + 1]); // 0 is Page, so start with +1.
            TKUnit.assertEqual(listener.receivedEvents[i].name, "_setupUI");
        }
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
    trace.removeEventListener(listener);
};

export const test_event_setupUI_IsRaised_WhenAttached_Dynamically = function () {
    const test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _setupUI event
        const listener = new Listener("_setupUI");
        trace.addEventListener(listener);

        const newButton = new button.Button();
        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_setupUI");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, newButton);

        trace.removeEventListener(listener);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export const test_event_onContextChanged_IsRaised_WhenAttached = function () {
    const listener = new Listener("_onContextChanged");
    trace.addEventListener(listener);

    const test = function (views: Array<view.View>) {
        // 2 onContextChanged calls: stack, button
        TKUnit.assertEqual(listener.receivedEvents.length, 2, "onContextChanged calls");

        for (let i = 0; i < listener.receivedEvents.length; i++) {
            TKUnit.assertEqual(listener.receivedEvents[i].sender, views[i + 1]); // 0 is Page, so start with +1.
            TKUnit.assertEqual(listener.receivedEvents[i].name, "_onContextChanged");
        }
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
    trace.removeEventListener(listener);
};

export const test_event_onContextChanged_IsRaised_WhenAttached_Dynamically = function () {
    const test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _onContextChanged event
        const listener = new Listener("_onContextChanged");
        trace.addEventListener(listener);

        const newButton = new button.Button();
        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_onContextChanged");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, newButton);

        trace.removeEventListener(listener);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export const test_event_tearDownUI_IsRaised = function () {
    let cachedViews: Array<view.View>;
    let listener: Listener;

    const test = function (views: Array<view.View>) {
        cachedViews = views;

        // once the above method completes goBack on the current frame is called which will detach the tested views
        listener = new Listener("_tearDownUI");
        trace.addEventListener(listener);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);

    // 2 detached calls: page, stack, button, actionBar
    TKUnit.assertEqual(listener.receivedEvents.length, 2, "tearDownUI calls");

    // _tearDownUI event is propagated to nested children first
    for (let i = 0, j = listener.receivedEvents.length - 1; i < listener.receivedEvents.length; i++ , j--) {
        // check the sender and remove
        const index = cachedViews.indexOf(<view.View>listener.receivedEvents[i].sender);
        TKUnit.assert(index >= 0, "_tearDownUI called for unknown sender");
        cachedViews.splice(index, 1);

        TKUnit.assertEqual(listener.receivedEvents[i].name, "_tearDownUI");
    }

    trace.removeEventListener(listener);
};

export const test_event_tearDownUI_IsRaised_WhenRemoved_Dynamically = function () {
    const test = function (views: Array<view.View>) {
        // add new button to the visual tree and ensure its _tearDownUI event
        const listener = new Listener("_tearDownUI");
        trace.addEventListener(listener);

        // remove the button from the layout
        (<stack.StackLayout>views[1]).removeChild(views[2]);

        TKUnit.assertEqual(listener.receivedEvents.length, 1);
        TKUnit.assertEqual(listener.receivedEvents[0].name, "_tearDownUI");
        TKUnit.assertEqual(listener.receivedEvents[0].sender, views[2]);

        trace.removeEventListener(listener);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export const test_events_tearDownUIAndRemovedFromNativeVisualTree_AreRaised_WhenNavigateBack = function () {
    let tearDownUIListener = new Listener("_tearDownUI");
    let removeFromNativeVisualTreeListener = new Listener("_removeViewFromNativeVisualTree");

    let page = frame.topmost().currentPage;
    let stackLayout = new stack.StackLayout();
    let btn = new button.Button();
    stackLayout.addChild(btn);
    page.content = stackLayout;

    trace.addEventListener(tearDownUIListener);
    trace.addEventListener(removeFromNativeVisualTreeListener);

    page.content = null;

    // 2 tearDownUI calls: stack, button
    TKUnit.assertEqual(tearDownUIListener.receivedEvents.length, 2, "tearDownUI calls");

    TKUnit.assertEqual(tearDownUIListener.receivedEvents[0].name, "_tearDownUI");
    TKUnit.assertEqual(tearDownUIListener.receivedEvents[0].sender, btn); // Button
    TKUnit.assertEqual(tearDownUIListener.receivedEvents[1].sender, stackLayout); // stackLayout

    // this is an event fired from CustomLayoutView when a child is removed from the native visual tree
    // therefore this event is fired for StackLayout and Button (which is inside StackLayout).
    TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents.length, 2);
    TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[0].name, "_removeViewFromNativeVisualTree");
    TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[0].sender, btn);

    TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[1].name, "_removeViewFromNativeVisualTree");
    TKUnit.assertEqual(removeFromNativeVisualTreeListener.receivedEvents[1].sender, stackLayout);

    trace.removeEventListener(tearDownUIListener);
    trace.removeEventListener(removeFromNativeVisualTreeListener);
};

export const test_cachedProperties_Applied_WhenNativeWidged_IsCreated = function () {
    const test = function (views: Array<view.View>) {
        const newButton = new button.Button();
        newButton.text = "Test Button";
        TKUnit.assert(types.isUndefined(newButton.android));

        (<stack.StackLayout>views[1]).addChild(newButton);

        TKUnit.assert(types.isDefined(newButton.android));
        // TODO: There is currently an issue with the getText conversion to JavaScript string
        TKUnit.assertEqual(newButton.android.getText(), "Test Button");
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function test_automation_text_set_to_native() {
    const test = function (views: Array<view.View>) {
        const newButton = new button.Button();
        newButton.automationText = "Button1";
        (<stack.StackLayout>views[1]).addChild(newButton);
        TKUnit.assertEqual((<android.widget.Button>newButton.android).getContentDescription(), "Button1", "contentDescription not set to native view.");
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
}

export const test_event_onContextChanged_IsNotRaised_WhenAttachedToSameContext = function () {
    const test = function (views: Array<view.View>) {
        const listener = new Listener("_onContextChanged");
        trace.addEventListener(listener);

        views[2]._setupUI(views[0]._context);

        TKUnit.assertEqual(listener.receivedEvents.length, 0, "listener.receivedEvents.length");

        trace.removeEventListener(listener);
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

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

export const test_StylePropertiesDefaultValuesCache = function () {
    const testValue = 35;

    const test = function (views: [view.View, stack.StackLayout, button.Button, view.View]) {
        const testLabel = new labelModule.Label();
        const testButton = new button.Button();

        const stack = views[1];

        stack.addChild(testLabel);
        stack.addChild(testButton);

        const defaultLabelFontSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        const defaultButtonFontSize = (<android.widget.Button>(testButton.android)).getTextSize();

        testLabel.style.fontSize = testValue;
        testButton.style.fontSize = testValue;

        let actualLabelTextSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        let actualButtonTextSize = (<android.widget.Button>(testButton.android)).getTextSize();

        TKUnit.assert(actualLabelTextSize !== defaultLabelFontSize, "Label text size should be different from default!");
        TKUnit.assert(actualButtonTextSize !== defaultButtonFontSize, "Button text size should be different from default!");

        testLabel.style.fontSize = view.unsetValue;
        testButton.style.fontSize = view.unsetValue;

        actualLabelTextSize = (<android.widget.TextView>(testLabel.android)).getTextSize();
        actualButtonTextSize = (<android.widget.Button>(testButton.android)).getTextSize();

        TKUnit.assertEqual(actualLabelTextSize, defaultLabelFontSize, "Label text size should be default!");
        TKUnit.assertEqual(actualButtonTextSize, defaultButtonFontSize, "Button text size should be default!");
    };

    helper.do_PageTest_WithStackLayout_AndButton(test);
};

export function getUniformNativeBorderWidth(v: view.View): number {
    const bkg = <org.nativescript.widgets.BorderDrawable>v.android.getBackground();
    return bkg ? bkg.getUniformBorderWidth() : 0;
}

export function checkUniformNativeBorderColor(v: view.View): boolean {
    const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();
    return bkg && bkg.getUniformBorderColor() === (<Color>v.borderColor).android;
}

export function getUniformNativeCornerRadius(v: view.View): number {
    const bkg = <org.nativescript.widgets.BorderDrawable>v.android.getBackground();
    return bkg ? bkg.getUniformBorderRadius() : 0;
}

export function checkNativeBackgroundColor(v: view.View): boolean {
    const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();

    return v.backgroundColor && bkg && bkg.getBackgroundColor() === v.backgroundColor.android;
}

export function checkNativeBackgroundImage(v: view.View): boolean {
    const bkg = <org.nativescript.widgets.BorderDrawable>(<android.view.View>v.android).getBackground();

    return bkg && !types.isNullOrUndefined(bkg.getBackgroundImage());
}

let SDK: number;
function getSDK() {
    if (!SDK) {
        SDK = android.os.Build.VERSION.SDK_INT;
    }

    return SDK;
}

export function test_AndroidLayerType_BorderWidth() {
    helper.buildUIAndRunTest(new labelModule.Label(), (views: Array<view.View>) => {
        let lbl = <labelModule.Label>(views[0]);
        let androidView = <android.view.View>lbl.android;
        let originalLayerType = androidView.getLayerType();
        lbl.borderWidth = 5;
        TKUnit.assertEqual(androidView.getLayerType(), getSDK() < 18 ? android.view.View.LAYER_TYPE_SOFTWARE : originalLayerType);
        lbl.borderWidth = 0;
        TKUnit.assertEqual(androidView.getLayerType(), originalLayerType);
    });
};

export function test_AndroidLayerType_BorderRadius() {
    helper.buildUIAndRunTest(new labelModule.Label(), (views: Array<view.View>) => {
        let lbl = <labelModule.Label>(views[0]);
        let androidView = <android.view.View>lbl.android;
        let originalLayerType = androidView.getLayerType();
        lbl.borderRadius = 5;
        TKUnit.assertEqual(androidView.getLayerType(), getSDK() < 18 ? android.view.View.LAYER_TYPE_SOFTWARE : originalLayerType);
        lbl.borderRadius = 0;
        TKUnit.assertEqual(androidView.getLayerType(), originalLayerType);
    });
};

export function test_AndroidLayerType_ClipPath() {
    helper.buildUIAndRunTest(new labelModule.Label(), (views: Array<view.View>) => {
        let lbl = <labelModule.Label>(views[0]);
        let androidView = <android.view.View>lbl.android;
        let originalLayerType = androidView.getLayerType();
        lbl.style.clipPath = "rect(0, 0, 100%, 100%)";
        TKUnit.assertEqual(androidView.getLayerType(), getSDK() < 18 ? android.view.View.LAYER_TYPE_SOFTWARE : originalLayerType);
        lbl.style.clipPath = undefined;
        TKUnit.assertEqual(androidView.getLayerType(), originalLayerType);
    });
};