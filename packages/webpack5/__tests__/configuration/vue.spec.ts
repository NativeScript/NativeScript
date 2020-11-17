import { __vue } from '@nativescript/webpack';

// todo: maybe mock baseConfig as we test it separately?
// import Config from 'webpack-chain'
// jest.mock('../../src/configuration/base', () => () => {
// 	return new Config()
// })

describe('vue configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			expect(
				__vue({
					[platform]: true,
				}).toString()
			).toMatchSnapshot();
		});
	}
});
