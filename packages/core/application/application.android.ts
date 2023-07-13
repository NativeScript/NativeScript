import { profile } from '../profiling';
import { View } from '../ui';
import { AndroidActivityCallbacks, NavigationEntry } from '../ui/frame/frame-common';
import type { AndroidApplication as IAndroidApplication } from './application';
import { ApplicationCommon } from './application-common';
import type { AndroidActivityBundleEventData, AndroidActivityEventData, ApplicationEventData } from './application-interfaces';

declare namespace com {
	namespace tns {
		class NativeScriptApplication extends android.app.Application {
			static getInstance(): NativeScriptApplication;
		}
	}
}

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

declare class NativeScriptLifecycleCallbacks extends android.app.Application.ActivityLifecycleCallbacks {}

let NativeScriptLifecycleCallbacks_: typeof NativeScriptLifecycleCallbacks;
function initNativeScriptLifecycleCallbacks() {
	if (NativeScriptLifecycleCallbacks_) {
		return NativeScriptLifecycleCallbacks_;
	}

	@NativeClass
	@JavaProxy('org.nativescript.NativeScriptLifecycleCallbacks')
	class NativeScriptLifecycleCallbacksImpl extends android.app.Application.ActivityLifecycleCallbacks {
		private activitiesCount: number = 0;
		private nativescriptActivity: androidx.appcompat.app.AppCompatActivity;

		@profile
		public onActivityCreated(activity: androidx.appcompat.app.AppCompatActivity, savedInstanceState: android.os.Bundle): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityCreated');
			this.setThemeOnLaunch(activity);

			if (!Application.android.startActivity) {
				Application.android.setStartActivity(activity);
			}

			if (!this.nativescriptActivity && 'isNativeScriptActivity' in activity) {
				this.nativescriptActivity = activity;
			}

			this.notifyActivityCreated(activity, savedInstanceState);

			if (Application.hasListeners(Application.displayedEvent)) {
				this.subscribeForGlobalLayout(activity);
			}
		}

		@profile
		public onActivityDestroyed(activity: androidx.appcompat.app.AppCompatActivity): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityDestroyed');
			if (activity === Application.android.foregroundActivity) {
				Application.android.setForegroundActivity(undefined);
			}

			if (activity === this.nativescriptActivity) {
				this.nativescriptActivity = undefined;
			}

			if (activity === Application.android.startActivity) {
				Application.android.setStartActivity(undefined);

				// Fallback for start activity when it is destroyed but we have a known nativescript activity
				if (this.nativescriptActivity) {
					Application.android.setStartActivity(this.nativescriptActivity);
				}
			}

			Application.android.notify({
				eventName: Application.android.activityDestroyedEvent,
				object: Application.android,
				activity,
			} as AndroidActivityEventData);

			// TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
			gc();
		}

		@profile
		public onActivityPaused(activity: androidx.appcompat.app.AppCompatActivity): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityPaused');
			if ('isNativeScriptActivity' in activity) {
				Application.setSuspended(true, {
					// todo: deprecate event.android in favor of event.activity
					android: activity,
					activity,
				});
			}

			Application.android.notify({
				eventName: Application.android.activityPausedEvent,
				object: Application.android,
				activity,
			} as AndroidActivityEventData);
		}

		@profile
		public onActivityResumed(activity: androidx.appcompat.app.AppCompatActivity): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityResumed');
			Application.android.setForegroundActivity(activity);

			// NOTE: setSuspended(false) is called in frame/index.android.ts inside onPostResume
			// This is done to ensure proper timing for the event to be raised

			Application.android.notify({
				eventName: Application.android.activityResumedEvent,
				object: Application.android,
				activity,
			} as AndroidActivityEventData);
		}

		@profile
		public onActivitySaveInstanceState(activity: androidx.appcompat.app.AppCompatActivity, bundle: android.os.Bundle): void {
			// console.log('NativeScriptLifecycleCallbacks onActivitySaveInstanceState');

			Application.android.notify({
				eventName: Application.android.saveActivityStateEvent,
				object: Application.android,
				activity,
				bundle,
			} as AndroidActivityBundleEventData);
		}

		@profile
		public onActivityStarted(activity: androidx.appcompat.app.AppCompatActivity): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityStarted');

			this.activitiesCount++;
			if (this.activitiesCount === 1) {
				Application.android.setInBackground(false, {
					// todo: deprecate event.android in favor of event.activity
					android: activity,
					activity,
				});
			}

			Application.android.notify({
				eventName: Application.android.activityStartedEvent,
				object: Application.android,
				activity,
			} as AndroidActivityEventData);
		}

		@profile
		public onActivityStopped(activity: androidx.appcompat.app.AppCompatActivity): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityStopped');
			this.activitiesCount--;
			if (this.activitiesCount === 0) {
				Application.android.setInBackground(true, {
					// todo: deprecate event.android in favor of event.activity
					android: activity,
					activity,
				});
			}

			Application.android.notify({
				eventName: Application.android.activityStoppedEvent,
				object: Application.android,
				activity,
			} as AndroidActivityEventData);
		}

		@profile
		setThemeOnLaunch(activity: androidx.appcompat.app.AppCompatActivity) {
			// Set app theme after launch screen was used during startup
			const activityInfo = activity.getPackageManager().getActivityInfo(activity.getComponentName(), android.content.pm.PackageManager.GET_META_DATA);
			if (activityInfo.metaData) {
				const setThemeOnLaunch = activityInfo.metaData.getInt('SET_THEME_ON_LAUNCH', -1);
				if (setThemeOnLaunch !== -1) {
					activity.setTheme(setThemeOnLaunch);
				}
			}
		}

		@profile
		notifyActivityCreated(activity: androidx.appcompat.app.AppCompatActivity, bundle: android.os.Bundle) {
			Application.android.notify({
				eventName: Application.android.activityCreatedEvent,
				object: Application.android,
				activity,
				bundle,
			} as AndroidActivityBundleEventData);
		}

		@profile
		subscribeForGlobalLayout(activity: androidx.appcompat.app.AppCompatActivity) {
			const rootView = activity.getWindow().getDecorView().getRootView();
			// store the listener not to trigger GC collection before collecting the method
			global.onGlobalLayoutListener = new android.view.ViewTreeObserver.OnGlobalLayoutListener({
				onGlobalLayout() {
					Application.android.notify({
						eventName: Application.displayedEvent,
						object: Application,
						android: Application.android,
						activity,
					} as AndroidActivityEventData);
					const viewTreeObserver = rootView.getViewTreeObserver();
					viewTreeObserver.removeOnGlobalLayoutListener(global.onGlobalLayoutListener);
				},
			});
			rootView.getViewTreeObserver().addOnGlobalLayoutListener(global.onGlobalLayoutListener);
		}
	}

	NativeScriptLifecycleCallbacks_ = NativeScriptLifecycleCallbacksImpl;
	return NativeScriptLifecycleCallbacks_;
}

declare class NativeScriptComponentCallbacks extends android.content.ComponentCallbacks2 {}

let NativeScriptComponentCallbacks_: typeof NativeScriptComponentCallbacks;
function initNativeScriptComponentCallbacks() {
	if (NativeScriptComponentCallbacks_) {
		return NativeScriptComponentCallbacks_;
	}

	@NativeClass
	@JavaProxy('org.nativescript.NativeScriptComponentCallbacks')
	class NativeScriptComponentCallbacksImpl extends android.content.ComponentCallbacks2 {
		@profile
		public onLowMemory(): void {
			gc();
			java.lang.System.gc();

			Application.notify({
				eventName: Application.lowMemoryEvent,
				object: Application,
				android: this,
			} as ApplicationEventData);
		}

		@profile
		public onTrimMemory(level: number): void {
			// TODO: This is skipped for now, test carefully for OutOfMemory exceptions
		}

		@profile
		public onConfigurationChanged(newConfiguration: android.content.res.Configuration): void {
			Application.android.onConfigurationChanged(newConfiguration);
		}
	}

	NativeScriptComponentCallbacks_ = NativeScriptComponentCallbacksImpl;
	return NativeScriptComponentCallbacks_;
}

export class AndroidApplication extends ApplicationCommon implements IAndroidApplication {
	static readonly activityCreatedEvent = 'activityCreated';
	static readonly activityDestroyedEvent = 'activityDestroyed';
	static readonly activityStartedEvent = 'activityStarted';
	static readonly activityPausedEvent = 'activityPaused';
	static readonly activityResumedEvent = 'activityResumed';
	static readonly activityStoppedEvent = 'activityStopped';
	static readonly saveActivityStateEvent = 'saveActivityState';
	static readonly activityResultEvent = 'activityResult';
	static readonly activityBackPressedEvent = 'activityBackPressed';
	static readonly activityNewIntentEvent = 'activityNewIntent';
	static readonly activityRequestPermissionsEvent = 'activityRequestPermissions';

	readonly activityCreatedEvent = AndroidApplication.activityCreatedEvent;
	readonly activityDestroyedEvent = AndroidApplication.activityDestroyedEvent;
	readonly activityStartedEvent = AndroidApplication.activityStartedEvent;
	readonly activityPausedEvent = AndroidApplication.activityPausedEvent;
	readonly activityResumedEvent = AndroidApplication.activityResumedEvent;
	readonly activityStoppedEvent = AndroidApplication.activityStoppedEvent;
	readonly saveActivityStateEvent = AndroidApplication.saveActivityStateEvent;
	readonly activityResultEvent = AndroidApplication.activityResultEvent;
	readonly activityBackPressedEvent = AndroidApplication.activityBackPressedEvent;
	readonly activityNewIntentEvent = AndroidApplication.activityNewIntentEvent;
	readonly activityRequestPermissionsEvent = AndroidApplication.activityRequestPermissionsEvent;

	private _nativeApp: android.app.Application;
	private _context: android.content.Context;
	private _packageName: string;

	// we are using these property to store the callbacks to avoid early GC collection which would trigger MarkReachableObjects
	private lifecycleCallbacks: NativeScriptLifecycleCallbacks;
	private componentCallbacks: NativeScriptComponentCallbacks;

	init(nativeApp: android.app.Application): void {
		if (this.nativeApp === nativeApp) {
			return;
		}

		if (this.nativeApp) {
			throw new Error('Application.android already initialized.');
		}

		this._nativeApp = nativeApp;
		this._context = nativeApp.getApplicationContext();
		this._packageName = nativeApp.getPackageName();

		// we store those callbacks and add a function for clearing them later so that the objects will be eligable for GC
		this.lifecycleCallbacks = new (initNativeScriptLifecycleCallbacks())();
		this.nativeApp.registerActivityLifecycleCallbacks(this.lifecycleCallbacks);

		this.componentCallbacks = new (initNativeScriptComponentCallbacks())();
		this.nativeApp.registerComponentCallbacks(this.componentCallbacks);

		this._registerPendingReceivers();
	}

	private _registeredReceivers = {};
	private _pendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();
	private _registerPendingReceivers() {
		this._pendingReceiverRegistrations.forEach((func) => func(this.context));
		this._pendingReceiverRegistrations.length = 0;
	}

	onConfigurationChanged(configuration: android.content.res.Configuration): void {
		this.setOrientation(this.getOrientationValue(configuration));
		this.setSystemAppearance(this.getSystemAppearanceValue(configuration));
	}

	getNativeApplication() {
		let nativeApp = this.nativeApp;

		if (nativeApp) {
			return nativeApp;
		}

		// Try getting it from module - check whether application.android.init has been explicitly called
		// check whether the com.tns.NativeScriptApplication type exists
		if (com.tns.NativeScriptApplication) {
			nativeApp = com.tns.NativeScriptApplication.getInstance();
		}

		// the getInstance might return null if com.tns.NativeScriptApplication exists but is not the starting app type
		if (!nativeApp) {
			// TODO: Should we handle the case when a custom application type is provided and the user has not explicitly initialized the application module?
			const clazz = java.lang.Class.forName('android.app.ActivityThread');
			if (clazz) {
				const method = clazz.getMethod('currentApplication', null);
				if (method) {
					nativeApp = method.invoke(null, null);
				}
			}
		}

		// we cannot work without having the app instance
		if (!nativeApp) {
			throw new Error("Failed to retrieve native Android Application object. If you have a custom android.app.Application type implemented make sure that you've called the 'Application.android.init' method.");
		}

		return nativeApp;
	}

	get nativeApp(): android.app.Application {
		return this._nativeApp;
	}

	run(entry?: string | NavigationEntry): void {
		if (this.started) {
			throw new Error('Application is already started.');
		}

		this.started = true;
		this.mainEntry = typeof entry === 'string' ? { moduleName: entry } : entry;

		if (!this.nativeApp) {
			const nativeApp = this.getNativeApplication();
			this.init(nativeApp);
		}
	}

	private _startActivity: androidx.appcompat.app.AppCompatActivity;
	private _foregroundActivity: androidx.appcompat.app.AppCompatActivity;

	get startActivity() {
		return this._startActivity;
	}

	get foregroundActivity() {
		return this._foregroundActivity;
	}

	setStartActivity(value: androidx.appcompat.app.AppCompatActivity) {
		this._startActivity = value;
	}

	setForegroundActivity(value: androidx.appcompat.app.AppCompatActivity) {
		this._foregroundActivity = value;
	}

	get paused(): boolean {
		return this.suspended;
	}

	get backgrounded(): boolean {
		return this.inBackground;
	}

	get context() {
		return this._context;
	}

	get packageName() {
		return this._packageName;
	}

	public registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void): void {
		const registerFunc = (context: android.content.Context) => {
			const receiver: android.content.BroadcastReceiver = new (initBroadcastReceiver())(onReceiveCallback);
			context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter));
			this._registeredReceivers[intentFilter] = receiver;
		};

		if (this.context) {
			registerFunc(this.context);
		} else {
			this._pendingReceiverRegistrations.push(registerFunc);
		}
	}

	public unregisterBroadcastReceiver(intentFilter: string): void {
		const receiver = this._registeredReceivers[intentFilter];
		if (receiver) {
			this.context.unregisterReceiver(receiver);
			this._registeredReceivers[intentFilter] = undefined;
			delete this._registeredReceivers[intentFilter];
		}
	}

	public getRegisteredBroadcastReceiver(intentFilter: string): android.content.BroadcastReceiver | undefined {
		return this._registeredReceivers[intentFilter];
	}

	getRootView(): View {
		const activity = this.foregroundActivity || this.startActivity;
		if (!activity) {
			return undefined;
		}
		const callbacks: AndroidActivityCallbacks = activity['_callbacks'];

		return callbacks ? callbacks.getRootView() : undefined;
	}

	resetRootView(entry?: NavigationEntry | string): void {
		super.resetRootView(entry);

		const activity = this.foregroundActivity || this.startActivity;
		if (!activity) {
			throw new Error('Cannot find android activity.');
		}

		// this.mainEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
		const callbacks: AndroidActivityCallbacks = activity['_callbacks'];
		if (!callbacks) {
			throw new Error('Cannot find android activity callbacks.');
		}
		callbacks.resetActivityContent(activity);
	}

	getSystemAppearance(): 'light' | 'dark' {
		const resources = this.context.getResources();
		const configuration = resources.getConfiguration();
		return this.getSystemAppearanceValue(configuration);
	}

	// https://developer.android.com/guide/topics/ui/look-and-feel/darktheme#configuration_changes
	private getSystemAppearanceValue(configuration: android.content.res.Configuration): 'dark' | 'light' {
		const systemAppearance = configuration.uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK;

		switch (systemAppearance) {
			case android.content.res.Configuration.UI_MODE_NIGHT_YES:
				return 'dark';
			case android.content.res.Configuration.UI_MODE_NIGHT_NO:
			case android.content.res.Configuration.UI_MODE_NIGHT_UNDEFINED:
				return 'light';
		}
	}

	getOrientation() {
		const resources = this.context.getResources();
		const configuration = <android.content.res.Configuration>resources.getConfiguration();
		return this.getOrientationValue(configuration);
	}

	private getOrientationValue(configuration: android.content.res.Configuration): 'portrait' | 'landscape' | 'unknown' {
		const orientation = configuration.orientation;

		switch (orientation) {
			case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
				return 'landscape';
			case android.content.res.Configuration.ORIENTATION_PORTRAIT:
				return 'portrait';
			default:
				return 'unknown';
		}
	}

	get android() {
		// ensures Application.android is defined when running on Android
		return this;
	}
}
export * from './application-common';
export const Application = new AndroidApplication();
export const iOSApplication = undefined;
