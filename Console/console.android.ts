export class ConsoleHelper {
    static TAG: string = 'JS';

    static log(message: string): void {
        android.util.Log.v(ConsoleHelper.TAG, message);
    }

    static info(message: string): void {
        android.util.Log.i(ConsoleHelper.TAG, message);
    }

    static error(message: string): void {
        android.util.Log.e(ConsoleHelper.TAG, message);
    }

    static warn(message: string): void {
        android.util.Log.w(ConsoleHelper.TAG, message);
    }

    static timeMillis(): number {
        // NOTE: we might need to use currentTimeMillis if we have troubles with the long size
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    }
}