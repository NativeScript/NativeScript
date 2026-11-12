import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Solid runtime packages whose root entry ships a separate dev build. In dev
 * they must resolve to their dev builds together: Solid 2's `solid-js` dev
 * build reads `DEV` from `@solidjs/signals` at module load, and the signals
 * prod build exports it as `undefined`.
 *
 * Deliberately narrow — enabling the `development` condition globally breaks
 * packages whose dev entries are environment-ambiguous stubs (see the
 * conditions note in hmr/shared/vendor/manifest.ts).
 */
export const SOLID_RUNTIME_PACKAGES: readonly string[] = ['solid-js', '@solidjs/signals', '@solidjs/universal', '@solidjs/web'];

/** Pre-exports-map Solid layout; used when `exports` names no dev build. */
const LEGACY_SOLID_JS_DEV_ENTRY = 'dist/dev.js';

const CLIENT_CONDITIONS = ['browser', 'import', 'default'] as const;

export interface SolidDevEntry {
	/** Absolute path of the dev build file. */
	absPath: string;
	/** Path relative to the package dir, e.g. `dist/solid.dev.js`. */
	relPath: string;
}

const devEntryCache = new Map<string, SolidDevEntry | null>();

export function isSolidRuntimePackage(spec: string): boolean {
	return SOLID_RUNTIME_PACKAGES.includes(spec);
}

function findPackageDir(pkgName: string, fromDir: string): string | null {
	let dir = path.resolve(fromDir);
	while (true) {
		const candidate = path.join(dir, 'node_modules', ...pkgName.split('/'));
		if (existsSync(path.join(candidate, 'package.json'))) return candidate;
		const parent = path.dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

// Only accepts targets reached through a `development` key, so a package whose
// map has no dev build yields null instead of silently returning its prod file.
function pickDevTarget(node: unknown, underDevelopment: boolean): string | null {
	if (typeof node === 'string') return underDevelopment ? node : null;
	if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
	const map = node as Record<string, unknown>;
	for (const cond of ['development', ...CLIENT_CONDITIONS]) {
		if (!(cond in map)) continue;
		const hit = pickDevTarget(map[cond], underDevelopment || cond === 'development');
		if (hit) return hit;
	}
	return null;
}

function rootExportsNode(exportsField: unknown): unknown {
	if (!exportsField || typeof exportsField !== 'object' || Array.isArray(exportsField)) return exportsField;
	const map = exportsField as Record<string, unknown>;
	const isSubpathMap = Object.keys(map).some((key) => key.startsWith('.'));
	return isSubpathMap ? map['.'] : map;
}

/**
 * Resolves the dev build of a Solid runtime package's root entry from the
 * package's own `exports` map (searching `node_modules` upward from
 * `fromDir`), so it tracks Solid's file layout across 1.x and 2.x releases.
 * Returns null when the package is not installed or ships no dev build.
 */
export function resolveSolidDevEntry(pkgName: string, fromDir: string): SolidDevEntry | null {
	if (!isSolidRuntimePackage(pkgName)) return null;
	const pkgDir = findPackageDir(pkgName, fromDir);
	if (!pkgDir) return null;
	const cached = devEntryCache.get(pkgDir);
	if (cached !== undefined) return cached;

	let result: SolidDevEntry | null = null;
	try {
		const pkgJson = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
		const candidates: string[] = [];
		const fromExports = pickDevTarget(rootExportsNode(pkgJson.exports), false);
		if (fromExports) candidates.push(fromExports);
		if (pkgName === 'solid-js') candidates.push(LEGACY_SOLID_JS_DEV_ENTRY);
		for (const candidate of candidates) {
			const absPath = path.resolve(pkgDir, candidate);
			if (!absPath.startsWith(pkgDir + path.sep) || !existsSync(absPath)) continue;
			result = { absPath, relPath: path.relative(pkgDir, absPath).split(path.sep).join('/') };
			break;
		}
	} catch {
		result = null;
	}
	devEntryCache.set(pkgDir, result);
	return result;
}

/** `solid-js` dev entry relative to its package dir; falls back to the legacy layout. */
export function getSolidJsDevEntryRelPath(fromDir: string): string {
	return resolveSolidDevEntry('solid-js', fromDir)?.relPath ?? LEGACY_SOLID_JS_DEV_ENTRY;
}

/** `/ns/m/node_modules/<pkg>/<dev entry>` for a Solid runtime package, or null. */
export function getSolidDevEntryNsmPath(pkgName: string, fromDir: string): string | null {
	if (pkgName === 'solid-js') return `/ns/m/node_modules/solid-js/${getSolidJsDevEntryRelPath(fromDir)}`;
	const entry = resolveSolidDevEntry(pkgName, fromDir);
	return entry ? `/ns/m/node_modules/${pkgName}/${entry.relPath}` : null;
}

export function clearSolidDevEntryCache(): void {
	devEntryCache.clear();
}
