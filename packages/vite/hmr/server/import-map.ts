/**
 * Import Map Generator for NativeScript HMR
 *
 * Generates an import map that the iOS/Android runtime consumes via
 * ns:runtime configureRuntime(). This is the single source of truth for module
 * resolution on the device.
 *
 * Resolution strategy:
 *   Every bare npm specifier → HTTP URL (`/ns/m/node_modules/<pkg>`).
 *     Package roots in the vendor collection get EXACT entries whose served
 *     body is a deps-bundle shim (see deps-bundle.ts), so "many specifiers,
 *     one instance" holds via the single bundle realm — no custom URL scheme.
 *   @nativescript/core → HTTP bridge URL (/ns/core)
 *   Trailing-slash prefix entries cover subpath imports
 *     (e.g. @nativescript/tanstack-router/solid) for every package.
 *
 * The runtime's NormalizeViteSpecifier() extracts bare package names from
 * Vite-rewritten paths (e.g. /node_modules/.vite/deps/solid-js.js → solid-js),
 * then looks them up in this map. This ensures ALL imports — regardless of
 * how Vite rewrites them — resolve through a single deterministic path.
 */

import type { VendorManifest } from '../shared/vendor/manifest.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { getVendorManifest, listVendorModules } from '../shared/vendor/registry.js';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { getProjectRootPath } from '../../helpers/project.js';
import { buildCoreUrl } from '../../helpers/ns-core-url.js';
import { getNodeBuiltinImportMapEntries } from './node-builtins-route.js';

type DeviceImportMapExposure = 'full' | 'prefix-only' | 'omit';

const OMIT_DEVICE_IMPORT_MAP_PACKAGES = new Set(['typescript', 'ts-node', 'esbuild', 'prettier', 'webpack', 'vite', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', '@nativescript/webpack', '@nativescript/types']);

const OMIT_DEVICE_IMPORT_MAP_PREFIXES = ['@types/', '@babel/', 'babel-', '@rollup/', '@vitejs/', 'vite-plugin-', '@angular-devkit/', '@angular/build', '@analogjs/'];

const PREFIX_ONLY_DEVICE_IMPORT_MAP_PACKAGES = new Set(['@nativescript/vite']);

function getDeviceImportMapExposure(name: string): DeviceImportMapExposure {
	if (PREFIX_ONLY_DEVICE_IMPORT_MAP_PACKAGES.has(name)) {
		return 'prefix-only';
	}

	if (OMIT_DEVICE_IMPORT_MAP_PACKAGES.has(name)) {
		return 'omit';
	}

	for (const prefix of OMIT_DEVICE_IMPORT_MAP_PREFIXES) {
		if (name.startsWith(prefix)) {
			return 'omit';
		}
	}

	return 'full';
}

export interface ImportMap {
	imports: Record<string, string>;
}

export interface ImportMapOptions {
	/** Origin of the Vite dev server (e.g. "http://192.168.1.5:5173") */
	origin: string;
	/** Framework flavor (vue, angular, solid, typescript) — framework identity. */
	flavor: string;
	/**
	 * Active framework strategy. Its `importMapEntries(origin)` +
	 * `volatilePatterns()` hooks supply the framework-specific pieces of the
	 * import map and volatile-pattern list.
	 * Optional: when omitted, the map/patterns carry only the shared
	 * vendor/core/HTTP entries.
	 */
	strategy?: FrameworkServerStrategy;
	/** Additional entries to add to the import map */
	extraEntries?: Record<string, string>;
}

/**
 * Generate an import map from the current vendor manifest.
 *
 * Vendor package roots map to `${origin}/ns/m/node_modules/<pkg>` — served
 * as deps-bundle shims (thin re-exports out of `__NS_DEPS_MODULES__`, the
 * single-evaluation bundle realm), so every specifier of a package resolves
 * to one instance. Manifest aliases collapse onto their canonical package's
 * URL, preserving the "many specifiers, one instance" semantics.
 *
 * IMPORTANT: Vendor entries are EXACT only (no trailing-slash prefixes).
 * Subpath imports like solid-js/store or @nativescript/tanstack-router/solid
 * are separate entry points with different exports — they must NOT resolve
 * to the package root. They fall through to the HTTP trailing-slash prefix
 * entries from discoverInstalledPackages().
 *
 * @nativescript/core is mapped to the HTTP bridge endpoint.
 * Everything else falls through to the runtime's normal resolution.
 */
export function generateImportMap(options: ImportMapOptions): ImportMap {
	const { origin, strategy, extraEntries } = options;
	const manifest = getVendorManifest();
	const imports: Record<string, string> = {};

	if (manifest) {
		// EXACT entries only for vendor roots — subpaths resolve via the
		// trailing-slash HTTP prefixes added below.
		//
		// IMPORTANT: `@nativescript/core` and any `@nativescript/core/<sub>` are
		// deliberately routed through the HTTP bridge (`${origin}/ns/core/...`),
		// never through `/ns/m/node_modules/`. The core bridge is the canonical
		// source for every `Application`, `View`, `Frame`, etc. instance —
		// a second copy of core produces the classic
		// `vendorApplicationSame: false` realm split (different
		// `globalThis.Application` than the one the iOS/Android hooks patched)
		// and HMR placeholder finalize stalls. The dev server normalizes
		// platform suffixes (see `normalizeCoreSub` in `ns-core-url.ts`) so
		// `@nativescript/core/ui/frame/activity.android` → bridge URL
		// `/ns/core/ui/frame/activity.android` → served from the
		// platform-specific `.android.ts` source.
		const vendorModules = listVendorModules();
		for (const specifier of vendorModules) {
			if (specifier === '@nativescript/core' || specifier.startsWith('@nativescript/core/')) {
				continue;
			}
			imports[specifier] = `${origin}/ns/m/node_modules/${specifier}`;
		}

		// Map aliases from the manifest (e.g., "solid-js/web" → solid-js's URL)
		if (manifest.aliases) {
			for (const [alias, canonical] of Object.entries(manifest.aliases)) {
				// Same single-realm reason as above.
				if (alias === '@nativescript/core' || alias.startsWith('@nativescript/core/')) {
					continue;
				}
				if (!imports[alias] && imports[canonical]) {
					imports[alias] = imports[canonical];
				}
			}
		}
	}

	// @nativescript/core → bridge endpoint (canonical URL generator).
	// The trailing-slash entry intentionally uses the same generator so
	// subpath imports resolve via `${origin}/ns/core/<sub>`.
	imports['@nativescript/core'] = buildCoreUrl(origin);
	imports['@nativescript/core/'] = `${buildCoreUrl(origin)}/`;

	// `node:` builtins → dev-served shims (`/ns/node/<name>`, see
	// node-builtins-route.ts). During a dev session these map entries
	// shadow the runtime's baked-in polyfill branch, keeping the shim
	// vocabulary server-owned; outside dev sessions the native fallback
	// still applies.
	Object.assign(imports, getNodeBuiltinImportMapEntries(origin));

	// Add framework-specific entries (owned by the active strategy). Merge
	// CONDITIONALLY (existing entries win) so Vue's vendor entries (set above)
	// take precedence over the hook's fallback targets, while Solid's
	// `solid-js` (externalized from vendor, so unset here) is added.
	// Insertion order is significant for the generated map.
	const frameworkEntries = strategy?.importMapEntries?.(origin);
	if (frameworkEntries) {
		for (const [specifier, target] of Object.entries(frameworkEntries)) {
			if (!imports[specifier]) {
				imports[specifier] = target;
			}
		}
	}

	// Scan installed packages and add HTTP URL entries for ALL packages
	// (including vendor ones for their subpath imports).
	discoverInstalledPackages(imports, origin);

	// Merge extra entries (user-provided or from framework strategies)
	if (extraEntries) {
		Object.assign(imports, extraEntries);
	}

	return { imports };
}

/**
 * Get volatile URL patterns for the current framework.
 * These patterns tell the runtime to always re-fetch matching URLs
 * instead of using cached modules.
 */
export function getVolatilePatterns(strategy?: FrameworkServerStrategy): string[] {
	const patterns: string[] = [];

	// Version query params (used by HMR for cache busting)
	patterns.push('?v=');
	patterns.push('&v=');

	// Framework-specific volatile patterns (owned by the active strategy —
	// e.g. Angular's `/@ng/component`, whose per-save `t` param would
	// otherwise leave one stale registry entry behind per save).
	const frameworkPatterns = strategy?.volatilePatterns?.();
	if (frameworkPatterns) {
		patterns.push(...frameworkPatterns);
	}

	return patterns;
}

/**
 * The URL canonicalization vocabulary handed to the runtime via
 * `configureRuntime({ canonicalization })`. The runtime owns the *mechanism*
 * (fragment strip, cache-buster param drop, param sort — it keys the module
 * registry inside the engine's synchronous resolve walk); this server owns
 * the *vocabulary*, because every name in it is a route this server defines:
 *
 * - `stripParams`: Vite's `import` marker and `t`/`v` cache stamps — pure
 *   cache busters that must not create distinct module identities.
 * - `forPathPrefixes`: the dev endpoints under which query normalization is
 *   safe. Everything else (public/remote URLs) keeps its query verbatim,
 *   since for general HTTP modules the query can be identity (auth,
 *   content versioning, routing).
 * - `preserveQueryFor`: strategy-owned paths whose query IS the module
 *   identity (e.g. Angular's `/@ng/component?c=<id>&t=<ts>` — each `t` is a
 *   distinct metadata recompile).
 */
export function getCanonicalization(strategy?: FrameworkServerStrategy): {
	stripParams: string[];
	forPathPrefixes: string[];
	preserveQueryFor: string[];
} {
	return {
		stripParams: ['t', 'v', 'import'],
		forPathPrefixes: ['/ns/', '/node_modules/.vite/', '/@id/', '/@fs/'],
		preserveQueryFor: strategy?.preserveQueryPaths?.() ?? [],
	};
}

/**
 * Serialize the import map + volatile patterns + canonicalization vocabulary
 * into the config object that ns:runtime configureRuntime() expects.
 */
export function buildRuntimeConfig(options: ImportMapOptions): {
	importMap: string;
	volatilePatterns: string[];
	canonicalization: ReturnType<typeof getCanonicalization>;
} {
	const importMap = generateImportMap(options);
	const volatilePatterns = getVolatilePatterns(options.strategy);
	const canonicalization = getCanonicalization(options.strategy);

	return {
		importMap: JSON.stringify(importMap),
		volatilePatterns,
		canonicalization,
	};
}

/**
 * Scan the project's node_modules to discover ALL installed packages and
 * add import map entries. Vendor packages get only trailing-slash prefix
 * entries (their exact entries were set above). Non-vendor packages get
 * both exact and trailing-slash entries.
 *
 * The trailing-slash prefix entries are critical: they enable subpath imports
 * like solid-js/store or @nativescript/tanstack-router/solid to resolve via
 * HTTP, even when the root package has a deps-shim exact entry.
 */
function discoverInstalledPackages(imports: Record<string, string>, origin: string): void {
	let projectRoot: string;
	try {
		projectRoot = getProjectRootPath();
	} catch {
		return;
	}
	const nodeModulesDir = resolve(projectRoot, 'node_modules');
	if (!existsSync(nodeModulesDir)) return;

	const addPackage = (name: string) => {
		const exposure = getDeviceImportMapExposure(name);
		if (exposure === 'omit') return;
		// Add exact entry only if not already mapped (vendor packages already have exact entries)
		if (exposure === 'full' && !imports[name]) {
			imports[name] = `${origin}/ns/m/node_modules/${name}`;
		}
		// ALWAYS add trailing-slash prefix for HTTP subpath resolution,
		// even for vendor packages. The vendor bundle only covers the root
		// entry point — subpaths like solid-js/store or @nativescript/tanstack-router/solid
		// are separate entry points that must resolve via HTTP.
		if (!imports[name + '/']) {
			imports[name + '/'] = `${origin}/ns/m/node_modules/${name}/`;
		}
	};

	// Replay the (cheap, in-memory) addPackage step for every installed package
	// name. The names themselves come from a per-session cache so the directory
	// sweep below runs once per dev server, not on every `/ns/import-map.json`
	// request (a hot, per-boot route).
	for (const name of getInstalledPackageNames(nodeModulesDir)) {
		addPackage(name);
	}
}

// Cache the discovered package-name list per node_modules dir, invalidated when
// the directory's mtime changes (an install/remove of a top-level entry). Avoids
// a full `readdirSync` sweep (+ per-scope readdir) on every import-map request.
let installedPackageNamesCache: { dir: string; mtimeMs: number; names: string[] } | null = null;

function getInstalledPackageNames(nodeModulesDir: string): string[] {
	// mtime guards the cache; if it can't be read (e.g. a mocked fs in tests),
	// fall back to sweeping every call (original behavior) rather than caching.
	let mtimeMs: number | null = null;
	try {
		mtimeMs = statSync(nodeModulesDir).mtimeMs;
	} catch {
		mtimeMs = null;
	}
	if (mtimeMs !== null && installedPackageNamesCache && installedPackageNamesCache.dir === nodeModulesDir && installedPackageNamesCache.mtimeMs === mtimeMs) {
		return installedPackageNamesCache.names;
	}
	const names: string[] = [];
	try {
		const entries = readdirSync(nodeModulesDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
			const name = entry.name;
			if (name.startsWith('.')) continue;

			if (name.startsWith('@')) {
				// Scoped packages: read @scope/ directory
				const scopeDir = join(nodeModulesDir, name);
				try {
					const scopeEntries = readdirSync(scopeDir, { withFileTypes: true });
					for (const scopeEntry of scopeEntries) {
						if (!scopeEntry.isDirectory() && !scopeEntry.isSymbolicLink()) continue;
						if (scopeEntry.name.startsWith('.')) continue;
						names.push(`${name}/${scopeEntry.name}`);
					}
				} catch {}
			} else {
				names.push(name);
			}
		}
	} catch {
		return [];
	}
	if (mtimeMs !== null) {
		installedPackageNamesCache = { dir: nodeModulesDir, mtimeMs, names };
	}
	return names;
}
