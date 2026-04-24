/**
 * Import Map Generator for NativeScript HMR
 *
 * Generates an import map that the iOS/Android runtime consumes via
 * __nsConfigureRuntime(). This is the single source of truth for module
 * resolution on the device.
 *
 * Resolution strategy:
 *   Vendor modules (direct project deps bundled by esbuild) → ns-vendor://
 *     Only EXACT specifier entries — no trailing-slash prefixes.
 *     Subpaths of vendor packages (e.g., solid-js/store) are NOT vendor-
 *     resolved; they fall through to HTTP trailing-slash prefixes below.
 *   @nativescript/core → HTTP bridge URL (/ns/core)
 *   All other npm packages (transitive deps, etc.) → HTTP URL (/ns/m/)
 *     Both exact AND trailing-slash prefix entries, so subpath imports
 *     like @nativescript/tanstack-router/solid resolve correctly via HTTP.
 *
 * The runtime's NormalizeViteSpecifier() extracts bare package names from
 * Vite-rewritten paths (e.g. /node_modules/.vite/deps/solid-js.js → solid-js),
 * then looks them up in this map. This ensures ALL imports — regardless of
 * how Vite rewrites them — resolve through a single deterministic path.
 */

import type { VendorManifest } from '../shared/vendor/manifest.js';
import { getVendorManifest, listVendorModules } from '../shared/vendor/registry.js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { getProjectRootPath } from '../../helpers/project.js';
import { buildCoreUrl } from '../../helpers/ns-core-url.js';

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
	/** Framework flavor (vue, angular, solid, typescript) */
	flavor: string;
	/** Additional entries to add to the import map */
	extraEntries?: Record<string, string>;
}

/**
 * Generate an import map from the current vendor manifest.
 *
 * Vendor modules are mapped to ns-vendor:// protocol URLs, which the
 * native runtime resolves from the in-memory vendor registry (populated
 * by vendor-bootstrap.ts).
 *
 * IMPORTANT: Vendor entries are EXACT only (no trailing-slash prefixes).
 * The vendor bundle contains only root entry points. Subpath imports like
 * solid-js/store or @nativescript/tanstack-router/solid are separate entry
 * points with different exports — they must NOT resolve to the root vendor
 * module. Instead, they fall through to the HTTP trailing-slash prefix
 * entries from discoverInstalledPackages().
 *
 * @nativescript/core is mapped to the HTTP bridge endpoint.
 * Everything else falls through to the runtime's normal resolution.
 */
export function generateImportMap(options: ImportMapOptions): ImportMap {
	const { origin, flavor, extraEntries } = options;
	const manifest = getVendorManifest();
	const imports: Record<string, string> = {};

	if (manifest) {
		// Map vendor modules to ns-vendor:// — EXACT entries only.
		// No trailing-slash prefixes: subpaths must resolve via HTTP, not vendor.
		const vendorModules = listVendorModules();
		for (const specifier of vendorModules) {
			imports[specifier] = `ns-vendor://${specifier}`;
		}

		// Map aliases from the manifest (e.g., "solid-js/web" → ns-vendor://solid-js)
		if (manifest.aliases) {
			for (const [alias, canonical] of Object.entries(manifest.aliases)) {
				if (!imports[alias] && imports[canonical]) {
					imports[alias] = imports[canonical];
				}
			}
		}
	}

	// @nativescript/core → bridge endpoint (canonical URL generator, see
	// Invariant A in HMR_CORE_REALM_DETERMINISTIC_PLAN.md). The trailing-
	// slash entry intentionally uses the same generator so subpath imports
	// resolve via `${origin}/ns/core/<sub>`.
	imports['@nativescript/core'] = buildCoreUrl(origin);
	imports['@nativescript/core/'] = `${buildCoreUrl(origin)}/`;

	// Add framework-specific entries
	addFrameworkEntries(imports, origin, flavor);

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
export function getVolatilePatterns(flavor: string): string[] {
	const patterns: string[] = [];

	// Version query params (used by HMR for cache busting)
	patterns.push('?v=');
	patterns.push('&v=');

	// Framework-specific volatile patterns
	switch (flavor) {
		case 'vue':
			// Vue SFC endpoints are volatile (change on every edit)
			patterns.push('/@ns/sfc/');
			patterns.push('/@ns/asm/');
			break;
		case 'angular':
			// Angular template/style URLs may change on edit
			patterns.push('/@ns/asm/');
			break;
	}

	return patterns;
}

/**
 * Serialize the import map + volatile patterns into the config object
 * that __nsConfigureRuntime() expects.
 */
export function buildRuntimeConfig(options: ImportMapOptions): {
	importMap: string;
	volatilePatterns: string[];
} {
	const importMap = generateImportMap(options);
	const volatilePatterns = getVolatilePatterns(options.flavor);

	return {
		importMap: JSON.stringify(importMap),
		volatilePatterns,
	};
}

function addFrameworkEntries(imports: Record<string, string>, _origin: string, flavor: string): void {
	switch (flavor) {
		case 'vue':
			// nativescript-vue should resolve from vendor if available
			if (!imports['nativescript-vue']) {
				imports['nativescript-vue'] = `ns-vendor://nativescript-vue`;
			}
			if (!imports['vue']) {
				imports['vue'] = `ns-vendor://vue`;
			}
			break;
		case 'solid':
			// Solid runtime root should resolve from vendor
			if (!imports['solid-js']) {
				imports['solid-js'] = `ns-vendor://solid-js`;
			}
			// No trailing-slash prefix — subpaths like solid-js/store,
			// solid-js/jsx-runtime resolve via HTTP from discoverInstalledPackages()
			break;
	}
}

/**
 * Scan the project's node_modules to discover ALL installed packages and
 * add import map entries. Vendor packages get only trailing-slash prefix
 * entries (their exact entries are already set to ns-vendor://). Non-vendor
 * packages get both exact and trailing-slash entries.
 *
 * The trailing-slash prefix entries are critical: they enable subpath imports
 * like solid-js/store or @nativescript/tanstack-router/solid to resolve via
 * HTTP, even when the root package is vendored.
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
		// Add exact entry only if not already mapped (vendor packages already have ns-vendor:// exact entries)
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
						addPackage(`${name}/${scopeEntry.name}`);
					}
				} catch {}
			} else {
				addPackage(name);
			}
		}
	} catch {}
}
