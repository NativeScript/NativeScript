import path from 'path';
import fs from 'fs';

import { getAllDependencies, getDependencyPath } from './dependencies';
import { info, warn } from './log';
import * as lib from '../index';
import { clearCurrentPlugin, setCurrentPlugin } from '../index';

export function applyExternalConfigs() {
	getAllDependencies().forEach((dependency) => {
		const packagePath = getDependencyPath(dependency);
		const configPath = path.join(packagePath, 'nativescript.webpack.js');

		if (fs.existsSync(configPath)) {
			info(`Discovered config: ${configPath}`);
			setCurrentPlugin(dependency);
			try {
				const externalConfig = require(configPath);

				if (typeof externalConfig === 'function') {
					info('Applying external config...');
					externalConfig(lib);
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
	});

	clearCurrentPlugin();
}
