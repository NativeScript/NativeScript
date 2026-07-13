import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { neutralizeWorkerImportMeta, viteWorkerAssetPathToNsMUrl, workerHmrUrlPlugin } from './workers.js';

// --- viteWorkerAssetPathToNsMUrl ---------------------------------------
//
// This helper takes Vite's emitted dev-server worker asset path (project-
// relative or `/@fs/`-absolute), strips the rewritable file extension, and
// returns the canonical `/ns/m/<rel>` URL the NativeScript HMR middleware
// serves. It must:
//
//   * Map project-relative paths the same way `/ns/m/` does (drop `.ts`,
//     `.js`, `.mjs`, `.cjs`, `.tsx`, `.jsx`).
//   * Map `/@fs/` paths that fall *under* the project or workspace root
//     by stripping the matching prefix.
//   * Refuse to map URLs without the `worker_file` query (so non-worker
//     `new URL(..., import.meta.url)` calls — assets, generic URLs — are
//     left to Vite's default handling).
//   * Refuse to map `/@fs/` paths outside both the project and the
//     workspace root (we'd have nowhere safe to anchor them; Vite's
//     default behaviour is fine for those).
//
// The fixed POSIX paths below stand in for a typical Nx workspace layout
// (`<workspace>/apps/<app>/src/...`) so the assertions don't depend on the
// machine running them.
const PROJECT_ROOT = '/abs/workspace/apps/console';
const WORKSPACE_ROOT = '/abs/workspace';

describe('viteWorkerAssetPathToNsMUrl', () => {
	it('maps a project-relative TS worker asset to /ns/m/ with the extension stripped', () => {
		const result = viteWorkerAssetPathToNsMUrl('/src/workers/light-controller/light-controller.worker.ts?worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT);
		expect(result).toBe('/ns/m/src/workers/light-controller/light-controller.worker');
	});

	it('strips every rewritable extension Vite may emit (.ts/.tsx/.mjs/.cjs/.js/.jsx)', () => {
		for (const ext of ['ts', 'tsx', 'mjs', 'cjs', 'js', 'jsx']) {
			const result = viteWorkerAssetPathToNsMUrl(`/src/workers/foo.worker.${ext}?worker_file&type=classic`, PROJECT_ROOT, WORKSPACE_ROOT);
			expect(result).toBe('/ns/m/src/workers/foo.worker');
		}
	});

	it('refuses to map URLs without the `worker_file` query (non-worker import.meta.url sites)', () => {
		// Generic `new URL('./foo.png', import.meta.url)` lookalikes — these
		// are the asset/url-loader path that NS already tolerates because
		// they're wrapped in try/catch. We must not rewrite them.
		expect(viteWorkerAssetPathToNsMUrl('/src/assets/foo.png?import', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.ts', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	it('handles `worker_file` as a bare flag, with `&` continuation, and as the final query key', () => {
		// All three forms are how Vite spells the marker depending on the
		// surrounding query options. The helper must accept every shape.
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file=1', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?something=1&worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
	});

	it('rejects empty / non-string input defensively', () => {
		expect(viteWorkerAssetPathToNsMUrl('', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl(undefined as any, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl(null as any, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	describe('/@fs/ absolute paths (Vite uses these for files outside the project root)', () => {
		it('maps a path under the project root by stripping the project-root prefix', () => {
			const fsPath = `/@fs${PROJECT_ROOT}/src/workers/foo.worker.ts?worker_file&type=classic`;
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/workers/foo.worker');
		});

		it('falls back to the workspace root for monorepo lib paths outside the app dir', () => {
			// `libs/xplat/...` sits outside `apps/console/` but inside the workspace,
			// which is the common monorepo case for shared lib files imported from
			// a worker entry. The helper should anchor at the workspace root.
			const fsPath = `/@fs${WORKSPACE_ROOT}/libs/xplat/utils/src/index.worker.ts?worker_file&type=classic`;
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/xplat/utils/src/index.worker');
		});

		it('returns null for absolute paths that fall outside both the project and the workspace root', () => {
			// We can't safely map e.g. /Users/foo/global/Library/... — there's no
			// route prefix that would resolve to that on the device. Better to
			// leave Vite's default behaviour in place and let any breakage
			// surface as a clear "module not found" rather than a wrong-route
			// 404 from NS.
			const fsPath = '/@fs/Users/foo/elsewhere/random.worker.ts?worker_file&type=classic';
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		});

		it('returns null when the workspace root is unknown and the path is outside the project', () => {
			const fsPath = `/@fs${WORKSPACE_ROOT}/libs/xplat/utils/src/index.worker.ts?worker_file&type=classic`;
			// No workspace root → only project-root anchoring is available.
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, null)).toBeNull();
		});
	});
});

// --- workerHmrUrlPlugin ------------------------------------------------
//
// The plugin runs as `enforce: 'post'` against Vite's already-transformed
// dev output. The shape it must match is the canonical output of Vite's
// built-in `workerImportMetaUrlPlugin`:
//
//   new Worker(new URL(/* @vite-ignore */ "/src/.../foo.worker.ts?worker_file&type=classic",
//                      '' + import.meta.url))
//
// (See `workerImportMetaUrlPlugin` in vite/dist/node/chunks/node.js — the
// `/* @vite-ignore */` and the empty-string `'' +` coercion are emitted
// unconditionally, and the asset path may use single quotes, double
// quotes, or backticks.) The plugin's job is to detect that exact shape
// and rewrite it to a string URL that routes through `/ns/m/` so the
// worker's transitive imports flow through our HMR pipeline.
//
// We test the plugin via its `Plugin.transform` hook directly, the same
// pattern `__tests__/angular-template-watch.spec.ts` uses for
// `angular-template-deps`.

function makeStubContext() {
	return {
		addWatchFile() {},
	};
}

function configurePlugin(plugin: ReturnType<typeof workerHmrUrlPlugin>, projectRoot: string) {
	// Vite calls `configResolved` once at startup with the resolved user
	// config; we mirror that here with the minimal shape the plugin
	// actually consumes (`config.root`). Workspace-root probing in the
	// plugin's `configResolved` walks up via `findMonorepoWorkspaceRoot`
	// looking for marker files (nx.json, pnpm-workspace.yaml, etc.). Our
	// fake `/abs/workspace/...` path doesn't exist, so the walk returns
	// `null` — which is exactly what we want for these tests, since the
	// `/@fs/` mapping cases are all covered directly by
	// `viteWorkerAssetPathToNsMUrl` above.
	const configResolved = (plugin as any).configResolved as (config: any) => void;
	configResolved.call(plugin, { root: projectRoot });
}

function callTransform(plugin: ReturnType<typeof workerHmrUrlPlugin>, code: string, id: string) {
	const transform = (plugin as any).transform as (code: string, id: string) => any;
	return transform.call(makeStubContext(), code, id);
}

describe('workerHmrUrlPlugin (transform)', () => {
	it('rewrites the canonical Vite worker shape to a /ns/m/ string URL', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['export function CreateLightControllerWorker() {', '  return new Worker(new URL(/* @vite-ignore */"/src/workers/light-controller/light-controller.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', '}'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/workers/light-controller/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain('"/ns/m/src/workers/light-controller/light-controller.worker"');
		expect(result.code).toContain('__NS_HTTP_ORIGIN__');
		// The ASSERT line: the new URL+import.meta.url indirection is gone,
		// which is the entire reason this plugin exists.
		expect(result.code).not.toContain('new URL(');
		expect(result.code).not.toContain('import.meta.url');
	});

	it('preserves the trailing options object (e.g. `{ name, type }`) when present', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = "new Worker(new URL(/* @vite-ignore */\"/src/workers/foo.worker.ts?worker_file&type=classic\", '' + import.meta.url), { name: 'foo', type: 'classic' });";

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain("{ name: 'foo', type: 'classic' }");
	});

	it('accepts every quote style Vite may emit for the asset path (single, double, backtick)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		for (const quote of ["'", '"', '`']) {
			const empty = quote === '`' ? '``' : `${quote}${quote}`;
			const input = `new Worker(new URL(/* @vite-ignore */${quote}/src/workers/foo.worker.ts?worker_file&type=classic${quote}, ${empty} + import.meta.url));`;

			const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

			expect(result, `failed for quote=${quote}`).not.toBeNull();
			expect(result.code).toContain('"/ns/m/src/workers/foo.worker"');
		}
	});

	it('returns null (skips work) when the file contains no `new Worker` mention', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'export const x = 1;';
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('returns null (skips work) when the file mentions `new Worker` but has no Vite-shaped match', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		// Pre-Vite source — the user's untransformed code. By the time we
		// run, Vite has already rewritten this; if we ever see it, it's
		// because Vite *didn't* transform (e.g. wrong file type) and we
		// shouldn't make it worse.
		const code = "new Worker(new URL('./worker', import.meta.url));";
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('skips files inside node_modules even if they contain a Vite worker shape', () => {
		// We intentionally leave 3rd-party packages alone — anything they
		// did with workers either already worked, or has its own
		// downstream patch. Rewriting them risks routing 3rd-party worker
		// code through `/ns/m/` paths that don't exist for that package.
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'new Worker(new URL(/* @vite-ignore */"/src/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'node_modules/some-pkg/dist/index.js'))).toBeNull();
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, '.vite/deps/foo.js'))).toBeNull();
	});

	it('returns null when the asset path is outside the project + workspace (we hand back to Vite)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'new Worker(new URL(/* @vite-ignore */"/@fs/Users/foo/elsewhere/random.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		// No mapping found → leave the original (broken-but-not-our-bug)
		// shape so the developer sees Vite's error rather than a silent
		// "wrong worker URL" runtime crash.
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('rewrites multiple worker creations in a single module', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['export const a = new Worker(new URL(/* @vite-ignore */"/src/workers/effect/effect.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', 'export const b = new Worker(new URL(/* @vite-ignore */"/src/workers/transition/transition.worker.ts?worker_file&type=classic", \'\' + import.meta.url));'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain('"/ns/m/src/workers/effect/effect.worker"');
		expect(result.code).toContain('"/ns/m/src/workers/transition/transition.worker"');
		expect(result.code).not.toContain('import.meta.url');
	});

	it('returns null for the source map (Vite recomposes from upstream maps; per-Worker shift is small)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = 'new Worker(new URL(/* @vite-ignore */"/src/workers/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.map).toBeNull();
	});
});

describe('workerHmrUrlPlugin (HMR auto-terminate via global registry)', () => {
	// These specs cover the HMR worker auto-termination behaviour, which
	// prevents worker pile-up when Angular HMR re-bootstraps and runs
	// `AppComponent`'s constructor again. The fix injects a small runtime
	// helper at the top of any module we rewrite, wraps each
	// `new Worker(...)` in `__nsHmrTrackWorker(...)`, and registers the
	// worker in a process-wide `globalThis.__NS_HMR_WORKERS__` Set. The
	// Angular HMR client then drains and terminates that Set immediately
	// before invoking `__reboot_ng_modules__`.
	//
	// We don't use Vite's standard `import.meta.hot.dispose()` because the
	// NS HMR runtime's `createHotContext` only implements `on()` and
	// `accept()` — there's no `dispose()` method, so dispose callbacks
	// would silently never run.
	//
	// The asserts below describe the OBSERVABLE contract — what the
	// rewritten module body looks like — without binding the test suite
	// to exact whitespace. If this contract regresses, runtime behaviour
	// reverts to "every HMR update doubles the live worker count".

	it('injects the helper exactly once at the top of the rewritten module', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['export class AppComponent {', '  ngOnInit() {', '    this.worker = new Worker(new URL(/* @vite-ignore */"/src/app/sample.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', '  }', '}'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/app/app.component.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain('__nsHmrTrackWorker');
		// Registers in the global Set the Angular HMR client drains.
		expect(result.code).toContain('__NS_HMR_WORKERS__');
		// Helper must precede the user code — it has to be in scope by
		// the time the wrapped `new Worker(...)` call runs.
		const helperIdx = result.code.indexOf('__nsHmrTrackWorker = ');
		const wrapIdx = result.code.indexOf('__nsHmrTrackWorker(new Worker');
		expect(helperIdx).toBeGreaterThanOrEqual(0);
		expect(wrapIdx).toBeGreaterThan(helperIdx);
	});

	it('wraps `new Worker(...)` in `__nsHmrTrackWorker(...)` so the worker auto-registers for cleanup', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = 'const w = new Worker(new URL(/* @vite-ignore */"/src/workers/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		// The wrap is transparent — `__nsHmrTrackWorker(w)` returns `w`,
		// so user code that assigns the result to a variable still gets
		// a real Worker. The wrap is what enables the HMR cleanup to
		// find this worker without the user changing any source.
		expect(result.code).toMatch(/__nsHmrTrackWorker\(\s*new\s+Worker\(/);
		expect(result.code).toMatch(/const\s+w\s*=\s*__nsHmrTrackWorker\(/);
	});

	it('wraps every `new Worker(...)` call in a multi-worker module', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['const a = new Worker(new URL(/* @vite-ignore */"/src/workers/effect/effect.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', 'const b = new Worker(new URL(/* @vite-ignore */"/src/workers/transition/transition.worker.ts?worker_file&type=classic", \'\' + import.meta.url));'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		// Both workers must be wrapped. The global registry is shared
		// across all modules and the HMR client drains it on every reboot.
		const wrapMatches = result.code.match(/__nsHmrTrackWorker\(\s*new\s+Worker\(/g) || [];
		expect(wrapMatches.length).toBe(2);
	});

	it('does not inject the helper when no `new Worker` calls match (avoids polluting unrelated modules)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		// File references `new Worker` and `import.meta.url` (so the
		// fast-path short-circuit doesn't fire) but the URL doesn't
		// match the Vite worker_file shape — we must hand it back to
		// Vite untouched, which means NO helper injection either.
		const input = 'const url = new URL("./asset", import.meta.url); const x = new WorkerSubclass();';

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		// Either null (no modification) or a result that does not
		// include the helper. Both shapes are correct; we encode the
		// stricter contract: null means "no change needed".
		if (result) {
			expect(result.code).not.toContain('__nsHmrTrackWorker');
			expect(result.code).not.toContain('__NS_HMR_WORKERS__');
		} else {
			expect(result).toBeNull();
		}
	});

	it('helper source registers each worker in BOTH __NS_HMR_WORKERS__ and import.meta.hot.dispose', () => {
		// We can't `new Function()`-evaluate the helper body anymore
		// (it now contains `import.meta.hot` references which only
		// resolve inside an actual ESM module). Instead, we assert on
		// the SOURCE shape — the contract is "every worker spawn must
		// land in the legacy global Set AND must opt the module into
		// a standards-compliant `import.meta.hot.dispose` callback".
		// A future contributor who removes either path would break
		// the corresponding cleanup tier; this spec catches that.
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = 'const w = new Worker(new URL(/* @vite-ignore */"/src/workers/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));
		expect(result).not.toBeNull();

		// Path 1 (global tracking Set, drained when the runtime doesn't
		// expose `__NS_DEV__.terminateAllWorkers`).
		expect(result.code).toContain('__NS_HMR_WORKERS__');
		expect(result.code).toMatch(/__nsG\.__NS_HMR_WORKERS__\.add\(w\)/);

		// Path 2 (standards-compliant Vite primitive). We MUST register
		// a dispose so any plugin / framework that drains
		// `import.meta.hot.dispose` callbacks (incl. our own hot
		// registry's `runDispose`) catches this worker without needing
		// NS-specific globals.
		expect(result.code).toContain('import.meta.hot.dispose');
		// Per-module Set + module-level guard so a single dispose
		// registration covers every worker in the module.
		expect(result.code).toContain('__nsModuleWorkers');
		expect(result.code).toContain('__nsDisposeRegistered');
		// The dispose callback must terminate every tracked worker.
		expect(result.code).toMatch(/__nsW\.terminate\(\)/);
		// And the disposer MUST re-arm `__nsDisposeRegistered = false`
		// so the next worker spawn (post-Angular-reboot, but in the
		// SAME module instance) registers a fresh disposer for the
		// next HMR cycle. Without re-arm, only cycle #1 uses the
		// dispose path and cycles #2+ fall through to the runtime
		// terminator fallback — the observable behaviour stays
		// correct but we're paying for two cleanup paths instead of
		// one. This regression caught us during live testing.
		expect(result.code).toMatch(/__nsDisposeRegistered\s*=\s*false/);
	});

	it('still wraps user code call sites with __nsHmrTrackWorker(new Worker(...))', () => {
		// Belt-and-suspenders: even with the new dispose path, the
		// outer wrap shape that downstream tooling depends on must
		// remain stable. If a future change accidentally drops the
		// wrap, the runtime path is the only thing keeping HMR sane.
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = 'const w = new Worker(new URL(/* @vite-ignore */"/src/workers/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toMatch(/__nsHmrTrackWorker\(\s*new\s+Worker\(/);
		expect(result.code).toMatch(/const\s+w\s*=\s*__nsHmrTrackWorker\(/);
	});
});

// tsFallbackTransformPlugin + angularWorkerUrlPreservePlugin specs moved with
// their plugins to hmr/frameworks/angular/build/.

// --- neutralizeWorkerImportMeta -----------------------------------------
//
// Worker chunks are classic scripts; any code-level `import.meta` token is a
// compile-time SyntaxError on device ("Cannot compile script"). The transform
// must remove every member-access form while leaving string-literal
// occurrences (acorn error messages etc.) untouched. The vm.Script assertions
// mirror the exact compile gate the NS worker bootstrap applies.
describe('neutralizeWorkerImportMeta', () => {
	it('returns null for modules without import.meta (no-op fast path)', () => {
		expect(neutralizeWorkerImportMeta('export const a = 1;')).toBeNull();
	});

	it('substitutes .url and .dirname with static worker-safe values', () => {
		const out = neutralizeWorkerImportMeta('const u = import.meta.url; const d = import.meta.dirname;');
		expect(out?.code).toBe('const u = "file:///app/"; const d = "";');
	});

	it('neutralizes bracket member access (the @nativescript/angular hmr view-cache pattern)', () => {
		const input = ['function readImportMetaHot() { try { return import.meta["hot"]; } catch { return undefined; } }', "if (import.meta['webpackHot']) { import.meta['webpackHot'].decline(); }"].join('\n');
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code).not.toContain('import.meta');
		expect(out?.code).toContain('return (undefined);');
		expect(out?.code).toContain('if ((undefined))');
	});

	it('neutralizes dot member access beyond .url/.dirname (.hot, .env, ...)', () => {
		const out = neutralizeWorkerImportMeta('const h = import.meta.hot; const e = import.meta.env;');
		expect(out?.code).toBe('const h = (undefined); const e = (undefined);');
	});

	it('leaves bare import.meta inside string literals untouched', () => {
		// acorn's parser error messages — rewriting these corrupts library data,
		// and strings cannot break classic-script compilation.
		const input = 'this.raise(pos, "Cannot use \'import.meta\' outside a module");';
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code).toBe(input);
	});

	it('never adds or removes lines (line-level source mappings stay valid)', () => {
		const input = ['const a = import.meta.url;', 'const b = import.meta["hot"];', 'const c = import.meta.env;'].join('\n');
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code.split('\n')).toHaveLength(3);
	});

	it('produces classic-script-compilable output from a realistic hmr-helper module', async () => {
		const vm = await import('node:vm');
		const input = ['function readImportMetaHot() {', '	try {', '		return import.meta["hot"];', '	} catch {', '		return undefined;', '	}', '}', 'function hasImportMetaHot() {', '	try {', '		return !!import.meta["hot"];', '	} catch {', '		return false;', '	}', '}', 'if (import.meta["webpackHot"]) {', '	import.meta["webpackHot"].decline();', '}', 'const base = import.meta.url;'].join('\n');
		// Before: compiling as a classic script must fail — this is the exact
		// failure mode the transform exists to prevent.
		expect(() => new vm.Script(input)).toThrow(/import\.meta/);
		const out = neutralizeWorkerImportMeta(input);
		expect(() => new vm.Script(out!.code)).not.toThrow();
	});
});
