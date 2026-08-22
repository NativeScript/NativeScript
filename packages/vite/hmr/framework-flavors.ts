import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { FrameworkServerStrategy } from './server/framework-strategy.js';
import { getProjectRootPath } from '../helpers/project.js';

/**
 * A framework flavor contributed from outside this package.
 *
 * The built-in flavors (`angular`, `vue`, `react`, `solid`, `typescript`,
 * `javascript`) are wired by name inside `@nativescript/vite`. Everything a
 * flavor needs beyond a name is expressed here, so a framework can ship its
 * own HMR support as a package: the server half runs in the dev server
 * process; the client half is a module the device fetches and evaluates next
 * to the shared HMR client.
 */
export interface FrameworkFlavorDefinition {
	/**
	 * The flavor name. It is what the config helper declares through
	 * `baseConfig({ flavor })`, what the device receives as `__NS_TARGET_FLAVOR__`,
	 * and what selects both strategies. Must not collide with a built-in name.
	 */
	flavor: string;
	/**
	 * The dev-server half. Most frameworks start from `typescriptServerStrategy`
	 * (the generic device-module pipeline) and override `handleHotUpdate`.
	 */
	server: FrameworkServerStrategy;
	/**
	 * The device half: a module specifier resolvable from the app's root —
	 * usually a package subpath such as `@my-framework/nativescript-vite/client`.
	 * The module is served to the device as-is through `/ns/m`, so it must be
	 * plain ESM with explicit `.js` import extensions, importing shared client
	 * helpers only from `@nativescript/vite/hmr/client/framework.js`. It exports
	 * the strategy as `default`, `clientStrategy`, or `<flavor>ClientStrategy`.
	 */
	client: string;
}

const BUILT_IN_FLAVORS = new Set(['angular', 'vue', 'react', 'solid', 'typescript', 'javascript']);
const flavors = new Map<string, FrameworkFlavorDefinition>();

/**
 * Register a flavor. Call it before `baseConfig({ flavor })` runs — from the
 * top of the framework's config helper is the natural place — so the HMR
 * plugins the base config installs can find the server strategy, and the
 * device bundle is seeded with the client strategy's URL. Registering the
 * same flavor again replaces the previous definition.
 */
export function registerFrameworkFlavor(definition: FrameworkFlavorDefinition): void {
	const flavor = String(definition?.flavor || '').trim();
	if (!flavor) throw new TypeError('[@nativescript/vite] registerFrameworkFlavor: `flavor` is required.');
	if (BUILT_IN_FLAVORS.has(flavor)) {
		throw new Error(`[@nativescript/vite] registerFrameworkFlavor: "${flavor}" is a built-in flavor and cannot be replaced.`);
	}
	if (!definition.server || typeof definition.server.matchesFile !== 'function' || typeof definition.server.processFile !== 'function' || typeof definition.server.buildRegistry !== 'function') {
		throw new TypeError(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): \`server\` must be a FrameworkServerStrategy.`);
	}
	if (typeof definition.client !== 'string' || !definition.client.trim()) {
		throw new TypeError(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): \`client\` must be a module specifier.`);
	}
	if (definition.server.flavor !== flavor) {
		throw new Error(`[@nativescript/vite] registerFrameworkFlavor("${flavor}"): the server strategy declares flavor "${definition.server.flavor}".`);
	}
	flavors.set(flavor, { ...definition, flavor });
}

export function getFrameworkFlavor(flavor: string): FrameworkFlavorDefinition | undefined {
	return flavors.get(flavor);
}

/**
 * Package names that ship a registered flavor's client strategy. The device
 * pipeline treats them like `@nativescript/vite` itself: served per-module
 * through `/ns/m`, never through the vendor bundle or the plugin registry
 * shim, so the module's own relative imports and its imports of the shared
 * client surface resolve to the live client's canonical URLs.
 */
export function getFlavorClientPackages(): ReadonlySet<string> {
	const names = new Set<string>();
	for (const definition of flavors.values()) {
		const name = packageNameOfSpecifier(definition.client);
		if (name) names.add(name);
	}
	return names;
}

function packageNameOfSpecifier(specifier: string): string | null {
	if (!specifier || specifier.startsWith('.') || path.isAbsolute(specifier)) return null;
	const parts = specifier.split('/');
	return specifier.startsWith('@') ? (parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null) : parts[0];
}

export function isBuiltInFlavor(flavor: string): boolean {
	return BUILT_IN_FLAVORS.has(flavor);
}

/**
 * The device-side URL path of a registered flavor's client strategy module —
 * `/ns/m/node_modules/<package>/<file>` — or `''` for a built-in / unknown
 * flavor. The specifier is resolved from the app root like any import, then
 * expressed relative to its package so the path holds whether the package is
 * installed or linked from a workspace.
 */
export function getClientStrategyDevicePath(flavor: string, projectRoot: string = getProjectRootPath()): string {
	const definition = flavors.get(flavor);
	if (!definition) return '';
	const resolved = resolveFromProject(definition.client, projectRoot);
	const pkg = findPackageRoot(resolved);
	if (!pkg) {
		throw new Error(`[@nativescript/vite] flavor "${flavor}": client module ${definition.client} resolved to ${resolved}, which is not inside a package.`);
	}
	const inside = path.relative(pkg.dir, resolved).split(path.sep).join('/');
	return `/ns/m/node_modules/${pkg.name}/${inside}`;
}

function resolveFromProject(specifier: string, projectRoot: string): string {
	if (path.isAbsolute(specifier)) return specifier;
	const require = createRequire(path.join(projectRoot, 'package.json'));
	try {
		return require.resolve(specifier);
	} catch (error) {
		throw new Error(`[@nativescript/vite] cannot resolve client strategy module ${JSON.stringify(specifier)} from ${projectRoot}: ${(error as Error).message}`);
	}
}

function findPackageRoot(file: string): { dir: string; name: string } | null {
	let dir = path.dirname(file);
	for (;;) {
		const manifest = path.join(dir, 'package.json');
		if (existsSync(manifest)) {
			try {
				const name = JSON.parse(readFileSync(manifest, 'utf8')).name;
				if (typeof name === 'string' && name) return { dir, name };
			} catch {}
		}
		const parent = path.dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}
