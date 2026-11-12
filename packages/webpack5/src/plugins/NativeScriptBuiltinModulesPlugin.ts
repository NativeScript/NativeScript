import type { Compiler } from 'webpack';

// webpack 5.112 moved it into externals/.
const ExternalModuleFactoryPlugin = (() => {
	try {
		return require('webpack/lib/externals/ExternalModuleFactoryPlugin');
	} catch {
		return require('webpack/lib/ExternalModuleFactoryPlugin');
	}
})();

export interface NativeScriptBuiltinModulesPluginOptions {
	/**
	 * Specifiers the NativeScript runtime resolves itself, left as-is in the bundle.
	 * Defaults to every `ns:` specifier.
	 */
	include?: Array<string | RegExp>;
}

const PLUGIN_NAME = 'NativeScriptBuiltinModulesPlugin';

/**
 * Leaves imports of runtime builtin modules (`ns:util`, `ns:worker_threads`, ...)
 * for the NativeScript runtime instead of bundling them.
 *
 * Matching runs on the request after `beforeResolve`, so a plugin such as
 * `NormalModuleReplacementPlugin` can redirect a builtin to a polyfill.
 */
export class NativeScriptBuiltinModulesPlugin {
	private readonly include: Array<string | RegExp>;

	constructor(options: NativeScriptBuiltinModulesPluginOptions = {}) {
		this.include = options.include ?? [/^ns:/];
	}

	matches(request: string): boolean {
		if (!request) {
			return false;
		}
		return this.include.some((matcher) => {
			if (typeof matcher === 'string') {
				return matcher === request;
			}
			matcher.lastIndex = 0;
			return matcher.test(request);
		});
	}

	apply(compiler: Compiler) {
		compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (nmf) => {
			nmf.hooks.factorize.tapAsync(PLUGIN_NAME, (data, callback) => {
				const request = data.request;
				if (!this.matches(request)) {
					return callback();
				}
				// Webpack's own factory picks the external type for the output format.
				let factorize: (data: unknown, callback: unknown) => void;
				new ExternalModuleFactoryPlugin(
					compiler.options.externalsType,
					(_: unknown, cb: (err?: Error, result?: string) => void) =>
						cb(undefined, request),
				).apply({
					hooks: {
						factorize: { tapAsync: (_: string, fn) => (factorize = fn) },
					},
				});
				factorize(data, callback);
			});
		});
	}
}
