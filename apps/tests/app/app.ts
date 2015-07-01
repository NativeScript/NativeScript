import application = require("application");
application.mainModule = "app/mainPage";

// Common events for both Android and iOS.
application.on(application.launchEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android.content.Intent class.
        console.log("Launched Android application with the following intent: " + args.android + ".");
    } else if (args.ios !== undefined) {
        // For iOS applications, args.ios is NSDictionary (launchOptions).
        console.log("Launched iOS application with options: " + args.ios);
    }
});

application.on(application.suspendEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("UIApplication: " + args.ios);
    }
});

application.on(application.resumeEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("UIApplication: " + args.ios);
    }
});

application.on(application.exitEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("UIApplication: " + args.ios);
    }
});

application.on(application.lowMemoryEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("UIApplication: " + args.ios);
    }
});

application.on(application.uncaughtErrorEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an NativeScriptError.
        console.log("NativeScriptError: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is NativeScriptError.
        console.log("NativeScriptError: " + args.ios);
    }
});

// Android activity events
application.on(application.androidActivityCreatedEvent, function (args: application.AndroidActivityBundleEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity + ", Bundle: " + args.bundle);
});

application.on(application.androidActivityDestroyedEvent, function (args: application.AndroidActivityEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity);
});

application.on(application.androidActivityPausedEvent, function (args: application.AndroidActivityEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity);
});

application.on(application.androidActivityResultEvent, function (args: application.AndroidActivityResultEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity +
        ", requestCode: " + args.requestCode + ", resultCode: " + args.resultCode + ", Intent: " + args.intent);
});

application.on(application.androidActivityResumedEvent, function (args: application.AndroidActivityEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity);
});

application.on(application.androidActivityStartedEvent, function (args: application.AndroidActivityEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity);
});

application.on(application.androidActivityStoppedEvent, function (args: application.AndroidActivityEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity);
});

application.on(application.androidSaveActivityStateEvent, function (args: application.AndroidActivityBundleEventData) {
    console.log("Event: " + args.eventName + ", Activity: " + args.activity + ", Bundle: " + args.bundle);
});


application.start();
