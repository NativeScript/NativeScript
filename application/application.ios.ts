import appModule = require("application/application-common");
import frame = require("ui/frame");
import utils = require("utils/utils");
import types = require("utils/types");
import view = require("ui/core/view");
import definition = require("application");
import native_api = require("native-api");

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

class TNSAppDelegate extends UIResponder implements UIApplicationDelegate {
    
    // An array of protocols to be implemented by the native class
    public static ObjCProtocols = [UIApplicationDelegate];

    public window: Window;

    applicationDidFinishLaunchingWithOptions(application: UIApplication, launchOptions: NSDictionary): boolean {
        this.window = <Window>Window.alloc().initWithFrame(UIScreen.mainScreen().bounds);
        this.window.backgroundColor = UIColor.whiteColor();

        if (exports.onLaunch) {
            exports.onLaunch();
        }

        exports.notify({ eventName: definition.launchEvent, object: this, ios: launchOptions });

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

        this.window.content = topFrame;
        this.window.rootViewController = topFrame.ios.controller;
        var app: IOSApplication = exports.ios;
        app.rootController = this.window.rootViewController;
        this.window.makeKeyAndVisible();
        return true;
    }

    applicationDidBecomeActive(application: UIApplication) {
        if (exports.onResume) {
            exports.onResume();
        }

        exports.notify({ eventName: definition.resumeEvent, object: this, ios: application });
    }

    applicationWillResignActive(application: UIApplication) {
        //
    }

    applicationDidEnterBackground(application: UIApplication) {
        if (exports.onSuspend) {
            exports.onSuspend();
        }

        exports.notify({ eventName: definition.suspendEvent, object: this, ios: application });
    }

    applicationWillEnterForeground(application: UIApplication) {
        //
    }

    applicationWillTerminate(application: UIApplication) {
        if (exports.onExit) {
            exports.onExit();
        }

        exports.notify({ eventName: definition.exitEvent, object: this, ios: application });
    }

    applicationDidReceiveMemoryWarning(application: UIApplication) {
        if (exports.onLowMemory) {
            exports.onLowMemory();
        }

        exports.notify({ eventName: definition.lowMemoryEvent, object: this, android: undefined, ios: application });
    }

    applicationOpenURLSourceApplicationAnnotation(application: UIApplication, url: NSURL, sourceApplication: string, annotation: any): boolean {
        var dictionary = new NSMutableDictionary();
        dictionary.setObjectForKey(url, "TLKApplicationOpenURL");
        dictionary.setObjectForKey(application, "TLKApplication");
        NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo("com.telerik.TLKApplicationOpenURL", null, dictionary);
        return true; // or should we return false???
    }
}

class NotificationReceiver extends NSObject {
    private _onReceiveCallback: (notification: native_api.NSNotification) => void;

    static new(): NotificationReceiver {
        return <NotificationReceiver>super.new();
    }

    public initWithCallback(onReceiveCallback: (notification: native_api.NSNotification) => void): NotificationReceiver {
        this._onReceiveCallback = onReceiveCallback;
        return this;
    }

    public onReceive(notification: native_api.NSNotification): void {
        this._onReceiveCallback(notification);
    }

    public static ObjCExposedMethods = {
        "onReceive": { returns: interop.types.void, params: [native_api.NSNotification] }
    };
}

class IOSApplication implements definition.iOSApplication {

    public nativeApp: any;
    public rootController: any;
    private _tnsAppdelegate: TNSAppDelegate;
    private _registeredObservers = {};

    constructor() {
        // TODO: in iOS there is the singleton instance, while in Android such does not exist hence we pass it as argument
        this.nativeApp = UIApplication.sharedApplication();
    }

    public init() {
        this._tnsAppdelegate = new TNSAppDelegate();
    }

    public addNotificationObserver(notificationName: string, onReceiveCallback: (notification: native_api.NSNotification) => void) {
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
}

// TODO: If we have nested require(application) calls we may enter unfinished module state, which will create two delegates, resulting in an exception
var app = new IOSApplication();
exports.ios = app;
app.init();

exports.start = function () {
    appModule.loadCss();
    try {
        // The "UIApplicationMain" enters a modal loop and the call will not return while the application is running.
        // This try-catch block here will catch JavaScript errors but no Objective C ones.
        // TODO: We need to implement better error handling for our native calls and to use the "error" parameter of the iOS APIs.
        UIApplicationMain(0, null, null, "TNSAppDelegate");
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
