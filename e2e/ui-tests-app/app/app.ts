console.log("####### ------ APP MODULES START ");

import * as application from "tns-core-modules/application";
import * as trace from "tns-core-modules/trace";

trace.enable();

var countResume = 0;
var countSuspend = 0;

application.on("displayed", args => {
    const uptime = global.android ? (<any>org).nativescript.Process.getUpTime : (<any>global).__tns_uptime;
    console.log("Startup time: " + uptime() + "ms.");
});

application.on("uncaughtError", args => {
    const error = args.error;
    console.warn(error.message);
    if (error.nativeError) {
        console.warn("native error: " + error.nativeError);
    }
});

application.on(application.launchEvent, function (args: application.LaunchEventData) {
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
    console.log("### NativeScriptError: " + args.error);
    console.log("### nativeException: " + (<any>args.error).nativeException);
    console.log("### stackTrace: " + (<any>args.error).stackTrace);
    console.log("### stack: " + args.error.stack);
});

application.on(application.discardedErrorEvent, function (args: application.DiscardedErrorEventData) {
    console.log("### [Discarded] NativeScriptError: " + args.error);
    console.log("### [Discarded] nativeException: " + (<any>args.error).nativeException);
    console.log("### [Discarded] stackTrace: " + (<any>args.error).stackTrace);
    console.log("### [Discarded] stack: " + args.error.stack);
});

application.setCssFileName("app.css");
application.run({ moduleName: "app-root" });
