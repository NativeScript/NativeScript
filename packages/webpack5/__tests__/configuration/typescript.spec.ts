import Config from 'webpack-chain';

import typescript from '../../src/configuration/typescript';
import { init } from '../../src';

describe('typescript configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(typescript(new Config()).toString()).toMatchSnapshot();
		});
	}

	it('filter typescript declaration files', () => {
		init({
			ios: true,
		});

		const tsConfig = typescript(new Config());
		let regex: RegExp;

		// Get the filterRE from the typescript configuration
		tsConfig.plugin('VirtualModulesPlugin').tap((args) => {
			const options = args[0];
			const virtualConfig: string = options[Object.keys(options)[0]];
			const filterLine = virtualConfig
				.split('\n')
				.find((v) => v.includes('filter'));
			const matches = filterLine.match(/\/(?<filter>\S+)\//);

			if (matches) {
				regex = new RegExp(matches.groups.filter);
			}

			return args;
		});

		expect(regex).toBeDefined();

		expect('test.ts').toMatch(regex);
		expect('test.d.ts').not.toMatch(regex);
		expect('tested.ts').toMatch(regex);
		expect('tested.d.ts').not.toMatch(regex);
		expect('test.d.tested.ts').toMatch(regex);
		expect('test.d.tested.d.ts').not.toMatch(regex);
	});
});
