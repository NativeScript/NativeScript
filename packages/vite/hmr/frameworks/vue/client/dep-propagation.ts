/**
 * Reverse-import-graph propagation for non-SFC dependency edits (Vue flavor).
 *
 * Editing a `.vue` file flows through `ns:vue-sfc-registry-update` →
 * `loadSfcComponent` → `performResetRoot`, so the screen always reflects the
 * fresh artifact. Editing a plain `.ts`/`.js` module that an SFC imports does
 * NOT produce a registry update — the shared queue only evicts and re-imports
 * the changed module itself. The freshly-instantiated dep module is then
 * sitting in V8's cache while the live component instance still holds bindings
 * to the OLD module instance, so the visible UI never changes even though the
 * overlay reports the update as applied.
 *
 * This walker finds the `.vue` boundaries that (transitively) import the
 * changed modules so the Vue strategy can reload + remount them — the exact
 * counterpart of the Solid flavor's `.tsx` boundary BFS in the shared queue.
 *
 * Pure function (graph in, boundaries out) so the propagation decision is unit
 * testable without booting the device runtime.
 */

export interface DepGraphModuleLike {
	id: string;
	deps: string[];
}

const VUE_SFC_ID_RE = /\.vue$/i;
// Keep in sync with the client utils' canonical-URL extension stripping: the
// graph may record a dep as `/src/test2.ts` while a changed id (or another
// importer's dep entry) appears as `/src/test2` — both must key identically.
const SCRIPT_EXT_RE = /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i;

export function normalizeDepGraphKey(id: string): string {
	let key = String(id || '').split('?')[0];
	if (!key) return '';
	if (!key.startsWith('/')) key = '/' + key;
	return key.replace(SCRIPT_EXT_RE, '');
}

/**
 * BFS the reverse import graph from each changed non-`.vue` module up to the
 * NEAREST `.vue` boundaries. SFC boundaries terminate the walk (remounting a
 * boundary re-assembles its whole subtree, so walking past it would only
 * produce redundant ancestors). Returns query-stripped `.vue` ids in BFS
 * discovery order (nearest first), deduplicated.
 *
 * Changed ids that are themselves `.vue` files are ignored — those flow
 * through the SFC registry-update path and never enter the shared re-import
 * queue.
 */
export function findNearestSfcBoundaries(changedIds: readonly string[], graph: ReadonlyMap<string, DepGraphModuleLike>): string[] {
	if (!changedIds?.length || !graph?.size) return [];

	// Reverse index: normalized dep key → importer ids.
	const reverseIndex = new Map<string, string[]>();
	for (const [id, mod] of graph) {
		const deps = Array.isArray(mod?.deps) ? mod.deps : [];
		for (const dep of deps) {
			const key = normalizeDepGraphKey(dep);
			if (!key) continue;
			let importers = reverseIndex.get(key);
			if (!importers) {
				importers = [];
				reverseIndex.set(key, importers);
			}
			importers.push(id);
		}
	}

	const boundaries: string[] = [];
	const boundarySeen = new Set<string>();
	const visited = new Set<string>();
	const queue: string[] = [];

	for (const raw of changedIds) {
		if (!raw || typeof raw !== 'string') continue;
		if (VUE_SFC_ID_RE.test(raw.split('?')[0])) continue;
		const key = normalizeDepGraphKey(raw);
		if (key && !visited.has(key)) {
			visited.add(key);
			queue.push(key);
		}
	}

	while (queue.length) {
		const key = queue.shift()!;
		const importers = reverseIndex.get(key);
		if (!importers) continue;
		for (const importer of importers) {
			const importerBase = importer.split('?')[0];
			if (VUE_SFC_ID_RE.test(importerBase)) {
				if (!boundarySeen.has(importerBase)) {
					boundarySeen.add(importerBase);
					boundaries.push(importerBase);
				}
				continue;
			}
			const importerKey = normalizeDepGraphKey(importer);
			if (importerKey && !visited.has(importerKey)) {
				visited.add(importerKey);
				queue.push(importerKey);
			}
		}
	}

	return boundaries;
}

/**
 * Reverse-walk from a changed `.vue` file to its `.vue` importers (ancestors),
 * nearest-first. Unlike {@link findNearestSfcBoundaries} this STARTS from a
 * `.vue` and does not stop at the first boundary — it returns the full ancestor
 * chain so the caller can remount the nearest one that's safely mountable as a
 * root (a child SFC with required props is not). The changed file is excluded.
 */
export function findSfcAncestors(changedVuePath: string, graph: ReadonlyMap<string, DepGraphModuleLike>, maxAncestors = 16): string[] {
	const startKey = normalizeDepGraphKey(changedVuePath);
	if (!startKey || !graph?.size) return [];

	const reverseIndex = new Map<string, string[]>();
	for (const [id, mod] of graph) {
		const deps = Array.isArray(mod?.deps) ? mod.deps : [];
		for (const dep of deps) {
			const key = normalizeDepGraphKey(dep);
			if (!key) continue;
			let importers = reverseIndex.get(key);
			if (!importers) {
				importers = [];
				reverseIndex.set(key, importers);
			}
			importers.push(id);
		}
	}

	const ancestors: string[] = [];
	const seen = new Set<string>([startKey]);
	const queue: string[] = [startKey];
	while (queue.length && ancestors.length < maxAncestors) {
		const key = queue.shift()!;
		const importers = reverseIndex.get(key);
		if (!importers) continue;
		for (const importer of importers) {
			const importerKey = normalizeDepGraphKey(importer);
			if (!importerKey || seen.has(importerKey)) continue;
			seen.add(importerKey);
			queue.push(importerKey);
			const importerBase = importer.split('?')[0];
			if (VUE_SFC_ID_RE.test(importerBase)) ancestors.push(importerBase);
		}
	}
	return ancestors;
}
