import appModule = require("application/application-common");
import frame = require("ui/frame");
import utils = require("utils/utils");
import types = require("utils/types");
import view = require("ui/core/view");
import definition = require("application");
import enums = require("ui/enums");
global.moduleMerge(appModule, exports);

export var mainModule: string;

class Window extends UIWindow {

    private _content: view.View;

    initWithFrame(frame: CGRect): UIWindow {
        var window = super.initWithFrame(frame);
        if (window) {
            window.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        }
        return window;
    }

    public get content(): view.View {
        return this._content;
    }
    public set content(value: view.View) {
        this._content = value;
    }

    public layoutSubviews(): void {
        utils.ios._layoutRootView(this._content, UIScreen.mainScreen().bounds);
    }
}

class NotificationReceiver extends NSObject {
    private _onReceiveCallback: (notification: NSNotification) => void;

    static new(): NotificationReceiver {
        return <NotificationReceiver>super.new();
    }

    public initWithCallback(onReceiveCallback: (notification: NSNotification) => void): NotificationReceiver {
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
    private _delegate: typeof UIApplicationDelegate;
    public rootController: any;
    private _registeredObservers = {};

    constructor() {
        this.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, this.didFinishLaunchingWithOptions);
        this.addNotificationObserver(UIApplicationDidBecomeActiveNotification, this.didBecomeActive);
        this.addNotificationObserver(UIApplicationDidEnterBackgroundNotification, this.didEnterBackground);
        this.addNotificationObserver(UIApplicationWillTerminateNotification, this.willTerminate);
        this.addNotificationObserver(UIApplicationDidReceiveMemoryWarningNotification, this.didReceiveMemoryWarning);
    }

    get nativeApp(): UIApplication {
        return UIApplication.sharedApplication();
    }

    get delegate(): typeof UIApplicationDelegate {
        return this._delegate;
    }
    set delegate(value: typeof UIApplicationDelegate) {
        if (this._delegate !== value) {
            this._delegate = value;
        }
    }

    public addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void) {
        var observer = NotificationReceiver.new().initWithCallback(onReceiveCallback);
        NSNotificationCenter.defaultCenter().addObserverSelectorNameObject(observer, "onReceive", notificationName, null);
        this._registeredObservers[notificationName] = observer;
    }

    public removeNotificationObserver(notificationName: string) {
        var observer = this._registeredObservers[notificationName];
        if (observer) {
            NSNotificationCenter.defaultCenter().removeObserverNameObject(observer, notificationName, null);
        }
    }

    private didFinishLaunchingWithOptions(notification: NSNotification) {
        let window = <Window>Window.alloc().initWithFrame(UIScreen.mainScreen().bounds);
        window.backgroundColor = UIColor.whiteColor();

        if (exports.onLaunch) {
            exports.onLaunch();
        }

        exports.notify({
            eventName: definition.launchEvent,
            object: this,
            ios: notification.userInfo && notification.userInfo.objectForKey("UIApplicationLaunchOptionsLocalNotificationKey") || null
        });

        var topFrame = frame.topmost();
        if (!topFrame) {
            if (mainModule) {
                topFrame = new frame.Frame();
                topFrame.navigate(mainModule);
            } else {
                // TODO: Throw an exception?
                // throw new Error("A Frame must be used to navigate to a Page.");
                return;
            }
        }
        var app: IOSApplication = exports.ios;
        setupOrientationListener(app);

        window.content = topFrame;
        window.rootViewController = topFrame.ios.controller;
        app.rootController = window.rootViewController;
        window.makeKeyAndVisible();
    }

    private didBecomeActive(notification: NSNotification) {
        if (exports.onResume) {
            exports.onResume();
        }

        exports.notify({ eventName: definition.resumeEvent, object: this, ios: UIApplication.sharedApplication() });
    }

    private didEnterBackground(notification: NSNotification) {
        if (exports.onSuspend) {
            exports.onSuspend();
        }

        exports.notify({ eventName: definition.suspendEvent, object: this, ios: UIApplication.sharedApplication() });
    }

    private willTerminate(notification: NSNotification) {
        if (exports.onExit) {
            exports.onExit();
        }

        exports.notify({ eventName: definition.exitEvent, object: this, ios: UIApplication.sharedApplication() });
    }

    private didReceiveMemoryWarning(notification: NSNotification) {
        if (exports.onLowMemory) {
            exports.onLowMemory();
        }

        exports.notify({ eventName: definition.lowMemoryEvent, object: this, android: undefined, ios: UIApplication.sharedApplication() });
    }
}

// TODO: If we have nested require(application) calls we may enter unfinished module state, which will create two delegates, resulting in an exception
var app = new IOSApplication();
exports.ios = app;

exports.start = function () {
    appModule.loadCss();
    try {
        // The "UIApplicationMain" enters a modal loop and the call will not return while the application is running.
        // This try-catch block here will catch JavaScript errors but no Objective C ones.
        // TODO: We need to implement better error handling for our native calls and to use the "error" parameter of the iOS APIs.

        UIApplicationMain(0, null, null, app.delegate ? NSStringFromClass(app.delegate) : null);
    }
    catch (error) {
        // At this point the main application loop is exited and no UI May be created.
        if (!types.isFunction(exports.onUncaughtError)) {
            return;
        }

        exports.onUncaughtError(error);

        definition.notify({ eventName: definition.uncaughtErrorEvent, object: <any>definition.ios, ios: error });
    }
}

var currentOrientation: number;
function setupOrientationListener(iosApp: IOSApplication) {
    iosApp.addNotificationObserver(UIDeviceOrientationDidChangeNotification, onOreintationDidChange)
    currentOrientation = UIDevice.currentDevice().orientation;
}

function onOreintationDidChange(notification: NSNotification) {
    var orientation = UIDevice.currentDevice().orientation;

    if (currentOrientation !== orientation) {
        currentOrientation = orientation;

        var newValue;
        switch (orientation) {
            case UIDeviceOrientation.UIDeviceOrientationLandscapeRight:
            case UIDeviceOrientation.UIDeviceOrientationLandscapeLeft:
                newValue = enums.DeviceOrientation.landscape;
                break;
            case UIDeviceOrientation.UIDeviceOrientationPortrait:
            case UIDeviceOrientation.UIDeviceOrientationPortraitUpsideDown:
                newValue = enums.DeviceOrientation.portrait;
                break;
            default:
                newValue = enums.DeviceOrientation.unknown;
                break;
        }

        exports.notify(<definition.OrientationChangedEventData>{
            eventName: definition.orientationChangedEvent,
            ios: exports.ios,
            newValue: newValue,
            object: exports.ios,
        });
    }
}
