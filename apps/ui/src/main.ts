/**
 * This code initializes and configures event handling and debugging information for a NativeScript application. It logs various events such as application startup, suspension, resumption, and errors.
 */

// Import necessary modules and categories for debugging
import { Trace, Application, UnhandledErrorEventData, LaunchEventData, ApplicationEventData, DiscardedErrorEventData } from '@nativescript/core';

// Add and enable trace categories for NativeScript debugging
Trace.addCategories(Trace.categories.NativeLifecycle);
Trace.addCategories(Trace.categories.Navigation);
Trace.addCategories(Trace.categories.Transition);
Trace.enable();

// Initialize counters for suspend and resume events
let countResume = 0;
let countSuspend = 0;

// Log the application's startup time
Application.on('displayed', (args) => {
    const uptime = global.android ? (<any>org).nativescript.Process.getUpTime : global.__tns_uptime;
    console.log('Startup time: ' + uptime() + 'ms.');
});

// Handle uncaught errors and log them
Application.on('uncaughtError', (args) => {
    const error = args.error;
    console.warn(error.message);
    if (error.nativeException) {
        console.warn('native error: ' + error.nativeException);
    }
});

// Handle the application launch event
Application.on(Application.launchEvent, function (args: LaunchEventData) {
    if (args.android) {
        console.log('### Launched application with: ' + args.android + '.');
    } else if (args.ios !== undefined) {
        console.log('### Launched application with: ' + args.ios);
    }
});

// Handle the application suspension event
Application.on(Application.suspendEvent, function (args: ApplicationEventData) {
    if (args.android) {
        console.log('#' + ++countSuspend + '# SuspendEvent Activity: ' + args.android);
    } else if (args.ios) {
        console.log('#' + ++countSuspend + '# SuspendEvent UIApplication: ' + args.ios);
    }
});

// Handle the application resume event
Application.on(Application.resumeEvent, function (args: ApplicationEventData) {
    if (args.android) {
        console.log('#' + ++countResume + '# ResumeEvent Activity: ' + args.android);
    } else if (args.ios) {
        console.log('#' + ++countResume + '# ResumeEvent UIApplication: ' + args.ios);
    }
});

// Handle the application exit event
Application.on(Application.exitEvent, function (args: ApplicationEventData) {
    if (args.android) {
        console.log('### ExitEvent Activity: ' + args.android);
    } else if (args.ios) {
        console.log('### ExitEvent UIApplication: ' + args.ios);
    }
});

// Handle low memory events
Application.on(Application.lowMemoryEvent, function (args: ApplicationEventData) {
    if (args.android) {
        console.log('### LowMemoryEvent Activity: ' + args.android);
    } else if (args.ios) {
        console.log('### LowMemoryEvent UIApplication: ' + args.ios);
    }
});

// Handle unhandled errors
Application.on(Application.uncaughtErrorEvent, function (args: UnhandledErrorEventData) {
    console.log('### NativeScriptError: ' + args.error);
    console.log('### nativeException: ' + (<any>args.error).nativeException);
    console.log('### stackTrace: ' + (<any>args.error).stackTrace);
    console.log('### stack: ' + args.error.stack);
});

// Handle discarded errors
Application.on(Application.discardedErrorEvent, function (args: DiscardedErrorEventData) {
    console.log('### [Discarded] NativeScriptError: ' + args.error);
    console.log('### [Discarded] nativeException: ' + (<any>args.error).nativeException);
    console.log('### [Discarded] stackTrace: ' + (<any>args.error).stackTrace);
    console.log('### [Discarded] stack: ' + args.error.stack);
});

// Run the application with the specified module
Application.run({ moduleName: 'app-root' });

// TODO: Investigate tab-view -> tabviewcss test crash
// TODO: Investigate CSS -> layouts border overlap failure
