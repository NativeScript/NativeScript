import * as application from "application";
import * as trace from "trace";
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle,
    trace.categories.Navigation,
    trace.categories.Transition
    ));

var countResume = 0;
var countSuspend = 0;

application.on("uncaughtError", args => {
    const error = args.error;
    console.warn(error.message);
    if (error.nativeError) {
        console.warn("native error: " + error.nativeError);
    }
});

application.on(application.launchEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android.content.Intent class.
        console.log("### Launched application with: " + args.android + ".");
    } else if (args.ios !== undefined) {
        // For iOS applications, args.ios is NSDictionary (launchOptions).
        console.log("### Launched application with: " + args.ios);
    }
});

application.on(application.suspendEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("#" + ++countSuspend + "# SuspendEvent Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("#" + ++countSuspend + "# SuspendEvent UIApplication: " + args.ios);
    }
});

application.on(application.resumeEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("#" + ++countResume + "# ResumeEvent Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("#" + ++countResume + "# ResumeEvent UIApplication: " + args.ios);
    }
});

application.on(application.exitEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("### ExitEvent Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("### ExitEvent UIApplication: " + args.ios);
    }
});

application.on(application.lowMemoryEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        console.log("### LowMemoryEvent Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("### LowMemoryEvent UIApplication: " + args.ios);
    }
});

application.on(application.uncaughtErrorEvent, function (args: application.UnhandledErrorEventData) {
    if (args.android) {
        // For Android applications, args.android is NativeScriptError.
        console.log("### NativeScriptError: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is NativeScriptError.
        console.log("### NativeScriptError: " + args.ios);
    }
});

application.setCssFileName("ui-tests-app/app.css");
application.start({ moduleName: "ui-tests-app/mainPage" });