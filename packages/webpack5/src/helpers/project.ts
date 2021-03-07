import { resolve } from 'path';

export function getProjectRootPath(): string {
	return process.cwd();
}

interface IPackageJson {
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
	return require(
		getProjectFilePath('package.json')
	) as IPackageJson;
}

/**
 * Utility to get project files relative to the project root.
 * @param filePath path to get
 */
export function getProjectFilePath(filePath: string): string {
	return resolve(getProjectRootPath(), filePath);
}
