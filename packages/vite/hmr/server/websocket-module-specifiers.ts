import { existsSync, readFileSync, realpathSync } from 'fs';
import * as path from 'path';

import * as PAT from './constants.js';
import type { VendorManifest } from '../shared/vendor/manifest.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getProjectRootPath } from '../../helpers/project.js';
import { extractRootPackageName, getPackageRuntimeInfo } from '../shared/package-classifier.js';

const ESM_FRAMEWORK_PACKAGE_ROOTS = new Set(['@nativescript/angular', 'nativescript-angular']);

const BUILD_TIME_ONLY_PACKAGE_ROOTS = new Set(['@nativescript/vite', '@nativescript/webpack', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', 'vite', 'webpack', 'esbuild', 'typescript', 'ts-node', 'prettier']);

const BUILD_TIME_ONLY_PACKAGE_PREFIXES = ['@vitejs/', '@rollup/', '@babel/', '@angular-devkit/', '@angular/build', '@analogjs/', 'vite-plugin-'];
const EXPLICIT_RUNTIME_PLUGIN_SCRIPT_EXT_RE = /(?:\.(?:ios|android|visionos))?\.(?:ts|tsx|js|jsx|mjs|mts|cts)$/i;

function hasExplicitRuntimePluginScriptExtension(segment: string): boolean {
	return EXPLICIT_RUNTIME_PLUGIN_SCRIPT_EXT_RE.test(segment);
}

export function extractVitePrebundleId(spec: string): string | null {
	const m = spec.match(/\.vite\/deps\/([^?]+?)\.[mc]?js/);
	if (m) return m[1];
	const m2 = spec.match(/__x00__([^?]+?)\.[mc]?js/);
	if (m2) return m2[1];
	return null;
}

export function getFlattenedManifestMap(manifest: VendorManifest): Map<string, string> {
	const map = new Map<string, string>();
	const mods = Object.keys(manifest.modules || {});
	for (const canonical of mods) {
		const flat = canonical.replace(/\./g, '__').replace(/\//g, '_');
		map.set(flat, canonical);
		const alias = (manifest.aliases as any)?.[canonical];
		if (alias) {
			const aliasFlat = String(alias).replace(/\./g, '__').replace(/\//g, '_');
			map.set(aliasFlat, canonical);
		}
	}
	return map;
}

export function normalizeNativeScriptCoreSpecifier(spec: string): string {
	let normalized = spec.replace(/@nativescript[_-]core/gi, '@nativescript/core').replace(/@nativescript\/core\/index\.js$/i, '@nativescript/core/index.js');

	if (normalized.startsWith('/node_modules/')) {
		const idx = normalized.toLowerCase().indexOf('@nativescript/core');
		if (idx !== -1) {
			normalized = normalized.slice(idx);
		}
	}

	if (normalized.toLowerCase().startsWith('@nativescript/core')) {
		normalized = normalized.replace(/\?[^"'`]*$/, '');
	}

	return normalized;
}

export function normalizeNodeModulesSpecifier(spec: string): string | null {
	if (!spec) {
		return null;
	}

	let normalized = spec.replace(/\\/g, '/');
	const idx = normalized.lastIndexOf('/node_modules/');
	if (idx === -1) {
		return null;
	}

	let subPath = normalized.slice(idx + '/node_modules/'.length);
	if (!subPath) {
		return null;
	}

	subPath = subPath.replace(PAT.QUERY_PATTERN, '');

	if (!subPath) {
		return null;
	}

	if (subPath.startsWith('.vite/')) {
		return null;
	}

	return subPath.startsWith('/') ? subPath.slice(1) : subPath;
}

export function isEsmFrameworkPackageSpecifier(spec: string): boolean {
	if (!spec) return false;
	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const root = extractRootPackageName(normalized);
	return ESM_FRAMEWORK_PACKAGE_ROOTS.has(root);
}

export function isCoreGlobalsReference(spec: string): boolean {
	return /@nativescript(?:[\/_-])core(?:[\/_-])globals/.test(spec || '');
}

export function isNativeScriptCoreModule(spec: string): boolean {
	return /^(?:@nativescript[\/_-]core|@nativescript\/core)(?:\b|\/)/i.test(spec || '');
}

export function isNativeScriptPluginModule(spec: string): boolean {
	return /^@nativescript\//i.test(spec || '') && !isNativeScriptCoreModule(spec || '');
}

function isBuildTimeOnlyPackageRoot(root: string): boolean {
	if (!root) return false;
	if (BUILD_TIME_ONLY_PACKAGE_ROOTS.has(root)) return true;
	return BUILD_TIME_ONLY_PACKAGE_PREFIXES.some((prefix) => root.startsWith(prefix));
}

function isAllowedNativeScriptViteDeviceSubpath(spec: string): boolean {
	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const pkgName = extractRootPackageName(normalized) || normalized;
	if (pkgName !== '@nativescript/vite') {
		return true;
	}

	const subpath = normalized.slice(pkgName.length).replace(/^\/+/, '');
	if (!subpath) {
		return false;
	}

	return subpath === 'hmr/entry-runtime.js' || subpath.startsWith('hmr/client/') || /^hmr\/frameworks\/[^/]+\/client\//.test(subpath) || subpath.startsWith('hmr/shared/runtime/') || subpath.startsWith('shims/') || subpath === 'runtime/core-aliases-early.js' || subpath === 'polyfills/module.js';
}

export function getBlockedDeviceNodeModulesReason(spec: string): string | null {
	if (!spec) return null;

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const pkgName = extractRootPackageName(normalized) || normalized;
	if (!pkgName) {
		return null;
	}

	if (pkgName === '@nativescript/vite') {
		if (isAllowedNativeScriptViteDeviceSubpath(normalized)) {
			return null;
		}

		const subpath = normalized.slice(pkgName.length).replace(/^\/+/, '');
		return subpath ? `build-time NativeScript Vite module is not device-loadable: ${pkgName}/${subpath}` : 'build-time NativeScript Vite package root is not device-loadable';
	}

	if (isBuildTimeOnlyPackageRoot(pkgName)) {
		return `build-time package is not device-loadable: ${pkgName}`;
	}

	return null;
}

export function isLikelyNativeScriptRuntimePluginSpecifier(spec: string, projectRoot: string = getProjectRootPath()): boolean {
	if (!spec) return false;
	const s = spec.replace(PAT.QUERY_PATTERN, '');
	if (/^(?:\.|\/|https?:\/\/)/i.test(s)) return false;
	if (s.startsWith('@@/')) return false;
	if (s.startsWith('~/')) return false;
	if (s.startsWith('@/')) return false;
	if (/\.vue(?:\?|$)/i.test(s)) return false;

	const root = extractRootPackageName(s) || s;
	if (!root) return false;
	if (isNativeScriptCoreModule(root)) return false;
	if (ESM_FRAMEWORK_PACKAGE_ROOTS.has(root)) return false;
	if (/^(?:vue|nativescript-vue)(?:\b|\/)/i.test(root)) return false;
	if (isBuildTimeOnlyPackageRoot(root)) return false;
	if (getPackageRuntimeInfo(root, projectRoot).hasNativeScriptMetadata) return true;
	if (/^@nativescript\//i.test(root)) return true;
	if (/^(?:@nativescript-community|@nstudio|@mleleux)\//i.test(root)) return true;
	return /(?:^|\/)nativescript(?:$|[-_])/i.test(root);
}

export function isLikelyNativeScriptPluginSpecifier(spec: string, projectRoot: string = getProjectRootPath()): boolean {
	if (!spec) return false;
	const s = spec.replace(PAT.QUERY_PATTERN, '');
	if (/^(?:\.|\/|https?:\/\/)/i.test(s)) return false;
	if (s.startsWith('@@/')) return false;
	if (s.startsWith('~/')) return false;
	if (s.startsWith('@/')) return false;
	if (/\.vue(?:\?|$)/i.test(s)) return false;
	if (/^@nativescript\/core(\b|\/)/i.test(s)) return false;
	if (isEsmFrameworkPackageSpecifier(s)) return false;
	if (/^(?:vue|nativescript-vue)(?:\b|\/)/i.test(s)) return false;
	const root = extractRootPackageName(s) || s;
	if (isBuildTimeOnlyPackageRoot(root)) return false;
	if (getPackageRuntimeInfo(root, projectRoot).hasNativeScriptMetadata) return true;
	return true;
}

export function tryReadRawExplicitJavaScriptModule(spec: string, projectRoot: string): { code: string; resolvedId: string } | null {
	if (!spec || !spec.startsWith('/')) return null;
	if (spec.startsWith('/@id/') || spec.startsWith('/@fs/')) return null;
	if (!/\.js$/i.test(spec) || /\.(?:mjs|cjs)$/i.test(spec)) return null;

	try {
		const nodeModulesSpecifier = normalizeNodeModulesSpecifier(spec);
		if (nodeModulesSpecifier) {
			const pkgName = extractRootPackageName(nodeModulesSpecifier);
			if (isLikelyNativeScriptRuntimePluginSpecifier(pkgName, projectRoot)) {
				return null;
			}
		}
	} catch {}

	// source-map-js ships as CJS with relative require() calls that need
	// ESM conversion via sourceMapJsCompatPlugin. Force Vite transforms.
	if (/\/node_modules\/source-map-js\//.test(spec)) return null;

	const root = path.resolve(projectRoot);
	const absPath = path.resolve(root, `.${spec}`);
	if (!absPath.startsWith(root + path.sep) && absPath !== root) return null;
	try {
		const code = existsSync(absPath) ? readFileSync(absPath, 'utf-8') : null;
		if (code != null) {
			const usesNodeModuleInterop = /(?:from\s*['"](?:node:)?module['"]|import\s*\{[^}]*\bcreateRequire\b[^}]*\}\s*from\s*['"](?:node:)?module['"]|\bcreateRequire\s*\()/m.test(code);
			if (usesNodeModuleInterop) {
				return null;
			}

			// For node_modules files that use CJS require() with relative
			// specifiers, defer to Vite transforms so the ESM conversion
			// plugins (e.g. sourceMapJsCompatPlugin) can run. Raw reads
			// leave `require('./x')` intact, which then hits NS's native
			// file-based require and fails on HTTP URLs.
			if (/\/node_modules\//.test(spec) && /\brequire\s*\(\s*['"]\.{1,2}\//.test(code)) {
				return null;
			}

			return { code, resolvedId: spec };
		}
	} catch {}
	return null;
}

export function stripDecoratedServePrefixes(spec: string): { cleanedSpec: string; bootTaggedRequest: boolean; forcedVer: string | null } {
	let cleanedSpec = spec || '';
	let bootTaggedRequest = false;
	let forcedVer: string | null = null;

	try {
		let changed = true;
		while (changed) {
			changed = false;
			const bootMatch = cleanedSpec.match(/^\/?__ns_boot__\/[^\/]+(\/.*)?$/);
			if (bootMatch) {
				bootTaggedRequest = true;
				cleanedSpec = bootMatch[1] || '/';
				changed = true;
			}
			const hmrMatch = cleanedSpec.match(/^\/?__ns_hmr__\/([^\/]+)(\/.*)?$/);
			if (hmrMatch) {
				const tag = hmrMatch[1] || '';
				if (tag) {
					forcedVer = tag;
				}
				cleanedSpec = hmrMatch[2] || '/';
				changed = true;
			}
		}
	} catch {}

	return { cleanedSpec, bootTaggedRequest, forcedVer };
}

export function resolveVendorFromCandidate(specifier: string | null | undefined): string | null {
	if (!specifier) {
		return null;
	}

	const manifest = getVendorManifest();
	if (!manifest) {
		return null;
	}

	const cleaned = specifier.replace(PAT.QUERY_PATTERN, '');
	const direct = resolveVendorSpecifier(cleaned);
	if (direct) {
		return direct;
	}

	const flattenedId = extractVitePrebundleId(cleaned);
	if (flattenedId) {
		const flattenedMap = getFlattenedManifestMap(manifest);
		const flatMatch = flattenedMap.get(flattenedId);
		if (flatMatch) {
			return flatMatch;
		}
		for (const [flatKey, canonical] of flattenedMap.entries()) {
			if (flattenedId === flatKey) {
				return canonical;
			}
			if (flattenedId.startsWith(`${flatKey}_`)) {
				const flatSuffix = flattenedId.slice(flatKey.length + 1);
				const subpath = flatSuffix.replace(/_/g, '/');
				if (isFileDistSubpath(subpath)) {
					return canonical;
				}
				const aliasKey = `${canonical}/${subpath.split('/')[0]}`;
				if (manifest.aliases?.[aliasKey] && manifest.modules[manifest.aliases[aliasKey]]) {
					return manifest.aliases[aliasKey];
				}
			}
		}
		const guessedId = flattenedId.replace(/__/g, '.').replace(/_/g, '/');
		if (guessedId && guessedId !== flattenedId) {
			const guessedCanonical = resolveVendorSpecifier(guessedId);
			if (guessedCanonical) {
				return guessedCanonical;
			}
			const prefix = findVendorPrefix(guessedId, manifest);
			if (prefix) {
				return prefix;
			}
		}
	}

	const normalizedCore = normalizeNativeScriptCoreSpecifier(cleaned);
	if (normalizedCore !== cleaned) {
		const nsCanonical = resolveVendorSpecifier(normalizedCore);
		if (nsCanonical) {
			return nsCanonical;
		}
	}

	const nodeModulesSpecifier = normalizeNodeModulesSpecifier(cleaned);
	if (nodeModulesSpecifier) {
		const canonical = resolveVendorSpecifier(nodeModulesSpecifier);
		if (canonical) {
			return canonical;
		}
		const prefix = findVendorPrefix(nodeModulesSpecifier, manifest);
		if (prefix) {
			return prefix;
		}
	}

	const prefix = findVendorPrefix(cleaned, manifest);
	if (prefix) {
		return prefix;
	}

	return null;
}

/**
 * Resolve a candidate URL ('/node_modules/...', '/@fs/...', or an
 * absolute fs path) to a real file on disk under one of the allowed
 * roots, returning the absolute fs path or `null`.
 *
 * `workspaceRoot` is consulted ONLY when the candidate cannot be
 * resolved under `projectRoot` — this keeps the existing app-local
 * behaviour identical and adds a fallback for monorepos where
 * `node_modules/` is hoisted above the app dir (Nx, Rush, Turborepo,
 * etc.). Without this fallback, every `/ns/m/node_modules/<hoisted-pkg>`
 * request to the dev server's bridge fails with a "transform miss"
 * 404 even though the file is right there at the workspace root.
 */
export function resolveCandidateFilePath(candidate: string, projectRoot: string, workspaceRoot?: string | null): string | null {
	const cleaned = candidate.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned) return null;

	const tryUnderRoot = (root: string): string | null => {
		const resolvedRoot = path.resolve(root);
		let absPath: string | null = null;

		if (cleaned.startsWith('/@fs/')) {
			absPath = cleaned.slice('/@fs'.length);
		} else if (cleaned.includes('/node_modules/')) {
			absPath = path.resolve(resolvedRoot, `.${cleaned}`);
		} else if (/^(?:[A-Za-z]:)?\//.test(cleaned)) {
			absPath = path.resolve(cleaned);
		}

		if (!absPath) {
			return null;
		}

		const rel = path.relative(resolvedRoot, absPath);
		if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
			return null;
		}

		return existsSync(absPath) ? absPath : null;
	};

	const fromProjectRoot = tryUnderRoot(projectRoot);
	if (fromProjectRoot) return fromProjectRoot;

	if (workspaceRoot) {
		const resolvedProject = path.resolve(projectRoot);
		const resolvedWorkspace = path.resolve(workspaceRoot);
		if (resolvedWorkspace !== resolvedProject) {
			return tryUnderRoot(resolvedWorkspace);
		}
	}

	return null;
}

/**
 * Rewrite a `/@fs/<abs-path>` URL into a `/ns/m/<rel>` URL so the chain
 * stays inside our HMR pipeline.
 *
 * Vite's transform output emits `/@fs/<abs-path>` for any module whose
 * resolved id lives outside the configured `root` — including hoisted
 * `node_modules/<pkg>/...` entries and workspace libraries in monorepos
 * (Nx, Rush, Turborepo, pnpm/yarn/npm workspaces, etc.). If we leave
 * those URLs untouched, the device fetches them through Vite's standard
 * middleware which does NOT apply our CJS/UMD-wrapping pipeline; UMD
 * modules like papaparse then crash because top-level `this` is
 * `undefined` in ESM context (the `(function(root, factory) { ... })(this,
 * function moduleFactory() { ... })` IIFE passes `undefined` as `root`
 * and the third branch tries to do `undefined.Papa = factory()`).
 *
 * The conversion preserves any `?...` / `#...` suffix and tries roots in
 * this order:
 *   1. `projectRoot` — app-local files; mirrors the URL shape we already
 *      emit for relative imports under the app's own dir.
 *   2. `workspaceRoot` — hoisted `node_modules` and monorepo workspace
 *      libs. The `/ns/m/` handler resolves these via its
 *      `buildFsCandidate` fallback that probes both roots.
 *
 * Returns `null` when the absolute path is outside both roots; the
 * caller should then leave the original `/@fs/` URL alone (defensive).
 */
export function rewriteFsAbsoluteToNsM(spec: string, projectRoot: string, workspaceRoot?: string | null): string | null {
	if (!spec || !spec.startsWith('/@fs/')) return null;

	const queryStart = spec.search(/[?#]/);
	const cleanSpec = queryStart !== -1 ? spec.slice(0, queryStart) : spec;
	const querySuffix = queryStart !== -1 ? spec.slice(queryStart) : '';

	// /@fs/<abs-path> — strip the prefix to recover the absolute path.
	// On posix this is "/Users/...". On Windows Vite emits "/@fs/C:/..."
	// where the path retains its drive letter.
	const absPath = cleanSpec.slice('/@fs'.length);
	if (!absPath.startsWith('/')) return null;

	const toPosix = (value: string) => value.replace(/\\/g, '/');
	const stripTrailing = (value: string) => value.replace(/\/+$/, '');

	const projectRootPosix = stripTrailing(toPosix(path.resolve(projectRoot)));
	const workspaceRootPosix = workspaceRoot ? stripTrailing(toPosix(path.resolve(workspaceRoot))) : null;

	const tryRoot = (root: string): string | null => {
		if (!root) return null;
		if (absPath === root) return '';
		if (absPath.startsWith(`${root}/`)) {
			return absPath.slice(root.length + 1);
		}
		return null;
	};

	// App-local first so URLs match the existing `/ns/m/<projectRel>` shape.
	let rel = tryRoot(projectRootPosix);
	if (rel === null && workspaceRootPosix && workspaceRootPosix !== projectRootPosix) {
		rel = tryRoot(workspaceRootPosix);
	}
	if (rel === null) return null;

	return rel === '' ? `/ns/m${querySuffix}` : `/ns/m/${rel}${querySuffix}`;
}

/**
 * Filter `candidates` (variations of `spec` with different extensions /
 * `index.*`) down to those that exist on disk under `projectRoot` or
 * `workspaceRoot`. Workspace-root-only matches are rewritten to their
 * `/@fs/<abs-path>` form so the downstream `transformRequest` call can
 * load them directly without having to go through Vite's bare-specifier
 * resolver — which is gated by the package's `package.json#exports`
 * field and refuses internal sub-paths even when the file is on disk
 * (e.g. `css-tree/lib/syntax/index.js`).
 *
 * Candidates whose real path (after symlink resolution) lives OUTSIDE
 * any `node_modules` directory are also rewritten to `/@fs/<real-path>`.
 * Vite's built-in esbuild transform plugin excludes `node_modules` paths
 * from TS->JS conversion, so a workspace TypeScript package re-exposed
 * via `node_modules/<scope>/<pkg>` (a common monorepo pattern: e.g.
 * `node_modules/@blackout/plugins -> ../../plugins/src`) would otherwise
 * be served as raw TypeScript and fail at the device with `Missing
 * initializer in const declaration` on type annotations like
 * `export const X: string = '...'`. Routing through the realpath makes
 * Vite see a non-`node_modules` path and the TS transform applies.
 *
 * App-local candidates whose real path is also app-local are returned
 * unchanged so existing behaviour is preserved bit-for-bit.
 */
export function filterExistingNodeModulesTransformCandidates(spec: string, candidates: string[], projectRoot: string, workspaceRoot?: string | null): string[] {
	const cleanedSpec = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleanedSpec.includes('/node_modules/')) {
		return candidates;
	}

	const resolvedProjectRoot = path.resolve(projectRoot);
	const resolvedWorkspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : null;
	const hasDistinctWorkspaceRoot = !!resolvedWorkspaceRoot && resolvedWorkspaceRoot !== resolvedProjectRoot;

	// The bridge's caller composes `candidates` from both the explicit
	// spec and a fan-out of extension/index variants, which routinely
	// produces the same URL twice (e.g. `/foo/index.js` is both the
	// explicit spec and a `${baseNoExt}.js` variant). Dedup so we don't
	// invoke `transformRequest()` twice for the same path.
	const seen = new Set<string>();
	const result: string[] = [];
	for (const candidate of candidates) {
		const resolved = resolveCandidateFilePath(candidate, resolvedProjectRoot, hasDistinctWorkspaceRoot ? resolvedWorkspaceRoot : null);
		if (!resolved) continue;

		const cleanedCandidate = candidate.replace(PAT.QUERY_PATTERN, '');
		const querySuffix = candidate.length > cleanedCandidate.length ? candidate.slice(cleanedCandidate.length) : '';

		// Detect "node_modules entry that symlinks to non-node_modules
		// source". This is the canonical NativeScript monorepo pattern for
		// workspace packages re-exposed under `node_modules/<scope>/<pkg>`
		// so the runtime resolver finds them via standard Node resolution.
		// Without this rewrite Vite serves the raw `.ts` source and the
		// device chokes on type annotations.
		let mapped: string | null = null;
		try {
			const realResolved = realpathSync(resolved);
			if (realResolved !== resolved) {
				const realIsInsideNodeModules = realResolved.split(path.sep).includes('node_modules');
				if (!realIsInsideNodeModules) {
					mapped = `/@fs${realResolved.replace(/\\/g, '/')}${querySuffix}`;
				}
			}
		} catch {
			// realpath may fail on broken or circular symlinks. Fall
			// through to the existing project/workspace logic.
		}

		if (mapped === null) {
			if (!hasDistinctWorkspaceRoot) {
				mapped = candidate;
			} else {
				const relFromProject = path.relative(resolvedProjectRoot, resolved);
				const insideProjectRoot = relFromProject !== '' && !relFromProject.startsWith('..') && !path.isAbsolute(relFromProject);
				if (insideProjectRoot) {
					mapped = candidate;
				} else {
					// Hoisted `node_modules/<pkg>/...` file lives above projectRoot.
					// Rewrite the URL to its fs-anchored form so Vite reads it directly
					// instead of bouncing through bare-specifier resolution that the
					// hoisted package's `exports` field may refuse.
					mapped = `/@fs${resolved.replace(/\\/g, '/')}${querySuffix}`;
				}
			}
		}

		if (seen.has(mapped)) continue;
		seen.add(mapped);
		result.push(mapped);
	}
	return result;
}

function findVendorPrefix(specifier: string, manifest: NonNullable<ReturnType<typeof getVendorManifest>>): string | null {
	const { modules, aliases } = manifest;
	const keys = Object.keys(modules || {});
	for (const key of keys) {
		if (specifier === key) {
			return key;
		}
		if (specifier.startsWith(`${key}/`)) {
			const subpath = specifier.slice(key.length + 1);
			if (isFileDistSubpath(subpath)) {
				return key;
			}
			const aliasKey = `${key}/${subpath.split('/')[0]}`;
			if (aliases?.[aliasKey] && modules[aliases[aliasKey]]) {
				return aliases[aliasKey];
			}
			continue;
		}
	}
	return null;
}

export function viteDepsPathToBareSpecifier(depPath: string): string | null {
	const manifest = getVendorManifest();
	if (!manifest) return null;

	const flatId = extractVitePrebundleId(`.vite/deps/${depPath}`);
	if (!flatId) return null;

	const flatMap = getFlattenedManifestMap(manifest);

	if (flatMap.has(flatId)) {
		return flatMap.get(flatId)!;
	}

	let bestKey = '';
	let bestCanonical = '';
	for (const [flatKey, canonical] of flatMap.entries()) {
		if (flatId.startsWith(`${flatKey}_`) && flatKey.length > bestKey.length) {
			bestKey = flatKey;
			bestCanonical = canonical;
		}
	}

	if (bestKey && bestCanonical) {
		const flatSuffix = flatId.slice(bestKey.length + 1);
		const subpath = flatSuffix.replace(/_/g, '/');
		return `${bestCanonical}/${subpath}`;
	}

	return null;
}

function isFileDistSubpath(subpath: string): boolean {
	const firstSegment = subpath.split('/')[0];
	const FILE_DIST_DIRS = new Set(['dist', 'src', 'lib', 'build', 'esm', 'cjs', 'es', 'umd', 'module', 'bundle', 'output', '_esm', '_cjs']);
	if (FILE_DIST_DIRS.has(firstSegment)) {
		return true;
	}
	if (!subpath.includes('/') && /\.[a-zA-Z0-9]+$/.test(subpath)) {
		return true;
	}
	return false;
}

const nodeModulesPackageBoundaryCache = new Map<string, { packageName: string; subpath: string }>();

export function resolveNodeModulesPackageBoundary(nodeModulesSpec: string, projectRoot: string): { packageName: string; subpath: string } {
	const normalized = String(nodeModulesSpec || '')
		.replace(PAT.QUERY_PATTERN, '')
		.replace(/^\/+/, '');
	const resolvedProjectRoot = path.resolve(projectRoot || getProjectRootPath());
	const cacheKey = `${resolvedProjectRoot}::${normalized}`;
	const cached = nodeModulesPackageBoundaryCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const rootPackageName = extractRootPackageName(normalized) || normalized;
	let packageName = rootPackageName;

	if (packageName && normalized.startsWith(`${packageName}/`)) {
		const segments = normalized.split('/');
		const rootSegmentCount = rootPackageName.startsWith('@') ? 2 : 1;
		for (let end = segments.length; end > rootSegmentCount; end--) {
			const candidate = segments.slice(0, end).join('/');
			if (!candidate || candidate === rootPackageName) {
				continue;
			}
			const candidatePackageJson = path.join(resolvedProjectRoot, 'node_modules', ...candidate.split('/'), 'package.json');
			if (existsSync(candidatePackageJson)) {
				packageName = candidate;
				break;
			}
		}
	}

	const subpath = normalized === packageName ? '' : normalized.slice(packageName.length).replace(/^\/+/, '');
	const resolved = { packageName, subpath };
	nodeModulesPackageBoundaryCache.set(cacheKey, resolved);
	return resolved;
}

const exportsReverseMapCache = new Map<string, Map<string, string>>();

function resolveExportConditionValue(conditions: unknown): string | null {
	if (typeof conditions === 'string') return conditions;
	if (typeof conditions !== 'object' || conditions === null) return null;
	const obj = conditions as Record<string, unknown>;
	for (const key of ['esm2022', 'esm', 'esm2015', 'import', 'module', 'default']) {
		if (key in obj) {
			const result = resolveExportConditionValue(obj[key]);
			if (result) return result;
		}
	}
	for (const val of Object.values(obj)) {
		if (typeof val === 'string') return val;
	}
	return null;
}

function getExportsReverseMap(pkgName: string, projectRoot: string): Map<string, string> {
	const cached = exportsReverseMapCache.get(pkgName);
	if (cached) return cached;

	const map = new Map<string, string>();
	try {
		const pkgJsonPath = path.join(projectRoot, 'node_modules', pkgName, 'package.json');
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

		if (pkgJson.exports && typeof pkgJson.exports === 'object') {
			for (const [entryPoint, conditions] of Object.entries(pkgJson.exports)) {
				if (entryPoint.includes('*') || entryPoint.endsWith('.json')) continue;

				const resolvedPath = resolveExportConditionValue(conditions);
				if (resolvedPath && typeof resolvedPath === 'string') {
					const normalized = resolvedPath.replace(/^\.\//, '');
					const bareSpec = entryPoint === '.' ? pkgName : `${pkgName}/${entryPoint.replace(/^\.\//, '')}`;
					map.set(normalized, bareSpec);
				}
			}
		}

		if (map.size === 0) {
			for (const field of ['module', 'main'] as const) {
				const value = pkgJson[field];
				if (value && typeof value === 'string') {
					const normalized = value.replace(/^\.\//, '');
					map.set(normalized, pkgName);
					const withoutExt = normalized.replace(/\.[^.]+$/, '');
					if (withoutExt !== normalized) {
						map.set(withoutExt, pkgName);
					}
					break;
				}
			}
		}
	} catch {}

	exportsReverseMapCache.set(pkgName, map);
	return map;
}

function getPackageMainFieldInfo(pkgName: string, projectRoot: string): { hasExports: boolean; mainEntries: Set<string> } {
	const info = getPackageRuntimeInfo(pkgName, projectRoot);
	return {
		hasExports: info.hasExports,
		mainEntries: info.mainEntries,
	};
}

export function resolveInternalRuntimePluginBareSpecifier(spec: string, projectRoot: string): string | null {
	if (!spec) {
		return null;
	}

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	if (!normalized) {
		return null;
	}

	const rootPackageName = extractRootPackageName(normalized);
	if (!rootPackageName || !isLikelyNativeScriptRuntimePluginSpecifier(rootPackageName, projectRoot)) {
		return null;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
	if (!subpath || packageName !== rootPackageName) {
		return null;
	}

	if (!subpath.includes('/')) {
		return null;
	}

	const reverseMap = getExportsReverseMap(packageName, projectRoot);
	const originalSpec = reverseMap.get(subpath);
	if (originalSpec && originalSpec !== packageName) {
		return null;
	}

	const packageMainInfo = getPackageMainFieldInfo(packageName, projectRoot);
	if (!packageMainInfo.hasExports && packageMainInfo.mainEntries.has(subpath)) {
		return packageName;
	}

	return normalized;
}

export function shouldPreserveBareRuntimePluginSubpathImport(spec: string, projectRoot: string): boolean {
	if (!spec) {
		return false;
	}

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned || /^(?:\.|\/|https?:\/\/)/i.test(cleaned)) {
		return false;
	}

	if (normalizeNodeModulesSpecifier(cleaned)) {
		return false;
	}

	const normalized = cleaned.replace(/^\/+/, '');
	const rootPackageName = extractRootPackageName(normalized);
	if (!rootPackageName || !isLikelyNativeScriptRuntimePluginSpecifier(rootPackageName, projectRoot)) {
		return false;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
	if (!subpath || packageName !== rootPackageName) {
		return false;
	}

	const lastSegment = subpath.split('/').pop() || '';
	if (hasExplicitRuntimePluginScriptExtension(lastSegment)) {
		return false;
	}

	if (!subpath.includes('/')) {
		const packageBaseName = packageName.split('/').pop() || '';
		const withoutPlatform = lastSegment.replace(/\.(ios|android|visionos)$/i, '');
		if (withoutPlatform === 'index' || withoutPlatform === packageBaseName || withoutPlatform.startsWith(`${packageBaseName}.`)) {
			return false;
		}
	}

	const reverseMap = getExportsReverseMap(packageName, projectRoot);
	const originalSpec = reverseMap.get(subpath);
	if (originalSpec && originalSpec !== packageName) {
		return false;
	}

	return true;
}

export function resolveVendorRouting(nodeModulesSpec: string, projectRoot: string): { route: 'vendor'; bareSpec: string } | { route: 'http' } | null {
	const rootPackageName = extractRootPackageName(nodeModulesSpec);
	const { packageName: pkgName, subpath } = resolveNodeModulesPackageBoundary(nodeModulesSpec, projectRoot);
	const pkgBaseName = pkgName.split('/').pop() || '';
	const isRootLevelMainEntry = (() => {
		if (!subpath || subpath.includes('/')) {
			return false;
		}
		const withoutExt = subpath.replace(/\.[^.]+$/, '');
		const withoutPlatform = withoutExt.replace(/\.(ios|android|visionos)$/i, '');
		return withoutPlatform === 'index' || withoutPlatform === pkgBaseName;
	})();

	if (rootPackageName && pkgName !== rootPackageName) {
		return { route: 'http' };
	}

	if (isLikelyNativeScriptRuntimePluginSpecifier(pkgName, projectRoot) && (!subpath || isRootLevelMainEntry)) {
		return { route: 'vendor', bareSpec: pkgName };
	}

	if (isLikelyNativeScriptRuntimePluginSpecifier(pkgName, projectRoot) && subpath.includes('/')) {
		const exactBareSpecifier = resolveInternalRuntimePluginBareSpecifier(nodeModulesSpec, projectRoot);
		if (exactBareSpecifier) {
			return { route: 'vendor', bareSpec: exactBareSpecifier };
		}
	}

	const manifest = getVendorManifest();
	if (!manifest?.modules?.[pkgName]) {
		return null;
	}

	if (/\.(ios|android|visionos)\.(js|ts|mjs|mts)$/i.test(nodeModulesSpec) && isLikelyNativeScriptRuntimePluginSpecifier(pkgName, projectRoot) && isRootLevelMainEntry) {
		return { route: 'vendor', bareSpec: pkgName };
	}

	if (/\.(ios|android|visionos)\.(js|ts|mjs|mts)$/.test(nodeModulesSpec)) {
		return { route: 'http' };
	}

	if (!subpath) {
		return { route: 'vendor', bareSpec: pkgName };
	}

	const reverseMap = getExportsReverseMap(pkgName, projectRoot);
	const originalSpec = reverseMap.get(subpath);
	if (originalSpec && originalSpec !== pkgName) {
		return { route: 'http' };
	}

	if (subpath) {
		const packageMainInfo = getPackageMainFieldInfo(pkgName, projectRoot);
		if (!packageMainInfo.hasExports && packageMainInfo.mainEntries.has(subpath)) {
			return { route: 'vendor', bareSpec: pkgName };
		}
	}

	if (!subpath.includes('/')) {
		const lastSegment = subpath.replace(/\.[^.]+$/, '');
		if (lastSegment === 'index' || lastSegment === pkgBaseName || lastSegment.startsWith(pkgBaseName + '.')) {
			return { route: 'vendor', bareSpec: pkgName };
		}
	}

	return { route: 'http' };
}
