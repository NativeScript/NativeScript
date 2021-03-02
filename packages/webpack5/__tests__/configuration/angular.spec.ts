import Config from 'webpack-chain';
import angular from '../../src/configuration/angular';
import { init } from '../../src';

jest.mock(
	'@ngtools/webpack',
	() => {
		class AngularCompilerPlugin {}

		return {
			AngularCompilerPlugin,
		};
	},
	{ virtual: true }
);

describe('angular configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(angular(new Config()).toString()).toMatchSnapshot();
		});
	}
});
