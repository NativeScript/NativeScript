import Config from 'webpack-chain';

import { default as angular } from '../../src/configuration/angular';
import { init } from '../../src';

jest.mock(
	'@ngtools/webpack',
	() => {
		// in tests we mock both plugins so they both show up in the snapshot
		// allowing us to verify the passed configuration is correct.
		class AngularCompilerPlugin {}

		class AngularWebpackPlugin {}

		return {
			AngularCompilerPlugin,
			AngularWebpackPlugin,
		};
	},
	{ virtual: true },
);

describe('angular configuration', () => {
	const platforms = ['ios', 'android'];
	let fsExistsSyncSpy: jest.SpiedFunction<any>;
	let polyfillsPath: string | boolean = false;

	beforeAll(() => {
		const fs = require('fs');
		const original = fs.existsSync;
		fsExistsSyncSpy = jest.spyOn(fs, 'existsSync');

		fsExistsSyncSpy.mockImplementation((path) => {
			if (path === '__jest__/tsconfig.json') {
				return true;
			}

			if (polyfillsPath && path === polyfillsPath) {
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

		it(`loads polyfills.${platform}.ts into the bundle entry if it exists `, () => {
			polyfillsPath = `__jest__/src/polyfills.${platform}.ts`;

			init({
				[platform]: true,
			});
			expect(angular(new Config()).entry('bundle').values()).toMatchSnapshot();

			polyfillsPath = false;
		});
	}

	it(`loads polyfills.ts into the bundle entry if it exists `, () => {
		polyfillsPath = `__jest__/src/polyfills.ts`;

		init({
			ios: true,
		});
		expect(angular(new Config()).entry('bundle').values()).toMatchSnapshot();

		polyfillsPath = false;
	});

	describe('@angular-devkit/build-angular backwards compatible', () => {
		beforeAll(() => {
			jest.mock('@angular-devkit/build-angular/package.json', () => ({
				version: '14.0.0',
			}));
		});

		afterAll(() => {
			jest.unmock('@angular-devkit/build-angular/package.json');
		});

		it('sets scriptTarget for version <15', () => {
			const config = angular(new Config());
			expect(
				config.module
					.rule('angular-webpack-loader')
					.use('webpack-loader')
					.get('options'),
			).toMatchSnapshot();
		});
	});
});
