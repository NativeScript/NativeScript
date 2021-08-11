import Config from 'webpack-chain';

import vue from '../../src/configuration/vue';
import { init } from '../../src';

describe('vue configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(vue(new Config()).toString()).toMatchSnapshot();
		});
	}
});
