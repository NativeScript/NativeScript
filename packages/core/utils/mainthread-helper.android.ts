export function dispatchToMainThread(func: () => void) {
	new android.os.Handler(android.os.Looper.getMainLooper()).post(
		new java.lang.Runnable({
			run: func,
		})
	);
}

export function isMainThread(): Boolean {
	return android.os.Looper.myLooper() === android.os.Looper.getMainLooper();
}
