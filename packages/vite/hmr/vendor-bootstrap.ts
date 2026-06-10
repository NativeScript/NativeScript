import { getGlobalScope } from './shared/runtime/global-scope.js';
// HMR vendor bootstrap helper
// Ensures a stable global lookup for vendor modules that were bundled and registered.
// This can be injected or imported by the HMR runtime before rewriting modules rely on it.

interface VendorLookupFn {
	(id: string): any;
}

(function initVendorAccessor() {
	if (getGlobalScope().__nsVendor) return;

	const getManifest = () => getGlobalScope().__NS_VENDOR_MANIFEST__ || null;
	const getRegistry = () => getGlobalScope().__nsModules || getGlobalScope().__nsModuleRegistry || null;

	const accessor: VendorLookupFn = function (id: string): any {
		if (!id) return undefined;
		const manifest = getManifest();
		const registry = getRegistry();
		if (!manifest || !manifest.modules || !registry) return undefined;
		// Direct match
		if (registry.get && registry.get(id)) return registry.get(id);
		// Try alias resolution
		const alias = manifest.aliases?.[id];
		if (alias && registry.get && registry.get(alias)) return registry.get(alias);
		return undefined;
	};

	Object.defineProperty(globalThis, '__nsVendor', {
		value: accessor,
		enumerable: false,
		configurable: true,
		writable: false,
	});
})();
