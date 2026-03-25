import type { VendorManifest } from './manifest.js';

interface VendorRegistry {
	manifest: VendorManifest | null;
	hash: string | null;
}

const registry: VendorRegistry = {
	manifest: null,
	hash: null,
};

export function registerVendorManifest(manifest: VendorManifest) {
	registry.manifest = manifest;
	registry.hash = manifest.hash;
}

export function clearVendorManifest() {
	registry.manifest = null;
	registry.hash = null;
}

export function getVendorManifest(): VendorManifest | null {
	return registry.manifest;
}

export function getVendorHash(): string | null {
	return registry.hash;
}

export function isVendorSpecifier(specifier: string | null | undefined): boolean {
	if (!specifier) {
		return false;
	}
	return resolveVendorSpecifier(specifier) !== null;
}

export function resolveVendorSpecifier(specifier: string): string | null {
	const manifest = registry.manifest;
	if (!manifest) {
		return null;
	}

	// Step 1: Try exact specifier (after query/hash stripping) as-is.
	// This catches cases where the specifier is already a bare package name.
	const cleaned = specifier.replace(/[?#].*$/, '').replace(/\\/g, '/');
	if (cleaned && manifest.modules[cleaned]) {
		return cleaned;
	}
	// Check exact alias match (e.g., "solid-js/web" → "solid-js")
	const exactAlias = manifest.aliases?.[cleaned];
	if (exactAlias && manifest.modules[exactAlias]) {
		return exactAlias;
	}

	// Step 2: Normalize to root package name (strips subpaths).
	const normalized = normalizeSpecifier(specifier);
	if (!normalized) {
		return null;
	}

	// If normalizeSpecifier didn't change anything, we already checked above.
	if (normalized === cleaned) {
		return null;
	}

	// Step 3: Check if the normalized root package is in the manifest.
	if (!manifest.modules[normalized]) {
		// Root package not in manifest — check alias of normalized form
		const alias = manifest.aliases?.[normalized];
		if (alias && manifest.modules[alias]) {
			return alias;
		}
		return null;
	}

	// Step 4: The root package IS in the manifest, but the original specifier
	// had a subpath. We must distinguish:
	//   - File/dist paths (solid-js/dist/dev.js) → resolve to root vendor
	//   - Entry-point subpaths (solid-js/store) → DO NOT resolve (separate entry)
	//
	// If we collapse "solid-js/store" → "solid-js", the vendor module won't
	// have createStore, produce, etc. Same for @nativescript/tanstack-router/solid
	// which has different exports than the root entry.
	//
	// Extract subpath relative to the resolved package name, not from the raw specifier.
	// This handles /node_modules/ paths, .vite/deps/ paths, and bare specifiers.
	const normalizedIdx = cleaned.indexOf(normalized);
	const afterPackage = normalizedIdx !== -1 ? cleaned.slice(normalizedIdx + normalized.length) : '';
	// afterPackage is e.g., "/dist/dev.js" or "/store" or "/store/dist/store.js" or ""
	const subpath = afterPackage.startsWith('/') ? afterPackage.slice(1) : afterPackage;

	if (subpath && !isFileSubpath(subpath)) {
		// This is an entry-point subpath (e.g., /store, /web, /solid).
		// Check if there's an alias for the full path before giving up.
		const entrySubpath = subpath.split('/')[0];
		const fullAlias = manifest.aliases?.[`${normalized}/${entrySubpath}`];
		if (fullAlias && manifest.modules[fullAlias]) {
			return fullAlias;
		}
		// Separate entry point — not covered by the root vendor module
		return null;
	}

	// File/dist subpath or no subpath — resolves to the root vendor module
	return normalized;
}

/**
 * Returns true if a subpath (the portion after the package name) looks like
 * a file/dist path within the ROOT package entry (internal implementation detail),
 * rather than a separate entry-point export (different public API).
 *
 * The key distinction is the FIRST segment:
 *   dist/dev.js     → first segment "dist" → file path (within root entry)
 *   src/index.ts    → first segment "src"  → file path (within root entry)
 *   store/dist/x.js → first segment "store" → entry point (separate package API)
 *   web             → first segment "web"   → entry point (separate package API)
 *   index.js        → single segment with extension → file path
 */
function isFileSubpath(subpath: string): boolean {
	const firstSegment = subpath.split('/')[0];
	// Starts with a known build/dist directory segment → file path
	const distDirs = new Set(['dist', 'src', 'lib', 'build', 'esm', 'cjs', 'es', 'umd', 'module', 'bundle', 'output', '_esm', '_cjs']);
	if (distDirs.has(firstSegment)) {
		return true;
	}
	// Single segment (no nested path) with a file extension → file path
	// e.g., "index.js", "main.mjs" (not "store/dist/store.js")
	if (!subpath.includes('/') && /\.[a-zA-Z0-9]+$/.test(subpath)) {
		return true;
	}
	return false;
}

export function listVendorModules(): string[] {
	const manifest = registry.manifest;
	if (!manifest) {
		return [];
	}
	return Object.keys(manifest.modules);
}

export function normalizeSpecifier(specifier: string): string {
	const withoutQuery = specifier.replace(/[?#].*$/, '');
	const normalized = withoutQuery.replace(/\\/g, '/');

	const nodeModulesIndex = normalized.lastIndexOf('/node_modules/');
	if (nodeModulesIndex !== -1) {
		const afterNm = normalized.slice(nodeModulesIndex + '/node_modules/'.length);
		// Extract bare package name: @scope/name or name (strip file subpath)
		if (afterNm.startsWith('@')) {
			const parts = afterNm.split('/');
			return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : afterNm;
		}
		return afterNm.split('/')[0];
	}

	// Handle Vite pre-bundled deps: .vite/deps/solid-js.js → solid-js
	const viteDepsMatch = normalized.match(/\.vite\/deps\/(.+?)(?:\.js)?$/);
	if (viteDepsMatch) {
		// Scoped packages use _ separator: @tanstack_solid-router → @tanstack/solid-router
		const name = viteDepsMatch[1].replace(/^@([^_]+)_/, '@$1/');
		return name;
	}

	if (normalized.startsWith('/')) {
		return normalized.slice(1);
	}

	// Extract bare package name from specifiers with subpaths:
	// solid-js/dist/dev.js → solid-js
	// @tanstack/solid-router/dist/index.js → @tanstack/solid-router
	if (normalized.includes('/')) {
		if (normalized.startsWith('@')) {
			const parts = normalized.split('/');
			if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
		} else {
			return normalized.split('/')[0];
		}
	}

	return normalized;
}
