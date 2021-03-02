import Config from 'webpack-chain';
import { mockFile } from '../../scripts/jest.mockFiles';
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
		mockFile('./.env', '');
		init({
			ios: true,
		});
		const config = base(new Config());

		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env');
			return args;
		});
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
	});

	it('supports env specific dotenv', () => {
		mockFile('./.env.prod', '');
		init({
			ios: true,
			env: 'prod',
		});
		const config = base(new Config());

		config.plugin('DotEnvPlugin').tap((args) => {
			expect(args[0].path).toEqual('__jest__/.env.prod');
			return args;
		});
		expect(config.plugin('DotEnvPlugin')).toBeDefined();
	});
});
