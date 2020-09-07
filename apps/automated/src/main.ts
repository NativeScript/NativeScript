let start;
if (typeof NSDate !== 'undefined') {
	start = NSDate.date();
} else {
	start = java.lang.System.currentTimeMillis();
}

import { Application, ApplicationEventData, UnhandledErrorEventData, DiscardedErrorEventData, AndroidActivityBundleEventData, AndroidActivityEventData, AndroidApplication, AndroidActivityNewIntentEventData, AndroidActivityResultEventData, AndroidActivityBackPressedEventData } from '@nativescript/core';

if (Application.ios) {
	// Observe application notifications.
	Application.ios.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, (notification: NSNotification) => {
		console.log('UIApplicationDidFinishLaunchingNotification: ' + notification);
	});
}

// Common events for both Android and iOS.
Application.on(Application.displayedEvent, function (args: ApplicationEventData) {
	(<any>global).isDisplayedEventFired = true;

	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Displayed Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Displayed UIApplication: ' + args.ios);
	}
});

Application.on(Application.launchEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an android.content.Intent class.
		console.log('Launched Android application with the following intent: ' + args.android + '.');
	} else if (args.ios !== undefined) {
		// For iOS applications, args.ios is NSDictionary (launchOptions).
		console.log('Launched iOS application with options: ' + args.ios);
	}
});

Application.on(Application.suspendEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Suspend Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Suspend UIApplication: ' + args.ios);
	}
});

Application.on(Application.resumeEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Resume Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Resume UIApplication: ' + args.ios);
	}
});

Application.on(Application.exitEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Exit Activity: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Exit UIApplication: ' + args.ios);
	}
});

Application.on(Application.lowMemoryEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Low Memory: ' + args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Low Memory: ' + args.ios);
	}
});

// Error events.
Application.on(Application.uncaughtErrorEvent, function (args: UnhandledErrorEventData) {
	console.log('NativeScriptError: ' + args.error);
	console.log((<any>args.error).nativeException || (<any>args.error).nativeError);
	console.log((<any>args.error).stackTrace || (<any>args.error).stack);
});

Application.on(Application.discardedErrorEvent, function (args: DiscardedErrorEventData) {
	console.log('[Discarded] NativeScriptError: ' + args.error);
	console.log((<any>args.error).nativeException || (<any>args.error).nativeError);
	console.log((<any>args.error).stackTrace || (<any>args.error).stack);
});

// Android activity events.
if (Application.android) {
	Application.android.on(AndroidApplication.activityCreatedEvent, function (args: AndroidActivityBundleEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity + ', Bundle: ' + args.bundle);
	});

	Application.android.on(AndroidApplication.activityDestroyedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
	});

	Application.android.on(AndroidApplication.activityStartedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
	});

	Application.android.on(AndroidApplication.activityPausedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
	});

	Application.android.on(AndroidApplication.activityResumedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
	});

	Application.android.on(AndroidApplication.activityStoppedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
	});

	Application.android.on(AndroidApplication.saveActivityStateEvent, function (args: AndroidActivityBundleEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity + ', Bundle: ' + args.bundle);
	});

	Application.android.on(AndroidApplication.activityResultEvent, function (args: AndroidActivityResultEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity + ', requestCode: ' + args.requestCode + ', resultCode: ' + args.resultCode + ', Intent: ' + args.intent);
	});

	Application.android.on(AndroidApplication.activityBackPressedEvent, function (args: AndroidActivityBackPressedEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity);
		// Set args.cancel = true to cancel back navigation and do something custom.
	});

	Application.android.on(AndroidApplication.activityNewIntentEvent, function (args: AndroidActivityNewIntentEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ' + args.activity + ', Intent: ' + args.intent);
	});
}

let time;
if (typeof NSDate !== 'undefined') {
	time = NSDate.date().timeIntervalSinceDate(start) * 1000;
} else {
	time = java.lang.System.currentTimeMillis() - start;
}

console.log(`TIME TO LOAD APP: ${time} ms`);

Application.run({ moduleName: 'app-root' });
