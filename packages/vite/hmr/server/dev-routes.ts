import type { Plugin } from 'vite';
import * as path from 'path';
import { getVendorManifest } from '../shared/vendor/registry.js';
import { loadPrebuiltVendorManifest } from '../shared/vendor/manifest-loader.js';
import { getFrameworkServerStrategy } from '../framework-flavors.js';
import { getSharedDepsBundleService, registerDepsBundleRoute } from './deps-bundle.js';
import { registerImportMapRoute } from './websocket-import-map-route.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';

/**
 * Dev-server routes the device boots from: `/ns/import-map.json` and the deps
 * bundle (`/ns/deps-bundle.mjs`), plus the vendor manifest both read.
 */
export function nsDevRoutesPlugin(opts: { flavor: string; verbose?: boolean }): Plugin {
	const verbose = !!opts.verbose;
	return {
		name: 'nativescript-dev-routes',
		apply: 'serve',

		async configureServer(server) {
			const root = server.config?.root || process.cwd();

			if (!getVendorManifest()) {
				const loaded = loadPrebuiltVendorManifest(root, verbose);
				if (!loaded && verbose) {
					console.warn('[ns-dev-routes] No vendor manifest found during bootstrap.');
				}
			}
			getGlobalScope().__NS_VENDOR_MANIFEST__ = getVendorManifest();

			registerImportMapRoute(server, { getStrategy: () => getFrameworkServerStrategy(opts.flavor) });

			// Awaited so the ready/not-ready decision is latched before the server
			// accepts device requests: every boot is then all-shims or
			// all-per-module, never a mid-boot mix that evaluates bundled modules twice.
			const depsBundle = getSharedDepsBundleService(server);
			if (depsBundle) {
				registerDepsBundleRoute(server, depsBundle);
				const tDeps = Date.now();
				const depsState = await depsBundle.ensureBuilt();
				if (depsState && verbose) {
					console.info(`[ns-dev-routes] deps bundle ready: ${depsState.keys.size} modules, ${(depsState.code.length / 1024).toFixed(0)}kb (+${Date.now() - tDeps}ms at startup)`);
				}
				// A dependency change invalidates the built closure; the next dev-server start rebuilds.
				const packageJsonPath = path.resolve(root, 'package.json');
				server.watcher.add(packageJsonPath);
				server.watcher.on('change', (file) => {
					if (path.resolve(file) === packageJsonPath && depsBundle.getState()) {
						depsBundle.disableServingForSession('package.json changed');
					}
				});
			}
		},
	};
}
