/**
 * Patch Worker to accept URL as a parameter
 */
const _Worker = globalThis.Worker;
globalThis.__worker_patched = true;
globalThis.Worker = class WorkerWithURL extends _Worker {
	constructor(url) {
		const path = url instanceof URL ? url.href.replace('file://', '~') : url;
		super(path);
	}
};

if (!globalThis.NativeClass) {
	globalThis.NativeClass = function NativeClass(target) {
		// No-op decorator - does nothing but mark the class
		return target;
	};
}
