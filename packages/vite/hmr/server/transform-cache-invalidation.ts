import { isRuntimeGraphExcludedPath, normalizeRuntimeGraphPath } from './runtime-graph-filter.js';

// Framework-agnostic transform-cache-invalidation primitives shared by the
// per-flavor `handleHotUpdate` tails. They live in this
// neutral module so a non-Angular strategy can depend on them without importing
// the Angular module.

export type TransitiveImporterModuleLike = {
	id?: string | null;
	file?: string | null;
	importers?: Iterable<TransitiveImporterModuleLike> | null;
};

/**
 * Invalidate Vite's module graph for a changed file and its bounded transitive
 * importers, so the next `transformRequest` re-runs the pipeline instead of
 * serving a cached result.
 *
 * Shared by the per-flavor `handleHotUpdate` tails (Vue, Solid, React). `label`
 * only affects verbose log lines.
 */
export function purgeTransformCachesForHotUpdate(options: { file: string; server: { config?: { root?: string }; moduleGraph?: any }; verbose?: boolean; label?: string }): void {
	const { file, server, verbose, label = 'hmr' } = options;
	try {
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
			try {
				server.moduleGraph?.invalidateModule?.(mod as any);
			} catch {}
		}
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
