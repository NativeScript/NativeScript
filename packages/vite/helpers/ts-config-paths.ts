import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { getProjectFilePath, getProjectRootPath } from './project.js';
import { normalizeModuleId } from './normalize-id.js';

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
				const cleanContent = tsConfigContent
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

	// Match TypeScript precedence: exact aliases before wildcard fallbacks.
	const sortedPatterns = Object.entries(opts.paths).sort(([a], [b]) => {
		const aHasWildcard = a.includes('*');
		const bHasWildcard = b.includes('*');
		if (aHasWildcard && !bHasWildcard) return 1;
		if (!aHasWildcard && bHasWildcard) return -1;
		// Within same type, longer patterns first (more specific)
		return b.length - a.length;
	});

	for (const [pattern, destinations] of sortedPatterns) {
		if (Array.isArray(destinations) && destinations.length > 0) {
			if (pattern.includes('*')) {
				const aliasKey = pattern.replace(/\/\*$/, '');
				// Values passed through path.resolve() contain backslashes on Windows.
				// Do not leave a literal wildcard in a filesystem lookup path.
				const destination = destinations[0].replace(/[\\/]\*$/, '');
				const resolvedDestination = path.isAbsolute(destination) ? destination : path.resolve(projectRoot, opts.baseUrl, destination);
				resolvers.push({
					type: 'wildcard',
					pattern,
					regex: new RegExp(`^${aliasKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.*)$`),
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

/**
 * Absolute directory roots that the project's tsconfig `paths` aliases point at.
 *
 * Used to scope HMR to configured shared libraries in a monorepo: a file only
 * triggers an update if it lives under the app source dir or one of these
 * alias roots. When an alias targets a file (e.g. `@org/lib -> libs/lib/src/index.ts`)
 * the file's directory is returned so sibling source files in that library are
 * also in scope. Wildcard aliases (`@org/* -> libs/*`) contribute their resolved
 * base directory (`libs`).
 */
export function getTsConfigAliasRoots(opts: { paths?: Record<string, string[]>; baseUrl?: string }): string[] {
	if (!opts?.paths) return [];
	const resolvers = createTsConfigResolvers({ paths: opts.paths, baseUrl: opts.baseUrl || '.', platform: '' });
	const roots: string[] = [];
	for (const resolver of resolvers) {
		let dest = resolver.resolvedDestination;
		if (!dest) continue;
		if (path.extname(dest)) {
			dest = path.dirname(dest);
		}
		roots.push(dest);
	}
	return roots;
}

export function createTsConfigSpecifierResolver(opts: { paths: Record<string, string[]>; baseUrl: string; platform: string; verbose?: boolean }): ((source: string) => string | null) | undefined {
	const resolvers = createTsConfigResolvers(opts);
	if (!resolvers.length) {
		return undefined;
	}

	// Per-resolver caches.
	//
	// Hot-path note: the Vite plugin wrapper is `enforce: 'pre'`, so this resolver
	// is invoked for every `resolveId` call in the build — including thousands of
	// relative imports (`./foo`), absolute paths, virtual modules (`\0…`), and bare
	// node_modules specifiers (`rxjs`, `@angular/core`, …) that can never match a
	// tsconfig `paths` entry. Memoizing both the no-match outcome and the
	// per-`fullPath` filesystem walk turns repeated lookups from
	// `O(N regexes + ~12 fs syscalls)` into a single `Set.has` / `Map.get`.
	//
	// Cache validity: `paths` / `baseUrl` are baked into the closure at creation,
	// so the regex set never changes for the lifetime of this resolver. The
	// filesystem cache assumes overlapping platform/extension files (e.g. adding a
	// new `foo.ios.ts` next to `foo.ts`) won't appear mid-watch; if that ever
	// bites, invalidate via Vite's `watchChange` hook instead of widening these
	// caches.
	const noMatchCache = new Set<string>();
	const fsResolveCache = new Map<string, string>();
	const cachedResolveTsConfigPath = (fullPath: string, debugId?: string): string => {
		const cached = fsResolveCache.get(fullPath);
		if (cached !== undefined) {
			return cached;
		}
		// Canonicalize the resolved id (forward slashes + uppercase Windows drive).
		// path.join/string-concat inside resolveTsConfigPath emit backslashes on
		// Windows; without this a tsconfig-aliased file would land in Rolldown's
		// graph under a different id than the same file reached via Vite's
		// forward-slash resolution. No-op on POSIX. See normalize-id.ts.
		const resolved = normalizeModuleId(resolveTsConfigPath(fullPath, opts.platform, opts.verbose, debugId));
		fsResolveCache.set(fullPath, resolved);
		return resolved;
	};

	return (source: string): string | null => {
		if (source === '~/package.json') {
			return null;
		}

		// Early reject for specifier shapes that can never match a tsconfig
		// `paths` entry. Skipping them here avoids walking every resolver
		// regex on the hot path.
		//   46 = '.'  → relative imports (`./foo`, `../bar`)
		//   47 = '/'  → already-absolute paths (no alias would start with /)
		//    0 = '\0' → Vite/Rolldown virtual modules
		const firstChar = source.charCodeAt(0);
		if (firstChar === 46 || firstChar === 47 || firstChar === 0) {
			return null;
		}
		// URL-style specifiers (`http:`, `file:`, `data:`, `node:fs`, …) and
		// Windows drive letters (`C:\…`). None of these can match a path
		// alias, and `:` isn't a valid character in npm package names or
		// tsconfig path patterns we'd ever want to alias.
		if (source.includes(':')) {
			return null;
		}

		if (noMatchCache.has(source)) {
			return null;
		}

		for (const resolver of resolvers) {
			if (resolver.type === 'exact') {
				if (source !== resolver.pattern) {
					continue;
				}
				return cachedResolveTsConfigPath(resolver.resolvedDestination, source);
			}

			const match = resolver.regex.exec(source);
			if (!match) {
				continue;
			}
			const subpath = match[1];
			const fullPath = subpath ? path.join(resolver.resolvedDestination, subpath) : resolver.resolvedDestination;
			return cachedResolveTsConfigPath(fullPath, source);
		}

		noMatchCache.add(source);
		return null;
	};
}

/**
 * Vite `resolveId` plugin that maps tsconfig `paths` aliases to absolute module
 * ids. Thin wrapper over `createTsConfigSpecifierResolver`.
 */
export function createTsConfigPathsResolver(opts: { paths: Record<string, string[]>; baseUrl: string; platform: string; verbose?: boolean }): Plugin | undefined {
	const resolve = createTsConfigSpecifierResolver(opts);
	if (!resolve) {
		return undefined;
	}
	return {
		name: 'ns-tsconfig-paths-resolver',
		enforce: 'pre',
		resolveId(source) {
			return resolve(source);
		},
	};
}

// --- Project-level alias resolution for non-Vite consumers (HMR SFC routes) ---
//
// The HMR Vue SFC assembler/server rewrite `.vue` imports with their own regex
// and read SFC source straight from disk, bypassing Vite's resolver — so they
// were blind to tsconfig `paths` aliases (`@present/...`, `@app`, …) and 500'd
// on any aliased `.vue` import. These helpers give those routes the SAME alias
// resolution the build uses, memoized once per process.
let _projectAliasResolver: ((source: string) => string | null) | null | undefined;

export function resolveProjectTsAlias(spec: string): string | null {
	if (_projectAliasResolver === undefined) {
		try {
			const tsConfig = getTsConfigData({ platform: '' });
			_projectAliasResolver = createTsConfigSpecifierResolver({ paths: tsConfig.paths, baseUrl: tsConfig.baseUrl, platform: '' }) ?? null;
		} catch {
			_projectAliasResolver = null;
		}
	}
	return _projectAliasResolver ? _projectAliasResolver(spec) : null;
}

/**
 * Resolve an aliased specifier to a POSIX, project-root-relative path
 * (`@present/components/ui/BasePage.vue` → `/src/presentation/components/ui/BasePage.vue`) —
 * the form the HMR SFC routes use as their on-disk `base`. Returns `null` when
 * the alias doesn't match or resolves outside the project root.
 */
export function resolveProjectTsAliasRelative(spec: string, projectRoot: string): string | null {
	const abs = resolveProjectTsAlias(spec);
	if (!abs) return null;
	const rel = path.relative(projectRoot, abs);
	if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
	return '/' + rel.split(path.sep).join('/');
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
