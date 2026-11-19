/**
 * Import-map key enumeration for NativeScript HMR.
 *
 * The device import map handed to ns:module `configureLoader()` maps each of
 * these bare specifiers to the device URL of the file Vite's client resolver
 * picks for it (`buildImportMap` in `import-map-route.ts`). This module
 * collects the base key set: vendor roots and their aliases,
 * `@nativescript/core`, `node:` builtins, framework entries, and every
 * installed package root. The only subpath keys are the `@nativescript/core`
 * subpaths the deps bundle imports, which the route adds.
 */

import type { FrameworkServerStrategy } from './framework-strategy.js';
import { getVendorManifest, listVendorModules } from '../shared/vendor/registry.js';
import { readdirSync, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { getProjectRootPath } from '../../helpers/project.js';
import { getNodeBuiltinSpecifiers } from './node-builtins-route.js';

type DeviceImportMapExposure = 'full' | 'prefix-only' | 'omit';

const OMIT_DEVICE_IMPORT_MAP_PACKAGES = new Set(['typescript', 'ts-node', 'esbuild', 'prettier', 'webpack', 'vite', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', '@nativescript/webpack', '@nativescript/types']);

const OMIT_DEVICE_IMPORT_MAP_PREFIXES = ['@types/', '@babel/', 'babel-', '@rollup/', '@vitejs/', 'vite-plugin-', '@angular-devkit/', '@angular/build', '@analogjs/'];

// Packages imported only through subpaths: the root gets no entry.
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

export interface ImportMapOptions {
	/** Origin of the Vite dev server (e.g. "http://192.168.1.5:5173"). */
	origin: string;
	/** Framework flavor (vue, angular, solid, typescript) — framework identity. */
	flavor: string;
	/**
	 * Active framework strategy. Its `importMapSpecifiers()` and
	 * `volatilePatterns()` supply the framework-specific pieces.
	 */
	strategy?: FrameworkServerStrategy;
}

/**
 * The bare specifiers the device import map carries, in map order: vendor
 * roots, vendor aliases whose canonical package is mapped, `@nativescript/core`,
 * `node:` builtins, framework entries, then every installed package root.
 * Core subpaths are left out, even when the vendor manifest lists them.
 */
export function collectImportMapSpecifiers(options: ImportMapOptions): string[] {
	const { strategy } = options;
	const manifest = getVendorManifest();
	const specifiers = new Set<string>();
	const isCore = (spec: string) => spec === '@nativescript/core' || spec.startsWith('@nativescript/core/');

	if (manifest) {
		for (const specifier of listVendorModules()) {
			if (isCore(specifier)) continue;
			specifiers.add(specifier);
		}
		if (manifest.aliases) {
			for (const [alias, canonical] of Object.entries(manifest.aliases)) {
				if (isCore(alias)) continue;
				if (specifiers.has(canonical)) specifiers.add(alias);
			}
		}
	}

	specifiers.add('@nativescript/core');

	for (const specifier of getNodeBuiltinSpecifiers()) {
		specifiers.add(specifier);
	}

	for (const specifier of strategy?.importMapSpecifiers?.() ?? []) {
		specifiers.add(specifier);
	}

	for (const name of discoverInstalledPackages()) {
		specifiers.add(name);
	}

	return Array.from(specifiers);
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
 * `configureLoader({ canonicalization })`. Device module URLs are Vite's own,
 * keyed exactly as a browser keys them (`t` and `import` are identity), so
 * there is no query-normalizing prefix. `preserveQueryFor` carries the
 * strategy's query-is-identity paths (Angular's `…/@ng/component?c=…&t=…`);
 * the runtime matches them as path substrings, ahead of any prefix.
 */
export function getCanonicalization(strategy?: FrameworkServerStrategy): { preserveQueryFor: string[] } {
	return { preserveQueryFor: strategy?.preserveQueryPaths?.() ?? [] };
}

/**
 * The specifiers, volatile patterns and canonicalization vocabulary behind the
 * config object ns:module `configureLoader()` expects.
 */
export function buildRuntimeConfig(options: ImportMapOptions): {
	specifiers: string[];
	volatilePatterns: string[];
	canonicalization: ReturnType<typeof getCanonicalization>;
} {
	return {
		specifiers: collectImportMapSpecifiers(options),
		volatilePatterns: getVolatilePatterns(options.strategy),
		canonicalization: getCanonicalization(options.strategy),
	};
}

/** Installed package roots that get a device import-map entry. */
function discoverInstalledPackages(): string[] {
	let projectRoot: string;
	try {
		projectRoot = getProjectRootPath();
	} catch {
		return [];
	}
	const nodeModulesDir = resolve(projectRoot, 'node_modules');
	if (!existsSync(nodeModulesDir)) return [];
	// The names come from a per-session cache so the directory sweep runs once
	// per dev server, not on every import-map request.
	return getInstalledPackageNames(nodeModulesDir).filter((name) => getDeviceImportMapExposure(name) === 'full');
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
