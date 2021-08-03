import Config from 'webpack-chain';

import javascript from '../../src/configuration/javascript';
import { init } from '../../src';

describe('javascript configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(javascript(new Config()).toString()).toMatchSnapshot();
		});
	}
});
