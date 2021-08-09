import { Screen, StackLayout, Page, Label, Button, GestureEventData, RotationGestureEventData, GestureTypes, SwipeGestureEventData, PanGestureEventData, PinchGestureEventData, GestureStateTypes } from '@nativescript/core';

export function createPage() {
	const stack = new StackLayout();
	var stopButton = new Button();
	if (global.isAndroid) {
		stopButton.height = 30;
		stopButton.fontSize = 8;
	}
	stopButton.text = 'Stop Detecting Gestures';
	stopButton.automationText = 'stopGesturesDetecting';
	stack.addChild(stopButton);

	const labelHeight = Math.round(Screen.mainScreen.heightPixels / (10 * Screen.mainScreen.scale));

	const tapLabel = createLabel('Tap here', labelHeight);
	stack.addChild(tapLabel);

	const doubleTapLabel = createLabel('Double Tap here', labelHeight);
	stack.addChild(doubleTapLabel);

	const longPressLabel = createLabel('Long Press here', labelHeight);
	stack.addChild(longPressLabel);

	const tapAndDoubleTapLabel = createLabel('Tap or Double Tap', labelHeight, true);
	stack.addChild(tapAndDoubleTapLabel);

	const swipeLabel = createLabel('Swipe here', labelHeight, true);
	stack.addChild(swipeLabel);

	const panLabel = createLabel('Pan here', labelHeight, true);
	stack.addChild(panLabel);

	const pinchLabel = createLabel('Pinch here', labelHeight, true);
	stack.addChild(pinchLabel);

	const rotationLabel = createLabel('Rotate here', labelHeight, true);
	stack.addChild(rotationLabel);

	stopButton.on('tap', function () {
		observer1.disconnect();
		observer2.disconnect();
		observer3.disconnect();
		observer4.disconnect();
		observer5.disconnect();
		observer6.disconnect();
		observer7.disconnect();
		observer8.disconnect();
		observer9.disconnect();
		tapLabel.text = 'Gestures detection disabled';
		tapLabel.automationText = 'Gestures detection disabled';
		doubleTapLabel.text = 'Gestures detection disabled';
		doubleTapLabel.automationText = 'Gestures detection disabled';
		longPressLabel.text = 'Gestures detection disabled';
		longPressLabel.automationText = 'Gestures detection disabled';
		swipeLabel.text = 'Gestures detection disabled';
		swipeLabel.automationText = 'Gestures detection disabled';
		panLabel.text = 'Gestures detection disabled';
		panLabel.automationText = 'Gestures detection disabled';
		pinchLabel.text = 'Gestures detection disabled';
		pinchLabel.automationText = 'Gestures detection disabled';
		rotationLabel.text = 'Gestures detection disabled';
		rotationLabel.automationText = 'Gestures detection disabled';
		tapAndDoubleTapLabel.text = 'Gestures detection disabled';
		tapAndDoubleTapLabel.automationText = 'Gestures detection disabled';
	});

	tapLabel.on(GestureTypes[GestureTypes.tap], function (args: GestureEventData) {
		tapLabel.text = 'Tap gesture detected, ' + (args.object === tapLabel);
	});

	const observer1 = tapLabel.getGestureObservers(GestureTypes.tap)[0];

	doubleTapLabel.on(GestureTypes[GestureTypes.doubleTap], function (args: GestureEventData) {
		doubleTapLabel.text = 'Double Tap gesture detected, ' + (args.object === doubleTapLabel);
	});

	const observer2 = doubleTapLabel.getGestureObservers(GestureTypes.doubleTap)[0];

	longPressLabel.on(GestureTypes[GestureTypes.longPress], function (args: GestureEventData) {
		longPressLabel.text = 'Long Press gesture detected, ' + (args.object === longPressLabel);
	});

	const observer3 = longPressLabel.getGestureObservers(GestureTypes.longPress)[0];

	swipeLabel.on(GestureTypes[GestureTypes.swipe], function (args: SwipeGestureEventData) {
		swipeLabel.text = 'Swipe Direction: ' + args.direction + ', ' + (args.object === swipeLabel); // + getStateAsString(args.state);
	});

	const observer4 = swipeLabel.getGestureObservers(GestureTypes.swipe)[0];

	panLabel.on(GestureTypes[GestureTypes.pan], function (args: PanGestureEventData) {
		panLabel.text = 'Pan deltaX:' + Math.round(args.deltaX) + '; deltaY:' + Math.round(args.deltaY) + ';' + ', ' + (args.object === panLabel) + getStateAsString(args.state);
	});

	const observer5 = panLabel.getGestureObservers(GestureTypes.pan)[0];

	pinchLabel.on(GestureTypes[GestureTypes.pinch], function (args: PinchGestureEventData) {
		pinchLabel.text = 'Pinch Scale: ' + Math.round(args.scale) + ', ' + (args.object === pinchLabel) + getStateAsString(args.state);
	});

	const observer6 = pinchLabel.getGestureObservers(GestureTypes.pinch)[0];

	rotationLabel.on(GestureTypes[GestureTypes.rotation], function (args: RotationGestureEventData) {
		rotationLabel.text = 'Rotation: ' + Math.round(args.rotation) + ', ' + (args.object === rotationLabel) + getStateAsString(args.state);
	});

	const observer7 = rotationLabel.getGestureObservers(GestureTypes.rotation)[0];

	tapAndDoubleTapLabel.on(GestureTypes[GestureTypes.doubleTap], function (args: GestureEventData) {
		tapAndDoubleTapLabel.text = 'Last action: Double tap gesture, ' + (args.object === tapAndDoubleTapLabel);
	});

	const observer8 = tapAndDoubleTapLabel.getGestureObservers(GestureTypes.doubleTap)[0];

	tapAndDoubleTapLabel.on(GestureTypes[GestureTypes.tap], function (args: GestureEventData) {
		tapAndDoubleTapLabel.text = 'Last action: Tap gesture, ' + (args.object === tapAndDoubleTapLabel);
	});

	const observer9 = tapAndDoubleTapLabel.getGestureObservers(GestureTypes.tap)[0];

	const page = new Page();
	page.content = stack;

	return page;
}

function getStateAsString(state: GestureStateTypes): string {
	const states = new Array<string>();
	if (state === GestureStateTypes.began) {
		states.length = 0;
		states.push('began');
	} else if (state === GestureStateTypes.cancelled) {
		states.push('cancelled');
	} else if (state === GestureStateTypes.changed) {
		if (states.indexOf('changed') === -1) {
			states.push('changed');
		}
	} else if (state === GestureStateTypes.ended) {
		states.push('ended');
	}

	return ', states: ' + states.join(',');
}

function createLabel(text: string, labelHeight: number, shouldWrap = false) {
	const label = new Label();
	label.height = labelHeight;
	label.text = text;
	label.textWrap = shouldWrap;
	label.borderColor = 'green';
	label.borderWidth = 1;

	return label;
}
