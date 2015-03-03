import appModule = require("application/application-common");
import frame = require("ui/frame");
import utils = require("utils/utils");
import types = require("utils/types");
import view = require("ui/core/view");
import definition = require("application");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(appModule, exports);

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
        if (!this._content) {
            // TODO: Invalid setup, throw an exception?
            return;
        }

        var statusFrame = UIApplication.sharedApplication().statusBarFrame;
        var statusBarHeight = 0;

        try {
            statusBarHeight = Math.min(statusFrame.size.width, statusFrame.size.height);
        } catch (ex) {
            console.log("exception: " + ex);
        }

        var isLandscape = utils.ios.isLandscape();

        var iOSMajorVersion = utils.ios.MajorVersion;
        // in iOS 8 when in landscape statusbar is hidden.
        if (isLandscape && iOSMajorVersion > 7) {
            statusBarHeight = 0;
        }

        var deviceFrame = UIScreen.mainScreen().bounds;
        var size = deviceFrame.size;
        var width = size.width;
        var height = size.height;

        // in iOS 7 when in landscape we switch width with height because on device they don't change even when rotated.
        if (iOSMajorVersion < 8 && isLandscape) {
            width = size.height;
            height = size.width;
        }

        var origin = deviceFrame.origin;
        var left = origin.x;
        var top = origin.y + statusBarHeight;

        var widthSpec = utils.layout.makeMeasureSpec(width, utils.layout.EXACTLY);
        var heightSpec = utils.layout.makeMeasureSpec(height - statusBarHeight, utils.layout.EXACTLY);

        this._content.measure(widthSpec, heightSpec);
        this._content.layout(left, top, width, height);
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
    }

    applicationWillResignActive(application: UIApplication) {
        //
    }

    applicationDidEnterBackground(application: UIApplication) {
        if (exports.onSuspend) {
            exports.onSuspend();
        }
    }

    applicationWillEnterForeground(application: UIApplication) {
        //
    }

    applicationWillTerminate(application: UIApplication) {
        if (exports.onExit) {
            exports.onExit();
        }
    }

    applicationDidReceiveMemoryWarning(application: UIApplication) {
        if (exports.onLowMemory) {
            exports.onLowMemory();
        }
    }

    applicationOpenURLSourceApplicationAnnotation(application: UIApplication, url: NSURL, sourceApplication: string, annotation: any): boolean {
        var dictionary = new NSMutableDictionary();
        dictionary.setObjectForKey(url, "TLKApplicationOpenURL");
        dictionary.setObjectForKey(application, "TLKApplication");
        NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo("com.telerik.TLKApplicationOpenURL", null, dictionary);
        return true; // or should we return false???
    }
}

class IOSApplication implements definition.iOSApplication {

    public nativeApp: any;
    public rootController: any;
    private _tnsAppdelegate: TNSAppDelegate;

    constructor() {
        // TODO: in iOS there is the singleton instance, while in Android such does not exist hence we pass it as argument
        this.nativeApp = UIApplication.sharedApplication();
    }

    public init() {
        this._tnsAppdelegate = new TNSAppDelegate();
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
    }
}