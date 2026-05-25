export function dispatchToMainThread(func: () => void): void {
	(global as any).__nsRunOnUIThread(() => {
		func();
	})
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
