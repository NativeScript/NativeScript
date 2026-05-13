interface KeyValuePair<K, V> {
    k: K;
    v: V;
}

let _nextId = 0;
var _timers = new Map<number, KeyValuePair<Windows.UI.Xaml.DispatcherTimer, Windows.Foundation.TypedEventHandler<Windows.System.DispatcherQueueTimer, Object>>>();

function _span(ms: number) {
    // TimeSpan.Duration is in 100-ns ticks; 1 ms = 10 000 ticks.
    //@ts-ignore
    return new Windows.Foundation.TimeSpan({
        Duration: Math.max(1, Math.floor(ms || 0)) * 10000
    });
}

function createTimerAndGetId(callback: Function, milliseconds: number, shouldRepeat: boolean) {
    const id = ++_nextId;
    // using the xaml timers for now.
    const timer = new Windows.UI.Xaml.DispatcherTimer();
    timer.Interval = _span(milliseconds);
    const delegate = NSWinRT.asDelegate(function () {
        if (!shouldRepeat) {
            timer.Stop();
            _timers.delete(id);
        }
        if (!_timers.has(id)) return;
        callback();
    });
    timer.Tick = delegate;
    _timers.set(id, {
        k: timer,
        v: delegate
    });
    timer.Start();
    return id;
}



export function setTimeout(callback: Function, milliseconds = 0, ...args: any[]): number {
    // Cast to Number
    milliseconds += 0;
    const invoke = () => callback(...args);
    const zoneBound = zonedCallback(invoke);
    return createTimerAndGetId(zoneBound, milliseconds, false);
}

export function clearTimeout(id: number): void {
    const pair = _timers.get(<number>(<any>id));
    if (pair && pair.k) {
        pair.k.Stop();
        _timers.delete(id);
    }
}

export function setInterval(callback: Function, milliseconds = 0, ...args: []): number {
    const invoke = () => callback(...args);

    return createTimerAndGetId(zonedCallback(invoke), milliseconds, true);
}

export const clearInterval = clearTimeout;