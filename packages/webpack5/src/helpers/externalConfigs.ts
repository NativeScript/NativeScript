import path from 'path';
import fs from 'fs';
import dedent from 'ts-dedent';
import * as lib from '../index';
import { error, info } from './log';
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
					externalConfig(lib);
				} else {
					// todo: warn user
					// todo: perhaps support exported objects to merge into config?
				}
			} catch (err) {
				error(
					dedent`
					Unable to apply config: ${configPath}.
					Error is:
				`,
					err
				);
			}
		}
	});
}
