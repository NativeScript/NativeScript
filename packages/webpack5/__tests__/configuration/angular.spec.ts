import Config from 'webpack-chain';
import { resolve } from 'path';

import { additionalCopyRules } from '../../src/helpers/copyRules';
import { default as angular } from '../../src/configuration/angular';
import { init } from '../../src';

jest.mock(
	'@ngtools/webpack',
	() => {
		class AngularCompilerPlugin {}

		return {
			AngularCompilerPlugin,
		};
	},
	{ virtual: true }
);

describe('angular configuration', () => {
	const platforms = ['ios', 'android'];
	let fsExistsSyncSpy: jest.SpiedFunction<any>;

	beforeAll(() => {
		const fs = require('fs');
		const original = fs.existsSync;
		fsExistsSyncSpy = jest.spyOn(fs, 'existsSync');

		fsExistsSyncSpy.mockImplementation((path) => {
			if (path === '__jest__/tsconfig.json') {
				return true;
			}
			return original.call(fs, path);
		});
	});

	afterAll(() => {
		fsExistsSyncSpy.mockRestore();
	});

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(angular(new Config()).toString()).toMatchSnapshot();
		});
	}
});
