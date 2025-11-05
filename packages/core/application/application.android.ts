import { profile } from '../profiling';
import type { View } from '../ui/core/view';
import { AndroidActivityCallbacks, NavigationEntry } from '../ui/frame/frame-common';
import { SDK_VERSION } from '../utils/constants';
import { android as androidUtils } from '../utils';
import { ApplicationCommon, initializeSdkVersionClass } from './application-common';
import type { AndroidActivityBundleEventData, AndroidActivityEventData, ApplicationEventData } from './application-interfaces';
import { Observable } from '../data/observable';
import { Trace } from '../trace';
import {
	CommonA11YServiceEnabledObservable,
	SharedA11YObservable,
	notifyAccessibilityFocusState,
	a11yServiceClasses,
	a11yServiceDisabledClass,
	a11yServiceEnabledClass,
	fontScaleCategoryClasses,
	fontScaleExtraLargeCategoryClass,
	fontScaleExtraSmallCategoryClass,
	fontScaleMediumCategoryClass,
	getCurrentA11YServiceClass,
	getCurrentFontScaleCategory,
	getCurrentFontScaleClass,
	getFontScaleCssClasses,
	setCurrentA11YServiceClass,
	setCurrentFontScaleCategory,
	setCurrentFontScaleClass,
	setFontScaleCssClasses,
	setFontScale,
	getFontScale,
	setInitFontScale,
	getFontScaleCategory,
	setInitAccessibilityCssHelper,
	FontScaleCategory,
	getClosestValidFontScale,
	VALID_FONT_SCALES,
	AccessibilityRole,
	AccessibilityState,
	AndroidAccessibilityEvent,
	isA11yEnabled,
	setA11yEnabled,
} from '../accessibility/accessibility-common';
import { androidGetForegroundActivity, androidGetStartActivity, androidSetForegroundActivity, androidSetStartActivity, applyContentDescription } from './helpers';
import { getImageFetcher, getNativeApp, getRootView, initImageCache, setA11yUpdatePropertiesCallback, setApplicationPropertiesCallback, setAppMainEntry, setNativeApp, setRootView, setToggleApplicationEventListenersCallback } from './helpers-common';
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
		setNativeApp(nativeApp);
		this._context = nativeApp.getApplicationContext();
		this._packageName = nativeApp.getPackageName();

		// we store those callbacks and add a function for clearing them later so that the objects will be eligable for GC
		this.lifecycleCallbacks = new (initNativeScriptLifecycleCallbacks())();
		this.nativeApp.registerActivityLifecycleCallbacks(this.lifecycleCallbacks);

		this.componentCallbacks = new (initNativeScriptComponentCallbacks())();
		this.nativeApp.registerComponentCallbacks(this.componentCallbacks);

		this._registerPendingReceivers();
	}
	private _registeredReceivers: Record<string, RegisteredReceiverInfo[]> = {};
	private _registeredReceiversById: Record<number, RegisteredReceiverInfo> = {};
	private _nextReceiverId: number = 1;
	private _pendingReceiverRegistrations: Omit<RegisteredReceiverInfo, 'receiver'>[] = [];
	private _registerPendingReceivers() {
		this._pendingReceiverRegistrations.forEach((info) => this._registerReceiver(this.context, info.intent, info.callback, info.flags, info.id));
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
		const activity = this.foregroundActivity || this.startActivity;
		if (!activity) {
			return undefined;
		}
		const callbacks: AndroidActivityCallbacks = activity['_callbacks'];

		setRootView(callbacks ? callbacks.getRootView() : undefined);
		return getRootView();
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

function fontScaleChanged(origFontScale: number) {
	const oldValue = getFontScale();
	setFontScale(getClosestValidFontScale(origFontScale));
	const currentFontScale = getFontScale();

	if (oldValue !== currentFontScale) {
		Application.notify({
			eventName: Application.fontScaleChangedEvent,
			object: Application,
			newValue: currentFontScale,
		} as ApplicationEventData);
	}
}

export function getCurrentFontScale(): number {
	setupConfigListener();

	return getFontScale();
}

function useAndroidFontScale() {
	fontScaleChanged(Number(Application.android.context.getResources().getConfiguration().fontScale));
}

let configChangedCallback: android.content.ComponentCallbacks2;
function setupConfigListener() {
	if (configChangedCallback) {
		return;
	}

	Application.off(Application.launchEvent, setupConfigListener);
	const context = Application.android?.context as android.content.Context;
	if (!context) {
		Application.on(Application.launchEvent, setupConfigListener);

		return;
	}

	useAndroidFontScale();

	configChangedCallback = new android.content.ComponentCallbacks2({
		onLowMemory() {
			// Dummy
		},
		onTrimMemory() {
			// Dummy
		},
		onConfigurationChanged(newConfig: android.content.res.Configuration) {
			fontScaleChanged(Number(newConfig.fontScale));
		},
	});

	context.registerComponentCallbacks(configChangedCallback);
	Application.on(Application.resumeEvent, useAndroidFontScale);
}

setInitFontScale(setupConfigListener);

function applyRootCssClass(cssClasses: string[], newCssClass: string): void {
	const rootView = Application.getRootView();
	if (!rootView) {
		return;
	}

	Application.applyCssClass(rootView, cssClasses, newCssClass);

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => Application.applyCssClass(rootModalView, cssClasses, newCssClass));
}

function applyFontScaleToRootViews(): void {
	const rootView = Application.getRootView();
	if (!rootView) {
		return;
	}

	const fontScale = getCurrentFontScale();

	rootView.style.fontScaleInternal = fontScale;

	const rootModalViews = <Array<View>>rootView._getRootModalViews();
	rootModalViews.forEach((rootModalView) => (rootModalView.style.fontScaleInternal = fontScale));
}

export function getAndroidAccessibilityManager(): android.view.accessibility.AccessibilityManager | null {
	const context = getNativeApp<android.app.Application>().getApplicationContext() as android.content.Context;
	if (!context) {
		return null;
	}

	return context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as android.view.accessibility.AccessibilityManager;
}

const accessibilityStateEnabledPropName = 'accessibilityStateEnabled';
const touchExplorationStateEnabledPropName = 'touchExplorationStateEnabled';

class AndroidSharedA11YObservable extends SharedA11YObservable {
	[accessibilityStateEnabledPropName]: boolean;
	[touchExplorationStateEnabledPropName]: boolean;

	// @ts-ignore todo: fix
	get accessibilityServiceEnabled(): boolean {
		return !!this[accessibilityStateEnabledPropName] && !!this[touchExplorationStateEnabledPropName];
	}

	set accessibilityServiceEnabled(v) {
		return;
	}
}

let accessibilityStateChangeListener: android.view.accessibility.AccessibilityManager.AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: android.view.accessibility.AccessibilityManager.TouchExplorationStateChangeListener;
let sharedA11YObservable: AndroidSharedA11YObservable;

function updateAccessibilityState(): void {
	const accessibilityManager = getAndroidAccessibilityManager();
	if (!accessibilityManager) {
		sharedA11YObservable.set(accessibilityStateEnabledPropName, false);
		sharedA11YObservable.set(touchExplorationStateEnabledPropName, false);

		return;
	}

	sharedA11YObservable.set(accessibilityStateEnabledPropName, !!accessibilityManager.isEnabled());
	sharedA11YObservable.set(touchExplorationStateEnabledPropName, !!accessibilityManager.isTouchExplorationEnabled());
}

function ensureStateListener(): SharedA11YObservable {
	if (sharedA11YObservable) {
		return sharedA11YObservable;
	}

	const accessibilityManager = getAndroidAccessibilityManager();
	sharedA11YObservable = new AndroidSharedA11YObservable();

	if (!accessibilityManager) {
		sharedA11YObservable.set(accessibilityStateEnabledPropName, false);
		sharedA11YObservable.set(touchExplorationStateEnabledPropName, false);

		return sharedA11YObservable;
	}

	accessibilityStateChangeListener = new android.view.accessibility.AccessibilityManager.AccessibilityStateChangeListener({
		onAccessibilityStateChanged(enabled) {
			updateAccessibilityState();

			if (Trace.isEnabled()) {
				Trace.write(`AccessibilityStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});
	accessibilityManager.addAccessibilityStateChangeListener(accessibilityStateChangeListener);

	if (SDK_VERSION >= 19) {
		touchExplorationStateChangeListener = new android.view.accessibility.AccessibilityManager.TouchExplorationStateChangeListener({
			onTouchExplorationStateChanged(enabled) {
				updateAccessibilityState();

				if (Trace.isEnabled()) {
					Trace.write(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
				}
			},
		});
		accessibilityManager.addTouchExplorationStateChangeListener(touchExplorationStateChangeListener);
	}

	updateAccessibilityState();

	Application.on(Application.resumeEvent, updateAccessibilityState);
	Application.on(Application.exitEvent, (args: ApplicationEventData) => {
		const activity = args.android as android.app.Activity;
		if (activity && !activity.isFinishing()) {
			return;
		}

		const accessibilityManager = getAndroidAccessibilityManager();
		if (accessibilityManager) {
			if (accessibilityStateChangeListener) {
				accessibilityManager.removeAccessibilityStateChangeListener(accessibilityStateChangeListener);
			}

			if (touchExplorationStateChangeListener) {
				accessibilityManager.removeTouchExplorationStateChangeListener(touchExplorationStateChangeListener);
			}
		}

		accessibilityStateChangeListener = null;
		touchExplorationStateChangeListener = null;

		if (sharedA11YObservable) {
			sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
			sharedA11YObservable = null;
		}

		Application.off(Application.resumeEvent, updateAccessibilityState);
	});

	return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
	constructor() {
		super(ensureStateListener());
	}
}

let accessibilityServiceObservable: AccessibilityServiceEnabledObservable;
export function ensureClasses() {
	if (accessibilityServiceObservable) {
		return;
	}

	setFontScaleCssClasses(new Map(VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`])));

	accessibilityServiceObservable = new AccessibilityServiceEnabledObservable();

	// Initialize SDK version CSS class once
	initializeSdkVersionClass(Application.getRootView());
}

export function updateCurrentHelperClasses(applyRootCssClass: (cssClasses: string[], newCssClass: string) => void): void {
	const fontScale = getFontScale();
	const fontScaleCategory = getFontScaleCategory();
	const fontScaleCssClasses = getFontScaleCssClasses();
	const oldFontScaleClass = getCurrentFontScaleClass();
	if (fontScaleCssClasses.has(fontScale)) {
		setCurrentFontScaleClass(fontScaleCssClasses.get(fontScale));
	} else {
		setCurrentFontScaleClass(fontScaleCssClasses.get(1));
	}

	if (oldFontScaleClass !== getCurrentFontScaleClass()) {
		applyRootCssClass([...fontScaleCssClasses.values()], getCurrentFontScaleClass());
	}

	const oldActiveFontScaleCategory = getCurrentFontScaleCategory();
	switch (fontScaleCategory) {
		case FontScaleCategory.ExtraSmall: {
			setCurrentFontScaleCategory(fontScaleExtraSmallCategoryClass);
			break;
		}
		case FontScaleCategory.Medium: {
			setCurrentFontScaleCategory(fontScaleMediumCategoryClass);
			break;
		}
		case FontScaleCategory.ExtraLarge: {
			setCurrentFontScaleCategory(fontScaleExtraLargeCategoryClass);
			break;
		}
		default: {
			setCurrentFontScaleCategory(fontScaleMediumCategoryClass);
			break;
		}
	}

	if (oldActiveFontScaleCategory !== getCurrentFontScaleCategory()) {
		applyRootCssClass(fontScaleCategoryClasses, getCurrentFontScaleCategory());
	}

	const oldA11YStatusClass = getCurrentA11YServiceClass();
	if (accessibilityServiceObservable.accessibilityServiceEnabled) {
		setCurrentA11YServiceClass(a11yServiceEnabledClass);
	} else {
		setCurrentA11YServiceClass(a11yServiceDisabledClass);
	}

	if (oldA11YStatusClass !== getCurrentA11YServiceClass()) {
		applyRootCssClass(a11yServiceClasses, getCurrentA11YServiceClass());
	}
}

export function initAccessibilityCssHelper(): void {
	ensureClasses();

	Application.on(Application.fontScaleChangedEvent, () => {
		updateCurrentHelperClasses(applyRootCssClass);
		applyFontScaleToRootViews();
	});

	accessibilityServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, () => updateCurrentHelperClasses(applyRootCssClass));
}
setInitAccessibilityCssHelper(initAccessibilityCssHelper);

let clickableRolesMap = new Set<string>();

let lastFocusedView: WeakRef<View>;
function accessibilityEventHelper(view: View, eventType: number) {
	const eventName = accessibilityEventTypeMap.get(eventType);
	if (!isAccessibilityServiceEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: Service not active`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!eventName) {
		Trace.write(`accessibilityEventHelper: unknown eventType: ${eventType}`, Trace.categories.Accessibility, Trace.messageType.error);

		return;
	}

	if (!view) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: no owner: ${eventName}`, Trace.categories.Accessibility);
		}

		return;
	}

	const androidView = view.nativeViewProtected as android.view.View;
	if (!androidView) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: no nativeView`, Trace.categories.Accessibility);
		}

		return;
	}

	switch (eventType) {
		case android.view.accessibility.AccessibilityEvent.TYPE_VIEW_CLICKED: {
			/**
			 * Android API >= 26 handles accessibility tap-events by converting them to TYPE_VIEW_CLICKED
			 * These aren't triggered for custom tap events in NativeScript.
			 */
			if (SDK_VERSION >= 26) {
				// Find all tap gestures and trigger them.
				for (const tapGesture of view.getGestureObservers(1) ?? []) {
					tapGesture.callback({
						android: view.android,
						eventName: 'tap',
						ios: null,
						object: view,
						type: 1,
						view: view,
					});
				}
			}

			return;
		}
		case android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED: {
			const lastView = lastFocusedView?.get();
			if (lastView && view !== lastView) {
				const lastAndroidView = lastView.nativeViewProtected as android.view.View;
				if (lastAndroidView) {
					lastAndroidView.clearFocus();
					lastFocusedView = null;

					notifyAccessibilityFocusState(lastView, false, true);
				}
			}

			lastFocusedView = new WeakRef(view);

			notifyAccessibilityFocusState(view, true, false);

			return;
		}
		case android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED: {
			const lastView = lastFocusedView?.get();
			if (lastView && view === lastView) {
				lastFocusedView = null;
				androidView.clearFocus();
			}

			notifyAccessibilityFocusState(view, false, true);

			return;
		}
	}
}

let TNSAccessibilityDelegate: android.view.View.androidviewViewAccessibilityDelegate;

const androidViewToTNSView = new WeakMap<android.view.View, WeakRef<View>>();

let accessibilityEventMap: Map<AndroidAccessibilityEvent, number>;
let accessibilityEventTypeMap: Map<number, string>;

function ensureNativeClasses() {
	if (TNSAccessibilityDelegate) {
		return;
	}

	// WORKAROUND: Typing refers to android.view.View.androidviewViewAccessibilityDelegate but it is called android.view.View.AccessibilityDelegate at runtime
	const AccessibilityDelegate: typeof android.view.View.androidviewViewAccessibilityDelegate = android.view.View['AccessibilityDelegate'];

	const RoleTypeMap = new Map<AccessibilityRole, string>([
		[AccessibilityRole.Button, android.widget.Button.class.getName()],
		[AccessibilityRole.Search, android.widget.EditText.class.getName()],
		[AccessibilityRole.Image, android.widget.ImageView.class.getName()],
		[AccessibilityRole.ImageButton, android.widget.ImageButton.class.getName()],
		[AccessibilityRole.KeyboardKey, android.inputmethodservice.Keyboard.Key.class.getName()],
		[AccessibilityRole.StaticText, android.widget.TextView.class.getName()],
		[AccessibilityRole.Adjustable, android.widget.SeekBar.class.getName()],
		[AccessibilityRole.Checkbox, android.widget.CheckBox.class.getName()],
		[AccessibilityRole.RadioButton, android.widget.RadioButton.class.getName()],
		[AccessibilityRole.SpinButton, android.widget.Spinner.class.getName()],
		[AccessibilityRole.Switch, android.widget.Switch.class.getName()],
		[AccessibilityRole.ProgressBar, android.widget.ProgressBar.class.getName()],
	]);

	clickableRolesMap = new Set<string>([AccessibilityRole.Button, AccessibilityRole.ImageButton]);

	const ignoreRoleTypesForTrace = new Set([AccessibilityRole.Header, AccessibilityRole.Link, AccessibilityRole.None, AccessibilityRole.Summary]);

	@NativeClass()
	class TNSAccessibilityDelegateImpl extends AccessibilityDelegate {
		constructor() {
			super();

			return global.__native(this);
		}

		private getTnsView(androidView: android.view.View) {
			const view = androidViewToTNSView.get(androidView)?.get();
			if (!view) {
				androidViewToTNSView.delete(androidView);

				return null;
			}

			return view;
		}

		public onInitializeAccessibilityNodeInfo(host: android.view.View, info: android.view.accessibility.AccessibilityNodeInfo) {
			super.onInitializeAccessibilityNodeInfo(host, info);

			const view = this.getTnsView(host);
			if (!view) {
				if (Trace.isEnabled()) {
					Trace.write(`onInitializeAccessibilityNodeInfo ${host} ${info} no tns-view`, Trace.categories.Accessibility);
				}

				return;
			}

			// Set resource id that can be used with test frameworks without polluting the content description.
			const id = host.getTag(androidUtils.resources.getId(`:id/nativescript_accessibility_id`));
			if (id != null) {
				info.setViewIdResourceName(id);
			}

			const accessibilityRole = view.accessibilityRole;
			if (accessibilityRole) {
				const androidClassName = RoleTypeMap.get(accessibilityRole);
				if (androidClassName) {
					const oldClassName = info.getClassName() || (SDK_VERSION >= 28 && host.getAccessibilityClassName()) || null;
					info.setClassName(androidClassName);

					if (Trace.isEnabled()) {
						Trace.write(`${view}.accessibilityRole = "${accessibilityRole}" is mapped to "${androidClassName}" (was ${oldClassName}). ${info.getClassName()}`, Trace.categories.Accessibility);
					}
				} else if (!ignoreRoleTypesForTrace.has(accessibilityRole)) {
					if (Trace.isEnabled()) {
						Trace.write(`${view}.accessibilityRole = "${accessibilityRole}" is unknown`, Trace.categories.Accessibility);
					}
				}

				if (clickableRolesMap.has(accessibilityRole)) {
					if (Trace.isEnabled()) {
						Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set clickable role=${accessibilityRole}`, Trace.categories.Accessibility);
					}

					info.setClickable(true);
				}

				if (SDK_VERSION >= 28) {
					if (accessibilityRole === AccessibilityRole.Header) {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set heading role=${accessibilityRole}`, Trace.categories.Accessibility);
						}

						info.setHeading(true);
					} else if (host.isAccessibilityHeading()) {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set heading from host`, Trace.categories.Accessibility);
						}

						info.setHeading(true);
					} else {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set not heading`, Trace.categories.Accessibility);
						}

						info.setHeading(false);
					}
				}

				switch (accessibilityRole) {
					case AccessibilityRole.Switch:
					case AccessibilityRole.RadioButton:
					case AccessibilityRole.Checkbox: {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set checkable and check=${view.accessibilityState === AccessibilityState.Checked}`, Trace.categories.Accessibility);
						}

						info.setCheckable(true);
						info.setChecked(view.accessibilityState === AccessibilityState.Checked);
						break;
					}
					default: {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set enabled=${view.accessibilityState !== AccessibilityState.Disabled} and selected=${view.accessibilityState === AccessibilityState.Selected}`, Trace.categories.Accessibility);
						}

						info.setEnabled(view.accessibilityState !== AccessibilityState.Disabled);
						info.setSelected(view.accessibilityState === AccessibilityState.Selected);
						break;
					}
				}
			}

			if (view.accessible) {
				info.setFocusable(true);
			}
		}

		public sendAccessibilityEvent(host: android.view.ViewGroup, eventType: number) {
			super.sendAccessibilityEvent(host, eventType);
			const view = this.getTnsView(host);
			if (!view) {
				console.log(`skip - ${host} - ${accessibilityEventTypeMap.get(eventType)}`);

				return;
			}

			try {
				accessibilityEventHelper(view, eventType);
			} catch (err) {
				console.error(err);
			}
		}
	}

	TNSAccessibilityDelegate = new TNSAccessibilityDelegateImpl();

	accessibilityEventMap = new Map<AndroidAccessibilityEvent, number>([
		/**
		 * Invalid selection/focus position.
		 */
		[AndroidAccessibilityEvent.INVALID_POSITION, android.view.accessibility.AccessibilityEvent.INVALID_POSITION],
		/**
		 * Maximum length of the text fields.
		 */
		[AndroidAccessibilityEvent.MAX_TEXT_LENGTH, android.view.accessibility.AccessibilityEvent.MAX_TEXT_LENGTH],
		/**
		 * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
		 */
		[AndroidAccessibilityEvent.VIEW_CLICKED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_CLICKED],
		/**
		 * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
		 */
		[AndroidAccessibilityEvent.VIEW_LONG_CLICKED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_LONG_CLICKED],
		/**
		 * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
		 */
		[AndroidAccessibilityEvent.VIEW_SELECTED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_SELECTED],
		/**
		 * Represents the event of setting input focus of a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_FOCUSED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_FOCUSED],
		/**
		 * Represents the event of changing the text of an android.widget.EditText.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_CHANGED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED],
		/**
		 * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
		 */
		[AndroidAccessibilityEvent.WINDOW_STATE_CHANGED, android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED],
		/**
		 * Represents the event showing a android.app.Notification.
		 */
		[AndroidAccessibilityEvent.NOTIFICATION_STATE_CHANGED, android.view.accessibility.AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED],
		/**
		 * Represents the event of a hover enter over a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_HOVER_ENTER, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_HOVER_ENTER],
		/**
		 * Represents the event of a hover exit over a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_HOVER_EXIT, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_HOVER_EXIT],
		/**
		 * Represents the event of starting a touch exploration gesture.
		 */
		[AndroidAccessibilityEvent.TOUCH_EXPLORATION_GESTURE_START, android.view.accessibility.AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_START],
		/**
		 * Represents the event of ending a touch exploration gesture.
		 */
		[AndroidAccessibilityEvent.TOUCH_EXPLORATION_GESTURE_END, android.view.accessibility.AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_END],
		/**
		 * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
		 */
		[AndroidAccessibilityEvent.WINDOW_CONTENT_CHANGED, android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED],
		/**
		 * Represents the event of scrolling a view.
		 */
		[AndroidAccessibilityEvent.VIEW_SCROLLED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_SCROLLED],
		/**
		 * Represents the event of changing the selection in an android.widget.EditText.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_SELECTION_CHANGED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED],
		/**
		 * Represents the event of an application making an announcement.
		 */
		[AndroidAccessibilityEvent.ANNOUNCEMENT, android.view.accessibility.AccessibilityEvent.TYPE_ANNOUNCEMENT],
		/**
		 * Represents the event of gaining accessibility focus.
		 */
		[AndroidAccessibilityEvent.VIEW_ACCESSIBILITY_FOCUSED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED],
		/**
		 * Represents the event of clearing accessibility focus.
		 */
		[AndroidAccessibilityEvent.VIEW_ACCESSIBILITY_FOCUS_CLEARED, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED],
		/**
		 * Represents the event of traversing the text of a view at a given movement granularity.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY, android.view.accessibility.AccessibilityEvent.TYPE_VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY],
		/**
		 * Represents the event of beginning gesture detection.
		 */
		[AndroidAccessibilityEvent.GESTURE_DETECTION_START, android.view.accessibility.AccessibilityEvent.TYPE_GESTURE_DETECTION_START],
		/**
		 * Represents the event of ending gesture detection.
		 */
		[AndroidAccessibilityEvent.GESTURE_DETECTION_END, android.view.accessibility.AccessibilityEvent.TYPE_GESTURE_DETECTION_END],
		/**
		 * Represents the event of the user starting to touch the screen.
		 */
		[AndroidAccessibilityEvent.TOUCH_INTERACTION_START, android.view.accessibility.AccessibilityEvent.TYPE_TOUCH_INTERACTION_START],
		/**
		 * Represents the event of the user ending to touch the screen.
		 */
		[AndroidAccessibilityEvent.TOUCH_INTERACTION_END, android.view.accessibility.AccessibilityEvent.TYPE_TOUCH_INTERACTION_END],
		/**
		 * Mask for AccessibilityEvent all types.
		 */
		[AndroidAccessibilityEvent.ALL_MASK, android.view.accessibility.AccessibilityEvent.TYPES_ALL_MASK],
	]);

	accessibilityEventTypeMap = new Map([...accessibilityEventMap].map(([k, v]) => [v, k]));
}

function updateAccessibilityServiceState() {
	const accessibilityManager = getAndroidAccessibilityManager();
	if (!accessibilityManager) {
		return;
	}

	setA11yEnabled(!!accessibilityManager.isEnabled() && !!accessibilityManager.isTouchExplorationEnabled());
}

export function isAccessibilityServiceEnabled(): boolean {
	const accessibilityServiceEnabled = isA11yEnabled();
	if (typeof accessibilityServiceEnabled === 'boolean') {
		return accessibilityServiceEnabled;
	}

	const accessibilityManager = getAndroidAccessibilityManager();
	accessibilityStateChangeListener = new androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener({
		onAccessibilityStateChanged(enabled) {
			updateAccessibilityServiceState();

			if (Trace.isEnabled()) {
				Trace.write(`AccessibilityStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	touchExplorationStateChangeListener = new androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener({
		onTouchExplorationStateChanged(enabled) {
			updateAccessibilityServiceState();

			if (Trace.isEnabled()) {
				Trace.write(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	androidx.core.view.accessibility.AccessibilityManagerCompat.addAccessibilityStateChangeListener(accessibilityManager, accessibilityStateChangeListener);
	androidx.core.view.accessibility.AccessibilityManagerCompat.addTouchExplorationStateChangeListener(accessibilityManager, touchExplorationStateChangeListener);

	updateAccessibilityServiceState();

	Application.on(Application.exitEvent, (args: ApplicationEventData) => {
		const activity = args.android as android.app.Activity;
		if (activity && !activity.isFinishing()) {
			return;
		}

		const accessibilityManager = getAndroidAccessibilityManager();
		if (accessibilityManager) {
			if (accessibilityStateChangeListener) {
				androidx.core.view.accessibility.AccessibilityManagerCompat.removeAccessibilityStateChangeListener(accessibilityManager, accessibilityStateChangeListener);
			}

			if (touchExplorationStateChangeListener) {
				androidx.core.view.accessibility.AccessibilityManagerCompat.removeTouchExplorationStateChangeListener(accessibilityManager, touchExplorationStateChangeListener);
			}
		}

		accessibilityStateChangeListener = null;
		touchExplorationStateChangeListener = null;

		Application.off(Application.resumeEvent, updateAccessibilityServiceState);
	});

	Application.on(Application.resumeEvent, updateAccessibilityServiceState);

	return accessibilityServiceEnabled;
}

let updateAccessibilityPropertiesMicroTask;
let pendingViews = new Set<View>();
export function updateAccessibilityProperties(view: View) {
	if (!view.nativeViewProtected) {
		return;
	}

	pendingViews.add(view);
	if (updateAccessibilityPropertiesMicroTask) return;

	updateAccessibilityPropertiesMicroTask = true;
	Promise.resolve().then(() => {
		updateAccessibilityPropertiesMicroTask = false;
		let _pendingViews = Array.from(pendingViews);
		pendingViews = new Set();
		for (const view of _pendingViews) {
			if (!view.nativeViewProtected) continue;
			setAccessibilityDelegate(view);
			applyContentDescription(view);
		}
		_pendingViews = [];
	});
}
setA11yUpdatePropertiesCallback(updateAccessibilityProperties);

export function sendAccessibilityEvent(view: View, eventType: AndroidAccessibilityEvent, text?: string): void {
	if (!isAccessibilityServiceEnabled()) {
		return;
	}

	const cls = `sendAccessibilityEvent(${view}, ${eventType}, ${text})`;

	const androidView = view.nativeViewProtected as android.view.View;
	if (!androidView) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls}: no nativeView`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!eventType) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls}: no eventName provided`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!isAccessibilityServiceEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - TalkBack not enabled`, Trace.categories.Accessibility);
		}

		return;
	}

	const accessibilityManager = getAndroidAccessibilityManager();
	if (!accessibilityManager?.isEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - accessibility service not enabled`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!accessibilityEventMap.has(eventType)) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - unknown event`, Trace.categories.Accessibility);
		}

		return;
	}

	const eventInt = accessibilityEventMap.get(eventType);
	if (!text) {
		return androidView.sendAccessibilityEvent(eventInt);
	}

	const accessibilityEvent = android.view.accessibility.AccessibilityEvent.obtain(eventInt);
	accessibilityEvent.setSource(androidView);

	accessibilityEvent.getText().clear();

	if (!text) {
		applyContentDescription(view);

		text = androidView.getContentDescription() || view['title'];
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - text not provided use androidView.getContentDescription() - ${text}`, Trace.categories.Accessibility);
		}
	}

	if (Trace.isEnabled()) {
		Trace.write(`${cls}: send event with text: '${JSON.stringify(text)}'`, Trace.categories.Accessibility);
	}

	if (text) {
		accessibilityEvent.getText().add(text);
	}

	accessibilityManager.sendAccessibilityEvent(accessibilityEvent);
}

function setAccessibilityDelegate(view: View): void {
	if (!view.nativeViewProtected) {
		return;
	}

	ensureNativeClasses();

	const androidView = view.nativeViewProtected as android.view.View;
	if (!androidView || !androidView.setAccessibilityDelegate) {
		return;
	}

	androidViewToTNSView.set(androidView, new WeakRef(view));

	let hasOldDelegate = false;
	if (typeof androidView.getAccessibilityDelegate === 'function') {
		hasOldDelegate = androidView.getAccessibilityDelegate() === TNSAccessibilityDelegate;
	}

	if (hasOldDelegate) {
		return;
	}

	androidView.setAccessibilityDelegate(TNSAccessibilityDelegate);
}

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
