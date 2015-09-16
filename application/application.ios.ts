import appModule = require("application/application-common");
import frame = require("ui/frame");
import types = require("utils/types");
import view = require("ui/core/view");
import definition = require("application");
import enums = require("ui/enums");
import uiUtils = require("ui/utils");

global.moduleMerge(appModule, exports);

class Responder extends UIResponder {
    //
}

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
        uiUtils.ios._layoutRootView(this._content, UIScreen.mainScreen().bounds);
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
    private _currentOrientation = UIDevice.currentDevice().orientation;
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

    public addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
        var observer = NotificationObserver.new().initWithCallback(onReceiveCallback);
        NSNotificationCenter.defaultCenter().addObserverSelectorNameObject(observer, "onReceive", notificationName, null);
        this._observers.push(observer);
        return observer;
    }

    public removeNotificationObserver(observer: any, notificationName: string) {
        var index = this._observers.indexOf(observer);
        if (index >= 0) {
            this._observers.splice(index, 1);
            NSNotificationCenter.defaultCenter().removeObserverNameObject(observer, notificationName, null);
        }
    }

    private didFinishLaunchingWithOptions(notification: NSNotification) {
        this._window = <Window>Window.alloc().initWithFrame(UIScreen.mainScreen().bounds);
        this._window.backgroundColor = UIColor.whiteColor();

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
            // try to navigate to the mainEntry/Module (if specified)
            var navParam = definition.mainEntry;
            if (!navParam) {
                navParam = definition.mainModule;
            }

            if (navParam) {
                topFrame = new frame.Frame();
                topFrame.navigate(navParam);
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        }

        this._window.content = topFrame;

        this.rootController = this._window.rootViewController = topFrame.ios.controller;

        this._window.makeKeyAndVisible();
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

    private orientationDidChange(notification: NSNotification) {
        var orientation = UIDevice.currentDevice().orientation;

        if (this._currentOrientation !== orientation) {
            this._currentOrientation = orientation;

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
                ios: this,
                newValue: newValue,
                object: this
            });
        }
    }

}

var iosApp = new IOSApplication();
exports.ios = iosApp;

exports.start = function () {

    appModule.loadCss();

    try {
        // The "UIApplicationMain" enters a modal loop and the call will not return while the application is running.
        // This try-catch block here will catch JavaScript errors but no Objective C ones.
        // TODO: We need to implement better error handling for our native calls and to use the "error" parameter of the iOS APIs.

        UIApplicationMain(0, null, null, exports.ios && exports.ios.delegate ? NSStringFromClass(exports.ios.delegate) : NSStringFromClass(Responder));
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