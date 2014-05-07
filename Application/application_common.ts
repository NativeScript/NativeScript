import console_module = require("Console/console_common");

export enum TargetOS {
    iOS,
    Android
}
    
export class Application {
    public os: TargetOS;

    constructor() {
        console = new console_module.TKConsole();
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