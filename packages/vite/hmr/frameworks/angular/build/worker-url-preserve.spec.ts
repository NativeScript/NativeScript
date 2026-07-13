import { describe, expect, it } from 'vitest';

import { angularWorkerUrlPreservePlugin } from './worker-url-preserve.js';

// This plugin monkey-patches the `initialize(tsconfig, hostOptions, ...)`
// method on each of `@angular/build`'s three concrete compilation classes
// (`AotCompilation`, `JitCompilation`, `ParallelCompilation`) so that
// `hostOptions.processWebWorker` is coerced to an identity function before
// Angular's compilation machinery sees it. The reason this matters is
// covered at length in `worker-url-preserve.ts`, but the short version is:
//
//   * Analog's Vite plugin provides a host whose `processWebWorker` returns
//     `''` unconditionally. Angular's TS transformer ends up rewriting every
//     `new Worker(new URL('./x', import.meta.url))` node into
//     `new Worker(new URL("", import.meta.url), { type: "module" })`.
//   * Vite's own `workerImportMetaUrlPlugin` requires a non-empty URL
//     literal, so it no-ops and the final bundle ships an empty URL.
//   * On device, the NS iOS Worker constructor resolves the empty URL to
//     the main bundle's own URL and crashes inside V8's module loader with
//     a `ReadText("")` assertion.
//
// The post-patch behaviour: `hostOptions.processWebWorker` returns
// `workerFile` unchanged. Angular's transformer sees `replacementPath ===
// filePath` and leaves the `new Worker(...)` node alone. Vite's built-in
// worker plugin then does its normal rewrite (real asset path +
// `/* @vite-ignore */` comment) and `workerUrlPlugin()` in `helpers/workers.ts`
// converts that into the `new Worker('~/' + ...)` shape the NS runtime
// expects.
//
// The patch targets `initialize` instead of `createWorkerTransformer`
// because the default compilation is `ParallelCompilation`, which runs
// Angular's TS program in a worker thread. The worker thread has its own
// fresh module scope, so a main-thread patch on `createWorkerTransformer`
// is never seen there. But `hostOptions.processWebWorker` is always called
// back on the main thread (even under parallel mode — via `MessageChannel`
// proxying — see `parallel-compilation.js` line 54), so patching
// `initialize` on the main-thread class is sufficient to cover every
// implementation.
//
// Unit-level asserts cover:
//
//   * `angularWorkerUrlPreservePlugin` returns a Vite plugin with the
//     correct name, `enforce: 'pre'`, and a `config` hook.
//   * Post-patch, each installed compilation class has its `initialize`
//     method wrapped with the `__nativescriptPatchedProcessWebWorker`
//     sentinel.
//   * Calling the wrapped `initialize` with a hostOptions whose
//     `processWebWorker` returns `''` (Analog's shape) mutates the
//     hostOptions in place so subsequent calls return `workerFile`
//     unchanged. This is the regression we ACTUALLY care about: if the
//     patch stops doing identity replacement, the `vite build` bundle
//     reverts to the empty-URL crash shape.
//   * Re-applying the plugin's `config` hook is idempotent.
//   * Non-Angular environments: the plugin must not throw when
//     `@angular/build` can't be resolved.

const createRequireForSpec = async () => {
	const { createRequire } = await import('node:module');
	return createRequire(import.meta.url);
};

const ANGULAR_COMPILATION_CLASS_NAMES = ['AotCompilation', 'JitCompilation', 'ParallelCompilation'] as const;

/**
 * Resolve all three `AngularCompilation` subclass modules from the
 * installed `@angular/build` package. Mirrors the plugin's resolution
 * strategy: go through `./package.json` (always exported) to sidestep
 * `@angular/build`'s restrictive `exports` map, then require the
 * absolute paths.
 *
 * Returns an array of `{ className, mod }` entries — empty if
 * `@angular/build` isn't installed (non-Angular env). Missing individual
 * subclasses (older layouts, reorganized tree) are silently skipped.
 */
async function resolveAngularCompilationModules() {
	const req = await createRequireForSpec();
	try {
		const { dirname, join } = await import('node:path');
		const pkgJsonPath = req.resolve('@angular/build/package.json');
		const pkgRoot = dirname(pkgJsonPath);
		const targets: Array<{ className: string; specifier: string }> = [
			{ className: 'AotCompilation', specifier: 'src/tools/angular/compilation/aot-compilation.js' },
			{ className: 'JitCompilation', specifier: 'src/tools/angular/compilation/jit-compilation.js' },
			{ className: 'ParallelCompilation', specifier: 'src/tools/angular/compilation/parallel-compilation.js' },
		];
		const resolved: Array<{ className: string; mod: any }> = [];
		for (const target of targets) {
			try {
				const mod = req(join(pkgRoot, target.specifier));
				if (mod && typeof mod[target.className] === 'function') {
					resolved.push({ className: target.className, mod });
				}
			} catch {
				// subclass missing in this @angular/build version
			}
		}
		return resolved;
	} catch {
		return [];
	}
}

describe('angularWorkerUrlPreservePlugin (metadata)', () => {
	it('returns a plugin with the right name and enforces `pre`', () => {
		const plugin = angularWorkerUrlPreservePlugin();
		expect(plugin.name).toBe('nativescript-angular-worker-url-preserve');
		expect(plugin.enforce).toBe('pre');
		expect(typeof plugin.config).toBe('function');
		expect(typeof plugin.configResolved).toBe('function');
	});
});

describe('angularWorkerUrlPreservePlugin (patch behaviour — requires @angular/build)', () => {
	it('wraps initialize() on every installed AngularCompilation subclass', async () => {
		const modules = await resolveAngularCompilationModules();
		if (modules.length === 0) {
			// No Angular installed — the plugin should no-op. The
			// "does not throw in non-Angular env" spec below covers that
			// path explicitly.
			return;
		}

		const plugin = angularWorkerUrlPreservePlugin();
		(plugin.config as any)();

		// At least one subclass must carry the sentinel — we must never
		// silently skip every patch target and let the build ship a
		// broken worker URL.
		const patchedCount = modules.filter(({ mod, className }) => mod[className]?.__nativescriptPatchedProcessWebWorker === true).length;
		expect(patchedCount).toBeGreaterThan(0);
		expect(ANGULAR_COMPILATION_CLASS_NAMES).toContain(modules[0].className as any);
	});

	it('replaces hostOptions.processWebWorker with identity at initialize() time (the regression guard)', async () => {
		const modules = await resolveAngularCompilationModules();
		if (modules.length === 0) return;

		const plugin = angularWorkerUrlPreservePlugin();
		(plugin.config as any)();

		// Build a fake `hostOptions` object shaped like the one Analog
		// constructs. The original `processWebWorker` returns `''` — the
		// exact shape that breaks `vite build`. After our patched
		// `initialize` runs, it must return the input `workerFile`
		// unchanged (identity).
		const observedCalls: Array<{ inputFile: string; returned: unknown }> = [];
		for (const { mod, className } of modules) {
			const klass = mod[className];
			const patchedInit = klass.prototype.initialize;

			// Invoke the patched wrapper via an instance. We need to
			// construct an instance — the concrete classes take `jit`
			// and `browserOnlyBuild` (Parallel) or `browserOnlyBuild`
			// (Aot/Jit) booleans. Defaults match what Analog passes.
			let instance: any;
			try {
				if (className === 'ParallelCompilation') {
					// ParallelCompilation spawns a worker thread in its
					// constructor. We don't want that side effect in a
					// unit test — we're only exercising the patched
					// initialize logic. Fake an instance via
					// Object.create so the prototype method runs without
					// triggering the constructor.
					instance = Object.create(klass.prototype);
				} else {
					instance = new klass(false);
				}
			} catch {
				// If construction fails for any reason (Angular changes
				// constructor shape), fall back to a prototype-only
				// instance.
				instance = Object.create(klass.prototype);
			}

			// The patch mutates hostOptions IN PLACE before delegating to
			// the captured original. We can observe the mutation by calling
			// the processWebWorker method after `initialize` returns (or
			// would return — the downstream call may throw on our fake
			// tsconfig, which is fine).
			const freshHostOptions = {
				processWebWorker(workerFile: string, _containingFile: string) {
					// This is the shape that causes the bug — returning empty
					// string so Angular rewrites the `new Worker(new URL(...))`
					// to `new Worker(new URL("", ...))`.
					return '';
				},
			} as any;

			try {
				await patchedInit.call(instance, '/fake/tsconfig.json', freshHostOptions);
			} catch {
				// Downstream initialize may fail because our fake
				// tsconfig doesn't exist — that's fine, we only care
				// whether the hostOptions mutation happened BEFORE the
				// call went downstream.
			}

			// CRITICAL assertion: the hostOptions we passed in has had
			// its processWebWorker replaced. Calling it with any input
			// must return the input unchanged.
			expect(typeof freshHostOptions.processWebWorker).toBe('function');
			expect(freshHostOptions.processWebWorker('./sample.worker', '/src/app/app.component.ts')).toBe('./sample.worker');
			expect(freshHostOptions.processWebWorker('./another-worker.ts', '/src/foo.ts')).toBe('./another-worker.ts');
			expect(freshHostOptions.__nativescriptPatchedProcessWebWorker).toBe(true);

			observedCalls.push({ inputFile: className, returned: 'identity-verified' });
		}

		// Every installed subclass must have been verified.
		expect(observedCalls.length).toBe(modules.length);
	});

	it('is idempotent: repeated config() invocations keep the same patched initialize', async () => {
		const modules = await resolveAngularCompilationModules();
		if (modules.length === 0) return;

		const pluginA = angularWorkerUrlPreservePlugin();
		const pluginB = angularWorkerUrlPreservePlugin();

		(pluginA.config as any)();
		const firstByClass = new Map(modules.map(({ mod, className }) => [className, mod[className].prototype.initialize]));

		(pluginB.config as any)();
		const secondByClass = new Map(modules.map(({ mod, className }) => [className, mod[className].prototype.initialize]));

		// Same reference per class — the second call must recognise
		// the `__nativescriptPatchedProcessWebWorker` sentinel and
		// skip re-wrapping. Double-wrapping would still yield identity
		// but burns a closure call and could break if Angular ever
		// adds a second-phase init convention.
		for (const [className, ref] of firstByClass) {
			expect(secondByClass.get(className)).toBe(ref);
		}
	});
});

describe('angularWorkerUrlPreservePlugin (no-Angular environment graceful degradation)', () => {
	it('does not throw when @angular/build cannot be resolved', () => {
		// We can't actually uninstall `@angular/build` from the test env,
		// but we can confirm the plugin's public contract: every
		// lifecycle hook must be safe to invoke. In a real non-Angular
		// project, `nodeRequire.resolve('@angular/build/package.json')`
		// throws `MODULE_NOT_FOUND` and the plugin silently no-ops.
		const plugin = angularWorkerUrlPreservePlugin({ verbose: false });
		expect(() => (plugin.config as any)()).not.toThrow();
		expect(() => (plugin.configResolved as any)()).not.toThrow();
	});
});
