export type ModuleListProvider = () => string[];

let appForModuleResolverCallback: () => void;
export function prepareAppForModuleResolver(callback: () => void) {
	appForModuleResolverCallback = callback;
}

export function initAppForModuleResolver() {
	if (appForModuleResolverCallback) {
		appForModuleResolverCallback();
		appForModuleResolverCallback = undefined;
	}
}

export interface ModuleNameResolverType {
	resolveModuleName(path: string, ext: string): string;
	clearCache(): void;
}

let resolverInstance: ModuleNameResolverType;

export function getResolveInstance() {
	return resolverInstance;
}

/**
 * Used to set a global singular instance of ModuleNameResolver
 * @param resolver instance
 */
export function _setResolver(resolver: ModuleNameResolverType) {
	resolverInstance = resolver;
}

export function clearResolverCache() {
	if (resolverInstance) {
		resolverInstance.clearCache();
	}
}
