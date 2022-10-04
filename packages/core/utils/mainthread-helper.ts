/**
 * Overwritten by platform specific exports
 * Utilized purely for unit testing
 */
export function dispatchToMainThread(func: Function) {
	func();
}

export function isMainThread(): boolean {
	return true;
}

export function dispatchToUIThread(func: Function) {
	func();
}
