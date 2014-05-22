// TODO: we should use Foundation.NSLog() but it currently does not work
// TODO: Is there a better way to implement the info/warn/error

function nslog(prefix: string, message: string)
{
    (<any>Foundation).NSLog("%@: %@", [{ type: PrimitiveType.POINTER, value: prefix }, { type: PrimitiveType.POINTER, value: message}]);
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
    return QuartzCore.CACurrentMediaTime() * 1000;
}