import type { Plugin } from 'vite';
import type { Plugin as EsbuildPlugin } from 'esbuild';

export interface NativeScriptBuiltinModulesOptions {
	/**
	 * Additional specifiers the NativeScript runtime resolves itself, e.g. the
	 * `node:` shims a runtime version ships. Every `ns:` specifier is always included.
	 */
	include?: Array<string | RegExp>;
}

// Shared by every plugin instance: workers and the HMR server read it too.
const includes: Array<string | RegExp> = [/^ns:/];

/**
 * Leaves imports of runtime builtin modules (`ns:util`, `ns:worker_threads`, ...)
 * for the NativeScript runtime instead of bundling them. The base config already
 * adds it for `ns:`; add another instance to include more specifiers. To polyfill
 * a builtin instead, point a `resolve.alias` entry at the replacement module.
 *
 * @param options Extra specifiers to keep for the runtime.
 * @returns The Vite plugin.
 */
export function nativescriptBuiltinModules(options: NativeScriptBuiltinModulesOptions = {}): Plugin {
	for (const matcher of options.include ?? []) {
		if (!includes.includes(matcher)) {
			includes.push(matcher);
		}
	}
	return {
		name: 'ns-builtin-modules',
		enforce: 'pre',
		resolveId(source) {
			return isBuiltinModuleId(source) ? { id: source, external: true } : null;
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
 * @internal
 */
export function resetBuiltinModules(): void {
	includes.length = 0;
	includes.push(/^ns:/);
}

/**
 * True when `id` is a runtime builtin the output must reference verbatim.
 *
 * @internal
 */
export function isBuiltinModuleId(id: string): boolean {
	if (!id) {
		return false;
	}
	return includes.some((matcher) => {
		if (typeof matcher === 'string') {
			return matcher === id;
		}
		matcher.lastIndex = 0;
		return matcher.test(id);
	});
}

/**
 * esbuild counterpart of `nativescriptBuiltinModules`, for bundles that bypass Vite plugins.
 *
 * @internal
 */
export function builtinModulesEsbuildPlugin(): EsbuildPlugin {
	return {
		name: 'ns-builtin-modules',
		setup(build) {
			build.onResolve({ filter: /^[^./]/ }, (args) => (isBuiltinModuleId(args.path) ? { path: args.path, external: true } : undefined));
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
