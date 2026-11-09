import type { Compiler } from 'webpack';

interface BuiltinModuleRule {
	matcher: string | RegExp;
	target?: string;
}

const defaultRules: BuiltinModuleRule[] = [{ matcher: /^ns:/ }];

/**
 * @internal
 */
export let builtinModuleRules: BuiltinModuleRule[] = [...defaultRules];

/**
 * @internal
 */
export let builtinModulePolyfills = new Map<string, string>();

/**
 * Leaves imports of a module for the NativeScript runtime to resolve instead of
 * bundling them. Every `ns:` specifier is handled this way by default; use this
 * for the `node:` modules your runtime version ships a shim for.
 *
 * Examples:
 *  - addBuiltinModule('node:worker_threads')
 *  - addBuiltinModule('worker_threads', 'node:worker_threads')
 *  - addBuiltinModule(/^(?:node:)?(url|util)$/, 'node:$1')
 *
 * @param matcher Exact specifier, or RegExp tested against each import specifier.
 * @param target Specifier to emit instead; with a RegExp matcher it may use `$1`-style replacements.
 */
export function addBuiltinModule(matcher: string | RegExp, target?: string) {
	builtinModuleRules.push({ matcher, target });
}

/**
 * Bundles a module in place of a builtin one, for runtimes that don't provide it.
 * Takes precedence over every builtin module rule, including the `ns:` default.
 *
 * @param specifier Exact import specifier, e.g. `ns:url`.
 * @param path Absolute path or package specifier of the replacement module.
 */
export function polyfillBuiltinModule(specifier: string, path: string) {
	builtinModulePolyfills.set(specifier, path);
}

/**
 * @internal
 */
export function resetBuiltinModules() {
	builtinModuleRules = [...defaultRules];
	builtinModulePolyfills = new Map();
}

/**
 * Returns the specifier the runtime should load for `request`, or undefined
 * when the request should be bundled.
 *
 * @internal
 */
export function getBuiltinModuleTarget(specifier: string): string | undefined {
	const target = matchBuiltinModuleRule(specifier);
	if (
		!target ||
		builtinModulePolyfills.has(specifier) ||
		builtinModulePolyfills.has(target)
	) {
		return undefined;
	}
	return target;
}

/**
 * Returns the polyfill registered for `specifier` or for the target a rule maps it to.
 *
 * @internal
 */
export function getBuiltinModulePolyfill(
	specifier: string,
): string | undefined {
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
 * Webpack `externals` function for builtin modules. Rules are read per request,
 * so helpers called after the base config is built still apply.
 *
 * @internal
 */
export function builtinModulesExternal(
	{ request }: { request?: string },
	callback: (err?: Error, result?: string) => void,
) {
	const target = getBuiltinModuleTarget(request);
	if (target) {
		return callback(undefined, target);
	}
	callback();
}

/**
 * Redirects polyfilled builtin specifiers to their replacement module.
 *
 * @internal
 */
export class BuiltinModulePolyfillPlugin {
	apply(compiler: Compiler) {
		compiler.hooks.normalModuleFactory.tap(
			'BuiltinModulePolyfillPlugin',
			(nmf) => {
				// Webpack treats `ns:url` as a URL scheme, which skips resolve.alias.
				nmf.hooks.beforeResolve.tap('BuiltinModulePolyfillPlugin', (data) => {
					const polyfill = getBuiltinModulePolyfill(data.request);
					if (polyfill) {
						data.request = polyfill;
					}
				});
			},
		);
	}
}
