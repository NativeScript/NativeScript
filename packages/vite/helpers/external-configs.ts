import type { UserConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

import { getAllDependencies, getDependencyPath } from './utils.js';
const require = createRequire(import.meta.url);

export const externalConfigMerges: UserConfig[] = [];

// Deferred ESM configs that need async loading — resolved before Vite build starts.
const pendingEsmConfigs: Promise<void>[] = [];

/**
 * @internal — call once at module top level to discover external configs.
 * CJS configs are loaded immediately; ESM (.mjs) configs are loaded via
 * dynamic import() and deferred until {@link resolvePendingExternalConfigs}
 * is awaited (typically inside the Vite config factory).
 */
export function applyExternalConfigs() {
	for (const dependency of getAllDependencies()) {
		const packagePath = getDependencyPath(dependency);

		if (!packagePath) {
			continue;
		}

		const configPath = path.join(packagePath, 'nativescript.vite.mjs');

		if (fs.existsSync(configPath)) {
			console.log(`Found and merged in external config: ${configPath}`);

			try {
				const externalModule = require(configPath);
				const externalConfig = externalModule?.default ?? externalModule;
				externalConfigMerges.push(externalConfig());
			} catch (err: any) {
				// require() cannot load ESM (.mjs) files — fall back to async import().
				if (err?.code === 'ERR_REQUIRE_ESM' || /require.*ES Module/i.test(String(err))) {
					pendingEsmConfigs.push(
						import(pathToFileURL(configPath).href)
							.then((mod) => {
								const externalConfig = mod?.default ?? mod;
								externalConfigMerges.push(externalConfig());
							})
							.catch((importErr) => {
								console.warn(`Unable to apply ESM config: ${configPath}.\nError is: ${importErr}`);
							}),
					);
				} else {
					console.warn(`Unable to apply config: ${configPath}.\nError is: ${err}`);
				}
			}
		}
	}
}

/**
 * Await any ESM configs that were deferred by {@link applyExternalConfigs}.
 * Safe to call multiple times — resolves immediately once complete.
 */
export async function resolvePendingExternalConfigs(): Promise<void> {
	if (pendingEsmConfigs.length) {
		await Promise.all(pendingEsmConfigs);
		pendingEsmConfigs.length = 0;
	}
}
