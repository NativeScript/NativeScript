import type { Plugin, UserConfig } from 'vite';
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

/**
 * Vite plugin that merges every dependency's optional `nativescript.vite.mjs`
 * config into the build.
 *
 * Discovery runs in the plugin's `config` hook — which Vite awaits — rather than
 * synchronously while assembling the base config. That is what lets ESM configs
 * (including ones using top-level await, which can't be `require()`d) load via
 * `import()` and still apply, without forcing the config factory or any app's
 * `vite.config.ts` to become async.
 */
export function externalConfigsPlugin(): Plugin {
	return {
		name: 'ns-external-configs',
		async config() {
			cached ??= collectExternalConfigs();
			const merges = await cached;
			if (!merges.length) {
				return undefined;
			}
			return merges.reduce<UserConfig>((acc, config) => mergeConfig(acc, config), {});
		},
	};
}
