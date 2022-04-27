export function dispatchToMainThread(func: () => void) {
	NSOperationQueue.mainQueue.addOperationWithBlock(func);
}

export function isMainThread(): boolean {
	return NSThread.isMainThread;
}

export function dispatchToUIThread(func: () => void) {
	const runloop = CFRunLoopGetMain();
	return function (func) {
		if (runloop && func) {
			CFRunLoopPerformBlock(runloop, kCFRunLoopDefaultMode, func);
			CFRunLoopWakeUp(runloop);
		} else if (func) {
			func();
		}
	};
}
