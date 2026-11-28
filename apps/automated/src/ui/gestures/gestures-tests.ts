/* tslint:disable:no-unused-variable */
import { GestureEventData, Label, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData, RotationGestureEventData } from '@nativescript/core';

export const test_DummyTestForSnippetOnly01 = function () {
	// >> gestures-double-tap-alt
	const label = new Label();
	const observer = label.on('doubleTap', function (args: GestureEventData) {
		console.log('Double Tap');
	});
	// << gestures-double-tap-alt
};

export const test_DummyTestForSnippetOnly11 = function () {
	// >> gestures-long-press-alt
	const label = new Label();
	const observer = label.on('longPress', function (args: GestureEventData) {
		console.log('Long Press');
	});
	// << gestures-long-press-alt
};

export const test_DummyTestForSnippetOnly22 = function () {
	// >> gestures-pan-alt
	const label = new Label();
	const observer = label.on('pan', function (args: PanGestureEventData) {
		console.log('Pan deltaX:' + args.deltaX + '; deltaY:' + args.deltaY + ';');
	});
	// << gestures-pan-alt
};

export const test_DummyTestForSnippetOnly33 = function () {
	// >> gestures-pan-pinch-alt
	const label = new Label();
	const observer = label.on('pinch', function (args: PinchGestureEventData) {
		console.log('Pinch scale: ' + args.scale);
	});
	// << gestures-pan-pinch-alt
};

export const test_DummyTestForSnippetOnly44 = function () {
	// >> gestures-rotation-alt
	const label = new Label();
	const observer = label.on('rotation', function (args: RotationGestureEventData) {
		console.log('Rotation: ' + args.rotation);
	});
	// << gestures-rotation-alt
};

export const test_DummyTestForSnippetOnly55 = function () {
	// >> gestures-swipe-alt
	const label = new Label();
	const observer = label.on('swipe', function (args: SwipeGestureEventData) {
		console.log('Swipe direction: ' + args.direction);
	});
	// << gestures-swipe-alt
};

export const test_DummyTestForSnippetOnly66 = function () {
	// >> gestures-tap-alt
	const label = new Label();
	const observer = label.on('tap', function (args: GestureEventData) {
		console.log('Tap');
	});
	// << gestures-tap-alt
};

export const test_DummyTestForSnippetOnly88 = function () {
	// >> gestures-string
	const label = new Label();
	const observer = label.on('tap, doubleTap, longPress', function (args: GestureEventData) {
		console.log('Event: ' + args.eventName);
	});
	// << gestures-string
};

export const test_DummyTestForSnippetOnly9 = function () {
	// >> gestures-events-string
	const label = new Label();
	const observer = label.on('loaded, tap, longPress', function (args: GestureEventData) {
		console.log('Event: ' + args.eventName);
	});
	// << gestures-events-string
};
