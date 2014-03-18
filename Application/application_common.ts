
export module tk {
    export enum TargetOS {
        iOS,
        Android,
        //WP
    }

    export module ui {
        export class Application {

            public os: TargetOS;

            public onLaunch: () => any;
            public onSuspend: () => any;
            public onResume: () => any;
            public onExit: () => any;
            public onLowMemory: () => any;

            public static current: Application = new Application();

            // TODO: These fields are declared by the application.d.ts file and intellisense will come from there
            public android: any;
            public ios: any;
        }
    }
}  