import type { UserConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
// import { pathToFileURL } from 'url';

import { getAllDependencies, getDependencyPath } from './utils.js';
const require = createRequire(import.meta.url);

export const externalConfigMerges: UserConfig[] = [];

/**
 * @internal
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
			} catch (err) {
				console.warn(`
					Unable to apply config: ${configPath}.
					Error is: ${err}
				`);
			}
		}
	}
}
