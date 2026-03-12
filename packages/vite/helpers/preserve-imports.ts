import type { Plugin } from 'vite';

// Canonicalizes `?ns-keep` imports to their base id and marks them as side-effectful
// so Rollup won't tree-shake them, while avoiding duplicate module instances.
export function preserveImportsPlugin(): Plugin {
	// Track canonical ids that were referenced with ?ns-keep
	const keepCanonicalIds = new Set<string>();

	return {
		name: 'ns-preserve-imports',
		// run early so downstream plugins see canonicalized ids consistently
		enforce: 'pre',

		async resolveId(source, importer, options) {
			if (!source || source.indexOf('?ns-keep') === -1) return null;
			const base = source.split('?')[0];
			const resolved = await this.resolve(base, importer, { ...options, skipSelf: true });
			if (resolved?.id) {
				const canonical = resolved.id.split('?')[0];
				keepCanonicalIds.add(canonical);
				// Return resolved without the query so all imports share one module instance
				return { id: canonical, external: resolved.external, moduleSideEffects: true };
			}
			// Fallback to base when resolver didn't handle it (rare)
			keepCanonicalIds.add(base);
			return { id: base } as any;
		},

		transform(code, id) {
			const canonical = id.split('?')[0];
			if (keepCanonicalIds.has(canonical) || id.includes('?ns-keep')) {
				return {
					code,
					map: null,
					moduleSideEffects: true,
				};
			}
			return null;
		},
	};
}
