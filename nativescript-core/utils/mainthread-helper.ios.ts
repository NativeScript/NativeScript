export function dispatchToMainThread(func: () => void) {
	NSOperationQueue.mainQueue.addOperationWithBlock(func);
}

export function isMainThread(): Boolean {
	return NSThread.isMainThread;
}
