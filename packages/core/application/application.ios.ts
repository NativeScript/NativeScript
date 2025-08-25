import { profile } from '../profiling';
import type { View } from '../ui/core/view';
import { isEmbedded } from '../ui/embedding';
import { IOSHelper } from '../ui/core/view/view-helper';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import { getWindow } from '../utils/native-helper';
import { SDK_VERSION } from '../utils/constants';
import { ios as iosUtils } from '../utils/native-helper';
import { ApplicationCommon, initializeSdkVersionClass, SceneEvents } from './application-common';
import { ApplicationEventData, SceneEventData } from './application-interfaces';
import { Observable } from '../data/observable';
import { Trace } from '../trace';
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
import { iosAddNotificationObserver, iosRemoveNotificationObserver } from './helpers';
import { getiOSWindow, setA11yUpdatePropertiesCallback, setApplicationPropertiesCallback, setAppMainEntry, setiOSWindow, setRootView, setToggleApplicationEventListenersCallback } from './helpers-common';

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
	private _window: UIWindow;
	private _scene: UIWindowScene;

	get window(): UIWindow {
		return this._window;
	}

	set window(value: UIWindow) {
		this._window = value;
	}

	sceneWillConnectToSessionOptions(scene: UIScene, session: UISceneSession, connectionOptions: UISceneConnectionOptions): void {
		// console.log('SceneDelegate.sceneWillConnectToSessionOptions called');
		// console.log('Scene type:', scene.constructor.name);
		// console.log('Session role:', session.role);

		if (!(scene instanceof UIWindowScene)) {
			// console.log('Scene is not a UIWindowScene, ignoring');
			return;
		}

		this._scene = scene;

		// Create window for this scene
		this._window = UIWindow.alloc().initWithWindowScene(scene);
		// console.log('Window created for scene');

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

	static ObjCProtocols = [UIWindowSceneDelegate];
}
// ensure available globally
global.SceneDelegate = SceneDelegate;

export class iOSApplication extends ApplicationCommon {
	private _delegate: UIApplicationDelegate;
	private _delegateHandlers = new Map<string, Array<Function>>();
	private _rootView: View;
	private _sceneDelegate: UIWindowSceneDelegate;
	private _windowSceneMap = new Map<UIScene, UIWindow>();
	private _primaryScene: UIWindowScene;

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
		return this._rootView;
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
		return iosAddNotificationObserver(notificationName, onReceiveCallback);
	}

	removeNotificationObserver(observer: any /* NotificationObserver */, notificationName: string) {
		iosRemoveNotificationObserver(observer, notificationName);
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
		console.log('notifyAppStarted!');
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
		const rootView = this.createRootView(view);
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
		const newOrientation = this.getOrientationValue(statusBarOrientation);
		this.setOrientation(newOrientation);
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
	}

	_getWindowForScene(scene: UIScene): UIWindow | undefined {
		return this._windowSceneMap.get(scene);
	}

	_setupWindowForScene(window: UIWindow, scene: UIWindowScene): void {
		if (!window) {
			return;
		}

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

	// Multi-window support methods
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
	ensureClasses();

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
