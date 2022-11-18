import Config from 'webpack-chain';
import fs from 'fs';

import base from '../../src/configuration/base';
import { init } from '../../src';
import { applyFileReplacements } from '../../src/helpers/fileReplacements';
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

	it('support env.watchNodeModules', () => {
		init({
			ios: true,
			watchNodeModules: true,
		});
		expect(base(new Config()).get('snapshot')).toMatchSnapshot();
	});

	it('supports dotenv', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.mockReturnValue(true);

		init({
			ios: true,
		});
		const config = base(new Config());

		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env');
			return args;
		});

		fsSpy.mockRestore();
	});

	it('supports env specific dotenv', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.mockReturnValue(true);

		init({
			ios: true,
			env: 'prod',
		});
		const config = base(new Config());

		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod');
		expect(fsSpy).toHaveBeenCalledTimes(1);
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env.prod');
			return args;
		});
		fsSpy.mockRestore();
	});

	it('falls back to default .env', () => {
		const fsSpy = jest.spyOn(fs, 'existsSync');
		fsSpy.mockReturnValueOnce(false).mockReturnValueOnce(true);

		init({
			ios: true,
			env: 'prod',
		});
		const config = base(new Config());

		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod');
		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env');
		expect(fsSpy).toHaveBeenCalledTimes(2);
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env');
			return args;
		});
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
});
