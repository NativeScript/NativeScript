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
    var observer = label.on(gestures.GestureTypes.doubleTap, function (args: gestures.GestureEventData) { 
        console.log("Double Tap");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly01 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Double Tap
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("doubleTap", function (args: gestures.GestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.longPress, function (args: gestures.GestureEventData) {
        console.log("Long Press");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly11 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Long Press
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("longPress", function (args: gestures.GestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.pan, function (args: gestures.PanGestureEventData) {
        console.log("Pan deltaX:" + args.deltaX + "; deltaY:" + args.deltaY + ";");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly22 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Pan
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("pan", function (args: gestures.PanGestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.pinch, function (args: gestures.PinchGestureEventData) {
        console.log("Pinch scale: " + args.scale);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly33 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Pinch
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("pinch", function (args: gestures.PinchGestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.rotation, function (args: gestures.RotationGestureEventData) {
        console.log("Rotation: " + args.rotation);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly44 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Rotation
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("rotation", function (args: gestures.RotationGestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.swipe, function (args: gestures.SwipeGestureEventData) {
        console.log("Swipe direction: " + args.direction);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly55 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Swipe
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("swipe", function (args: gestures.SwipeGestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        console.log("Tap");
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly66 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Tap
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("tap", function (args: gestures.GestureEventData) {
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
    var observer = label.on(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        console.log("Tap");
    });
    observer.disconnect();
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly8 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Multiple gestures
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on(gestures.GestureTypes.tap | gestures.GestureTypes.doubleTap | gestures.GestureTypes.longPress, function (args: gestures.GestureEventData) {
        console.log("Event: " + args.eventName);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly88 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Multiple gestures as comma separated string
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("tap, doubleTap, longPress", function (args: gestures.GestureEventData) {
        console.log("Event: " + args.eventName);
    });
    // ```
    // </snippet>
}

export var test_DummyTestForSnippetOnly9 = function () {
    // <snippet module="ui/gestures" title="gestures">
    // ### Events combined with gestures as comma separated string
    // ``` JavaScript
    var label = new labelModule.Label();
    var observer = label.on("loaded, tap, longPress", function (args: gestures.GestureEventData) {
        console.log("Event: " + args.eventName);
    });
    // ```
    // </snippet>
}