import { getGlobalScope } from './global-scope.js';

/**
 * Canonical device-side vendor lookup chain: `__nsVendorRegistry` →
 * `__nsVendorRequire` → `__nsRequire` → `require`.
 *
 * Every runtime module that needs a vendor module MUST resolve it through
 * here. The chain order is the realm rule in executable form — a hand-rolled
 * copy that drifts (e.g. skips the registry, or prefers `require` first) can
 * mint a SECOND instance of a vendor module, and dual-realm `@nativescript/core`
 * or `vue` is an on-device crash. `hmr/server/ns-rt-bridge.ts` emits the same
 * chain into generated device code; keep the two in sync.
 *
 * `__nsVendorRequire` is only consulted when the vendor registry is installed
 * (both are set together by `vendor-bootstrap.ts`); before bootstrap the chain
 * falls straight through to the runtime's own require.
 */
export function getVendorRequire(): ((id: string) => any) | undefined {
	const g: any = getGlobalScope();
	const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
	const req = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
	return typeof req === 'function' ? req : undefined;
}

/**
 * Resolve a vendor module by id through the canonical chain. Returns
 * `undefined` when no layer can provide the module (require throws are
 * swallowed — callers treat a miss as "feature unavailable", never fatal).
 */
export function resolveVendorModule(id: string): any {
	const g: any = getGlobalScope();
	try {
		const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (registry?.has?.(id)) return registry.get(id);
	} catch {}
	const req = getVendorRequire();
	if (req) {
		try {
			return req(id);
		} catch {}
	}
	return undefined;
}
