var TAG = 'JS';

export var helper_log = function (message: string) {
    android.util.Log.v(TAG, message);
}

export var info = function (message: string) {
    android.util.Log.i(TAG, message);
}

export var error = function (message: string) {
    android.util.Log.e(TAG, message);
}

export var warn = function (message: string) {
    android.util.Log.w(TAG, message);
}

export var timeMillis = function (): number {
    // NOTE: we might need to use currentTimeMillis if we have troubles with the long size
    return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
}