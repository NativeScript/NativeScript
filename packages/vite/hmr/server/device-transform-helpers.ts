// Pure helpers for the device code-transform subsystem: import-path
// normalization, node_modules/vendor specifier resolution, dependency
// collection support, and provenance preludes. Shared by
// process-code-for-device.ts and rewrite-imports.ts.
import * as path from 'path';
import * as PAT from './constants.js';
import { getProjectRootPath } from '../../helpers/project.js';
import { isLikelyNativeScriptRuntimePluginSpecifier, isNativeScriptCoreModule, isNativeScriptPluginModule, normalizeNativeScriptCoreSpecifier, normalizeNodeModulesSpecifier, resolveNodeModulesPackageBoundary, resolveVendorFromCandidate, viteDepsPathToBareSpecifier } from './websocket-module-specifiers.js';
import { collectTopLevelImportRecords } from './websocket-served-module-helpers.js';

// Bare specifiers and special skip patterns (virtual, data:, etc.)
const VENDOR_PACKAGES = /^[A-Za-z@][^:\/\s]*$/;
const SKIP_PATTERNS = /^(?:data:|blob:|node:|virtual:|vite:|\0|\/@@?id|\/__vite|__vite|__x00__)/;

function rewriteVitePrebundleImportsForDevice(code: string, preserveVendorImports: boolean): string {
	const imports = collectTopLevelImportRecords(code);
	if (!imports.length) {
		return code;
	}

	const edits: Array<{ start: number; end: number; text: string }> = [];
	for (const imp of imports) {
		const source = imp.source;
		const depMatch = source.match(/(?:^|\/)node_modules\/\.vite\/deps\/(.+)$/);
		const depPath = depMatch?.[1] || (source.startsWith('.vite/deps/') ? source.slice('.vite/deps/'.length) : null);
		if (!depPath) {
			continue;
		}

		let replacement = '';
		if (preserveVendorImports) {
			const canonical = resolveVendorFromCandidate(`.vite/deps/${depPath}`);
			const bareSpecifier = canonical || viteDepsPathToBareSpecifier(depPath);
			if (bareSpecifier) {
				replacement = imp.text.replace(source, bareSpecifier);
			}
		}

		edits.push({
			start: imp.start,
			end: imp.end,
			text: replacement,
		});
	}

	if (!edits.length) {
		return code;
	}

	let next = code;
	for (const edit of edits.sort((left, right) => right.start - left.start)) {
		next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
	}

	return next;
}

function buildNodeModuleProvenancePrelude(sourceId?: string): string {
	if (!sourceId) {
		return '';
	}

	const cleaned = sourceId.replace(PAT.QUERY_PATTERN, '');
	let normalized = normalizeNodeModulesSpecifier(cleaned);
	if (!normalized) {
		const viteDepsMatch = cleaned.match(/(?:^|\/)node_modules\/\.vite\/deps\/([^?#]+)/);
		if (viteDepsMatch?.[1]) {
			normalized = `.vite/deps/${viteDepsMatch[1]}`;
		}
	}

	if (!normalized) {
		return '';
	}

	let packageSpecifier = normalized;
	let via = 'node_modules';
	if (normalized.startsWith('.vite/deps/')) {
		via = 'vite-deps';
		packageSpecifier = viteDepsPathToBareSpecifier(normalized.slice('.vite/deps/'.length)) || normalized;
	}

	const rootPackage = resolveNodeModulesPackageBoundary(packageSpecifier, getProjectRootPath()).packageName;
	if (!rootPackage) {
		return '';
	}

	return `try { const __nsRecord = globalThis.__NS_RECORD_MODULE_PROVENANCE__; if (typeof __nsRecord === 'function') { __nsRecord(${JSON.stringify(rootPackage)}, ${JSON.stringify({ kind: 'http-esm', specifier: packageSpecifier, url: sourceId, via })}); } } catch {}\n`;
}

function shouldRemapImport(spec: string): boolean {
	if (!spec || typeof spec !== 'string') return false;
	if (VENDOR_PACKAGES.test(spec)) return false;
	if (isNativeScriptCoreModule(spec)) return false;
	if (isNativeScriptPluginModule(spec)) return false;
	if (resolveVendorFromCandidate(spec)) return false;
	if (spec.startsWith('~/')) return false;
	if (SKIP_PATTERNS.test(spec)) return false;
	if (!spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../')) {
		return false;
	}
	return true;
}

function removeNamedImports(code: string, names: string[]): string {
	const regex = /^(\s*import\s*\{)([^}]*)(\}\s*from\s*['"][^'"]+['"];?)/gm;
	return code.replace(regex, (_m, p1, specList, p3) => {
		const srcMatch = /from\s*['"]\s*([^'"\s]+)\s*['"]/i.exec(_m);
		const src = (srcMatch?.[1] || '').toLowerCase();
		const isVueSource = /^(?:vue|nativescript-vue)(?:\b|\/)/i.test(src);
		if (!isVueSource) {
			return _m;
		}
		const remaining = specList
			.split(',')
			.map((s: string) => s.trim())
			.filter(Boolean)
			.filter((entry: string) => {
				const base = entry.split(/\s+as\s+/i)[0].trim();
				return !names.includes(base);
			});

		if (!remaining.length) return '';
		return `${p1} ${remaining.join(', ')} ${p3}`;
	});
}

function normalizeImportPath(spec: string, importerDir: string): string | null {
	if (!spec) return null;

	let key: string;
	if (spec.startsWith('/')) {
		key = spec;
	} else if (spec.startsWith('./') || spec.startsWith('../')) {
		key = path.posix.normalize(path.posix.join(importerDir, spec));
		if (!key.startsWith('/')) {
			key = `/${key}`;
		}
	} else {
		key = spec;
	}

	return key.replace(PAT.QUERY_PATTERN, '');
}

function findDependencyFileName(depFileMap: Map<string, string>, key: string): string | undefined {
	const variants = new Set<string>();
	const base = key.replace(PAT.QUERY_PATTERN, '');
	variants.add(base);

	const normalized = path.posix.normalize(base);
	variants.add(normalized);

	const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
	variants.add(withSlash);

	for (const variant of Array.from(variants)) {
		if (variant.endsWith('.js')) {
			variants.add(variant.replace(/\.js$/i, '.mjs'));
		} else if (variant.endsWith('.mjs')) {
			variants.add(variant.replace(/\.mjs$/i, '.js'));
		}
	}

	for (const variant of variants) {
		const value = depFileMap.get(variant);
		if (value) {
			return value;
		}
	}

	return undefined;
}

function isRuntimePluginRootEntrySpecifier(specifier: string, projectRoot: string): boolean {
	if (!specifier) {
		return false;
	}

	const cleaned = specifier.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	if (!normalized) {
		return false;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
	if (!packageName || !isLikelyNativeScriptRuntimePluginSpecifier(packageName, projectRoot)) {
		return false;
	}

	if (!subpath) {
		return true;
	}

	if (subpath.includes('/')) {
		return false;
	}

	const pkgBaseName = packageName.split('/').pop() || '';
	const withoutExt = /(?:\.(?:ios|android|visionos))?\.(?:ts|tsx|js|jsx|mjs|mts|cts)$/i.test(subpath) ? subpath.replace(/\.[^.]+$/, '') : subpath;
	const withoutPlatform = withoutExt.replace(/\.(ios|android|visionos)$/i, '');
	return withoutPlatform === 'index' || withoutPlatform === pkgBaseName;
}

function collectMixedRuntimePluginHttpRootPackages(code: string, projectRoot: string): Set<string> {
	const nonRootSubpathPackages = new Set<string>();
	const rootEntryPackages = new Set<string>();

	const visitSpecifier = (rawSpecifier: string | null | undefined) => {
		if (!rawSpecifier) {
			return;
		}

		const specifier = normalizeNativeScriptCoreSpecifier(rawSpecifier).replace(PAT.QUERY_PATTERN, '');
		if (!specifier) {
			return;
		}

		if (/^https?:\/\//.test(specifier) || specifier.startsWith('/ns/')) {
			return;
		}

		if (/^(?:\.|\/)/.test(specifier) && !specifier.includes('/node_modules/')) {
			return;
		}

		const normalized = normalizeNodeModulesSpecifier(specifier) || specifier.replace(/^\/+/, '');
		if (!normalized) {
			return;
		}

		const { packageName } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
		if (!packageName || !isLikelyNativeScriptRuntimePluginSpecifier(packageName, projectRoot)) {
			return;
		}

		if (isRuntimePluginRootEntrySpecifier(normalized, projectRoot)) {
			rootEntryPackages.add(packageName);
			return;
		}

		nonRootSubpathPackages.add(packageName);
	};

	for (const pattern of [PAT.IMPORT_PATTERN_1, PAT.IMPORT_PATTERN_2, PAT.IMPORT_PATTERN_3, PAT.IMPORT_PATTERN_SIDE_EFFECT]) {
		pattern.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(code)) !== null) {
			visitSpecifier(match[2]);
		}
	}

	return new Set(Array.from(nonRootSubpathPackages).filter((packageName) => rootEntryPackages.has(packageName)));
}
// Application import helpers

/**
 * Check if a path is an application module (not node_modules, not vendor, not relative)
 * This is generic and works for ANY project structure.
 *
 * Examples of application imports: /core/v4/store.ts, /src/utils/helper.ts, /custom/module.ts
 * Examples of NON-application imports: node_modules/..., ~/vendor.mjs, ./relative.ts, ../parent.ts
 */
function isApplicationImport(importPath: string): boolean {
	if (!importPath.startsWith('/')) {
		return false; // Relative paths (./..., ../...) are not application imports
	}

	// Exclude node_modules and special paths
	if (importPath.includes('node_modules') || importPath.startsWith('/@') || importPath.startsWith('~/')) {
		return false;
	}

	return true;
}

function stripToProjectRelative(importPath: string, projectRoot?: string): string {
	if (!importPath) {
		return '';
	}

	let normalized = importPath.replace(/\\/g, '/');
	normalized = normalized.replace(/^\/?@fs\//, '/');
	if (normalized.startsWith('file://')) {
		normalized = normalized.replace(/^file:\/\//, '/');
	}

	const documentsMarker = '/Documents/';
	const documentsIndex = normalized.indexOf(documentsMarker);
	if (documentsIndex !== -1) {
		return normalized.substring(documentsIndex + documentsMarker.length);
	}

	if (projectRoot) {
		const normalizedRoot = projectRoot.replace(/\\/g, '/').replace(/\/+$/, '');
		const rootIndex = normalized.indexOf(normalizedRoot);
		if (rootIndex !== -1) {
			const sliced = normalized.substring(rootIndex + normalizedRoot.length);
			return sliced.replace(/^\/+/, '');
		}
	}

	return normalized.replace(/^\/+/, '');
}

/**
 * Convert absolute application import to relative .mjs path for Documents folder
 * /core/v4/store.ts → ./core/v4/store.mjs
 */
function getProjectRelativeImportPath(importPath: string, projectRoot?: string): string | null {
	if (!importPath) {
		return null;
	}

	let normalized = importPath.replace(PAT.QUERY_PATTERN, '');
	normalized = normalized.replace(/\\/g, '/');
	if (normalized.startsWith('file://')) {
		normalized = normalized.replace(/^file:\/\//, '/');
	}

	const documentsMarker = '/Documents/';
	const documentsIndex = normalized.indexOf(documentsMarker);
	if (documentsIndex !== -1) {
		normalized = normalized.substring(documentsIndex + documentsMarker.length);
	} else if (projectRoot) {
		const normalizedRoot = projectRoot.replace(/\\/g, '/').replace(/\/+$/, '');
		const rootIndex = normalized.indexOf(normalizedRoot);
		if (rootIndex !== -1) {
			normalized = normalized.substring(rootIndex + normalizedRoot.length);
		}
	}

	normalized = normalized.replace(/^\/+/, '');
	if (!normalized) {
		return null;
	}
	if (normalized.startsWith('dep-')) {
		return null;
	}
	if (normalized.startsWith('sfc-')) {
		return null;
	}

	normalized = path.posix.normalize(normalized);
	if (!normalized) {
		return null;
	}

	normalized = normalized.replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	if (!normalized.endsWith('.mjs')) {
		normalized = `${normalized}.mjs`;
	}

	return normalized.replace(/^\/+/, '');
}

function toAppModuleBaseId(importPath: string, projectRoot?: string): string | null {
	const projectRelative = getProjectRelativeImportPath(importPath, projectRoot);
	if (!projectRelative) {
		return null;
	}
	const base = projectRelative.replace(/\.mjs$/i, '');
	return `/${base}`;
}

function toNodeModulesHttpModuleId(importPath: string): string | null {
	const nodeModulesSpecifier = normalizeNodeModulesSpecifier(importPath);
	if (!nodeModulesSpecifier) {
		return null;
	}
	return `/ns/m/node_modules/${nodeModulesSpecifier}`;
}

export { rewriteVitePrebundleImportsForDevice, buildNodeModuleProvenancePrelude, shouldRemapImport, removeNamedImports, normalizeImportPath, findDependencyFileName, collectMixedRuntimePluginHttpRootPackages, isApplicationImport, stripToProjectRelative, getProjectRelativeImportPath, toAppModuleBaseId, toNodeModulesHttpModuleId };
