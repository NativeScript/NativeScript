import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';
import { findPackageInNodeModules } from './module-resolution.js';
import { getProjectRootPath } from './project.js';
import { resolveMainFieldPlatformVariant } from './resolve-main-field-platform.js';

const projectRoot = getProjectRootPath();

export function packagePlatformResolverPlugin(opts: { tsConfig: { paths?: Record<string, string[]> } | null; verbose?: boolean; platform: string }): Plugin {
	// packages used via core transient dependencies and other vite support
	const commonSkips = ['source-map-js', 'html-entities', 'fast-xml-parser', '@valor/nativescript-websockets'];
	// Memoize the resolved id (or null) per bare package name. This runs on the
	// hot `enforce:'pre'` path for EVERY bare specifier; without a cache it does
	// a full `findPackageInNodeModules` fs-walk + `package.json` read/parse on
	// every resolve. The platform is fixed for this plugin instance (a fresh
	// instance is created per worker build via the `worker.plugins` factory), so
	// the package name is a sufficient key. Mirrors the cache in
	// `nativescript-package-resolver.ts`.
	const resolveCache = new Map<string, string | null>();
	return {
		name: 'ns-package-platform-resolver',
		enforce: 'pre',
		resolveId(id) {
			if (!/^(@[^/]+\/[^@/]+|[^@/]+)$/.test(id)) {
				return null;
			}
			// Skip packages that have custom plugins
			if (commonSkips.includes(id)) {
				return null;
			}

			// Skip if this ID is already handled by tsconfig paths
			// Check if this matches any of our tsconfig path aliases
			if (opts.tsConfig?.paths && opts.tsConfig.paths[id]) {
				return null;
			}

			// Only handle packages that exist in node_modules (real npm packages)
			const packageName = id;
			if (resolveCache.has(packageName)) {
				return resolveCache.get(packageName)!;
			}
			// Compute once, then memoize (incl. the null "no rewrite" result so a
			// known package short-circuits on the next resolve).
			const resolved = ((): string | null => {
				const packagePath = findPackageInNodeModules(packageName, projectRoot);
				if (!packagePath) return null;
				const packageJsonPath = path.join(packagePath, 'package.json');
				if (!fs.existsSync(packageJsonPath)) return null;
				try {
					const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
					// Shared main-field platform-variant rules (Case 1/2).
					const out = resolveMainFieldPlatformVariant(packagePath, packageJson.main, opts.platform);
					if (out && opts.verbose) {
						console.log(`✅ Alias resolver: ${packageName} -> ${out}`);
					}
					return out;
				} catch {
					// Ignore parse errors and fall through.
					return null;
				}
			})();

			resolveCache.set(packageName, resolved);
			return resolved;
		},
	};
}
