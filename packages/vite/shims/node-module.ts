// Minimal shim for `node:module` to satisfy imports from vite/module-runner.
// We only provide createRequire to avoid hard crashes; it is a noop in NS.
export function createRequire(_url: string) {
	const req: any = function () {
		throw new Error('createRequire is not supported in NativeScript runtime');
	};
	req.resolve = function () {
		throw new Error('require.resolve is not supported in NativeScript runtime');
	};
	return req;
}

export default { createRequire };
