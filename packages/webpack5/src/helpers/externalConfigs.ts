import path from 'path';
import fs from 'fs';

import { getAllDependencies, getDependencyPath } from './dependencies';
import { clearCurrentPlugin, setCurrentPlugin } from '../index';
import { info, warn } from './log';
import * as lib from '../index';

/**
 * @internal
 */
export async function applyExternalConfigs() {
	for (const dependency of getAllDependencies()) {
		const packagePath = getDependencyPath(dependency);

		if (!packagePath) {
			continue;
		}

		const configPath = path.join(packagePath, 'nativescript.webpack.js');

		if (fs.existsSync(configPath)) {
			info(`Discovered config: ${configPath}`);
			setCurrentPlugin(dependency);
			try {
				const externalConfig = require(configPath);

				if (typeof externalConfig === 'function') {
					info('Applying external config...');
					await externalConfig(lib);
				} else if (externalConfig) {
					info('Merging external config...');
					lib.mergeWebpack(externalConfig);
				} else {
					warn(
						'Unsupported external config. The config must export a function or an object.'
					);
				}
			} catch (err) {
				warn(`
					Unable to apply config: ${configPath}.
					Error is: ${err}
				`);
			}
		}
	}

	clearCurrentPlugin();
}
