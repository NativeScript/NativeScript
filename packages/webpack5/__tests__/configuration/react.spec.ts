import { __react } from '@nativescript/webpack';

// todo: maybe mock baseConfig as we test it separately?
// import Config from 'webpack-chain'
// jest.mock('../../src/configuration/base', () => () => {
// 	return new Config()
// })

describe('react configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			expect(
				__react({
					[platform]: true,
				}).toString()
			).toMatchSnapshot();
		});
	}
});
