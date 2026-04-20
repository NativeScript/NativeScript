import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import * as PAT from './constants.js';
import type { VendorManifest } from '../shared/vendor/manifest.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getProjectRootPath } from '../../helpers/project.js';
import { extractRootPackageName, getPackageRuntimeInfo } from '../shared/package-classifier.js';

const ESM_FRAMEWORK_PACKAGE_ROOTS = new Set(['@nativescript/angular', 'nativescript-angular']);

const BUILD_TIME_ONLY_PACKAGE_ROOTS = new Set(['@nativescript/vite', '@nativescript/webpack', '@nativescript/android', '@nativescript/ios', '@nativescript/visionos', 'vite', 'webpack', 'esbuild', 'typescript', 'ts-node', 'prettier']);

const BUILD_TIME_ONLY_PACKAGE_PREFIXES = ['@vitejs/', '@rollup/', '@babel/', '@angular-devkit/', '@angular/build', '@analogjs/', 'vite-plugin-'];

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

export function resolveCandidateFilePath(candidate: string, projectRoot: string): string | null {
	const cleaned = candidate.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned) return null;

	const root = path.resolve(projectRoot);
	let absPath: string | null = null;

	if (cleaned.startsWith('/@fs/')) {
		absPath = cleaned.slice('/@fs'.length);
	} else if (cleaned.includes('/node_modules/')) {
		absPath = path.resolve(root, `.${cleaned}`);
	} else if (/^(?:[A-Za-z]:)?\//.test(cleaned)) {
		absPath = path.resolve(cleaned);
	}

	if (!absPath) {
		return null;
	}

	const rel = path.relative(root, absPath);
	if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
		return null;
	}

	return existsSync(absPath) ? absPath : null;
}

export function filterExistingNodeModulesTransformCandidates(spec: string, candidates: string[], projectRoot: string): string[] {
	const cleanedSpec = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleanedSpec.includes('/node_modules/')) {
		return candidates;
	}

	return candidates.filter((candidate) => !!resolveCandidateFilePath(candidate, projectRoot));
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
	if (/\.[a-z0-9]+$/i.test(lastSegment)) {
		return false;
	}

	if (!subpath.includes('/')) {
		const packageBaseName = packageName.split('/').pop() || '';
		if (lastSegment === 'index' || lastSegment === packageBaseName || lastSegment.startsWith(`${packageBaseName}.`)) {
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
