import path from 'path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';
import { nsConfigToJson, resolveNativeScriptPlatformFile } from './utils.js';
import { createTsConfigPathsResolver, getTsConfigData } from './ts-config-paths.js';
import { packagePlatformResolverPlugin } from './package-platform-aliases.js';
import { nativescriptPackageResolver } from './nativescript-package-resolver.js';
import { findMonorepoWorkspaceRoot, getProjectRootPath } from './project.js';
import { normalizeModuleId } from './normalize-id.js';

const nodeRequire = createRequire(import.meta.url);

export interface WorkerPluginsOptions {
	platform: string;
	verbose?: boolean;
}

// Stub out webpack-style `nativescript-worker-loader!./worker.js` imports.
// Some packages (e.g. `nativescript-sqlite-commercial`) still ship a webpack 4
// branch like:
//   if (global.TNS_WEBPACK >= 5) { worker = new Worker("./worker.js"); }
//   else { require("nativescript-worker-loader!./worker.js"); }
// At runtime under @nativescript/vite, `global.TNS_WEBPACK` is undefined so the
// loader-prefix branch is never executed — but Rolldown still statically scans
// it and fails to resolve the webpack-only specifier. Returning a virtual stub
// module satisfies the static graph without touching runtime semantics.
const NS_WORKER_LOADER_STUB_ID = '\0ns-worker-loader-stub';
export function nativescriptWorkerLoaderStubPlugin(): Plugin {
	return {
		name: 'nativescript-worker-loader-stub',
		enforce: 'pre',
		resolveId(id) {
			if (typeof id === 'string' && id.startsWith('nativescript-worker-loader!')) {
				return NS_WORKER_LOADER_STUB_ID;
			}
			return null;
		},
		load(id) {
			if (id === NS_WORKER_LOADER_STUB_ID) {
				// The default export is a constructor — emulate `new SqliteWorker()`
				// so the legacy code path doesn't crash if it ever runs accidentally.
				return ['const message = "nativescript-worker-loader! is a webpack-only loader prefix and is not supported under Vite. Update the calling package to use `new Worker(new URL(...))` for worker entry points.";', 'function NSWorkerLoaderStub() { throw new Error(message); }', 'export default NSWorkerLoaderStub;'].join('\n');
			}
			return null;
		},
	};
}

/**
 * Rewrite every code-level `import.meta` usage in a worker module so the
 * emitted classic script can compile.
 *
 * Workers are emitted as classic scripts (the NS worker bootstrap `require()`s
 * them), where ANY code-level `import.meta` token is a compile-time
 * SyntaxError — the runtime reports "Cannot compile script" the moment the
 * worker starts, so the failure looks arbitrary per-worker. Beyond the
 * `.url`/`.dirname` static substitutions, HMR helpers pulled into worker
 * graphs (e.g. @nativescript/angular's hmr view-cache) read `import.meta.hot`
 * / `import.meta["hot"]` / `import.meta["webpackHot"]` defensively behind
 * try/catch — every remaining member access is rewritten to `(undefined)`;
 * workers never have HMR.
 *
 * Bare `import.meta` tokens (no member access) are left alone on purpose:
 * every observed occurrence lives inside string literals (e.g. acorn's parser
 * error messages when a JS parser is bundled into a worker), where they are
 * harmless and rewriting would corrupt library data.
 *
 * Returns `null` when the module contains no `import.meta` at all. None of
 * the replacements add or remove lines, so existing line-level mappings stay
 * valid — the explicit `map: null` also keeps Rolldown from flagging
 * SOURCEMAP_BROKEN on every worker chunk.
 */
export function neutralizeWorkerImportMeta(code: string): { code: string; map: null } | null {
	if (!code.includes('import.meta')) {
		return null;
	}
	const rewritten = code
		.replace(/import\.meta\.dirname/g, '""')
		.replace(/import\.meta\.url/g, '"file:///app/"')
		// import.meta["hot"], import.meta['webpackHot'], ...
		.replace(/import\.meta\s*\[\s*(['"])[^'"\]]*\1\s*\]/g, '(undefined)')
		// import.meta.hot, import.meta.env, ...
		.replace(/import\.meta\.\w+/g, '(undefined)');
	return { code: rewritten, map: null };
}

// Worker bundles run as separate Rolldown builds and do NOT inherit `config.plugins`
// at build time (see https://vite.dev/config/worker-options#worker-plugins). To match
// the main bundle's module resolution behavior, mirror the bare-specifier resolvers
// that the main config registers — most importantly the tsconfig `paths` resolver,
// without which workspace path aliases (e.g. `@scope/lib/util`) fail to resolve in
// any code reachable from a `new Worker(new URL(...))` entry point.
export function getWorkerPlugins(platformOrOpts: string | WorkerPluginsOptions) {
	const opts: WorkerPluginsOptions = typeof platformOrOpts === 'string' ? { platform: platformOrOpts } : platformOrOpts;
	const { platform, verbose } = opts;

	// Reuse the same tsconfig data the main config does. `getTsConfigData` is internally
	// memoized by config path, so this is essentially free on subsequent calls.
	const tsConfig = getTsConfigData({ platform, verbose });
	const tsConfigResolver = createTsConfigPathsResolver({
		paths: tsConfig.paths,
		baseUrl: tsConfig.baseUrl,
		platform,
		verbose,
	});

	const plugins: any[] = [
		// Handle ~/package.json virtual module for workers
		{
			name: 'worker-virtual-package-json',
			resolveId(id) {
				if (id === '~/package.json') {
					return '\0worker:nsconfig-json'; // Use a completely different virtual ID that doesn't look like JSON
				}
				return null;
			},
			load(id) {
				if (id === '\0worker:nsconfig-json') {
					const configObject = nsConfigToJson();
					// Return the NativeScript config as a JavaScript module
					return {
						code: `export default ${JSON.stringify(configObject, null, 2)};`,
						moduleType: 'js',
					};
				}
				return null;
			},
		},
		// Resolve NativeScript platform-specific files for workers
		{
			name: 'nativescript-platform-resolver-worker',
			resolveId(id, importer) {
				// Handle relative imports from node_modules (not just @nativescript/core)
				if (importer) {
					const resolvedPath = path.resolve(path.dirname(importer), id);

					// Try different extensions with platform-specific resolution
					const extensions = ['.js', '.mjs', '.ts'];

					for (const ext of extensions) {
						const testPath = resolvedPath + ext;
						// Use the existing NativeScript platform file resolver
						const platformResolvedFile = resolveNativeScriptPlatformFile(testPath, platform);
						if (platformResolvedFile) {
							// Canonicalize so the worker bundle dedupes core the same way
							// the main bundle does (forward slash + uppercase Windows drive).
							return normalizeModuleId(platformResolvedFile);
						}
					}

					return null;
				}
				return null;
			},
		},
		// Handle import.meta expressions in workers
		{
			name: 'worker-import-meta-handler',
			transform(code, id) {
				return neutralizeWorkerImportMeta(code);
			},
		},
	];

	// Mirror the main-config bare-specifier resolvers for workers. Without these,
	// workspace tsconfig paths and platform-specific package mains fail to resolve
	// when code is pulled into a worker bundle.
	if (tsConfigResolver) {
		plugins.push(tsConfigResolver);
	}
	plugins.push(packagePlatformResolverPlugin({ tsConfig, platform, verbose }));
	plugins.push(nativescriptPackageResolver(platform));
	plugins.push(nativescriptWorkerLoaderStubPlugin());

	return plugins;
}

// In Vite dev/HMR mode, Vite's built-in `workerImportMetaUrlPlugin` rewrites
// `new Worker(new URL('./foo.worker', import.meta.url))` into
// `new Worker(new URL(/* @vite-ignore */"/src/.../foo.worker.ts?worker_file&type=classic", '' + import.meta.url))`.
// That output breaks under NativeScript for two independent reasons:
//
//   1. TypeError on `new URL(spec, '' + import.meta.url)`. The iOS V8 runtime's
//      `InitializeImportMetaObject` callback (in NativeScript/runtime/Runtime.mm)
//      blindly prefixes the module's registry key with `file://`. For HTTP-served
//      HMR modules the key is already `http://localhost:5173/ns/m/...`, so the
//      callback emits `import.meta.url = "file://http://localhost:5173/ns/m/..."`
//      — a malformed URL that fails the WHATWG URL parser's base check. Other
//      `new URL(spec, import.meta.url)` sites in the served pipeline are wrapped
//      in `try/catch` and silently fall through; the worker creation site is not.
//
//   2. Pipeline routing mismatch.
//      Even with a valid `import.meta.url`, the resolved URL points at Vite's
//      `?worker_file&type=classic` middleware, which serves a self-contained
//      worker bundle whose internal imports use `/src/...` and `/@fs/...` URLs
//      that bypass our `/ns/m/` wrapping pipeline. The worker would crash on
//      its first transitive import.
//
// We use `__NS_HTTP_ORIGIN__` (set by the entry runtime in
// `hmr/entry-runtime.ts`) so the URL stays correct when the device connects
// via a non-localhost origin (e.g. `http://192.168.x.x:5173`).
//
// Counterpart for production builds: `workerUrlPlugin()` below, which runs in
// `generateBundle` and rewrites a similar pattern to `new Worker('~/' + ...)`.

// Matches Vite-emitted dev shape:
//   new Worker(new URL(/* @vite-ignore */ "/src/.../foo.worker.ts?worker_file&type=classic", '' + import.meta.url))
// The `/* @vite-ignore */` and `'' +` coercion are constants Vite always emits
// (see `workerImportMetaUrlPlugin` in vite/dist/node/chunks/node.js), so we
// match them as fixed structure rather than as optional fragments. The asset
// path can use single, double, or template-literal quotes.
const WORKER_VITE_DEV_RE = /new\s+Worker\s*\(\s*new\s+URL\s*\(\s*\/\*\s*@vite-ignore\s*\*\/\s*(['"`])([^'"`]+)\1\s*,\s*(?:'\s*'|"\s*"|`\s*`)\s*\+\s*import\.meta\.url\s*\)\s*(,\s*\{[^}]*\})?\s*\)/g;

const SKIP_TRANSFORM_ID_RE = /(?:^|\/)(?:node_modules|\.vite)\//;

export interface WorkerHmrUrlPluginOptions {
	verbose?: boolean;
}

// Strip Vite's `?worker_file&type=classic` query suffix (and any extension) so
// the resulting URL matches the canonical `/ns/m/<rel-without-ext>` shape that
// the NS HMR pipeline serves. Exported for unit testing.
export function viteWorkerAssetPathToNsMUrl(assetPath: string, projectRoot: string, workspaceRoot: string | null): string | null {
	if (typeof assetPath !== 'string' || !assetPath) {
		return null;
	}
	// Vite emits asset paths in two shapes during dev/HMR:
	//   1. Project-relative: "/src/.../foo.worker.ts?worker_file&type=classic"
	//   2. Absolute fs:      "/@fs/Users/.../src/.../foo.worker.ts?worker_file&type=classic"
	// We only need to match #1 here — the project-relative form Vite uses for
	// project-local files. Absolute-fs paths come from outside the project root
	// (e.g. workspace libs in a monorepo), and we hand those off to Vite's
	// default behavior rather than try to map them into `/ns/m/`.
	const queryIdx = assetPath.indexOf('?');
	const cleanPath = queryIdx === -1 ? assetPath : assetPath.slice(0, queryIdx);
	const query = queryIdx === -1 ? '' : assetPath.slice(queryIdx);

	// Confirm this is the worker_file query Vite emits — leaves non-worker URLs
	// (e.g. asset URLs from `assetImportMetaUrlPlugin`) alone.
	if (!/[?&]worker_file(?:&|=|$)/.test(query)) {
		return null;
	}

	// Project-relative: "/src/..." → "/ns/m/src/..."
	if (cleanPath.startsWith('/') && !cleanPath.startsWith('/@fs/')) {
		// Strip the rewritable extension so the URL matches the canonical
		// `/ns/m/<rel-without-ext>` shape served by the HMR middleware.
		const noExt = cleanPath.replace(/\.(?:ts|tsx|mjs|cjs|js|jsx)$/, '');
		return `/ns/m${noExt}`;
	}

	// Absolute-fs: "/@fs/abs/path/..." — try to map into project or workspace roots.
	if (cleanPath.startsWith('/@fs/')) {
		const absPath = cleanPath.slice('/@fs'.length); // keep leading '/'
		const toPosix = (value: string) => value.replace(/\\/g, '/');
		const stripTrailing = (value: string) => value.replace(/\/+$/, '');
		const target = toPosix(absPath);
		const projectPosix = stripTrailing(toPosix(path.resolve(projectRoot)));
		const workspacePosix = workspaceRoot ? stripTrailing(toPosix(path.resolve(workspaceRoot))) : null;

		const tryRoot = (root: string | null): string | null => {
			if (!root) return null;
			if (target === root) return '/ns/m';
			if (target.startsWith(`${root}/`)) {
				const rel = target.slice(root.length); // includes leading '/'
				const noExt = rel.replace(/\.(?:ts|tsx|mjs|cjs|js|jsx)$/, '');
				return `/ns/m${noExt}`;
			}
			return null;
		};
		return tryRoot(projectPosix) ?? tryRoot(workspacePosix);
	}

	return null;
}

// Runtime helper injected at the top of every HMR-transformed module that
// instantiates a Worker. Wraps each `new Worker(...)` call in
// `__nsHmrTrackWorker(...)`, which registers the worker for cleanup via
// TWO complementary mechanisms:
//
//   1. STANDARDS-COMPLIANT — `import.meta.hot.dispose(cb)` per Vite spec.
//      The JS hot registry (`hmr/client/hot-context.ts`) records the
//      callback per-module; the Angular HMR client drains the registry
//      before reboot. This is the same primitive every Vite plugin
//      author already knows; users can register their own dispose
//      callbacks the same way.
//
//   2. RUNTIME-AUTHORITATIVE — `globalThis.__NS_HMR_WORKERS__` Set
//      drained by the HMR client (or by the runtime's
//      `__NS_DEV__.terminateAllWorkers()`). This catches workers spawned in
//      modules that aren't being individually re-evaluated (e.g. the
//      `app.component.ts` constructor that re-runs on every Angular
//      reboot, even though `app.component.ts` itself isn't being
//      replaced — its `dispose` callbacks don't fire per Vite spec).
//
// ## Why both?
//
// `import.meta.hot.dispose()` is correct for modules being replaced.
// But Angular HMR's `__reboot_ng_modules__` re-creates the component
// tree without re-evaluating modules — `app.component.ts`'s top-level
// dispose callback wouldn't fire on a `login.component.html` save,
// even though Angular re-runs `AppComponent`'s constructor and spawns
// a fresh worker. The runtime-authoritative path catches this:
// `__NS_DEV__.terminateAllWorkers()` walks `Caches::Workers` (the iOS
// runtime's authoritative worker registry) and kills every live
// worker regardless of which module spawned it.
//
// ## Design notes
//
//   * Helper injected ONLY in modules that have at least one
//     `new Worker(new URL(...))` call we rewrote. Modules without
//     workers pay no prelude cost.
//   * `terminate()` is the only cleanup primitive. Apps needing
//     graceful shutdown should send a custom message before HMR via
//     their own pre-update hook (e.g.
//     `import.meta.hot.on('vite:beforeUpdate', ...)`).
//   * `try/catch` around `terminate()` so an already-dead worker
//     doesn't break the HMR cycle (e.g. user code already terminated
//     it).
//   * Both mechanisms are best-effort and idempotent: terminating an
//     already-dead worker is a no-op, and clearing an already-empty
//     Set is a no-op. Belt-and-suspenders is the right policy here.
//   * `addEventListener('terminated', ...)` would be nicer than a Set
//     of references, but iOS Worker doesn't fire that event reliably,
//     so we use the Set + opportunistic cleanup approach.
const HMR_WORKER_DISPOSE_HELPER = [
	'/* Injected by @nativescript/vite workerHmrUrlPlugin (HMR worker auto-dispose) */',
	'const __nsHmrTrackWorker = /* @__PURE__ */ (function () {',
	// Per-module Set so `import.meta.hot.dispose` only terminates
	// workers SPAWNED BY THIS MODULE — matches Vite spec semantics.
	// The shared `globalThis.__NS_HMR_WORKERS__` Set below is the
	// belt-and-suspenders fallback the runtime can also drain
	// universally on Angular reboot.
	'\tconst __nsModuleWorkers = new Set();',
	'\tlet __nsDisposeRegistered = false;',
	'\treturn function __nsHmrTrackWorker(w) {',
	'\t\tif (!w) return w;',
	// Path 1: register in the legacy global Set. Kept for backward
	// compatibility with older NS runtimes that don't yet ship
	// `__NS_DEV__.terminateAllWorkers()`. Once that runtime API is universally
	// adopted this can be removed — everything else here is
	// standards-compliant.
	'\t\ttry {',
	'\t\t\tconst __nsG = typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : {});',
	'\t\t\tif (!__nsG.__NS_HMR_WORKERS__) __nsG.__NS_HMR_WORKERS__ = new Set();',
	'\t\t\t__nsG.__NS_HMR_WORKERS__.add(w);',
	'\t\t} catch (_e) {}',
	// Path 2: standards-compliant `import.meta.hot.dispose` registration.
	// We re-register the disposer on EVERY worker spawn rather than
	// just the first, because per Vite spec dispose callbacks are
	// consumed when they fire — the runtime drains them out of its
	// registry on each HMR cycle. The closure-level
	// `__nsDisposeRegistered` flag is reset by the disposer itself
	// after firing, so we register exactly once per HMR cycle (not
	// once per worker spawn within a cycle): the second `add()` in
	// the same cycle sees `__nsDisposeRegistered === true` and skips
	// re-registration. After the cycle completes the flag flips back
	// to false and the next worker spawn registers a fresh disposer.
	// Modules that never instantiate a worker never register a
	// disposer at all.
	'\t\t__nsModuleWorkers.add(w);',
	'\t\tif (!__nsDisposeRegistered && typeof import.meta !== "undefined" && import.meta && import.meta.hot && typeof import.meta.hot.dispose === "function") {',
	'\t\t\t__nsDisposeRegistered = true;',
	'\t\t\timport.meta.hot.dispose(function () {',
	'\t\t\t\tfor (const __nsW of __nsModuleWorkers) {',
	'\t\t\t\t\ttry { typeof __nsW.terminate === "function" && __nsW.terminate(); } catch (_e) {}',
	'\t\t\t\t}',
	'\t\t\t\t__nsModuleWorkers.clear();',
	// Re-arm so the next worker spawn (in the new module instance
	// after the HMR reboot) registers a fresh disposer for the next
	// cycle. Without this re-arm, only cycle #1 uses the dispose
	// path and cycles #2+ fall through to the worker terminator
	// fallback — observable but suboptimal (uses two log lines
	// instead of one and pays the worker terminator's iteration
	// cost unnecessarily).
	'\t\t\t\t__nsDisposeRegistered = false;',
	'\t\t\t});',
	'\t\t}',
	'\t\treturn w;',
	'\t};',
	'})();',
	'',
].join('\n');

export function workerHmrUrlPlugin(opts?: WorkerHmrUrlPluginOptions): Plugin {
	const { verbose } = opts || {};
	let projectRoot = '';
	let workspaceRoot: string | null = null;

	return {
		name: 'nativescript-worker-hmr-url-transform',
		// Run AFTER Vite's built-in `workerImportMetaUrlPlugin` (and AFTER
		// the Angular plugin, which discards upstream `code` by re-compiling
		// from disk). At this point Vite has already rewritten the user's
		// `new Worker(new URL('./foo', import.meta.url))` into its dev shape
		// `new Worker(new URL(/* @vite-ignore */"/src/.../foo.worker.ts?worker_file&type=classic", '' + import.meta.url))`.
		// We match that shape and replace it with a plain string URL that
		// routes through `/ns/m/` so the worker's internal imports get the
		// same HMR treatment as the main thread.
		enforce: 'post',
		// Dev/HMR only — `workerUrlPlugin()` below handles the production build.
		apply: 'serve',

		configResolved(config) {
			projectRoot = path.resolve(config.root || getProjectRootPath());
			workspaceRoot = findMonorepoWorkspaceRoot(projectRoot);
		},

		transform(code, id) {
			if (!code || code.indexOf('new Worker') === -1 || code.indexOf('import.meta.url') === -1) {
				return null;
			}

			// `id` may carry a Vite query suffix (`?vue&type=script`, `?used`, …);
			// strip it so path matching works against real fs paths.
			const cleanId = id.split('?', 1)[0];
			if (!cleanId || SKIP_TRANSFORM_ID_RE.test(cleanId)) {
				return null;
			}

			let modified = false;
			let workerWraps = 0;
			let newCode = code.replace(WORKER_VITE_DEV_RE, (match, _quote, assetPath: string, options: string | undefined) => {
				const nsmUrl = viteWorkerAssetPathToNsMUrl(assetPath, projectRoot, workspaceRoot);
				if (!nsmUrl) {
					if (verbose) {
						// eslint-disable-next-line no-console
						console.warn(`[ns-worker-hmr] worker asset path ${JSON.stringify(assetPath)} in ${cleanId} can't be mapped to /ns/m/; leaving Vite's default behavior in place`);
					}
					return match;
				}

				modified = true;
				workerWraps++;
				const optionsTail = options ? options : '';
				// Wrap each `new Worker(...)` in `__nsHmrTrackWorker(...)`
				// so it auto-registers for cleanup on the next HMR
				// dispose. The wrap is transparent — `__nsHmrTrackWorker`
				// returns the worker instance unchanged so callers that
				// assign the result to a variable still get a real
				// Worker.
				return `__nsHmrTrackWorker(new Worker((typeof globalThis !== "undefined" && typeof globalThis.__NS_HTTP_ORIGIN__ === "string" ? globalThis.__NS_HTTP_ORIGIN__ : "") + ${JSON.stringify(nsmUrl)}${optionsTail}))`;
			});

			if (!modified) {
				return null;
			}

			// Inject the helper prelude exactly once at the top of the
			// module. The helper closure self-tracks workers and lazily
			// registers the `import.meta.hot.dispose()` callback on the
			// first wrap, so injecting it unconditionally (whether or not
			// HMR is wired up at module-eval time) is safe.
			newCode = HMR_WORKER_DISPOSE_HELPER + newCode;

			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-worker-hmr] rewrote ${workerWraps} Vite worker URL${workerWraps === 1 ? '' : 's'} → /ns/m/ in ${cleanId} (with HMR auto-terminate via globalThis.__NS_HMR_WORKERS__)`);
			}

			// Returning null for the source map keeps Vite's downstream sourcemap
			// composition simple; the per-Worker line shift is small and the
			// frame is rarely the one a developer is debugging.
			return { code: newCode, map: null };
		},
	};
}

// Safety-net TypeScript fallback transform.
//
// Problem: In HMR mode (where `useAngularCompilationAPI = false`), the
// `@analogjs/vite-plugin-angular` `config` hook forcibly sets `oxc: false` on
// the Vite config (see `angular-vite-plugin.js`:
// `const oxc = pluginOptions.useAngularCompilationAPI ? undefined : (config.oxc ?? false);`).
// That disables Vite's built-in oxc TypeScript transformer for the whole dev
// session. The Analog plugin then expects its own `fileEmitter` to strip types
// from every `.ts` file in the project — but `fileEmitter` only knows about
// files that are part of the Angular TypeScript program (anything imported
// directly, or referenced via `templateUrl` / `styleUrls` from a decorated
// class).
//
// Worker entry files fall outside the program. They are only loaded via
// `new Worker(new URL('./foo.worker', import.meta.url))`, which is NOT an
// import — it's a URL constructor expression the device resolves at runtime.
// `fileEmitter(id)` returns nothing for those files, the Analog plugin's
// transform returns `undefined`, oxc doesn't run (because Analog disabled it),
// and the raw `.ts` source reaches the device with type annotations intact.
// V8's parser then chokes on the first `(x: Type)` parameter annotation with
// `SyntaxError: Unexpected token ':'`.
//
// The fix is a small post-enforce transform that re-runs Vite's own
// `transformWithOxc` on any `.ts`/`.tsx` file that still looks like raw
// TypeScript after the rest of the pipeline is done. For already-compiled
// Angular output (pure JS), the detection heuristic short-circuits and we
// never invoke oxc, so the fast path stays fast.
//
// Scope intentionally narrow:
//  * `enforce: 'post'` — only sees final code after every other plugin had a
//    chance to transform.
//  * `apply: 'serve'` — dev/HMR only. Production builds use Rolldown which
//    handles TS natively without needing this net.
//  * Skips `node_modules` / `.vite` — third-party code has its own pipeline,
//    and hitting every transitive dep would be wasteful.
//  * Skips files containing Angular decorators (`@Component`, `@Injectable`,
//    `@NgModule`, `@Directive`, `@Pipe`). Those files belong to the Angular
//    program; if they fell through the Angular plugin we surface Angular's
//    own `"contains Angular decorators but is not in the TypeScript program"`
//    warning rather than silently transforming them with oxc (which would
//    emit a `@oxc-project/runtime/helpers/decorate` import that the app does
//    not depend on, breaking Vite's import-analysis pass).
//  * Regex-based detection — catches the tokens V8 would actually reject.
//    False positives (running oxc on valid JS) are harmless because oxc with
//    `lang: 'ts'` is a no-op on JS; false negatives would only surface as the
//    same error the fix is designed to prevent, so the detector errs toward
//    running the transform when in doubt.

const TS_ONLY_SYNTAX_RE = new RegExp(
	[
		// `import type { … } from '…'` / `export type { … } from '…'`
		String.raw`\b(?:import|export)\s+type\s`,
		// `interface Foo { … }`
		String.raw`\binterface\s+[A-Z_$][\w$]*\s*[<{]`,
		// `type Foo = …`
		String.raw`\btype\s+[A-Z_$][\w$]*\s*[<=]`,
		// `as Type` assertions — restrict right-hand side to common primitives
		// or PascalCase identifiers to avoid catching unrelated tokens.
		String.raw`\bas\s+(?:string|number|boolean|any|unknown|never|void|[A-Z][\w$]*)\b`,
		// Parameter / destructured type annotations: `(msg: any)`, `(x: T, y: U)`.
		// Anchored to `(` or `,` so we don't match object literal keys like `{ a: 1 }`.
		String.raw`[(,]\s*[\w$]+\s*\??\s*:\s*(?:string|number|boolean|any|unknown|never|void|null|undefined|object|[A-Z][\w$]*(?:<[^>]*>)?(?:\[\])?)\b`,
		// Variable type annotations: `let x: T = …` / `const y: T`
		String.raw`\b(?:const|let|var)\s+[\w$]+\s*:\s*[\w$<>[\]|&., ]+\s*[;=]`,
		// Return type annotations on arrow functions: `): T =>`
		String.raw`\)\s*:\s*(?:string|number|boolean|any|unknown|never|void|[A-Z][\w$]*(?:<[^>]*>)?)\s*(?:=>|\{)`,
	].join('|'),
);

// Decorator shapes that mean "the Angular plugin owns this file, stay out of
// its way." We do NOT try to compile these ourselves even if the Angular
// plugin's `fileEmitter` didn't produce output for them — oxc would rewrite
// the decorators into `import _decorate from "@oxc-project/runtime/helpers/decorate"`
// calls, Vite's import-analysis would fail to resolve that helper package,
// and we'd turn a harmless "not in TypeScript program" warning into a fatal
// import error. Better to let Angular's own warning surface and leave the
// code untouched.
const ANGULAR_DECORATOR_RE = /@(?:Component|Directive|Injectable|NgModule|Pipe)\s*\(/;

const TS_FALLBACK_SKIP_ID_RE = /(?:^|\/)(?:node_modules|\.vite)\//;

export interface TsFallbackTransformPluginOptions {
	verbose?: boolean;
}

export function tsFallbackTransformPlugin(opts?: TsFallbackTransformPluginOptions): Plugin {
	const { verbose } = opts || {};
	// Cached after the first successful import so repeated transforms don't
	// pay the dynamic-import cost. `null` = not loaded yet; `false` = load
	// attempted and failed (older Vite with no oxc export — we'll skip).
	let cachedTransformWithOxc: ((code: string, id: string, options?: any) => Promise<{ code: string; map: any }>) | null | false = null;

	return {
		name: 'nativescript-ts-fallback-transform',
		enforce: 'post',
		apply: 'serve',

		async transform(code, id) {
			if (cachedTransformWithOxc === false) return null;
			const cleanId = id.split('?', 1)[0];
			if (!cleanId || !/\.(m?ts|[jt]sx)$/.test(cleanId)) return null;
			if (TS_FALLBACK_SKIP_ID_RE.test(cleanId)) return null;
			if (ANGULAR_DECORATOR_RE.test(code)) return null;
			if (!TS_ONLY_SYNTAX_RE.test(code)) return null;

			if (cachedTransformWithOxc === null) {
				try {
					// Dynamic import keeps this plugin cross-version-safe: older
					// Vite installs without `transformWithOxc` (pre-Rolldown
					// builds) cleanly disable this fallback instead of crashing.
					const vite: any = await import('vite');
					if (typeof vite.transformWithOxc === 'function') {
						cachedTransformWithOxc = vite.transformWithOxc;
					} else {
						cachedTransformWithOxc = false;
						return null;
					}
				} catch {
					cachedTransformWithOxc = false;
					return null;
				}
			}

			try {
				const lang = cleanId.endsWith('tsx') ? 'tsx' : cleanId.endsWith('jsx') ? 'jsx' : 'ts';
				const result = await (cachedTransformWithOxc as any)(code, cleanId, { lang });
				if (!result || typeof result.code !== 'string') return null;
				if (verbose) {
					// eslint-disable-next-line no-console
					console.log(`[ns-ts-fallback] type-stripped ${cleanId}`);
				}
				return { code: result.code, map: result.map ?? null };
			} catch (err) {
				if (verbose) {
					// eslint-disable-next-line no-console
					console.warn(`[ns-ts-fallback] transformWithOxc failed for ${cleanId}:`, err);
				}
				return null;
			}
		},
	};
}

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

export function workerUrlPlugin() {
	return {
		name: 'nativescript-worker-url-transform',
		generateBundle(options, bundle) {
			// Transform the main bundle to use NativeScript worker paths
			for (const [fileName, chunk] of Object.entries(bundle) as any) {
				if (chunk.type === 'chunk' && !fileName.includes('.worker')) {
					// Transform Vite's worker URL pattern to NativeScript's expected format
					// From: new Worker(new URL(/* @vite-ignore */ "/assets/sample.worker-C6wW8q2-.js", import.meta.url))
					// To: new Worker('~/' + 'assets/sample.worker-C6wW8q2-.js')
					//
					// Rolldown (Vite's underlying bundler) emits the asset path as a
					// template-literal (backticks) and prefixes the second URL arg
					// with `\`\` +` to coerce it to a string, e.g.:
					//   new Worker(new URL(`/assets/foo.js`, `` + import.meta.url))
					// The regex below accepts either single quotes, double quotes,
					// or backticks for the asset path, and an optional
					// `<emptyString> +` coercion prefix before `import.meta.url`. At
					// NS runtime there's no `import.meta.url` in the main bundle and
					// `new URL("/assets/...", ...)` would resolve to a `file:///...`
					// URL that NS Worker can't load, so this rewrite is the last
					// step that makes worker chunks actually loadable.
					const workerUrlRegex = /new\s+Worker\s*\(\s*new\s+URL\s*\(\s*(?:\/\*[^*]*\*\/\s*)?[`"']([^`"']+)[`"']\s*,\s*(?:[`"'][^`"']*[`"']\s*\+\s*)?import\.meta\.url\s*\)\s*\)/g;

					if (workerUrlRegex.test(chunk.code)) {
						chunk.code = chunk.code.replace(workerUrlRegex, (match, assetPath) => {
							// Use the full asset path including assets/ folder
							const fullPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
							return `new Worker('~/' + '${fullPath}')`;
						});
					}
				}
			}
		},
	};
}
