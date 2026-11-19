import { getVendorRequire } from '../shared/runtime/vendor-resolve.js';
declare const __NS_ENV_VERBOSE__: boolean | undefined;

// Verbose flag, the one copy for client modules. Served modules get no
// `define` substitution: the identifier resolves to the global `/@vite/env`
// installs. Read defensively because unit tests have neither.
export const ENV_VERBOSE: boolean = (() => {
	try {
		return typeof __NS_ENV_VERBOSE__ === 'boolean' ? __NS_ENV_VERBOSE__ : false;
	} catch {
		return false;
	}
})();

// Resolve a named export from @nativescript/core (UI classes, Application, the
// tagged-CSS helpers, etc.) via the vendor realm, globalThis, or device require.
export function getCore(name: string): any {
	const g = globalThis;
	const pickApplicationApi = (candidate: any): any => {
		if (!candidate) return undefined;
		const candidates = [candidate, candidate.Application, candidate.app, candidate.application];
		for (const entry of candidates) {
			if (entry && (typeof entry.run === 'function' || typeof entry.on === 'function' || typeof entry.resetRootView === 'function')) {
				return entry;
			}
		}
		return undefined;
	};
	if (name === 'Application') {
		try {
			const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
			if (reg && typeof reg.get === 'function') {
				const mod = reg.get('@nativescript/core/application');
				const appModule = (mod && (mod.default || mod)) || mod;
				const picked = pickApplicationApi(appModule);
				if (picked) return picked;
			}
		} catch {}
	}
	// 1) Prefer vendor registry to guarantee single realm
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.get === 'function') {
			const mod = reg.get('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application') {
				const picked = pickApplicationApi(ns);
				if (picked) return picked;
			}
			if (ns && ns[name]) return ns[name];
		}
	} catch {}
	// 2) Fallback to global installed
	try {
		if (g && g[name]) return g[name];
	} catch {}
	// 3) Device require (still resolves to vendor realm when available)
	try {
		const req = getVendorRequire();
		if (req) {
			if (name === 'Application') {
				const appMod = req('@nativescript/core/application');
				const appModule = (appMod && (appMod.default || appMod)) || appMod;
				const pickedFromAppModule = pickApplicationApi(appModule);
				if (pickedFromAppModule) return pickedFromAppModule;
			}
			const mod = req('@nativescript/core');
			const ns = (mod && (mod.default || mod)) || mod;
			if (name === 'Application') {
				const picked = pickApplicationApi(ns);
				if (picked) return picked;
			}
			if (ns && ns[name]) return ns[name];
		}
	} catch {}
	// 4) Last resort: nativeRequire if available
	try {
		const nativeReq = g && g.__nativeRequire;
		if (typeof nativeReq === 'function') {
			try {
				if (name === 'Application') {
					const appMod = nativeReq('@nativescript/core/application', '/');
					const appModule = (appMod && (appMod.default || appMod)) || appMod;
					const pickedFromAppModule = pickApplicationApi(appModule);
					if (pickedFromAppModule) return pickedFromAppModule;
				}
				const mod = nativeReq('@nativescript/core', '/');
				const ns = (mod && (mod.default || mod)) || mod;
				if (name === 'Application') {
					const picked = pickApplicationApi(ns);
					if (picked) return picked;
				}
				if (ns && ns[name]) return ns[name];
			} catch {}
		}
	} catch {}
	return undefined;
}
