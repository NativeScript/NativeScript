// Statically imported: a runtime without the builtin has no createRequire to delegate to,
// and a static import serves every isolate (workers too) synchronously.
import { createRequire } from 'ns:module';
import { knownFolders } from '@nativescript/core/file-system';

/**
 * How a dependency's hoisted `import * as ns` maps to what `require` returns:
 * - `esm`: an ES module namespace; `require` returns its CommonJS view.
 * - `default`: `ns.default` is the CommonJS value (JSON, or a CommonJS
 *   pre-bundle imported from an ESM importer, which import analysis shapes as
 *   `{ ...module.exports, default: module.exports }`).
 * - `interop`: a CommonJS pre-bundle imported from a non-ESM importer, which
 *   import analysis shapes as `module.exports` itself when it has `__esModule`,
 *   else as `{ ...module.exports, default: module.exports }`.
 */
export type ModuleRequireKind = 'esm' | 'default' | 'interop';

type ModuleRequireDeps = Record<string, readonly [namespace: any, kind: ModuleRequireKind]>;

export interface ModuleRequire {
	(specifier: string): any;
	resolve: (specifier: string) => never;
	context: (...args: unknown[]) => never;
	readonly cache: never;
}

const views = new WeakMap<object, object>();

// Getters keep the namespace's live bindings and read nothing at creation, so a
// require inside an import cycle does not trip over uninitialized exports.
// Same shape as the optimizer's require facade (Node's require(esm) conventions):
// `module.exports` wins, and `__esModule` is added only next to a `default`
// export, so TypeScript's and Babel's interop helpers pick that `default`.
function commonJsView(namespace: object): unknown {
	const keys = Reflect.ownKeys(namespace).filter((key): key is string => typeof key === 'string');
	if (keys.includes('module.exports')) return (namespace as any)['module.exports'];
	let view = views.get(namespace);
	if (!view) {
		view = keys.includes('default') && !keys.includes('__esModule') ? Object.defineProperty({}, '__esModule', { value: true }) : {};
		for (const key of keys) {
			Object.defineProperty(view, key, { enumerable: true, get: () => (namespace as any)[key] });
		}
		views.set(namespace, view);
	}
	return view;
}

function exportsOf(namespace: any, kind: ModuleRequireKind): unknown {
	if (kind === 'default') return namespace.default;
	if (kind === 'interop') return namespace.__esModule ? namespace : namespace.default;
	return commonJsView(namespace);
}

// Builtins, and files on disk by absolute path or file: URL.
const runtimeSpecifierRE = /^(?:ns:|node:|file:|\/)/;
let runtimeRequire: ((specifier: string) => unknown) | undefined;

/**
 * The `require` the dev server injects into a served module that uses one.
 * Specifiers it was not given go to the runtime's `createRequire` when they
 * name a builtin (`ns:` / `node:`) or a file on disk (an absolute path or a
 * `file:` URL); anything else throws.
 *
 * @param importer The module's root-relative path, for error messages.
 * @param deps The module's string-literal specifiers that resolved when it was served, each with its hoisted namespace import.
 */
export function createModuleRequire(importer: string, deps: ModuleRequireDeps): ModuleRequire {
	const unsupported = (what: string) => (): never => {
		throw new Error(`${what} is not supported in dev (in ${importer}). Use import or import() instead.`);
	};
	const require = ((specifier: string) => {
		if (typeof specifier === 'string') {
			if (Object.prototype.hasOwnProperty.call(deps, specifier)) {
				const [namespace, kind] = deps[specifier];
				return exportsOf(namespace, kind);
			}
			if (runtimeSpecifierRE.test(specifier)) {
				// The runtime refuses http(s) bases, so files resolve against the app root on disk.
				runtimeRequire ??= createRequire(`${knownFolders.currentApp().path}/`);
				return runtimeRequire(specifier);
			}
		}
		throw new Error(`require(${JSON.stringify(specifier)}) in ${importer}: in dev, require only serves string-literal specifiers that resolve when the module is served, ns:/node: builtins, and files on disk by absolute path or file: URL. Use import or import() instead.`);
	}) as ModuleRequire;
	require.resolve = unsupported('require.resolve');
	require.context = unsupported('require.context');
	Object.defineProperty(require, 'cache', { get: unsupported('require.cache') });
	return require;
}
