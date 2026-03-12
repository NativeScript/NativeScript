import { readFileSync, existsSync } from 'fs';
import path from 'path';
import type { VendorManifest } from './manifest.js';
import { registerVendorManifest } from './registry.js';

/**
 * Attempt to load a previously generated vendor manifest from the NativeScript
 * pre-bundled output directory (.ns-vite-build/ns-vendor-manifest.json).
 * This allows the dev HMR WebSocket plugin to bootstrap vendor awareness even
 * before a fresh dev-server generation path runs (helpful when the app was
 * launched from a prebuilt bundle and HMR attaches later).
 */
export function loadPrebuiltVendorManifest(projectRoot: string, verbose = false): VendorManifest | null {
	try {
		const buildDir = path.join(projectRoot, '.ns-vite-build');
		const manifestPath = path.join(buildDir, 'ns-vendor-manifest.json');
		if (!existsSync(manifestPath)) {
			if (verbose) {
				console.log('[vendor-loader] No prebuilt vendor manifest at', manifestPath);
			}
			return null;
		}
		const raw = readFileSync(manifestPath, 'utf8');
		const json: VendorManifest = JSON.parse(raw);
		if (json && json.modules) {
			registerVendorManifest(json);
			if (verbose) {
				console.log('[vendor-loader] Loaded prebuilt vendor manifest with', Object.keys(json.modules).length, 'modules');
			}
			// Expose globally (node side) for easier inspection in dev tools.
			(globalThis as any).__NS_VENDOR_MANIFEST__ = json;
			return json;
		}
	} catch (e) {
		console.warn('[vendor-loader] Failed to load vendor manifest:', e);
	}
	return null;
}
