/**
 * Import-map key enumeration for NativeScript HMR.
 *
 * The device import map handed to ns:module `configureLoader()` maps each of
 * these bare specifiers to the device URL of the file Vite's client resolver
 * picks for it (`buildImportMap` in `import-map-route.ts`). Vite's import
 * analysis rewrites every bare specifier in served code, so the map only
 * serves bare specifiers the device resolves itself at runtime, such as a
 * non-literal `import(name)` of a package.
 */

import type { FrameworkServerStrategy } from './framework-strategy.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getNodeBuiltinSpecifiers } from './node-builtins-route.js';

const OMIT_DEVICE_IMPORT_MAP_PACKAGES = new Set(['typescript', 'ts-node', 'esbuild', 'prettier', 'webpack', 'vite', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', '@nativescript/vite', '@nativescript/webpack', '@nativescript/types']);

const OMIT_DEVICE_IMPORT_MAP_PREFIXES = ['@types/', '@babel/', 'babel-', '@rollup/', '@vitejs/', 'vite-plugin-', '@angular-devkit/', '@angular/build', '@analogjs/'];

function isDeviceImportMapPackage(name: string): boolean {
	if (OMIT_DEVICE_IMPORT_MAP_PACKAGES.has(name)) return false;
	return !OMIT_DEVICE_IMPORT_MAP_PREFIXES.some((prefix) => name.startsWith(prefix));
}

export interface ImportMapOptions {
	/** Origin of the Vite dev server (e.g. "http://192.168.1.5:5173"). */
	origin: string;
	/** Framework flavor (vue, angular, solid, typescript) — framework identity. */
	flavor: string;
	/** Directory holding the app's `package.json`. */
	projectRoot: string;
	/**
	 * Active framework strategy. Its `importMapSpecifiers()` and
	 * `volatilePatterns()` supply the framework-specific pieces.
	 */
	strategy?: FrameworkServerStrategy;
}

/**
 * The bare specifiers the device import map carries, in map order:
 * `@nativescript/core`, the package names of the app's `dependencies`, the
 * framework's specifiers, then `node:` builtins. Package subpaths are never
 * keys.
 */
export function collectImportMapSpecifiers(options: ImportMapOptions): string[] {
	const specifiers = new Set<string>(['@nativescript/core']);

	for (const name of readDirectDependencies(options.projectRoot)) {
		if (isDeviceImportMapPackage(name)) specifiers.add(name);
	}

	for (const specifier of options.strategy?.importMapSpecifiers?.() ?? []) {
		specifiers.add(specifier);
	}

	for (const specifier of getNodeBuiltinSpecifiers()) {
		specifiers.add(specifier);
	}

	return Array.from(specifiers);
}

// Read per request, so an edited `package.json` counts without a restart.
function readDirectDependencies(projectRoot: string): string[] {
	try {
		const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8')) as { dependencies?: Record<string, unknown> };
		return pkg.dependencies && typeof pkg.dependencies === 'object' ? Object.keys(pkg.dependencies) : [];
	} catch {
		return [];
	}
}

/**
 * URL substrings the runtime drops from its registry before every dynamic
 * import of a matching URL, so each import re-fetches. Only the strategy's
 * (e.g. Angular's `/@ng/component`, whose per-save `t` param would otherwise
 * leave one stale registry entry behind per save).
 */
export function getVolatilePatterns(strategy?: FrameworkServerStrategy): string[] {
	return [...(strategy?.volatilePatterns?.() ?? [])];
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
