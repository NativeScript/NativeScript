
declare module "application" {

    /**
    * The main entry point event. This method is expected to return an instance of the root UI for the application.
    * This will be an Activity extends for Android and a RootViewController for iOS.
    */
    function onLaunch(): any;

    /**
    * This method will be called when the Application is suspended.
    */
    function onSuspend();

    /**
    * This method will be called when the Application is resumed after it has been suspended.
    */
    function onResume();

    /**
    * This method will be called when the Application is about to exit.
    */
    function onExit();

    /**
    * This method will be called when there is low memory on the target device.
    */
    function onLowMemory();

    /**
    * This is the Android-specific application object instance.
    * Encapsulates methods and properties specific to the Android platform.
    * Will be undefined when TargetOS is iOS.
    */
    var android: AndroidApplication;

    /**
    * This is the iOS-specific application object instance.
    * Encapsulates methods and properties specific to the iOS platform.
    * Will be undefined when TargetOS is Android.
    */
    var ios: iOSApplication;

    /**
    * The abstraction of an Android-specific application object.
    */
    class AndroidApplication {
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
        public startActivity: android.app.Activity;

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
    class iOSApplication {
        /**
        * The root view controller for the application.
        */
        public rootController: UIKit.UIViewController;

        /**
        * The android.app.Application object instance provided to the init of the module.
        */
        public nativeApp: UIKit.UIApplication;
    }

    /**
    * Entry point for the module. Initializes the Application singleton and hooks application lifecycle events.
    */
    function init(nativeApp: any);
}