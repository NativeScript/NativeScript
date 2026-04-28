import path from 'path';
import type { Plugin } from 'vite';
import { nsConfigToJson, resolveNativeScriptPlatformFile } from './utils.js';
import { createTsConfigPathsResolver, getTsConfigData } from './ts-config-paths.js';
import { packagePlatformResolverPlugin } from './package-platform-aliases.js';
import { nativescriptPackageResolver } from './nativescript-package-resolver.js';
import { findMonorepoWorkspaceRoot, getProjectRootPath } from './project.js';

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
							return platformResolvedFile;
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
				// Replace import.meta.dirname with a static value for workers
				if (code.includes('import.meta.dirname')) {
					code = code.replace(/import\.meta\.dirname/g, '""');
				}
				// Replace import.meta.url with a static value for workers
				if (code.includes('import.meta.url')) {
					code = code.replace(/import\.meta\.url/g, '"file:///app/"');
				}
				return code;
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
//   2. Pipeline routing mismatch (Class E in HMR_TRANSFORM_PIPELINE_REVIEW.md).
//      Even with a valid `import.meta.url`, the resolved URL points at Vite's
//      `?worker_file&type=classic` middleware, which serves a self-contained
//      worker bundle whose internal imports use `/src/...` and `/@fs/...` URLs
//      that bypass our `/ns/m/` wrapping pipeline. The worker would crash on
//      its first transitive import.
//
// We can't intercept BEFORE Vite's worker plugin under Angular projects: the
// `@analogjs/vite-plugin-angular` plugin compiles each TS file from disk via
// its own `fileEmitter(id)`, ignoring whatever `code` the upstream pipeline
// passed in. So a `pre`-enforce rewrite of the user's source is silently
// reverted by the time Vite's worker plugin runs. Instead, we register as
// `enforce: 'post'`, let Vite emit its `?worker_file&type=classic` output, and
// then rewrite that emitted shape to the NS-friendly string URL form. That
// shape is stable and easy to detect with a single regex.
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
			const newCode = code.replace(WORKER_VITE_DEV_RE, (match, _quote, assetPath: string, options: string | undefined) => {
				const nsmUrl = viteWorkerAssetPathToNsMUrl(assetPath, projectRoot, workspaceRoot);
				if (!nsmUrl) {
					if (verbose) {
						// eslint-disable-next-line no-console
						console.warn(`[ns-worker-hmr] worker asset path ${JSON.stringify(assetPath)} in ${cleanId} can't be mapped to /ns/m/; leaving Vite's default behavior in place`);
					}
					return match;
				}

				modified = true;
				const optionsTail = options ? options : '';
				return `new Worker((typeof globalThis !== "undefined" && typeof globalThis.__NS_HTTP_ORIGIN__ === "string" ? globalThis.__NS_HTTP_ORIGIN__ : "") + ${JSON.stringify(nsmUrl)}${optionsTail})`;
			});

			if (!modified) {
				return null;
			}

			if (verbose) {
				// eslint-disable-next-line no-console
				console.log(`[ns-worker-hmr] rewrote Vite worker URL → /ns/m/ in ${cleanId}`);
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
