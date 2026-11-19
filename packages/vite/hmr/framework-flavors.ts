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
	 * `baseConfig({ flavor })` and what the device receives as
	 * `__NS_TARGET_FLAVOR__`. Must not collide with a built-in name.
	 */
	flavor: string;
	/** Device loader configuration for this flavor (import-map entries, query identity). */
	server?: FrameworkServerStrategy;
	/**
	 * Dev-session vendor policy. `exclude` names package roots the vendor
	 * collection must not seed even though the app lists them in
	 * `dependencies` — the case for a runtime package the flavor's compiler
	 * stands in for (Octane rewrites `from 'octane'` in the components it
	 * compiles to its NativeScript renderer package, so seeding `octane` itself
	 * would evaluate its DOM runtime on device for nothing). An excluded package
	 * still reaches the bundle through whichever vendored package imports it.
	 * Same semantics as `NS_VENDOR_EXCLUDE`.
	 */
	vendor?: {
		exclude?: readonly string[];
	};
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
	if (definition.vendor !== undefined) {
		const exclude = definition.vendor?.exclude;
		const valid = typeof definition.vendor === 'object' && definition.vendor !== null && (exclude === undefined || (Array.isArray(exclude) && exclude.every((name) => typeof name === 'string' && name.trim())));
		if (!valid) {
			throw new TypeError(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): \`vendor.exclude\` must be an array of package names.`);
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

/** Package roots a registered flavor keeps out of the dev vendor collection. */
export function getFlavorVendorExcludes(flavor: string | undefined): ReadonlySet<string> {
	const exclude = flavor ? flavors.get(flavor)?.vendor?.exclude : undefined;
	return new Set((exclude ?? []).map((name) => name.trim()).filter(Boolean));
}

export function isBuiltInFlavor(flavor: string): boolean {
	return BUILT_IN_FLAVORS.has(flavor);
}
