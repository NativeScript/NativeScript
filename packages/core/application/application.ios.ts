import { profile } from '../profiling';
import { View } from '../ui';
import { IOSHelper } from '../ui/core/view/view-helper';
import { NavigationEntry } from '../ui/frame/frame-interfaces';
import * as Utils from '../utils';
import type { iOSApplication as IiOSApplication } from './application';
import { ApplicationCommon } from './application-common';
import { ApplicationEventData } from './application-interfaces';

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
class Responder extends UIResponder implements UIApplicationDelegate {
	get window(): UIWindow {
		return Application.ios.window;
	}

	set window(value: UIWindow) {
		// NOOP
	}

	static ObjCProtocols = [UIApplicationDelegate];
}

export class iOSApplication extends ApplicationCommon implements IiOSApplication {
	private _delegate: UIApplicationDelegate;
	private _window: UIWindow;
	private _notificationObservers: NotificationObserver[] = [];
	private _rootView: View;

	displayedOnce = false;
	displayedLinkTarget: CADisplayLinkTarget;
	displayedLink: CADisplayLink;

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

	resetRootView(view?: View) {
		super.resetRootView(view);
		this.setWindowContent();
	}

	run(entry?: string | NavigationEntry): void {
		this.mainEntry = typeof entry === 'string' ? { moduleName: entry } : entry;
		this.started = true;

		if (this.nativeApp) {
			this.runAsEmbeddedApp();
		} else {
			this.runAsMainApp();
		}
	}

	private runAsMainApp() {
		console.log('runAsMainApp', this.delegate);
		UIApplicationMain(0, null, null, this.delegate ? NSStringFromClass(this.delegate as any) : NSStringFromClass(Responder));
	}

	private runAsEmbeddedApp() {
		// TODO: this rootView should be held alive until rootController dismissViewController is called.
		const rootView = this.createRootView();
		if (!rootView) {
			return;
		}
		// Attach to the existing iOS app
		const window = this.nativeApp.keyWindow || (this.nativeApp.windows.count > 0 && this.nativeApp.windows[0]);

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
			const visibleVC = Utils.ios.getVisibleViewController(rootController);
			visibleVC.presentViewControllerAnimatedCompletion(controller, true, null);
		}

		this.initRootView();
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
				const deviceMaxFrames = UIScreen.mainScreen?.maximumFramesPerSecond;
				if (options?.max) {
					if (deviceMaxFrames) {
						// iOS 10.3
						max = options.max <= deviceMaxFrames ? options.max : deviceMaxFrames;
					} else if (this.displayedLink.preferredFramesPerSecond) {
						// iOS 10.0
						max = options.max <= this.displayedLink.preferredFramesPerSecond ? options.max : this.displayedLink.preferredFramesPerSecond;
					}
				}

				if (Utils.ios.MajorVersion >= 15) {
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
		return this.window.rootViewController;
	}

	get nativeApp() {
		return UIApplication.sharedApplication;
	}

	get window(): UIWindow {
		if (NativeScriptEmbedder.sharedInstance().delegate && !this._window) {
			this._window = UIApplication.sharedApplication.keyWindow;
		}

		return this._window;
	}

	get delegate(): UIApplicationDelegate {
		return this._delegate;
	}

	set delegate(value: UIApplicationDelegate | unknown) {
		if (this._delegate !== value) {
			this._delegate = value as UIApplicationDelegate;
		}
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

	removeNotificationObserver(observer: any, notificationName: string) {
		const index = this._notificationObservers.indexOf(observer);
		if (index >= 0) {
			this._notificationObservers.splice(index, 1);
			NSNotificationCenter.defaultCenter.removeObserverNameObject(observer, notificationName, null);
		}
	}

	protected getSystemAppearance(): 'light' | 'dark' {
		// userInterfaceStyle is available on UITraitCollection since iOS 12.
		if (Utils.ios.MajorVersion <= 11 || !this.rootController) {
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
		const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
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

		if (this._window) {
			if (root !== null && !NativeScriptEmbedder.sharedInstance().delegate) {
				this.setWindowContent(root);
			}
		} else {
			this._window = UIApplication.sharedApplication.keyWindow;
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

		// setup view as styleScopeHost
		rootView._setupAsRootView({});

		this.setViewControllerView(rootView);

		const haveController = this._window.rootViewController !== null;
		this._window.rootViewController = controller;

		if (!haveController) {
			this._window.makeKeyAndVisible();
		}

		this.initRootView();

		rootView.on(IOSHelper.traitCollectionColorAppearanceChangedEvent, () => {
			const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
			const newSystemAppearance = this.getSystemAppearanceValue(userInterfaceStyle);

			this.setSystemAppearance(newSystemAppearance);
		});
	}

	// Observers
	@profile
	private didFinishLaunchingWithOptions(notification: NSNotification) {
		this.setMaxRefreshRate();

		this._window = UIWindow.alloc().initWithFrame(UIScreen.mainScreen.bounds);

		// TODO: Expose Window module so that it can we styled from XML & CSS
		this._window.backgroundColor = Utils.ios.MajorVersion <= 12 || !UIColor.systemBackgroundColor ? UIColor.whiteColor : UIColor.systemBackgroundColor;

		this.notifyAppStarted(notification);
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

	get ios() {
		// ensures Application.ios is defined when running on iOS
		return this;
	}
}
export * from './application-common';
export const Application = new iOSApplication();
export const AndroidApplication = undefined;
