import * as labelModule from "tns-core-modules/ui/label";
import * as gestures from "tns-core-modules/ui/gestures";
import * as button from "tns-core-modules/ui/button";
import * as pages from "tns-core-modules/ui/page";
import * as deviceProperties from "tns-core-modules/platform";
import * as stackLayoutModule from "tns-core-modules/ui/layouts/stack-layout";

export function createPage() {

    const stack = new stackLayoutModule.StackLayout();
    const labelHeight = Math.round(deviceProperties.screen.mainScreen.heightPixels / (7 * deviceProperties.screen.mainScreen.scale));
    const stopButton = new button.Button();
    stopButton.text = "Stop Detecting Gestures";
    stack.addChild(stopButton);

    const tapLabel = new labelModule.Label();
    tapLabel.text = "Tap here";
    stack.addChild(tapLabel);

    const doubletapLabel = new labelModule.Label();
    doubletapLabel.text = "Double Tap here";
    stack.addChild(doubletapLabel);

    const longpressLabel = new labelModule.Label();
    longpressLabel.text = "Long Press here";
    stack.addChild(longpressLabel);

    const tapAndDoubleTapLabel = new labelModule.Label();
    tapAndDoubleTapLabel.height = labelHeight;
    tapAndDoubleTapLabel.text = "Tap or Double Tap";
    tapAndDoubleTapLabel.textWrap = true;
    stack.addChild(tapAndDoubleTapLabel);

    const swipeLabel = new labelModule.Label();
    swipeLabel.height = labelHeight;
    swipeLabel.text = "Swipe here";
    swipeLabel.textWrap = true;
    stack.addChild(swipeLabel);

    const panLabel = new labelModule.Label();
    panLabel.height = labelHeight;
    panLabel.text = "Pan here";
    panLabel.textWrap = true;
    stack.addChild(panLabel);

    const pinchLabel = new labelModule.Label();
    pinchLabel.height = labelHeight;
    pinchLabel.text = "Pinch here";
    pinchLabel.textWrap = true;
    stack.addChild(pinchLabel);

    const rotaionLabel = new labelModule.Label();
    rotaionLabel.height = labelHeight;
    rotaionLabel.text = "Rotate here";
    rotaionLabel.textWrap = true;
    stack.addChild(rotaionLabel);

    stopButton.on(button.Button.tapEvent, function () {
        observer1.disconnect();
        observer2.disconnect();
        observer3.disconnect();
        observer4.disconnect();
        observer5.disconnect();
        observer6.disconnect();
        observer7.disconnect();
        observer8.disconnect();
        observer9.disconnect();
        tapLabel.text = "Gestures detection disabled";
        doubletapLabel.text = "Gestures detection disabled";
        longpressLabel.text = "Gestures detection disabled";
        swipeLabel.text = "Gesturesd detection disabled";
        panLabel.text = "Gestures detection disabled";
        pinchLabel.text = "Gestures detection disabled";
        rotaionLabel.text = "Gestures detection disabled";
        tapAndDoubleTapLabel.text = "Gestures detection disabled";
    });

    tapLabel.on(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        tapLabel.text = "Tap gesture detected, " + (args.object === tapLabel);
    });

    const observer1 = tapLabel.getGestureObservers(gestures.GestureTypes.tap)[0];

    doubletapLabel.on(gestures.GestureTypes.doubleTap, function (args: gestures.GestureEventData) {
        doubletapLabel.text = "Double Tap gesture detected, " + (args.object === doubletapLabel);
    });

    const observer2 = doubletapLabel.getGestureObservers(gestures.GestureTypes.doubleTap)[0];

    longpressLabel.on(gestures.GestureTypes.longPress, function (args: gestures.GestureEventData) {
        longpressLabel.text = "Long Press gesture detected, " + (args.object === longpressLabel);
    });

    const observer3 = longpressLabel.getGestureObservers(gestures.GestureTypes.longPress)[0];

    swipeLabel.on(gestures.GestureTypes.swipe, function (args: gestures.SwipeGestureEventData) {
        swipeLabel.text = "Swipe Direction: " + args.direction + ", " + (args.object === swipeLabel); // + getStateAsString(args.state);
    });

    const observer4 = swipeLabel.getGestureObservers(gestures.GestureTypes.swipe)[0];

    panLabel.on(gestures.GestureTypes.pan, function (args: gestures.PanGestureEventData) {
        panLabel.text = "Pan deltaX:" + Math.round(args.deltaX) + "; deltaY:" + Math.round(args.deltaY) + ";" + ", " + (args.object === panLabel) + getStateAsString(args.state);
    });

    const observer5 = panLabel.getGestureObservers(gestures.GestureTypes.pan)[0];

    pinchLabel.on(gestures.GestureTypes.pinch, function (args: gestures.PinchGestureEventData) {
        pinchLabel.text = "Pinch Scale: " + Math.round(args.scale) + ", " + (args.object === pinchLabel) + getStateAsString(args.state);
    });

    const observer6 = pinchLabel.getGestureObservers(gestures.GestureTypes.pinch)[0];

    rotaionLabel.on(gestures.GestureTypes.rotation, function (args: gestures.RotationGestureEventData) {
        rotaionLabel.text = "Rotation: " + Math.round(args.rotation) + ", " + (args.object === rotaionLabel) + getStateAsString(args.state);
    });

    const observer7 = rotaionLabel.getGestureObservers(gestures.GestureTypes.rotation)[0];

    tapAndDoubleTapLabel.on(gestures.GestureTypes.doubleTap, function (args: gestures.GestureEventData) {
        tapAndDoubleTapLabel.text = "Last action: Double tap gesture, "  + (args.object === tapAndDoubleTapLabel);
    });

    const observer8 = tapAndDoubleTapLabel.getGestureObservers(gestures.GestureTypes.doubleTap)[0];

    tapAndDoubleTapLabel.on(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        tapAndDoubleTapLabel.text = "Last action: Tap gesture, "  + (args.object === tapAndDoubleTapLabel);
    });

    const observer9 = tapAndDoubleTapLabel.getGestureObservers(gestures.GestureTypes.tap)[0];

    const page = new pages.Page();
    page.content = stack;
    return page;
}

const states = new Array<string>();
function getStateAsString(state: gestures.GestureStateTypes): string {
    if (state === gestures.GestureStateTypes.began) {
        states.length = 0;
        states.push("began");
    } else if (state === gestures.GestureStateTypes.cancelled) {
        states.push("cancelled");
    } else if (state === gestures.GestureStateTypes.changed) {
        if (states.indexOf("changed") === -1) {
            states.push("changed");
        }
    } else if (state === gestures.GestureStateTypes.ended) {
        states.push("ended");
    }

    return ", states: " + states.join(",");
}
