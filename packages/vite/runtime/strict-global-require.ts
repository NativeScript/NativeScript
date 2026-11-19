// Replaces the runtime's global `require` for the dev session (NS_VITE_STRICT_REQUIRE).
// It must stay a function that throws only when called: core reads `global.require`
// at boot, and the native runtime checks it is a function before running a script.
function require(specifier?: unknown): never {
	throw new Error(`require(${JSON.stringify(specifier)}): the global require is not available in dev (NS_VITE_STRICT_REQUIRE). Use import, or a require from createRequire (ns:module) for runtime builtins and files on disk.`);
}

(globalThis as any).require = require;

export {};
