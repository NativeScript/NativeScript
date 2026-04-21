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
