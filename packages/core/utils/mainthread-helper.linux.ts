// JS runs on the GTK main thread; queue to keep the async contract of the other platforms.
export function dispatchToMainThread(func: () => void): void {
	setTimeout(func, 0);
}

export function isMainThread(): boolean {
	return true;
}

export function dispatchToUIThread(func: () => void): void {
	dispatchToMainThread(func);
}
