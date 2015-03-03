function nslog(prefix: string, message: string)
{
   //(<any>NSLog)(prefix + ": " + message);
}

export var helper_log = function (message: string) {
    nslog('log', message);
}

export var info = function (message: string) {
    nslog('info', message);
}

export var error = function (message: string) {
    nslog('error', message);
}

export var warn = function (message: string) {
    nslog('warning', message);
}

export var timeMillis = function (): number {
    return CACurrentMediaTime() * 1000;
}