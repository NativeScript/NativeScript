import Config from 'webpack-chain';
import path from 'path';
import fs from 'fs';

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

	it('filters typescript declaration files', () => {
		init({
			ios: true,
		});

		// const tsConfig = typescript(new Config());
		let regex: RegExp;

		const virtualEntryPath = path.join(
			__dirname,
			'../../src/stubs/virtual-entry-typescript.js'
		);
		const virtualEntry = fs.readFileSync(virtualEntryPath);

		const filterLine = virtualEntry
			.toString()
			.split('\n')
			.find((v) => v.includes('filter'));

		const matches = filterLine.match(/\/(?<filter>\S+)\//);

		if (matches) {
			regex = new RegExp(matches.groups.filter);
		}

		expect(regex).toBeDefined();

		expect('test.ts').toMatch(regex);
		expect('test.d.ts').not.toMatch(regex);
		expect('tested.ts').toMatch(regex);
		expect('tested.d.ts').not.toMatch(regex);
		expect('test.d.tested.ts').toMatch(regex);
		expect('test.d.tested.d.ts').not.toMatch(regex);
	});
});
