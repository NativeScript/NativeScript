/**
 * Per-layer hit counters for the stacked Angular linker passes.
 *
 * Five layers can each link partial declarations (vite pre, rollup pre,
 * vite post, renderChunk, generateBundle). Some exist purely as safety nets
 * and may never fire for a given flavor/build mode. Before any layer can be
 * removed we need evidence across the flavor matrix — these counters make a
 * build print exactly which layers did work, without grepping the per-file
 * VITE_DEBUG_LOGS output.
 */

const layerHits = new Map<string, number>();

export function recordLinkerHit(layer: string): void {
	layerHits.set(layer, (layerHits.get(layer) ?? 0) + 1);
}

/**
 * Print a one-line summary of which linker layers linked anything this build.
 * Called from the generateBundle-phase linker (the last layer to run). Prints
 * only when at least one layer fired, or unconditionally under VITE_DEBUG_LOGS
 * so a zero-hit matrix run is still observable.
 */
export function reportLinkerLayerStats(): void {
	const debug = process.env.VITE_DEBUG_LOGS === '1' || process.env.VITE_DEBUG_LOGS === 'true';
	const total = [...layerHits.values()].reduce((sum, n) => sum + n, 0);
	if (total === 0 && !debug) return;
	const parts = ['vite-load', 'vite', 'vite-post', 'rollup-load', 'rollup', 'render', 'post'].map((layer) => `${layer}=${layerHits.get(layer) ?? 0}`);
	console.log(`[ns-angular-linker] layer hits this build: ${parts.join(' ')}`);
}
