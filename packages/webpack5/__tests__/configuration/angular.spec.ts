import Config from 'webpack-chain';

import {
	addMockFile,
	mockExistsSync,
	restoreExistsSync,
	setHasTSConfig,
} from '../../scripts/jest.utils';

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
	{ virtual: true }
);

describe('angular configuration', () => {
	const platforms = ['ios', 'android'];

	beforeAll(() => {
		mockExistsSync();
		setHasTSConfig(true);
	});

	afterAll(() => {
		restoreExistsSync();
	});

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(angular(new Config()).toString()).toMatchSnapshot();
		});

		it(`loads polyfills.${platform}.ts into the bundle entry if it exists `, () => {
			const cleanupMockFile = addMockFile(
				`__jest__/src/polyfills.${platform}.ts`
			);

			init({
				[platform]: true,
			});
			expect(angular(new Config()).entry('bundle').values()).toMatchSnapshot();

			cleanupMockFile();
		});
	}

	it(`loads polyfills.ts into the bundle entry if it exists `, () => {
		const cleanupMockFile = addMockFile(`__jest__/src/polyfills.ts`);

		init({
			ios: true,
		});
		expect(angular(new Config()).entry('bundle').values()).toMatchSnapshot();

		cleanupMockFile();
	});
});
