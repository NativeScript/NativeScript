import * as ApplicationSettings from '../application-settings';
import { CoreTypes } from '../core-types';
import { profile } from '../profiling';
import type { View } from '../ui/core/view';
import { AndroidActivityCallbacks, NavigationEntry } from '../ui/frame/frame-common';
import { SDK_VERSION } from '../utils/constants';
import { ApplicationCommon } from './application-common';
import type { AndroidActivityBundleEventData, AndroidActivityEventData, AndroidConfigurationChangeEventData, ApplicationEventData } from './application-interfaces';
import { fontScaleChanged } from '../accessibility/font-scale.android';
import { androidGetForegroundActivity, androidGetStartActivity, androidSetForegroundActivity, androidSetStartActivity } from './helpers';
import { getImageFetcher, getNativeApp, getRootView, initImageCache, setApplicationPropertiesCallback, setAppMainEntry, setNativeApp, setRootView, setToggleApplicationEventListenersCallback } from './helpers-common';
import { getNativeScriptGlobals } from '../globals/global-utils';
import type { AndroidApplication as IAndroidApplication } from './application';
import lazy from '../utils/lazy';

declare class NativeScriptLifecycleCallbacks extends android.app.Application.ActivityLifecycleCallbacks {}

let NativeScriptLifecycleCallbacks_: typeof NativeScriptLifecycleCallbacks;
function initNativeScriptLifecycleCallbacks() {
	if (NativeScriptLifecycleCallbacks_) {
		return NativeScriptLifecycleCallbacks_;
	}

	@NativeClass
	@JavaProxy('org.nativescript.NativeScriptLifecycleCallbacks')
	class NativeScriptLifecycleCallbacksImpl extends android.app.Application.ActivityLifecycleCallbacks {
		private activitiesCount: number;
		private nativescriptActivity: androidx.appcompat.app.AppCompatActivity;

		@profile
		public onActivityCreated(activity: androidx.appcompat.app.AppCompatActivity, savedInstanceState: android.os.Bundle): void {
			// console.log('NativeScriptLifecycleCallbacks onActivityCreated');
			this.setThemeOnLaunch(activity);

			if (!Application.android.startActivity) {
				Application.android.setStartActivity(activity);
			}
			if (!Application.android.foregroundActivity) {
				Application.android.setForegroundActivity(activity);
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

			this.activitiesCount = (this.activitiesCount ?? 0) + 1;
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
			let setThemeOnLaunch = ApplicationSettings.getNumber('SET_THEME_ON_LAUNCH', -1);
			if (setThemeOnLaunch === -1) {
				const activityInfo = activity.getPackageManager().getActivityInfo(activity.getComponentName(), android.content.pm.PackageManager.GET_META_DATA);
				if (activityInfo.metaData) {
					setThemeOnLaunch = activityInfo.metaData.getInt('SET_THEME_ON_LAUNCH', -1);
				}
			}
			if (setThemeOnLaunch !== -1) {
				activity.setTheme(setThemeOnLaunch);
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

interface RegisteredReceiverInfo {
	receiver: android.content.BroadcastReceiver;
	intent: string;
	callback: (context: android.content.Context, intent: android.content.Intent) => void;
	id: number;
	flags: number;
}

const BroadcastReceiver = lazy(() => {
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
	return BroadcastReceiverImpl;
});

export class AndroidApplication extends ApplicationCommon {
	static readonly fragmentCreateEvent = 'fragmentCreate';
	static readonly activityCreateEvent = 'activityCreate';
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
	static readonly dialogOnCreateViewEvent = 'dialogOnCreateView';
	static readonly configurationChangeEvent = 'configurationChange';

	readonly fragmentCreateEvent = AndroidApplication.fragmentCreateEvent;
	readonly activityCreateEvent = AndroidApplication.activityCreateEvent;
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
	readonly dialogOnCreateViewEvent = AndroidApplication.activityRequestPermissionsEvent;
	readonly configurationChangeEvent = AndroidApplication.activityRequestPermissionsEvent;

	private _nativeApp: android.app.Application;
	private _context: android.content.Context;
	private _packageName: string;

	// we are using these property to store the callbacks to avoid early GC collection which would trigger MarkReachableObjects
	private lifecycleCallbacks: NativeScriptLifecycleCallbacks;
	private componentCallbacks: NativeScriptComponentCallbacks;

	init(nativeApp: android.app.Application): void {
		if (!nativeApp || this.nativeApp === nativeApp) {
			return;
		}

		if (this.nativeApp) {
			throw new Error('Application.android already initialized.');
		}

		try {
			this._nativeApp = nativeApp;
			setNativeApp(nativeApp);
			this._context = nativeApp.getApplicationContext();
			this._prevConfiguration = new android.content.res.Configuration(this._context.getResources().getConfiguration());
			this._packageName = nativeApp.getPackageName();

			// we store those callbacks and add a function for clearing them later so that the objects will be eligable for GC
			this.lifecycleCallbacks = new (initNativeScriptLifecycleCallbacks())();
			this.nativeApp.registerActivityLifecycleCallbacks(this.lifecycleCallbacks);

			this.componentCallbacks = new (initNativeScriptComponentCallbacks())();
			this.nativeApp.registerComponentCallbacks(this.componentCallbacks);

			this._registerPendingReceivers();
		} catch (err) {
			console.error('Error initializing AndroidApplication', err, err.stack);
		}
	}
	private _registeredReceivers: Record<string, RegisteredReceiverInfo[]> = {};
	private _registeredReceiversById: Record<number, RegisteredReceiverInfo> = {};
	private _nextReceiverId: number = 1;
	private _pendingReceiverRegistrations: Omit<RegisteredReceiverInfo, 'receiver'>[] = [];
	private _registerPendingReceivers() {
		this._pendingReceiverRegistrations.forEach((info) => this._registerReceiver(this.context, info.intent, info.callback, info.flags, info.id));
		this._pendingReceiverRegistrations.length = 0;
	}
	private _prevConfiguration: android.content.res.Configuration;
	onConfigurationChanged(configuration: android.content.res.Configuration): void {
		const diff = configuration.diff(this._prevConfiguration);

		if ((diff & 128) /* ActivityInfo.CONFIG_ORIENTATION */ !== 0) {
			const nativeApp = Application.android.getNativeApplication();
			const screenOrientation = (nativeApp.getSystemService(android.content.Context.WINDOW_SERVICE) as android.view.WindowManager).getDefaultDisplay().getRotation();
			let degrees = 0;
			switch (screenOrientation) {
				case 1 /* android.view.Surface.ROTATION_90 */:
					degrees = 90;
					break;
				case 2 /* android.view.Surface.ROTATION_180 */:
					degrees = 180;
					break;
				case 3 /* android.view.Surface.ROTATION_270 */:
					degrees = 270;
					break;
				default:
					break;
			}
			this.setOrientation(this.getOrientationValue(configuration), degrees);
		}
		if ((diff & 512) /* ActivityInfo.CONFIG_UI_MODE */ !== 0) {
			this.setSystemAppearance(this.getSystemAppearanceValue(configuration));
		}
		if ((diff &  1073741824) /* ActivityInfo.CONFIG_FONT_SCALE */ !== 0) {
			fontScaleChanged(Number(configuration.fontScale));
			
		}
		if ((diff &   8192) /* ActivityInfo.CONFIG_LAYOUT_DIRECTION */ !== 0) {
			this.setLayoutDirection(this.getLayoutDirectionValue(configuration));
		}
		this.notify(<AndroidConfigurationChangeEventData>{ eventName: this.configurationChangeEvent, configuration, diff });
		this._prevConfiguration = new android.content.res.Configuration(configuration);

	}

	getNativeApplication() {
		let nativeApp = this.nativeApp;

		if (nativeApp) {
			return nativeApp;
		}

		nativeApp = getNativeApp<android.app.Application>();

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
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);

		if (!this.nativeApp) {
			const nativeApp = this.getNativeApplication();
			this.init(nativeApp);
		}
	}

	get startActivity() {
		return androidGetStartActivity();
	}

	get foregroundActivity() {
		return androidGetForegroundActivity();
	}

	setStartActivity(value: androidx.appcompat.app.AppCompatActivity) {
		androidSetStartActivity(value);
	}

	setForegroundActivity(value: androidx.appcompat.app.AppCompatActivity) {
		androidSetForegroundActivity(value);
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

	// Possible flags are:
	// RECEIVER_EXPORTED (2)
	// RECEIVER_NOT_EXPORTED (4)
	// RECEIVER_VISIBLE_TO_INSTANT_APPS (1)
	public registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void, flags = 2): () => void {
		const receiverId = this._nextReceiverId++;
		if (this.context) {
			this._registerReceiver(this.context, intentFilter, onReceiveCallback, flags, receiverId);
		} else {
			this._pendingReceiverRegistrations.push({
				intent: intentFilter,
				callback: onReceiveCallback,
				id: receiverId,
				flags,
			});
		}
		let removed = false;
		return () => {
			if (removed) {
				return;
			}
			removed = true;
			if (this._registeredReceiversById[receiverId]) {
				const receiverInfo = this._registeredReceiversById[receiverId];
				this.context.unregisterReceiver(receiverInfo.receiver);
				this._registeredReceivers[receiverInfo.intent] = this._registeredReceivers[receiverInfo.intent]?.filter((ri) => ri.id !== receiverId);
				delete this._registeredReceiversById[receiverId];
			} else {
				this._pendingReceiverRegistrations = this._pendingReceiverRegistrations.filter((ri) => ri.id !== receiverId);
			}
		};
	}
	private _registerReceiver(context: android.content.Context, intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void, flags: number, id: number): android.content.BroadcastReceiver {
		const receiver: android.content.BroadcastReceiver = new (BroadcastReceiver())(onReceiveCallback);
		if (SDK_VERSION >= 26) {
			context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter), flags);
		} else {
			context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter));
		}
		const receiverInfo: RegisteredReceiverInfo = { receiver, intent: intentFilter, callback: onReceiveCallback, id: typeof id === 'number' ? id : this._nextReceiverId++, flags };
		this._registeredReceivers[intentFilter] ??= [];
		this._registeredReceivers[intentFilter].push(receiverInfo);
		this._registeredReceiversById[receiverInfo.id] = receiverInfo;
		return receiver;
	}

	public unregisterBroadcastReceiver(intentFilter: string): void {
		const receivers = this._registeredReceivers[intentFilter];
		if (receivers) {
			receivers.forEach((receiver) => {
				this.context.unregisterReceiver(receiver.receiver);
			});
			this._registeredReceivers[intentFilter] = [];
		}
	}

	public getRegisteredBroadcastReceiver(intentFilter: string): android.content.BroadcastReceiver | undefined {
		return this._registeredReceivers[intentFilter]?.[0].receiver;
	}

	public getRegisteredBroadcastReceivers(intentFilter: string): android.content.BroadcastReceiver[] {
		const receiversInfo = this._registeredReceivers[intentFilter];
		if (receiversInfo) {
			return receiversInfo.map((info) => info.receiver);
		}
		return [];
	}
	getRootView(): View {
		const activity = this.startActivity;
		if (!activity) {
			return undefined;
		}
		const callbacks: AndroidActivityCallbacks = activity['_callbacks'];

		setRootView(callbacks ? callbacks.getRootView() : undefined);
		return getRootView();
	}

	resetRootView(entry?: NavigationEntry | string): void {
		super.resetRootView(entry);

		const activity = this.startActivity;
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

	getLayoutDirection(): CoreTypes.LayoutDirectionType {
		const resources = this.context.getResources();
		const configuration = resources.getConfiguration();
		return this.getLayoutDirectionValue(configuration);
	}

	private getLayoutDirectionValue(configuration: android.content.res.Configuration): CoreTypes.LayoutDirectionType {
		const layoutDirection = configuration.getLayoutDirection();

		switch (layoutDirection) {
			case android.view.View.LAYOUT_DIRECTION_LTR:
				return CoreTypes.LayoutDirection.ltr;
			case android.view.View.LAYOUT_DIRECTION_RTL:
				return CoreTypes.LayoutDirection.rtl;
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


const applicationEvents: string[] = [Application.orientationChangedEvent, Application.systemAppearanceChangedEvent];
function toggleApplicationEventListeners(toAdd: boolean, callback: (args: ApplicationEventData) => void) {
	for (const eventName of applicationEvents) {
		if (toAdd) {
			Application.on(eventName, callback);
		} else {
			Application.off(eventName, callback);
		}
	}
}
setToggleApplicationEventListenersCallback(toggleApplicationEventListeners);

setApplicationPropertiesCallback(() => {
	return {
		orientation: Application.orientation(),
		systemAppearance: Application.systemAppearance(),
	};
});

function onLiveSync(args): void {
	if (getImageFetcher()) {
		getImageFetcher().clearCache();
	}
}

getNativeScriptGlobals().events.on('livesync', onLiveSync);

getNativeScriptGlobals().addEventWiring(() => {
	Application.android.on('activityStarted', (args: any) => {
		if (!getImageFetcher()) {
			initImageCache(args.activity);
		} else {
			getImageFetcher().initCache();
		}
	});
});

getNativeScriptGlobals().addEventWiring(() => {
	Application.android.on('activityStopped', (args) => {
		if (getImageFetcher()) {
			getImageFetcher().closeCache();
		}
	});
});
