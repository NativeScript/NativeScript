import common = require("./application-common");
import {Frame, NavigationEntry} from "ui/frame";
import definition = require("application");
import * as uiUtils from "ui/utils";
import * as typesModule from "utils/types";
import * as enumsModule from "ui/enums";

import * as utils from "utils/utils";

global.moduleMerge(common, exports);
var typedExports: typeof definition = exports;

class Responder extends UIResponder {
    //
}

class Window extends UIWindow {

    private _content;

    initWithFrame(frame: CGRect): this {
        var window = <this>super.initWithFrame(frame);
        if (window) {
            window.autoresizingMask = UIViewAutoresizing.None;
        }
        return window;
    }

    public get content() {
        return this._content;
    }
    public set content(value) {
        this._content = value;
    }

    public layoutSubviews(): void {
        if (utils.ios.MajorVersion < 9) {
            uiUtils.ios._layoutRootView(this._content, utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
        }else{
            uiUtils.ios._layoutRootView(this._content, this.frame);
        }
    }
}

class NotificationObserver extends NSObject {
    private _onReceiveCallback: (notification: NSNotification) => void;

    static new(): NotificationObserver {
        return <NotificationObserver>super.new();
    }

    public initWithCallback(onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
        this._onReceiveCallback = onReceiveCallback;
        return this;
    }

    public onReceive(notification: NSNotification): void {
        this._onReceiveCallback(notification);
    }

    public static ObjCExposedMethods = {
        "onReceive": { returns: interop.types.void, params: [NSNotification] }
    };
}

class IOSApplication implements definition.iOSApplication {
    public rootController: any;

    private _delegate: typeof UIApplicationDelegate;
    private _currentOrientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
    private _window: Window;
    private _observers: Array<NotificationObserver>;

    constructor() {
        this._observers = new Array<NotificationObserver>();
        this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions.bind(this));
        this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive.bind(this));
        this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground.bind(this));
        this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate.bind(this));
        this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning.bind(this));
        this.addNotificationObserver(UIDeviceOrientationDidChangeNotification, this.orientationDidChange.bind(this));
    }

    get nativeApp(): UIApplication {
        return utils.ios.getter(UIApplication, UIApplication.sharedApplication);
    }

    get window(): Window {
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
        var observer = NotificationObserver.new().initWithCallback(onReceiveCallback);
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

    private didFinishLaunchingWithOptions(notification: NSNotification) {
        this._window = <Window>Window.alloc().initWithFrame(utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
        this._window.backgroundColor = utils.ios.getter(UIColor, UIColor.whiteColor);

        if (typedExports.onLaunch) {
            typedExports.onLaunch(undefined);
        }

        let args: definition.LaunchEventData = {
            eventName: typedExports.launchEvent,
            object: this,
            ios: notification.userInfo && notification.userInfo.objectForKey("UIApplicationLaunchOptionsLocalNotificationKey") || null
        };

        typedExports.notify(args);

        let rootView = createRootView(args.root);
        this._window.content = rootView;

        if (rootView instanceof Frame) {
            this.rootController = this._window.rootViewController = rootView.ios.controller;
        }
        else if (rootView.ios instanceof UIViewController) {
            this.rootController = this._window.rootViewController = rootView.ios;
        }
        else if (rootView.ios instanceof UIView) {
            let newController = UIViewController.new();
            newController.view.addSubview(rootView.ios);
            this.rootController = newController;
        }
        else {
            throw new Error("Root should be either UIViewController or UIView");
        }

        this._window.makeKeyAndVisible();
    }

    private didBecomeActive(notification: NSNotification) {
        if (typedExports.onResume) {
            typedExports.onResume();
        }

        typedExports.notify({ eventName: typedExports.resumeEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    }

    private didEnterBackground(notification: NSNotification) {
        if (typedExports.onSuspend) {
            typedExports.onSuspend();
        }

        typedExports.notify({ eventName: typedExports.suspendEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    }

    private willTerminate(notification: NSNotification) {
        if (typedExports.onExit) {
            typedExports.onExit();
        }

        typedExports.notify({ eventName: typedExports.exitEvent, object: this, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    }

    private didReceiveMemoryWarning(notification: NSNotification) {
        if (typedExports.onLowMemory) {
            typedExports.onLowMemory();
        }

        typedExports.notify({ eventName: typedExports.lowMemoryEvent, object: this, android: undefined, ios: utils.ios.getter(UIApplication, UIApplication.sharedApplication) });
    }

    private orientationDidChange(notification: NSNotification) {
        var orientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;

        if (this._currentOrientation !== orientation) {
            this._currentOrientation = orientation;

            var enums: typeof enumsModule = require("ui/enums");

            var newValue;
            switch (orientation) {
                case UIDeviceOrientation.LandscapeRight:
                case UIDeviceOrientation.LandscapeLeft:
                    newValue = enums.DeviceOrientation.landscape;
                    break;
                case UIDeviceOrientation.Portrait:
                case UIDeviceOrientation.PortraitUpsideDown:
                    newValue = enums.DeviceOrientation.portrait;
                    break;
                default:
                    newValue = enums.DeviceOrientation.unknown;
                    break;
            }

            typedExports.notify(<definition.OrientationChangedEventData>{
                eventName: typedExports.orientationChangedEvent,
                ios: this,
                newValue: newValue,
                object: this
            });
        }
    }
}

var iosApp = new IOSApplication();
typedExports.ios = iosApp;

global.__onUncaughtError = function (error: definition.NativeScriptError) {
    var types: typeof typesModule = require("utils/types");

    // TODO: This should be obsoleted
    if (types.isFunction(typedExports.onUncaughtError)) {
        typedExports.onUncaughtError(error);
    }
    
    typedExports.notify({ eventName: typedExports.uncaughtErrorEvent, object: typedExports.ios, ios: error });
}

function loadCss() {
    //HACK: identical to application.ios.ts
    typedExports.appSelectors = typedExports.loadCss(typedExports.cssFile) || [];
    if (typedExports.appSelectors.length > 0) {
        typedExports.mergeCssSelectors(typedExports);
    }
}

export function addCss(cssText: string) {
    //HACK: identical to application.android.ts
    const parsed = typedExports.parseCss(cssText);
    if (parsed) {
        typedExports.additionalSelectors.push.apply(typedExports.additionalSelectors, parsed);
        typedExports.mergeCssSelectors(typedExports);
    }
}

function createRootView(v?) {
    let rootView = v;
    let frame: Frame;
    let navParam: Object;
    if (!rootView) {
        // try to navigate to the mainEntry/Module (if specified)
        navParam = typedExports.mainEntry;
        if (!navParam) {
            navParam = typedExports.mainModule;
        }

        if (navParam) {
            frame = new Frame();
            frame.navigate(navParam);
        } else {
            // TODO: Throw an exception?
            throw new Error("A Frame must be used to navigate to a Page.");
        }

        rootView = frame;
    }

    return rootView;
}

var started: boolean = false;
typedExports.start = function (entry?: NavigationEntry) {
    if (!started) {
        if (entry) {
            exports.mainEntry = entry;
        }
        started = true;
        loadCss();

        if(!iosApp.nativeApp) {
            // Normal NativeScript app will need UIApplicationMain. 
            UIApplicationMain(0, null, null, typedExports.ios && typedExports.ios.delegate ? NSStringFromClass(typedExports.ios.delegate) : NSStringFromClass(Responder));
        } else {
            let rootView = createRootView();
            if(rootView) {
                // Attach to the existing iOS app
                var window = iosApp.nativeApp.keyWindow || (iosApp.nativeApp.windows.count > 0 && iosApp.nativeApp.windows[0]);
                if(window) {
                    var rootController = window.rootViewController;
                    if(rootController) {
                        rootController.presentViewControllerAnimatedCompletion(rootView.ios.controller, utils.ios.MajorVersion >= 7, null);
                        uiUtils.ios._layoutRootView(rootView, utils.ios.getter(UIScreen, UIScreen.mainScreen).bounds);
                    }
                }
            }
        }

    } else {
        throw new Error("iOS Application already started!");
    }
}

global.__onLiveSync = function () {
    if (!started) {
        return;
    }

    common.__onLiveSync();

    loadCss();
}
