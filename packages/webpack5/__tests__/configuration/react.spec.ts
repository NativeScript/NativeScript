import Config from 'webpack-chain';

import react from '../../src/configuration/react';
import { init } from '../../src';

describe('react configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		describe(`> ${platform} >`, () => {
			it(`base config`, () => {
				init({
					[platform]: true,
				});
				expect(react(new Config()).toString()).toMatchSnapshot();
			});

			it(`adds ReactRefreshWebpackPlugin when HMR enabled`, () => {
				init({
					[platform]: true,
					hmr: true,
				});
				expect(react(new Config()).toString()).toMatchSnapshot();
			});
		});
	}
});
