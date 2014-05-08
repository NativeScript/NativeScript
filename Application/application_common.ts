import consoleModule = require("Console/console");

export enum TargetOS {
    iOS,
    Android
}
    
export class Application {
    public os: TargetOS;

    constructor() {
        // TODO: This is put in the global context, is this the preferred approach
        console = new consoleModule.Console();
    }

    public onLaunch: () => any;
    public onSuspend: () => any;
    public onResume: () => any;
    public onExit: () => any;
    public onLowMemory: () => any;

    // TODO: These fields are declared by the application.d.ts file and intellisense will come from there
    public android: any;
    public ios: any;
}

export var current = new Application();