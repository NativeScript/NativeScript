import { vueConfig } from '@nativescript/webpack';

describe('vue configuration', () => {
	it('works', () => {
		expect(vueConfig('')).toMatchSnapshot();
	});
});
