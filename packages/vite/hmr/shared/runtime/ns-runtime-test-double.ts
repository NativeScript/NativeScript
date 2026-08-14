/**
 * TEST-ONLY. A stand-in for the runtime's `ns:module` builtin module.
 *
 * On device the dev host API is resolved with `require("ns:module")`
 * through the global CJS `require` the runtime installs. Vitest runs have
 * no such global, so specs install this double: a stubbed `require` that
 * hands back one mutable module object. Tests mutate members on that
 * object exactly like the device runtime's module would carry them.
 * Vitest isolates test files, so the stub never needs uninstalling.
 */
import type { NsRuntimeDevHostApi } from './browser-runtime-contract.js';

type MutableNsRuntime = { [K in keyof NsRuntimeDevHostApi]: NsRuntimeDevHostApi[K] };

/**
 * Stub `scope.require` to resolve `ns:module` to a fresh mutable module
 * object (returned), delegating every other specifier to any pre-existing
 * `require`. Calling again replaces the module object.
 */
export function installFakeNsRuntime(scope: Record<string, unknown> = globalThis as never): MutableNsRuntime {
	const moduleObject: MutableNsRuntime = {};
	const previousRequire = scope.require;
	scope.require = (specifier: string): unknown => {
		if (specifier === 'ns:module') {
			return moduleObject;
		}
		if (typeof previousRequire === 'function') {
			return (previousRequire as (spec: string) => unknown)(specifier);
		}
		throw new Error(`No such built-in module: ${specifier}`);
	};
	return moduleObject;
}
