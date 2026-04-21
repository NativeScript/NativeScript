import { getProjectAppVirtualPath } from '../../helpers/utils.js';
import { isRuntimeGraphExcludedPath, normalizeRuntimeGraphPath } from './runtime-graph-filter.js';

const APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;

export type HotUpdateGraphModuleLike = {
	id?: string | null;
	importedModules?: Iterable<{ id?: string | null }>;
	importers?: Iterable<HotUpdateGraphModuleLike>;
};

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

export function collectGraphUpdateModulesForHotUpdate(options: { file: string; flavor: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined }): HotUpdateGraphModuleLike[] {
	const targets = new Map<string, HotUpdateGraphModuleLike>();
	const addTarget = (mod?: HotUpdateGraphModuleLike | null) => {
		const id = mod?.id?.replace(/\?.*$/, '');
		if (!id) return;
		if (isRuntimeGraphExcludedPath(id)) return;
		if (!targets.has(id)) {
			targets.set(id, mod!);
		}
	};

	if (options.flavor === 'angular' && /\.(html|htm)$/i.test(options.file)) {
		for (const mod of options.modules || []) {
			for (const importer of mod?.importers || []) {
				const importerId = importer?.id || '';
				if (/\.[cm]?[jt]sx?(?:$|\?)/i.test(importerId)) {
					addTarget(importer);
				}
			}
		}

		if (!targets.size) {
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.ts')));
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.js')));
		}

		return Array.from(targets.values());
	}

	if (!options.file.endsWith('.vue')) {
		addTarget(options.getModuleById(options.file) || options.getModuleById(options.file + '?vue'));
	}

	return Array.from(targets.values());
}

export function collectAngularHotUpdateRoots(options: { file: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined; getModulesByFile?: (file: string) => Iterable<HotUpdateGraphModuleLike> | undefined | null }): HotUpdateGraphModuleLike[] {
	const roots: HotUpdateGraphModuleLike[] = [];
	const seenIds = new Set<string>();
	const seenObjects = new Set<HotUpdateGraphModuleLike>();

	const addRoot = (mod?: HotUpdateGraphModuleLike | null) => {
		if (!mod) {
			return;
		}

		if (mod.id) {
			if (isRuntimeGraphExcludedPath(mod.id)) {
				return;
			}
			if (seenIds.has(mod.id)) {
				return;
			}
			seenIds.add(mod.id);
			roots.push(mod);
			return;
		}

		if (seenObjects.has(mod)) {
			return;
		}
		seenObjects.add(mod);
		roots.push(mod);
	};

	if (/\.(html|htm)$/i.test(options.file)) {
		for (const mod of collectGraphUpdateModulesForHotUpdate({
			file: options.file,
			flavor: 'angular',
			modules: options.modules,
			getModuleById: options.getModuleById,
		})) {
			addRoot(mod);
		}
		return roots;
	}

	if (!/\.(m|c)?ts$/i.test(options.file)) {
		return roots;
	}

	for (const mod of options.modules || []) {
		addRoot(mod);
	}

	for (const mod of options.getModulesByFile?.(options.file) || []) {
		addRoot(mod);
	}

	if (!roots.length) {
		addRoot(options.getModuleById(options.file));
	}

	return roots;
}

export type TransitiveImporterModuleLike = {
	id?: string | null;
	file?: string | null;
	importers?: Iterable<TransitiveImporterModuleLike> | null;
};

export function collectAngularTransitiveImportersForInvalidation(options: { modules: Iterable<TransitiveImporterModuleLike> | undefined | null; isExcluded?: (id: string) => boolean; maxDepth?: number }): TransitiveImporterModuleLike[] {
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

export function shouldInvalidateAngularTransitiveImporters(options: { flavor: string; file: string }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	return /\.(?:html|htm|(m|c)?[jt]sx?)$/i.test(options.file);
}

function isExtensionlessAngularAppTransformCandidate(id: string): boolean {
	return id.startsWith(APP_VIRTUAL_WITH_SLASH) && /\.(?:[mc]?[jt]sx?)$/i.test(id);
}

function addAngularTransformCacheInvalidationUrl(targets: Set<string>, rawId: string | null | undefined, projectRoot?: string): void {
	const id = String(rawId || '');
	if (!id) {
		return;
	}

	const cacheKey = projectRoot ? canonicalizeTransformRequestCacheKey(id, projectRoot) : id;
	targets.add(cacheKey);

	const normalizedId = cacheKey.replace(/\?.*$/, '');
	if (!isExtensionlessAngularAppTransformCandidate(normalizedId)) {
		return;
	}

	targets.add(normalizedId.replace(/\.(?:[mc]?[jt]sx?)$/i, ''));
}

export function collectAngularTransformCacheInvalidationUrls(options: { file: string; isTs: boolean; hotUpdateRoots: Iterable<{ id?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null }>; projectRoot?: string }): string[] {
	const urls = new Set<string>();

	if (options.isTs) {
		addAngularTransformCacheInvalidationUrl(urls, options.file, options.projectRoot);
	}

	for (const mod of options.hotUpdateRoots || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	for (const mod of options.transitiveImporters || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	return Array.from(urls);
}

export function shouldSuppressDefaultViteHotUpdate(options: { flavor: string; file: string }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	return /\.(html|htm|ts)$/i.test(options.file);
}

export type PendingAngularReloadSuppressionEntry = {
	absPath: string;
	relPath: string;
	expiresAt: number;
};

export function normalizeHotReloadMatchPath(raw: string, root?: string): string {
	let normalized = String(raw || '')
		.split('?')[0]
		.replace(/\\/g, '/')
		.replace(/^file:\/\//, '');

	if (root) {
		const rootNormalized = root.replace(/\\/g, '/');
		if (normalized.startsWith(rootNormalized)) {
			normalized = normalized.slice(rootNormalized.length);
		}
	}

	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}

	return normalized;
}

export function shouldSuppressViteFullReloadPayload(options: { payload: any; pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>; root?: string; now?: number }): boolean {
	const { payload, pendingEntries, root } = options;
	const now = options.now ?? Date.now();

	if (!payload || payload.type !== 'full-reload') {
		return false;
	}

	const payloadPath = typeof payload.path === 'string' && payload.path !== '*' ? normalizeHotReloadMatchPath(payload.path, root) : null;
	const payloadTriggeredBy = typeof payload.triggeredBy === 'string' ? normalizeHotReloadMatchPath(payload.triggeredBy, root) : null;

	for (const entry of pendingEntries) {
		if (!entry || entry.expiresAt <= now) {
			continue;
		}

		if (payloadTriggeredBy === entry.absPath || payloadTriggeredBy === entry.relPath || payloadPath === entry.relPath || payloadPath === entry.absPath) {
			return true;
		}
	}

	return false;
}
