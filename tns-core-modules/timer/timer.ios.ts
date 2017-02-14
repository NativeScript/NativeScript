import * as utils from "utils/utils";

//iOS specific timer functions implementation.
var timeoutCallbacks = new Map<number, KeyValuePair<NSTimer, TimerTargetImpl>>();
var timerId = 0;

interface KeyValuePair<K, V> {
    k: K;
    v: V
}

class TimerTargetImpl extends NSObject {
    private callback: Function;
    private disposed: boolean;
    private id: number
    private shouldRepeat: boolean

    public static initWithCallback(callback: Function, id: number, shouldRepeat: boolean): TimerTargetImpl {
        let handler = <TimerTargetImpl>TimerTargetImpl.new();
        handler.callback = callback;
        handler.id = id;
        handler.shouldRepeat = shouldRepeat;
        return handler;
    }

    public tick(timer): void {
        if (!this.disposed) {
            this.callback();
        }

        if (!this.shouldRepeat) {
            this.unregister();
        }
    }

    public unregister() {
        if (!this.disposed) {
            this.disposed = true;

            let timer = timeoutCallbacks.get(this.id).k;
            timer.invalidate();
            timeoutCallbacks.delete(this.id);
        }
    }

    public static ObjCExposedMethods = {
        "tick": { returns: interop.types.void, params: [NSTimer] }
    };
}

function createTimerAndGetId(callback: Function, milliseconds: number, shouldRepeat: boolean): number {
    timerId++;
    let id = timerId;
    let timerTarget = TimerTargetImpl.initWithCallback(callback, id, shouldRepeat);
    let timer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(milliseconds / 1000, timerTarget, "tick", null, shouldRepeat);

    // https://github.com/NativeScript/NativeScript/issues/2116
    utils.ios.getter(NSRunLoop, NSRunLoop.currentRunLoop).addTimerForMode(timer, NSRunLoopCommonModes);

    let pair: KeyValuePair<NSTimer, TimerTargetImpl> = { k: timer, v: timerTarget };
    timeoutCallbacks.set(id, pair);

    return id;
}

export function setTimeout(callback: Function, milliseconds = 0): number {
    return createTimerAndGetId(zonedCallback(callback), milliseconds, false);
}

export function clearTimeout(id: number): void {
    let pair = timeoutCallbacks.get(<number><any>id);
    if (pair) {
        pair.v.unregister();
    }
}

export function setInterval(callback: Function, milliseconds = 0): number {
    return createTimerAndGetId(zonedCallback(callback), milliseconds, true);
}

export var clearInterval = clearTimeout;
