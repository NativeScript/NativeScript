import path from 'path';
import fs from 'fs';
import { getProjectRootPath } from './project.js';
import { findPackageInNodeModules } from './module-resolution.js';
import { normalizeModuleId } from './normalize-id.js';

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
						const mainField = packageJson.main;

						if (mainField) {
							const mainFilePath = path.join(packagePath, mainField);

							// Case 1: Main field has no extension - try to add extensions
							if (!mainField.includes('.')) {
								// Try platform-specific file first
								const platformFile = path.join(packagePath, `${mainField}.${platform}.js`);
								if (fs.existsSync(platformFile)) {
									const result = {
										// Canonicalize so Windows backslash/drive-case variants
										// can't collide with the alias/Vite forward-slash ids.
										id: normalizeModuleId(platformFile),
										resolvedBy: 'nativescript-package-resolver',
									};
									packageCache.set(packageName, result);

									//   console.log(
									//     `🔧 Package resolver: ${packageName} -> ${mainField}.${platform}.js (extensionless)`,
									//   );
									return result;
								}

								// Fallback to .js
								const jsFile = path.join(packagePath, `${mainField}.js`);
								if (fs.existsSync(jsFile)) {
									const result = {
										id: normalizeModuleId(jsFile),
										resolvedBy: 'nativescript-package-resolver',
									};
									packageCache.set(packageName, result);

									// console.log(
									//   `🔧 Package resolver: ${packageName} -> ${mainField}.js (extensionless)`,
									// );
									return result;
								}
							}
							// Case 2: Main field has extension but file doesn't exist - look for platform variants
							else if (!fs.existsSync(mainFilePath)) {
								// Extract base name and extension
								const ext = path.extname(mainField);
								const baseName = mainField.slice(0, -ext.length);

								// Try platform-specific file first
								const platformFile = path.join(packagePath, `${baseName}.${platform}${ext}`);
								if (fs.existsSync(platformFile)) {
									const result = {
										// Canonicalize so Windows backslash/drive-case variants
										// can't collide with the alias/Vite forward-slash ids.
										id: normalizeModuleId(platformFile),
										resolvedBy: 'nativescript-package-resolver',
									};
									packageCache.set(packageName, result);

									//   console.log(
									//     `🔧 Package resolver: ${packageName} -> ${baseName}.${platform}${ext} (missing main)`,
									//   );
									return result;
								}

								// Cache as null - no platform variant found
								packageCache.set(packageName, null);
								return null;
							} else {
								// Main file exists - let normal resolution handle it
								packageCache.set(packageName, null);
								return null;
							}
						}
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

			// Cache as null and return null
			packageCache.set(packageName, null);
			return null;
		},
	};
}
