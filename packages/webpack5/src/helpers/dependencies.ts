import path from 'path';

import { getPackageJson, getProjectRootPath } from './project';

// todo: memoize
/**
 * Utility to get all dependencies from the project package.json.
 * The result combines dependencies and devDependencies
 *
 * @returns string[] dependencies
 */
export function getAllDependencies(): string[] {
	const packageJSON = getPackageJson();

	return [
		...Object.keys(packageJSON.dependencies ?? {}),
		...Object.keys(packageJSON.devDependencies ?? {}),
	];
}

// todo: memoize
/**
 * Utility to check if the project has a specific dependency
 * in either dependencies or devDependencies.
 *
 * @param {string} dependencyName
 * @returns boolean
 */
export function hasDependency(dependencyName: string) {
	return getAllDependencies().includes(dependencyName);
}

// todo: memoize
/**
 * Utility to get the path (usually nested in node_modules) of a dependency.
 *
 * @param dependencyName
 */
export function getDependencyPath(dependencyName: string): string | null {
	try {
		const resolvedPath = require.resolve(`${dependencyName}/package.json`, {
			paths: [getProjectRootPath()],
		});

		return path.dirname(resolvedPath);
	} catch (err) {
		return null;
	}
}
