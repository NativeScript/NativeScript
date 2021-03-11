import DotEnvPlugin from 'dotenv-webpack';
import Config from 'webpack-chain';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { getProjectRootPath } from './project';
import { env } from '..';

/**
 * @internal
 */
export function applyDotEnvPlugin(config: Config) {
	const path = getDotEnvPath();

	config.when(path !== null, (config) => {
		config.plugin('DotEnvPlugin').use(DotEnvPlugin, [
			{
				path,
				silent: true, // hide any errors
			},
		]);
	});
}

function getDotEnvFileName(): string {
	if (env.env) {
		return `.env.${env.env}`;
	}

	return '.env';
}

function getDotEnvPath(): string {
	const dotEnvPath = resolve(getProjectRootPath(), '.env');
	const dotEnvWithEnvPath = resolve(getProjectRootPath(), getDotEnvFileName());

	// look for .env.<env>
	if (existsSync(dotEnvWithEnvPath)) {
		return dotEnvWithEnvPath;
	}

	// fall back to .env
	if (existsSync(dotEnvPath)) {
		return dotEnvPath;
	}

	// don't use .env
	return null;
}
