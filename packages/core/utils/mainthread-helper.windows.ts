export function dispatchToMainThread(func: () => void): void {
	const runOnMainThread = (global as any).__runOnMainThread;
	if (runOnMainThread) {
		runOnMainThread(func);
		return;
	}
	try {
		const dispatcher = Windows?.UI?.Core?.CoreWindow?.GetForCurrentThread?.()?.Dispatcher;
		if (dispatcher) {
			dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, NSWinRT.asDelegate(func));
		} else {
			func();
		}
	} catch {
		func();
	}
}

export function isMainThread(): boolean {
	try {
		const dispatcher = Windows?.UI?.Core?.CoreWindow?.GetForCurrentThread?.()?.Dispatcher;
		return dispatcher ? dispatcher.HasThreadAccess : true;
	} catch {
		return true;
	}
}

export function dispatchToUIThread(func: () => void): void {
	dispatchToMainThread(func);
}
