import webpack from 'webpack';

const id = 'RuntimePackageJSONPlugin';

/**
 * The platform suffix plugin will try to resolve files with a platform specifier (suffix)
 * falling back to the non-platform-specific version.
 *
 * For example:
 *   import something from './something.js'
 *
 *   will first look for './something.<platform>.js'
 *   and if not found look for './something.js'
 *
 */
export class RuntimePackageJSONPlugin {
	constructor(private additionalContents: Record<string, any>) {}

	apply(compiler: webpack.Compiler) {
		compiler.hooks.compilation.tap(id, (compilation) => {
			compilation.assets['package.json'] = new webpack.sources.RawSource(
				JSON.stringify(
					Object.assign({}, this.additionalContents, { main: 'bundle' }),
					null,
					2
				)
			);
		});
	}
}
