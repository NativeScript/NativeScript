import path from 'path';
import fs from 'fs';
import { transformSync } from 'esbuild';
import { createRequire } from 'node:module';
import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';

const require = createRequire(import.meta.url);
// get the name from the package for the output
const packageJson = getPackageJson();

export function nsConfigToJson() {
	let configObject: Record<string, any>;
	const tsPath = getProjectFilePath('nativescript.config.ts');
	const tsCode = fs.readFileSync(tsPath, 'utf-8');

	// a) Transpile your TS config to CommonJS so we can require() it
	const { code: cjsCode } = transformSync(tsCode, {
		loader: 'ts',
		format: 'cjs',
		target: 'esnext',
	});

	// b) Evaluate it in a VM-style sandbox to pull out the default export
	const module = { exports: {} as any };
	const requireFunc = (id: string) => require(id);
	new Function('exports', 'require', 'module', '__filename', '__dirname', cjsCode)(module.exports, requireFunc, module, tsPath, path.dirname(tsPath));
	configObject = module.exports.default ?? module.exports;
	// ensure the config has a name
	configObject.name = packageJson.name;
	// ensure the main entry is set to "bundle"
	configObject.main = 'bundle';
	return configObject;
}

/**
 * Resolves the NativeScript platform-specific file for a given module ID.
 * @param id The module ID to resolve.
 * @param platform The target platform (e.g., "ios", "android").
 * @returns The resolved file path or undefined if not found.
 */
export function resolveNativeScriptPlatformFile(id: string, platform: string): string | undefined {
	const ext = path.extname(id);
	const base = id.slice(0, -ext.length);

	let platformFile = `${base}.${platform}${ext}`;
	if (fs.existsSync(platformFile)) {
		return platformFile;
	}

	// core uses indices for many barrels
	platformFile = `${base}/index.${platform}${ext}`;
	if (fs.existsSync(platformFile)) {
		return platformFile;
	}

	// fallback to non-platform file
	return fs.existsSync(id) ? id : undefined;
}

/**
 * Utility to get all dependencies from the project package.json.
 * The result combines dependencies and devDependencies
 *
 * @returns string[] dependencies
 */
export function getAllDependencies(): string[] {
	return [...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.devDependencies ?? {})];
}

/**
 * Check if a dependency is present in package.json
 */
export function hasDependency(packageName: string): boolean {
	return getAllDependencies().includes(packageName);
}

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
 * Get the version of a dependency from package.json
 */
export function getDependencyVersion(packageName: string): string | undefined {
	return packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName] ?? (packageJson as any).peerDependencies?.[packageName];
}
