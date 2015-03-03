/**
 * Android specific timer functions implementation.
 */
var timeoutHandler;
var timeoutCallbacks = {};

function createHadlerAndGetId(): number {
    if (!timeoutHandler) {
        timeoutHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    }

    return new Date().getUTCMilliseconds();
}

export function setTimeout(callback: Function, milliseconds = 0): number {
    var id = createHadlerAndGetId();

    var runnable = new java.lang.Runnable({
        run: () => {
            callback();

            if (timeoutCallbacks && timeoutCallbacks[id]) {
                timeoutCallbacks[id] = null;
            }
        }
    });

    if (!timeoutCallbacks[id]) {
        timeoutCallbacks[id] = runnable;
    }

    timeoutHandler.postDelayed(runnable, long(milliseconds));

    return id;
}

export function clearTimeout(id: number): void {
    if (timeoutCallbacks[id]) {
        timeoutHandler.removeCallbacks(timeoutCallbacks[id]);
        timeoutCallbacks[id] = null;
    }
}

export function setInterval(callback: Function, milliseconds = 0): number {
    var id = createHadlerAndGetId();
    var handler = timeoutHandler;

    var runnable = new java.lang.Runnable({
        run: () => {
            callback();
            handler.postDelayed(runnable, long(milliseconds));
        }
    });

    if (!timeoutCallbacks[id]) {
        timeoutCallbacks[id] = runnable;
    }

    timeoutHandler.postDelayed(runnable, long(milliseconds));

    return id;
}

export var clearInterval = clearTimeout;