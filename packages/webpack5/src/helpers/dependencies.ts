import { getPackageJson, getProjectRootPath } from './project';
import path from 'path';

export function getAllDependencies(): string[] {
	const packageJSON = getPackageJson();
	console.log(packageJSON);

	return [
		...Object.keys(packageJSON.dependencies ?? {}),
		...Object.keys(packageJSON.devDependencies ?? {}),
	];
}

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
