/**
 * Single typed escape hatch for the global object.
 *
 * Use this instead of scattering `(globalThis as any)` casts:
 *
 *   const g = getGlobalScope();
 *   g.__SOME_DYNAMIC_KEY__ = value;
 *
 * For the well-known `__NS_*` / `__ns*` keys declared in
 * `hmr/shared/ns-globals.ts`, prefer direct typed access
 * (`globalThis.__NS_HMR_BOOT_COMPLETE__`) — this helper is for dynamic or
 * intentionally-untyped keys only.
 *
 * Deliberately zero-dependency: it is imported by raw-served device modules
 * AND by entry-bundled modules (vendor-bootstrap), so it must add no weight
 * and no import edges.
 */
export function getGlobalScope(): any {
	return globalThis as any;
}
