import Config from 'webpack-chain';
import { existsSync } from 'fs';

import { getProjectFilePath } from '../helpers/project';
import { env as _env, IWebpackEnv } from '../index';
import { getEntryPath } from '../helpers/platform';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const tsConfigPath = [
		getProjectFilePath('tsconfig.app.json'),
		getProjectFilePath('tsconfig.json'),
	].find((path) => existsSync(path));

	// remove default ts rule
	config.module.rules.delete('ts');

	// remove fork ts checked as not needed
	config.plugins.delete('ForkTsCheckerWebpackPlugin');

	// explicitly define mainFields to make sure ngcc compiles as es2015 (module field)
	// instead of umd (main field).
	config.resolve.mainFields.add('module').add('main');

	config.module
		.rule('angular')
		.test(/(?:\.ngfactory.js|\.ngstyle\.js|\.ts)$/)
		.use('@ngtools/webpack')
		.loader('@ngtools/webpack');

	config.module
		.rule('@angular/core')
		.test(/[\/\\]@angular[\/\\]core[\/\\].+\.js$/)
		.parser({ system: true });

	// set up html
	config.module
		.rule('html')
		.test(/\.html$/)
		.use('raw-loader')
		.loader('raw-loader');

	// exclude component css files from the normal css rule
	config.module.rule('css').exclude.add(/\.component\.css$/);

	// and instead use raw-loader, since that's what angular expects
	config.module
		.rule('css|component')
		.test(/\.component\.css$/)
		.use('raw-loader')
		.loader('raw-loader');

	// get base postCSS options
	const postCSSOptions = config.module
		.rule('scss')
		.uses.get('postcss-loader')
		.get('options');

	// exclude component css files from the normal css rule
	config.module.rule('scss').exclude.add(/\.component\.scss$/);

	// and instead use raw-loader, since that's what angular expects
	config.module
		.rule('scss|component')
		.test(/\.component\.scss$/)
		.use('raw-loader')
		.loader('raw-loader')
		.end()
		.use('postcss-loader')
		.loader('postcss-loader')
		.options(postCSSOptions)
		.end()
		.use('sass-loader')
		.loader('sass-loader');

	config.plugin('AngularCompilerPlugin').use(getAngularCompilerPlugin(), [
		{
			tsConfigPath,
			mainPath: getEntryPath(),
			platformTransformers: [require('../transformers/NativeClass').default],
		},
	]);

	// Filter common undesirable warnings
	config.set(
		'ignoreWarnings',
		(config.get('ignoreWarnings') ?? []).concat([
			/**
			 * This rule hides
			 * +-----------------------------------------------------------------------------------------+
			 * | WARNING in Zone.js does not support native async/await in ES2017+.                      |
			 * | These blocks are not intercepted by zone.js and will not triggering change detection.   |
			 * | See: https://github.com/angular/zone.js/pull/1140 for more information.                 |
			 * +-----------------------------------------------------------------------------------------+
			 */
			/Zone\.js does not support native async\/await/,
			/**
			 * This rule hides
			 * +-----------------------------------------------------------------------------------------+
			 * | WARNING in environment.*.ts is part of the TypeScript compilation but it's unused.      |
			 * | Add only entry points to the 'files' or 'include' properties in your tsconfig.          |
			 * +-----------------------------------------------------------------------------------------+
			 */
			/environment.(\w+).ts is part of the TypeScript compilation but it's unused/,
		])
	);

	return config;
}

function getAngularCompilerPlugin() {
	const { AngularCompilerPlugin } = require('@ngtools/webpack');
	return AngularCompilerPlugin;
}
