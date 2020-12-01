import { merge } from 'webpack-merge';
import Config from 'webpack-chain';
import webpack from 'webpack';
import { highlight } from 'cli-highlight';
import { configs } from './configuration';
import { determineProjectFlavor } from './helpers/flavor';
import { applyExternalConfigs } from './helpers/externalConfigs';
import { error, info } from './helpers/log';
import helpers from './helpers';

export type Platform = 'android' | 'ios' | string;

export interface IWebpackEnv {
	[name: string]: any;

	appPath?: string;
	appResourcesPath?: string;

	nativescriptLibPath?: string;

	android?: boolean;
	ios?: boolean;

	production?: boolean;
	report?: boolean;
	hmr?: boolean;

	// enable verbose output
	verbose?: boolean;
	// todo: add others
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
export const defaultConfigs = configs;
export const Utils = helpers;

export function init(_env: IWebpackEnv) {
	hasInitialized = true;
	if (_env) {
		env = _env;
	}
}

export function useConfig(config: keyof typeof defaultConfigs | false) {
	explicitUseConfig = true;
	if (config) {
		webpackChains.push({
			order: -1,
			chainFn: configs[config],
		});
	}
}

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

export function mergeWebpack(
	mergeFn: (
		config: Partial<webpack.Configuration>,
		env: IWebpackEnv
	) => any | Partial<webpack.Configuration>
) {
	webpackMerges.push(mergeFn);
}

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
					// print error with plugin name that causes it
					error(`
					Unable to apply chain function from: ${plugin}.
					Error is: ${err}
				`);
				}
			}
		});

	if (env.verbose) {
		info('Resolved chainable config (before merges):');
		info(highlight(config.toString(), { language: 'js' }));
	}

	return config;
}

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
