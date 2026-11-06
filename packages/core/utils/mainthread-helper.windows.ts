export function dispatchToMainThread(func: () => void): void {
	(global as any).__nsRunOnUIThread(() => {
		func();
	})
}

export function isMainThread(): boolean {
	try {
		const queue = Microsoft?.UI?.Dispatching?.DispatcherQueue?.GetForCurrentThread?.();
		return queue ? queue.HasThreadAccess : true;
	} catch {
		return true;
	}
}

export function dispatchToUIThread(func: () => void): void {
	dispatchToMainThread(func);
}
