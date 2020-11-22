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

	it('applies merge configs', () => {
		const dummyEnv = { env: true };
		webpack.init(dummyEnv);
		webpack.useConfig(false);

		const mergeFn = jest.fn();
		webpack.mergeWebpack(mergeFn);

		// mergeFn should not be called yet
		expect(mergeFn).not.toHaveBeenCalled();

		const config = webpack.resolveChainableConfig();

		// mergeFn should not be called yet
		expect(mergeFn).not.toHaveBeenCalled();

		// mergeFn should only be called when
		// resolving the final config
		webpack.resolveConfig();

		expect(mergeFn).toHaveBeenCalledTimes(1);
		expect(mergeFn).toHaveBeenCalledWith(config.toConfig(), dummyEnv);
	});

	it('merges mutate config', () => {
		const dummyEnv = { env: true };
		webpack.init(dummyEnv);
		webpack.useConfig(false);

		webpack.mergeWebpack((config) => {
			(config as any).mutated = true;
		});

		expect(webpack.resolveConfig()).toMatchObject({
			mutated: true,
		});
	});

	it('merges returned config', () => {
		const dummyEnv = { env: true };
		webpack.init(dummyEnv);
		webpack.useConfig(false);

		webpack.mergeWebpack(() => {
			return {
				returned: true,
			};
		});

		expect(webpack.resolveConfig()).toMatchObject({
			returned: true,
		});
	});

	it('merges objects', () => {
		const dummyEnv = { env: true };
		webpack.init(dummyEnv);
		webpack.useConfig(false);

		webpack.mergeWebpack({
			object: true,
		} as any);

		expect(webpack.resolveConfig()).toMatchObject({
			object: true,
		});
	});
});
