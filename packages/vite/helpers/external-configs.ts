import type { Plugin, PluginOption, UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

import { getAllDependencies, getDependencyPath } from './utils.js';
import { resolveVerboseFlag } from './logging.js';
const require = createRequire(import.meta.url);

let cached: Promise<UserConfig[]> | null = null;

/**
 * Discover each dependency's optional `nativescript.vite.mjs` and collect the
 * config object every one returns.
 *
 * `require()` handles plain CommonJS configs and — on Node 22+ — most ESM `.mjs`
 * configs too (via require-of-ESM). A config that genuinely can't be loaded
 * synchronously (older Node, or a config that uses top-level await, which
 * require-of-ESM rejects) is loaded with `await import()` instead, so it is
 * still applied rather than silently dropped.
 */
async function collectExternalConfigs(): Promise<UserConfig[]> {
	const merges: UserConfig[] = [];
	const verbose = resolveVerboseFlag();

	for (const dependency of getAllDependencies()) {
		const packagePath = getDependencyPath(dependency);

		if (!packagePath) {
			continue;
		}

		const configPath = path.join(packagePath, 'nativescript.vite.mjs');

		if (!fs.existsSync(configPath)) {
			continue;
		}

		try {
			const externalModule = require(configPath);
			const externalConfig = externalModule?.default ?? externalModule;
			merges.push(externalConfig());
			if (verbose) console.log(`Merged external config: ${configPath}`);
		} catch (err: any) {
			if (err?.code === 'ERR_REQUIRE_ESM' || err?.code === 'ERR_REQUIRE_ASYNC_MODULE' || /require.*ES Module/i.test(String(err))) {
				try {
					const mod = await import(pathToFileURL(configPath).href);
					const externalConfig = mod?.default ?? mod;
					merges.push(externalConfig());
					if (verbose) console.log(`Merged external config: ${configPath}`);
				} catch (importErr) {
					console.warn(`Unable to apply external config ${configPath}: ${importErr}`);
				}
			} else {
				console.warn(`Unable to apply external config ${configPath}: ${err}`);
			}
		}
	}

	return merges;
}

function loadExternalConfigs(): Promise<UserConfig[]> {
	cached ??= collectExternalConfigs();
	return cached;
}

/**
 * Vite plugins that apply every dependency's optional `nativescript.vite.mjs`
 * config to the build.
 *
 * Discovery runs only once Vite resolves the config — which it awaits — rather
 * than synchronously while assembling the base config. That is what lets ESM
 * configs (including ones using top-level await, which can't be `require()`d)
 * load via `import()` and still apply, without forcing the config factory or
 * any app's `vite.config.ts` to become async.
 *
 * Vite ignores `plugins` returned from a `config` hook, so each config's
 * `plugins` are contributed through a thenable entry that Vite flattens into
 * the plugin list; everything else is merged by the `config` hook.
 */
export function externalConfigsPlugin(): PluginOption[] {
	const configPlugin: Plugin = {
		name: 'ns-external-configs',
		async config() {
			const merges = await loadExternalConfigs();
			if (!merges.length) {
				return undefined;
			}
			return merges.reduce<UserConfig>((acc, { plugins: _plugins, ...config }) => mergeConfig(acc, config), {});
		},
	};

	// Vite only calls `.then` on plugin entries, so a thenable keeps discovery
	// lazy instead of starting it whenever the base config is built.
	const externalPlugins: PromiseLike<PluginOption[]> = {
		then: (onfulfilled, onrejected) =>
			loadExternalConfigs()
				.then((configs) => configs.map((config) => config.plugins ?? []))
				.then(onfulfilled, onrejected),
	};

	return [configPlugin, externalPlugins as Promise<PluginOption[]>];
}
