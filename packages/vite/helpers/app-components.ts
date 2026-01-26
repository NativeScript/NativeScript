import path from 'path';
import fs from 'fs';
import type { Plugin, ResolvedConfig } from 'vite';
import { getProjectRootPath } from './project.js';
import { getProjectAppRelativePath } from './utils.js';

const projectRoot = getProjectRootPath();

export interface AppComponentsOptions {
	/**
	 * List of app component paths (relative to project root).
	 * These are typically custom Android Activity or Application classes.
	 * Example: ['./app/custom-activity.android.ts', './app/custom-application.android.ts']
	 */
	appComponents?: string[];
	platform: 'android' | 'ios' | 'visionos';
	verbose?: boolean;
}

/**
 * Get app components from environment variable or nativescript.config.ts
 * Format: comma-separated paths, e.g., "./app/custom-activity.android,./app/custom-application.android"
 */
function getAppComponentsFromEnv(): string[] {
	const envValue = process.env.NS_APP_COMPONENTS;
	if (!envValue) return [];
	return envValue
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
}

/**
 * Resolve an app component path to an absolute path
 */
function resolveComponentPath(componentPath: string): string | null {
	// If already absolute, check if exists
	if (path.isAbsolute(componentPath)) {
		return fs.existsSync(componentPath) ? componentPath : null;
	}

	// Remove leading ./ if present for consistency
	const cleanPath = componentPath.replace(/^\.\//, '');

	// Try with and without extensions
	const extensions = ['', '.ts', '.js', '.android.ts', '.android.js'];

	for (const ext of extensions) {
		const fullPath = path.resolve(projectRoot, cleanPath + ext);
		if (fs.existsSync(fullPath)) {
			return fullPath;
		}
	}

	// Also try in the app directory
	const appDir = getProjectAppRelativePath('');
	for (const ext of extensions) {
		const fullPath = path.resolve(projectRoot, appDir, cleanPath + ext);
		if (fs.existsSync(fullPath)) {
			return fullPath;
		}
	}

	return null;
}

/**
 * Extract the output name for an app component
 * e.g., "./app/custom-activity.android.ts" -> "custom-activity"
 * e.g., "./app/custom-application.android.ts" -> "custom-application"
 */
function getComponentOutputName(componentPath: string): string {
	const basename = path.basename(componentPath);
	// Remove .android.ts, .android.js, .ts, .js extensions
	return basename.replace(/\.(android\.)?(ts|js)$/, '');
}

/**
 * Plugin to handle NativeScript app components (custom Activity/Application classes)
 *
 * These components need to be bundled as separate entry points because:
 * 1. Custom Android Activity classes are loaded by the Android runtime before the main bundle
 * 2. Custom Android Application classes are loaded even earlier in the app lifecycle
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { defineConfig } from 'vite';
 * import { typescriptConfig, appComponentsPlugin } from '@nativescript/vite';
 *
 * export default defineConfig(({ mode }) => {
 *   const config = typescriptConfig({ mode });
 *   config.plugins.push(
 *     appComponentsPlugin({
 *       appComponents: ['./app/custom-activity.android.ts'],
 *       platform: 'android'
 *     })
 *   );
 *   return config;
 * });
 * ```
 *
 * Or via environment variable:
 * NS_APP_COMPONENTS="./app/custom-activity.android,./app/custom-application.android" ns run android
 */
export function appComponentsPlugin(options: AppComponentsOptions): Plugin {
	const { platform, verbose = false } = options;

	// Collect app components from all sources
	let appComponents: string[] = [...(options.appComponents || []), ...getAppComponentsFromEnv()];

	// Remove duplicates
	appComponents = [...new Set(appComponents)];

	// Resolve all component paths
	const resolvedComponents: Map<string, { absolutePath: string; outputName: string }> = new Map();

	for (const component of appComponents) {
		const absolutePath = resolveComponentPath(component);
		if (absolutePath) {
			const outputName = getComponentOutputName(absolutePath);
			resolvedComponents.set(component, { absolutePath, outputName });
			if (verbose) {
				console.log(`[app-components] Found: ${component} -> ${outputName}.mjs`);
			}
		} else if (verbose) {
			console.warn(`[app-components] Could not resolve: ${component}`);
		}
	}

	// Skip if no components found
	if (resolvedComponents.size === 0) {
		return {
			name: 'nativescript-app-components',
			apply: 'build',
		};
	}

	// Track component output names for entryFileNames
	const componentOutputNames = new Set<string>();
	for (const [, { outputName }] of resolvedComponents) {
		componentOutputNames.add(outputName);
	}

	// Set environment variable so main-entry.ts can inject imports for these components
	// This allows the virtual module to know which app components are configured
	const componentPaths = Array.from(resolvedComponents.values()).map((c) => c.absolutePath);
	process.env.NS_APP_COMPONENTS = componentPaths.join(',');

	// Create a set of output names for quick lookup in resolveId
	const outputMjsFiles = new Set<string>();
	const absoluteMjsPaths = new Set<string>();
	for (const [, { outputName }] of resolvedComponents) {
		outputMjsFiles.add(`~/${outputName}.mjs`);
		outputMjsFiles.add(`./${outputName}.mjs`);
		// Also track absolute paths that Vite might resolve ~/foo.mjs to
		const appDir = getProjectAppRelativePath('');
		const absoluteMjsPath = path.resolve(projectRoot, appDir, `${outputName}.mjs`);
		absoluteMjsPaths.add(absoluteMjsPath);
	}

	let config: ResolvedConfig;

	return {
		name: 'nativescript-app-components',
		apply: 'build',

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},

		// Mark app component output files as external during build
		// These are generated as separate entry points and will exist at runtime
		resolveId(id) {
			// Handle ~/foo.mjs or ./foo.mjs patterns
			if (outputMjsFiles.has(id)) {
				// Return the id with external flag - this tells Rollup to keep the import as-is
				return { id: `./${id.replace(/^~\//, '')}`, external: true };
			}
			// Handle absolute paths that Vite resolves ~/foo.mjs to (e.g., /path/to/app/foo.mjs)
			if (absoluteMjsPaths.has(id)) {
				const basename = path.basename(id);
				return { id: `./${basename}`, external: true };
			}
			return null;
		},

		// Modify the Vite config to support multiple entry points
		config(userConfig) {
			if (resolvedComponents.size === 0) return null;

			// We need to modify the output.entryFileNames to handle multiple entries
			return {
				build: {
					rollupOptions: {
						output: {
							// Use a function to determine entry file names
							entryFileNames: (chunkInfo: { name: string }) => {
								// App components should output as .mjs files
								// This is required because SBG (Static Binding Generator) only parses
								// .mjs files as ES modules. If we output as .js, SBG will try to parse
								// it as CommonJS and fail on import statements.
								if (componentOutputNames.has(chunkInfo.name)) {
									return `${chunkInfo.name}.mjs`;
								}
								// Default: main bundle
								return 'bundle.mjs';
							},
						},
					},
				},
			};
		},

		// Modify rollup options to add additional entry points
		options(inputOptions) {
			if (resolvedComponents.size === 0) return null;

			// Get current input
			const currentInput = inputOptions.input;
			const newInput: Record<string, string> = {};

			// Preserve existing inputs
			if (typeof currentInput === 'string') {
				newInput['bundle'] = currentInput;
			} else if (Array.isArray(currentInput)) {
				currentInput.forEach((input, i) => {
					newInput[`entry${i}`] = input;
				});
			} else if (currentInput && typeof currentInput === 'object') {
				Object.assign(newInput, currentInput);
			}

			// Add app component entries - use the actual file path directly
			for (const [, { absolutePath, outputName }] of resolvedComponents) {
				newInput[outputName] = absolutePath;
			}

			if (verbose) {
				console.log('[app-components] Build inputs:', newInput);
			}

			return { ...inputOptions, input: newInput };
		},

		// Adjust output file names for app components (fallback in case entryFileNames doesn't work)
		generateBundle(options, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (chunk.type !== 'chunk') continue;

				// Check if this is an app component entry
				if (componentOutputNames.has(chunk.name)) {
					// Rename to .mjs (SBG requires .mjs for ES module parsing)
					const newFileName = `${chunk.name}.mjs`;
					if (fileName !== newFileName) {
						chunk.fileName = newFileName;
						delete bundle[fileName];
						bundle[newFileName] = chunk;
					}
				}
			}
		},

		// Post-process app component chunks to fix Rollup's internal variable renaming.
		// SBG (Static Binding Generator) needs the __extends and __decorate calls to use
		// the same class name as the outer variable assignment.
		renderChunk(code, chunk) {
			// Only process app component chunks
			if (!componentOutputNames.has(chunk.name)) {
				return null;
			}

			// Look for patterns where Rollup renamed the internal class variable
			// Pattern: var ClassName = ... __extends(ClassName2, _super); ... return ClassName2; ...
			// We need: var ClassName = ... __extends(ClassName, _super); ... return ClassName; ...

			// Use a simpler regex that matches across the various output formats
			// This finds: var SomeName = ... __extends(SomeName2, ...)
			const varAssignRegex = /var\s+(\w+)\s*=[\s\S]*?__extends\s*\(\s*(\w+)\s*,/g;

			let match;
			let modifiedCode = code;

			while ((match = varAssignRegex.exec(code)) !== null) {
				const outerName = match[1]; // e.g., "CustomActivity"
				const innerName = match[2]; // e.g., "CustomActivity2"

				if (outerName !== innerName && innerName === outerName + '2') {
					// Rollup renamed it - fix by replacing all occurrences of the inner name
					// Only within this chunk, replace innerName with outerName
					// Be careful to only replace as a complete identifier
					const innerNameRegex = new RegExp(`\\b${innerName}\\b`, 'g');
					modifiedCode = modifiedCode.replace(innerNameRegex, outerName);

					if (verbose) {
						console.log(`[app-components] Fixed Rollup rename: ${innerName} -> ${outerName} in ${chunk.fileName}`);
					}
				}
			}

			if (modifiedCode !== code) {
				return { code: modifiedCode, map: null };
			}

			return null;
		},
	};
}

/**
 * Get resolved app components with their output file names
 * Used by main-entry.ts to inject imports for custom activities/applications
 */
export function getResolvedAppComponents(platform: string): Array<{ absolutePath: string; outputName: string }> {
	// Get components from environment variable (set by appComponentsPlugin during build)
	const components = getAppComponentsFromEnv();
	const resolved: Array<{ absolutePath: string; outputName: string }> = [];

	for (const component of components) {
		const absolutePath = resolveComponentPath(component);
		if (absolutePath) {
			const outputName = getComponentOutputName(absolutePath);
			resolved.push({ absolutePath, outputName });
		}
	}

	return resolved;
}
