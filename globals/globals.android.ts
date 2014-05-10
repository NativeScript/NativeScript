/**
  * Android specific global functions implementation.
  */
export function setTimeout(callback: Function, milliseconds: number): void {
    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(
        new java.lang.Runnable({
            run: function () { callback(); }
        }),
        long(milliseconds));
}
