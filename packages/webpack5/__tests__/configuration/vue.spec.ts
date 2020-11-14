import { __vue } from '@nativescript/webpack';

describe('vue configuration', () => {
	const platforms = ['ios', 'android'];

	for (let platform of platforms) {
		it(`[${platform}] works`, () => {
			expect(
				__vue({
					[platform]: true,
				}).toString()
			).toMatchSnapshot();
		});
	}
});
