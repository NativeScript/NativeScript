import { existsSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export function getProjectRootPath(): string {
	return process.cwd();
}

// Get current directory for ES modules (equivalent to __dirname)
export const __dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname;

interface IPackageJson {
	name?: string;
	main?: string;
	dependencies?: {
		[name: string]: string;
	};
	devDependencies?: {
		[name: string]: string;
	};
	// todo: add additional fields as we require them
}

/**
 * Utility function to get the contents of the project package.json
 */
export function getPackageJson() {
	return require(getProjectFilePath('package.json')) as IPackageJson;
}

/**
 * Utility to get project files relative to the project root.
 * @param filePath path to get
 */
export function getProjectFilePath(filePath: string): string {
	return resolve(getProjectRootPath(), filePath);
}

export function getProjectTSConfigPath(): string | undefined {
	return [getProjectFilePath('tsconfig.app.json'), getProjectFilePath('tsconfig.json')].find((path) => existsSync(path));
}
