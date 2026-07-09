/**
 * THE single node_modules payload for dev-session device serving.
 *
 * DEFAULT MODE
 * ------------
 * All node_modules code a session needs evaluates from ONE ESM payload served
 * at `GET /ns/deps-bundle.mjs`. Its entry set is the union of:
 *  - the vendor collection (direct NativeScript-plugin/framework deps from
 *    package.json — available on the very first boot, no recording needed),
 *  - the persisted boot recording (every deep `/ns/m/node_modules/...` file a
 *    previous cold boot actually fetched — rxjs internals, Angular fesm
 *    files, community plugin subpaths).
 *
 * The canonical `/ns/m/node_modules/...` URL space is preserved — those
 * routes serve THIN SHIMS that statically import the bundle and re-export the
 * requested module's namespace from the `globalThis.__NS_DEPS_MODULES__`
 * registry the bundle populates. Because every shim's only dependency is the
 * one bundle URL, V8 evaluates the dependency closure exactly once — module
 * identity stays keyed by canonical URL, with ONE big prefetchable payload
 * instead of a deep serial fetch chain.
 *
 * The legacy vendor realm is a VIEW over this bundle: the session bootstrap's
 * `/@nativescript/vendor.mjs` import serves a thin module (see
 * `buildDepsVendorRuntimeModule`) that imports this bundle and exposes
 * package-root namespaces from the deps registry, so `ns-vendor://<pkg>`
 * wrappers and `__nsVendorRequire` resolve into the SAME realm as every shim.
 * No second node_modules payload ever evaluates.
 *
 * REALM RULES
 * -----------
 *  - `@nativescript/core[/*]` stays EXTERNAL as a bare specifier: the device
 *    import map routes it to the `/ns/core` bridge, so bundled dep code joins
 *    the live core realm.
 *  - Dynamic `import()` targets inside dep code are externalized back to
 *    their canonical `/ns/m/node_modules/...` URL, preserving lazy evaluation
 *    and per-URL identity for modules the boot never touched.
 *  - `@nativescript/vite` client modules stay per-module (dev tooling loads
 *    independently of the app dependency closure).
 *  - Everything else resolvable is internalized — platform-suffix resolution
 *    (`index.ios.js`) backs up esbuild's resolver — and EVERY bundled input
 *    file is registered, so any `/ns/m` URL minted for a bundled file
 *    resolves to the single bundle instance. Bare externals are emitted only
 *    for specs with no on-disk resolution at all: anything resolvable would
 *    otherwise round-trip through a shim of this bundle mid-evaluation (ESM
 *    cycle: the shim body runs before the registry is populated and throws).
 *
 * FALLBACK
 * --------
 * A failed esbuild build logs once and falls back to per-module serving plus
 * the standalone vendor bundle for the session. Opt out entirely with
 * `NS_DEPS_PER_MODULE=1` (patch-package workflows editing node_modules).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as esbuild from 'esbuild';
import type { ViteDevServer } from 'vite';

import { resolvePlatform } from '../../helpers/cli-flags.js';
import { getGlobalDefines } from '../../helpers/global-defines.js';
import { getProjectFlavor } from '../../helpers/flavor.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { createNativeClassEsbuildPlugin } from '../../helpers/nativeclass-esbuild-plugin.js';
import type { Platform } from '../../helpers/platform-types.js';
import { resolveVerboseFlag } from '../../helpers/logging.js';
import { getVitePackageVersion } from '../../helpers/vite-package-version.js';
import { createNodeBuiltinPolyfillEsbuildPlugin, createSolidJsxEsbuildPlugin, createUnicodeRegexEsbuildPlugin, createVendorEsbuildPlugin, createWebpackLoaderStubEsbuildPlugin } from '../shared/vendor/vendor-esbuild-plugins.js';
import { getVendorManifest, setVendorRuntimeModuleProvider } from '../shared/vendor/registry.js';
import { collectVendorModules } from '../shared/vendor/manifest-collect.js';
import { generatePlatformPolyfills } from '../shared/runtime/platform-polyfills.js';
import { getAngularLinkerFactory, runAngularLinker } from '../frameworks/angular/build/shared-linker.js';
import { getBlockedDeviceNodeModulesReason, resolveCandidateFilePath } from './websocket-module-specifiers.js';
import { extractDirectExportedNames, JS_IDENTIFIER_RE, parseExportSpecList } from './websocket-core-bridge.js';
import { hasExistingDefaultExport } from './ns-core-cjs-shape.js';
import { loadPersistedBootRecording } from './boot-recording.js';
import { setDeviceModuleHeaders } from './route-helpers.js';

export const DEPS_BUNDLE_PATH = '/ns/deps-bundle.mjs';

/**
 * Per-module node_modules serving mode (vs the default single-eval deps
 * bundle). `NS_DEPS_PER_MODULE=1|true` forces per-module serving — the right
 * mode when hand-editing files inside node_modules (patch-package workflows).
 */
export function isDepsPerModuleServingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const v = env.NS_DEPS_PER_MODULE;
	return v === '1' || v === 'true';
}

// ============================================================================
// Entry resolution — recorded `/ns/m/node_modules/...` paths → physical files
// ============================================================================

const SCRIPT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i;
const NON_BUNDLEABLE_EXT_RE = /\.(css|scss|sass|less|json|html|vue|svelte)$/i;

/** One bundle entry: the served spec, its registry key, and the source file. */
export interface DepsBundleEntry {
	/** Served spec form, e.g. `/node_modules/rxjs/dist/esm/internal/Observable`. */
	spec: string;
	/** Registry key: node_modules-relative file path, e.g. `node_modules/rxjs/dist/esm/internal/Observable.js`. */
	key: string;
	absPath: string;
}

/** Registry key for a physical file: substring from the LAST node_modules segment. */
export function depsRegistryKeyForFile(absPath: string): string | null {
	const posix = absPath.replace(/\\/g, '/');
	const idx = posix.lastIndexOf('/node_modules/');
	if (idx === -1) return null;
	return posix.slice(idx + 1);
}

function platformResolveExtensions(platform: string): string[] {
	if (platform === 'android') {
		return ['.android.tsx', '.tsx', '.android.jsx', '.jsx', '.android.ts', '.ts', '.android.js', '.js', '.mjs', '.cjs', '.json'];
	}
	return ['.ios.tsx', '.visionos.tsx', '.tsx', '.ios.jsx', '.visionos.jsx', '.jsx', '.ios.ts', '.visionos.ts', '.ts', '.ios.js', '.visionos.js', '.js', '.mjs', '.cjs', '.json'];
}

/**
 * Same extension/index fan-out the /ns/m route uses for a served spec,
 * platform-suffixed variants first (`canvas` → `canvas.ios.js` before
 * `canvas.js`, `Paywall` → `Paywall/index.ios.js`) so shim lookup lands on
 * the same file the per-module pipeline would serve.
 */
export function buildDepsCandidateSpecs(spec: string, platform: string): string[] {
	const hasExt = SCRIPT_EXT_RE.test(spec);
	const baseNoExt = hasExt ? spec.replace(SCRIPT_EXT_RE, '') : spec;
	const exts = platformResolveExtensions(platform);
	return [...(hasExt ? [spec] : []), ...exts.map((ext) => baseNoExt + ext), ...exts.map((ext) => baseNoExt + '/index' + ext)];
}

/**
 * Resolve a package ROOT spec (`/node_modules/<pkg>`) to its entry file via
 * the package's own `exports['.']`/`module`/`main`, honoring platform
 * suffix variants NativeScript plugins commonly ship (`index.ios.js`).
 */
function resolvePackageRootEntry(spec: string, roots: readonly string[], platform: string): string | null {
	const pkgSub = spec.replace(/^\/node_modules\//, '');
	if (!pkgSub || pkgSub.includes('/node_modules/')) return null;
	const parts = pkgSub.split('/');
	const isScoped = pkgSub.startsWith('@');
	if (parts.length !== (isScoped ? 2 : 1)) return null;
	for (const root of roots) {
		const pkgDir = path.join(root, 'node_modules', ...parts);
		const pkgJsonPath = path.join(pkgDir, 'package.json');
		if (!existsSync(pkgJsonPath)) continue;
		let pkg: any;
		try {
			pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
		} catch {
			continue;
		}
		const candidates: string[] = [];
		const visitExports = (node: any) => {
			if (!node) return;
			if (typeof node === 'string') {
				candidates.push(node);
				return;
			}
			if (typeof node === 'object' && !Array.isArray(node)) {
				// Prefer client/ESM conditions in the order esbuild would.
				for (const cond of ['module', 'import', 'browser', 'default', 'require']) {
					if (node[cond] !== undefined) visitExports(node[cond]);
				}
			}
		};
		visitExports(pkg.exports?.['.'] ?? (typeof pkg.exports === 'string' ? pkg.exports : undefined));
		if (typeof pkg.module === 'string') candidates.push(pkg.module);
		if (typeof pkg.main === 'string') candidates.push(pkg.main);
		candidates.push('index');
		for (const cand of candidates) {
			const abs = path.resolve(pkgDir, cand);
			if (!abs.startsWith(pkgDir + path.sep)) continue;
			if (existsSync(abs) && statSync(abs).isFile()) return abs;
			const base = abs.replace(SCRIPT_EXT_RE, '');
			for (const ext of platformResolveExtensions(platform)) {
				if (existsSync(base + ext)) return base + ext;
			}
		}
	}
	return null;
}

/** `/node_modules/<pkg>` or `/node_modules/@scope/<pkg>` with no subpath. */
function isPackageRootSpec(spec: string): boolean {
	const pkgSub = spec.replace(/^\/node_modules\//, '');
	if (!pkgSub || pkgSub === spec || pkgSub.includes('/node_modules/')) return false;
	return pkgSub.split('/').length === (pkgSub.startsWith('@') ? 2 : 1);
}

function resolveSpecToFile(spec: string, projectRoot: string, workspaceRoot: string | null, platform: string): string | null {
	const roots = [projectRoot, ...(workspaceRoot && path.resolve(workspaceRoot) !== path.resolve(projectRoot) ? [workspaceRoot] : [])];
	// Package roots honor the declared entry (exports/module/main) FIRST —
	// matching esbuild's resolution of bare imports inside the bundle. The
	// index fan-out would otherwise pick stray root files like a shipped
	// `index.ts` source whose relative imports aren't in the npm package
	// (solid-navigation shape), minting a broken or second realm.
	if (isPackageRootSpec(spec)) {
		const entry = resolvePackageRootEntry(spec, roots, platform);
		if (entry) return entry;
	}
	for (const candidate of buildDepsCandidateSpecs(spec, platform)) {
		const abs = resolveCandidateFilePath(candidate, projectRoot, workspaceRoot);
		if (abs) return abs;
	}
	return isPackageRootSpec(spec) ? null : resolvePackageRootEntry(spec, roots, platform);
}

// Never bundled: `@nativescript/core` belongs to the /ns/core bridge realm,
// and `@nativescript/vite` IS the dev tooling — its device-served client
// modules (hot registry, session bootstrap, framework strategies) must load
// independently of the app dependency closure, not as consumers of it.
// Bundling them would make the HMR client's evaluation depend on the entire
// deps payload (and deadlock the session bootstrap's client evict/re-import).
const NEVER_BUNDLED_SPEC_RE = /^\/node_modules\/@nativescript\/(?:core|vite)(?:\/|$)/;
const NEVER_BUNDLED_KEY_RE = /^node_modules\/@nativescript\/(?:core|vite)\//;

/**
 * Map recorded boot paths to bundle entries. Skips: non-node_modules paths,
 * blocked packages, the never-bundled `@nativescript/core` + `@nativescript/vite`
 * realms, non-script assets, symlinked workspace-source packages, and files
 * that cannot be resolved on disk (they stay per-module).
 */
export function resolveDepsEntriesFromRecording(recordedPaths: readonly string[], projectRoot: string, workspaceRoot: string | null, platform: string): DepsBundleEntry[] {
	const entries: DepsBundleEntry[] = [];
	const seenKeys = new Set<string>();
	for (const recorded of recordedPaths) {
		if (typeof recorded !== 'string' || !recorded.startsWith('/ns/m/node_modules/')) continue;
		const spec = recorded.slice('/ns/m'.length).replace(/[?#].*$/, '');
		if (NON_BUNDLEABLE_EXT_RE.test(spec)) continue;
		if (NEVER_BUNDLED_SPEC_RE.test(spec)) continue;
		if (getBlockedDeviceNodeModulesReason(spec)) continue;
		const absPath = resolveSpecToFile(spec, projectRoot, workspaceRoot, platform);
		if (!absPath || NON_BUNDLEABLE_EXT_RE.test(absPath)) continue;
		// Symlinked node_modules entries pointing at workspace source are app
		// code in disguise — leave them to the Vite pipeline (same policy as
		// filterExistingNodeModulesTransformCandidates).
		try {
			const real = realpathSync(absPath);
			if (real !== absPath && !real.split(path.sep).includes('node_modules')) continue;
		} catch {
			continue;
		}
		const key = depsRegistryKeyForFile(absPath);
		if (!key || seenKeys.has(key)) continue;
		seenKeys.add(key);
		entries.push({ spec, key, absPath });
	}
	return entries;
}

export interface DepsVendorSeed {
	entries: DepsBundleEntry[];
	/** Vendor-manifest specifier (e.g. `@ngrx/store`) → registry key of its entry file. */
	vendorSpecToKey: Map<string, string>;
}

/**
 * Seed bundle entries from the vendor collection (direct NativeScript-plugin
 * and framework deps from package.json). This makes the bundle exist on the
 * very first boot — no recording needed — and produces the specifier→key map
 * that backs `__nsVendorRegistry` (see buildDepsVendorRuntimeModule), so
 * `ns-vendor://<pkg>` wrappers resolve into THIS bundle's realm.
 */
export function resolveDepsEntriesFromVendorCollection(projectRoot: string, workspaceRoot: string | null, platform: string, flavor: string | undefined): DepsVendorSeed {
	const entries: DepsBundleEntry[] = [];
	const vendorSpecToKey = new Map<string, string>();
	let collectedSpecs: string[];
	try {
		collectedSpecs = collectVendorModules(projectRoot, platform, flavor).entries;
	} catch {
		return { entries, vendorSpecToKey };
	}
	const seenKeys = new Set<string>();
	for (const bare of collectedSpecs) {
		const spec = `/node_modules/${bare}`;
		if (NEVER_BUNDLED_SPEC_RE.test(spec)) continue;
		if (getBlockedDeviceNodeModulesReason(spec)) continue;
		// Solid pins its runtime to dist/dev.js everywhere (see the routing
		// plugin); the seed must land on the same file or the registry entry
		// would mint a second solid realm.
		const resolveTarget = flavor === 'solid' && bare === 'solid-js' ? '/node_modules/solid-js/dist/dev.js' : spec;
		const absPath = resolveSpecToFile(resolveTarget, projectRoot, workspaceRoot, platform);
		if (!absPath || NON_BUNDLEABLE_EXT_RE.test(absPath)) continue;
		try {
			const real = realpathSync(absPath);
			if (real !== absPath && !real.split(path.sep).includes('node_modules')) continue;
		} catch {
			continue;
		}
		const key = depsRegistryKeyForFile(absPath);
		if (!key) continue;
		vendorSpecToKey.set(bare, key);
		if (seenKeys.has(key)) continue;
		seenKeys.add(key);
		entries.push({ spec, key, absPath });
	}
	return { entries, vendorSpecToKey };
}

// ============================================================================
// Bundle generation — two esbuild passes
// ============================================================================

/**
 * Synthetic esbuild entry: evaluate the dep closure once and expose every
 * bundled file's live namespace through `globalThis.__NS_DEPS_MODULES__`,
 * keyed by node_modules-relative file path.
 */
export function buildDepsBundleEntryCode(files: readonly { key: string; absPath: string }[]): string {
	const lines: string[] = [];
	files.forEach(({ absPath }, i) => {
		lines.push(`import * as __ns_dep_${i}__ from ${JSON.stringify(absPath)};`);
	});
	lines.push('');
	lines.push('const __nsDepsReg = (globalThis.__NS_DEPS_MODULES__ || (globalThis.__NS_DEPS_MODULES__ = Object.create(null)));');
	files.forEach(({ key }, i) => {
		lines.push(`__nsDepsReg[${JSON.stringify(key)}] = __ns_dep_${i}__;`);
	});
	lines.push('export {};');
	lines.push('');
	return lines.join('\n');
}

// Node built-ins the device runtime cannot resolve — externalized exactly like
// the core and vendor bundle builds.
const NODE_BUILTINS = ['assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain', 'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'stream/web', 'stream/promises', 'string_decoder', 'sys', 'timers', 'timers/promises', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'];
const NODE_EXTERNALS = [...NODE_BUILTINS, ...NODE_BUILTINS.map((b) => `node:${b}`)];
const NODE_BUILTIN_SET = new Set(NODE_EXTERNALS);

/**
 * Import routing inside the deps bundle, mirroring per-module
 * `rewriteImports` topology. The single-realm rules:
 *  - `@nativescript/core[/*]` → external bare (device import map → /ns/core).
 *  - Dynamic `import()` targets → external `/ns/m/node_modules/...` URL:
 *    evaluation stays lazy and the target keeps its per-URL identity (a shim
 *    when the target is itself bundled; dynamic imports run after the bundle
 *    finishes evaluating, so the shim's registry read cannot race it).
 *  - `@nativescript/vite` client modules stay per-module (see
 *    NEVER_BUNDLED_SPEC_RE) → external canonical /ns/m URL.
 *  - Solid flavor: bare `solid-js` pins to `solid-js/dist/dev.js` INSIDE the
 *    bundle — the same file `rewriteImports` routes every importer to — so
 *    the bundle can never carry a second solid realm.
 *  - Everything else internalizes. Bare specs esbuild cannot resolve get
 *    platform-aware resolution (`index.ios.js`-style entries esbuild's
 *    resolver misses); only specs with no on-disk resolution at all stay
 *    external bare. Anything resolvable MUST internalize: this bundle is the
 *    only node_modules realm, so an external bare spec would resolve
 *    on-device through the import map back into a shim of this bundle — an
 *    evaluation cycle (the shim's registry read runs before the bundle body
 *    finishes and throws). Pass 2 registers every internalized file, keeping
 *    per-URL identity for all of them.
 */
function createDepsImportRoutingPlugin(projectRoot: string, workspaceRoot: string | null, platform: string, flavor: string | undefined): esbuild.Plugin {
	return {
		name: 'ns-deps-import-routing',
		setup(build) {
			build.onResolve({ filter: /.*/ }, async (args) => {
				if (args.pluginData?.nsDepsRoutingProbe) return undefined;
				if (args.kind === 'entry-point') return undefined;
				const spec = args.path;
				const probeResolve = (target: string) =>
					build.resolve(target, {
						resolveDir: args.resolveDir,
						kind: args.kind,
						importer: args.importer,
						pluginData: { nsDepsRoutingProbe: true },
					});
				if (args.kind === 'dynamic-import') {
					if (spec.startsWith('/ns/') || /^https?:\/\//.test(spec)) return { path: spec, external: true };
					const probe = await probeResolve(spec);
					if (probe.errors.length > 0 || !probe.path || probe.external) return probe;
					const key = depsRegistryKeyForFile(probe.path);
					if (!key) return probe;
					return { path: `/ns/m/${key.replace(SCRIPT_EXT_RE, '')}`, external: true };
				}
				if (spec.startsWith('.') || spec.startsWith('/') || /^[A-Za-z]:[\\/]/.test(spec)) return undefined;
				if (NODE_BUILTIN_SET.has(spec)) return undefined;
				if (/^@nativescript\/core(?:\/|$)/.test(spec)) {
					return { path: spec, external: true };
				}
				if (/^@nativescript\/vite(?:\/|$)/.test(spec)) {
					return { path: `/ns/m/node_modules/${spec.replace(SCRIPT_EXT_RE, '')}`, external: true };
				}
				if (flavor === 'solid' && spec === 'solid-js') {
					const pinned = await probeResolve('solid-js/dist/dev.js');
					if (!pinned.errors.length && pinned.path) return pinned;
				}
				const probe = await probeResolve(spec);
				if (probe.errors.length > 0 || !probe.path) {
					const resolved = resolveSpecToFile(`/node_modules/${spec}`, projectRoot, workspaceRoot, platform);
					if (resolved) return { path: resolved };
					return { path: spec, external: true };
				}
				return probe;
			});
		},
	};
}

/**
 * Angular partial-declaration linker for the deps bundle. Broader than the
 * vendor build's `@angular/`-scoped pass: recorded closures include partial-
 * compiled LIBRARY fesm files (e.g. nativescript-fonticon/angular) that the
 * per-module pipeline links at serve time, so the bundle must link any
 * node_modules file carrying `ɵɵngDeclare`.
 */
function createDepsAngularLinkerPlugin(projectRoot: string): esbuild.Plugin {
	return {
		name: 'ns-deps-angular-linker',
		async setup(build) {
			const { babel, createLinker } = await getAngularLinkerFactory(projectRoot);
			if (!babel || !createLinker) return;
			build.onLoad({ filter: /node_modules[\\/].*\.[mc]?js$/ }, async (args) => {
				let source: string;
				try {
					source = readFileSync(args.path, 'utf8');
				} catch {
					return undefined;
				}
				if (!source.includes('\u0275\u0275ngDeclare')) return undefined;
				try {
					const linked = await runAngularLinker(source, { filename: args.path, projectRoot, freshPlugin: true });
					return { contents: linked || source, loader: 'js' };
				} catch {
					return { contents: source, loader: 'js' };
				}
			});
		},
	};
}

export interface DepsBundleState {
	/** Full ESM payload served at /ns/deps-bundle.mjs. */
	code: string;
	/** Registry keys (node_modules-relative file paths) present in the bundle. */
	keys: Set<string>;
	/** Served-spec → registry key for every recorded entry. */
	specToKey: Map<string, string>;
	/** Registry key → source file (export-name discovery for shims). */
	keyToFile: Map<string, string>;
	/** Vendor-manifest specifier → registry key (backs __nsVendorRegistry). */
	vendorSpecToKey: Map<string, string>;
	hash: string;
	builtAt: number;
	buildMs: number;
}

export interface GenerateDepsBundleOptions {
	projectRoot: string;
	platform: Platform | string;
	mode: 'development' | 'production' | string;
	flavor?: string;
	verbose?: boolean;
	recordedPaths: readonly string[];
}

// ============================================================================
// Disk cache — same shape as the core bundle cache (node_modules/.ns-vite).
// The key covers the lockfile (dependency identity), the full entry set
// (recorded + vendor-seeded), defines, and the vite package version. Opt out
// with `NS_DEPS_BUNDLE_NO_DISK_CACHE=1`.
// ============================================================================

const DEPS_BUNDLE_DISK_CACHE_SCHEMA = 4;

function isDepsBundleDiskCacheDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const v = env.NS_DEPS_BUNDLE_NO_DISK_CACHE;
	return v === '1' || v === 'true';
}

function lockfileFingerprint(projectRoot: string): string {
	for (const name of ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb']) {
		const file = path.join(projectRoot, name);
		try {
			const st = statSync(file);
			return `${name}:${st.mtimeMs}:${st.size}`;
		} catch {}
	}
	return 'none';
}

export function computeDepsBundleCacheKey(input: { platform: string; mode: string; flavor: string; defines: Record<string, string>; entryKeys: readonly string[]; lockfile: string; vitePackageVersion: string }): string {
	const payload = JSON.stringify({
		schema: DEPS_BUNDLE_DISK_CACHE_SCHEMA,
		platform: input.platform,
		mode: input.mode,
		flavor: input.flavor,
		defines: input.defines,
		entryKeys: input.entryKeys,
		lockfile: input.lockfile,
		vitePackageVersion: input.vitePackageVersion,
	});
	return createHash('sha1').update(payload).digest('hex');
}

function depsBundleCacheDir(projectRoot: string): string {
	return path.join(projectRoot, 'node_modules', '.ns-vite');
}

function depsBundleCacheFileBase(platform: string, key: string): string {
	return `deps-bundle-${platform}-${key.slice(0, 12)}`;
}

export function tryLoadDepsBundleFromDisk(projectRoot: string, platform: string, key: string): DepsBundleState | null {
	try {
		const dir = depsBundleCacheDir(projectRoot);
		const base = depsBundleCacheFileBase(platform, key);
		const metaPath = path.join(dir, `${base}.json`);
		const codePath = path.join(dir, `${base}.mjs`);
		if (!existsSync(metaPath) || !existsSync(codePath)) return null;
		const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
		if (!meta || meta.schema !== DEPS_BUNDLE_DISK_CACHE_SCHEMA || meta.key !== key) return null;
		if (!Array.isArray(meta.keys) || typeof meta.specToKey !== 'object' || typeof meta.keyToFile !== 'object' || typeof meta.vendorSpecToKey !== 'object') return null;
		const code = readFileSync(codePath, 'utf-8');
		const hash = createHash('sha1').update(code).digest('hex');
		if (hash !== meta.hash) return null;
		return {
			code,
			keys: new Set(meta.keys.filter((k: unknown): k is string => typeof k === 'string')),
			specToKey: new Map(Object.entries(meta.specToKey as Record<string, string>)),
			keyToFile: new Map(Object.entries(meta.keyToFile as Record<string, string>)),
			vendorSpecToKey: new Map(Object.entries(meta.vendorSpecToKey as Record<string, string>)),
			hash,
			builtAt: typeof meta.builtAt === 'number' ? meta.builtAt : Date.now(),
			buildMs: typeof meta.buildMs === 'number' ? meta.buildMs : 0,
		};
	} catch {
		return null;
	}
}

export function saveDepsBundleToDisk(projectRoot: string, platform: string, key: string, state: DepsBundleState, verbose?: boolean): void {
	try {
		const dir = depsBundleCacheDir(projectRoot);
		mkdirSync(dir, { recursive: true });
		const base = depsBundleCacheFileBase(platform, key);
		try {
			for (const name of readdirSync(dir)) {
				if (name.startsWith(`deps-bundle-${platform}-`) && !name.startsWith(base)) {
					unlinkSync(path.join(dir, name));
				}
			}
		} catch {}
		writeFileSync(path.join(dir, `${base}.mjs`), state.code);
		writeFileSync(
			path.join(dir, `${base}.json`),
			JSON.stringify({
				schema: DEPS_BUNDLE_DISK_CACHE_SCHEMA,
				key,
				hash: state.hash,
				builtAt: state.builtAt,
				buildMs: state.buildMs,
				keys: Array.from(state.keys),
				specToKey: Object.fromEntries(state.specToKey),
				keyToFile: Object.fromEntries(state.keyToFile),
				vendorSpecToKey: Object.fromEntries(state.vendorSpecToKey),
			}),
		);
	} catch (error: any) {
		if (verbose) {
			console.warn(`[ns-deps-bundle] disk cache write failed (non-fatal): ${error?.message || error}`);
		}
	}
}

export async function generateDepsBundle(options: GenerateDepsBundleOptions): Promise<DepsBundleState | null> {
	const { projectRoot, platform, mode, flavor, verbose } = options;
	const t0 = Date.now();
	const workspaceRoot = getMonorepoWorkspaceRoot(projectRoot);
	const recordedEntries = resolveDepsEntriesFromRecording(options.recordedPaths, projectRoot, workspaceRoot, String(platform));
	const vendorSeed = resolveDepsEntriesFromVendorCollection(projectRoot, workspaceRoot, String(platform), flavor);
	// Union: recorded deep files + vendor-collected package roots. Recorded
	// entries win on key collisions so their served-spec mapping is preserved;
	// vendorSpecToKey still points every vendor specifier at its bundled key.
	const entries = [...recordedEntries];
	const mergedKeys = new Set(recordedEntries.map((e) => e.key));
	for (const entry of vendorSeed.entries) {
		if (mergedKeys.has(entry.key)) continue;
		mergedKeys.add(entry.key);
		entries.push(entry);
	}
	if (!entries.length) return null;

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
		// webpack-HMR idiom carried by ESM-published packages (e.g.
		// @nativescript/canvas-polyfill's `if (module.hot) ...` at module top
		// level). In the single-eval ESM bundle a FREE `module` reference is a
		// ReferenceError the moment the bundle evaluates. esbuild's define only
		// substitutes free references, so CJS-wrapped code (where `module` is a
		// bound variable) is untouched.
		out['module.hot'] = 'undefined';
		return out;
	})();

	const diskCacheDisabled = isDepsBundleDiskCacheDisabled();
	let cacheKey: string | null = null;
	if (!diskCacheDisabled) {
		cacheKey = computeDepsBundleCacheKey({
			platform: String(platform),
			mode: String(mode),
			flavor: flavor ?? '',
			defines,
			entryKeys: entries.map((e) => e.key).sort(),
			lockfile: lockfileFingerprint(projectRoot),
			vitePackageVersion: getVitePackageVersion(),
		});
		const cached = tryLoadDepsBundleFromDisk(projectRoot, String(platform), cacheKey);
		if (cached) {
			if (verbose) {
				console.log(`[ns-deps-bundle] loaded from disk cache: ${cached.keys.size} modules, ${(cached.code.length / 1024).toFixed(0)}kb in ${Date.now() - t0}ms (hash ${cached.hash.slice(0, 8)}, key ${cacheKey.slice(0, 12)})`);
			}
			return cached;
		}
	}

	// createWebpackLoaderStubEsbuildPlugin runs first: legacy `loader!./x`
	// specifiers (dead NS 6/7 webpack branches in plugins) must be stubbed
	// before any resolver sees them — one such specifier anywhere in the dep
	// closure would otherwise hard-fail the whole bundle.
	// createNodeBuiltinPolyfillEsbuildPlugin bundles installed npm polyfills
	// (buffer, events, ...) that would otherwise leak as bare builtin externals
	// the device cannot resolve.
	const buildPlugins = (): esbuild.Plugin[] => [createWebpackLoaderStubEsbuildPlugin(), createNodeBuiltinPolyfillEsbuildPlugin(projectRoot, NODE_BUILTINS), createNativeClassEsbuildPlugin(platform as Platform), createVendorEsbuildPlugin(projectRoot), createDepsImportRoutingPlugin(projectRoot, workspaceRoot, String(platform), flavor), ...(flavor === 'angular' ? [createDepsAngularLinkerPlugin(projectRoot)] : []), ...(flavor === 'solid' ? [createSolidJsxEsbuildPlugin(projectRoot)] : []), createUnicodeRegexEsbuildPlugin(projectRoot)];
	const sharedBuildOptions = {
		platform: 'neutral' as const,
		format: 'esm' as const,
		bundle: true,
		target: 'es2019',
		// Keep every module body — dep packages rely on registration side
		// effects the same way core does.
		treeShaking: false,
		sourcemap: false,
		write: false,
		logLevel: 'silent' as const,
		legalComments: 'eof' as const,
		conditions: ['module', 'react-native', 'import', 'browser', 'default'],
		mainFields: ['module', 'browser', 'main'],
		resolveExtensions: platformResolveExtensions(String(platform)),
		absWorkingDir: projectRoot,
		loader: { '.css': 'text' as const, '.json': 'json' as const },
		define: defines,
		external: NODE_EXTERNALS,
	};

	// Pass 1: discover the full static input closure of the entries. Pass 2
	// registers EVERY input, so any /ns/m URL that later resolves to a bundled
	// file serves a shim into the single bundle realm.
	const entryKeySet = new Set(entries.map((e) => e.key));
	const discovery = await esbuild.build({
		...sharedBuildOptions,
		stdin: {
			contents: entries.map((e) => `import ${JSON.stringify(e.absPath)};`).join('\n'),
			resolveDir: projectRoot,
			sourcefile: 'ns-deps-bundle-discovery.ts',
			loader: 'ts',
		},
		metafile: true,
		plugins: buildPlugins(),
	});

	const files: { key: string; absPath: string }[] = entries.map(({ key, absPath }) => ({ key, absPath }));
	for (const input of Object.keys(discovery.metafile?.inputs ?? {})) {
		if (input === '<stdin>' || input.includes(':') || !input.includes('node_modules/')) continue;
		const absPath = path.resolve(projectRoot, input);
		if (!existsSync(absPath)) continue;
		const key = depsRegistryKeyForFile(absPath);
		if (!key || entryKeySet.has(key) || NEVER_BUNDLED_KEY_RE.test(key)) continue;
		entryKeySet.add(key);
		files.push({ key, absPath });
	}

	const buildResult = await esbuild.build({
		...sharedBuildOptions,
		stdin: {
			contents: buildDepsBundleEntryCode(files),
			resolveDir: projectRoot,
			sourcefile: 'ns-deps-bundle-entry.ts',
			loader: 'ts',
		},
		plugins: buildPlugins(),
	});

	if (!buildResult.outputFiles?.length) {
		throw new Error('deps bundle generation produced no output');
	}

	// Platform polyfills (self, AbortController, ...) run before any dep module
	// body — this bundle is the first node_modules code a session evaluates.
	const code = ['/* /ns/deps-bundle.mjs — single-eval node_modules dep closure (dev bundle mode) */', generatePlatformPolyfills(), buildResult.outputFiles[0].text].join('\n');
	const hash = createHash('sha1').update(code).digest('hex');
	const state: DepsBundleState = {
		code,
		keys: new Set(files.map((f) => f.key)),
		specToKey: new Map(entries.map((e) => [e.spec, e.key])),
		keyToFile: new Map(files.map((f) => [f.key, f.absPath])),
		vendorSpecToKey: vendorSeed.vendorSpecToKey,
		hash,
		builtAt: Date.now(),
		buildMs: Date.now() - t0,
	};
	if (verbose) {
		console.log(`[ns-deps-bundle] built ${files.length} modules (${recordedEntries.length} recorded + ${vendorSeed.entries.length} vendor-seeded), ${(code.length / 1024).toFixed(0)}kb in ${state.buildMs}ms (hash ${hash.slice(0, 8)})`);
	}
	if (!diskCacheDisabled && cacheKey) {
		saveDepsBundleToDisk(projectRoot, String(platform), cacheKey, state, verbose);
	}
	return state;
}

// ============================================================================
// Shim generation — export-name discovery + codegen
// ============================================================================

export interface DepsModuleExportInfo {
	/** Null when the file is not statically analyzable ESM (stays per-module). */
	names: string[] | null;
	hasDefault: boolean;
}

const ESM_SYNTAX_RE = /^[ \t]*(?:import[\s{"'*]|export[\s{*])/m;

function resolveLocalReExportTarget(spec: string, importerPath: string, platform: string): string | null {
	const base = path.resolve(path.dirname(importerPath), spec);
	if (existsSync(base) && statSync(base).isFile()) return base;
	for (const ext of platformResolveExtensions(platform)) {
		for (const candidate of [base + ext, base + '/index' + ext]) {
			if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
		}
	}
	return null;
}

// Static CJS export-name discovery: `exports.NAME = ...` and
// `Object.defineProperty(exports, "NAME", ...)` assignments (transpiled-to-CJS
// packages like downsample). UMD factories (`module.exports = fn()`) expose no
// static names and stay per-module.
const CJS_EXPORT_ASSIGN_RE = /\bexports\.([$_\p{ID_Start}][$\p{ID_Continue}]*)\s*=/gu;
const CJS_DEFINE_PROPERTY_RE = /\bObject\.defineProperty\(\s*exports\s*,\s*["']([$_\p{ID_Start}][$\p{ID_Continue}]*)["']/gu;

function collectCjsExportInfo(code: string): DepsModuleExportInfo {
	const names = new Set<string>();
	let match: RegExpExecArray | null;
	while ((match = CJS_EXPORT_ASSIGN_RE.exec(code)) !== null) names.add(match[1]);
	while ((match = CJS_DEFINE_PROPERTY_RE.exec(code)) !== null) names.add(match[1]);
	names.delete('__esModule');
	if (names.size === 0) return { names: null, hasDefault: false };
	const hasDefault = names.delete('default');
	return { names: Array.from(names).sort(), hasDefault };
}

/**
 * Static export-name discovery for a node_modules file. ESM: direct exports
 * plus recursion through RELATIVE `export * from` chains (the shape deep
 * package barrels like rxjs's index take). CJS: `exports.NAME` assignment
 * scanning (esbuild's interop exposes those names on the bundled namespace at
 * runtime). Returns `names: null` for files whose export surface is not
 * statically enumerable — UMD factories, a bare `export * from 'pkg'` (the
 * name set lives in another package), or an unresolvable relative `export *`
 * target. Those files keep per-module serving, where the transform pipeline
 * already handles them.
 */
export function collectDepsModuleExportInfo(absPath: string, platform: string, seen: Set<string> = new Set()): DepsModuleExportInfo {
	if (seen.has(absPath)) return { names: [], hasDefault: false };
	seen.add(absPath);
	let code = '';
	try {
		code = readFileSync(absPath, 'utf8');
	} catch {
		return { names: null, hasDefault: false };
	}
	if (!ESM_SYNTAX_RE.test(code)) return collectCjsExportInfo(code);
	const names = new Set<string>(extractDirectExportedNames(code));
	let match: RegExpExecArray | null;
	const starAsRe = /\bexport\s+\*\s+as\s+([$_\p{ID_Start}][$\p{ID_Continue}]*)\s+from\s+["'][^"']+["']/gu;
	while ((match = starAsRe.exec(code)) !== null) {
		names.add(match[1]);
	}
	const braceRe = /\bexport\s*\{([^}]+)\}/g;
	while ((match = braceRe.exec(code)) !== null) {
		for (const { exportedName } of parseExportSpecList(match[1])) {
			names.add(exportedName);
		}
	}
	const starRe = /^[ \t]*export\s+\*\s+from\s+["']([^"']+)["']/gm;
	while ((match = starRe.exec(code)) !== null) {
		const spec = match[1];
		if (!spec.startsWith('.')) return { names: null, hasDefault: false };
		const target = resolveLocalReExportTarget(spec, absPath, platform);
		if (!target) return { names: null, hasDefault: false };
		const child = collectDepsModuleExportInfo(target, platform, seen);
		if (child.names === null) return { names: null, hasDefault: false };
		for (const name of child.names) names.add(name);
	}
	names.delete('default');
	return { names: Array.from(names).sort(), hasDefault: hasExistingDefaultExport(code) };
}

const RESERVED_EXPORT_NAMES = new Set(['default', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'let', 'static', 'yield', 'await', 'eval', 'arguments', '__ns_dep_ns__']);

/**
 * Shim served at `/ns/m/node_modules/...` for a bundled module. The static
 * bundle import guarantees the registry is populated before the body reads it
 * (ESM deps evaluate first). Modules without their own `export default` keep
 * the self-namespace default so "default import + destructure" consumers work
 * (same contract as the /ns/core bundle shims).
 */
export function buildDepsShimCode(key: string, exportNames: readonly string[], hasOwnDefaultExport: boolean): string {
	// JS_IDENTIFIER_RE (not ASCII \w): Angular exports `ɵɵdefineInjectable`-style
	// names — dropping them here breaks every `import * as i0` consumer.
	const names = Array.from(new Set(exportNames)).filter((n) => JS_IDENTIFIER_RE.test(n) && !RESERVED_EXPORT_NAMES.has(n));
	const lines: string[] = [];
	lines.push(`/* ns-deps bridge (bundle mode) — ${key} */`);
	lines.push(`import ${JSON.stringify(DEPS_BUNDLE_PATH)};`);
	lines.push(`const __ns_dep_ns__ = (globalThis.__NS_DEPS_MODULES__ || {})[${JSON.stringify(key)}];`);
	lines.push(`if (!__ns_dep_ns__) { throw new Error(${JSON.stringify(`[ns-deps] deps bundle registry missing '${key}' — restart the dev server or set NS_DEPS_PER_MODULE=1`)}); }`);
	for (const name of names) {
		lines.push(`export const ${name} = __ns_dep_ns__.${name};`);
	}
	if (hasOwnDefaultExport) {
		lines.push(`export default __ns_dep_ns__.default;`);
	} else {
		lines.push(`export default __ns_dep_ns__;`);
	}
	lines.push('');
	return lines.join('\n');
}

/**
 * The dev-session `/@nativescript/vendor.mjs` module, backed by the deps
 * bundle. The session bootstrap imports it and hands `__nsVendorModuleMap` +
 * `vendorManifest` to `installVendorBootstrap`, which populates
 * `__nsVendorRegistry` — so `ns-vendor://<pkg>` wrappers and
 * `__nsVendorRequire` resolve package roots into the SAME realm as every
 * `/ns/m` shim. Map entries are emitted for both the collected specifier and
 * its manifest-canonical alias so wrapper lookups hit either form.
 * `@nativescript/core` is the one non-deps entry: a bare import the device
 * import map routes to the `/ns/core` bridge realm.
 */
export function buildDepsVendorRuntimeModule(vendorSpecToKey: ReadonlyMap<string, string>, manifest: { modules?: Record<string, unknown>; aliases?: Record<string, string> } | null): string {
	const aliases = manifest?.aliases ?? {};
	const emit = new Map<string, string>();
	for (const [spec, key] of vendorSpecToKey) {
		emit.set(spec, key);
		const canonical = aliases[spec];
		if (canonical && !emit.has(canonical)) emit.set(canonical, key);
	}
	const includeCore = !!manifest?.modules?.['@nativescript/core'];
	const lines: string[] = [];
	lines.push('/* /@nativescript/vendor.mjs — deps-backed vendor view (dev bundle mode) */');
	lines.push(`import ${JSON.stringify(DEPS_BUNDLE_PATH)};`);
	if (includeCore) {
		lines.push(`import * as __ns_core__ from "@nativescript/core";`);
	}
	lines.push('const __nsDepsReg = globalThis.__NS_DEPS_MODULES__ || {};');
	lines.push('export const __nsVendorModuleMap = {');
	if (includeCore) {
		lines.push(`  ${JSON.stringify('@nativescript/core')}: __ns_core__,`);
	}
	for (const [spec, key] of emit) {
		lines.push(`  ${JSON.stringify(spec)}: __nsDepsReg[${JSON.stringify(key)}],`);
	}
	lines.push('};');
	lines.push(`export const vendorManifest = ${JSON.stringify(manifest ?? {})};`);
	lines.push('export default vendorManifest;');
	lines.push('');
	return lines.join('\n');
}

// ============================================================================
// Service
// ============================================================================

export interface DepsBundleService {
	/** Resolves the built bundle, or null (nothing to bundle / build failed / disabled). */
	ensureBuilt(): Promise<DepsBundleState | null>;
	getState(): DepsBundleState | null;
	hasFailed(): boolean;
	/**
	 * Shim body for a served `/node_modules/...` spec, or null when the spec
	 * is not bundled (or the bundle is not ready) — caller falls through to
	 * per-module serving.
	 */
	getShimForSpec(spec: string): string | null;
	/**
	 * Stop handing out NEW shims for the rest of the session (dependency set
	 * changed mid-session). The bundle payload stays servable so shims already
	 * delivered to devices keep resolving.
	 */
	disableServingForSession(reason: string): void;
	isServingDisabled(): boolean;
}

export interface CreateDepsBundleServiceOptions extends Omit<GenerateDepsBundleOptions, 'recordedPaths'> {
	getRecordedPaths(): readonly string[] | null;
}

export function createDepsBundleService(options: CreateDepsBundleServiceOptions): DepsBundleService {
	let state: DepsBundleState | null = null;
	let failed = false;
	let servingDisabled = false;
	let building: Promise<DepsBundleState | null> | null = null;
	const workspaceRoot = getMonorepoWorkspaceRoot(options.projectRoot);
	const shimCache = new Map<string, string | null>();

	const ensureBuilt = async (): Promise<DepsBundleState | null> => {
		if (state) return state;
		if (failed) return null;
		if (!building) {
			// No recording is fine: the vendor collection seeds first-boot entries.
			const recordedPaths = options.getRecordedPaths() ?? [];
			building = generateDepsBundle({ ...options, recordedPaths })
				.then((built) => {
					state = built;
					return built;
				})
				.catch((error: any) => {
					failed = true;
					console.warn(`[ns-deps-bundle] bundle build FAILED — falling back to per-module node_modules serving for this session. Set NS_DEPS_PER_MODULE=1 to silence. Error: ${error?.message || error}`);
					return null;
				});
		}
		return building;
	};

	const keyForSpec = (spec: string): string | null => {
		if (!state) return null;
		const direct = state.specToKey.get(spec);
		if (direct) return direct;
		const absPath = resolveSpecToFile(spec, options.projectRoot, workspaceRoot, String(options.platform));
		if (!absPath) return null;
		const key = depsRegistryKeyForFile(absPath);
		return key && state.keys.has(key) ? key : null;
	};

	return {
		ensureBuilt,
		getState: () => state,
		hasFailed: () => failed,
		getShimForSpec(spec: string): string | null {
			if (!state || servingDisabled) return null;
			if (!spec.includes('/node_modules/')) return null;
			const cached = shimCache.get(spec);
			if (cached !== undefined) return cached;
			let shim: string | null = null;
			const key = keyForSpec(spec);
			if (key) {
				const file = state.keyToFile.get(key);
				const info = file ? collectDepsModuleExportInfo(file, String(options.platform)) : { names: null as string[] | null, hasDefault: false };
				if (info.names !== null) {
					shim = buildDepsShimCode(key, info.names, info.hasDefault);
				}
			}
			shimCache.set(spec, shim);
			return shim;
		},
		disableServingForSession(reason: string): void {
			if (servingDisabled) return;
			servingDisabled = true;
			console.warn(`[ns-deps-bundle] shim serving disabled for this session (${reason}) — restart the dev server to rebuild the deps bundle.`);
		},
		isServingDisabled: () => servingDisabled,
	};
}

let sharedService: DepsBundleService | null = null;
let sharedServiceResolved = false;

/**
 * Process-wide deps bundle service derived from the dev server's config + CLI
 * flags (one dev server per process, like the core bundle service). Returns
 * null when per-module serving is forced via `NS_DEPS_PER_MODULE=1`. The
 * recording source is the persisted boot recording — the in-session recorder
 * starts from the same file, and mid-session recordings apply on the next
 * dev-server start.
 */
export function getSharedDepsBundleService(server: ViteDevServer): DepsBundleService | null {
	if (sharedServiceResolved) return sharedService;
	sharedServiceResolved = true;
	if (isDepsPerModuleServingEnabled()) return null;
	// Platform/flavor resolution matches createBootRecorderFromEnv exactly so
	// the service reads the same recording file the recorder writes.
	const platform: string = resolvePlatform() || 'ios';
	const flavor = getProjectFlavor();
	const projectRoot = server.config?.root || process.cwd();
	sharedService = createDepsBundleService({
		projectRoot,
		platform,
		mode: server.config?.mode === 'development' ? 'development' : 'production',
		flavor,
		verbose: resolveVerboseFlag(),
		getRecordedPaths: () => loadPersistedBootRecording(projectRoot, platform, flavor),
	});
	// ONE node_modules payload: back /@nativescript/vendor.mjs with this bundle
	// (see buildDepsVendorRuntimeModule). A null return — not built yet, build
	// failed, or dependency set changed mid-session — falls back to the
	// standalone vendor bundle build in vendorManifestPlugin.
	setVendorRuntimeModuleProvider(() => {
		const st = sharedService?.getState();
		if (!st || sharedService!.isServingDisabled()) return null;
		return buildDepsVendorRuntimeModule(st.vendorSpecToKey, getVendorManifest());
	});
	return sharedService;
}

/** Test seam: drop the shared service so specs can mount fresh. */
export function resetSharedDepsBundleServiceForTests(): void {
	sharedService = null;
	sharedServiceResolved = false;
	setVendorRuntimeModuleProvider(null);
}

/** GET /ns/deps-bundle.mjs — the single-eval dep closure payload. */
export function registerDepsBundleRoute(server: ViteDevServer, service: DepsBundleService): void {
	server.middlewares.use(async (req, res, next) => {
		try {
			const urlObj = new URL(req.url || '', 'http://localhost');
			if (urlObj.pathname !== DEPS_BUNDLE_PATH) return next();
			const state = await service.ensureBuilt();
			if (!state) {
				res.statusCode = 503;
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'deps-bundle-unavailable' }));
				return;
			}
			setDeviceModuleHeaders(res);
			res.statusCode = 200;
			res.end(state.code);
		} catch (e) {
			console.warn('[ns-deps-bundle] serve failed:', (e as any)?.message);
			next();
		}
	});
}
