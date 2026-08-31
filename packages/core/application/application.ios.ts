import { profile } from '../profiling';
import type { View } from '../ui/core/view';
import { isEmbedded } from '../ui/embedding';
import { IOSHelper } from '../ui/core/view/view-helper';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { getWindow } from '../utils/native-helper';
import { SDK_VERSION } from '../utils/constants';
import { ios as iosUtils, dataSerialize, dataDeserialize } from '../utils/native-helper';
import { ApplicationCommon } from './application-common';
import { ApplicationEventData, SceneContinueUserActivityEventData, SceneEventData, SceneOpenURLContextsEventData, ScenePerformActionForShortcutItemEventData } from './application-interfaces';
import { deliverShortcutItem, forwardContinueUserActivity, forwardOpenURLContexts, oneShotCompletion } from './scene-delegate-bridge';
import { Observable } from '../data/observable';
import type { iOSApplication as IiOSApplication } from './application';
import { Trace } from '../trace';
import { IOSNativeWindow } from '../native-window/native-window.ios';
import { NativeWindow } from '../native-window/native-window-common';
import type { WindowRole } from '../native-window/window-base';
import { NativeWindowEvents } from '../native-window/native-window-interfaces';
import type { NativeWindowEventData, WindowOpenOptions } from '../native-window/native-window-interfaces';
import {
	AccessibilityServiceEnabledPropName,
	CommonA11YServiceEnabledObservable,
	SharedA11YObservable,
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
	FontScaleCategory,
	getClosestValidFontScale,
	VALID_FONT_SCALES,
	setFontScale,
	getFontScale,
	setInitFontScale,
	getFontScaleCategory,
	setInitAccessibilityCssHelper,
	notifyAccessibilityFocusState,
	AccessibilityLiveRegion,
	AccessibilityRole,
	AccessibilityState,
	AccessibilityTrait,
	isA11yEnabled,
	setA11yEnabled,
	enforceArray,
} from '../accessibility/accessibility-common';
import { CoreTypes } from '../core-types';
import { getiOSWindow, setA11yUpdatePropertiesCallback, setApplicationPropertiesCallback, setAppMainEntry, setiOSWindow, setRootView, setToggleApplicationEventListenersCallback } from './helpers-common';

@NativeClass
class NotificationObserver extends NSObject {
	private _onReceiveCallback: (notification: NSNotification) => void;

	public static initWithCallback(onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
		const observer = <NotificationObserver>super.new();
		observer._onReceiveCallback = onReceiveCallback;

		return observer;
	}

	public onReceive(notification: NSNotification): void {
		this._onReceiveCallback(notification);
	}

	public static ObjCExposedMethods = {
		onReceive: { returns: interop.types.void, params: [NSNotification] },
	};
}

@NativeClass
class CADisplayLinkTarget extends NSObject {
	private _owner: WeakRef<iOSApplication>;
	static initWithOwner(owner: WeakRef<iOSApplication>): CADisplayLinkTarget {
		const target = <CADisplayLinkTarget>CADisplayLinkTarget.new();
		target._owner = owner;
		return target;
	}

	onDisplayed(link: CADisplayLink) {
		link.invalidate();
		const owner = this._owner.deref();

		if (!owner) {
			return;
		}

		owner.displayedOnce = true;
		owner.notify(<ApplicationEventData>{
			eventName: owner.displayedEvent,
			object: owner,
			ios: UIApplication.sharedApplication,
		});
		owner.primaryWindow?._notifyEvent(NativeWindowEvents.displayed);
		owner.displayedLinkTarget = null;
		owner.displayedLink = null;
	}

	public static ObjCExposedMethods = {
		onDisplayed: { returns: interop.types.void, params: [CADisplayLink] },
	};
}

/**
 * Detect if the app supports scenes.
 * When an app configures UIApplicationSceneManifest in Info.plist
 * it will use scene lifecycle management.
 */
let sceneManifest: NSDictionary<any, any>;
function supportsScenes(): boolean {
	if (SDK_VERSION < 13) {
		return false;
	}

	if (typeof sceneManifest === 'undefined') {
		// Check if scene manifest exists in Info.plist
		sceneManifest = NSBundle.mainBundle.objectForInfoDictionaryKey('UIApplicationSceneManifest');
	}
	return !!sceneManifest;
}

function supportsMultipleScenes(): boolean {
	if (SDK_VERSION < 13) {
		return false;
	}
	return UIApplication.sharedApplication?.supportsMultipleScenes;
}

/**
 * Number of times the JS runtime has been soft-rebooted in this process via
 * NativeScriptRuntime.reloadApplication / restartWithConfig. 0 on first boot.
 * Provided as a global by the iOS runtime (v9+); older runtimes report 0.
 */
function getRuntimeReloadCount(): number {
	const runtime = (globalThis as any).NativeScriptRuntime;
	return runtime && typeof runtime.reloadCount === 'number' ? runtime.reloadCount : 0;
}

@NativeClass
class Responder extends UIResponder implements UIApplicationDelegate {
	get window(): UIWindow {
		return Application.ios.window;
	}

	set window(value: UIWindow) {
		// NOOP
	}

	static ObjCProtocols = [UIApplicationDelegate];
}

const delegateWindowKey = Symbol('nativescript.delegateWindow');

/**
 * Installs NativeScript's default `UIApplicationDelegate` members on the class that will
 * be handed to `UIApplicationMain`, so scenes keep working with a custom delegate.
 *
 * Each member is installed only when the class does not already provide one (its own or
 * inherited), so a delegate that implements a method keeps it and can forward to
 * `Application.ios.defaultSceneConfiguration` / `defaultDiscardSceneSessions` itself.
 *
 * @internal
 */
function installSceneDelegateDefaults(delegateClass: unknown): void {
	const proto = (delegateClass as { prototype?: UIApplicationDelegate })?.prototype;

	if (!proto) {
		return;
	}

	// Implementing the scene methods makes the app assume scene-based lifecycle management,
	// which boots to a white screen when Info.plist has no UIApplicationSceneManifest.
	// Configuring the delegate here is also why UISceneConfigurations does not have to be
	// declared in Info.plist — UIApplicationSceneManifest on its own is enough.
	if (supportsScenes()) {
		if (!proto.applicationConfigurationForConnectingSceneSessionOptions) {
			proto.applicationConfigurationForConnectingSceneSessionOptions = function (application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions): UISceneConfiguration {
				return Application.ios.defaultSceneConfiguration(application, connectingSceneSession, options);
			};
		}

		if (!proto.applicationDidDiscardSceneSessions) {
			proto.applicationDidDiscardSceneSessions = function (application: UIApplication, sceneSessions: NSSet<UISceneSession>): void {
				Application.ios.defaultDiscardSceneSessions(application, sceneSessions);
			};
		}
	}

	if (!('window' in proto)) {
		Object.defineProperty(proto, 'window', {
			get(this: Record<symbol, UIWindow>): UIWindow {
				return this[delegateWindowKey] ?? Application.ios.window;
			},
			// UIKit assigns `delegate.window` on non-scene apps and a delegate may assign it
			// itself, so the value has to be kept: a discarding setter would leave the
			// delegate reporting a window it never set.
			set(this: Record<symbol, UIWindow>, value: UIWindow) {
				this[delegateWindowKey] = value;
			},
			enumerable: true,
			configurable: true,
		});
	}
}

installSceneDelegateDefaults(Responder);

let warnedAboutDelegateProtocols = false;
let warnedAboutDelegateAfterStart = false;

function warnAboutDelegate(message: string): void {
	Trace.write(message, Trace.categories.Error, Trace.messageType.warn);
	console.warn(message);
}

/**
 * Reports the two custom-delegate mistakes NativeScript cannot correct on the app's behalf:
 * a delegate class that never declared `UIApplicationDelegate` conformance, and a delegate
 * assigned once `UIApplicationMain` has already been given a class.
 */
function warnAboutDelegateClass(delegateClass: unknown, alreadyStarted: boolean): void {
	const protocols = (delegateClass as { ObjCProtocols?: unknown[] })?.ObjCProtocols;

	if (!warnedAboutDelegateProtocols && !(Array.isArray(protocols) && protocols.indexOf(UIApplicationDelegate) !== -1)) {
		warnedAboutDelegateProtocols = true;
		warnAboutDelegate('Application.ios.delegate was set to a class that does not list UIApplicationDelegate in its static ObjCProtocols. Add `static ObjCProtocols = [UIApplicationDelegate];` to the class body: the Objective-C class is built from ObjCProtocols and cached, so conformance cannot be declared from here and UIKit may never dispatch the delegate methods.');
	}

	if (alreadyStarted && !warnedAboutDelegateAfterStart) {
		warnedAboutDelegateAfterStart = true;
		warnAboutDelegate('Application.ios.delegate was set after the application started. UIApplicationMain has already been given a delegate class, so this assignment has no effect — set Application.ios.delegate before calling Application.run().');
	}
}

/**
 * Reads the payload `openWindow()` put on the activating NSUserActivity.
 */
function getSceneConnectionData(connectionOptions: UISceneConnectionOptions): Record<string, any> | undefined {
	const activities = connectionOptions?.userActivities;

	if (!activities || activities.count === 0) {
		return undefined;
	}

	const activity = activities.allObjects.objectAtIndex(0) as NSUserActivity;

	return activity?.userInfo ? (dataDeserialize(activity.userInfo) as Record<string, any>) : undefined;
}

@NativeClass
class SceneDelegate extends UIResponder implements UIWindowSceneDelegate {
	static ObjCProtocols = [UIWindowSceneDelegate];

	private _window: UIWindow;
	private _scene: UIWindowScene;

	get window(): UIWindow {
		return this._window;
	}

	set window(value: UIWindow) {
		this._window = value;
	}

	sceneWillConnectToSessionOptions(scene: UIScene, session: UISceneSession, connectionOptions: UISceneConnectionOptions): void {
		if (Trace.isEnabled()) {
			Trace.write(`SceneDelegate.sceneWillConnectToSessionOptions called with role: ${session.role}`, Trace.categories.NativeLifecycle);
		}

		if (!(scene instanceof UIWindowScene)) {
			// Scene is not a UIWindowScene, ignoring
			return;
		}

		const windowScene = scene as UIWindowScene;
		const isFirstScene = Application.ios._getWindows().length === 0;

		this._scene = windowScene;

		// Create window for this scene
		this._window = UIWindow.alloc().initWithWindowScene(windowScene);

		// Set up window background
		if (!__VISIONOS__) {
			this._window.backgroundColor = SDK_VERSION <= 12 || !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
		}

		const nativeWindowId = IOSNativeWindow.getSceneId(windowScene);
		const knownWindow = nativeWindowId ? (Application.ios.getWindowById(nativeWindowId) as IOSNativeWindow) : undefined;
		let nativeWindow: IOSNativeWindow;

		if (knownWindow?.state === 'detached') {
			// iOS reconnected a session we already have a window for: the same window
			// instance carries on, keeping its listeners and identity.
			nativeWindow = knownWindow;
			nativeWindow._reattach(windowScene, this._window);
		} else {
			const isPrimary = isFirstScene || !Application.ios.primaryWindow;
			nativeWindow = new IOSNativeWindow(windowScene, this._window, nativeWindowId, isPrimary);
			Application.ios._registerWindow(nativeWindow);
		}

		const isPrimary = nativeWindow.isPrimary;

		nativeWindow._notifyEvent(NativeWindowEvents.attached);

		if (isPrimary) {
			// For primary, also set the legacy global window reference
			setiOSWindow(this._window);
		}

		// Notify on NativeWindow first
		nativeWindow.notify({
			eventName: NativeWindowEvents.sceneWillConnect,
			object: nativeWindow,
			window: nativeWindow,
			scene: windowScene,
			uiWindow: this._window,
			connectionOptions: connectionOptions,
		} as SceneEventData);

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneWillConnect,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
			uiWindow: this._window,
			connectionOptions: connectionOptions,
		} as SceneEventData);

		if (isPrimary) {
			// primary scene, activate right away
			this._window.makeKeyAndVisible();
		}

		if (nativeWindow.role === 'application') {
			// A re-attached window carries a torn down root view on a brand new UIWindow,
			// so it needs its content resolved again just like a fresh one.
			Application.ios._resolveWindowContent(nativeWindow, {
				window: nativeWindow,
				isPrimary,
				data: getSceneConnectionData(connectionOptions),
				ios: { connectionOptions },
			});
		}
	}

	sceneDidBecomeActive(scene: UIScene): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);
		if (nativeWindow) {
			nativeWindow._notifyEvent(NativeWindowEvents.activate);
			// Emit sceneDidActivate on NativeWindow
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneDidActivate,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
			} as SceneEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneDidActivate,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
		} as SceneEventData);

		Application.ios._setWindowActive(nativeWindow, true, windowScene);

		const rootView = nativeWindow?.rootView;
		if (rootView && !rootView.isLoaded) {
			rootView.callLoaded();
		}
	}

	sceneWillResignActive(scene: UIScene): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);
		if (nativeWindow) {
			nativeWindow._notifyEvent(NativeWindowEvents.deactivate);
			// Emit sceneWillResignActive on NativeWindow
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneWillResignActive,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
			} as SceneEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneWillResignActive,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
		} as SceneEventData);

		Application.ios._setWindowActive(nativeWindow, false, windowScene);
	}

	sceneWillEnterForeground(scene: UIScene): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);
		if (nativeWindow) {
			nativeWindow._notifyEvent(NativeWindowEvents.foreground);
			// Emit sceneWillEnterForeground on NativeWindow
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneWillEnterForeground,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
			} as SceneEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneWillEnterForeground,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
		} as SceneEventData);

		Application.ios._setWindowInForeground(nativeWindow, true, windowScene);
	}

	sceneDidEnterBackground(scene: UIScene): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);
		if (nativeWindow) {
			nativeWindow._notifyEvent(NativeWindowEvents.background);
			// Emit sceneDidEnterBackground on NativeWindow
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneDidEnterBackground,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
			} as SceneEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneDidEnterBackground,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
		} as SceneEventData);

		Application.ios._setWindowInForeground(nativeWindow, false, windowScene);

		const rootView = nativeWindow?.rootView;
		if (rootView && rootView.isLoaded) {
			rootView.callUnloaded();
		}
	}

	sceneDidDisconnect(scene: UIScene): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);

		// A scene can disconnect without first resigning or backgrounding, so the window has
		// to leave the app-level aggregates here as well.
		Application.ios._setWindowActive(nativeWindow, false, windowScene);
		Application.ios._setWindowInForeground(nativeWindow, false, windowScene);

		if (nativeWindow) {
			// A disconnect only ends the window session when the app asked for it —
			// otherwise iOS may reconnect the same session later. A window with no session
			// identity is the exception: a reconnect could never be matched back to it.
			const isClosing = nativeWindow._closeRequested || !nativeWindow._hasSessionIdentity;

			if (isClosing) {
				nativeWindow._notifyEvent(NativeWindowEvents.close);
			}

			// Emit sceneDidDisconnect on NativeWindow
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneDidDisconnect,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
			} as SceneEventData);

			if (isClosing) {
				Application.ios._unregisterWindow(nativeWindow);
			} else {
				nativeWindow._detach();
			}
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneDidDisconnect,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
		} as SceneEventData);
	}

	sceneOpenURLContexts(scene: UIScene, URLContexts: NSSet<UIOpenURLContext>): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);

		if (nativeWindow) {
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneOpenURLContexts,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
				urlContexts: URLContexts,
			} as SceneOpenURLContextsEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneOpenURLContexts,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
			urlContexts: URLContexts,
		} as SceneOpenURLContextsEventData);

		forwardOpenURLContexts(Application.ios.delegate, UIApplication.sharedApplication, URLContexts);
	}

	sceneContinueUserActivity(scene: UIScene, userActivity: NSUserActivity): void {
		const windowScene = scene as UIWindowScene;
		const nativeWindow = Application.ios._getWindowForScene(windowScene);

		if (nativeWindow) {
			nativeWindow.notify({
				eventName: NativeWindowEvents.sceneContinueUserActivity,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
				userActivity,
			} as SceneContinueUserActivityEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.sceneContinueUserActivity,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
			userActivity,
		} as SceneContinueUserActivityEventData);

		forwardContinueUserActivity(Application.ios.delegate, UIApplication.sharedApplication, userActivity);
	}

	windowScenePerformActionForShortcutItemCompletionHandler(windowScene: UIWindowScene, shortcutItem: UIApplicationShortcutItem, completionHandler: (p1: boolean) => void): void {
		const nativeWindow = Application.ios._getWindowForScene(windowScene);
		// Shared by the listeners and the legacy handler, so it has to tolerate several callers.
		const deliver = oneShotCompletion(completionHandler);

		if (nativeWindow) {
			nativeWindow.notify({
				eventName: NativeWindowEvents.scenePerformActionForShortcutItem,
				object: nativeWindow,
				window: nativeWindow,
				scene: windowScene,
				shortcutItem,
				completionHandler: deliver,
			} as ScenePerformActionForShortcutItemEventData);
		}

		Application.ios.notify({
			eventName: NativeWindowEvents.scenePerformActionForShortcutItem,
			object: Application.ios,
			window: nativeWindow,
			scene: windowScene,
			shortcutItem,
			completionHandler: deliver,
		} as ScenePerformActionForShortcutItemEventData);

		deliverShortcutItem(Application.ios.delegate, UIApplication.sharedApplication, shortcutItem, deliver);
	}
}
// ensure available globally
global.SceneDelegate = SceneDelegate;

export class iOSApplication extends ApplicationCommon implements IiOSApplication {
	private _delegate: UIApplicationDelegate;
	private _delegateHandlers = new Map<string, Array<Function>>();
	private _rootView: View;
	/** Set when `shouldDelayLaunchEvent` defers the primary window's content until the app first becomes active. */
	private _pendingWindowContentResolve: (() => void) | null;
	private _sceneDelegate: UIWindowSceneDelegate;
	/**
	 * User-provided callback to intercept scene configuration.
	 * Called for every new scene session. Return a UISceneConfiguration to handle
	 * the scene yourself, or return null/undefined to let NativeScript handle it
	 * (only for UIWindowSceneSessionRoleApplication scenes).
	 * @internal
	 */
	_onSceneConfiguration: ((application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions) => UISceneConfiguration | null | undefined) | null;

	// The window whose root view the app-level root view state mirrors.
	private _mirroredWindow: NativeWindow;

	// Application-role windows currently in the foreground / currently active. Membership,
	// not a count, so a repeated or missing scene callback cannot drift the aggregate.
	private _foregroundWindows = new Set<NativeWindow>();
	private _activeWindows = new Set<NativeWindow>();

	private _notificationObservers: NotificationObserver[] = [];

	// Strong references to delegates recreated after an in-process soft reboot
	// (NativeScriptRuntime.reloadApplication). UIApplication.delegate is an
	// `assign` property and UIScene keeps its own reference to the delegate we
	// replace, so without these the fresh instances would be deallocated.
	private _softRebootAppDelegate: UIApplicationDelegate;
	private _softRebootSceneDelegates = new Map<UIScene, UIWindowSceneDelegate>();

	displayedOnce = false;
	displayedLinkTarget: CADisplayLinkTarget;
	displayedLink: CADisplayLink;

	/**
	 * Delays the 'launch' event, and with it the creation of the first window's content, until the
	 * app first becomes active, instead of raising it while the app finishes launching.
	 *
	 * Applies to non-scene apps only. It has no effect in a scene-based app, where each window's
	 * content is resolved as its scene connects.
	 *
	 * @deprecated Use the 'ready' event for application initialization, and
	 * Application.setWindowContentResolver() to provide window UI.
	 */
	shouldDelayLaunchEvent = false;

	/**
	 * @internal - should not be constructed by the user.
	 */
	constructor() {
		super();

		this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions.bind(this));
		this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive.bind(this));
		this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground.bind(this));
		this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate.bind(this));
		this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning.bind(this));
		this.addNotificationObserver(UIApplicationDidChangeStatusBarOrientationNotification, this.didChangeStatusBarOrientation.bind(this));
	}

	getRootView(): View {
		return this._rootView;
	}

	resetRootView(entry?: NavigationEntry | string) {
		super.resetRootView(entry);
		this.setWindowContent();
	}

	run(entry?: string | NavigationEntry): void {
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		this.started = true;

		if (this.nativeApp) {
			// During Vite HMR dev boot, the placeholder has already started
			// the app lifecycle. A second run() with an entry should replace
			// the placeholder root, NOT present a modal via runAsEmbeddedApp.
			// The HTTP ESM realm creates a separate @nativescript/core instance,
			// so JS-level patching of Application.run can't intercept this call.
			// Detect HMR mode via the placeholder's global flag and use
			// setWindowContent on the PRIMARY Application singleton (bundled realm)
			// which has the actual window and root view hierarchy.
			const g = globalThis as any;
			if (g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__ || g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__) {
				if (entry) {
					// Defer to next run loop tick so resetRootView executes outside the
					// HTTP ESM import context. Direct calls can fail with
					// "ReferenceError: __COMMONJS__ is not defined" because the JS
					// execution stack is in the HTTP realm when Builder loads modules.
					const resolvedEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
					setTimeout(() => {
						try {
							const primaryApp = g.Application;
							if (primaryApp && typeof primaryApp.resetRootView === 'function') {
								primaryApp.resetRootView(resolvedEntry);
							}
						} catch (e) {
							if (__DEV__) console.warn('[app-ios] deferred resetRootView failed:', e);
						}
						delete g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
						delete g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
					}, 0);
				} else {
					// Framework (e.g. Angular) calls run() with no entry — it manages
					// root views itself via resetRootView(). No-op to avoid presenting
					// a modal via runAsEmbeddedApp or throwing "Main entry is missing".
					if (__DEV__) console.info('[app-ios] run() called with no entry during HMR placeholder; framework manages root view');
				}
				return;
			}
			this.runAsEmbeddedApp();
		} else {
			this.runAsMainApp();
		}
	}

	private runAsMainApp() {
		UIApplicationMain(0, null, null, this.delegate ? NSStringFromClass(this.delegate as any) : NSStringFromClass(Responder));
	}

	private runAsEmbeddedApp() {
		this.notifyReady();

		this._reattachNativeDelegatesAfterSoftReboot();

		// TODO: this rootView should be held alive until rootController dismissViewController is called.
		const rootView = this.createRootView(this._rootView, true);
		if (!rootView) {
			return;
		}
		this._rootView = rootView;
		setRootView(rootView);
		// Attach to the existing iOS app
		let window = getWindow() as UIWindow;

		if (!window) {
			// In-process soft reboot with OTAs.
			// Original UIWindow is deallocated when the old JS isolate is torn down.
			// Recreate a window bound to the active UIWindowScene so the
			// root has somewhere to attach.
			const app = UIApplication.sharedApplication;
			const all = app && app.connectedScenes ? app.connectedScenes.allObjects : null;
			let targetScene: UIWindowScene;
			if (all) {
				for (let i = 0; i < all.count; i++) {
					const s = all.objectAtIndex(i) as UIWindowScene;
					// Only UIWindowScene exposes `windows`; prefer a foreground-active one.
					if (s && typeof s.windows !== 'undefined') {
						targetScene = s;
						if (s.activationState === UISceneActivationState.ForegroundActive) {
							break;
						}
					}
				}
			}
			if (targetScene) {
				window = UIWindow.alloc().initWithWindowScene(targetScene);

				if (!__VISIONOS__) {
					window.backgroundColor = SDK_VERSION <= 12 || !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
				}

				// The registry lives in JS and was lost with the previous isolate, so
				// the still-connected scene needs a fresh NativeWindow to be reachable.
				const isPrimary = !this.primaryWindow;
				const nativeWindow = new IOSNativeWindow(targetScene, window, IOSNativeWindow.getSceneId(targetScene), isPrimary);
				this._registerWindow(nativeWindow);

				if (isPrimary) {
					setiOSWindow(window);
				}

				// If the scene's delegate was recreated after a soft reboot, point it
				// at the new window so `scene.delegate.window` queries resolve.
				const freshSceneDelegate = this._softRebootSceneDelegates.get(targetScene);
				if (freshSceneDelegate) {
					freshSceneDelegate.window = window;
				}
			}
		}

		if (!window) {
			return;
		}

		// May be null on a freshly recreated window — expected; the replace-root
		// path below sets it. Only the embedder path needs an existing controller.
		const rootController = window.rootViewController;
		const embedderDelegate = NativeScriptEmbedder.sharedInstance().delegate;

		// Embed into host app requires an existing root view controller
		if (embedderDelegate && !rootController) {
			return;
		}

		let hostWindow = this.primaryWindow as IOSNativeWindow;
		if (!hostWindow) {
			// Only an embedder delegate makes this window a guest: without one NativeScript
			// owns the UIApplication and the window has to attach its own content.
			const role: WindowRole = embedderDelegate ? 'embedded' : 'application';
			hostWindow = new IOSNativeWindow(window.windowScene ?? undefined, window, 'embedded-main', true, role);
			this._registerWindow(hostWindow);
			hostWindow._notifyEvent(NativeWindowEvents.attached);
		}

		hostWindow.setContent(rootView);

		this.notifyAppStarted();
	}

	/**
	 * After an in-process soft reboot (NativeScriptRuntime.reloadApplication /
	 * restartWithConfig), the Objective-C delegate classes created by the
	 * previous JS isolate still exist and UIKit keeps dispatching to their
	 * now-inert instances: their method callbacks bail out because the isolate
	 * that implemented them is gone. Notification-center observers are
	 * re-registered by the new isolate, but delegate-based dispatch (custom
	 * UIApplicationDelegate methods like push-token/openURL callbacks, and the
	 * UIScene delegates used by scene-lifecycle apps) stays pinned to the old
	 * bundle. Recreate those delegates from this bundle's classes and re-point
	 * UIKit at them.
	 */
	private _reattachNativeDelegatesAfterSoftReboot(): void {
		if (getRuntimeReloadCount() <= 0) {
			// First boot: UIApplicationMain (or the host app) set up delegates.
			return;
		}

		if (isEmbedded()) {
			// The host app owns the UIApplication delegate; never touch it.
			return;
		}

		const app = UIApplication.sharedApplication;
		if (!app) {
			return;
		}

		// Fresh application delegate from the new bundle. Assigning `delegate`
		// does not retain (unlike the UIApplicationMain launch path), so keep a
		// strong reference ourselves.
		this.delegate ??= Responder as any;
		const freshDelegate = (<any>this.delegate).new() as UIApplicationDelegate;
		this._softRebootAppDelegate = freshDelegate;
		app.delegate = freshDelegate;

		// Re-point already-connected scenes at fresh scene delegates so scene
		// lifecycle and user-implemented scene delegate methods (shortcuts,
		// openURLContexts, userActivity continuation, etc.) reach this isolate.
		// Newly connecting scenes are covered by the fresh application delegate's
		// applicationConfigurationForConnectingSceneSessionOptions, which returns
		// this bundle's SceneDelegate class.
		if (this.supportsScenes()) {
			this._softRebootSceneDelegates.clear();
			const scenes = app.connectedScenes?.allObjects;
			for (let i = 0; scenes && i < scenes.count; i++) {
				const scene = scenes.objectAtIndex(i);
				if (!(scene instanceof UIWindowScene)) {
					continue;
				}
				const freshSceneDelegate = SceneDelegate.new() as UIWindowSceneDelegate;
				scene.delegate = freshSceneDelegate;
				this._softRebootSceneDelegates.set(scene, freshSceneDelegate);
			}
		}

		if (Trace.isEnabled()) {
			Trace.write(`Reattached application delegate${this._softRebootSceneDelegates.size ? ` and ${this._softRebootSceneDelegates.size} scene delegate(s)` : ''} after soft reboot (reloadCount: ${getRuntimeReloadCount()})`, Trace.categories.NativeLifecycle);
		}
	}

	private getViewController(rootView: View): UIViewController {
		let viewController: UIViewController = rootView.viewController || rootView.ios;

		if (!(viewController instanceof UIViewController)) {
			// We set UILayoutViewController dynamically to the root view if it doesn't have a view controller
			// At the moment the root view doesn't have its native view created. We set it in the setViewControllerView func
			viewController = IOSHelper.UILayoutViewController.initWithOwner(new WeakRef(rootView)) as UIViewController;
			rootView.viewController = viewController;
		}

		return viewController;
	}

	private setViewControllerView(view: View): void {
		const viewController: UIViewController = view.viewController || view.ios;
		const nativeView = view.ios || view.nativeViewProtected;

		if (!nativeView || !viewController) {
			throw new Error('Root should be either UIViewController or UIView');
		}

		if (viewController instanceof IOSHelper.UILayoutViewController) {
			viewController.view.addSubview(nativeView);
		}
	}

	setMaxRefreshRate(options?: { min?: number; max?: number; preferred?: number }): void {
		const adjustRefreshRate = () => {
			if (!this.displayedLink) {
				return;
			}
			const minFrameRateDisabled = NSBundle.mainBundle.objectForInfoDictionaryKey('CADisableMinimumFrameDurationOnPhone');

			if (minFrameRateDisabled) {
				let max = 120;
				const deviceMaxFrames = iosUtils.getMainScreen().maximumFramesPerSecond;
				if (options?.max) {
					if (deviceMaxFrames) {
						// iOS 10.3
						max = options.max <= deviceMaxFrames ? options.max : deviceMaxFrames;
					} else if (this.displayedLink.preferredFramesPerSecond) {
						// iOS 10.0
						max = options.max <= this.displayedLink.preferredFramesPerSecond ? options.max : this.displayedLink.preferredFramesPerSecond;
					}
				}

				if (SDK_VERSION >= 15 || __VISIONOS__) {
					const min = options?.min || max / 2;
					const preferred = options?.preferred || max;
					this.displayedLink.preferredFrameRateRange = CAFrameRateRangeMake(min, max, preferred);
				} else {
					this.displayedLink.preferredFramesPerSecond = max;
				}
			}
		};

		if (this.displayedOnce) {
			adjustRefreshRate();
			return;
		}

		this.displayedLinkTarget = CADisplayLinkTarget.initWithOwner(new WeakRef(this));
		this.displayedLink = CADisplayLink.displayLinkWithTargetSelector(this.displayedLinkTarget, 'onDisplayed');
		adjustRefreshRate();
		this.displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, NSDefaultRunLoopMode);
		this.displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, UITrackingRunLoopMode);
	}

	get rootController() {
		return this.window?.rootViewController;
	}

	get nativeApp() {
		return UIApplication.sharedApplication;
	}

	get window(): UIWindow {
		// TODO: consideration
		// may not want to cache this value given the potential of multiple scenes
		// particularly with SwiftUI app lifecycle based apps
		if (!getiOSWindow()) {
			// Note: NativeScriptViewFactory.getKeyWindow will always be used in SwiftUI app lifecycle based apps
			setiOSWindow(getWindow() as UIWindow);
		}

		return getiOSWindow();
	}

	get delegate(): UIApplicationDelegate & { prototype: UIApplicationDelegate } {
		return this._delegate as any;
	}

	set delegate(value: UIApplicationDelegate | unknown) {
		if (this._delegate !== value) {
			this._delegate = value as UIApplicationDelegate;

			if (value) {
				warnAboutDelegateClass(value, this.started);
				installSceneDelegateDefaults(value);
			}
		}
	}

	/**
	 * NativeScript's default implementation of the `UIApplicationDelegate`
	 * `applicationConfigurationForConnectingSceneSessionOptions` method.
	 *
	 * It is installed automatically on the application delegate class unless that class
	 * already implements the method. A delegate that does implement it can handle the
	 * scenes it cares about and forward the rest here:
	 *
	 * ```ts
	 * applicationConfigurationForConnectingSceneSessionOptions(app, session, options) {
	 *   if (session.role === myCustomRole) {
	 *     return myConfig;
	 *   }
	 *   return Application.ios.defaultSceneConfiguration(app, session, options);
	 * }
	 * ```
	 *
	 * `onSceneConfiguration` is consulted first. Scenes with the
	 * `UIWindowSceneSessionRoleApplication` role then get a configuration backed by
	 * NativeScript's SceneDelegate; every other role gets a bare configuration that
	 * NativeScript does not manage.
	 */
	defaultSceneConfiguration(application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions): UISceneConfiguration {
		// Let the user intercept scene configuration for any/all scenes
		const userHandler = this._onSceneConfiguration;
		if (userHandler) {
			const userConfig = userHandler(application, connectingSceneSession, options);
			if (userConfig) {
				return userConfig;
			}
		}

		// Only handle the standard window scene role — skip CarPlay, external displays, etc.
		if (connectingSceneSession.role !== UIWindowSceneSessionRoleApplication) {
			// Return a bare configuration so iOS doesn't crash, but NativeScript won't manage it
			return UISceneConfiguration.configurationWithNameSessionRole('Unmanaged', connectingSceneSession.role);
		}

		const config = UISceneConfiguration.configurationWithNameSessionRole('Default Configuration', connectingSceneSession.role);
		config.sceneClass = UIWindowScene as any;
		config.delegateClass = SceneDelegate;
		return config;
	}

	/**
	 * NativeScript's default implementation of the `UIApplicationDelegate`
	 * `applicationDidDiscardSceneSessions` method, which retires the `NativeWindow`s
	 * belonging to the discarded sessions.
	 *
	 * It is installed automatically on the application delegate class unless that class
	 * already implements the method, in which case forward to it from there so window
	 * bookkeeping stays correct.
	 */
	defaultDiscardSceneSessions(application: UIApplication, sceneSessions: NSSet<UISceneSession>): void {
		this._onSceneSessionsDiscarded(sceneSessions);
	}

	addDelegateHandler<T extends keyof UIApplicationDelegate>(methodName: T, handler: (typeof UIApplicationDelegate.prototype)[T]): void {
		// safe-guard against invalid handlers
		if (typeof handler !== 'function') {
			return;
		}

		// ensure we have a delegate; Responder already carries the defaults, so it is
		// stored directly rather than through the setter, whose warnings only apply to
		// a delegate class the app supplied.
		this._delegate ??= Responder as any;

		const handlers = this._delegateHandlers.get(methodName) ?? [];

		if (!this._delegateHandlers.has(methodName)) {
			const originalHandler = this.delegate.prototype[methodName];

			if (originalHandler) {
				// if there is an original handler, we add it to the handlers array to be called first.
				handlers.push(originalHandler as Function);
			}

			// replace the original method implementation with one that will call all handlers.
			this.delegate.prototype[methodName] = function (...args: any[]) {
				let res: any;
				for (const handler of handlers) {
					if (typeof handler !== 'function') {
						continue;
					}
					res = handler.apply(this, args);
				}
				return res;
			} as (typeof UIApplicationDelegate.prototype)[T];

			// store the handlers
			this._delegateHandlers.set(methodName, handlers);
		}

		handlers.push(handler);
	}

	getNativeApplication() {
		return this.nativeApp;
	}

	addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void) {
		const observer = NotificationObserver.initWithCallback(onReceiveCallback);
		NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(observer, 'onReceive', notificationName, null);
		this._notificationObservers.push(observer);

		return observer;
	}

	removeNotificationObserver(observer: any /* NotificationObserver */, notificationName: string) {
		const index = this._notificationObservers.indexOf(observer);
		if (index >= 0) {
			this._notificationObservers.splice(index, 1);
			NSNotificationCenter.defaultCenter.removeObserverNameObject(observer, notificationName, null);
		}
	}

	protected getSystemAppearance(): 'light' | 'dark' {
		// userInterfaceStyle is available on UITraitCollection since iOS 12.
		if ((!__VISIONOS__ && SDK_VERSION <= 11) || !this.rootController) {
			return null;
		}

		const userInterfaceStyle = this.rootController.traitCollection.userInterfaceStyle;
		return this.getSystemAppearanceValue(userInterfaceStyle);
	}

	private getSystemAppearanceValue(userInterfaceStyle: number): 'dark' | 'light' {
		switch (userInterfaceStyle) {
			case UIUserInterfaceStyle.Dark:
				return 'dark';
			case UIUserInterfaceStyle.Light:
			case UIUserInterfaceStyle.Unspecified:
				return 'light';
		}
	}

	protected getLayoutDirection(): CoreTypes.LayoutDirectionType {
		if (!this.rootController) {
			return null;
		}

		const layoutDirection = this.rootController.traitCollection.layoutDirection;
		return this.getLayoutDirectionValue(layoutDirection);
	}

	private getLayoutDirectionValue(layoutDirection: number): CoreTypes.LayoutDirectionType {
		switch (layoutDirection) {
			case UITraitEnvironmentLayoutDirection.LeftToRight:
				return CoreTypes.LayoutDirection.ltr;
			case UITraitEnvironmentLayoutDirection.RightToLeft:
				return CoreTypes.LayoutDirection.rtl;
		}
	}

	protected getOrientation() {
		let statusBarOrientation: UIInterfaceOrientation;
		if (__VISIONOS__) {
			statusBarOrientation = NativeScriptEmbedder.sharedInstance().windowScene.interfaceOrientation;
		} else {
			statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
		}
		return this.getOrientationValue(statusBarOrientation);
	}

	private getOrientationValue(orientation: number): 'portrait' | 'landscape' | 'unknown' {
		switch (orientation) {
			case UIInterfaceOrientation.LandscapeRight:
			case UIInterfaceOrientation.LandscapeLeft:
				return 'landscape';
			case UIInterfaceOrientation.PortraitUpsideDown:
			case UIInterfaceOrientation.Portrait:
				return 'portrait';
			case UIInterfaceOrientation.Unknown:
				return 'unknown';
		}
	}

	private notifyAppStarted(notification?: NSNotification) {
		const root = this.notifyLaunch({
			ios: notification?.userInfo?.objectForKey('UIApplicationLaunchOptionsLocalNotificationKey') ?? null,
		});

		if (getiOSWindow()) {
			if (root !== null && !isEmbedded()) {
				this.setWindowContent(root);
			}
		} else {
			setiOSWindow(this.window);
		}
	}

	public _onLivesync(context?: ModuleContext): void {
		// Handle application root module
		const isAppRootModuleChanged = context && context.path && context.path.includes(this.getMainEntry().moduleName) && context.type !== 'style';

		// Set window content when:
		// + Application root module is changed
		// + View did not handle the change
		// Note:
		// The case when neither app root module is changed, nor livesync is handled on View,
		// then changes will not apply until navigate forward to the module.
		if (isAppRootModuleChanged || (this._rootView && !this._rootView._onLivesync(context))) {
			this.setWindowContent();
		}
	}

	private setWindowContent(view?: View): void {
		const rootView = this.createRootView(view);
		const primaryWindow = this.primaryWindow;

		if (primaryWindow) {
			primaryWindow.setContent(rootView);
			return;
		}

		this.setWindowContentFallback(rootView);
	}

	/**
	 * Attaches content to the raw `UIWindow`. Every launch path registers a primary
	 * NativeWindow, so this only runs when no window is left to own the content.
	 */
	private setWindowContentFallback(rootView: View): void {
		if (this._rootView) {
			this._rootView._onRootViewReset();
		}

		const controller = this.getViewController(rootView);

		// setup view as styleScopeHost
		rootView._setupAsRootView({});

		this.setViewControllerView(rootView);

		const win = this.window;
		const haveController = win.rootViewController !== null;
		win.rootViewController = controller;

		if (!haveController) {
			win.makeKeyAndVisible();
		}

		this.adoptRootView(rootView);
	}

	// Observers
	@profile
	private didFinishLaunchingWithOptions(notification: NSNotification) {
		if (__DEV__) {
			/**
			 * v9+ runtime crash handling
			 * When crash occurs during boot, we let runtime take over
			 */
			if (notification.userInfo) {
				const isBootCrash = notification.userInfo.objectForKey('NativeScriptBootCrash');
				if (isBootCrash) {
					// fatal crash will show in console without app exiting
					// allowing hot reload fixes to continue
					return;
				}
			}
		}

		// Must precede every window registration below and every scene connect that follows.
		this.notifyReady();

		this.setMaxRefreshRate();

		// Only set up window if NOT using scene-based lifecycle
		if (!this.supportsScenes()) {
			// Traditional single-window app setup
			// ensures window is assigned to proper window scene
			setiOSWindow(this.window);

			if (!getiOSWindow()) {
				// if still no window, create one
				setiOSWindow(UIWindow.alloc().initWithFrame(UIScreen.mainScreen.bounds));
			}

			if (!__VISIONOS__) {
				this.window.backgroundColor = SDK_VERSION <= 12 || !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
			}

			if (!this.primaryWindow) {
				const nativeWindow = new IOSNativeWindow(undefined, this.window, 'main', true, 'application');
				this._registerWindow(nativeWindow);
				nativeWindow._notifyEvent(NativeWindowEvents.attached);
			}

			const primaryWindow = this.primaryWindow;
			const resolveContent = () =>
				this._resolveWindowContent(
					primaryWindow,
					{
						window: primaryWindow,
						isPrimary: true,
					},
					{
						launchData: {
							ios: notification?.userInfo?.objectForKey('UIApplicationLaunchOptionsLocalNotificationKey') ?? null,
						},
					},
				);

			if (this.shouldDelayLaunchEvent) {
				this._pendingWindowContentResolve = resolveContent;
			} else {
				resolveContent();
			}
		} else {
			// Scene-based app - window creation will happen in scene delegate
		}
	}

	@profile
	private didBecomeActive(notification: NSNotification) {
		const pendingWindowContentResolve = this._pendingWindowContentResolve;
		if (pendingWindowContentResolve) {
			this._pendingWindowContentResolve = null;
			pendingWindowContentResolve();
		}

		// A scene app derives app-level state from its windows, so this notification must not
		// drive it as well. In scene mode the root view belongs to a window too, so the scene
		// delegate loads it.
		if (!this.supportsScenes()) {
			const additionalData = {
				ios: UIApplication.sharedApplication,
			};
			this.setInBackground(false, additionalData);
			this.setSuspended(false, additionalData);

			const rootView = this._rootView;
			if (rootView && !rootView.isLoaded) {
				rootView.callLoaded();
			}
		}
	}

	private didEnterBackground(notification: NSNotification) {
		// See didBecomeActive: in scene mode the windows drive app-level state.
		if (!this.supportsScenes()) {
			const additionalData = {
				ios: UIApplication.sharedApplication,
			};
			this.setInBackground(true, additionalData);
			this.setSuspended(true, additionalData);

			const rootView = this._rootView;
			if (rootView && rootView.isLoaded) {
				rootView.callUnloaded();
			}
		}
	}

	private willTerminate(notification: NSNotification) {
		this.notify(<ApplicationEventData>{
			eventName: this.exitEvent,
			object: this,
			ios: this.ios,
		});

		// const rootView = this._rootView;
		// if (rootView && rootView.isLoaded) {
		// 	rootView.callUnloaded();
		// }
	}

	private didReceiveMemoryWarning(notification: NSNotification) {
		this.notify(<ApplicationEventData>{
			eventName: this.lowMemoryEvent,
			object: this,
			ios: this.ios,
		});
	}

	private didChangeStatusBarOrientation(notification: NSNotification) {
		// The notification is app-wide, but scenes rotate independently, so every attached
		// window is refreshed from its own scene.
		for (const nativeWindow of this._windows) {
			if (nativeWindow.state !== 'attached') {
				continue;
			}

			const orientation = nativeWindow.ios?.scene?.interfaceOrientation ?? UIApplication.sharedApplication.statusBarOrientation;
			nativeWindow._setOrientation(this.getOrientationValue(orientation));
		}
	}

	// --- App-level root view mirror ---

	/**
	 * Keeps the app-level root view state (`getRootView()`, the global root view and the
	 * `initRootView` event) following whatever the primary window shows.
	 */
	private mirrorPrimaryWindow(nativeWindow: NativeWindow): void {
		if (this._mirroredWindow === nativeWindow) {
			return;
		}

		this._mirroredWindow?.off(NativeWindowEvents.contentLoaded, this.onPrimaryWindowContentLoaded, this);
		this._mirroredWindow = nativeWindow;
		nativeWindow.on(NativeWindowEvents.contentLoaded, this.onPrimaryWindowContentLoaded, this);

		if (nativeWindow.rootView && nativeWindow.rootView !== this._rootView) {
			this.adoptRootView(nativeWindow.rootView);
		}
	}

	private onPrimaryWindowContentLoaded(data: NativeWindowEventData): void {
		this.adoptRootView(data.window.rootView);
	}

	private adoptRootView(rootView: View): void {
		if (!rootView) {
			return;
		}

		this._rootView = rootView;
		setRootView(rootView);
		this.initRootView(rootView, this._mirroredWindow);
	}

	// --- NativeWindow registry ---

	/**
	 * @internal - hands the discarded sessions' ids to the window registry, which decides
	 * which of them name a window that is actually finished with.
	 */
	_onSceneSessionsDiscarded(sessions: NSSet<UISceneSession>): void {
		const all = sessions?.allObjects;
		if (!all) {
			return;
		}

		const ids: string[] = [];

		for (let i = 0; i < all.count; i++) {
			const persistentIdentifier = all.objectAtIndex(i)?.persistentIdentifier;

			if (persistentIdentifier) {
				ids.push(`${persistentIdentifier}`);
			}
		}

		this._retireDiscardedWindows(ids);
	}

	/**
	 * @internal - Get a NativeWindow by its scene.
	 */
	_getWindowForScene(scene: UIWindowScene): IOSNativeWindow | undefined {
		return this._windows.find((nw) => nw.ios?.scene === scene) as IOSNativeWindow | undefined;
	}

	/**
	 * @internal - Feeds a window's foreground state into the application-level
	 * 'foreground'/'background' events, which describe the app as a whole: they are raised
	 * when the first application-role window enters the foreground and when the last one
	 * leaves it. Windows in any other role never speak for the app.
	 */
	_setWindowInForeground(nativeWindow: NativeWindow | undefined, inForeground: boolean, scene?: UIScene): void {
		if (this._trackWindowState(this._foregroundWindows, nativeWindow, inForeground)) {
			this.setInBackground(!inForeground, {
				ios: UIApplication.sharedApplication,
				scene,
			});
		}
	}

	/**
	 * @internal - Feeds a window's active state into the application-level 'resume'/'suspend'
	 * events, raised when the first application-role window becomes active and when the last
	 * active one resigns.
	 */
	_setWindowActive(nativeWindow: NativeWindow | undefined, active: boolean, scene?: UIScene): void {
		if (this._trackWindowState(this._activeWindows, nativeWindow, active)) {
			this.setSuspended(!active, {
				ios: UIApplication.sharedApplication,
				scene,
			});
		}
	}

	/**
	 * @returns whether the set flipped between empty and non-empty, which is the only point
	 * at which app-level state changes.
	 */
	private _trackWindowState(windows: Set<NativeWindow>, nativeWindow: NativeWindow | undefined, member: boolean): boolean {
		if (nativeWindow?.role !== 'application') {
			return false;
		}

		const wasPopulated = windows.size > 0;

		if (member) {
			windows.add(nativeWindow);
		} else {
			windows.delete(nativeWindow);
		}

		return wasPopulated !== windows.size > 0;
	}

	protected _onWindowRegistered(nativeWindow: NativeWindow): void {
		if (nativeWindow.isPrimary) {
			this.mirrorPrimaryWindow(nativeWindow);
		}
	}

	protected _onPrimaryWindowPromoted(nativeWindow: NativeWindow): void {
		const promotedWindow = nativeWindow.ios?.uiWindow;
		if (promotedWindow) {
			setiOSWindow(promotedWindow);
		}
		this.mirrorPrimaryWindow(nativeWindow);
	}

	/**
	 * Register a callback to intercept scene configuration.
	 *
	 * Called for every new scene session. Return a `UISceneConfiguration` to handle
	 * the scene yourself (e.g. CarPlay, external display), or return `null`/`undefined`
	 * to let NativeScript handle it with the default SceneDelegate.
	 *
	 * NativeScript only auto-manages `UIWindowSceneSessionRoleApplication` scenes.
	 * All other scene roles are ignored unless you provide a configuration here.
	 *
	 * @example
	 * ```ts
	 * Application.ios.onSceneConfiguration = (app, session, options) => {
	 *   if (session.role === CPTemplateApplicationSceneSessionRoleApplication) {
	 *     const config = UISceneConfiguration.configurationWithNameSessionRole('CarPlay', session.role);
	 *     config.delegateClass = MyCarPlaySceneDelegate;
	 *     return config;
	 *   }
	 *   // Return null to let NativeScript handle the default window scene
	 *   return null;
	 * };
	 * ```
	 */
	set onSceneConfiguration(handler: ((application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions) => UISceneConfiguration | null | undefined) | null) {
		this._onSceneConfiguration = handler;
	}

	get onSceneConfiguration(): ((application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions) => UISceneConfiguration | null | undefined) | null {
		return this._onSceneConfiguration;
	}

	// Scene management helper methods (kept for backward compat)

	get sceneDelegate(): UIWindowSceneDelegate {
		if (!this._sceneDelegate) {
			this._sceneDelegate = SceneDelegate.new() as UIWindowSceneDelegate;
		}
		return this._sceneDelegate;
	}

	set sceneDelegate(value: UIWindowSceneDelegate) {
		this._sceneDelegate = value;
	}

	/**
	 * Multi-window support
	 */

	/**
	 * Opens a new window (scene).
	 *
	 * @param options Options for the new window. `options.data` is serialized into the
	 * activating scene's `NSUserActivity.userInfo`.
	 */
	openWindow(options?: WindowOpenOptions) {
		if (!supportsMultipleScenes()) {
			console.log('Cannot create a new scene - not supported on this device.');
			return;
		}

		try {
			const app = UIApplication.sharedApplication;

			// iOS 17+
			if (SDK_VERSION >= 17) {
				let request: UISceneSessionActivationRequest;

				try {
					request = UISceneSessionActivationRequest.requestWithRole(UIWindowSceneSessionRoleApplication);

					const activity = NSUserActivity.alloc().initWithActivityType(`${NSBundle.mainBundle.bundleIdentifier}.scene`);
					activity.userInfo = dataSerialize(options?.data ?? {});
					request.userActivity = activity;

					const activationOptions = UISceneActivationRequestOptions.new();
					const primary = this.primaryWindow;
					if (primary?.ios?.scene) {
						activationOptions.requestingScene = primary.ios.scene;
					}

					request.options = activationOptions;
				} catch (roleError) {
					console.log('Error creating request:', roleError);
					return;
				}

				app.activateSceneSessionForRequestErrorHandler(request, (error) => {
					if (error) {
						console.log('Error creating new scene (iOS 17+):', error);

						if (error.userInfo) {
							console.error(`Error userInfo: ${error.userInfo.description}`);
						}

						if (error.localizedDescription.includes('role') && error.localizedDescription.includes('nil')) {
							this.createSceneWithLegacyAPI(options?.data);
						} else if (error.domain === 'FBSWorkspaceErrorDomain' && error.code === 2) {
							this.createSceneWithLegacyAPI(options?.data);
						}
					}
				});
			} else if (SDK_VERSION >= 13 && SDK_VERSION < 17) {
				app.requestSceneSessionActivationUserActivityOptionsErrorHandler(null, null, null, (error) => {
					if (error) {
						console.log('Error creating new scene (legacy):', error);
					}
				});
			} else {
				console.log('Neither new nor legacy scene activation methods are available');
			}
		} catch (error) {
			console.error('Error requesting new scene:', error);
		}
	}

	/**
	 * Closes a secondary window/scene.
	 * Accepts a NativeWindow, View, UIWindow, UIWindowScene, or string id.
	 */
	public closeWindow(target?: NativeWindow | View | UIWindow | UIWindowScene | string): void {
		if (!__APPLE__) {
			return;
		}
		try {
			let nativeWindow: NativeWindow | undefined;

			if (target instanceof NativeWindow) {
				nativeWindow = target;
			} else {
				const scene = this._resolveScene(target);
				if (scene) {
					nativeWindow = this._getWindowForScene(scene);
				}
			}

			if (!nativeWindow) {
				console.log('closeWindow: No window resolved for target');
				return;
			}

			nativeWindow.close();
		} catch (err) {
			console.log('closeWindow: Unexpected error', err);
		}
	}

	/**
	 * @deprecated Use `getWindows()` instead.
	 */
	getAllWindows(): UIWindow[] {
		return this._windows.map((nw) => nw.ios?.uiWindow).filter(Boolean) as UIWindow[];
	}

	/**
	 * @deprecated Use `getWindows()` instead.
	 */
	getAllScenes(): UIScene[] {
		return this._windows.map((nw) => nw.ios?.scene).filter(Boolean) as UIScene[];
	}

	/**
	 * @deprecated Use `getWindows()` instead.
	 */
	getWindowScenes(): UIWindowScene[] {
		return this.getAllScenes().filter((scene) => scene instanceof UIWindowScene) as UIWindowScene[];
	}

	/**
	 * @deprecated Use `primaryWindow?.ios?.uiWindow` instead.
	 */
	getPrimaryWindow(): UIWindow {
		const primary = this.primaryWindow;
		if (primary?.ios?.uiWindow) {
			return primary.ios.uiWindow;
		}
		return getiOSWindow();
	}

	/**
	 * @deprecated Use `primaryWindow?.ios?.scene` instead.
	 */
	getPrimaryScene(): UIWindowScene | null {
		return this.primaryWindow?.ios?.scene || null;
	}

	// Scene lifecycle management
	supportsScenes(): boolean {
		return supportsScenes();
	}

	supportsMultipleScenes(): boolean {
		return supportsMultipleScenes();
	}

	isUsingSceneLifecycle(): boolean {
		return this.supportsScenes() && this._windows.length > 0;
	}

	// Call this to set up scene-based configuration
	configureForScenes(): void {
		if (!this.supportsScenes()) {
			console.warn('Scene-based lifecycle is only supported on iOS 13+ iPad or visionOS with multi-scene enabled apps.');
			return;
		}
	}

	// Resolve a UIWindowScene from various input types
	private _resolveScene(target?: any): UIWindowScene | null {
		if (!__APPLE__) {
			return null;
		}
		if (!target) {
			// Try to pick a non-primary window's scene
			const nonPrimary = this._windows.filter((nw) => !nw.isPrimary);
			return nonPrimary[0]?.ios?.scene || this.primaryWindow?.ios?.scene || null;
		}
		if (target && typeof target === 'object') {
			// UIWindowScene
			if ((target as UIWindowScene).session && (target as UIWindowScene).activationState !== undefined) {
				return target as UIWindowScene;
			}
			// UIWindow
			if ((target as UIWindow).windowScene) {
				return (target as UIWindow).windowScene;
			}
			// NativeScript View
			if ((target as View)?.nativeViewProtected) {
				const uiView = (target as View).nativeViewProtected as UIView;
				const win = uiView?.window as UIWindow;
				return win?.windowScene || null;
			}
		}
		// String id lookup
		if (typeof target === 'string') {
			const found = this.getWindowById(target);
			if (found) {
				return found.ios?.scene || null;
			}
			// Try matching among known scenes
			for (const nw of this._windows) {
				const scene = nw.ios?.scene;
				if (scene && IOSNativeWindow.getSceneId(scene) === target) {
					return scene;
				}
			}
		}
		return null;
	}

	private createSceneWithLegacyAPI(data?: Record<string, any>) {
		const windowScene = this.window?.windowScene;

		if (!windowScene) {
			return;
		}

		// Create user activity for the new scene
		const userActivity = NSUserActivity.alloc().initWithActivityType(`${NSBundle.mainBundle.bundleIdentifier}.scene`);
		userActivity.userInfo = dataSerialize(data ?? {});

		// Use the legacy API
		const options = UISceneActivationRequestOptions.new();
		options.requestingScene = windowScene;

		UIApplication.sharedApplication.requestSceneSessionActivationUserActivityOptionsErrorHandler(
			null, // session - null for new scene
			userActivity,
			options,
			(error: NSError) => {
				if (error) {
					console.error(`Legacy scene API failed: ${error.localizedDescription}`);
				}
			},
		);
	}

	/**
	 * Creates a simple view controller with a NativeScript view for a scene window.
	 * @param window The UIWindow to set content for
	 * @param view The NativeScript View to set as root content
	 */
	setWindowRootView(window: UIWindow, view: View): void {
		if (!window || !view) {
			return;
		}

		if (view.ios) {
			window.rootViewController = view.viewController;
			window.makeKeyAndVisible();
		} else {
			console.warn('View does not have a native iOS implementation');
		}
	}

	get ios() {
		// ensures Application.ios is defined when running on iOS
		return this;
	}
}

const iosApp = new iOSApplication();

// Attach on global, so it can also be overwritten to implement different logic based on flavor
global.__onLiveSyncCore = function (context?: ModuleContext) {
	iosApp._onLivesync(context);
};

export * from './application-common';
export * from './application-interfaces';
export const Application = iosApp;
export const AndroidApplication = undefined;

function fontScaleChanged(origFontScale: number) {
	const oldValue = getFontScale();
	setFontScale(getClosestValidFontScale(origFontScale));
	const currentFontScale = getFontScale();

	if (oldValue !== currentFontScale) {
		Application.notify({
			eventName: Application.fontScaleChangedEvent,
			object: Application,
			newValue: currentFontScale,
		});
	}
}

export function getCurrentFontScale(): number {
	setupConfigListener();

	return getFontScale();
}

const sizeMap = new Map<string, number>([
	[UIContentSizeCategoryExtraSmall, 0.5],
	[UIContentSizeCategorySmall, 0.7],
	[UIContentSizeCategoryMedium, 0.85],
	[UIContentSizeCategoryLarge, 1],
	[UIContentSizeCategoryExtraLarge, 1.15],
	[UIContentSizeCategoryExtraExtraLarge, 1.3],
	[UIContentSizeCategoryExtraExtraExtraLarge, 1.5],
	[UIContentSizeCategoryAccessibilityMedium, 2],
	[UIContentSizeCategoryAccessibilityLarge, 2.5],
	[UIContentSizeCategoryAccessibilityExtraLarge, 3],
	[UIContentSizeCategoryAccessibilityExtraExtraLarge, 3.5],
	[UIContentSizeCategoryAccessibilityExtraExtraExtraLarge, 4],
]);

function contentSizeUpdated(fontSize: string) {
	if (sizeMap.has(fontSize)) {
		fontScaleChanged(sizeMap.get(fontSize));

		return;
	}

	fontScaleChanged(1);
}

function useIOSFontScale() {
	if (Application.ios.nativeApp) {
		contentSizeUpdated(Application.ios.nativeApp.preferredContentSizeCategory);
	} else {
		fontScaleChanged(1);
	}
}

let fontSizeObserver;
function setupConfigListener(attempt = 0) {
	if (fontSizeObserver) {
		return;
	}

	if (!Application.ios.nativeApp) {
		if (attempt > 100) {
			fontScaleChanged(1);

			return;
		}

		// Couldn't get launchEvent to trigger.
		setTimeout(() => setupConfigListener(attempt + 1), 1);

		return;
	}

	fontSizeObserver = Application.ios.addNotificationObserver(UIContentSizeCategoryDidChangeNotification, (args) => {
		const fontSize = args.userInfo.valueForKey(UIContentSizeCategoryNewValueKey);
		contentSizeUpdated(fontSize);
	});

	Application.on(Application.exitEvent, () => {
		if (fontSizeObserver) {
			Application.ios.removeNotificationObserver(fontSizeObserver, UIContentSizeCategoryDidChangeNotification);
			fontSizeObserver = null;
		}

		Application.off(Application.resumeEvent, useIOSFontScale);
	});

	Application.on(Application.resumeEvent, useIOSFontScale);

	useIOSFontScale();
}
setInitFontScale(setupConfigListener);

/**
 * Convert array of values into a bitmask.
 *
 * @param values string values
 * @param map    map lower-case name to integer value.
 */
function inputArrayToBitMask(values: string | string[], map: Map<string, number>): number {
	return (
		enforceArray(values)
			.filter((value) => !!value)
			.map((value) => `${value}`.toLocaleLowerCase())
			.filter((value) => map.has(value))
			.reduce((res, value) => res | map.get(value), 0) || 0
	);
}

let AccessibilityTraitsMap: Map<string, number>;
let RoleTypeMap: Map<AccessibilityRole, number>;

let nativeFocusedNotificationObserver;
let lastFocusedView: WeakRef<View>;
function ensureNativeClasses() {
	if (AccessibilityTraitsMap && nativeFocusedNotificationObserver) {
		return;
	}

	AccessibilityTraitsMap = new Map<AccessibilityTrait, number>([
		[AccessibilityTrait.AllowsDirectInteraction, UIAccessibilityTraitAllowsDirectInteraction],
		[AccessibilityTrait.CausesPageTurn, UIAccessibilityTraitCausesPageTurn],
		[AccessibilityTrait.NotEnabled, UIAccessibilityTraitNotEnabled],
		[AccessibilityTrait.Selected, UIAccessibilityTraitSelected],
		[AccessibilityTrait.UpdatesFrequently, UIAccessibilityTraitUpdatesFrequently],
	]);

	RoleTypeMap = new Map<AccessibilityRole, number>([
		[AccessibilityRole.Adjustable, UIAccessibilityTraitAdjustable],
		[AccessibilityRole.Button, UIAccessibilityTraitButton],
		[AccessibilityRole.Checkbox, UIAccessibilityTraitButton],
		[AccessibilityRole.Header, UIAccessibilityTraitHeader],
		[AccessibilityRole.KeyboardKey, UIAccessibilityTraitKeyboardKey],
		[AccessibilityRole.Image, UIAccessibilityTraitImage],
		[AccessibilityRole.ImageButton, UIAccessibilityTraitImage | UIAccessibilityTraitButton],
		[AccessibilityRole.Link, UIAccessibilityTraitLink],
		[AccessibilityRole.None, UIAccessibilityTraitNone],
		[AccessibilityRole.PlaysSound, UIAccessibilityTraitPlaysSound],
		[AccessibilityRole.RadioButton, UIAccessibilityTraitButton],
		[AccessibilityRole.Search, UIAccessibilityTraitSearchField],
		[AccessibilityRole.StaticText, UIAccessibilityTraitStaticText],
		[AccessibilityRole.StartsMediaSession, UIAccessibilityTraitStartsMediaSession],
		[AccessibilityRole.Summary, UIAccessibilityTraitSummaryElement],
		[AccessibilityRole.Switch, UIAccessibilityTraitButton],
	]);

	nativeFocusedNotificationObserver = Application.ios.addNotificationObserver(UIAccessibilityElementFocusedNotification, (args: NSNotification) => {
		const uiView = args.userInfo?.objectForKey(UIAccessibilityFocusedElementKey) as UIView;
		if (!uiView?.tag) {
			return;
		}

		const rootView = Application.getRootView();

		// We use the UIView's tag to find the NativeScript View by its domId.
		let view = rootView.getViewByDomId<View>(uiView?.tag);
		if (!view) {
			for (const modalView of <Array<View>>rootView._getRootModalViews()) {
				view = modalView.getViewByDomId(uiView?.tag);
				if (view) {
					break;
				}
			}
		}

		if (!view) {
			return;
		}

		const lastView = lastFocusedView?.deref();
		if (lastView && view !== lastView) {
			const lastFocusedUIView = lastView.nativeViewProtected as UIView;
			if (lastFocusedUIView) {
				lastFocusedView = null;

				notifyAccessibilityFocusState(lastView, false, true);
			}
		}

		lastFocusedView = new WeakRef(view);

		notifyAccessibilityFocusState(view, true, false);
	});

	Application.on(Application.exitEvent, () => {
		if (nativeFocusedNotificationObserver) {
			Application.ios.removeNotificationObserver(nativeFocusedNotificationObserver, UIAccessibilityElementFocusedNotification);
		}

		nativeFocusedNotificationObserver = null;
		lastFocusedView = null;
	});
}

export function updateAccessibilityProperties(view: View): void {
	const uiView = view.nativeViewProtected as UIView;
	if (!uiView) {
		return;
	}

	ensureNativeClasses();

	const accessibilityRole = view.accessibilityRole;
	const accessibilityState = view.accessibilityState;

	if (!view.accessible || view.accessibilityHidden) {
		uiView.accessibilityTraits = UIAccessibilityTraitNone;

		return;
	}

	// NOTE: left here for various core inspection passes while running the toolbox app
	// console.log('--- Accessible element: ', view.constructor.name);
	// console.log('accessibilityLabel: ', view.accessibilityLabel);
	// console.log('accessibilityRole: ', accessibilityRole);
	// console.log('accessibilityState: ', accessibilityState);
	// console.log('accessibilityValue: ', view.accessibilityValue);

	let a11yTraits = UIAccessibilityTraitNone;
	if (RoleTypeMap.has(accessibilityRole)) {
		a11yTraits |= RoleTypeMap.get(accessibilityRole);
	}

	switch (accessibilityRole) {
		case AccessibilityRole.Checkbox:
		case AccessibilityRole.RadioButton:
		case AccessibilityRole.Switch: {
			if (accessibilityState === AccessibilityState.Checked) {
				a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
			}
			break;
		}
		default: {
			if (accessibilityState === AccessibilityState.Selected) {
				a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.Selected);
			}
			if (accessibilityState === AccessibilityState.Disabled) {
				a11yTraits |= AccessibilityTraitsMap.get(AccessibilityTrait.NotEnabled);
			}
			break;
		}
	}

	const UpdatesFrequentlyTrait = AccessibilityTraitsMap.get(AccessibilityTrait.UpdatesFrequently);

	switch (view.accessibilityLiveRegion) {
		case AccessibilityLiveRegion.Polite:
		case AccessibilityLiveRegion.Assertive: {
			a11yTraits |= UpdatesFrequentlyTrait;
			break;
		}
		default: {
			a11yTraits &= ~UpdatesFrequentlyTrait;
			break;
		}
	}

	// NOTE: left here for various core inspection passes while running the toolbox app
	// if (view.accessibilityLiveRegion) {
	// 	console.log('accessibilityLiveRegion:', view.accessibilityLiveRegion);
	// }

	if (view.accessibilityMediaSession) {
		a11yTraits |= RoleTypeMap.get(AccessibilityRole.StartsMediaSession);
	}

	// NOTE: There were duplicated types in traits and roles previously which we conslidated
	// not sure if this is still needed
	// accessibilityTraits used to be stored on {N} view component but if the above
	// is combining all traits fresh each time through, don't believe we need to keep track or previous traits
	// if (view.accessibilityTraits) {
	// 	a11yTraits |= inputArrayToBitMask(view.accessibilityTraits, AccessibilityTraitsMap);
	// }

	// NOTE: left here for various core inspection passes while running the toolbox app
	// console.log('a11yTraits:', a11yTraits);
	// console.log('    ');

	uiView.accessibilityTraits = a11yTraits;
}
setA11yUpdatePropertiesCallback(updateAccessibilityProperties);

export const sendAccessibilityEvent = (): void => {};

export function isAccessibilityServiceEnabled(): boolean {
	const accessibilityServiceEnabled = isA11yEnabled();
	if (typeof accessibilityServiceEnabled === 'boolean') {
		return accessibilityServiceEnabled;
	}

	let isVoiceOverRunning: () => boolean;
	if (typeof UIAccessibilityIsVoiceOverRunning === 'function') {
		isVoiceOverRunning = UIAccessibilityIsVoiceOverRunning;
	} else {
		// iOS is too old to tell us if voice over is enabled
		if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
			setA11yEnabled(false);
			return isA11yEnabled();
		}
	}

	setA11yEnabled(isVoiceOverRunning());

	let voiceOverStatusChangedNotificationName: string | null = null;
	if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification !== 'undefined') {
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusDidChangeNotification;
	} else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusChanged;
	}

	if (voiceOverStatusChangedNotificationName) {
		nativeObserver = Application.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
			setA11yEnabled(isVoiceOverRunning());
		});

		Application.on(Application.exitEvent, () => {
			if (nativeObserver) {
				Application.ios.removeNotificationObserver(nativeObserver, voiceOverStatusChangedNotificationName);
			}

			setA11yEnabled(undefined);
			nativeObserver = null;
		});
	}

	Application.on(Application.resumeEvent, () => {
		setA11yEnabled(isVoiceOverRunning());
	});

	return isA11yEnabled();
}

export function getAndroidAccessibilityManager(): null {
	return null;
}

let sharedA11YObservable: SharedA11YObservable;
let nativeObserver;

function getSharedA11YObservable(): SharedA11YObservable {
	if (sharedA11YObservable) {
		return sharedA11YObservable;
	}

	sharedA11YObservable = new SharedA11YObservable();

	let isVoiceOverRunning: () => boolean;
	if (typeof UIAccessibilityIsVoiceOverRunning === 'function') {
		isVoiceOverRunning = UIAccessibilityIsVoiceOverRunning;
	} else {
		if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
			Trace.write(`UIAccessibilityIsVoiceOverRunning() - is not a function`, Trace.categories.Accessibility, Trace.messageType.error);

			isVoiceOverRunning = () => false;
		}
	}

	sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());

	let voiceOverStatusChangedNotificationName: string | null = null;
	if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification !== 'undefined') {
		// iOS 11+
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusDidChangeNotification;
	} else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
		// iOS <11
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusChanged;
	}

	if (voiceOverStatusChangedNotificationName) {
		nativeObserver = Application.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
			sharedA11YObservable?.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());
		});

		Application.on(Application.exitEvent, () => {
			if (nativeObserver) {
				Application.ios.removeNotificationObserver(nativeObserver, voiceOverStatusChangedNotificationName);
			}

			nativeObserver = null;

			if (sharedA11YObservable) {
				sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);

				sharedA11YObservable = null;
			}
		});
	}

	Application.on(Application.resumeEvent, () => sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning()));

	return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
	constructor() {
		super(getSharedA11YObservable());
	}
}

let accessibilityServiceObservable: AccessibilityServiceEnabledObservable;
export function ensureA11yClasses() {
	if (accessibilityServiceObservable) {
		return;
	}

	setFontScaleCssClasses(new Map(VALID_FONT_SCALES.map((fs) => [fs, `a11y-fontscale-${Number(fs * 100).toFixed(0)}`])));

	accessibilityServiceObservable = new AccessibilityServiceEnabledObservable();
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

export function initAccessibilityCssHelper(): void {
	ensureA11yClasses();
	updateCurrentHelperClasses(applyRootCssClass);
	applyFontScaleToRootViews();

	Application.on(Application.fontScaleChangedEvent, () => {
		updateCurrentHelperClasses(applyRootCssClass);
		applyFontScaleToRootViews();
	});

	accessibilityServiceObservable.on(AccessibilityServiceEnabledObservable.propertyChangeEvent, () => updateCurrentHelperClasses(applyRootCssClass));
}
setInitAccessibilityCssHelper(initAccessibilityCssHelper);

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
