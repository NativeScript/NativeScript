import type { Plugin } from 'vite';
import type { Plugin as EsbuildPlugin } from 'esbuild';

interface BuiltinModuleRule {
	matcher: string | RegExp;
	target?: string;
}

const defaultRules: BuiltinModuleRule[] = [{ matcher: /^ns:/ }];

let builtinModuleRules: BuiltinModuleRule[] = [...defaultRules];
let builtinModulePolyfills = new Map<string, string>();
const emittedTargets = new Set<string>();

/**
 * Leaves imports of a module for the NativeScript runtime to resolve instead of
 * bundling them. Every `ns:` specifier is handled this way by default; use this
 * for the `node:` modules your runtime version ships a shim for. Call it in
 * `vite.config` before returning the config.
 *
 * Examples:
 *  - addBuiltinModule('node:worker_threads')
 *  - addBuiltinModule('worker_threads', 'node:worker_threads')
 *  - addBuiltinModule(/^(?:node:)?(url|util)$/, 'node:$1')
 *
 * @param matcher Exact specifier, or RegExp tested against each import specifier.
 * @param target Specifier to emit instead; with a RegExp matcher it may use `$1`-style replacements.
 */
export function addBuiltinModule(matcher: string | RegExp, target?: string): void {
	builtinModuleRules.push({ matcher, target });
}

/**
 * Bundles a module in place of a builtin one, for runtimes that don't provide it.
 * Takes precedence over every builtin module rule, including the `ns:` default.
 *
 * @param specifier Exact import specifier, e.g. `ns:url`.
 * @param path Absolute path or package specifier of the replacement module.
 */
export function polyfillBuiltinModule(specifier: string, path: string): void {
	builtinModulePolyfills.set(specifier, path);
}

/**
 * @internal
 */
export function resetBuiltinModules(): void {
	builtinModuleRules = [...defaultRules];
	builtinModulePolyfills = new Map();
	emittedTargets.clear();
}

/**
 * Returns the specifier the runtime should load for `specifier`, or undefined
 * when it should be bundled.
 *
 * @internal
 */
export function getBuiltinModuleTarget(specifier: string): string | undefined {
	const target = matchBuiltinModuleRule(specifier);
	if (!target || builtinModulePolyfills.has(specifier) || builtinModulePolyfills.has(target)) {
		return undefined;
	}
	return target;
}

/**
 * Returns the polyfill registered for `specifier` or for the target a rule maps it to.
 *
 * @internal
 */
export function getBuiltinModulePolyfill(specifier: string): string | undefined {
	if (!specifier) {
		return undefined;
	}
	const polyfill = builtinModulePolyfills.get(specifier);
	if (polyfill) {
		return polyfill;
	}
	const target = matchBuiltinModuleRule(specifier);
	return target ? builtinModulePolyfills.get(target) : undefined;
}

function matchBuiltinModuleRule(specifier: string): string | undefined {
	if (!specifier) {
		return undefined;
	}

	for (const { matcher, target } of builtinModuleRules) {
		if (typeof matcher === 'string') {
			if (matcher === specifier) {
				return target ?? specifier;
			}
			continue;
		}

		matcher.lastIndex = 0;
		if (matcher.test(specifier)) {
			matcher.lastIndex = 0;
			return target ? specifier.replace(matcher, target) : specifier;
		}
	}

	return undefined;
}

/**
 * True when `id`, an already-resolved import id, is a runtime builtin the
 * bundle must reference verbatim.
 *
 * @internal
 */
export function isBuiltinModuleId(id: string): boolean {
	if (!id || builtinModulePolyfills.has(id)) {
		return false;
	}
	return id.startsWith('ns:') || emittedTargets.has(id) || getBuiltinModuleTarget(id) === id;
}

/**
 * Resolves builtin module specifiers to externals (or their polyfill) ahead of
 * Vite's resolver, which would otherwise stub `node:` builtins for the browser.
 *
 * @internal
 */
export function builtinModulesPlugin(): Plugin {
	return {
		name: 'ns-builtin-modules',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			const polyfill = getBuiltinModulePolyfill(source);
			if (polyfill) {
				return this.resolve(polyfill, importer, { ...options, skipSelf: true });
			}
			const target = getBuiltinModuleTarget(source);
			if (target) {
				emittedTargets.add(target);
				return { id: target, external: true };
			}
			return null;
		},
		// The dev server still pre-transforms external ids; the device never fetches these.
		load(id) {
			if (isBuiltinModuleId(id)) {
				return `throw new Error(${JSON.stringify(`${id} is a NativeScript runtime builtin and must be imported directly`)});`;
			}
			return null;
		},
	};
}

/**
 * esbuild counterpart of `builtinModulesPlugin`, for bundles that bypass Vite plugins.
 *
 * @internal
 */
export function builtinModulesEsbuildPlugin(): EsbuildPlugin {
	return {
		name: 'ns-builtin-modules',
		setup(build) {
			build.onResolve({ filter: /^[^./]/ }, async (args) => {
				const polyfill = getBuiltinModulePolyfill(args.path);
				if (polyfill) {
					const resolved = await build.resolve(polyfill, { kind: args.kind, resolveDir: args.resolveDir, importer: args.importer });
					return resolved.errors.length ? undefined : { path: resolved.path };
				}
				const target = getBuiltinModuleTarget(args.path);
				if (target) {
					emittedTargets.add(target);
					return { path: target, external: true };
				}
				return undefined;
			});
		},
	};
}

const WRAPPED_ID_RE = /(["'`])\/@id\/([^"'`?#\s]+)(?:[?#][^"'`\s]*)?\1/g;

/**
 * Restores `/@id/<builtin>` specifiers, which Vite's dev import analysis emits
 * for external ids, to the verbatim specifier the runtime resolves.
 *
 * @internal
 */
export function unwrapBuiltinModuleIds(code: string): string {
	if (!code || code.indexOf('/@id/') === -1) {
		return code;
	}
	return code.replace(WRAPPED_ID_RE, (full, quote: string, id: string) => (isBuiltinModuleId(id) ? `${quote}${id}${quote}` : full));
}
