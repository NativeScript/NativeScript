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

	const normalized = normalizeSpecifier(specifier);
	if (!normalized) {
		return null;
	}

	if (manifest.modules[normalized]) {
		return normalized;
	}

	const alias = manifest.aliases?.[normalized];
	if (alias && manifest.modules[alias]) {
		return alias;
	}

	return null;
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
		return normalized.slice(nodeModulesIndex + '/node_modules/'.length);
	}

	if (normalized.startsWith('/')) {
		return normalized.slice(1);
	}

	return normalized;
}
