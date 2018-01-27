import {
    iOSApplication as IOSApplicationDefinition,
    LaunchEventData,
    ApplicationEventData,
    OrientationChangedEventData,
    LoadAppCSSEventData
} from ".";

import {
    notify, launchEvent, resumeEvent, suspendEvent, exitEvent, lowMemoryEvent,
    orientationChangedEvent, setApplication, livesync, displayedEvent, getCssFileName
} from "./application-common";

// First reexport so that app module is initialized.
export * from "./application-common";

// TODO: Remove this and get it from global to decouple builder for angular
import { createViewFromEntry } from "../ui/builder";
import { ios as iosView, View } from "../ui/core/view";
import { Frame, NavigationEntry } from "../ui/frame";
import { ios } from "../ui/utils";
import * as utils from "../utils/utils";
import { profile, level as profilingLevel, Level } from "../profiling";

class Responder extends UIResponder {
    //
}

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
        const ios = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
        const object = iosApp;
        displayedOnce = true;
        notify(<ApplicationEventData>{ eventName: displayedEvent, object, ios });
        displayedLinkTarget = null;
        displayedLink = null;
    }
    public static ObjCExposedMethods = {
        "onDisplayed": { returns: interop.types.void, params: [CADisplayLink] }
    }
}

class IOSApplication implements IOSApplicationDefinition {
    private _delegate: typeof UIApplicationDelegate;
    private _currentOrientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
    private _window: UIWindow;
    private _observers: Array<NotificationObserver>;
    private _rootView: View;

    constructor() {
        this._observers = new Array<NotificationObserver>();
        this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions.bind(this));
        this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive.bind(this));
        this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground.bind(this));
        this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate.bind(this));
        this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning.bind(this));
        this.addNotificationObserver(UIDeviceOrientationDidChangeNotification, this.orientationDidChange.bind(this));
    }

    get rootController(): UIViewController {
        return this._window.rootViewController;
    }

    get nativeApp(): UIApplication {
        return utils.ios.getter(UIApplication, UIApplication.sharedApplication);
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

    public addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
        const observer = NotificationObserver.initWithCallback(onReceiveCallback);
        utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).addObserverSelectorNameObject(observer, "onReceive", notificationName, null);
        this._observers.push(observer);
        return observer;
    }

    public removeNotificationObserver(observer: any, notificationName: string) {
        var index = this._observers.indexOf(observer);
        if (index >= 0) {
            this._observers.splice(index, 1);
            utils.ios.getter(NSNotificationCenter, NSNotificationCenter.defaultCenter).removeObserverNameObject(observer, notificationName, null);
        }
    }

    @profile
    private didFinishLaunchingWithOptions(notification: NSNotification) {
        if (!displayedOnce && profilingLevel() >= Level.lifecycle) {
            displayedLinkTarget = CADisplayLinkTarget.new();
            displayedLink = CADisplayLink.displayLinkWithTargetSelector(displayedLinkTarget, "onDisplayed");
            displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, NSDefaultRunLoopMode);
            displayedLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, UITrackingRunLoopMode);
        }

        this._window = UIWindow.alloc().initWithFrame(utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
        // TODO: Expose Window module so that it can we styled from XML & CSS
        this._window.backgroundColor = utils.ios.getter(UIColor, UIColor.whiteColor);

        const args: LaunchEventData = {
            eventName: launchEvent,
            object: this,
            ios: notification.userInfo && notification.userInfo.objectForKey("UIApplicationLaunchOptionsLocalNotificationKey") || null
        };

        notify(args);
        notify(<LoadAppCSSEventData>{ eventName: "loadAppCss", object: <any>this, cssFile: getCssFileName() });

        this.setWindowContent(args.root);
    }

    @profile
    private didBecomeActive(notification: NSNotification) {
        const ios = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
        const object = this;
        notify(<ApplicationEventData>{ eventName: resumeEvent, object, ios });
        const rootView = this._rootView;
        if (rootView && !rootView.isLoaded) {
            rootView.callLoaded();
        }
    }

    private didEnterBackground(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: suspendEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
        const rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.callUnloaded();
        }
    }

    private willTerminate(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: exitEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
        const rootView = this._rootView;
        if (rootView && rootView.isLoaded) {
            rootView.callUnloaded();
        }
    }

    private didReceiveMemoryWarning(notification: NSNotification) {
        notify(<ApplicationEventData>{ eventName: lowMemoryEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    }

    private orientationDidChange(notification: NSNotification) {
        const orientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;

        if (this._currentOrientation !== orientation) {
            this._currentOrientation = orientation;

            let newValue: "portrait" | "landscape" | "unknown";
            switch (orientation) {
                case UIDeviceOrientation.LandscapeRight:
                case UIDeviceOrientation.LandscapeLeft:
                    newValue = "landscape";
                    break;
                case UIDeviceOrientation.Portrait:
                case UIDeviceOrientation.PortraitUpsideDown:
                    newValue = "portrait";
                    break;
                default:
                    newValue = "unknown";
                    break;
            }

            notify(<OrientationChangedEventData>{
                eventName: orientationChangedEvent,
                ios: this,
                newValue: newValue,
                object: this
            });
        }
    }

    public _onLivesync(): void {
        // If view can't handle livesync set window controller.
        if (!this._rootView._onLivesync()) {
            this.setWindowContent();
        }
    }

    public setWindowContent(view?: View): void {
        const rootView = createRootView(view);
        this._rootView = rootView;
        const controller = getViewController(rootView);

        if (createRootFrame) {
            // Don't setup as styleScopeHost
            rootView._setupUI({});
        } else {
            // setup view as styleScopeHost
            rootView._setupAsRootView({});
        }

        const haveController = this._window.rootViewController !== null;
        this._window.rootViewController = controller;
        if (!haveController) {
            this._window.makeKeyAndVisible();
        }
    }
}

const iosApp = new IOSApplication();
exports.ios = iosApp;
setApplication(iosApp);

// attach on global, so it can be overwritten in NativeScript Angular
(<any>global).__onLiveSyncCore = function () {
    iosApp._onLivesync();
}

let mainEntry: NavigationEntry;
function createRootView(v?: View) {
    let rootView = v;
    if (!rootView) {
        // try to navigate to the mainEntry (if specified)
        if (mainEntry) {
            if (createRootFrame) {
                const frame = rootView = new Frame();
                frame.navigate(mainEntry);
            } else {
                rootView = createViewFromEntry(mainEntry);
            }
        } else {
            // TODO: Throw an exception?
            throw new Error("A Frame must be used to navigate to a Page.");
        }
    }

    return rootView;
}

export function getMainEntry() {
    return mainEntry;
}

// NOTE: for backwards compatibility. Remove for 4.0.0.
let createRootFrame = true;
let started: boolean = false;
export function start(entry?: string | NavigationEntry) {
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
                    rootController.presentViewControllerAnimatedCompletion(controller, true, null);
                }
            }
        }
    }
}

export function run(entry?: string | NavigationEntry) {
    createRootFrame = false;
    start(entry);
}

export function getNativeApplication(): UIApplication {
    return iosApp.nativeApp;
}

function getViewController(view: View): UIViewController {
    let viewController: UIViewController = view.viewController || view.ios;
    if (viewController instanceof UIViewController) {
        return viewController;
    } else {
        const nativeView = view.ios || view.nativeViewProtected;
        if (nativeView instanceof UIView) {
            viewController = iosView.UILayoutViewController.initWithOwner(new WeakRef(view)) as UIViewController;
            viewController.view.addSubview(nativeView);
            view.viewController = viewController;
            return viewController;
        }
    }

    throw new Error("Root should be either UIViewController or UIView");
}

global.__onLiveSync = function () {
    if (!started) {
        return;
    }

    livesync();
}