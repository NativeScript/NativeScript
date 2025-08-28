import path from 'path';

import { satisfies } from 'semver';
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

/**
 * Utility to get the version of a dependency.
 *
 * @param dependencyName
 * @returns string | null - version of the dependency or null if not found
 */
export function getDependencyVersion(dependencyName: string): string | null {
	const dependencyPath = getDependencyPath(dependencyName);
	if (!dependencyPath) {
		return null;
	}

	try {
		return require(`${dependencyPath}/package.json`).version;
	} catch (err) {
		// ignore
	}
	return null;
}

/**
 * Resolve a usable version string for checks (eg. semver.satisfies).
 * Strategy:
 *  - prefer installed package.json version (getDependencyVersion)
 *  - fall back to declared version in project package.json (dependencies/devDependencies)
 *  - if declared is a common dist-tag (alpha|beta|rc|next) return a 9.x prerelease
 */
export function getResolvedDependencyVersionForCheck(dependencyName: string, target: string): string | null {
	// try installed
	const installed = getDependencyVersion(dependencyName);
	if (installed) {
		return installed;
	}

	// try declared in project package.json
	const pkg = getPackageJson();
	const declared = (pkg.dependencies && pkg.dependencies[dependencyName]) || (pkg.devDependencies && pkg.devDependencies[dependencyName]);
	if (!declared) {
		return null;
	}

	// if declared already satisfies semver check, use it
	try {
		if (satisfies(declared, `>=${target}`)) {
			return declared;
		}
	} catch (e) {
		// ignore parse errors
	}

	// common dist-tags -> treat as prerelease of 9.x for the purpose of >=9 checks
	if (/^(alpha|beta|rc|next)$/.test(String(declared))) {
		return `${target}-0`;
	}

	return declared ?? null;
}
