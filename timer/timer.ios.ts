/**
  * iOS specific timer functions implementation.
  */
var timeoutCallbacks = {};

function createTimerAndGetId(callback: Function, milliseconds: number, shouldRepeat: boolean): number {
    var id = new Date().getUTCMilliseconds();

    var target = Foundation.NSObject.extends({ tick: function (timer) { callback(); } }, { exposedMethods: { "tick:": "v@:@" } });
    var timer = Foundation.NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(milliseconds / 1000, new target(), "tick:", null, shouldRepeat);

    if (!timeoutCallbacks[id]) {
        timeoutCallbacks[id] = timer;
    }

    return id;
}

export function setTimeout(callback: Function, milliseconds = 0): number {
    return createTimerAndGetId(callback, milliseconds, false);
}

export function clearTimeout(id: number): void {
    if (timeoutCallbacks[id]) {
        timeoutCallbacks[id].invalidate();
        timeoutCallbacks[id] = null;
    }
}

export function setInterval(callback: Function, milliseconds = 0): number {
    return createTimerAndGetId(callback, milliseconds, true);
}
