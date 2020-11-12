export function dispatchToMainThread(func: () => void) {
	NSOperationQueue.mainQueue.addOperationWithBlock(func);
}

export function isMainThread(): boolean {
	return NSThread.isMainThread;
}
