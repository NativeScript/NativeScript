/**
 * Single typed escape hatch for the global object.
 *
 * Use this instead of scattering `(globalThis as any)` casts:
 *
 *   const g = getGlobalScope();
 *   g.__SOME_DYNAMIC_KEY__ = value;
 *
 * State of our own belongs on the dev globals object
 * (`hmr/shared/runtime/dev-globals.ts`), not on new global keys.
 *
 * Deliberately zero-dependency: it is imported by served device modules
 * AND by entry-bundled modules, so it must add no weight and no import edges.
 */
export function getGlobalScope(): any {
	return globalThis as any;
}
