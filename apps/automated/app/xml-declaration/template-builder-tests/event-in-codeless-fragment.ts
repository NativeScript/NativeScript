let callback: (args: any) => void;
export function test(args: any) {
	if (callback) {
		callback(args);
	}
}

export function setCallback(cb: (args: any) => void) {
	callback = cb;
}
