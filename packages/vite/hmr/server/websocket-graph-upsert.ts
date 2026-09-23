export type GraphUpsertClassification = 'unchanged' | 'inserted' | 'changed';

export function classifyGraphUpsert(existing: { hash: string; deps: string[] } | undefined, nextHash: string, nextDeps: string[]): GraphUpsertClassification {
	if (!existing) {
		return 'inserted';
	}
	if (existing.hash === nextHash && existing.deps.length === nextDeps.length && existing.deps.every((d, i) => d === nextDeps[i])) {
		return 'unchanged';
	}
	return 'changed';
}

export function shouldBroadcastGraphUpsertDelta(classification: GraphUpsertClassification, emitDeltaOnInsert: boolean = false, broadcastEnabled: boolean = true): boolean {
	return broadcastEnabled && (classification === 'changed' || (classification === 'inserted' && emitDeltaOnInsert));
}

/**
 * Decide whether an upsert should advance the shared graphVersion
 * counter. Serve-time warm-ups (and the background initial-graph walk) pass
 * `bumpVersion: false` so graphVersion stays stable during cold boot — that
 * stability is what lets the dynamic-import helper tag every first-session
 * URL with a consistent `v1` instead of drifting between `live`, `v12`,
 * `v433`... (which would produce double-loaded modules on iOS HTTP ESM).
 * Real live edits (handleHotUpdate and framework hot-update handlers) leave
 * `bumpVersion` unset or true and advance the counter as before.
 *
 * The helper also treats `unchanged` classifications as no-op: they bypass
 * the graph set entirely in upsertGraphModule, so the version must not
 * advance for them either.
 */
export function shouldBumpGraphVersion(classification: GraphUpsertClassification, bumpVersion: boolean = true): boolean {
	if (classification === 'unchanged') {
		return false;
	}
	return bumpVersion !== false;
}
