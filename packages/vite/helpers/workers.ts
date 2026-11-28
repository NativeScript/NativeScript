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
import { NS_BEFORE_RERUN_EVENT } from '../hmr/shared/protocol.js';

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

// Vite's `workerImportMetaUrlPlugin` serves `new Worker(new URL('./x', import.meta.url))`
// in dev as
//   new Worker(new URL(/* @vite-ignore */ "/src/x.ts?worker_file&type=classic", '' + import.meta.url))
// which the dev rewrite below turns into an absolute URL on the dev origin:
//   - Some device runtimes have reported an HTTP-served module's
//     `import.meta.url` as `file://http://…`, a malformed base for `new URL`.
//   - NativeScript always evaluates an HTTP worker entry as an ES module, so
//     the URL asks for `type=module`. For it Vite's worker plugin prepends
//     `import "/@vite/env"` to the entry: the worker realm has no `bundle.mjs`,
//     and that module is what installs `config.define` on its `globalThis`
//     before served core reads the defines. `type=classic` would prepend
//     `importScripts(...)`, a browser classic-worker API.
//   - The URL is a string, not an import, so the worker entry has no importer in
//     Vite's module graph. An edit to it, or to anything it imports, dead-ends
//     there and becomes a `full-reload`, i.e. an app restart: the device's HMR
//     client lives on the main realm and can't update a worker isolate.
// Production counterpart: `workerUrlPlugin()`.

// The `/* @vite-ignore */` comment and the `'' +` coercion are constants Vite
// always emits, so they are matched as fixed structure. The URL can use single,
// double or template-literal quotes.
const WORKER_VITE_DEV_RE = /new\s+Worker\s*\(\s*new\s+URL\s*\(\s*\/\*\s*@vite-ignore\s*\*\/\s*(['"`])([^'"`]+)\1\s*,\s*(?:'\s*'|"\s*"|`\s*`)\s*\+\s*import\.meta\.url\s*\)\s*(,\s*\{[^}]*\})?\s*\)/g;

const SKIP_TRANSFORM_ID_RE = /(?:^|\/)(?:node_modules|\.vite)\//;

export interface WorkerHmrUrlPluginOptions {
	verbose?: boolean;
}

/**
 * The module-worker form (`?worker_file&type=module`) of a root-relative
 * worker URL Vite emitted in dev, or `null` for any other URL.
 */
export function toModuleWorkerUrl(assetPath: string): string | null {
	if (typeof assetPath !== 'string' || !assetPath.startsWith('/')) {
		return null;
	}
	const queryIdx = assetPath.indexOf('?');
	if (queryIdx === -1) {
		return null;
	}
	const params = assetPath.slice(queryIdx + 1).split('&');
	// Leaves non-worker URLs (e.g. asset URLs from `assetImportMetaUrlPlugin`) alone.
	if (!params.includes('worker_file')) {
		return null;
	}
	const rest = params.filter((p) => p !== 'worker_file' && !p.startsWith('type='));
	return `${assetPath.slice(0, queryIdx)}?${['worker_file', 'type=module', ...rest].join('&')}`;
}

// Injected into each served module that constructs a worker. The workers belong
// to this module instance and are terminated when it is re-evaluated
// (`nativescript:beforeRerun`, which reaches every re-run module, accepted
// boundaries included) or pruned. `hot.dispose` is deliberately unused: a module
// has one dispose slot, and the module's own callback (the app entry's is the
// framework teardown) must keep it. A module's own `hot.prune` replaces this one.
const HMR_WORKER_OWNER_HELPER = ['const __nsHmrTrackWorker = (function () {', '\tconst workers = new Set();', '\tconst terminateAll = () => {', '\t\tfor (const w of workers) {', '\t\t\ttry { w.terminate(); } catch (_e) {}', '\t\t}', '\t\tworkers.clear();', '\t};', '\tif (import.meta.hot) {', `\t\timport.meta.hot.on(${JSON.stringify(NS_BEFORE_RERUN_EVENT)}, terminateAll);`, '\t\timport.meta.hot.prune(terminateAll);', '\t}', '\treturn (w) => (workers.add(w), w);', '})();', ''].join('\n');

export function workerHmrUrlPlugin(opts?: WorkerHmrUrlPluginOptions): Plugin {
	const { verbose } = opts || {};

	return {
		name: 'nativescript-worker-hmr-url-transform',
		// After Vite's `workerImportMetaUrlPlugin`, and after the Angular plugin,
		// which re-compiles from disk and discards upstream `code`.
		enforce: 'post',
		apply: 'serve',

		transform(code, id) {
			if (!code || code.indexOf('new Worker') === -1 || code.indexOf('import.meta.url') === -1) {
				return null;
			}

			const cleanId = id.split('?', 1)[0];
			if (!cleanId || SKIP_TRANSFORM_ID_RE.test(cleanId)) {
				return null;
			}

			let workerWraps = 0;
			const newCode = code.replace(WORKER_VITE_DEV_RE, (match, _quote, assetPath: string, options: string | undefined) => {
				const workerUrl = toModuleWorkerUrl(assetPath);
				if (!workerUrl) {
					if (verbose) {
						// eslint-disable-next-line no-console
						console.warn(`[ns-worker-hmr] worker URL ${JSON.stringify(assetPath)} in ${cleanId} is not a Vite worker URL; left as is`);
					}
					return match;
				}
				workerWraps++;
				return `__nsHmrTrackWorker(new Worker((${NS_DEV_EXPR}.httpOrigin || "").replace(/\\/+$/, "") + ${JSON.stringify(workerUrl)}${options ?? ''}))`;
			});

			if (!workerWraps) {
				return null;
			}

			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-worker-hmr] rewrote ${workerWraps} worker URL${workerWraps === 1 ? '' : 's'} in ${cleanId}`);
			}

			return { code: HMR_WORKER_OWNER_HELPER + newCode, map: null };
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
