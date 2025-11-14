import { profile } from '../profiling';
import { ContentView } from '../ui/content-view';
import type { View } from '../ui/core/view';
import { isEmbedded } from '../ui/embedding';
import { IOSHelper } from '../ui/core/view/view-helper';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { getWindow } from '../utils/native-helper';
import { SDK_VERSION } from '../utils/constants';
import { ios as iosUtils, dataSerialize } from '../utils/native-helper';
import { ApplicationCommon, SceneEvents } from './application-common';
import { ApplicationEventData, SceneEventData } from './application-interfaces';
import { Observable } from '../data/observable';
import { Trace } from '../trace';

import { CoreTypes } from '../core-types';
import { getiOSWindow, setApplicationPropertiesCallback, setAppMainEntry, setiOSWindow, setRootView, setToggleApplicationEventListenersCallback } from './helpers-common';

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

if (supportsScenes()) {
	/**
	 * This method is called when a new scene session is being created.
	 * Important: When this method is implemented, the app assumes scene-based lifecycle management.
	 * Detected by the Info.plist existence 'UIApplicationSceneManifest'.
	 * If this method is implemented when there is no manifest defined,
	 * the app will boot to a white screen.
	 */
	(Responder.prototype as UIApplicationDelegate).applicationConfigurationForConnectingSceneSessionOptions = function (application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions): UISceneConfiguration {
		const config = UISceneConfiguration.configurationWithNameSessionRole('Default Configuration', connectingSceneSession.role);
		config.sceneClass = UIWindowScene as any;
		config.delegateClass = SceneDelegate;
		return config;
	};

	// scene session destruction handling
	(Responder.prototype as UIApplicationDelegate).applicationDidDiscardSceneSessions = function (application: UIApplication, sceneSessions: NSSet<UISceneSession>): void {
		// Note: we could emit an event here if needed
		// console.log('Scene sessions discarded:', sceneSessions.count);
	};
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

		this._scene = scene;

		// Create window for this scene
		this._window = UIWindow.alloc().initWithWindowScene(scene);

		// Store the window scene for this window
		Application.ios._setWindowForScene(this._window, scene);

		// Set up the window content
		Application.ios._setupWindowForScene(this._window, scene);

		// Notify that scene will connect
		Application.ios.notify({
			eventName: SceneEvents.sceneWillConnect,
			object: Application.ios,
			scene: scene,
			window: this._window,
			connectionOptions: connectionOptions,
		} as SceneEventData);

		if (scene === Application.ios.getPrimaryScene()) {
			// primary scene, activate right away
			this._window.makeKeyAndVisible();
		} else {
			// For secondary scenes, emit an event to allow developers to set up custom content for the window
			Application.ios.notify({
				eventName: SceneEvents.sceneContentSetup,
				object: Application.ios,
				scene: scene,
				window: this._window,
				connectionOptions: connectionOptions,
			} as SceneEventData);
		}

		// If this is the first scene, trigger app startup
		if (!Application.ios.getPrimaryScene()) {
			Application.ios._notifySceneAppStarted();
		}
	}
	sceneDidBecomeActive(scene: UIScene): void {
		// This will be handled by the notification observer in iOSApplication
		// The notification system will automatically trigger sceneDidActivate
	}

	sceneWillResignActive(scene: UIScene): void {
		// Notify that scene will resign active
		Application.ios.notify({
			eventName: SceneEvents.sceneWillResignActive,
			object: Application.ios,
			scene: scene,
		} as SceneEventData);
	}

	sceneWillEnterForeground(scene: UIScene): void {
		// This will be handled by the notification observer in iOSApplication
	}

	sceneDidEnterBackground(scene: UIScene): void {
		// This will be handled by the notification observer in iOSApplication
	}

	sceneDidDisconnect(scene: UIScene): void {
		// This will be handled by the notification observer in iOSApplication
	}
}
// ensure available globally
global.SceneDelegate = SceneDelegate;

export class iOSApplication extends ApplicationCommon {
	private _delegate: UIApplicationDelegate;
	private _delegateHandlers = new Map<string, Array<Function>>();
	private _rootView: View;
	private _subRootView: View;
	private _sceneDelegate: UIWindowSceneDelegate;
	private _windowSceneMap = new Map<UIScene, UIWindow>();
	private _primaryScene: UIWindowScene | null = null;
	private _openedScenesById = new Map<string, UIWindowScene>();

	private _notificationObservers: NotificationObserver[] = [];

	displayedOnce = false;
	displayedLinkTarget: CADisplayLinkTarget;
	displayedLink: CADisplayLink;

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

		// Add scene lifecycle notification observers only if scenes are supported
		if (this.supportsScenes()) {
			this.addNotificationObserver('UISceneWillConnectNotification', this.sceneWillConnect.bind(this));
			this.addNotificationObserver('UISceneDidActivateNotification', this.sceneDidActivate.bind(this));
			this.addNotificationObserver('UISceneWillEnterForegroundNotification', this.sceneWillEnterForeground.bind(this));
			this.addNotificationObserver('UISceneDidEnterBackgroundNotification', this.sceneDidEnterBackground.bind(this));
			this.addNotificationObserver('UISceneDidDisconnectNotification', this.sceneDidDisconnect.bind(this));
		}
	}

	getRootView(): View {
		return this._subRootView || this._rootView;
	}

	resetRootView(view?: View) {
		super.resetRootView(view);
		this.setWindowContent();
	}

	run(entry?: string | NavigationEntry): void {
		setAppMainEntry(typeof entry === 'string' ? { moduleName: entry } : entry);
		this.started = true;

		if (this.nativeApp) {
			this.runAsEmbeddedApp();
		} else {
			this.runAsMainApp();
		}
	}

	private runAsMainApp() {
		UIApplicationMain(0, null, null, this.delegate ? NSStringFromClass(this.delegate as any) : NSStringFromClass(Responder));
	}

	private runAsEmbeddedApp() {
		// TODO: this rootView should be held alive until rootController dismissViewController is called.
		const rootView = this.createRootView(this._rootView, true);
		if (!rootView) {
			return;
		}
		this._rootView = rootView;
		setRootView(rootView);
		// Attach to the existing iOS app
		const window = getWindow() as UIWindow;

		if (!window) {
			return;
		}

		const rootController = window.rootViewController;
		if (!rootController) {
			return;
		}

		const controller = this.getViewController(rootView);
		const embedderDelegate = NativeScriptEmbedder.sharedInstance().delegate;

		rootView._setupAsRootView({});

		rootView.on(IOSHelper.traitCollectionColorAppearanceChangedEvent, () => {
			const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
			const newSystemAppearance = this.getSystemAppearanceValue(userInterfaceStyle);
			this.setSystemAppearance(newSystemAppearance);
		});

		rootView.on(IOSHelper.traitCollectionLayoutDirectionChangedEvent, () => {
			const layoutDirection = controller.traitCollection.layoutDirection;
			const newLayoutDirection = this.getLayoutDirectionValue(layoutDirection);
			this.setLayoutDirection(newLayoutDirection);
		});

		if (embedderDelegate) {
			this.setViewControllerView(rootView);
			embedderDelegate.presentNativeScriptApp(controller);
		} else {
			const visibleVC = iosUtils.getVisibleViewController(rootController);
			visibleVC.presentViewControllerAnimatedCompletion(controller, true, null);
		}

		this.initRootView(rootView);
		this.notifyAppStarted();
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
		}
	}

	addDelegateHandler<T extends keyof UIApplicationDelegate>(methodName: T, handler: (typeof UIApplicationDelegate.prototype)[T]): void {
		// safe-guard against invalid handlers
		if (typeof handler !== 'function') {
			return;
		}

		// ensure we have a delegate
		this.delegate ??= Responder as any;

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
		return this.getOrientationValue(statusBarOrientation)[0];
	}

	private getOrientationValue(orientation: number): ['portrait' | 'landscape' | 'unknown', number] {
		let newOrientation: 'portrait' | 'landscape' | 'unknown' = 'unknown';
		let degrees = 0;
		switch (orientation) {
			case UIInterfaceOrientation.LandscapeRight:
				newOrientation = 'landscape';
				degrees = 90;
				break;
			case UIInterfaceOrientation.LandscapeLeft:
				newOrientation = 'landscape';
				degrees = 270;
				break;
			case UIInterfaceOrientation.PortraitUpsideDown:
				newOrientation =  'portrait';
				degrees = 180;
				break;
			case UIInterfaceOrientation.Portrait:
				newOrientation =  'portrait';
				degrees = 0;
				break;
		}
		return [newOrientation, degrees];
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

	// Public method for scene-based app startup
	_notifySceneAppStarted() {
		this.notifyAppStarted();
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
		if (this._rootView) {
			// if we already have a root view, we reset it.
			this._rootView._onRootViewReset();
		}

		// TODO: using import crashes. it creates a circular dependency  which is tricky to fix right now

		const rootView = new ContentView();
		const controller = this.getViewController(rootView);

		this._rootView = rootView;
		setRootView(rootView);

		// setup view as styleScopeHost
		rootView._setupAsRootView({});

		this.setViewControllerView(rootView);

		const win = this.window;

		const haveController = win.rootViewController !== null;
		win.rootViewController = controller;

		if (!haveController) {
			win.makeKeyAndVisible();
		}

		this.initRootView(rootView);
		rootView.on(IOSHelper.traitCollectionColorAppearanceChangedEvent, () => {
			const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
			const newSystemAppearance = this.getSystemAppearanceValue(userInterfaceStyle);

			this.setSystemAppearance(newSystemAppearance);
		});

		rootView.on(IOSHelper.traitCollectionLayoutDirectionChangedEvent, () => {
			const layoutDirection = controller.traitCollection.layoutDirection;
			const newLayoutDirection = this.getLayoutDirectionValue(layoutDirection);
			this.setLayoutDirection(newLayoutDirection);
		});
		let subRootView = this._subRootView;

		subRootView = this.createRootView(view);
		if (!subRootView) {
			// no root view created
			return;
		}
		this._subRootView = subRootView;
		if (subRootView.parent) {
			subRootView.parent._removeView(subRootView);
		}
		(rootView as ContentView).content = subRootView;
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

			this.notifyAppStarted(notification);
		} else {
			// Scene-based app - window creation will happen in scene delegate
		}
	}

	@profile
	private didBecomeActive(notification: NSNotification) {
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

	private didEnterBackground(notification: NSNotification) {
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
		const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
		const [newOrientation, degrees] = this.getOrientationValue(statusBarOrientation);
		this.setOrientation(newOrientation, degrees);
	}

	// Scene lifecycle notification handlers
	private sceneWillConnect(notification: NSNotification) {
		const scene = notification.object as UIWindowScene;
		if (!scene || !(scene instanceof UIWindowScene)) {
			return;
		}

		// Store as primary scene if it's the first one
		if (!this._primaryScene) {
			this._primaryScene = scene;
		}

		this.notify({
			eventName: SceneEvents.sceneWillConnect,
			object: this,
			scene: scene,
			userInfo: notification.userInfo,
		} as SceneEventData);
	}

	private sceneDidActivate(notification: NSNotification) {
		const scene = notification.object as UIScene;
		this.notify({
			eventName: SceneEvents.sceneDidActivate,
			object: this,
			scene: scene,
		} as SceneEventData);

		// If this is the primary scene, trigger traditional app lifecycle
		if (scene === this._primaryScene) {
			const additionalData = {
				ios: UIApplication.sharedApplication,
				scene: scene,
			};
			this.setInBackground(false, additionalData);
			this.setSuspended(false, additionalData);

			if (this._rootView && !this._rootView.isLoaded) {
				this._rootView.callLoaded();
			}
		}
	}

	private sceneWillEnterForeground(notification: NSNotification) {
		const scene = notification.object as UIScene;
		this.notify({
			eventName: SceneEvents.sceneWillEnterForeground,
			object: this,
			scene: scene,
		} as SceneEventData);
	}

	private sceneDidEnterBackground(notification: NSNotification) {
		const scene = notification.object as UIScene;
		this.notify({
			eventName: SceneEvents.sceneDidEnterBackground,
			object: this,
			scene: scene,
		} as SceneEventData);

		// If this is the primary scene, trigger traditional app lifecycle
		if (scene === this._primaryScene) {
			const additionalData = {
				ios: UIApplication.sharedApplication,
				scene: scene,
			};
			this.setInBackground(true, additionalData);
			this.setSuspended(true, additionalData);

			if (this._rootView && this._rootView.isLoaded) {
				this._rootView.callUnloaded();
			}
		}
	}

	private sceneDidDisconnect(notification: NSNotification) {
		const scene = notification.object as UIScene;
		this._removeWindowForScene(scene);

		// If primary scene disconnected, clear it
		if (scene === this._primaryScene) {
			this._primaryScene = null;
		}

		if (this._primaryScene) {
			if (SDK_VERSION >= 17) {
				const request = UISceneSessionActivationRequest.requestWithSession(this._primaryScene.session);

				UIApplication.sharedApplication.activateSceneSessionForRequestErrorHandler(request, (err: NSError) => {
					if (err) {
						console.log('Failed to activate primary scene:', err.localizedDescription);
					}
				});
			} else {
				UIApplication.sharedApplication.requestSceneSessionActivationUserActivityOptionsErrorHandler(this._primaryScene.session, null, null, (err: NSError) => {
					if (err) {
						console.log('Failed to activate primary scene (legacy):', err.localizedDescription);
					}
				});
			}
		}

		this.notify({
			eventName: SceneEvents.sceneDidDisconnect,
			object: this,
			scene: scene,
		} as SceneEventData);
	}

	// Scene management helper methods
	_setWindowForScene(window: UIWindow, scene: UIScene): void {
		this._windowSceneMap.set(scene, window);
	}

	_removeWindowForScene(scene: UIScene): void {
		this._windowSceneMap.delete(scene);
		// also untrack opened scene id
		try {
			const s: any = scene as any;
			if (s && s.session) {
				const id = this._getSceneId(s as UIWindowScene);
				this._openedScenesById.delete(id);
			}
		} catch {}
	}

	_getWindowForScene(scene: UIScene): UIWindow | undefined {
		return this._windowSceneMap.get(scene);
	}

	_setupWindowForScene(window: UIWindow, scene: UIWindowScene): void {
		if (!window) {
			return;
		}

		// track opened scene
		try {
			const id = this._getSceneId(scene);
			this._openedScenesById.set(id, scene);
		} catch {}

		// Set up window background
		if (!__VISIONOS__) {
			window.backgroundColor = SDK_VERSION <= 12 || !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;
		}

		// If this is the primary scene, set up the main application content
		if (scene === this._primaryScene || !this._primaryScene) {
			this._primaryScene = scene;

			if (!getiOSWindow()) {
				setiOSWindow(window);
			}

			// Set up the window content for the primary scene
			this.setWindowContent();
		}
	}

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
	 * Opens a new window with the specified data.
	 * @param data The data to pass to the new window.
	 */
	openWindow(data: Record<any, any>) {
		if (!supportsMultipleScenes()) {
			console.log('Cannot create a new scene - not supported on this device.');
			return;
		}

		try {
			const app = UIApplication.sharedApplication;

			// iOS 17+
			if (SDK_VERSION >= 17) {
				// Create a new scene activation request with proper role
				let request: UISceneSessionActivationRequest;

				try {
					// Use the correct factory method to create request with role
					// Based on the type definitions, this is the proper way
					request = UISceneSessionActivationRequest.requestWithRole(UIWindowSceneSessionRoleApplication);

					// Note: may be useful to allow user defined activity type through optional string typed data in future
					const activity = NSUserActivity.alloc().initWithActivityType(`${NSBundle.mainBundle.bundleIdentifier}.scene`);
					activity.userInfo = dataSerialize(data);
					request.userActivity = activity;

					// Set proper options with requesting scene
					const options = UISceneActivationRequestOptions.new();

					// Note: explore secondary windows spawning other windows
					// and if this context needs to change in those cases
					const mainWindow = Application.ios.getPrimaryWindow();
					options.requestingScene = mainWindow?.windowScene;

					/**
					 * Note: This does not work in testing but worth exploring further sometime
					 * regarding the size/dimensions of opened secondary windows.
					 * The initial size is ultimately determined by the system
					 * based on available space and user context.
					 */
					// Get the size restrictions from the window scene
					// const sizeRestrictions = (options.requestingScene as UIWindowScene).sizeRestrictions;

					// // Set your minimum and maximum dimensions
					// sizeRestrictions.minimumSize = CGSizeMake(320, 400);
					// sizeRestrictions.maximumSize = CGSizeMake(600, 800);

					request.options = options;
				} catch (roleError) {
					console.log('Error creating request:', roleError);
					return;
				}

				app.activateSceneSessionForRequestErrorHandler(request, (error) => {
					if (error) {
						console.log('Error creating new scene (iOS 17+):', error);

						// Log additional debugging info
						if (error.userInfo) {
							console.error(`Error userInfo: ${error.userInfo.description}`);
						}

						// Handle specific error types
						if (error.localizedDescription.includes('role') && error.localizedDescription.includes('nil')) {
							this.createSceneWithLegacyAPI(data);
						} else if (error.domain === 'FBSWorkspaceErrorDomain' && error.code === 2) {
							this.createSceneWithLegacyAPI(data);
						}
					}
				});
			}
			// iOS 13-16 - Use the legacy requestSceneSessionActivationUserActivityOptionsErrorHandler method
			else if (SDK_VERSION >= 13 && SDK_VERSION < 17) {
				app.requestSceneSessionActivationUserActivityOptionsErrorHandler(
					null, // session
					null, // userActivity
					null, // options
					(error) => {
						if (error) {
							console.log('Error creating new scene (legacy):', error);
						}
					},
				);
			}
			// Fallback for older iOS versions or unsupported configurations
			else {
				console.log('Neither new nor legacy scene activation methods are available');
			}
		} catch (error) {
			console.error('Error requesting new scene:', error);
		}
	}

	/**
	 * Closes a secondary window/scene.
	 * Usage examples:
	 *  - Application.ios.closeWindow() // best-effort close of a non-primary scene
	 *  - Application.ios.closeWindow(button) // from a tap handler within the scene
	 *  - Application.ios.closeWindow(window)
	 *  - Application.ios.closeWindow(scene)
	 *  - Application.ios.closeWindow('scene-id')
	 */
	public closeWindow(target?: View | UIWindow | UIWindowScene | string): void {
		if (!__APPLE__) {
			return;
		}
		try {
			const scene = this._resolveScene(target);
			if (!scene) {
				console.log('closeWindow: No scene resolved for target');
				return;
			}

			// Don't allow closing the primary scene
			if (scene === this._primaryScene) {
				console.log('closeWindow: Refusing to close the primary scene');
				return;
			}

			const session = scene.session;
			if (!session) {
				console.log('closeWindow: Scene has no session to destroy');
				return;
			}

			const app = UIApplication.sharedApplication;
			if (app.requestSceneSessionDestructionOptionsErrorHandler) {
				app.requestSceneSessionDestructionOptionsErrorHandler(session, null, (error: NSError) => {
					if (error) {
						console.log('closeWindow: destruction error', error);
					} else {
						// clean up tracked id
						const id = this._getSceneId(scene);
						this._openedScenesById.delete(id);
					}
				});
			} else {
				console.info('closeWindow: Scene destruction API not available on this iOS version');
			}
		} catch (err) {
			console.log('closeWindow: Unexpected error', err);
		}
	}

	getAllWindows(): UIWindow[] {
		return Array.from(this._windowSceneMap.values());
	}

	getAllScenes(): UIScene[] {
		return Array.from(this._windowSceneMap.keys());
	}

	getWindowScenes(): UIWindowScene[] {
		return this.getAllScenes().filter((scene) => scene instanceof UIWindowScene) as UIWindowScene[];
	}

	getPrimaryWindow(): UIWindow {
		if (this._primaryScene) {
			return this._getWindowForScene(this._primaryScene) || getiOSWindow();
		}
		return getiOSWindow();
	}

	getPrimaryScene(): UIWindowScene | null {
		return this._primaryScene;
	}

	// Scene lifecycle management
	supportsScenes(): boolean {
		return supportsScenes();
	}

	supportsMultipleScenes(): boolean {
		return supportsMultipleScenes();
	}

	isUsingSceneLifecycle(): boolean {
		return this.supportsScenes() && this._windowSceneMap.size > 0;
	}

	// Call this to set up scene-based configuration
	configureForScenes(): void {
		if (!this.supportsScenes()) {
			console.warn('Scene-based lifecycle is only supported on iOS 13+ iPad or visionOS with multi-scene enabled apps.');
			return;
		}

		// Additional scene configuration can be added here
		// For now, the notification observers are already set up in the constructor
	}

	// Stable scene id for lookups
	private _getSceneId(scene: UIWindowScene): string {
		try {
			if (!scene) {
				return 'Unknown';
			}
			// Prefer session persistentIdentifier when available (stable across lifetime)
			const session = scene.session;
			const persistentId = session && session.persistentIdentifier;
			if (persistentId) {
				return `${persistentId}`;
			}
			// Fallbacks
			if (scene.hash != null) {
				return `${scene.hash}`;
			}
			const desc = scene.description;
			if (desc) {
				return `${desc}`;
			}
		} catch (err) {
			// ignore
		}
		return 'Unknown';
	}

	// Resolve a UIWindowScene from various input types
	private _resolveScene(target?: any): UIWindowScene | null {
		if (!__APPLE__) {
			return null;
		}
		if (!target) {
			// Try to pick a non-primary foreground active scene, else last known scene
			const scenes = this.getWindowScenes?.() || [];
			const nonPrimary = scenes.filter((s) => s !== this._primaryScene);
			return nonPrimary[0] || scenes[0] || null;
		}
		// If a View was passed, derive its window.scene
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
			if (this._openedScenesById.has(target)) {
				return this._openedScenesById.get(target);
			}
			// Try matching by persistentIdentifier or hash among known scenes
			const scenes = this.getWindowScenes?.() || [];
			for (const s of scenes) {
				const sid = this._getSceneId(s);
				if (sid === target) {
					return s;
				}
			}
		}
		return null;
	}

	private createSceneWithLegacyAPI(data: Record<any, any>) {
		const windowScene = this.window?.windowScene;

		if (!windowScene) {
			return;
		}

		// Create user activity for the new scene
		const userActivity = NSUserActivity.alloc().initWithActivityType(`${NSBundle.mainBundle.bundleIdentifier}.scene`);
		userActivity.userInfo = dataSerialize(data);

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
export const Application = iosApp;
export const AndroidApplication = undefined;

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