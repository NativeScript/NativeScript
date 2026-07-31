import fs from 'fs';
import path from 'path';
import { getProjectFilePath, getProjectRootPath } from './project.js';

let tsConfigPath: string;

const projectRoot = getProjectRootPath();

// Read TypeScript path mappings
function getTsConfigPaths(debugViteLogs: boolean = false) {
	try {
		if (debugViteLogs) console.log('📁 Parsing tsconfig at:', tsConfigPath);
		// The configDir should be the directory of the starting tsconfig file
		const startingConfigDir = path.dirname(tsConfigPath);
		// Recursive function to resolve tsconfig extends chain
		function resolveTsConfigChain(configPath, visitedPaths = new Set()) {
			// Prevent infinite loops
			if (visitedPaths.has(configPath)) {
				if (debugViteLogs) console.log('📁 Warning: Circular tsconfig extends detected, skipping:', configPath);
				return { paths: {}, baseUrl: '.' };
			}
			visitedPaths.add(configPath);
			const tsConfigContent = fs.readFileSync(configPath, 'utf8');
			// Parse JSON (handle JSONC)
			let tsConfig;
			try {
				tsConfig = JSON.parse(tsConfigContent);
			} catch (parseError) {
				// Clean up JSONC
				if (debugViteLogs) console.log('📁 Cleaning JSONC for:', configPath);
				let cleanContent = tsConfigContent
					.replace(/\/\/.*$/gm, '')
					.replace(/\/\*[\s\S]*?\*\//g, '')
					.replace(/,(\s*[}\]])/g, '$1');
				tsConfig = JSON.parse(cleanContent);
			}
			// Start with current config's options
			let currentPaths = { ...(tsConfig.compilerOptions?.paths || {}) };
			let mergedBaseUrl = tsConfig.compilerOptions?.baseUrl || '.';
			const currentConfigDir = path.dirname(configPath);

			// Handle path resolution for this config file
			if (currentPaths) {
				const resolvedPaths = {};
				for (const [key, values] of Object.entries(currentPaths)) {
					if (Array.isArray(values)) {
						resolvedPaths[key] = values.map((value) => {
							// Handle ${configDir} substitution - use the STARTING config directory
							if (value.includes('${configDir}')) {
								return value.replace(/\$\{configDir\}/g, startingConfigDir);
							}
							// For other paths, resolve relative to THIS config file's directory
							if (!path.isAbsolute(value)) {
								return path.resolve(currentConfigDir, value);
							}
							return value;
						});
					} else {
						resolvedPaths[key] = values;
					}
				}
				currentPaths = resolvedPaths;
			}
			// If this config extends another, resolve it first
			if (tsConfig.extends) {
				const baseConfigPath = path.resolve(path.dirname(configPath), tsConfig.extends);
				if (debugViteLogs) console.log('📁 Following extends to:', baseConfigPath);
				if (fs.existsSync(baseConfigPath)) {
					try {
						const baseResult = resolveTsConfigChain(baseConfigPath, visitedPaths);
						// Base config comes first, then override with current
						const mergedPaths = { ...baseResult.paths, ...currentPaths };
						// Use current baseUrl if specified, otherwise inherit from base
						if (!tsConfig.compilerOptions?.baseUrl) {
							mergedBaseUrl = baseResult.baseUrl;
						}
						return { paths: mergedPaths, baseUrl: mergedBaseUrl };
					} catch (e) {
						if (debugViteLogs) console.log('📁 Warning: Could not load extended config:', baseConfigPath, e.message);
					}
				} else {
					if (debugViteLogs) console.log('📁 Warning: Extended config not found:', baseConfigPath);
				}
			}
			return { paths: currentPaths, baseUrl: mergedBaseUrl };
		}
		const result = resolveTsConfigChain(tsConfigPath);
		if (debugViteLogs) {
			console.log('📁 Found paths in tsconfig:', Object.keys(result.paths));
			console.log('📁 Base URL:', result.baseUrl);
			console.log('📁 Starting configDir:', startingConfigDir);
			// Show first few resolved paths for debugging
			Object.entries(result.paths)
				.slice(0, 3)
				.forEach(([key, values]) => {
					console.log(`📁 Path example: ${key} -> ${values[0]}`);
				});
		}
		return result;
	} catch (e) {
		console.warn('Failed to parse tsconfig paths:', e.message);
		return { paths: {}, baseUrl: '.' };
	}
}

// Resolve a tsconfig wildcard match to a concrete file on disk, applying
// NativeScript platform-specific (`.android` / `.ios`) and directory-index rules.
// Shared by the resolveId plugin below. Returns the resolved absolute path,
// or the joined path unchanged when nothing matched (so Vite can keep resolving).
function resolveTsConfigWildcard(resolvedDestination: string, subpath: string | undefined, platform: string, verbose?: boolean): string {
	const fullPath = subpath ? path.join(resolvedDestination, subpath) : resolvedDestination;

	// Check if this resolves to a directory, and if so, try to find index files
	if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
		// Try platform-specific index files first
		const platformIndexPatterns = [`index.${platform}.ts`, `index.${platform}.js`, `index.${platform}.mjs`];
		for (const indexFile of platformIndexPatterns) {
			const indexPath = path.join(fullPath, indexFile);
			if (fs.existsSync(indexPath)) {
				if (verbose) {
					console.log(`📁 Found platform-specific directory index: ${indexPath}`);
				}
				return indexPath;
			}
		}

		// Try standard index files
		const indexPatterns = ['index.ts', 'index.js', 'index.mjs'];
		for (const indexFile of indexPatterns) {
			const indexPath = path.join(fullPath, indexFile);
			if (fs.existsSync(indexPath)) {
				if (verbose) {
					console.log(`📁 Found directory index: ${indexPath}`);
				}
				return indexPath;
			}
		}
	}

	// If not a directory or no index found, try platform-specific resolution
	const extensions = ['.ts', '.js', '.mjs'];
	for (const ext of extensions) {
		const basePath = fullPath + ext;

		// Try platform-specific file first
		const platformPath = fullPath + `.${platform}` + ext;
		if (fs.existsSync(platformPath)) {
			if (verbose) {
				console.log(`📁 Found platform-specific file: ${platformPath}`);
			}
			return platformPath;
		}

		// Try base file
		if (fs.existsSync(basePath)) {
			if (verbose) {
				console.log(`📁 Found base file: ${basePath}`);
			}
			return basePath;
		}
	}

	return fullPath;
}

// A tsconfig wildcard rule: a matcher regex (with a single capture group for the
// subpath) plus the resolved destination directory it maps onto.
export type TsConfigWildcardRule = {
	find: RegExp;
	resolvedDestination: string;
};

// Function to create TypeScript aliases with platform support.
// Exact (non-wildcard) tsconfig paths become plain string-replacement aliases
// (safe for Vite 8 / Rolldown). Wildcard paths require fs/platform lookups, so
// they are returned separately as `wildcardRules` and applied by
// `tsConfigPathsResolverPlugin` instead of as function-replacement aliases.
function createTsConfigAliases(opts: { paths: any; baseUrl: string; platform: string; verbose?: boolean }) {
	const aliases = [];
	const wildcardRules: TsConfigWildcardRule[] = [];

	// Process patterns in order: wildcards first, then exact matches
	const sortedPatterns = Object.entries(opts.paths).sort(([a], [b]) => {
		// Wildcards (with *) come first
		const aHasWildcard = a.includes('*');
		const bHasWildcard = b.includes('*');
		if (aHasWildcard && !bHasWildcard) return -1;
		if (!aHasWildcard && bHasWildcard) return 1;
		// Within same type, longer patterns first (more specific)
		return b.length - a.length;
	});

	for (const [pattern, destinations] of sortedPatterns) {
		if (Array.isArray(destinations) && destinations.length > 0) {
			if (pattern.includes('*')) {
				// Handle wildcard patterns (like "@scope/plugins/*")
				const aliasKey = pattern.replace(/\/\*$/, '');
				const destination = destinations[0].replace(/\/\*$/, '');

				// Check if destination is already absolute (resolved by tsconfig chain)
				const resolvedDestination = path.isAbsolute(destination) ? destination : path.resolve(projectRoot, opts.baseUrl, destination);

				// console.log(
				//   `📁 Creating wildcard alias: ${aliasKey} -> ${resolvedDestination}`,
				// );

				// Emit a resolveId rule (handled by tsConfigPathsResolverPlugin) rather
				// than a function-replacement alias, which Vite 8 / Rolldown rejects.
				wildcardRules.push({
					find: new RegExp(`^${aliasKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/(.*))?$`),
					resolvedDestination,
				});
			} else {
				// Handle exact matches (like "@scope/anything/anywhere")
				// Use regex to ensure exact match only

				// Check if destination is already absolute (resolved by tsconfig chain)
				const resolvedDestination = path.isAbsolute(destinations[0]) ? destinations[0] : path.resolve(projectRoot, opts.baseUrl, destinations[0]);
				if (opts.verbose) {
					console.log(`📁 Creating exact alias: ${pattern} -> ${resolvedDestination}`);
				}

				aliases.push({
					find: new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
					replacement: resolvedDestination,
				});
			}
		}
	}

	return { aliases, wildcardRules };
}

// Get TypeScript path configuration
type CachedTsConfig = {
	paths: Record<string, string[]>;
	baseUrl: string;
};

let cachedConfig: CachedTsConfig | null = null;
let cachedPath: string | null = null;

type TsConfigOptions = {
	platform: string;
	verbose?: boolean;
};

export const getTsConfigData = (options: TsConfigOptions) => {
	const verbose = !!options.verbose;

	let candidatePath = getProjectFilePath('tsconfig.app.json');
	if (!fs.existsSync(candidatePath)) {
		candidatePath = getProjectFilePath('tsconfig.json');
	}
	tsConfigPath = candidatePath;

	if (!cachedConfig || cachedPath !== candidatePath) {
		cachedConfig = getTsConfigPaths(verbose);
		cachedPath = candidatePath;
		if (verbose) {
			console.log('📁 Loaded TypeScript path configuration');
		}
	}

	const { aliases, wildcardRules } = createTsConfigAliases({
		paths: cachedConfig.paths,
		baseUrl: cachedConfig.baseUrl,
		platform: options.platform,
		verbose,
	});

	if (aliases.length > 0 && verbose) {
		console.log('📁 Created TypeScript path aliases:', aliases.length);
	}
	if (wildcardRules.length > 0 && verbose) {
		console.log('📁 Created TypeScript wildcard path rules:', wildcardRules.length);
	}

	return {
		paths: cachedConfig.paths,
		baseUrl: cachedConfig.baseUrl,
		aliases,
		wildcardRules,
	};
};

/**
 * Vite/Rollup/Rolldown plugin that applies tsconfig wildcard `paths` mappings.
 *
 * Wildcard mappings need fs-based platform-specific (`.android`/`.ios`) and
 * directory-index resolution, which previously lived in a function-replacement
 * `resolve.alias` entry. Vite 8 / Rolldown's native `ViteAlias` plugin only
 * accepts string replacements and throws on function replacements, so the same
 * logic is provided here as a `resolveId` hook. This is behaviour-compatible with
 * the previous alias on Vite 7 / Rollup as well.
 */
export function tsConfigPathsResolverPlugin(opts: { wildcardRules: TsConfigWildcardRule[]; platform: string; verbose?: boolean }) {
	const { wildcardRules, platform, verbose } = opts;
	return {
		name: 'ns-tsconfig-paths-resolver',
		enforce: 'pre' as const,
		resolveId(id: string) {
			if (!wildcardRules.length) return null;
			// Only handle bare/aliased specifiers, not absolute paths or virtual ids.
			if (id.startsWith('\0') || path.isAbsolute(id)) return null;
			for (const rule of wildcardRules) {
				const match = rule.find.exec(id);
				if (!match) continue;
				const subpath = match[1];
				const resolved = resolveTsConfigWildcard(rule.resolvedDestination, subpath, platform, verbose);
				if (verbose) {
					console.log(`📁 TypeScript wildcard alias: ${id} -> ${resolved}`);
				}
				// Only claim the id when it maps to an existing file; otherwise let
				// other resolvers/extensions try (mirrors the alias fall-through).
				if (fs.existsSync(resolved)) {
					return resolved;
				}
				return null;
			}
			return null;
		},
	};
}
