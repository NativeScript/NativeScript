import Config from 'webpack-chain';

import {
	mockExistsSync,
	restoreExistsSync,
	setHasTSConfig,
} from '../../scripts/jest.utils';

import vue from '../../src/configuration/vue';
import { init } from '../../src';

describe('vue configuration', () => {
	const platforms = ['ios', 'android'];

	beforeAll(() => {
		mockExistsSync();
	});

	afterAll(() => {
		restoreExistsSync();
	});

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(vue(new Config()).toString()).toMatchSnapshot();
		});
	}

	describe('with typescript', () => {
		beforeAll(() => {
			setHasTSConfig(true);
		});

		afterAll(() => {
			setHasTSConfig(false);
		});

		for (let platform of platforms) {
			it(`for ${platform}`, () => {
				init({
					[platform]: true,
				});
				expect(vue(new Config()).toString()).toMatchSnapshot();
			});
		}
	});
});
