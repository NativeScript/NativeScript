import consoleModule = require("Console/console");

// TODO: This is put in the global context, is this the preferred approach
console = new consoleModule.Console();

export var onLaunch = function (): any {
}

export var onSuspend = function (): void {
}

export var onResume = function (): void {
}

export var onExit = function (): void {
}

export var onLowMemory = function (): void {
}

export var android = undefined;

export var ios = undefined;