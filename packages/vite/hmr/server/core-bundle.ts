/**
 * Single-eval @nativescript/core bundle for device serving (bundle mode).
 *
 * DEFAULT MODE (consumers)
 * ------------------------
 * Instead of serving @nativescript/core per-module through Vite's transform
 * pipeline (~hundreds of serial HTTP fetches + per-file transforms during cold
 * boot), the dev server pre-bundles the ENTIRE core package with esbuild into
 * one ESM payload served at `GET /ns/core-bundle.mjs`. The canonical
 * `/ns/core[/<sub>]` URL space is preserved — those routes serve THIN SHIMS
 * that statically import the bundle and re-export the requested subpath's
 * namespace from the `globalThis.__NS_CORE_MODULES__` registry the bundle
 * populates. Because every shim's only dependency is the one bundle URL,
 * V8/iOS evaluates core exactly once per app lifetime — the single-realm
 * invariant is enforced by construction, with ONE big prefetchable payload
 * instead of a deep serial fetch chain.
 *
 * OPT-IN PER-MODULE MODE (core maintainers)
 * -----------------------------------------
 * Set `NS_CORE_PER_MODULE=1` to keep the classic per-module `/ns/core` bridge
 * (websocket-ns-core.ts). That is the right mode when editing
 * `@nativescript/core` source live inside the NativeScript monorepo: each core
 * module stays individually served/transformed so core edits participate in
 * HMR. Consumers of the published package don't edit core mid-session, so the
 * bundle is both safe and much faster for them.
 *
 * FAILURE FALLBACK
 * ----------------
 * If the esbuild bundle build fails for any reason, the service marks itself
 * failed and `/ns/core[/<sub>]` transparently falls back to the per-module
 * bridge for the whole session (logged loudly once). Boot still works; only
 * the speed win is lost.
 */

import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync, type Dirent } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as esbuild from 'esbuild';
import type { ViteDevServer } from 'vite';

import { getCliFlags } from '../../helpers/cli-flags.js';
import { getGlobalDefines } from '../../helpers/global-defines.js';
import { getProjectFlavor } from '../../helpers/flavor.js';
import { createNativeClassEsbuildPlugin } from '../../helpers/nativeclass-esbuild-plugin.js';
import type { Platform } from '../../helpers/platform-types.js';
import { createUnicodeRegexEsbuildPlugin } from '../shared/vendor/vendor-esbuild-plugins.js';
import { moduleRegistrationKeys, normalizeCoreSub } from '../../helpers/ns-core-url.js';
import { buildShapeInstallHeader } from './ns-core-cjs-shape.js';
import { resolveVerboseFlag } from '../../helpers/logging.js';
import { nsConfigToJson } from '../../helpers/utils.js';
import { aliasCssTree } from '../../helpers/css-tree.js';
import { getWorkspaceCoreSourceRoot } from './websocket-served-module-helpers.js';

/**
 * Per-module /ns/core serving mode (vs the default single-eval bundle).
 *
 * `NS_CORE_PER_MODULE=1|true` forces it on, `0|false` forces bundle mode.
 * When unset, it AUTO-ENABLES for monorepo core source (packages/core in the
 * NativeScript repo). Two reasons:
 *   - core maintainers edit core live, and per-module serving keeps those
 *     edits in HMR;
 *   - realm safety: the build-time externalizer emits
 *     `/ns/m/packages/core/<file>` URLs for workspace-source core (see the
 *     `ns-core-external-urls` workspace branch in configuration/base.ts), so
 *     the served graph's core realm lives under /ns/m. A bundle-mode
 *     `/ns/core-bundle.mjs` would evaluate a complete SECOND copy of core for
 *     the entry's `/ns/core/globals|application|…` imports — duplicate native
 *     class registrations crash in MetadataBuilder at startup.
 */
export function isCorePerModuleServingEnabled(env: NodeJS.ProcessEnv = process.env, hasWorkspaceCoreSource: () => boolean = () => getWorkspaceCoreSourceRoot() !== null): boolean {
	const v = env.NS_CORE_PER_MODULE;
	if (v === '1' || v === 'true') return true;
	if (v === '0' || v === 'false') return false;
	try {
		return hasWorkspaceCoreSource();
	} catch {
		return false;
	}
}

export interface CoreBundleState {
	/** Full ESM payload served at /ns/core-bundle.mjs (shape header + esbuild output). */
	code: string;
	/** Canonical subpaths registered in the bundle's __NS_CORE_MODULES__ registry. */
	subs: Set<string>;
	hash: string;
	builtAt: number;
	buildMs: number;
}

export interface CoreBundleService {
	/** Resolves the built bundle, or null when the build failed (per-module fallback). */
	ensureBuilt(): Promise<CoreBundleState | null>;
	/** Synchronous view — null until built (or when failed). */
	getState(): CoreBundleState | null;
	hasFailed(): boolean;
}

export interface GenerateCoreBundleOptions {
	projectRoot: string;
	platform: Platform | string;
	mode: 'development' | 'production' | string;
	flavor?: string;
	verbose?: boolean;
}

/**
 * Resolve the physical @nativescript/core root the same way configuration/
 * base.ts does: prefer monorepo source (`<workspace>/packages/core`), else the
 * node_modules install reachable from the project root.
 */
export function resolveCoreRootForBundle(projectRoot: string): string {
	const workspaceCorePkg = path.resolve(projectRoot, '../../packages/core/package.json');
	if (existsSync(workspaceCorePkg)) {
		return path.dirname(workspaceCorePkg);
	}
	const req = createRequire(path.join(projectRoot, 'package.json'));
	const corePkg = req.resolve('@nativescript/core/package.json');
	return path.dirname(corePkg);
}

// Directories that are not runtime module space. `debugger/` and
// `inspector_modules` only evaluate when a Web Inspector session loads them
// (via the app bundle, not HTTP) and carry heavyweight side effects (network
// interception) that must NOT run on every boot, so they stay out of the
// bundle. A request for an excluded subpath falls back to per-module serving —
// realm-safe, because the per-module response's own core imports are rewritten
// back to `/ns/core/<sub>` shim URLs that resolve into the bundle realm.
const EXCLUDED_DIRS = new Set(['node_modules', 'platforms', 'cli-hooks', 'debugger', '.git', '__tests__', 'fixtures']);
const EXCLUDED_TOP_LEVEL_MODULES = new Set(['inspector_modules', 'bundle-entry-points', 'references', 'global-types', 'vite.config', 'vitest.setup']);

/**
 * True when a canonical core subpath was DELIBERATELY excluded from bundle
 * enumeration (debugger/, inspector_modules, bundle-entry-points, …). Requests
 * for these at boot are normal — the runtime's inspector/debugger plumbing
 * imports them in dev — and the per-module fallback that serves them is
 * by-design and realm-safe. Callers use this to keep the fallback log
 * verbose-only for expected subs while still surfacing unexpected
 * enumeration misses.
 */
export function isExpectedCoreBundleExclusion(canonicalSub: string): boolean {
	if (!canonicalSub) return false;
	return canonicalSub.split('/').some((seg) => EXCLUDED_TOP_LEVEL_MODULES.has(seg) || EXCLUDED_DIRS.has(seg));
}

const MODULE_FILE_RE = /\.(?:ts|tsx|js|mjs)$/;
const NON_MODULE_FILE_RE = /\.(?:d\.ts|spec\.(?:ts|js|tsx)|test\.(?:ts|js|tsx))$/;

function platformSuffixOf(baseName: string): 'ios' | 'android' | 'visionos' | null {
	const m = baseName.match(/\.(ios|android|visionos)$/);
	return (m?.[1] as any) || null;
}

/**
 * Enumerate every importable core subpath (canonical form, per
 * `normalizeCoreSub`) for the given platform. A subpath is included when it
 * has a platform-neutral variant OR a variant for the current platform —
 * other-platform-only modules (e.g. `ui/frame/activity.android` on iOS) are
 * skipped since they can never resolve for this build.
 */
export function enumerateCoreModuleSubpaths(coreRoot: string, platform: string): string[] {
	const isApple = platform !== 'android';
	// canonical sub → has a variant loadable on this platform
	const loadable = new Map<string, boolean>();

	const visit = (dirAbs: string, relPrefix: string) => {
		let entries: Dirent[];
		try {
			entries = readdirSync(dirAbs, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const name = entry.name;
			if (name.startsWith('.')) continue;
			const rel = relPrefix ? `${relPrefix}/${name}` : name;
			let isDir = entry.isDirectory();
			if (entry.isSymbolicLink()) {
				try {
					isDir = statSync(path.join(dirAbs, name)).isDirectory();
				} catch {
					continue;
				}
			}
			if (isDir) {
				if (EXCLUDED_DIRS.has(name)) continue;
				visit(path.join(dirAbs, name), rel);
				continue;
			}
			if (!MODULE_FILE_RE.test(name) || NON_MODULE_FILE_RE.test(name)) continue;
			const relNoExt = rel.replace(MODULE_FILE_RE, '');
			const suffix = platformSuffixOf(relNoExt);
			const platformOk = suffix === null || (isApple ? suffix !== 'android' : suffix === 'android');
			const canonical = normalizeCoreSub(relNoExt);
			// '' is the package main — always included, not part of the sub list.
			if (!canonical) continue;
			if (!relPrefix && EXCLUDED_TOP_LEVEL_MODULES.has(canonical)) continue;
			if (canonical.split('/').some((seg) => EXCLUDED_TOP_LEVEL_MODULES.has(seg) || EXCLUDED_DIRS.has(seg))) continue;
			// Cross-platform helper modules without a platform suffix in their
			// own filename (e.g. `ui/frame/frame-helper-for-android`) import
			// siblings that only exist with the OTHER platform's suffix, so
			// force-importing them on this platform can never resolve. They are
			// only reachable from that platform's `index.<platform>` graph.
			if (/-for-android$/.test(canonical) && isApple) continue;
			if (/-for-(?:ios|visionos)$/.test(canonical) && !isApple) continue;
			loadable.set(canonical, loadable.get(canonical) || false || platformOk);
		}
	};
	visit(coreRoot, '');

	return Array.from(loadable.entries())
		.filter(([, ok]) => ok)
		.map(([sub]) => sub)
		.sort();
}

/**
 * Synthetic esbuild entry: evaluate core once, expose every subpath's live
 * namespace through `globalThis.__NS_CORE_MODULES__` (the SAME registry the
 * per-module bridge footers populate, so the vendor CJS `require()` shim and
 * `_nsReq` lookups keep working unchanged), and re-export the package main so
 * `/ns/core-bundle.mjs` itself has core's full named-export surface.
 */
export function buildCoreBundleEntryCode(subs: readonly string[]): string {
	const lines: string[] = [];
	// Package main first so its side-effect order (globals, bootstrap) matches
	// the package's own intent; esbuild still evaluates shared deps once.
	lines.push(`import * as __ns_core_main__ from ${JSON.stringify('@nativescript/core')};`);
	subs.forEach((sub, i) => {
		lines.push(`import * as __ns_core_m_${i}__ from ${JSON.stringify(`@nativescript/core/${sub}`)};`);
	});
	lines.push('');
	lines.push('const __nsReg = (globalThis.__NS_CORE_MODULES__ || (globalThis.__NS_CORE_MODULES__ = Object.create(null)));');
	lines.push(`const __nsShapeFn = typeof globalThis.__NS_CJS_SHAPE__ === 'function' ? globalThis.__NS_CJS_SHAPE__ : function (x) { return x; };`);
	lines.push('const __nsRegSet = (keys, ns) => { const shaped = __nsShapeFn(ns); for (const k of keys) { __nsReg[k] = shaped; } };');
	lines.push(`__nsRegSet(${JSON.stringify(moduleRegistrationKeys(''))}, __ns_core_main__);`);
	subs.forEach((sub, i) => {
		lines.push(`__nsRegSet(${JSON.stringify(moduleRegistrationKeys(sub))}, __ns_core_m_${i}__);`);
	});
	lines.push(`try { globalThis.__NS_CORE_EVAL_COUNT__ = (globalThis.__NS_CORE_EVAL_COUNT__ || 0) + 1; globalThis.__NS_CORE_BUNDLE_MODE__ = true; } catch (e) {}`);
	lines.push(`export * from ${JSON.stringify('@nativescript/core')};`);
	lines.push('');
	return lines.join('\n');
}

// Platform-first extension order, mirroring Vite's `platformExtensions` in
// configuration/base.ts so the bundle resolves the same physical files the
// per-module bridge would (platform variant preferred over the bare one).
function coreResolveExtensions(platform: string): string[] {
	if (platform === 'android') {
		return ['.android.tsx', '.tsx', '.android.jsx', '.jsx', '.android.ts', '.ts', '.android.js', '.js', '.mjs', '.cjs', '.json'];
	}
	return ['.ios.tsx', '.visionos.tsx', '.tsx', '.ios.jsx', '.visionos.jsx', '.jsx', '.ios.ts', '.visionos.ts', '.ts', '.ios.js', '.visionos.js', '.js', '.mjs', '.cjs', '.json'];
}

// Node built-ins the device runtime cannot resolve — externalized exactly like
// the vendor bundle build (see manifest.ts).
const NODE_BUILTINS = ['assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain', 'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'stream/web', 'stream/promises', 'string_decoder', 'sys', 'timers', 'timers/promises', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'];
const NODE_EXTERNALS = [...NODE_BUILTINS, ...NODE_BUILTINS.map((b) => `node:${b}`)];

export async function generateCoreBundle(options: GenerateCoreBundleOptions): Promise<CoreBundleState> {
	const { projectRoot, platform, mode, flavor, verbose } = options;
	const t0 = Date.now();
	const coreRoot = resolveCoreRootForBundle(projectRoot);
	const subs = enumerateCoreModuleSubpaths(coreRoot, String(platform));
	const entryCode = buildCoreBundleEntryCode(subs);

	// Resolve bare @nativescript/core[/sub] specifiers against the resolved
	// core root directly. esbuild's default node-resolution can't be trusted
	// here for two reasons: (1) monorepo apps consume core via a symlink whose
	// realpath escapes the project's node_modules, and (2) the package's
	// `main: "index"` is extensionless. Mapping to `<coreRoot>/<sub>` and
	// letting resolveExtensions pick the platform file mirrors Vite's alias +
	// extension behavior byte-for-byte.
	const coreAliasPlugin: esbuild.Plugin = {
		name: 'ns-core-bundle-alias',
		setup(build) {
			build.onResolve({ filter: /^@nativescript\/core(?:\/.*)?$/ }, (args) => {
				const sub = args.path === '@nativescript/core' ? '' : args.path.slice('@nativescript/core/'.length);
				const target = sub ? path.join(coreRoot, sub) : path.join(coreRoot, 'index');
				return build.resolve(target, { kind: args.kind, resolveDir: coreRoot });
			});
		},
	};

	// Mirror the Vite pipeline's css-tree environment aliases: css-tree's ESM
	// files do `import { createRequire } from 'module'` to lazily require JSON
	// data — on device that bare 'module' import must resolve to our polyfill
	// (same replacement `aliasCssTree` feeds Vite's resolver; see
	// helpers/css-tree.ts and polyfills/module.ts). In the source tree the
	// replacement's `.js` file may not exist yet (only `.ts`) — fall back.
	const resolvePolyfillFile = (p: string): string => {
		if (existsSync(p)) return p;
		const ts = p.replace(/\.js$/, '.ts');
		return existsSync(ts) ? ts : p;
	};
	const polyfillAliases = new Map<string, string>();
	for (const { find, replacement } of aliasCssTree) {
		polyfillAliases.set(String(find), resolvePolyfillFile(replacement));
	}
	const cssTreeEnvPlugin: esbuild.Plugin = {
		name: 'ns-core-bundle-css-tree-env',
		setup(build) {
			build.onResolve({ filter: /^(?:node:)?module$|^mdn-data\/css\// }, (args) => {
				const key = args.path.replace(/^node:/, '');
				const target = polyfillAliases.get(key);
				return target ? { path: target } : undefined;
			});
		},
	};

	// `~/package.json` — core's profiling/style-scope modules import the APP's
	// nativescript.config as JSON through this alias (Vite serves it via the
	// nsvite:nsconfig-json virtual module; see helpers/config-as-json.ts).
	// Mirror that here with the same nsConfigToJson() payload.
	const nsConfigJson = (() => {
		try {
			return JSON.stringify(nsConfigToJson());
		} catch {
			// No nativescript.config.ts reachable (tests, bare fixtures) — the
			// importers only read optional profiling/cssParser hints from it.
			return '{}';
		}
	})();
	const nsConfigPlugin: esbuild.Plugin = {
		name: 'ns-core-bundle-nsconfig',
		setup(build) {
			build.onResolve({ filter: /^~\/package\.json$/ }, () => ({ path: 'ns-core-bundle:nsconfig-json', namespace: 'ns-core-bundle-virtual' }));
			build.onLoad({ filter: /^ns-core-bundle:nsconfig-json$/, namespace: 'ns-core-bundle-virtual' }, () => ({
				contents: `export default ${nsConfigJson};`,
				loader: 'js',
			}));
		},
	};

	const defines = (() => {
		const raw = getGlobalDefines({
			platform: String(platform),
			targetMode: mode === 'development' ? 'development' : 'production',
			verbose: !!verbose,
			flavor: flavor ?? '',
			isCI: !!process.env.CI,
		}) as Record<string, unknown>;
		const out: Record<string, string> = {};
		for (const [key, value] of Object.entries(raw)) {
			out[key] = typeof value === 'string' ? value : JSON.stringify(value);
		}
		out['process.env.NODE_ENV'] = JSON.stringify(mode === 'development' ? 'development' : 'production');
		return out;
	})();

	const buildResult = await esbuild.build({
		stdin: {
			contents: entryCode,
			resolveDir: projectRoot,
			sourcefile: 'ns-core-bundle-entry.ts',
			loader: 'ts',
		},
		platform: 'neutral',
		format: 'esm',
		bundle: true,
		target: 'es2019',
		// Keep every module body — core relies on registration side effects
		// (CssAnimationProperty.register, global.registerModule, …).
		treeShaking: false,
		sourcemap: false,
		write: false,
		logLevel: 'silent',
		legalComments: 'eof',
		conditions: ['module', 'react-native', 'import', 'browser', 'default'],
		mainFields: ['module', 'browser', 'main'],
		resolveExtensions: coreResolveExtensions(String(platform)),
		loader: {
			'.css': 'text',
			'.json': 'json',
		},
		define: defines,
		plugins: [coreAliasPlugin, cssTreeEnvPlugin, nsConfigPlugin, createNativeClassEsbuildPlugin(platform as Platform), createUnicodeRegexEsbuildPlugin(projectRoot)],
		external: NODE_EXTERNALS,
	});

	if (!buildResult.outputFiles?.length) {
		throw new Error('core bundle generation produced no output');
	}

	// The shape installer must run before the registry writes in the entry
	// body so CJS consumers looking up __NS_CORE_MODULES__ always see
	// plain-object-compatible namespaces (Invariant D).
	const code = ['/* /ns/core-bundle.mjs — single-eval @nativescript/core (dev bundle mode) */', buildShapeInstallHeader(), buildResult.outputFiles[0].text].join('\n');
	const hash = createHash('sha1').update(code).digest('hex');
	const state: CoreBundleState = {
		code,
		subs: new Set(subs),
		hash,
		builtAt: Date.now(),
		buildMs: Date.now() - t0,
	};
	if (verbose) {
		console.log(`[ns-core-bundle] built ${subs.length} subpaths, ${(code.length / 1024).toFixed(0)}kb in ${state.buildMs}ms (hash ${hash.slice(0, 8)})`);
	}
	return state;
}

export function createCoreBundleService(options: GenerateCoreBundleOptions): CoreBundleService {
	let state: CoreBundleState | null = null;
	let failed = false;
	let building: Promise<CoreBundleState | null> | null = null;

	const ensureBuilt = async (): Promise<CoreBundleState | null> => {
		if (state) return state;
		if (failed) return null;
		if (!building) {
			building = generateCoreBundle(options)
				.then((built) => {
					state = built;
					return built;
				})
				.catch((error: any) => {
					failed = true;
					console.warn(`[ns-core-bundle] bundle build FAILED — falling back to per-module /ns/core serving for this session. Set NS_CORE_PER_MODULE=1 to silence. Error: ${error?.message || error}`);
					return null;
				});
		}
		return building;
	};

	return {
		ensureBuilt,
		getState: () => state,
		hasFailed: () => failed,
	};
}

let sharedService: CoreBundleService | null = null;

/**
 * Process-wide bundle service derived from the dev server's config + CLI
 * flags. One dev server per process, so a module-level singleton matches the
 * vendor manifest's lifecycle.
 */
export function getSharedCoreBundleService(server: ViteDevServer): CoreBundleService {
	if (sharedService) return sharedService;
	const cliFlags = (getCliFlags() || {}) as any;
	const platform: string = cliFlags.android ? 'android' : cliFlags.visionos ? 'visionos' : 'ios';
	let flavor = '';
	try {
		flavor = getProjectFlavor();
	} catch {}
	sharedService = createCoreBundleService({
		projectRoot: server.config?.root || process.cwd(),
		platform,
		mode: server.config?.mode === 'development' ? 'development' : 'production',
		flavor,
		verbose: resolveVerboseFlag(),
	});
	return sharedService;
}

/** Test seam: drop the shared service so specs can mount fresh. */
export function resetSharedCoreBundleServiceForTests(): void {
	sharedService = null;
}

export const CORE_BUNDLE_PATH = '/ns/core-bundle.mjs';

/**
 * Shim served at `/ns/core` in bundle mode. `export * from` gives real,
 * live named bindings straight off the bundle module record; the explicit
 * default keeps the "default import + destructure" consumer rewrite working
 * (see buildDefaultExportFooter in ns-core-cjs-shape.ts for that contract).
 */
export function buildCoreMainShimCode(): string {
	return [`/* @nativescript/core bridge (bundle mode) — main */`, `import * as __ns_core_bundle_ns__ from ${JSON.stringify(CORE_BUNDLE_PATH)};`, `export * from ${JSON.stringify(CORE_BUNDLE_PATH)};`, `export default __ns_core_bundle_ns__;`, ``].join('\n');
}

/**
 * Shim served at `/ns/core/<sub>` in bundle mode. The static bundle import
 * guarantees the registry is populated before the body reads it (ESM deps
 * evaluate first), so the named `export const` bindings snapshot the final
 * class/function values. `exportNames` comes from the same disk-based export
 * discovery the per-module bridge relies on (collectStaticExportNamesFromFile).
 */
const RESERVED_EXPORT_NAMES = new Set(['default', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'let', 'static', 'yield', 'await', 'eval', 'arguments', '__ns_core_sub_ns__']);

export function buildCoreSubShimCode(sub: string, exportNames: readonly string[], hasOwnDefaultExport = false): string {
	const canonical = normalizeCoreSub(sub);
	const registryKey = `@nativescript/core/${canonical}`;
	const names = Array.from(new Set(exportNames)).filter((n) => /^[A-Za-z_$][\w$]*$/.test(n) && !RESERVED_EXPORT_NAMES.has(n));
	const lines: string[] = [];
	lines.push(`/* @nativescript/core bridge (bundle mode) — sub: ${canonical} */`);
	lines.push(`import ${JSON.stringify(CORE_BUNDLE_PATH)};`);
	lines.push(`const __ns_core_sub_ns__ = (globalThis.__NS_CORE_MODULES__ || {})[${JSON.stringify(registryKey)}];`);
	lines.push(`if (!__ns_core_sub_ns__) { throw new Error(${JSON.stringify(`[ns-core] core bundle registry missing '${registryKey}' — restart the dev server or set NS_CORE_PER_MODULE=1`)}); }`);
	for (const name of names) {
		lines.push(`export const ${name} = __ns_core_sub_ns__.${name};`);
	}
	// Deep-subpath contract (see isDeepCoreSubpath / per-module bridge): a sub
	// that declares its own `export default` (e.g. utils/lazy.js's
	// `export default function lazy`) must expose THAT value as the shim's
	// default — consumers like the vendor bundle do
	// `import lazy from '@nativescript/core/utils/lazy'` and call it directly.
	// Subs without an own default keep the self-namespace default so the
	// "default import + destructure" consumer rewrite still works.
	if (hasOwnDefaultExport) {
		lines.push(`export default __ns_core_sub_ns__.default;`);
	} else {
		lines.push(`export default __ns_core_sub_ns__;`);
	}
	lines.push('');
	return lines.join('\n');
}
