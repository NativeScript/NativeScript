// Make sure the Acorn Parser (used by Webpack) can parse ES-Stage3 code
// This must be at the top BEFORE webpack is loaded so that we can extend
// and replace the parser before webpack uses it
// Based on the issue: https://github.com/webpack/webpack/issues/10216
import stage3 from 'acorn-stage3';

// we use require to be able to override the exports
const acorn = require('acorn');
acorn.Parser = acorn.Parser.extend(stage3);

import { highlight } from 'cli-highlight';
import { merge } from 'webpack-merge';
import Config from 'webpack-chain';
import webpack from 'webpack';

import { applyExternalConfigs } from './helpers/externalConfigs';
import { determineProjectFlavor } from './helpers/flavor';
import { error, info } from './helpers/log';
import { configs } from './configuration';
import helpers from './helpers';

export interface IWebpackEnv {
	[name: string]: any;

	env?: string;

	appPath?: string;
	appResourcesPath?: string;
	appComponents?: string[];

	nativescriptLibPath?: string | boolean;

	android?: boolean;
	ios?: boolean;
	// for custom platforms
	platform?: string;

	sourceMap?: string | boolean;
	production?: boolean;
	report?: boolean;
	hmr?: boolean;

	// enable verbose output
	verbose?: boolean;

	// enable webpack profiling
	profile?: boolean;

	// print webpack stats (default: true)
	stats?: boolean;

	// misc
	replace?: string[] | string;
	watchNodeModules?: boolean;
	e2e?: boolean;
}

interface IChainEntry {
	chainFn: any;
	order?: number;
	plugin?: string;
}

let webpackChains: IChainEntry[] = [];
let webpackMerges: any[] = [];
let explicitUseConfig = false;
let hasInitialized = false;
let currentPlugin: string | undefined;
/**
 * @internal
 */
export let env: IWebpackEnv = {};

/**
 * @internal
 */
export function setCurrentPlugin(plugin: string) {
	currentPlugin = plugin;
}

/**
 * @internal
 */
export function clearCurrentPlugin() {
	currentPlugin = undefined;
}

////// PUBLIC API
/**
 * The default flavor specific configs
 */
export const defaultConfigs = configs;

/**
 * Utilities to simplify various tasks
 */
export const Utils = helpers;

/**
 * webpack-merge exported for convenience. Useful for merging configuration objects
 */
export { merge };

/**
 * Initialize @nativescript/webpack with the webpack env.
 * Must be called first.
 *
 * @param _env The webpack env
 */
export function init(_env: IWebpackEnv) {
	hasInitialized = true;
	if (_env) {
		env = _env;
	}
}

/**
 * Explicitly specify the base config to use.
 * Calling this will opt-out from automatic flavor detection.
 *
 * Useful when the flavor cannot be detected due to the project structure
 * for example in a custom monorepo.
 *
 * @param config Name of the base config to use.
 */
export function useConfig(config: keyof typeof defaultConfigs | false) {
	explicitUseConfig = true;
	if (config) {
		webpackChains.push({
			order: -1,
			chainFn: configs[config],
		});
	}
}

/**
 * Add a new function to be called when building the internal config using webpack-chain.
 *
 * @param chainFn A function that accepts the internal chain config, and the current environment
 * @param options Optional options to control the order in which the chain function should be applied.
 */
export function chainWebpack(
	chainFn: (config: Config, env: IWebpackEnv) => any,
	options?: { order?: number }
) {
	webpackChains.push({
		order: options?.order || 0,
		chainFn,
		plugin: currentPlugin,
	});
}

/**
 * Merge an object into the resolved chain config.
 *
 * @param mergeFn An object or a function that optionally returns an object (can mutate the object directly and return nothing)
 */
export function mergeWebpack(
	mergeFn: (
		config: Partial<webpack.Configuration>,
		env: IWebpackEnv
	) => any | Partial<webpack.Configuration>
) {
	webpackMerges.push(mergeFn);
}

/**
 * Resolve a new instance of the internal chain config with all chain functions applied.
 */
export function resolveChainableConfig(): Config {
	const config = new Config();

	if (!explicitUseConfig) {
		useConfig(determineProjectFlavor());
	}

	// apply configs from dependencies
	// todo: allow opt-out
	applyExternalConfigs();

	webpackChains
		.splice(0)
		.sort((a, b) => {
			return a.order - b.order;
		})
		.forEach(({ chainFn, plugin }) => {
			try {
				chainFn(config, env);
			} catch (err) {
				if (plugin) {
					// catch and print errors from plugins
					return error(`
						Unable to apply chain function from: ${plugin}.
						Error is: ${err}
					`);
				}

				// otherwise throw - as the error is likely from the user config
				// or missing env flags (eg. missing platform)
				throw err;
			}
		});

	if (env.verbose) {
		info('Resolved chainable config (before merges):');
		info(highlight(config.toString(), { language: 'js' }));
	}

	return config;
}

/**
 * Resolve a "final" configuration that has all chain functions and merges applied.
 *
 * @param chainableConfig Optional chain config to use.
 */
export function resolveConfig(
	chainableConfig = resolveChainableConfig()
): webpack.Configuration {
	if (!hasInitialized) {
		throw error('resolveConfig() must be called after init()');
	}

	let config = chainableConfig.toConfig();

	// this applies webpack merges
	webpackMerges.forEach((mergeFn) => {
		if (typeof mergeFn === 'function') {
			// mergeFn is a function with optional return value
			const res = mergeFn(config, env);
			if (res) config = merge(config, res);
		} else if (mergeFn) {
			// mergeFn is a literal value (object)
			config = merge(config, mergeFn);
		}
	});

	// return a config usable by webpack
	return config;
}
