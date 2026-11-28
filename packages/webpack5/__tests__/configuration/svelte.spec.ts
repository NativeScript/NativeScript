import Config from 'webpack-chain';

import svelte from '../../src/configuration/svelte';
import * as dependenciesHelpers from '../../src/helpers/dependencies';
import * as projectHelpers from '../../src/helpers/project';
import { init } from '../../src';

jest.mock('__jest__/svelte.config.js', () => ({}), { virtual: true });

const svelteConfig = require('__jest__/svelte.config.js');

const platforms = ['ios', 'android'];

function withSvelteVersion<T>(version: string | null, fn: () => T): T {
	const spy = jest.spyOn(dependenciesHelpers, 'getDependencyVersion');
	spy.mockImplementation((name: string) =>
		name === 'svelte' ? version : null,
	);
	try {
		return fn();
	} finally {
		spy.mockRestore();
	}
}

function svelteLoaderOptions(config: Config) {
	return config.module.rule('svelte').use('svelte-loader').get('options');
}

describe('svelte configuration', () => {
	for (const platform of platforms) {
		it(`for ${platform}`, () => {
			withSvelteVersion('4.2.19', () => {
				init({
					[platform]: true,
				});
				expect(svelte(new Config()).toString()).toMatchSnapshot();
			});
		});
	}

	it('keeps the Svelte 4 config when the svelte version cannot be detected', () => {
		init({ ios: true });
		const svelte4 = withSvelteVersion('4.2.19', () =>
			svelte(new Config()).toString(),
		);
		const undetected = withSvelteVersion(null, () =>
			svelte(new Config()).toString(),
		);

		expect(undetected).toBe(svelte4);
	});
});

describe('svelte 5 configuration', () => {
	for (const platform of platforms) {
		it(`for ${platform}`, () => {
			withSvelteVersion('5.59.0', () => {
				init({
					[platform]: true,
				});
				expect(svelte(new Config()).toString()).toMatchSnapshot();
			});
		});
	}

	it('resolves the svelte client runtime instead of aliasing svelte/internal', () => {
		init({ ios: true });
		const config = withSvelteVersion('5.59.0', () => svelte(new Config()));

		expect(config.resolve.alias.has('svelte$')).toBe(false);
		expect(config.resolve.get('conditionNames')).toEqual([
			'svelte-custom-renderer',
			'svelte',
			'...',
		]);
		expect(config.get('target')).toBe('node');
	});

	it('applies the browser condition only to esm-env', () => {
		init({ ios: true });
		const config = withSvelteVersion('5.59.0', () => svelte(new Config()));
		const rule = config.module.rule('svelte-esm-env');

		expect(rule.get('test').test('/app/node_modules/esm-env/index.js')).toBe(
			true,
		);
		expect(rule.get('test').test('/app/node_modules/svelte/src/index.js')).toBe(
			false,
		);
		expect(rule.resolve.get('conditionNames')).toEqual(['browser', '...']);
	});

	it('passes svelte.config.js compilerOptions through without svelte-hmr', () => {
		Object.assign(svelteConfig, {
			compilerOptions: {
				css: 'external',
				experimental: {
					customRenderer: '@nativescript-community/svelte-native/dom/renderer',
				},
			},
			preprocess: [],
		});
		init({ ios: true });
		let options;
		try {
			const config = withSvelteVersion('5.59.0', () => svelte(new Config()));
			options = svelteLoaderOptions(config);
		} finally {
			delete svelteConfig.compilerOptions;
			delete svelteConfig.preprocess;
		}

		expect(options.compilerOptions).toEqual({
			css: 'external',
			experimental: {
				customRenderer: '@nativescript-community/svelte-native/dom/renderer',
			},
			dev: true,
		});
		expect(options.preprocess).toEqual([]);
		expect(options.hotReload).toBeUndefined();
		expect(options.hotOptions).toBeUndefined();
	});

	it('disables compiler dev mode for production builds', () => {
		init({ ios: true, production: true });
		const config = withSvelteVersion('5.59.0', () => svelte(new Config()));

		expect(svelteLoaderOptions(config).compilerOptions.dev).toBe(false);
	});

	it('detects Svelte 5 from the declared dependency when it is not installed', () => {
		const packageJsonSpy = jest
			.spyOn(projectHelpers, 'getPackageJson')
			.mockReturnValue({
				main: 'src/app.js',
				devDependencies: { svelte: '^5.59.0', typescript: '*' },
			});
		try {
			init({ ios: true });
			const config = withSvelteVersion(null, () => svelte(new Config()));

			expect(config.resolve.alias.has('svelte$')).toBe(false);
			expect(config.resolve.get('conditionNames')).toContain('svelte');
		} finally {
			packageJsonSpy.mockRestore();
		}
	});
});
