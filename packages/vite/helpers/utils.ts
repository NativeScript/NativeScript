import path from 'path';
import fs from 'fs';
import { transformSync } from 'esbuild';
import { createRequire } from 'node:module';
import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';

const require = createRequire(import.meta.url);
// get the name from the package for the output
const packageJson = getPackageJson();

export function nsConfigToJson() {
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
	const configObject: Record<string, any> = module.exports.default ?? module.exports;
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

let cachedAppPath: string | undefined;

function normalizePathSegment(segment?: string | null): string | undefined {
	if (!segment) return undefined;
	const normalized = segment
		.replace(/\\/g, '/')
		.replace(/^\.\/+/, '')
		.replace(/^\/+/, '')
		.replace(/\/+$/, '');
	return normalized || undefined;
}

function deriveAppPathFromPackage(): string | undefined {
	const mainEntry = packageJson?.main;
	const normalized = normalizePathSegment(mainEntry);
	if (!normalized) return undefined;
	const segments = normalized.split('/').filter(Boolean);
	if (segments.length >= 2) {
		return segments[0];
	}
	return undefined;
}

function computeProjectAppPath(): string {
	if (cachedAppPath) return cachedAppPath;
	let candidate: string | undefined;
	try {
		const config = nsConfigToJson();
		candidate = normalizePathSegment((config as any)?.appPath);
	} catch {}
	if (!candidate) {
		candidate = deriveAppPathFromPackage();
	}
	cachedAppPath = candidate || 'src';
	return cachedAppPath;
}

export function getProjectAppPath(): string {
	return computeProjectAppPath();
}

export function getProjectAppRelativePath(subPath = ''): string {
	const base = computeProjectAppPath();
	const cleanSub = normalizePathSegment(subPath);
	if (!cleanSub) return base;
	return `${base}/${cleanSub}`.replace(/\/+/g, '/');
}

export function getProjectAppAbsolutePath(subPath = ''): string {
	const rel = getProjectAppRelativePath(subPath);
	return path.resolve(getProjectRootPath(), rel);
}

export function getProjectAppVirtualPath(subPath = ''): string {
	const rel = getProjectAppRelativePath(subPath).replace(/^\/+/, '');
	return `/${rel.replace(/\/+/g, '/')}`;
}

// Global stylesheet candidates under the app directory, in priority order.
// `app.css` is the NativeScript convention; `styles.css` is common in web
// projects that share a codebase with NativeScript (e.g. Vite / TanStack
// Start), so it is used as a fallback when `app.css` is absent.
export const GLOBAL_APP_CSS_CANDIDATES = ['app.css', 'styles.css'];

/**
 * Resolve the project's global stylesheet, preferring `app.css` and falling
 * back to `styles.css`. Returns the absolute filesystem path of the first
 * candidate that exists under the app directory, or `null` when none are
 * present. All call sites share this single resolver so the entry generator,
 * the virtual-module loader, and the HMR watcher always agree on the same file.
 */
export function resolveProjectGlobalCssPath(projectRoot: string = getProjectRootPath()): string | null {
	for (const name of GLOBAL_APP_CSS_CANDIDATES) {
		const abs = path.resolve(projectRoot, getProjectAppRelativePath(name));
		if (fs.existsSync(abs)) {
			return abs;
		}
	}
	return null;
}
