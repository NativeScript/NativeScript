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
	const packageJsonPath = resolve(getProjectRootPath(), 'package.json');

	return require(packageJsonPath) as IPackageJson;
}

// Convert paths from C:\some\path to C:/some/path in order to be required
export function convertSlashesInPath(modulePath) {
    if (isWindows) {
        modulePath = modulePath.replace(/\\/g, "/");
    }
    return modulePath;
}

const isWindows = process.platform.startsWith("win32");