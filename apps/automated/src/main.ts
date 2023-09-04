let start;
if (typeof NSDate !== 'undefined') {
	start = NSDate.date();
} else {
	start = java.lang.System.currentTimeMillis();
}

import { AndroidActivityBackPressedEventData, AndroidActivityBundleEventData, AndroidActivityEventData, AndroidActivityNewIntentEventData, AndroidActivityResultEventData, Application, ApplicationEventData, DiscardedErrorEventData, LaunchEventData, UnhandledErrorEventData } from '@nativescript/core';

if (Application.ios) {
	// Observe application notifications.
	Application.ios.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, (notification: NSNotification) => {
		console.log('UIApplicationDidFinishLaunchingNotification:', notification);
	});

	// Make sure we can add multiple handlers for the same event.
	for (let i = 0; i < 10; i++) {
		Application.ios.addDelegateHandler('applicationDidBecomeActive', (application: UIApplication) => {
			console.log('applicationDidBecomeActive', i, application);
		});
	}
}

// Common events for both Android and iOS.
Application.on(Application.displayedEvent, function (args: ApplicationEventData) {
	global.isDisplayedEventFired = true;

	if (args.android) {
		// For Android applications, args.activity is an Android activity class.
		console.log('Displayed Activity:', (args as AndroidActivityEventData).activity);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Displayed UIApplication:', args.ios);
	}
});

Application.on(Application.launchEvent, function (args: LaunchEventData) {
	if (args.android) {
		// For Android applications, args.android is an android.content.Intent class.
		console.log('Launched Android application with the following intent:', args.android);
	} else if (args.ios !== undefined) {
		// For iOS applications, args.ios is NSDictionary (launchOptions).
		console.log('Launched iOS application with options:', args.ios);
	}
});

Application.on(Application.suspendEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Suspend Activity:', args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Suspend UIApplication:', args.ios);
	}
});

Application.on(Application.resumeEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Resume Activity:', args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Resume UIApplication:', args.ios);
	}
});

Application.on(Application.exitEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Exit Activity:', args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Exit UIApplication:', args.ios);
	}
});

Application.on(Application.lowMemoryEvent, function (args: ApplicationEventData) {
	if (args.android) {
		// For Android applications, args.android is an Android activity class.
		console.log('Low Memory:', args.android);
	} else if (args.ios) {
		// For iOS applications, args.ios is UIApplication.
		console.log('Low Memory:', args.ios);
	}
});

// Error events.
Application.on(Application.uncaughtErrorEvent, function (args: UnhandledErrorEventData) {
	console.log('NativeScriptError:', args.error);
	console.log(args.error.nativeException ?? (<any>args.error).nativeError);
	console.log(args.error.stackTrace ?? args.error.stack);
});

Application.on(Application.discardedErrorEvent, function (args: DiscardedErrorEventData) {
	console.log('[Discarded] NativeScriptError:', args.error);
	console.log(args.error.nativeException ?? (<any>args.error).nativeError);
	console.log(args.error.stackTrace ?? args.error.stack);
});

// Android activity events.
if (Application.android) {
	Application.android.on(Application.android.activityCreatedEvent, function (args: AndroidActivityBundleEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity, ', Bundle:', args.bundle);
	});

	Application.android.on(Application.android.activityDestroyedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity: ', args.activity);
	});

	Application.android.on(Application.android.activityStartedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity);
	});

	Application.android.on(Application.android.activityPausedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity);
	});

	Application.android.on(Application.android.activityResumedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity);
	});

	Application.android.on(Application.android.activityStoppedEvent, function (args: AndroidActivityEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity);
	});

	Application.android.on(Application.android.saveActivityStateEvent, function (args: AndroidActivityBundleEventData) {
		console.log('Event: ' + args.eventName + ', Activity:', args.activity, ', Bundle:', args.bundle);
	});

	Application.android.on(Application.android.activityResultEvent, function (args: AndroidActivityResultEventData) {
		console.log('Event:', args.eventName, ', Activity:', args.activity, ', requestCode: ', args.requestCode, ', resultCode: ', args.resultCode, ', Intent: ', args.intent);
	});

	Application.android.on(Application.android.activityBackPressedEvent, function (args: AndroidActivityBackPressedEventData) {
		console.log('Event:', args.eventName, ', Activity:', args.activity);
		// Set args.cancel = true to cancel back navigation and do something custom.
	});

	Application.android.on(Application.android.activityNewIntentEvent, function (args: AndroidActivityNewIntentEventData) {
		console.log('Event: ', args.eventName, ', Activity:', args.activity, ', Intent:', args.intent);
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
