import type { NsRuntimeDevHostApi } from './browser-runtime-contract.js';

let hostApi: NsRuntimeDevHostApi = {};

/**
 * Loads the runtime's dev surface from the `ns:module` builtin into
 * {@link nsRuntimeDevHostApi}. A dynamic import, so a runtime without the
 * builtin rejects it (leaving an empty surface) instead of failing the
 * boot graph at link time.
 */
export async function loadNsRuntimeDevHostApi(): Promise<NsRuntimeDevHostApi> {
	try {
		const mod: { default?: unknown } = await import('ns:module');
		const api = mod.default && typeof mod.default === 'object' ? mod.default : mod;
		hostApi = api && typeof api === 'object' ? (api as NsRuntimeDevHostApi) : {};
	} catch {
		hostApi = {};
	}
	return hostApi;
}

/** The surface {@link loadNsRuntimeDevHostApi} loaded; empty until the session bootstrap has loaded it. */
export function nsRuntimeDevHostApi(): NsRuntimeDevHostApi {
	return hostApi;
}
