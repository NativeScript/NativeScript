import { ad } from './native-helper';

export function dispatchToMainThread(func: () => void) {
	const runOnMainThread = (global as any).__runOnMainThread;
	if (runOnMainThread) {
		runOnMainThread(() => {
			func();
		});
	} else {
		new android.os.Handler(android.os.Looper.getMainLooper()).post(
			new java.lang.Runnable({
				run: func,
			})
		);
	}
}

export function isMainThread(): boolean {
	return android.os.Looper.myLooper() === android.os.Looper.getMainLooper();
}

export function dispatchToUIThread(func: () => void) {
	const activity: androidx.appcompat.app.AppCompatActivity = ad.getCurrentActivity();
	if (activity && func) {
		activity.runOnUiThread(
			new java.lang.Runnable({
				run() {
					func();
				},
			})
		);
	}
}
