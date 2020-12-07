import Config from 'webpack-chain';
import path from 'path';

import { getProjectRootPath } from '../helpers/project';
import { env as _env, IWebpackEnv } from '../index';
import { getEntryPath } from '../helpers/platform';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const tsConfigPath = path.join(getProjectRootPath(), 'tsconfig.json');

	// remove default ts rule
	config.module.rules.delete('ts');

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

	config.plugin('AngularCompilerPlugin').use(getAngularCompilerPlugin(), [
		{
			tsConfigPath,
			mainPath: getEntryPath(),
			platformTransformers: [require('../transformers/NativeClass').default],
		},
	]);

	return config;
}

function getAngularCompilerPlugin() {
	const { AngularCompilerPlugin } = require('@ngtools/webpack');
	return AngularCompilerPlugin;
}
