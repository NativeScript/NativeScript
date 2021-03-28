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
	return require(getProjectFilePath('package.json')) as IPackageJson;
}

/**
 * Utility to get project files relative to the project root.
 * @param filePath path to get
 */
export function getProjectFilePath(filePath: string): string {
	return resolve(getProjectRootPath(), filePath);
}

// unused helper, but keeping it here as we may need it
// todo: remove if unused for next few releases
// function findFile(fileName, currentDir): string | null {
// 	// console.log(`findFile(${fileName}, ${currentDir})`)
// 	const path = resolve(currentDir, fileName);
//
// 	if (existsSync(path)) {
// 		return path;
// 	}
//
// 	// bail if we reached the root dir
// 	if (currentDir === resolve('/')) {
// 		return null;
// 	}
//
// 	// traverse to the parent folder
// 	return findFile(fileName, resolve(currentDir, '..'));
// }
