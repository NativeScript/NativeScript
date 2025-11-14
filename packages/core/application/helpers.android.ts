import { SDK_VERSION } from '../utils/constants';
import { getNativeApp } from './helpers-common';

let _startActivity: androidx.appcompat.app.AppCompatActivity;
let _foregroundActivity: androidx.appcompat.app.AppCompatActivity;

export function androidGetCurrentActivity(): androidx.appcompat.app.AppCompatActivity {
	return _foregroundActivity || _startActivity;
}
export function androidGetForegroundActivity(): androidx.appcompat.app.AppCompatActivity {
	return _foregroundActivity;
}
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void {
	_foregroundActivity = activity;
}
export function androidGetStartActivity(): androidx.appcompat.app.AppCompatActivity {
	return _startActivity;
}
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void {
	_startActivity = activity;
}

let applicationContext: android.content.Context;
export function getApplicationContext(): android.content.Context {
	if (!applicationContext) {
		applicationContext = getNativeApp<android.app.Application>().getApplicationContext();
	}
	return applicationContext;
}

export const androidRegisteredReceivers: { [key: string]: android.content.BroadcastReceiver } = {};
export const androidPendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();

declare class BroadcastReceiver extends android.content.BroadcastReceiver {
	constructor(onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void);
}

let BroadcastReceiver_: typeof BroadcastReceiver;
function initBroadcastReceiver() {
	if (BroadcastReceiver_) {
		return BroadcastReceiver_;
	}

	@NativeClass
	class BroadcastReceiverImpl extends android.content.BroadcastReceiver {
		private _onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void;

		constructor(onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void) {
			super();
			this._onReceiveCallback = onReceiveCallback;

			return global.__native(this);
		}

		public onReceive(context: android.content.Context, intent: android.content.Intent) {
			if (this._onReceiveCallback) {
				this._onReceiveCallback(context, intent);
			}
		}
	}

	BroadcastReceiver_ = BroadcastReceiverImpl;
	return BroadcastReceiver_;
}

export function androidRegisterBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void, flags = 2): void {
	const registerFunc = (context: android.content.Context) => {
		const receiver: android.content.BroadcastReceiver = new (initBroadcastReceiver())(onReceiveCallback);
		if (SDK_VERSION >= 26) {
			context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter), flags);
		} else {
			context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter));
		}
		androidRegisteredReceivers[intentFilter] = receiver;
	};

	if (getApplicationContext()) {
		registerFunc(getApplicationContext());
	} else {
		androidPendingReceiverRegistrations.push(registerFunc);
	}
}

export function androidUnregisterBroadcastReceiver(intentFilter: string): void {
	const receiver = androidRegisteredReceivers[intentFilter];
	if (receiver) {
		getApplicationContext().unregisterReceiver(receiver);
		androidRegisteredReceivers[intentFilter] = undefined;
		delete androidRegisteredReceivers[intentFilter];
	}
}

// stubs
export const iosNotificationObservers: Array<any> = [];
export function iosAddNotificationObserver(notificationName: string, onReceiveCallback: (notification: any) => void) {}
export function iosRemoveNotificationObserver(observer: any, notificationName: string) {}
