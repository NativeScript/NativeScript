// TODO: we should use Foundation.NSLog() but it currently does not work
// TODO: Is there a better way to implement the info/warn/error

export var helper_log = function (message: string) {
    log('log: ' + message);
}

export var info = function (message: string) {
    log('info: ' + message);
}

export var error = function (message: string) {
    log('error: ' + message);
}

export var warn = function (message: string) {
    log('warning: ' + message);
}

export var timeMillis = function (): number {
    return QuartzCore.CACurrentMediaTime() * 1000;
}