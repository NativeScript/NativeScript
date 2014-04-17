export declare enum TargetOS {
    iOS,
    Android
}

export declare class Application {
    static current: Application;
    public os: TargetOS;

    public onLaunch: () => any;
    public onSuspend: () => any;
    public onResume: () => any;
    public onExit: () => any;
    public onLowMemory: () => any;

    public android: AndroidApplication;
    public ios: iOSApplication;
}

export declare function init(nativeApp: any);

export declare class AndroidApplication {
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public currentActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => any;
    public onActivityDestroyed: (activity: android.app.Activity) => any;
    public onActivityStarted: (activity: android.app.Activity) => any;
    public onActivityPaused: (activity: android.app.Activity) => any;
    public onActivityResumed: (activity: android.app.Activity) => any;
    public onActivityStopped: (activity: android.app.Activity) => any;
    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => any;
}

export declare class iOSApplication {
    public rootController: any;
}