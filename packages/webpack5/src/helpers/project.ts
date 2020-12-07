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

export function getPackageJson() {
	const packageJsonPath = resolve(getProjectRootPath(), 'package.json');

	return require(packageJsonPath) as IPackageJson;
}
