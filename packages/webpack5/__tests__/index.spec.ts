describe('@nativescript/webpack', () => {
	let webpack: typeof import('../src');

	beforeEach(() => {
		jest.resetModules();
		webpack = require('../src');
	});

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
	});

	it('applies chain configs in the right order', () => {
		webpack.useConfig(false);
		let lastCalled = false;

		// this is registered before chainFnNormal
		// however, should be called after chainFnNormal
		const chainFnLast = jest.fn((config) => {
			lastCalled = true;
			expect(config.normal).toBe(true);
		});
		webpack.chainWebpack(chainFnLast, { order: 10 });

		const chainFnNormal = jest.fn((config) => {
			config.normal = true;

			// chainFnLast should not have been called yet
			expect(lastCalled).toBe(false);
		});
		webpack.chainWebpack(chainFnNormal);

		webpack.resolveChainableConfig();
	});

	it('prints plugin name that has a chain function that throws an error', () => {
		webpack.useConfig(false);
		webpack.setCurrentPlugin('test-plugin');
		const chainFn = jest.fn(() => {
			throw new Error('something wrong');
		});
		webpack.chainWebpack(chainFn);

		// should not throw
		expect(() => webpack.resolveChainableConfig()).not.toThrow();

		expect(
			'Unable to apply chain function from: test-plugin'
		).toHaveBeenWarned();
	});

	it('applies merge configs', () => {
		const dummyEnv = { foo: true };
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
		const dummyEnv = { foo: true };
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
		const dummyEnv = { foo: true };
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
		const dummyEnv = { foo: true };
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
