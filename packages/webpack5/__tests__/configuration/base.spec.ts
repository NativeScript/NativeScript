import Config from 'webpack-chain';
import fs from 'fs';
import base from '../../src/configuration/base';
import { init } from '../../src';

describe('base configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(base(new Config()).toString()).toMatchSnapshot();
		});
	}

	it('supports dotenv', () => {
		const fsSpy = jest.spyOn(fs, "existsSync")
		fsSpy.mockReturnValue(true)

		init({
			ios: true,
		});
		const config = base(new Config());

		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env');
			return args;
		});

		fsSpy.mockRestore()
	});

	it('supports env specific dotenv', () => {
		const fsSpy = jest.spyOn(fs, "existsSync")
		fsSpy.mockReturnValue(true)

		init({
			ios: true,
			env: 'prod',
		});
		const config = base(new Config());

		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod')
		expect(fsSpy).toHaveBeenCalledTimes(1)
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env.prod');
			return args;
		});
		fsSpy.mockRestore()
	});

	it('falls back to default .env', () => {
		const fsSpy = jest.spyOn(fs, "existsSync")
		fsSpy
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true)


		init({
			ios: true,
			env: 'prod',
		});
		const config = base(new Config());

		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env.prod')
		expect(fsSpy).toHaveBeenCalledWith('__jest__/.env')
		expect(fsSpy).toHaveBeenCalledTimes(2)
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env');
			return args;
		});
		fsSpy.mockRestore()
	});
});
