import path from 'path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const nodeRequire = createRequire(import.meta.url);

// Preserve `new Worker(new URL(...))` URLs that Angular's internal TS
// transformer would otherwise blank out during `vite build`.
//
// ## Background
//
// `@angular/build` ships a TypeScript transformer
// (`src/tools/angular/transformers/web-worker-transformer.js`) that rewrites
// every `new Worker(new URL('./x', import.meta.url))` node it sees. It calls
// a host-provided `processWebWorker(workerFile, containingFile)` callback and
// replaces the URL string with whatever the callback returns — unless the
// callback returns the *same* string it received, in which case Angular's
// transformer returns the node unchanged (see the
// `if (replacementPath !== filePath) { updateNewExpression(...) } else { return node; }`
// branch in the upstream transformer).
//
// `@analogjs/vite-plugin-angular` supplies a host whose `processWebWorker`
// implementation returns `''` unconditionally. The rationale on the Analog
// side is "let Vite's own worker plugin handle bundling downstream" — but
// because Analog returns a *different* string (`''`) than `workerFile`,
// Angular's transformer takes the rewrite branch and emits:
//
// ```js
// new Worker(new URL("", import.meta.url), { type: "module" })
// ```
//
// Vite's `workerImportMetaUrlPlugin` then runs in `vite build`, but its regex
// requires a non-empty URL literal:
//
// ```js
// /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\))/dg
// ```
//
// No match → no asset emitted → the final bundle ships the literal empty URL.
// On device, the NS iOS Worker constructor resolves `new URL("", <bundle-url>)`
// to the main bundle's own URL and `ReadText` on that path asserts inside
// V8's module loader.
//
// ## Fix: wrap `hostOptions.processWebWorker` at `initialize()` time
//
// Angular's compilation layer has three concrete implementations:
//
//   * `AotCompilation` — runs the TypeScript program in-process.
//   * `JitCompilation` — same, but in JIT mode.
//   * `ParallelCompilation` — spawns a Node Worker thread via `node:worker_threads`,
//     runs the compiler there, and routes `processWebWorker` calls BACK to
//     the main thread through a `MessageChannel`. The actual `processWebWorker`
//     invocation (`hostOptions.processWebWorker(workerFile, containingFile)`)
//     happens on the main thread — see `parallel-compilation.js` line 54.
//
// The default factory returns a `ParallelCompilation` (feature-flagged via
// `useParallelTs`), so patching `createWorkerTransformer` alone — which our
// earlier attempt did — misses the case that actually ships: the transformer
// runs in the worker thread with its own fresh module scope, and our
// main-thread patch on `@angular/build/src/tools/angular/transformers/web-worker-transformer.js`
// is never seen.
//
// But the hostOptions object itself is passed in from the main thread and
// its `processWebWorker` method is called on the main thread in all three
// implementations. So we intercept at `initialize(tsconfig, hostOptions, ...)`
// and wrap `hostOptions.processWebWorker` to be an identity function before
// handing hostOptions off to the original `initialize`. This:
//
//   * Works uniformly for `AotCompilation`, `JitCompilation`, and
//     `ParallelCompilation` because all three call `hostOptions.processWebWorker`
//     on the main thread (worker-thread calls are proxied back here via
//     MessageChannel). No worker-thread code needs to change.
//   * Leaves `createWorkerTransformer` untouched — we never modify the
//     transformer module, so any downstream code that destructures it at
//     module-load time keeps working.
//   * Is idempotent per subclass (`__nativescriptPatchedProcessWebWorker`
//     sentinel), so applying the plugin twice is harmless.
//   * Is tolerant of missing `@angular/build` (non-Angular projects) — no-op.
//   * Is tolerant of missing subclasses — patches only what's installed.
export interface AngularWorkerUrlPreservePluginOptions {
	verbose?: boolean;
}

export function angularWorkerUrlPreservePlugin(opts?: AngularWorkerUrlPreservePluginOptions): Plugin {
	const { verbose } = opts || {};
	let patched = false;

	const applyPatch = () => {
		if (patched) return;
		patched = true;
		patchAngularCompilationInitializers({ verbose });
	};

	return {
		name: 'nativescript-angular-worker-url-preserve',
		// `enforce: 'pre'` + eager `config` hook ensures the patch lands
		// before any `buildStart`/`transform` hook runs (i.e. before Angular
		// ever instantiates a compilation class and calls `initialize`).
		enforce: 'pre',
		config() {
			applyPatch();
			return null;
		},
		// Belt-and-suspenders: Vite sometimes skips `config` for inner
		// environments (e.g. `build --environment=<name>`). `configResolved`
		// always runs once per environment, so re-applying here is safe
		// (idempotent) and guarantees the patch lands before compilation.
		configResolved() {
			applyPatch();
		},
	};
}

interface AngularCompilationClassTarget {
	specifier: string;
	className: string;
}

// The three concrete `AngularCompilation` subclasses in `@angular/build`.
// All three expose an `initialize(tsconfig, hostOptions, compilerOptionsTransformer)`
// method that forwards `hostOptions.processWebWorker` into either the TS
// transformer (Aot/Jit) or a worker-thread MessageChannel (Parallel). We
// wrap `initialize` on each so `hostOptions.processWebWorker` is coerced to
// identity before any of that happens.
const ANGULAR_COMPILATION_TARGETS: readonly AngularCompilationClassTarget[] = [
	{
		specifier: 'src/tools/angular/compilation/aot-compilation.js',
		className: 'AotCompilation',
	},
	{
		specifier: 'src/tools/angular/compilation/jit-compilation.js',
		className: 'JitCompilation',
	},
	{
		specifier: 'src/tools/angular/compilation/parallel-compilation.js',
		className: 'ParallelCompilation',
	},
];

function patchAngularCompilationInitializers(opts: { verbose?: boolean }) {
	const { verbose } = opts;
	// `@angular/build` locks its public `exports` map to `.`, `./private`,
	// and `./package.json`. Deep subpath requires like
	// `@angular/build/src/tools/angular/compilation/aot-compilation.js`
	// fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Resolve the package root
	// via the always-allowed `./package.json` export and require the
	// absolute on-disk paths instead — `exports` doesn't gate absolute fs
	// paths.
	let pkgRoot: string;
	try {
		const pkgJsonPath = nodeRequire.resolve('@angular/build/package.json');
		pkgRoot = path.dirname(pkgJsonPath);
	} catch {
		if (verbose) {
			// eslint-disable-next-line no-console
			console.log('[ns-angular-worker-preserve] @angular/build not installed; skipping patch (non-Angular project)');
		}
		return;
	}

	let patchedCount = 0;
	let attemptedCount = 0;
	for (const target of ANGULAR_COMPILATION_TARGETS) {
		attemptedCount++;
		const filePath = path.join(pkgRoot, target.specifier);
		let mod: any;
		try {
			mod = nodeRequire(filePath);
		} catch (err) {
			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-angular-worker-preserve] ${target.className} not loadable at ${filePath} (older @angular/build or reorganized layout); skipping:`, (err as Error).message);
			}
			continue;
		}

		const klass = mod ? mod[target.className] : null;
		if (typeof klass !== 'function') {
			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-angular-worker-preserve] ${target.className} export missing from ${filePath}; skipping`);
			}
			continue;
		}

		if (klass.__nativescriptPatchedProcessWebWorker) {
			patchedCount++;
			continue;
		}

		const originalInitialize = klass.prototype && klass.prototype.initialize;
		if (typeof originalInitialize !== 'function') {
			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-angular-worker-preserve] ${target.className}.prototype.initialize missing; skipping`);
			}
			continue;
		}

		klass.prototype.initialize = function nativescriptPatchedInitialize(tsconfig: string, hostOptions: any, ...rest: unknown[]) {
			// Wrap `processWebWorker` in place so Angular sees an identity
			// function. When Angular's transformer sees `replacementPath ===
			// filePath` it leaves `new Worker(new URL(...))` nodes unchanged,
			// and Vite's own `workerImportMetaUrlPlugin` handles bundling
			// downstream. Mutating the incoming object is safe: Analog
			// constructs a fresh `hostOptions` on every `performAngularCompilation`
			// call, and the only consumer (this `initialize` call) runs
			// synchronously after our override.
			if (hostOptions && typeof hostOptions.processWebWorker === 'function' && !hostOptions.__nativescriptPatchedProcessWebWorker) {
				hostOptions.processWebWorker = function identityProcessWebWorker(workerFile: string, _containingFile: string): string {
					return workerFile;
				};
				hostOptions.__nativescriptPatchedProcessWebWorker = true;
			}
			return originalInitialize.call(this, tsconfig, hostOptions, ...rest);
		};
		klass.__nativescriptPatchedProcessWebWorker = true;
		patchedCount++;
	}

	if (verbose) {
		if (patchedCount === 0) {
			// eslint-disable-next-line no-console
			console.warn(`[ns-angular-worker-preserve] no AngularCompilation subclasses patched (tried ${attemptedCount}); worker URLs may be blanked out in the build`);
		} else {
			// eslint-disable-next-line no-console
			console.log(`[ns-angular-worker-preserve] patched ${patchedCount}/${attemptedCount} AngularCompilation subclass initializers (${ANGULAR_COMPILATION_TARGETS.map((t) => t.className).join(', ')})`);
		}
	}
}
