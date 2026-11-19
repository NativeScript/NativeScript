/**
 * Single-eval node_modules payload for a dev session, served at
 * `DEPS_BUNDLE_PATH`. Its entries are the vendor collection (NativeScript
 * plugin/framework deps from package.json); every bundled file's namespace
 * is registered in `globalThis.__NS_DEPS_MODULES__`, keyed by
 * node_modules-relative path.
 *
 * The dev-session vendor module (`SERVER_VENDOR_PATH`) is a view over this
 * bundle (see `buildDepsVendorRuntimeModule`), so `__nsVendorRegistry` and the
 * require shim resolve package roots into this bundle's realm.
 *
 * Import routing inside the bundle:
 *  - `@nativescript/core[/*]` stays an external bare specifier, resolved by
 *    the device import map (see `depsBundleCoreSpecifiers`).
 *  - `@nativescript/vite` modules stay external at their Vite URL: dev
 *    tooling loads independently of the app dependency closure.
 *  - Dynamic `import()` targets stay external at their Vite URL, so they
 *    evaluate lazily.
 *  - Everything else resolvable is internalized; platform-suffix resolution
 *    (`index.ios.js`) backs up esbuild's resolver. Bare externals are emitted
 *    only for specs with no on-disk resolution at all.
 *
 * A failed esbuild build logs once and the session falls back to the
 * standalone vendor module. `NS_DEPS_PER_MODULE=1` opts out entirely
 * (patch-package workflows editing node_modules).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as esbuild from 'esbuild';
import { initSync as initModuleLexer, parse as parseModule } from 'es-module-lexer';
import type { ViteDevServer } from 'vite';

import { resolvePlatform } from '../../helpers/cli-flags.js';
import { getGlobalDefines, getUserDefineEntries } from '../../helpers/global-defines.js';
import { getProjectFlavor } from '../../helpers/flavor.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { isSolidRuntimePackage, resolveSolidDevEntry } from '../../helpers/solid-runtime.js';
import { createNativeClassEsbuildPlugin } from '../../helpers/nativeclass-esbuild-plugin.js';
import type { Platform } from '../../helpers/platform-types.js';
import { resolveVerboseFlag } from '../../helpers/logging.js';
import { getVitePackageVersion } from '../../helpers/vite-package-version.js';
import { createNodeBuiltinPolyfillEsbuildPlugin, createSolidJsxEsbuildPlugin, createUnicodeRegexEsbuildPlugin, createVendorEsbuildPlugin, createWebpackLoaderStubEsbuildPlugin, createOptionalDependencyStubEsbuildPlugin, createNativeAddonStubEsbuildPlugin } from '../shared/vendor/vendor-esbuild-plugins.js';
import { getVendorManifest, setVendorRuntimeModuleProvider } from '../shared/vendor/registry.js';
import { collectVendorModules } from '../shared/vendor/manifest-collect.js';
import { generatePlatformPolyfills } from '../shared/runtime/platform-polyfills.js';
import { getAngularLinkerFactory, runAngularLinker } from '../frameworks/angular/build/shared-linker.js';
import { getBlockedDeviceNodeModulesReason, resolveCandidateFilePath } from './deps-bundle-specifiers.js';
import { setDeviceModuleHeaders } from './route-helpers.js';
import { viteUrlForFile } from './vite-url.js';
import { builtinModulesEsbuildPlugin } from '../../helpers/builtin-modules.js';

export const DEPS_BUNDLE_PATH = '/__ns_dev__/deps-bundle.mjs';

const NS_CORE_SPEC_RE = /^@nativescript\/core(?:\/|$)/;

/**
 * Whether the deps bundle is disabled. `NS_DEPS_PER_MODULE=1|true` turns it
 * off — the right mode when hand-editing files inside node_modules
 * (patch-package workflows).
 */
export function isDepsPerModuleServingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const v = env.NS_DEPS_PER_MODULE;
	return v === '1' || v === 'true';
}

// ============================================================================
// Entry resolution — `/node_modules/<pkg>` specs → physical files
// ============================================================================

const SCRIPT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i;
const NON_BUNDLEABLE_EXT_RE = /\.(css|scss|sass|less|json|html|vue|svelte)$/i;

/** One bundle entry: its spec, registry key, and source file. */
export interface DepsBundleEntry {
	/** Vendor-collected spec, e.g. `/node_modules/rxjs` or `/node_modules/rxjs/operators`. */
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
 * Extension/index fan-out for a spec, platform-suffixed variants first
 * (`canvas` → `canvas.ios.js` before `canvas.js`, `Paywall` →
 * `Paywall/index.ios.js`).
 */
export function buildDepsCandidateSpecs(spec: string, platform: string): string[] {
	const hasExt = SCRIPT_EXT_RE.test(spec);
	const baseNoExt = hasExt ? spec.replace(SCRIPT_EXT_RE, '') : spec;
	const exts = platformResolveExtensions(platform);
	return [...(hasExt ? [spec] : []), ...exts.map((ext) => baseNoExt + ext), ...exts.map((ext) => baseNoExt + '/index' + ext)];
}

function collectExportsMapTargets(node: unknown, out: string[]): void {
	if (!node) return;
	if (typeof node === 'string') {
		out.push(node);
		return;
	}
	if (typeof node === 'object' && !Array.isArray(node)) {
		// Prefer client/ESM conditions in the order esbuild would.
		for (const cond of ['module', 'import', 'browser', 'default', 'require']) {
			const next = (node as Record<string, unknown>)[cond];
			if (next !== undefined) collectExportsMapTargets(next, out);
		}
	}
}

function resolvePackageFileCandidates(pkgDir: string, candidates: readonly string[], platform: string): string | null {
	const exts = platformResolveExtensions(platform);
	for (const cand of candidates) {
		const abs = path.resolve(pkgDir, cand);
		if (!abs.startsWith(pkgDir + path.sep)) continue;
		if (existsSync(abs) && statSync(abs).isFile()) return abs;
		const base = abs.replace(SCRIPT_EXT_RE, '');
		for (const candidate of [...exts.map((ext) => base + ext), ...exts.map((ext) => base + '/index' + ext)]) {
			if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
		}
	}
	return null;
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
		collectExportsMapTargets(pkg.exports?.['.'] ?? (typeof pkg.exports === 'string' ? pkg.exports : undefined), candidates);
		if (typeof pkg.module === 'string') candidates.push(pkg.module);
		if (typeof pkg.main === 'string') candidates.push(pkg.main);
		candidates.push('index');
		const resolved = resolvePackageFileCandidates(pkgDir, candidates, platform);
		if (resolved) return resolved;
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

/**
 * `resolveSpecToFile`, except that under the Solid flavor a Solid runtime
 * package root resolves to its dev build — the file the routing plugin pins
 * every bare import to. Without the `development` condition its exports map
 * yields the prod build, which cannot pair with solid-js's dev build.
 */
function resolveDepsSpecToFile(spec: string, projectRoot: string, workspaceRoot: string | null, platform: string, flavor: string | undefined): string | null {
	if (flavor === 'solid') {
		const bare = spec.replace(/^\/node_modules\//, '');
		if (isSolidRuntimePackage(bare)) {
			const devEntry = resolveSolidDevEntry(bare, projectRoot);
			if (devEntry) return devEntry.absPath;
		}
	}
	return resolveSpecToFile(spec, projectRoot, workspaceRoot, platform);
}

// Never bundled: `@nativescript/core` must stay the one realm the device
// import map resolves, and `@nativescript/vite` IS the dev tooling — its
// device-served client modules (hot registry, session bootstrap, framework
// strategies) must load independently of the app dependency closure.
// Bundling them would make the HMR client's evaluation depend on the entire
// deps payload (and deadlock the session bootstrap's client evict/re-import).
const NEVER_BUNDLED_SPEC_RE = /^\/node_modules\/@nativescript\/(?:core|vite)(?:\/|$)/;
const NEVER_BUNDLED_KEY_RE = /^node_modules\/@nativescript\/(?:core|vite)\//;

export interface DepsVendorSeed {
	entries: DepsBundleEntry[];
	/** Vendor-manifest specifier (e.g. `@ngrx/store`) → registry key of its entry file. */
	vendorSpecToKey: Map<string, string>;
}

/**
 * Bundle entries from the vendor collection (direct NativeScript-plugin and
 * framework deps from package.json), plus the specifier→key map that backs
 * `__nsVendorRegistry` (see buildDepsVendorRuntimeModule). Skips blocked and
 * never-bundled packages, non-script entries, and symlinked workspace-source
 * packages (app code in disguise, left to the Vite pipeline).
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
		const absPath = resolveDepsSpecToFile(spec, projectRoot, workspaceRoot, platform, flavor);
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

export interface DepsBundleEntryFile {
	key: string;
	absPath: string;
	/**
	 * Registered behind a getter that evaluates the file on first read instead
	 * of an eager `import *`. Transitive files must not run up front: packages
	 * `require()` some of them inside a try/catch, and those may throw by
	 * design on an unsupported platform.
	 */
	lazy?: boolean;
	/** CommonJS (no ESM syntax): its lazy namespace is built the way esbuild's `import *` builds it. */
	cjs?: boolean;
}

/**
 * Synthetic esbuild entry: evaluate the dep closure once and expose every
 * bundled file's live namespace through `globalThis.__NS_DEPS_MODULES__`,
 * keyed by node_modules-relative file path.
 */
export function buildDepsBundleEntryCode(files: readonly DepsBundleEntryFile[]): string {
	const lines: string[] = [];
	files.forEach(({ absPath, lazy }, i) => {
		if (!lazy) lines.push(`import * as __ns_dep_${i}__ from ${JSON.stringify(absPath)};`);
	});
	lines.push('');
	lines.push('const __nsDepsReg = (globalThis.__NS_DEPS_MODULES__ || (globalThis.__NS_DEPS_MODULES__ = Object.create(null)));');
	if (files.some((f) => f.lazy)) {
		// What `import * as ns` gives for a CommonJS module (esbuild's __toESM): its exports as named
		// bindings and itself as `default`, unless it is transpiled ESM (`__esModule`).
		lines.push('function __nsDepsCjsNamespace(m) {');
		lines.push('  const ns = Object.create(null);');
		lines.push("  if (m != null && (typeof m === 'object' || typeof m === 'function')) {");
		lines.push("    for (const k of Object.keys(m)) if (k !== 'default') Object.defineProperty(ns, k, { enumerable: true, get: () => m[k] });");
		lines.push('  }');
		lines.push("  Object.defineProperty(ns, 'default', { enumerable: true, value: m != null && m.__esModule ? m.default : m });");
		lines.push('  return ns;');
		lines.push('}');
		lines.push('function __nsDepsLazy(key, load) {');
		lines.push('  Object.defineProperty(__nsDepsReg, key, {');
		lines.push('    configurable: true,');
		lines.push('    enumerable: true,');
		lines.push('    get() {');
		lines.push('      const ns = load();');
		lines.push('      Object.defineProperty(__nsDepsReg, key, { configurable: true, enumerable: true, writable: true, value: ns });');
		lines.push('      return ns;');
		lines.push('    },');
		lines.push('  });');
		lines.push('}');
	}
	files.forEach(({ key, absPath, lazy, cjs }, i) => {
		if (!lazy) {
			lines.push(`__nsDepsReg[${JSON.stringify(key)}] = __ns_dep_${i}__;`);
		} else if (cjs) {
			lines.push(`__nsDepsLazy(${JSON.stringify(key)}, () => __nsDepsCjsNamespace(require(${JSON.stringify(absPath)})));`);
		} else {
			lines.push(`__nsDepsLazy(${JSON.stringify(key)}, () => require(${JSON.stringify(absPath)}));`);
		}
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
 * Import routing inside the deps bundle:
 *  - `@nativescript/core[/*]` → external bare (device import map).
 *  - Dynamic `import()` targets → external root-relative Vite URL, so they
 *    evaluate lazily. The device-request middleware absolutizes string-literal
 *    dynamic imports in served JavaScript; the device runtime would otherwise
 *    resolve a root-relative dynamic specifier on the filesystem.
 *  - `@nativescript/vite` modules (see NEVER_BUNDLED_SPEC_RE) → external
 *    root-relative Vite URL.
 *  - Solid flavor: bare Solid runtime roots (`solid-js`, `@solidjs/signals`,
 *    …) pin to their dev builds inside the bundle, so it can never pair
 *    solid-js dev with signals prod.
 *  - Everything else internalizes. Bare specs esbuild cannot resolve get
 *    platform-aware resolution (`index.ios.js`-style entries esbuild's
 *    resolver misses); only specs with no on-disk resolution at all stay
 *    external bare.
 */
function createDepsImportRoutingPlugin(projectRoot: string, workspaceRoot: string | null, platform: string, flavor: string | undefined, onDynamicImport?: (absPath: string) => void): esbuild.Plugin {
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
					if (/^https?:\/\//.test(spec)) return { path: spec, external: true };
					const probe = await probeResolve(spec);
					if (probe.errors.length > 0 || !probe.path || probe.external) return probe;
					const key = depsRegistryKeyForFile(probe.path);
					if (!key) return probe;
					if (!NEVER_BUNDLED_KEY_RE.test(key)) onDynamicImport?.(probe.path);
					return { path: viteUrlForFile(probe.path, projectRoot), external: true };
				}
				if (spec.startsWith('.') || spec.startsWith('/') || /^[A-Za-z]:[\\/]/.test(spec)) return undefined;
				if (NODE_BUILTIN_SET.has(spec)) return undefined;
				if (NS_CORE_SPEC_RE.test(spec)) {
					return { path: spec, external: true };
				}
				if (/^@nativescript\/vite(?:\/|$)/.test(spec)) {
					const probe = await probeResolve(spec);
					if (probe.errors.length > 0 || !probe.path || probe.external) return { path: spec, external: true };
					return { path: viteUrlForFile(probe.path, projectRoot), external: true };
				}
				if (flavor === 'solid' && isSolidRuntimePackage(spec)) {
					const pinned = resolveSolidDevEntry(spec, args.resolveDir || projectRoot);
					if (pinned) return { path: pinned.absPath };
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
 * vendor build's `@angular/`-scoped pass: the closure includes partial-
 * compiled LIBRARY fesm files (e.g. nativescript-fonticon/angular), so the
 * bundle must link any node_modules file carrying `ɵɵngDeclare`.
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
	/** Full ESM payload served at `DEPS_BUNDLE_PATH`. */
	code: string;
	/** Registry keys (node_modules-relative file paths) present in the bundle. */
	keys: Set<string>;
	/** Vendor-manifest specifier → registry key (backs __nsVendorRegistry). */
	vendorSpecToKey: Map<string, string>;
	hash: string;
	builtAt: number;
	buildMs: number;
}

const coreSpecifiersByState = new WeakMap<DepsBundleState, string[]>();

/**
 * The `@nativescript/core[/*]` specifiers the bundle imports bare, read from
 * its code so a disk-cache hit yields the same set as a fresh build. Each one
 * needs a device import-map entry.
 */
export function depsBundleCoreSpecifiers(state: DepsBundleState): string[] {
	const cached = coreSpecifiersByState.get(state);
	if (cached) return cached;
	let specs: string[] = [];
	try {
		initModuleLexer();
		const [imports] = parseModule(state.code);
		specs = Array.from(new Set(imports.map((imp) => imp.n).filter((n): n is string => !!n && NS_CORE_SPEC_RE.test(n))));
	} catch (error: any) {
		console.warn(`[ns-deps-bundle] could not read the bundle's @nativescript/core imports; they get no import-map entry: ${error?.message || error}`);
	}
	coreSpecifiersByState.set(state, specs);
	return specs;
}

export interface GenerateDepsBundleOptions {
	projectRoot: string;
	platform: Platform | string;
	mode: 'development' | 'production' | string;
	flavor?: string;
	verbose?: boolean;
}

// ============================================================================
// Disk cache (node_modules/.ns-vite). The key covers the lockfile (dependency
// identity), the entry set, defines, and the vite package version; bump the
// schema whenever the emitted payload or the cached state shape changes. Opt
// out with `NS_DEPS_BUNDLE_NO_DISK_CACHE=1`.
// ============================================================================

const DEPS_BUNDLE_DISK_CACHE_SCHEMA = 5;

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
		if (!Array.isArray(meta.keys) || typeof meta.vendorSpecToKey !== 'object') return null;
		const code = readFileSync(codePath, 'utf-8');
		const hash = createHash('sha1').update(code).digest('hex');
		if (hash !== meta.hash) return null;
		return {
			code,
			keys: new Set(meta.keys.filter((k: unknown): k is string => typeof k === 'string')),
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
				vendorSpecToKey: Object.fromEntries(state.vendorSpecToKey),
			}),
		);
	} catch (error: any) {
		if (verbose) {
			console.warn(`[ns-deps-bundle] disk cache write failed (non-fatal): ${error?.message || error}`);
		}
	}
}

// esbuild `define` takes JSON literals or identifier/member chains only.
const DEFINE_IDENTIFIER_CHAIN_RE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;

function isEsbuildDefineValue(expr: string): boolean {
	if (DEFINE_IDENTIFIER_CHAIN_RE.test(expr)) return true;
	try {
		JSON.parse(expr);
		return true;
	} catch {
		return false;
	}
}

export async function generateDepsBundle(options: GenerateDepsBundleOptions): Promise<DepsBundleState | null> {
	const { projectRoot, platform, mode, flavor, verbose } = options;
	const t0 = Date.now();
	const workspaceRoot = getMonorepoWorkspaceRoot(projectRoot);
	const vendorSeed = resolveDepsEntriesFromVendorCollection(projectRoot, workspaceRoot, String(platform), flavor);
	const entries = vendorSeed.entries;
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
		// App `__FOO__` defines reach dep code here exactly as in bundle.mjs.
		for (const [key, expr] of getUserDefineEntries()) {
			if (out[key] === undefined && isEsbuildDefineValue(expr)) out[key] = expr;
		}
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
	const buildPlugins = (onDynamicImport?: (absPath: string) => void): esbuild.Plugin[] => [
		builtinModulesEsbuildPlugin(),
		createWebpackLoaderStubEsbuildPlugin(),
		createNodeBuiltinPolyfillEsbuildPlugin(projectRoot, NODE_BUILTINS),
		createNativeClassEsbuildPlugin(platform as Platform),
		createVendorEsbuildPlugin(projectRoot),
		createDepsImportRoutingPlugin(projectRoot, workspaceRoot, String(platform), flavor, onDynamicImport),
		...(flavor === 'angular' ? [createDepsAngularLinkerPlugin(projectRoot)] : []),
		...(flavor === 'solid' ? [createSolidJsxEsbuildPlugin(projectRoot)] : []),
		createUnicodeRegexEsbuildPlugin(projectRoot),
		createOptionalDependencyStubEsbuildPlugin(projectRoot),
		createNativeAddonStubEsbuildPlugin(),
	];
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
	// registers every input in the deps registry.
	const entryKeySet = new Set(entries.map((e) => e.key));
	const dynamicTargets = new Set<string>();
	const discover = (absPaths: string[], metafile: boolean) =>
		esbuild.build({
			...sharedBuildOptions,
			stdin: {
				contents: absPaths.map((p) => `import ${JSON.stringify(p)};`).join('\n'),
				resolveDir: projectRoot,
				sourcefile: 'ns-deps-bundle-discovery.ts',
				loader: 'ts',
			},
			metafile,
			plugins: buildPlugins((absPath) => dynamicTargets.add(absPath)),
		});

	const files: DepsBundleEntryFile[] = entries.map(({ key, absPath }) => ({ key, absPath }));
	const register = (metafile: esbuild.Metafile | undefined) => {
		for (const [input, meta] of Object.entries(metafile?.inputs ?? {})) {
			if (input === '<stdin>' || input.includes(':') || !input.includes('node_modules/')) continue;
			const absPath = path.resolve(projectRoot, input);
			if (!existsSync(absPath)) continue;
			const key = depsRegistryKeyForFile(absPath);
			if (!key || entryKeySet.has(key) || NEVER_BUNDLED_KEY_RE.test(key)) continue;
			entryKeySet.add(key);
			// Evaluated on first use, as the dependency graph would, not up front.
			files.push({ key, absPath, lazy: true, cjs: meta.format !== 'esm' });
		}
	};
	const entryPaths = entries.map((e) => e.absPath);
	register((await discover(entryPaths, true)).metafile);

	// Dynamic import() targets and their closures are registered too; a target
	// whose closure fails to build is left out. Probe builds run without
	// `metafile`: esbuild 0.27 throws outside the build promise when a build
	// with `metafile` set fails.
	const discoverOptional = async (targets: string[]) => {
		try {
			await discover(targets, false);
		} catch {
			return false;
		}
		register((await discover(targets, true)).metafile);
		return true;
	};
	const tried = new Set<string>();
	for (;;) {
		const pending = [...dynamicTargets].filter((p) => !tried.has(p) && !entryKeySet.has(depsRegistryKeyForFile(p)!));
		if (!pending.length) break;
		pending.forEach((p) => tried.add(p));
		if (!(await discoverOptional(pending)) && pending.length > 1) {
			for (const target of pending) await discoverOptional([target]);
		}
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
	const code = ['/* @nativescript/vite deps bundle — single-eval node_modules dep closure */', generatePlatformPolyfills(), buildResult.outputFiles[0].text].join('\n');
	const hash = createHash('sha1').update(code).digest('hex');
	const state: DepsBundleState = {
		code,
		keys: new Set(files.map((f) => f.key)),
		vendorSpecToKey: vendorSeed.vendorSpecToKey,
		hash,
		builtAt: Date.now(),
		buildMs: Date.now() - t0,
	};
	if (verbose) {
		console.log(`[ns-deps-bundle] built ${files.length} modules (${entries.length} vendor-seeded entries), ${(code.length / 1024).toFixed(0)}kb in ${state.buildMs}ms (hash ${hash.slice(0, 8)})`);
	}
	if (!diskCacheDisabled && cacheKey) {
		saveDepsBundleToDisk(projectRoot, String(platform), cacheKey, state, verbose);
	}
	return state;
}

/**
 * The dev-session vendor module (`SERVER_VENDOR_PATH`), backed by the deps
 * bundle. The session bootstrap imports it and hands `__nsVendorModuleMap` +
 * `vendorManifest` to `installVendorBootstrap`, which populates
 * `__nsVendorRegistry` — the JS-side sync resolution chain (client HMR
 * helpers, the require shim for CJS interop) then resolves package roots
 * into this bundle's realm. Map entries are emitted for both the collected
 * specifier and its manifest-canonical alias so lookups hit either form.
 * `@nativescript/core` is the one non-deps entry: a bare import the device
 * import map resolves.
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
	lines.push('/* @nativescript/vite vendor module — deps-bundle view */');
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
	 * Stop backing the vendor module with this bundle for the rest of the
	 * session (dependency set changed mid-session). The payload stays servable
	 * for devices that already import it.
	 */
	disableServingForSession(reason: string): void;
	isServingDisabled(): boolean;
}

export type CreateDepsBundleServiceOptions = GenerateDepsBundleOptions;

export function createDepsBundleService(options: CreateDepsBundleServiceOptions): DepsBundleService {
	let state: DepsBundleState | null = null;
	let failed = false;
	let servingDisabled = false;
	let building: Promise<DepsBundleState | null> | null = null;

	const ensureBuilt = async (): Promise<DepsBundleState | null> => {
		if (state) return state;
		if (failed) return null;
		if (!building) {
			building = generateDepsBundle(options)
				.then((built) => {
					state = built;
					return built;
				})
				.catch((error: any) => {
					failed = true;
					console.warn(`[ns-deps-bundle] bundle build FAILED — the vendor module falls back to per-package imports for this session. Set NS_DEPS_PER_MODULE=1 to silence. Error: ${error?.message || error}`);
					return null;
				});
		}
		return building;
	};

	return {
		ensureBuilt,
		getState: () => state,
		hasFailed: () => failed,
		disableServingForSession(reason: string): void {
			if (servingDisabled) return;
			servingDisabled = true;
			console.warn(`[ns-deps-bundle] deps bundle disabled for this session (${reason}) — restart the dev server to rebuild it.`);
		},
		isServingDisabled: () => servingDisabled,
	};
}

let sharedService: DepsBundleService | null = null;
let sharedServiceResolved = false;

/**
 * Process-wide deps bundle service derived from the dev server's config + CLI
 * flags (one dev server per process). Returns null when the bundle is turned
 * off via `NS_DEPS_PER_MODULE=1`.
 */
export function getSharedDepsBundleService(server: ViteDevServer): DepsBundleService | null {
	if (sharedServiceResolved) return sharedService;
	sharedServiceResolved = true;
	if (isDepsPerModuleServingEnabled()) return null;
	const platform: string = resolvePlatform() || 'ios';
	sharedService = createDepsBundleService({
		projectRoot: server.config?.root || process.cwd(),
		platform,
		mode: server.config?.mode === 'development' ? 'development' : 'production',
		flavor: getProjectFlavor(),
		verbose: resolveVerboseFlag(),
	});
	// A null return — not built yet, build failed, or dependency set changed
	// mid-session — falls back to vendorManifestPlugin's own vendor module.
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

/** Serves the deps bundle payload at `DEPS_BUNDLE_PATH`. */
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
