import { extname, resolve } from 'path';
import Config from 'webpack-chain';
import { existsSync } from 'fs';

import { getProjectFilePath } from '../helpers/project';
import { env as _env, IWebpackEnv } from '../index';
import {
	getEntryDirPath,
	getEntryPath,
	getPlatformName,
} from '../helpers/platform';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatformName();

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
	config.module
		.rule('css')
		.include.add(resolve(getEntryDirPath(), 'app.css'))
		.add(resolve(getEntryDirPath(), `app.${platform}.css`))
		.add(/node_modules/);

	// and instead use raw-loader, since that's what angular expects
	config.module
		.rule('css|component')
		.exclude.add(resolve(getEntryDirPath(), 'app.css'))
		.add(resolve(getEntryDirPath(), `app.${platform}.css`))
		.add(/node_modules/)
		.end()
		.test(/\.css$/)
		.use('raw-loader')
		.loader('raw-loader');

	// get base postCSS options
	const postCSSOptions = config.module
		.rule('scss')
		.uses.get('postcss-loader')
		.get('options');

	// exclude component css files from the normal css rule
	config.module
		.rule('scss')
		.include.add(resolve(getEntryDirPath(), 'app.scss'))
		.add(resolve(getEntryDirPath(), `app.${platform}.scss`))
		.add(/node_modules/);

	// and instead use raw-loader, since that's what angular expects
	config.module
		.rule('scss|component')
		.exclude.add(resolve(getEntryDirPath(), 'app.scss'))
		.add(resolve(getEntryDirPath(), `app.${platform}.scss`))
		.add(/node_modules/)
		.end()
		.test(/\.scss$/)
		.use('raw-loader')
		.loader('raw-loader')
		.end()
		.use('postcss-loader')
		.loader('postcss-loader')
		.options(postCSSOptions)
		.end()
		.use('sass-loader')
		.loader('sass-loader');

	const angularCompilerPlugin = getAngularCompilerPlugin();
	if (angularCompilerPlugin) {
		config.plugin('AngularCompilerPlugin').use(angularCompilerPlugin, [
			{
				tsConfigPath,
				mainPath: getEntryPath(),
				// disable type checking in a forked process - it ignores
				// the hostReplacementPaths and prints errors about
				// platform suffixed files, even though they are
				// working as expected.
				forkTypeChecker: false,
				hostReplacementPaths(path: string) {
					const ext = extname(path);
					const platformExt = `.${platform}${ext}`;

					// already includes a platform specific extension - ignore
					if (path.includes(platformExt)) {
						return path;
					}

					const platformPath = path.replace(ext, platformExt);
					// check if the same file exists with a platform suffix and return if it does.
					if (existsSync(platformPath)) {
						// console.log(`[hostReplacementPaths] resolving "${path}" to "${platformPath}"`);
						return platformPath;
					}

					// just return the original path otherwise
					return path;
				},
				platformTransformers: [require('../transformers/NativeClass').default],
			},
		]);
	}

	const angularWebpackPlugin = getAngularWebpackPlugin();
	if (angularWebpackPlugin) {
		// angular no longer supports transformers.
		// so we patch their method until they do
		// https://github.com/angular/angular-cli/pull/21046
		const originalCreateFileEmitter =
			angularWebpackPlugin.prototype.createFileEmitter;
		angularWebpackPlugin.prototype.createFileEmitter = function (
			...args: any[]
		) {
			let transformers = args[1] || {};
			if (!transformers.before) {
				transformers.before = [];
			}
			transformers.before.push(require('../transformers/NativeClass').default);
			args[1] = transformers;
			return originalCreateFileEmitter.apply(this, args);
		};
		config.plugin('AngularWebpackPlugin').use(angularWebpackPlugin, [
			{
				tsconfig: tsConfigPath,
				directTemplateLoading: false,
			},
		]);

		config.when(env.hmr, (config) => {
			config.module
				.rule('angular-hmr')
				.enforce('post')
				.test(getEntryPath())
				.use('angular-hot-loader')
				.loader('angular-hot-loader');
		});
	}

	// look for platform specific polyfills first
	// falling back to independent polyfills
	const polyfillsPath = [
		resolve(getEntryDirPath(), `polyfills.${platform}.ts`),
		resolve(getEntryDirPath(), `polyfills.ts`),
	].find((path) => existsSync(path));

	if (polyfillsPath) {
		const paths = config.entry('bundle').values();

		// replace globals with the polyfills file which
		// should handle loading the correct globals
		// and any additional polyfills required.
		if (paths.includes('@nativescript/core/globals/index.js')) {
			paths[
				paths.indexOf('@nativescript/core/globals/index.js')
			] = polyfillsPath;

			// replace paths with the updated paths
			config.entry('bundle').clear().merge(paths);
		}
	}

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
			/environment(\.(\w+))?\.ts is part of the TypeScript compilation but it's unused/,
			// Additional rules to suppress warnings that are safe to ignore
			{
				module: /@angular\/core\/(__ivy_ngcc__\/)?fesm2015\/core.js/,
				message: /Critical dependency: the request of a dependency is an expression/,
			},
			/core\/profiling/,
			/core\/ui\/styling/,
		])
	);

	return config;
}

function getAngularCompilerPlugin(): any {
	const { AngularCompilerPlugin } = require('@ngtools/webpack');
	return AngularCompilerPlugin;
}

function getAngularWebpackPlugin(): any {
	const { AngularWebpackPlugin } = require('@ngtools/webpack');
	return AngularWebpackPlugin;
}
