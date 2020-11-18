// @ts-ignore
import Config from 'webpack-chain';
import react from '../../src/configuration/react';

describe('react configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		describe(`> ${platform} >`, () => {
			it(`base config`, () => {
				expect(
					react(new Config(), {
						[platform]: true,
					}).toString()
				).toMatchSnapshot();
			});

			it(`adds ReactRefreshWebpackPlugin when HMR enabled`, () => {
				expect(
					react(new Config(), {
						[platform]: true,
						hmr: true,
					}).toString()
				).toMatchSnapshot();
			});
		});
	}
});
