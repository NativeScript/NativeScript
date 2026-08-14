import path from 'path';
import fs from 'fs';
import { getProjectRootPath } from './project.js';
import { findPackageInNodeModules } from './module-resolution.js';
import { resolveMainFieldPlatformVariant } from './resolve-main-field-platform.js';

const projectRoot = getProjectRootPath();

// Cache for package resolution results
const packageCache = new Map();

export function nativescriptPackageResolver(platform: string) {
	return {
		name: 'nativescript-package-resolver',
		enforce: 'pre', // Force this plugin to run before all others
		resolveId(id, importer) {
			// Only handle direct package imports (not relative paths)
			if (id.startsWith('.') || id.startsWith('/') || id.includes(':')) {
				return null;
			}

			// Extract package name properly
			let packageName;
			if (id.startsWith('@')) {
				// Scoped package: @scope/package or @scope/package/subpath
				const parts = id.split('/');
				if (parts.length >= 2) {
					packageName = parts[0] + '/' + parts[1]; // @scope/package
					// Only handle root package imports, not subpaths
					if (parts.length > 2) {
						return null; // This is a subpath import like @scope/package/file
					}
				} else {
					return null; // Invalid scoped package
				}
			} else {
				// Regular package: package or package/subpath
				const parts = id.split('/');
				packageName = parts[0];
				// Only handle root package imports, not subpaths
				if (parts.length > 1) {
					return null; // This is a subpath import like package/file
				}
			}

			// Check cache first
			if (packageCache.has(packageName)) {
				const cachedResult = packageCache.get(packageName);
				if (cachedResult === null) {
					return null; // Previously determined to not need platform resolution
				}
				return cachedResult;
			}

			const packagePath = findPackageInNodeModules(packageName, projectRoot);

			if (packagePath) {
				const packageJsonPath = path.join(packagePath, 'package.json');
				if (fs.existsSync(packageJsonPath)) {
					try {
						const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
						// Shared main-field platform-variant rules (Case 1/2). Returns a
						// normalizeModuleId-canonical id, or null when no rewrite applies.
						const resolved = resolveMainFieldPlatformVariant(packagePath, packageJson.main, platform);
						if (resolved) {
							const result = { id: resolved, resolvedBy: 'nativescript-package-resolver' };
							packageCache.set(packageName, result);
							return result;
						}
						packageCache.set(packageName, null);
						return null;
					} catch (e) {
						// Cache as null on error
						packageCache.set(packageName, null);
						return null;
					}
				} else {
					// No package.json found
					packageCache.set(packageName, null);
					return null;
				}
			} else {
				// Package doesn't exist
				packageCache.set(packageName, null);
				return null;
			}
		},
	};
}
