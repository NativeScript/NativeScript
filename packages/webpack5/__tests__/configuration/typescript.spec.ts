import Config from 'webpack-chain';
import typescript from '../../src/configuration/typescript';
import { init } from '../../src';

describe('typescript configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(typescript(new Config()).toString()).toMatchSnapshot();
		});
	}
});
