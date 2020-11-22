import path from 'path';
import fs from 'fs';
import * as lib from '../index';
import { error, info, warn } from './log';
import { getAllDependencies, getDependencyPath } from './dependencies';

export function applyExternalConfigs() {
	getAllDependencies().forEach((dependency) => {
		const packagePath = getDependencyPath(dependency);
		const configPath = path.join(packagePath, 'nativescript.webpack.js');

		if (fs.existsSync(configPath)) {
			info(`Discovered config: ${configPath}`);

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
				error(
					`
						Unable to apply config: ${configPath}.
						Error is:
					`,
					err
				);
			}
		}
	});
}
