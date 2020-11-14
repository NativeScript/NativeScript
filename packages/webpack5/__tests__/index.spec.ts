import * as webpack from '@nativescript/webpack';

describe('@nativescript/webpack', () => {
	it('exports base configs', () => {
		expect(webpack.angularConfig).toBeInstanceOf(Function);
		expect(webpack.baseConfig).toBeInstanceOf(Function);
		expect(webpack.javascriptConfig).toBeInstanceOf(Function);
		expect(webpack.reactConfig).toBeInstanceOf(Function);
		expect(webpack.svelteConfig).toBeInstanceOf(Function);
		expect(webpack.typescriptConfig).toBeInstanceOf(Function);
		expect(webpack.vueConfig).toBeInstanceOf(Function);
	});
});
