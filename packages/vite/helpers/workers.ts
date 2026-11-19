import path from 'path';
import type { Plugin } from 'vite';
import { nsConfigToJson, resolveNativeScriptPlatformModule } from './utils.js';
import { createTsConfigPathsResolver, getTsConfigData } from './ts-config-paths.js';
import { packagePlatformResolverPlugin } from './package-platform-aliases.js';
import { nativescriptPackageResolver } from './nativescript-package-resolver.js';
import { normalizeModuleId } from './normalize-id.js';
import { sbgClassNamesPlugin } from './sbg-class-names.js';
import { nativescriptBuiltinModules } from './builtin-modules.js';
import { NS_DEV_EXPR } from '../hmr/shared/runtime/dev-globals.js';

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
		nativescriptBuiltinModules(),
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

					const platformResolvedFile = resolveNativeScriptPlatformModule(resolvedPath, ['.js', '.mjs', '.ts'], platform);
					if (platformResolvedFile) {
						// Canonicalize so the worker bundle dedupes core the same way
						// the main bundle does (forward slash + uppercase Windows drive).
						return normalizeModuleId(platformResolvedFile);
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
	if (platform === 'android') {
		plugins.push(sbgClassNamesPlugin());
	}

	return plugins;
}

// In dev/HMR mode, Vite's `workerImportMetaUrlPlugin` rewrites
// `new Worker(new URL('./foo.worker', import.meta.url))` into
// `new Worker(new URL(/* @vite-ignore */"/src/.../foo.worker.ts?worker_file&type=classic", '' + import.meta.url))`.
// That output breaks under NativeScript for two independent reasons:
//
//   1. Some device runtimes have reported an HTTP-served module's
//      `import.meta.url` as `file://http://…`, a malformed base for
//      `new URL(spec, '' + import.meta.url)`, and the worker creation site
//      has no try/catch.
//   2. Vite serves a `?worker_file&type=classic` module with an
//      `importScripts('/@vite/env')` prelude, a browser classic-worker API.
//      The file's plain Vite URL serves it as an ordinary module.
//
// The rewrite prefixes the dev globals' `httpOrigin` (set by
// `hmr/shared/runtime/session-bootstrap.ts`) so non-localhost origins work. Production counterpart: `workerUrlPlugin()`.

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

/**
 * The plain Vite URL (root-relative, or `/@fs/…` outside the root, extension
 * kept) of a worker asset path Vite emitted with a `worker_file` query, or
 * `null` for any other URL.
 */
export function viteWorkerAssetPathToViteUrl(assetPath: string): string | null {
	if (typeof assetPath !== 'string' || !assetPath) {
		return null;
	}
	const queryIdx = assetPath.indexOf('?');
	const cleanPath = queryIdx === -1 ? assetPath : assetPath.slice(0, queryIdx);
	const query = queryIdx === -1 ? '' : assetPath.slice(queryIdx);

	// Leaves non-worker URLs (e.g. asset URLs from `assetImportMetaUrlPlugin`) alone.
	if (!/[?&]worker_file(?:&|=|$)/.test(query)) {
		return null;
	}
	return cleanPath.startsWith('/') ? cleanPath : null;
}

// Runtime helper injected (only) into HMR-transformed modules that
// instantiate a Worker. Wraps each `new Worker(...)` in
// `__nsHmrTrackWorker(...)`, registering a per-module
// `import.meta.hot.dispose(cb)` (Vite spec): when the module is replaced,
// the disposer terminates exactly the workers this module spawned.
//
// Session-wide cleanup for spawns that re-run WITHOUT their module being
// replaced (e.g. an Angular reboot re-running `AppComponent`'s constructor)
// is NOT this helper's job: the dev session's global `Worker` constructor
// interception (`hmr/shared/runtime/worker-tracking.ts`) records every
// construction — including these wrapped ones — in
// `globalThis.__NS_HMR_WORKERS__`, and the HMR client sweeps that set
// before framework reboots.
//
// `terminate()` is the only cleanup primitive (guarded by try/catch so an
// already-dead worker can't break the HMR cycle); both paths are idempotent.
// A `terminated` event listener would be cleaner than a Set of references,
// but iOS Worker doesn't fire that event reliably.
const HMR_WORKER_DISPOSE_HELPER = [
	'/* Injected by @nativescript/vite workerHmrUrlPlugin (HMR worker auto-dispose) */',
	'const __nsHmrTrackWorker = /* @__PURE__ */ (function () {',
	// Per-module Set so `import.meta.hot.dispose` only terminates workers
	// SPAWNED BY THIS MODULE (Vite spec semantics).
	'\tconst __nsModuleWorkers = new Set();',
	'\tlet __nsDisposeRegistered = false;',
	'\treturn function __nsHmrTrackWorker(w) {',
	'\t\tif (!w) return w;',
	// Dispose callbacks are consumed when they fire (drained per HMR cycle),
	// so the disposer re-arms itself by resetting `__nsDisposeRegistered` —
	// exactly one registration per cycle, not per spawn.
	'\t\t__nsModuleWorkers.add(w);',
	'\t\tif (!__nsDisposeRegistered && typeof import.meta !== "undefined" && import.meta && import.meta.hot && typeof import.meta.hot.dispose === "function") {',
	'\t\t\t__nsDisposeRegistered = true;',
	'\t\t\timport.meta.hot.dispose(function () {',
	'\t\t\t\tfor (const __nsW of __nsModuleWorkers) {',
	'\t\t\t\t\ttry { typeof __nsW.terminate === "function" && __nsW.terminate(); } catch (_e) {}',
	'\t\t\t\t}',
	'\t\t\t\t__nsModuleWorkers.clear();',
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

	return {
		name: 'nativescript-worker-hmr-url-transform',
		// Run AFTER Vite's built-in `workerImportMetaUrlPlugin` (and AFTER
		// the Angular plugin, which discards upstream `code` by re-compiling
		// from disk), so the dev shape above is what this sees.
		enforce: 'post',
		// Dev/HMR only — `workerUrlPlugin()` below handles the production build.
		apply: 'serve',

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
				const viteUrl = viteWorkerAssetPathToViteUrl(assetPath);
				if (!viteUrl) {
					if (verbose) {
						// eslint-disable-next-line no-console
						console.warn(`[ns-worker-hmr] worker asset path ${JSON.stringify(assetPath)} in ${cleanId} has no Vite URL; leaving Vite's default behavior in place`);
					}
					return match;
				}

				modified = true;
				workerWraps++;
				const optionsTail = options ? options : '';
				// `__nsHmrTrackWorker` registers the worker for HMR cleanup and
				// returns the instance unchanged, so the wrap is transparent.
				return `__nsHmrTrackWorker(new Worker((${NS_DEV_EXPR}.httpOrigin || "").replace(/\\/+$/, "") + ${JSON.stringify(viteUrl)}${optionsTail}))`;
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
				console.log(`[ns-worker-hmr] rewrote ${workerWraps} Vite worker URL${workerWraps === 1 ? '' : 's'} → plain Vite URL in ${cleanId} (with per-module HMR auto-dispose)`);
			}

			// Returning null for the source map keeps Vite's downstream sourcemap
			// composition simple; the per-Worker line shift is small and the
			// frame is rarely the one a developer is debugging.
			return { code: newCode, map: null };
		},
	};
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
