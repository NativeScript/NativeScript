export declare module tk {
    export enum TargetOS {
        iOS,
        Android,
        //WP
    }

    export module ui {
        export class Application {
            static current: Application;
            public os: TargetOS;

            public onLaunch: () => any;
            public onSuspend: () => any;
            public onResume: () => any;
            public onExit: () => any;
            public onLowMemory: () => any;

            public android: android.Application;
            public ios: ios.Application;
        }

        export module android {
            export function initApp(nativeApp: any);
            export class Application {
                public nativeApp: any; // TODO: android.app
                public context: any; // TODO: android.context
                public currentActivity: any; // TODO: android.activity 
                public startActivity: any; // TODO: android.activity 
                public packageName: string;

                // TODO: Provide type information once definitions are done - e.g. activity: android.widget.activity
                public onActivityCreated: (activity: any, bundle: any) => any;
                public onActivityDestroyed: (activity: any) => any;
                public onActivityStarted: (activity: any) => any;
                public onActivityPaused: (activity: any) => any;
                public onActivityResumed: (activity: any) => any;
                public onActivityStopped: (activity: any) => any;
                public onSaveActivityState: (activity: any, bundle: any) => any;
            }
        }

        export module ios {
            export function initApp(nativeApp: any);
            export class Application {
                public rootController: any;
            }
        }
    }
}