import {
    ApplicationEventData,
    CssChangedEventData,
    iOSApplication as IOSApplicationDefinition,
    LaunchEventData,
    LoadAppCSSEventData,
    OrientationChangedEventData,
    SystemAppearanceChangedEventData
} from ".";

import {
    displayedEvent, exitEvent, getCssFileName, launchEvent, livesync, lowMemoryEvent, notify, on,
    orientationChanged, orientationChangedEvent, resumeEvent, setApplication, suspendEvent,
    systemAppearanceChanged, systemAppearanceChangedEvent
} from "./application-common";

// First reexport so that app module is initialized.
export * from "./application-common";

// TODO: Remove this and get it from global to decouple builder for angular
import { Builder } from "../ui/builder";
import {
    CLASS_PREFIX,
    getRootViewCssClasses,
    pushToRootViewCssClasses,
    resetRootViewCssClasses
} from "../css/system-classes";

import { ios as iosView, View } from "../ui/core/view";
import { Frame, NavigationEntry } from "../ui/frame";
import { device } from "../platform/platform";
import { profile } from "../profiling";
import { ios } from "../utils/utils";

const IOS_PLATFORM = "ios";

const getVisibleViewController = ios.getVisibleViewController;
const majorVersion = ios.MajorVersion;

// NOTE: UIResponder with implementation of window - related to https://github.com/NativeScript/ios-runtime/issues/430
// TODO: Refactor the UIResponder to use Typescript extends when this issue is resolved:
// https://github.com/NativeScript/ios-runtime/issues/1012
const Responder = (<any>UIResponder).extend({
    get window() {
        return iosApp ? iosApp.window : undefined;
    },
    set window(setWindow) {
        // NOOP
    }
}, {
    protocols: [UIApplicationDelegate]
}
);

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
        "onReceive": { returns: interop.types.void, params: [NSNotification] }
    };
}

let displayedOnce = false;
let displayedLinkTarget;
let displayedLink;
class CADisplayLinkTarget extends NSObject {
    onDisplayed(link: CADisplayLink) {
        link.invalidate();
        const ios = UIApplication.sharedApplication;
        const object = iosApp;
        displayedOnce = true;
        notify(<ApplicationEventData>{ eventName: displayedEvent, object, ios });
        displayedLinkTarget = null;
        displayedLink = null;
    }
    public static ObjCExposedMethods = {
        "onDisplayed": { returns: interop.types.void, params: [CADisplayLink] }
    };
}

class IOSApplication implements IOSApplicationDefinition {
    private _backgroundColor = majorVersion <= 12 ? UIColor.whiteColor : UIColor.systemBackgroundColor;
    private _delegate: typeof UIApplicationDelegate;
    private _window: UIWindow;
    private _observers: Array<NotificationObserver>;
    private _orientation: "portrait" | "landscape" | "unknown";
    private _rootView: View;
    private _systemAppearance: "light" | "dark";

    constructor() {
        this._observers = new Array<NotificationObserver>();
        this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions.bind(this));
        this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive.bind(this));
        this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground.bind(this));
        this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate.bind(this));
        this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning.bind(this));
        this.addNotificationObserver(UIApplicationDidChangeStatusBarOrientationNotification, this.didChangeStatusBarOrientation.bind(this));
    }

    get orientation(): "portrait" | "landscape" | "unknown" {
        if (!this._orientation) {
            const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
            this._orientation = this.getOrientationValue(statusBarOrientation);
        }

        return this._orientation;
    }

    get rootController(): UIViewController {
        return this._window.rootViewController;
    }

    get systemAppearance(): "light" | "dark" | null {

        // userInterfaceStyle is available on UITraitCollection since iOS 12.
        if (majorVersion <= 11) {
            return null;
        }

        if (!this._systemAppearance) {
            const userInterfaceStyle = this.rootController.traitCollection.userInterfaceStyle;
            this._systemAppearance = getSystemAppearanceValue(userInterfaceStyle);
        }

        return this._systemAppearance;
    }

    get nativeApp(): UIApplication {
        return UIApplication.sharedApplication;
    }

    get window(): UIWindow {
        return this._window;
    }

    get delegate(): typeof UIApplicationDelegate {
        return this._delegate;
    }

    set delegate(value: typeof UIApplicationDelegate) {
        if (this._delegate !== value) {
            this._delegate = value;
        }
    }

    get rootView(): View {
        return this._rootView;
    }

    public addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
        const observer = NotificationObserver.initWithCallback(onReceiveCallback);
        NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(observer, "onReceive", notificationName, null);
        this._observers.push(observer);

        return observer;
    }

    public removeNotificationObserver(observer: any, notificationName: string) {
        const index = this._observers.indexOf(observer);
        if (index >= 0) {
            this._observers.splice(index, 1);
            NSNotificationCenter.defaultCenter.removeObserverNameObject(observer, notificationName, null);
        }
    }

    @profile
    private didFinishLaunchingWithOptions(notification: NSNotification) {
        if (!displayedOnce) {
            displayedLinkTarget = CADisplayLinkTarget.new();
            displayedLink = CADisplayLink.displayLinkWithTargetSelector(displayedLinkTarget, "onDisplayed");
            displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, NSDefaultRunLoopMode);
            displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, UITrackingRunLoopMode);
        }

        this._window = UIWindow.alloc().initWithFrame(UIScreen.mainScreen.bounds);
        // TODO: Expose Window module so that it can we styled from XML & CSS
        this._window.backgroundColor = this._backgroundColor;

        this.notifyAppStarted(notification);
    }

    public notifyAppStarted(notification?: NSNotification) {
        const args: LaunchEventData = {
            eventName: launchEvent,
            object: this,
            ios: notification && notification.userInfo && notification.userInfo.objectForKey("UIApplicationLaunchOptionsLocalNotificationKey") || null
        };

        notify(args);
        notify(<LoadAppCSSEventData>{ eventName: "loadAppCss", object: <any>this, cssFile: getCssFileName() });

        // this._window will be undefined when NS app is embedded in a native one
        if (this._window) {
            this.setWindowContent(args.root);
        } else {
            this._window = UIApplication.sharedApplication.delegate.window;
        }
    }

    @profile
    private didBecomeActive(notification: NSNotification) {
        const ios = UIApplication.sharedApplication;
        const object = this;
        notify(<ApplicationEventData>{ eventName: resumeEvent, object, ios });
        const rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.callLoaded();
        }
    }

    private didEnterBackground(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: suspendEvent, object: this, ios: UIApplication.sharedApplication });
        const rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.callUnloaded();
        }
    }

    private willTerminate(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: exitEvent, object: this, ios: UIApplication.sharedApplication });
        const rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.callUnloaded();
        }
    }

    private didChangeStatusBarOrientation(notification: NSNotification) {
        const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
        const newOrientation = this.getOrientationValue(statusBarOrientation);

        if (this._orientation !== newOrientation) {
            this._orientation = newOrientation;
            orientationChanged(getRootView(), newOrientation);

            notify(<OrientationChangedEventData>{
                eventName: orientationChangedEvent,
                ios: this,
                newValue: this._orientation,
                object: this
            });
        }
    }

    private didReceiveMemoryWarning(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: lowMemoryEvent, object: this, ios: UIApplication.sharedApplication });
    }

    private getOrientationValue(orientation: number): "portrait" | "landscape" | "unknown" {
        switch (orientation) {
            case UIInterfaceOrientation.LandscapeRight:
            case UIInterfaceOrientation.LandscapeLeft:
                return "landscape";
            case UIInterfaceOrientation.PortraitUpsideDown:
            case UIInterfaceOrientation.Portrait:
                return "portrait";
            case UIInterfaceOrientation.Unknown:
                return "unknown";
        }
    }

    public _onLivesync(context?: ModuleContext): void {
        // Handle application root module
        const isAppRootModuleChanged = context && context.path && context.path.includes(getMainEntry().moduleName) && context.type !== "style";

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

    public setWindowContent(view?: View): void {
        if (this._rootView) {
            // if we already have a root view, we reset it.
            this._rootView._onRootViewReset();
        }
        const rootView = createRootView(view);
        const controller = getViewController(rootView);

        this._rootView = rootView;

        if (createRootFrame.value) {
            // Don't setup as styleScopeHost
            rootView._setupUI({});
        } else {
            // setup view as styleScopeHost
            rootView._setupAsRootView({});
        }
        setViewControllerView(rootView);
        const haveController = this._window.rootViewController !== null;
        this._window.rootViewController = controller;
        if (!haveController) {
            this._window.makeKeyAndVisible();
        }

        setupRootViewCssClasses(rootView);
        rootView.on(iosView.traitCollectionColorAppearanceChangedEvent, () => {
            const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
            const newSystemAppearance = getSystemAppearanceValue(userInterfaceStyle);

            if (this._systemAppearance !== newSystemAppearance) {
                this._systemAppearance = newSystemAppearance;
                systemAppearanceChanged(rootView, newSystemAppearance);

                notify(<SystemAppearanceChangedEventData>{
                    eventName: systemAppearanceChangedEvent,
                    ios: this,
                    newValue: this._systemAppearance,
                    object: this
                });
            }
        });
    }
}

const iosApp = new IOSApplication();

export { iosApp as ios };
setApplication(iosApp);

// attach on global, so it can be overwritten in NativeScript Angular
(<any>global).__onLiveSyncCore = function (context?: ModuleContext) {
    iosApp._onLivesync(context);
};

let mainEntry: NavigationEntry;

function createRootView(v?: View) {
    let rootView = v;
    if (!rootView) {
        // try to navigate to the mainEntry (if specified)
        if (!mainEntry) {
            throw new Error("Main entry is missing. App cannot be started. Verify app bootstrap.");
        } else {
            if (createRootFrame.value) {
                const frame = rootView = new Frame();
                frame.navigate(mainEntry);
            } else {
                rootView = Builder.createViewFromEntry(mainEntry);
            }
        }
    }

    return rootView;
}

export function getMainEntry() {
    return mainEntry;
}

export function getRootView() {
    return iosApp.rootView;
}

// NOTE: for backwards compatibility. Remove for 4.0.0.
const createRootFrame = { value: true };
let started: boolean = false;
export function _start(entry?: string | NavigationEntry) {
    mainEntry = typeof entry === "string" ? { moduleName: entry } : entry;
    started = true;

    if (!iosApp.nativeApp) {
        // Normal NativeScript app will need UIApplicationMain.
        UIApplicationMain(0, null, null, iosApp && iosApp.delegate ? NSStringFromClass(<any>iosApp.delegate) : NSStringFromClass(Responder));
    } else {
        // TODO: this rootView should be held alive until rootController dismissViewController is called.
        const rootView = createRootView();
        if (rootView) {
            // Attach to the existing iOS app
            const window = iosApp.nativeApp.keyWindow || (iosApp.nativeApp.windows.count > 0 && iosApp.nativeApp.windows[0]);
            if (window) {
                const rootController = window.rootViewController;
                if (rootController) {
                    const controller = getViewController(rootView);
                    rootView._setupAsRootView({});
                    let embedderDelegate = NativeScriptEmbedder.sharedInstance().delegate;
                    if (embedderDelegate) {
                        embedderDelegate.presentNativeScriptApp(controller);
                    } else {
                        let visibleVC = getVisibleViewController(rootController);
                        visibleVC.presentViewControllerAnimatedCompletion(controller, true, null);
                    }

                    // Mind root view CSS classes in future work
                    // on embedding NativeScript applications
                    setupRootViewCssClasses(rootView);
                    rootView.on(iosView.traitCollectionColorAppearanceChangedEvent, () => {
                        const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
                        const newSystemAppearance = getSystemAppearanceValue(userInterfaceStyle);

                        if (this._systemAppearance !== newSystemAppearance) {
                            this._systemAppearance = newSystemAppearance;

                            notify(<SystemAppearanceChangedEventData>{
                                eventName: systemAppearanceChangedEvent,
                                ios: this,
                                newValue: this._systemAppearance,
                                object: this
                            });
                        }
                    });
                    iosApp.notifyAppStarted();
                }
            }
        }
    }
}

export function run(entry?: string | NavigationEntry) {
    createRootFrame.value = false;
    _start(entry);
}

export function addCss(cssText: string, attributeScoped?: boolean): void {
    notify(<CssChangedEventData>{ eventName: "cssChanged", object: <any>iosApp, cssText: cssText });
    if (!attributeScoped) {
        const rootView = getRootView();
        if (rootView) {
            rootView._onCssStateChange();
        }
    }
}

export function _resetRootView(entry?: NavigationEntry | string) {
    createRootFrame.value = false;
    mainEntry = typeof entry === "string" ? { moduleName: entry } : entry;
    iosApp.setWindowContent();
}

export function getNativeApplication(): UIApplication {
    return iosApp.nativeApp;
}

function getSystemAppearanceValue(userInterfaceStyle: number): "dark" | "light" {
    switch (userInterfaceStyle) {
        case UIUserInterfaceStyle.Dark:
            return "dark";
        case UIUserInterfaceStyle.Light:
        case UIUserInterfaceStyle.Unspecified:
            return "light";
    }
}

function getViewController(rootView: View): UIViewController {
    let viewController: UIViewController = rootView.viewController || rootView.ios;

    if (!(viewController instanceof UIViewController)) {
        // We set UILayoutViewController dynamically to the root view if it doesn't have a view controller
        // At the moment the root view doesn't have its native view created. We set it in the setViewControllerView func
        viewController = iosView.UILayoutViewController.initWithOwner(new WeakRef(rootView)) as UIViewController;
        rootView.viewController = viewController;
    }

    return viewController;
}

function setViewControllerView(view: View): void {
    const viewController: UIViewController = view.viewController || view.ios;
    const nativeView = view.ios || view.nativeViewProtected;

    if (!nativeView || !viewController) {
        throw new Error("Root should be either UIViewController or UIView");
    }

    if (viewController instanceof iosView.UILayoutViewController) {
        viewController.view.addSubview(nativeView);
    }
}

function setupRootViewCssClasses(rootView: View): void {
    resetRootViewCssClasses();

    const deviceType = device.deviceType.toLowerCase();
    pushToRootViewCssClasses(`${CLASS_PREFIX}${IOS_PLATFORM}`);
    pushToRootViewCssClasses(`${CLASS_PREFIX}${deviceType}`);
    pushToRootViewCssClasses(`${CLASS_PREFIX}${iosApp.orientation}`);

    if (majorVersion >= 13) {
        pushToRootViewCssClasses(`${CLASS_PREFIX}${iosApp.systemAppearance}`);
    }

    const rootViewCssClasses = getRootViewCssClasses();
    rootViewCssClasses.forEach(c => rootView.cssClasses.add(c));
}

export function orientation(): "portrait" | "landscape" | "unknown" {
    return iosApp.orientation;
}

export function systemAppearance(): "dark" | "light" {
    return iosApp.systemAppearance;
}

global.__onLiveSync = function __onLiveSync(context?: ModuleContext) {
    if (!started) {
        return;
    }

    const rootView = getRootView();
    livesync(rootView, context);
};
