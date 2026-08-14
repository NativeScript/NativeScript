import { isRuntimeGraphExcludedPath, normalizeRuntimeGraphPath } from './runtime-graph-filter.js';

// Framework-agnostic transform-cache-invalidation primitives shared by the
// per-flavor `handleHotUpdate` tails (Angular + Solid today). They live in this
// neutral module so a non-Angular strategy can depend on them without importing
// the Angular module.

export function canonicalizeTransformRequestCacheKey(url: string, projectRoot: string): string {
	if (!url) return url;

	const [rawPath, rawQuery = ''] = url.split('?', 2);
	let normalizedPath = rawPath;
	const root = projectRoot ? projectRoot.replace(/\\/g, '/') : '';

	if (normalizedPath.startsWith('/@fs/')) {
		const fsPath = normalizedPath.slice('/@fs'.length).replace(/\\/g, '/');
		if (root && fsPath.startsWith(root)) {
			const rel = fsPath.slice(root.length);
			normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
		}
	} else if (root && normalizedPath.replace(/\\/g, '/').startsWith(root)) {
		const rel = normalizedPath.replace(/\\/g, '/').slice(root.length);
		normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
	}

	if (!rawQuery) {
		return normalizedPath;
	}

	const params = new URLSearchParams(rawQuery);
	params.delete('t');
	params.delete('v');
	const kept = Array.from(params.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
		if (leftKey === rightKey) {
			return leftValue.localeCompare(rightValue);
		}
		return leftKey.localeCompare(rightKey);
	});
	if (!kept.length) {
		return normalizedPath;
	}

	const normalizedQuery = new URLSearchParams();
	for (const [key, value] of kept) {
		normalizedQuery.append(key, value);
	}

	return `${normalizedPath}?${normalizedQuery.toString()}`;
}

export type TransitiveImporterModuleLike = {
	id?: string | null;
	file?: string | null;
	importers?: Iterable<TransitiveImporterModuleLike> | null;
};

/**
 * Purge stale transform-cache state for a changed file before a hot update is
 * re-served. Invalidates Vite's module graph for the file + its bounded
 * transitive importers (so `transformRequest` re-runs the pipeline) and clears
 * `sharedTransformRequest`'s result cache (the `/ns/m/` route probes many
 * candidate extensions per spec, each a distinct cache key, so targeted
 * invalidation alone can miss the key a previous serve populated).
 *
 * Shared by the per-flavor `handleHotUpdate` tails (Vue, Solid). `label` only
 * affects verbose log lines.
 */
export function purgeTransformCachesForHotUpdate(options: { file: string; server: { config?: { root?: string }; moduleGraph?: any }; sharedTransformRequest?: { invalidateMany: (urls: Iterable<string>) => void; clear: () => void } | null; verbose?: boolean; label?: string }): void {
	const { file, server, sharedTransformRequest, verbose, label = 'hmr' } = options;
	try {
		const projectRoot = server.config?.root || process.cwd();
		const cacheInvalidationUrls = new Set<string>();
		const addCacheKey = (rawId: string | null | undefined) => {
			const id = String(rawId || '');
			if (!id) return;
			const cacheKey = canonicalizeTransformRequestCacheKey(id, projectRoot);
			cacheInvalidationUrls.add(cacheKey);
			const noQuery = cacheKey.replace(/\?.*$/, '');
			const stripped = noQuery.replace(/\.(?:[mc]?[jt]sx?)$/i, '');
			if (stripped !== noQuery) {
				cacheInvalidationUrls.add(stripped);
			}
		};
		addCacheKey(file);
		const rootModules = server.moduleGraph?.getModulesByFile?.(file);
		const transitiveImporters = collectTransitiveImportersForInvalidation({
			modules: rootModules ? Array.from(rootModules) : [],
			isExcluded: (id: string) => id.includes('/node_modules/') || isRuntimeGraphExcludedPath(id),
			maxDepth: 16,
		});
		try {
			server.moduleGraph?.onFileChange?.(file);
		} catch {}
		if (rootModules) {
			for (const mod of rootModules) {
				try {
					server.moduleGraph?.invalidateModule?.(mod);
				} catch {}
			}
		}
		for (const mod of transitiveImporters) {
			addCacheKey(mod?.id);
			try {
				server.moduleGraph?.invalidateModule?.(mod as any);
			} catch {}
		}
		if (!sharedTransformRequest) return;
		if (cacheInvalidationUrls.size) {
			sharedTransformRequest.invalidateMany(cacheInvalidationUrls);
			if (verbose) {
				console.log(`[hmr-ws][${label}] purged shared transform cache entries:`, cacheInvalidationUrls.size, 'transitiveImporters=', transitiveImporters.length);
			}
		}
		try {
			sharedTransformRequest.clear();
		} catch {}
	} catch (error) {
		if (verbose) console.warn(`[hmr-ws][${label}] transform cache purge failed`, error);
	}
}

export function collectTransitiveImportersForInvalidation(options: { modules: Iterable<TransitiveImporterModuleLike> | undefined | null; isExcluded?: (id: string) => boolean; maxDepth?: number }): TransitiveImporterModuleLike[] {
	const visited = new Set<TransitiveImporterModuleLike>();
	const collected = new Map<string, TransitiveImporterModuleLike>();
	const isExcluded = options.isExcluded ?? ((id: string) => id.includes('/node_modules/') || isRuntimeGraphExcludedPath(id));
	const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 16));

	const normalizeId = (value: string | null | undefined): string => normalizeRuntimeGraphPath(value ?? '');

	const walk = (mod: TransitiveImporterModuleLike | undefined | null, depth: number): void => {
		if (!mod || visited.has(mod)) {
			return;
		}
		visited.add(mod);

		if (depth >= maxDepth) {
			return;
		}

		const importers = mod.importers;
		if (!importers) {
			return;
		}

		for (const importer of importers) {
			if (!importer) continue;
			const importerId = normalizeId(importer.id);
			if (!importerId) {
				walk(importer, depth + 1);
				continue;
			}
			if (isExcluded(importerId)) {
				continue;
			}
			if (!collected.has(importerId)) {
				collected.set(importerId, importer);
			}
			walk(importer, depth + 1);
		}
	};

	for (const mod of options.modules || []) {
		walk(mod, 0);
	}

	return Array.from(collected.values());
}
