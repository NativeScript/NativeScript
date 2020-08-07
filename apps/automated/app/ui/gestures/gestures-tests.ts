/* tslint:disable:no-unused-variable */
import { GestureEventData, Label, GestureTypes, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData, RotationGestureEventData } from '@nativescript/core';

export var test_DummyTestForSnippetOnly0 = function () {
	// >> gestures-double-tap
	var label = new Label();
	var observer = label.on(GestureTypes.doubleTap, function (args: GestureEventData) {
		console.log('Double Tap');
	});
	// << gestures-double-tap
};

export var test_DummyTestForSnippetOnly01 = function () {
	// >> gestures-double-tap-alt
	var label = new Label();
	var observer = label.on('doubleTap', function (args: GestureEventData) {
		console.log('Double Tap');
	});
	// << gestures-double-tap-alt
};

export var test_DummyTestForSnippetOnly1 = function () {
	// >> gestures-long-press
	var label = new Label();
	var observer = label.on(GestureTypes.longPress, function (args: GestureEventData) {
		console.log('Long Press');
	});
	// << gestures-long-press
};

export var test_DummyTestForSnippetOnly11 = function () {
	// >> gestures-long-press-alt
	var label = new Label();
	var observer = label.on('longPress', function (args: GestureEventData) {
		console.log('Long Press');
	});
	// << gestures-long-press-alt
};

export var test_DummyTestForSnippetOnly2 = function () {
	// >> gestures-pan
	var label = new Label();
	var observer = label.on(GestureTypes.pan, function (args: PanGestureEventData) {
		console.log('Pan deltaX:' + args.deltaX + '; deltaY:' + args.deltaY + ';');
	});
	// << gestures-pan
};

export var test_DummyTestForSnippetOnly22 = function () {
	// >> gestures-pan-alt
	var label = new Label();
	var observer = label.on('pan', function (args: PanGestureEventData) {
		console.log('Pan deltaX:' + args.deltaX + '; deltaY:' + args.deltaY + ';');
	});
	// << gestures-pan-alt
};

export var test_DummyTestForSnippetOnly3 = function () {
	// >> gestures-pan-pinch
	var label = new Label();
	var observer = label.on(GestureTypes.pinch, function (args: PinchGestureEventData) {
		console.log('Pinch scale: ' + args.scale);
	});
	// << gestures-pan-pinch
};

export var test_DummyTestForSnippetOnly33 = function () {
	// >> gestures-pan-pinch-alt
	var label = new Label();
	var observer = label.on('pinch', function (args: PinchGestureEventData) {
		console.log('Pinch scale: ' + args.scale);
	});
	// << gestures-pan-pinch-alt
};

export var test_DummyTestForSnippetOnly4 = function () {
	// >> gestures-rotation
	var label = new Label();
	var observer = label.on(GestureTypes.rotation, function (args: RotationGestureEventData) {
		console.log('Rotation: ' + args.rotation);
	});
	// << gestures-rotation
};

export var test_DummyTestForSnippetOnly44 = function () {
	// >> gestures-rotation-alt
	var label = new Label();
	var observer = label.on('rotation', function (args: RotationGestureEventData) {
		console.log('Rotation: ' + args.rotation);
	});
	// << gestures-rotation-alt
};

export var test_DummyTestForSnippetOnly5 = function () {
	// >> gestures-swipe
	var label = new Label();
	var observer = label.on(GestureTypes.swipe, function (args: SwipeGestureEventData) {
		console.log('Swipe direction: ' + args.direction);
	});
	// << gestures-swipe
};

export var test_DummyTestForSnippetOnly55 = function () {
	// >> gestures-swipe-alt
	var label = new Label();
	var observer = label.on('swipe', function (args: SwipeGestureEventData) {
		console.log('Swipe direction: ' + args.direction);
	});
	// << gestures-swipe-alt
};

export var test_DummyTestForSnippetOnly6 = function () {
	// >> gestures-tap
	var label = new Label();
	var observer = label.on(GestureTypes.tap, function (args: GestureEventData) {
		console.log('Tap');
	});
	// << gestures-tap
};

export var test_DummyTestForSnippetOnly66 = function () {
	// >> gestures-tap-alt
	var label = new Label();
	var observer = label.on('tap', function (args: GestureEventData) {
		console.log('Tap');
	});
	// << gestures-tap-alt
};

export var test_DummyTestForSnippetOnly7 = function () {
	// >> gestures-stop-observe
	var label = new Label();
	var observer = label.on(GestureTypes.tap, function (args: GestureEventData) {
		console.log('Tap');
	});
	observer.disconnect();
	// << gestures-stop-observe
};

export var test_DummyTestForSnippetOnly8 = function () {
	// >> gestures-multiple
	var label = new Label();
	var observer = label.on(GestureTypes.tap | GestureTypes.doubleTap | GestureTypes.longPress, function (args: GestureEventData) {
		console.log('Event: ' + args.eventName);
	});
	// << gestures-multiple
};

export var test_DummyTestForSnippetOnly88 = function () {
	// >> gestures-string
	var label = new Label();
	var observer = label.on('tap, doubleTap, longPress', function (args: GestureEventData) {
		console.log('Event: ' + args.eventName);
	});
	// << gestures-string
};

export var test_DummyTestForSnippetOnly9 = function () {
	// >> gestures-events-string
	var label = new Label();
	var observer = label.on('loaded, tap, longPress', function (args: GestureEventData) {
		console.log('Event: ' + args.eventName);
	});
	// << gestures-events-string
};
