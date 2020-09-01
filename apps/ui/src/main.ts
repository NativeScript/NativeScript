console.log('####### ------ APP MODULES START ');

import { Trace, Application, UnhandledErrorEventData, LaunchEventData, ApplicationEventData, DiscardedErrorEventData } from '@nativescript/core';
Trace.addCategories(Trace.categories.NativeLifecycle);
Trace.addCategories(Trace.categories.Navigation);
Trace.addCategories(Trace.categories.Transition);

Trace.enable();

var countResume = 0;
var countSuspend = 0;

Application.on('displayed', (args) => {
	const uptime = global.android ? (<any>org).nativescript.Process.getUpTime : (<any>global).__tns_uptime;
	console.log('Startup time: ' + uptime() + 'ms.');
});

Application.on('uncaughtError', (args) => {
	const error = args.error;
	console.warn(error.message);
	if (error.nativeError) {
		console.warn('native error: ' + error.nativeError);
	}
});

Application.on(Application.launchEvent, function (args: LaunchEventData) {
	if (args.android) {
		// For Android applications, args.android is an android.content.Intent class.
		console.log('### Launched application with: ' + args.android + '.');
	} else if (args.ios !== undefined) {
		// For iOS applications, args.ios is NSDictionary (launchOptions).
		console.log('### Launched application with: ' + args.ios);
	}
});

Application.on(Application.suspendEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an android activity class.
		console.log('#' + ++countSuspend + '# SuspendEvent Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('#' + ++countSuspend + '# SuspendEvent UIApplication: ' + args.ios);
	}
});

Application.on(Application.resumeEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an android activity class.
		console.log('#' + ++countResume + '# ResumeEvent Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('#' + ++countResume + '# ResumeEvent UIApplication: ' + args.ios);
	}
});

Application.on(Application.exitEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an android activity class.
		console.log('### ExitEvent Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('### ExitEvent UIApplication: ' + args.ios);
	}
});

Application.on(Application.lowMemoryEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an android activity class.
		console.log('### LowMemoryEvent Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('### LowMemoryEvent UIApplication: ' + args.ios);
	}
});

Application.on(Application.uncaughtErrorEvent, function (args: UnhandledErrorEventData) {
	console.log('### NativeScriptError: ' + args.error);
	console.log('### nativeException: ' + (<any>args.error).nativeException);
	console.log('### stackTrace: ' + (<any>args.error).stackTrace);
	console.log('### stack: ' + args.error.stack);
});

Application.on(Application.discardedErrorEvent, function (args: DiscardedErrorEventData) {
	console.log('### [Discarded] NativeScriptError: ' + args.error);
	console.log('### [Discarded] nativeException: ' + (<any>args.error).nativeException);
	console.log('### [Discarded] stackTrace: ' + (<any>args.error).stackTrace);
	console.log('### [Discarded] stack: ' + args.error.stack);
});

Application.run({ moduleName: 'app-root' });

// TODO: investigate tab-view -> tabviewcss test crash
// TODO: investigate css -> layouts border overlap failure
