/* tslint:disable:no-unused-variable */
// <snippet module="ui/gestures" title="gestures">
// # Gestures
// Detecting user gestures requires the "ui/gestures" module.
// ``` JavaScript
import gestures = require("ui/gestures");
// ```
// </snippet>
import labelModule = require("ui/label");

export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Double Tap
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.doubleTap, function (args: gestures.GestureEventData) { 
        console.log("Double Tap");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly1 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Long Press
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.longPress, function (args: gestures.GestureEventData) {
        console.log("Long Press");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly2 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Pan
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.pan, function (args: gestures.PanGestureEventData) {
        console.log("Pan deltaX:" + args.deltaX + "; deltaY:" + args.deltaY + ";");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly3 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Pinch
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.pinch, function (args: gestures.PinchGestureEventData) {
        console.log("Pinch scale: " + args.scale);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly4 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Rotation
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.rotation, function (args: gestures.RotationGestureEventData) {
        console.log("Rotation: " + args.rotation);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly5 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Swipe
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.swipe, function (args: gestures.SwipeGestureEventData) {
        console.log("Swipe direction: " + args.direction);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly6 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Tap
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        console.log("Tap");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly7 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Stop observing
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.observe(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        console.log("Tap");
    });
    observer.disconnect();
    // ```
    // </snippet>
}