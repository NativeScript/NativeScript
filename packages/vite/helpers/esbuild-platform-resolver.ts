import { existsSync } from 'fs';
import path from 'path';

/**
 * Esbuild resolver plugin to support NativeScript platform-specific file resolution
 * during Vite's optimizeDeps pre-bundling and HMR dependency updates.
 *
 * Handles cases like:
 *   import './paymentMethod'      -> './paymentMethod.ios.js' | './paymentMethod.android.js' | './paymentMethod.js'
 *   import './gesturehandler'     -> './gesturehandler.ios.js' | './gesturehandler.android.js' | './gesturehandler.js'
 *   import './source.js'          -> './source.ios.js' (if present)
 *   import './dir'                -> './dir/index.ios.js' | './dir/index.js'
 */
export function esbuildPlatformResolver(opts?: { platform: string; verbose?: boolean }) {
	// Treat visionOS as iOS for file resolution
	const currentPlatform = opts?.platform === 'visionos' ? 'ios' : opts?.platform;

	function tryResolve(candidate: string): string | undefined {
		try {
			return existsSync(candidate) ? candidate : undefined;
		} catch {
			return undefined;
		}
	}

	function resolveWithPlatform(basePath: string): string | undefined {
		const ext = path.extname(basePath);
		const withoutExt = ext ? basePath.slice(0, -ext.length) : basePath;

		// 1) If an extension exists, try inserting platform before the ext
		if (ext) {
			const withPlatform = `${withoutExt}.${currentPlatform}${ext}`;
			const matched = tryResolve(withPlatform) || tryResolve(basePath);
			if (matched) return matched;
		} else {
			// 2) No extension: try platform-specific JS/TS/MJS first
			const platformCandidates = [`${withoutExt}.${currentPlatform}.js`, `${withoutExt}.${currentPlatform}.ts`, `${withoutExt}.${currentPlatform}.mjs`];
			for (const c of platformCandidates) {
				const hit = tryResolve(c);
				if (hit) return hit;
			}

			// 3) Fallback to standard extensions
			const plainCandidates = [`${withoutExt}.js`, `${withoutExt}.ts`, `${withoutExt}.mjs`];
			for (const c of plainCandidates) {
				const hit = tryResolve(c);
				if (hit) return hit;
			}

			// 4) Directory index resolution
			const indexPlatformCandidates = [path.join(withoutExt, `index.${currentPlatform}.js`), path.join(withoutExt, `index.${currentPlatform}.ts`), path.join(withoutExt, `index.${currentPlatform}.mjs`)];
			for (const c of indexPlatformCandidates) {
				const hit = tryResolve(c);
				if (hit) return hit;
			}

			const indexPlainCandidates = [path.join(withoutExt, 'index.js'), path.join(withoutExt, 'index.ts'), path.join(withoutExt, 'index.mjs')];
			for (const c of indexPlainCandidates) {
				const hit = tryResolve(c);
				if (hit) return hit;
			}
		}

		return undefined;
	}

	return {
		name: 'ns-esbuild-platform-resolver',
		setup(build: any) {
			// Only handle relative imports inside node_modules during optimizeDeps
			build.onResolve({ filter: /^\.\.?\// }, (args: any) => {
				// Limit to dependency optimization contexts to avoid clobbering app src resolution
				// Esbuild passes resolveDir for the importing file's directory
				const importerDir = args.resolveDir || path.dirname(args.importer || '');

				// Heuristic: only apply inside node_modules to fix vendor packages
				if (typeof args.importer === 'string' && args.importer.includes('node_modules')) {
					const abs = path.resolve(importerDir, args.path);
					const resolved = resolveWithPlatform(abs);
					if (resolved) {
						if (opts?.verbose) {
							try {
								const relImporter = args.importer?.split('node_modules').pop();
								console.log(`ns-esbuild-resolver: ${relImporter ?? args.importer} -> ${args.path} => ${path.relative(process.cwd(), resolved)}`);
							} catch {}
						}
						return { path: resolved };
					}
				}
				return null;
			});
		},
	} as any;
}
