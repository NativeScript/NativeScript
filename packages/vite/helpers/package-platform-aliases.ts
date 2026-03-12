import path from 'path';
import fs from 'fs';
import { findPackageInNodeModules } from './module-resolution.js';
import { getProjectRootPath } from './project.js';

const projectRoot = getProjectRootPath();

export function packagePlatformAliases(opts: { tsConfig: { paths?: Record<string, string[]> } | null; verbose?: boolean; platform: string }) {
	// packages used via core transient dependencies and other vite support
	const commonSkips = ['source-map-js', 'html-entities', 'fast-xml-parser', '@valor/nativescript-websockets'];
	return {
		find: /^(@[^/]+\/[^@/]+|[^@/]+)$/,
		replacement: (id) => {
			// Skip packages that have custom plugins
			if (commonSkips.includes(id)) {
				return id; // Let the plugins handle these
			}

			// Skip if this ID is already handled by tsconfig paths
			// Check if this matches any of our tsconfig path aliases
			if (opts.tsConfig?.paths && opts.tsConfig.paths[id]) {
				return id; // Let tsconfig aliases handle this
			}

			// Only handle packages that exist in node_modules (real npm packages)
			const packageName = id;
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
								const platformFile = path.join(packagePath, `${mainField}.${opts.platform}.js`);
								if (fs.existsSync(platformFile)) {
									if (opts.verbose) {
										console.log(`✅ Alias resolver: ${packageName} -> ${mainField}.${opts.platform}.js (extensionless)`);
									}
									return platformFile;
								}

								// Fallback to .js
								const jsFile = path.join(packagePath, `${mainField}.js`);
								if (fs.existsSync(jsFile)) {
									if (opts.verbose) {
										console.log(`✅ Alias resolver: ${packageName} -> ${mainField}.js (extensionless)`);
									}
									return jsFile;
								}
							}
							// Case 2: Main field has extension but file doesn't exist - look for platform variants
							else if (!fs.existsSync(mainFilePath)) {
								// Extract base name and extension
								const ext = path.extname(mainField);
								const baseName = mainField.slice(0, -ext.length);

								// Try platform-specific file first
								const platformFile = path.join(packagePath, `${baseName}.${opts.platform}${ext}`);
								if (fs.existsSync(platformFile)) {
									if (opts.verbose) {
										console.log(`✅ Alias resolver: ${packageName} -> ${baseName}.${opts.platform}${ext} (missing main)`);
									}
									return platformFile;
								}

								// If main file exists, let normal resolution handle it
								// If it doesn't exist and no platform variant found, let it fail naturally
							}
						}
					} catch (e) {
						// Ignore parse errors and fall through
					}
				}
			}

			// Return original if no resolution needed
			return id;
		},
	};
}
