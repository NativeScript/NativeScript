import { existsSync } from 'fs';
import path from 'path';

/**
 * Rolldown-compatible resolver plugin for NativeScript platform-specific file
 * resolution during dependency optimization.
 */
export function optimizeDepsPlatformResolver(opts?: { platform: string; verbose?: boolean }) {
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
		name: 'ns-optimize-deps-platform-resolver',
		resolveId(source: string, importer?: string) {
			if (!source || !/^\.\.?\//.test(source)) {
				return null;
			}
			if (typeof importer !== 'string' || !importer.includes('node_modules')) {
				return null;
			}
			const importerDir = path.dirname(importer);
			const abs = path.resolve(importerDir, source);
			const resolved = resolveWithPlatform(abs);
			if (!resolved) {
				return null;
			}
			if (opts?.verbose) {
				// Note: very verbose, even for verbose mode, but can uncomment this if needed for debugging resolution issues
				// try {
				// 	const relImporter = importer.split('node_modules').pop();
				// 	console.log(`ns-optimize-deps-resolver: ${relImporter ?? importer} -> ${source} => ${path.relative(process.cwd(), resolved)}`);
				// } catch {}
			}
			return resolved;
		},
	} as any;
}
