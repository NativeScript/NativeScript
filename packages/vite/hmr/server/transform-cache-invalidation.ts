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
