/**
* Defines the available target operating systems.
*/
export declare enum TargetOS {
    /**
    * iOS operating system.
    */
    iOS,

    /**
    * Android operating system.
    */
    Android
}

/**
* The abstraction of an Application object, common for each target OS.
*/
export declare class Application {
    /**
    * The target operating system of the application.
    */
    public os: TargetOS;

    /**
    * The main entry point event. This method is expected to return an instance of the root UI for the application.
    * This will be an Activity extends for Android and a RootViewController for iOS.
    */
    public onLaunch: () => any;

    /**
    * This method will be called when the Application is suspended.
    */
    public onSuspend: () => any;

    /**
    * This method will be called when the Application is resumed after it has been suspended.
    */
    public onResume: () => any;

    /**
    * This method will be called when the Application is about to exit.
    */
    public onExit: () => any;

    /**
    * This method will be called when there is low memory on the target device.
    */
    public onLowMemory: () => any;

    /**
    * This is the Android-specific application object instance. 
    * Encapsulates methods and properties specific to the Android platform.
    * Will be undefined when TargetOS is iOS.
    */
    public android: AndroidApplication;

    /**
    * This is the iOS-specific application object instance.
    * Encapsulates methods and properties specific to the iOS platform.
    * Will be undefined when TargetOS is Android.
    */
    public ios: iOSApplication;
}

/**
* The abstraction of an Android-specific application object.
*/
export declare class AndroidApplication {
    /**
    * The android.app.Application object instance provided to the init of the module.
    */
    public nativeApp: android.app.Application;

    /**
    * The application android.content.Context object instance.
    */
    public context: android.content.Context;

    /**
    * The currently active (loaded) android.app.Activity. This property is automatically updated upon Activity events.
    */
    public currentActivity: android.app.Activity;

    /**
    * The main (start) Activity for the application.
    */
    public mainActivity: android.app.Activity;

    /**
    * The name of the application package.
    */
    public packageName: string;

    /**
    * This method is called by the JavaScript Bridge when navigation to a new activity is triggered.
    * The return value of this method should be com.tns.NativeScriptActivity.extends implementation.
    */
    public getActivity: (intent: android.content.Intent) => any;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityCreated method.
    */
    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityDestroyed method.
    */
    public onActivityDestroyed: (activity: android.app.Activity) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityDestroyed method.
    */
    public onActivityStarted: (activity: android.app.Activity) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityPaused method.
    */
    public onActivityPaused: (activity: android.app.Activity) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityResumed method.
    */
    public onActivityResumed: (activity: android.app.Activity) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onActivityStopped method.
    */
    public onActivityStopped: (activity: android.app.Activity) => void;

    /**
    * Direct handler of the android.app.Application.ActivityLifecycleCallbacks.onSaveActivityState method.
    */
    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;
}

/**
* The abstraction of an iOS-specific application object.
*/
export declare class iOSApplication {
    /**
    * The root view controller for the application.
    */
    public rootController: UIKit.UIViewController;
}

/**
* Entry point for the module. Initializes the Application singleton and hooks application lifecycle events.
*/
export declare function init(nativeApp: any);

/**
* The current singleton instance of the application object.
*/
export declare var current: Application;