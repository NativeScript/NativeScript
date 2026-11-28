import type { FrameworkServerStrategy } from './server/framework-strategy.js';
import { getBuiltInServerStrategy } from './server/framework-strategy.js';

/**
 * A framework flavor contributed from outside this package. HMR itself comes
 * from the framework's own Vite plugin; a flavor only adds what the
 * NativeScript dev server must know about it.
 */
export interface FrameworkFlavorDefinition {
	/**
	 * The flavor name. It is what the config helper declares through
	 * `baseConfig({ flavor })`. Must not collide with a built-in name.
	 */
	flavor: string;
	/** Device loader configuration for this flavor (import-map entries, query identity). */
	server?: FrameworkServerStrategy;
}

const BUILT_IN_FLAVORS = new Set(['angular', 'vue', 'react', 'solid', 'typescript', 'javascript']);
const flavors = new Map<string, FrameworkFlavorDefinition>();

/**
 * Register a flavor. Call it before `baseConfig({ flavor })` runs — from the
 * top of the framework's config helper is the natural place. Registering the
 * same flavor again replaces the previous definition.
 */
export function registerFrameworkFlavor(definition: FrameworkFlavorDefinition): void {
	const flavor = String(definition?.flavor || '').trim();
	if (!flavor) throw new TypeError('[@nativescript/vite] registerFrameworkFlavor: `flavor` is required.');
	if (BUILT_IN_FLAVORS.has(flavor)) {
		throw new Error(`[@nativescript/vite] registerFrameworkFlavor: "${flavor}" is a built-in flavor and cannot be replaced.`);
	}
	if (definition.server !== undefined) {
		if (!definition.server || typeof definition.server !== 'object') {
			throw new TypeError(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): \`server\` must be a FrameworkServerStrategy.`);
		}
		if (definition.server.flavor !== flavor) {
			throw new Error(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): the server strategy declares flavor "${definition.server.flavor}".`);
		}
	}
	flavors.set(flavor, { ...definition, flavor });
}

export function getFrameworkFlavor(flavor: string): FrameworkFlavorDefinition | undefined {
	return flavors.get(flavor);
}

/** The server strategy of a built-in or registered flavor. */
export function getFrameworkServerStrategy(flavor: string): FrameworkServerStrategy | undefined {
	return getBuiltInServerStrategy(flavor) ?? flavors.get(flavor)?.server;
}

export function isBuiltInFlavor(flavor: string): boolean {
	return BUILT_IN_FLAVORS.has(flavor);
}
