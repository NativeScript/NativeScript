// @ts-ignore
import Config from 'webpack-chain';
import vue from '../../src/configuration/vue';

describe.only('vue configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			expect(
				vue(new Config(), {
					[platform]: true,
				}).toString()
			).toMatchSnapshot();
		});
	}
});
