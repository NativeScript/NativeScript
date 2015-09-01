import labelModule = require("ui/label");
import gestures = require("ui/gestures");
import button = require("ui/button");
import pages = require("ui/page");
import deviceProperties = require("platform");
import stackLayoutModule = require("ui/layouts/stack-layout");

export function createPage() {

    var stack = new stackLayoutModule.StackLayout();
    var labelHeight = Math.round(deviceProperties.screen.mainScreen.heightPixels / (7 * deviceProperties.screen.mainScreen.scale));
    var stopButton = new button.Button();
    stopButton.text = "Stop Detecting Gestures";
    stack.addChild(stopButton);

    var tapLabel = new labelModule.Label();
    tapLabel.text = "Tap here";
    stack.addChild(tapLabel);

    var doubletapLabel = new labelModule.Label();
    doubletapLabel.text = "Double Tap here";
    stack.addChild(doubletapLabel);

    var longpressLabel = new labelModule.Label();
    longpressLabel.text = "Long Press here";
    stack.addChild(longpressLabel);

    var swipeLabel = new labelModule.Label();
    swipeLabel.height = labelHeight;
    swipeLabel.text = "Swipe here";
    stack.addChild(swipeLabel);

    var panLabel = new labelModule.Label();
    panLabel.height = labelHeight;
    panLabel.text = "Pan here";
    stack.addChild(panLabel);

    var pinchLabel = new labelModule.Label();
    pinchLabel.height = labelHeight;
    pinchLabel.text = "Pinch here";
    stack.addChild(pinchLabel);

    var rotaionLabel = new labelModule.Label();
    rotaionLabel.height = labelHeight;
    rotaionLabel.text = "Rotate here";
    stack.addChild(rotaionLabel);

    stopButton.on(button.Button.tapEvent, function () {
        observer1.disconnect();
        observer2.disconnect();
        observer3.disconnect();
        observer4.disconnect();
        observer5.disconnect();
        observer6.disconnect();
        observer7.disconnect();
        tapLabel.text = "Gestures detection disabled";
        doubletapLabel.text = "Gestures detection disabled";
        longpressLabel.text = "Gestures detection disabled";
        swipeLabel.text = "Gesturesd detection disabled";
        panLabel.text = "Gestures detection disabled";
        pinchLabel.text = "Gestures detection disabled";
        rotaionLabel.text = "Gestures detection disabled";
    });

    tapLabel.on(gestures.GestureTypes.tap, function (args: gestures.GestureEventData) {
        tapLabel.text = "Tap gesture detected";
    });

    var observer1 = tapLabel.getGestureObservers(gestures.GestureTypes.tap)[0];

    doubletapLabel.on(gestures.GestureTypes.doubleTap, function (args: gestures.GestureEventData) {
        doubletapLabel.text = "Double Tap gesture detected";
    });

    var observer2 = doubletapLabel.getGestureObservers(gestures.GestureTypes.doubleTap)[0];

    longpressLabel.on(gestures.GestureTypes.longPress, function (args: gestures.GestureEventData) {
        longpressLabel.text = "Long Press gesture detected";
    });

    var observer3 = longpressLabel.getGestureObservers(gestures.GestureTypes.longPress)[0];

    swipeLabel.on(gestures.GestureTypes.swipe, function (args: gestures.SwipeGestureEventData) {
        swipeLabel.text = "Swipe Direction: " + args.direction;
    });

    var observer4 = swipeLabel.getGestureObservers(gestures.GestureTypes.swipe)[0];

    panLabel.on(gestures.GestureTypes.pan, function (args: gestures.PanGestureEventData) {
        panLabel.text = "Pan deltaX:" + args.deltaX + "; deltaY:" + args.deltaY + ";";
    });

    var observer5 = panLabel.getGestureObservers(gestures.GestureTypes.pan)[0];

    pinchLabel.on(gestures.GestureTypes.pinch, function (args: gestures.PinchGestureEventData) {
        pinchLabel.text = "Pinch Scale: " + args.scale;
    });

    var observer6 = pinchLabel.getGestureObservers(gestures.GestureTypes.pinch)[0];

    rotaionLabel.on(gestures.GestureTypes.rotation, function (args: gestures.RotationGestureEventData) {
        rotaionLabel.text = "Rotation: " + args.rotation;
    });

    var observer7 = rotaionLabel.getGestureObservers(gestures.GestureTypes.rotation)[0];

    var page = new pages.Page();
    page.content = stack;
    return page;
}