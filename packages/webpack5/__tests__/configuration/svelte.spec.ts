import Config from 'webpack-chain';

import svelte from '../../src/configuration/svelte';
import { init } from '../../src';

jest.mock('__jest__/svelte.config.js', () => {}, { virtual: true });

describe('svelte configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(svelte(new Config()).toString()).toMatchSnapshot();
		});
	}
});
