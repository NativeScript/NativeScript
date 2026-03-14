import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
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

type TsConfigResolverEntry =
	| {
			type: 'exact';
			pattern: string;
			resolvedDestination: string;
	  }
	| {
			type: 'wildcard';
			pattern: string;
			regex: RegExp;
			resolvedDestination: string;
	  };

function resolveTsConfigPath(fullPath: string, platform: string, verbose?: boolean, debugId?: string): string {
	if (verbose && debugId) {
		console.log(`📁 TypeScript path candidate: ${debugId} -> ${fullPath}`);
	}

	if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
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

		for (const indexFile of ['index.ts', 'index.js', 'index.mjs']) {
			const indexPath = path.join(fullPath, indexFile);
			if (fs.existsSync(indexPath)) {
				if (verbose) {
					console.log(`📁 Found directory index: ${indexPath}`);
				}
				return indexPath;
			}
		}
	}

	for (const ext of ['.ts', '.js', '.mjs']) {
		const platformPath = `${fullPath}.${platform}${ext}`;
		if (fs.existsSync(platformPath)) {
			if (verbose) {
				console.log(`📁 Found platform-specific file: ${platformPath}`);
			}
			return platformPath;
		}

		const basePath = `${fullPath}${ext}`;
		if (fs.existsSync(basePath)) {
			if (verbose) {
				console.log(`📁 Found base file: ${basePath}`);
			}
			return basePath;
		}
	}

	return fullPath;
}

function createTsConfigResolvers(opts: { paths: any; baseUrl: string; platform: string; verbose?: boolean }) {
	const resolvers: TsConfigResolverEntry[] = [];

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
				const aliasKey = pattern.replace(/\/\*$/, '');
				const destination = destinations[0].replace(/\/\*$/, '');
				const resolvedDestination = path.isAbsolute(destination) ? destination : path.resolve(projectRoot, opts.baseUrl, destination);
				resolvers.push({
					type: 'wildcard',
					pattern,
					regex: new RegExp(`^${aliasKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/(.*))?$`),
					resolvedDestination,
				});
			} else {
				const resolvedDestination = path.isAbsolute(destinations[0]) ? destinations[0] : path.resolve(projectRoot, opts.baseUrl, destinations[0]);
				if (opts.verbose) {
					console.log(`📁 Creating exact alias: ${pattern} -> ${resolvedDestination}`);
				}

				resolvers.push({
					type: 'exact',
					pattern,
					resolvedDestination,
				});
			}
		}
	}

	return resolvers;
}

export function createTsConfigPathsResolver(opts: { paths: Record<string, string[]>; baseUrl: string; platform: string; verbose?: boolean }): Plugin | undefined {
	const resolvers = createTsConfigResolvers(opts);
	if (!resolvers.length) {
		return undefined;
	}

	return {
		name: 'ns-tsconfig-paths-resolver',
		enforce: 'pre',
		resolveId(source) {
			if (source === '~/package.json') {
				return null;
			}
			for (const resolver of resolvers) {
				if (resolver.type === 'exact') {
					if (source !== resolver.pattern) {
						continue;
					}
					return resolveTsConfigPath(resolver.resolvedDestination, opts.platform, opts.verbose, source);
				}

				const match = resolver.regex.exec(source);
				if (!match) {
					continue;
				}
				const subpath = match[1];
				const fullPath = subpath ? path.join(resolver.resolvedDestination, subpath) : resolver.resolvedDestination;
				return resolveTsConfigPath(fullPath, opts.platform, opts.verbose, source);
			}
			return null;
		},
	};
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

	return {
		paths: cachedConfig.paths,
		baseUrl: cachedConfig.baseUrl,
	};
};
