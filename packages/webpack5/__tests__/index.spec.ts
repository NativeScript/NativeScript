// @ts-ignore
import Config from 'webpack-chain';
import * as webpack from '../src';

describe('@nativescript/webpack', () => {
	it('exports the public api', () => {
		expect(webpack.init).toBeInstanceOf(Function);
		expect(webpack.useConfig).toBeInstanceOf(Function);
		expect(webpack.chainWebpack).toBeInstanceOf(Function);
		expect(webpack.mergeWebpack).toBeInstanceOf(Function);
		expect(webpack.resolveChainableConfig).toBeInstanceOf(Function);
		expect(webpack.resolveConfig).toBeInstanceOf(Function);
	});

	it('applies chain configs', () => {
		webpack.useConfig(false);
		expect(webpack.chainWebpack).toBeInstanceOf(Function);

		const chainFn = jest.fn();
		webpack.chainWebpack(chainFn);

		// chainFn should not be called yet
		expect(chainFn).not.toHaveBeenCalled();

		// chainFn should only be called when
		// resolving a chainable config
		const config = webpack.resolveChainableConfig();

		expect(chainFn).toHaveBeenCalledTimes(1);
		expect(chainFn).toHaveBeenCalledWith(config, {});
		expect(config).toBeInstanceOf(Config);
	});
});
