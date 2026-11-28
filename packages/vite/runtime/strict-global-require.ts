// Shadows the runtime's global `require` for the dev session (opt out: NS_VITE_STRICT_REQUIRE=0).
// It must stay a function: core reads `global.require` at boot, and the native runtimes check
// it is one before running a script. The runtimes also look it up at call time and call it with
// the absolute path of a non-ESM script on disk (iOS `RunModule`, Android `ModuleInternal::Load`),
// so absolute paths and `file:` URLs go to the require installed before this module ran.
// Android's inspector also loads `inspector_modules` by bare name the same way.
const runtimeRequire: ((...args: unknown[]) => unknown) | undefined = typeof (globalThis as any).require === 'function' ? (globalThis as any).require : undefined;

const RUNTIME_MODULE_NAMES = new Set(['inspector_modules']);

function isRuntimeSpecifier(specifier: unknown): boolean {
	if (typeof specifier !== 'string') return false;
	return (specifier.startsWith('/') && !specifier.startsWith('//')) || /^file:/i.test(specifier) || RUNTIME_MODULE_NAMES.has(specifier);
}

function require(this: unknown, specifier?: unknown, ...rest: unknown[]): unknown {
	if (runtimeRequire && isRuntimeSpecifier(specifier)) return runtimeRequire.call(this, specifier, ...rest);
	throw new Error(`require(${JSON.stringify(specifier)}): the global require is not available in dev. Use import, or a require from createRequire (ns:module) for runtime builtins and files on disk. NS_VITE_STRICT_REQUIRE=0 turns this check off.`);
}

(globalThis as any).require = require;

export {};
