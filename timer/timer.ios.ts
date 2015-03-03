/**
 * iOS specific timer functions implementation.
 */
var timeoutCallbacks = {};

class TimerTargetImpl extends NSObject {
    static new(): TimerTargetImpl {
        return <TimerTargetImpl>super.new();
    }

    private _callback: Function;

    public initWithCallback(callback: Function): TimerTargetImpl {
        this._callback = callback;
        return this;
    }

    public tick(timer): void {
        this._callback();
    }

    public static ObjCExposedMethods = {
        "tick": { returns: interop.types.void, params: [NSTimer] }
    };
}

function createTimerAndGetId(callback: Function, milliseconds: number, shouldRepeat: boolean): number {
    var id = new Date().getUTCMilliseconds();

    var timerTarget = TimerTargetImpl.new().initWithCallback(callback);
    var timer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(milliseconds / 1000, timerTarget, "tick", null, shouldRepeat);

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

export var clearInterval = clearTimeout;