import Config from 'webpack-chain';
import fs from 'fs';

import base from '../../src/configuration/base';
import { init } from '../../src';
import { applyFileReplacements } from '../../src/helpers/fileReplacements';
import * as dependenciesHelpers from '../../src/helpers/dependencies';
import { additionalCopyRules } from '../../src/helpers/copyRules';

describe('base configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,

				// only test in base config to make sure App_Resources
				// are properly excluded from the copy-rules
				appResourcesPath: 'custom_app_resources',
			});
			expect(base(new Config()).toString()).toMatchSnapshot();
		});
	}

	it('supports tsconfig.app.json if exists', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.withImplementation(
			(path) => {
				return path.toString().endsWith('tsconfig.app.json');
			},
			() => {
				init({
					ios: true,
				});
				const config = base(new Config());

				expect(fsSpy).toHaveBeenCalledWith('__jest__/tsconfig.app.json');
				expect(fsSpy).not.toHaveBeenCalledWith('__jest__/tsconfig.json');

				let configFiles = [];

				config.module
					.rule('ts')
					.use('ts-loader')
					.tap((options) => {
						configFiles.push(options.configFile);
						return options;
					});

				config.plugin('ForkTsCheckerWebpackPlugin').tap((args) => {
					configFiles.push(args.at(0).typescript.configFile);
					return args;
				});

				expect(configFiles.length).toBe(2);
				expect(configFiles).toEqual([
					'__jest__/tsconfig.app.json', // ts-loader
					'__jest__/tsconfig.app.json', // fork-ts-checker
				]);
			},
		);
	});

	it('falls back to tsconfig.json if no tsconfig.app.json exists', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.withImplementation(
			(path) => {
				return path.toString().endsWith('tsconfig.json');
			},
			() => {
				init({
					ios: true,
				});
				const config = base(new Config());

				expect(fsSpy).toHaveBeenCalledWith('__jest__/tsconfig.app.json');
				expect(fsSpy).toHaveBeenCalledWith('__jest__/tsconfig.json');

				let configFiles = [];

				config.module
					.rule('ts')
					.use('ts-loader')
					.tap((options) => {
						configFiles.push(options.configFile);
						return options;
					});

				config.plugin('ForkTsCheckerWebpackPlugin').tap((args) => {
					configFiles.push(args.at(0).typescript.configFile);
					return args;
				});

				expect(configFiles.length).toBe(2);
				expect(configFiles).toEqual([
					'__jest__/tsconfig.json', // ts-loader
					'__jest__/tsconfig.json', // fork-ts-checker
				]);
			},
		);
	});

	it('support env.watchNodeModules', () => {
		init({
			ios: true,
			watchNodeModules: true,
		});
		expect(base(new Config()).get('snapshot')).toMatchSnapshot();
	});

	it('supports dotenv', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.withImplementation(
			(path) => {
				return path.toString().endsWith('__jest__/.env');
			},
			() => {
				init({
					ios: true,
				});
				const config = base(new Config());

				expect(config.plugin('DotEnvPlugin')).toBeDefined();
				config.plugin('DotEnvPlugin').tap((args) => {
					expect(args[0].path).toEqual('__jest__/.env');
					return args;
				});
			},
		);

		fsSpy.mockRestore();
	});

	it('supports env specific dotenv', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.withImplementation(
			(path) => {
				return path.toString().endsWith('__jest__/.env.prod');
			},
			() => {
				init({
					ios: true,
					env: 'prod',
				});
				const config = base(new Config());

				expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod');
				expect(config.plugin('DotEnvPlugin')).toBeDefined();
				config.plugin('DotEnvPlugin').tap((args) => {
					expect(args[0].path).toEqual('__jest__/.env.prod');
					return args;
				});
			},
		);
		fsSpy.mockRestore();
	});

	it('falls back to default .env', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.withImplementation(
			(path) => {
				return path.toString().endsWith('__jest__/.env');
			},
			() => {
				init({
					ios: true,
					env: 'prod',
				});
				const config = base(new Config());

				expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod');
				expect(fsSpy).toHaveBeenCalledWith('__jest__/.env');
				expect(config.plugin('DotEnvPlugin')).toBeDefined();
				config.plugin('DotEnvPlugin').tap((args) => {
					expect(args[0].path).toEqual('__jest__/.env');
					return args;
				});
			},
		);
		fsSpy.mockRestore();
	});

	it('applies file replacements', () => {
		const config = new Config();
		applyFileReplacements(config, {
			// should apply as an alias
			'foo.ts': 'foo.replaced.ts',
			'bar.js': 'bar.replaced.js',

			// should apply as a file replacement using the copy plugin
			'foo.json': 'foo.replaced.json',
		});

		expect(config.resolve.alias.get('foo.ts')).toBe('foo.replaced.ts');
		expect(config.resolve.alias.get('bar.js')).toBe('bar.replaced.js');
		expect(additionalCopyRules.length).toBe(1);
		expect(additionalCopyRules[0]).toEqual({
			from: 'foo.replaced.json',
			to: 'foo.json',
			force: true,
		});
	});

	it('supports --env.profile', () => {
		init({
			platform: 'ios',
			profile: true,
		});
		const config = base(new Config());

		expect(config.get('profile')).toBe(true);
	});

	it('supports env.sourceMap=hidden-source-map', () => {
		init({
			ios: true,
			sourceMap: 'hidden-source-map',
		});
		const config = base(new Config());

		expect(config.output.get('sourceMapFilename')).toMatchSnapshot();
		expect(config.get('devtool')).toBe('hidden-source-map');
	});

	it('includes inspector_modules on android when @nativescript/core version is >= 8.7.0', () => {
		const getDependencyVersionSpy = jest.spyOn(
			dependenciesHelpers,
			'getDependencyVersion',
		);
		getDependencyVersionSpy.withImplementation(
			(name) => {
				if (name === '@nativescript/core') {
					return '8.7.0';
				}
				return null;
			},
			() => {
				init({
					android: true,
				});

				const config = base(new Config());
				const entry = config.entryPoints.get('tns_modules/inspector_modules');

				expect(entry).toBeDefined();
				expect(entry.values().length).toBe(1);
			},
		);
	});
});
