import { parse as babelParse } from '@babel/parser';
import { existsSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

import * as PAT from './constants.js';
import { astExtractImportsAndStripTypes } from '../helpers/ast-extract.js';
import { getProjectRootPath } from '../../helpers/project.js';
import { extractRootPackageName } from '../shared/package-classifier.js';
import { isEsmFrameworkPackageSpecifier, isLikelyNativeScriptPluginSpecifier, isLikelyNativeScriptRuntimePluginSpecifier, normalizeNodeModulesSpecifier, resolveInternalRuntimePluginBareSpecifier, resolveNodeModulesPackageBoundary, resolveVendorFromCandidate, shouldPreserveBareRuntimePluginSubpathImport } from './websocket-module-specifiers.js';

export interface EnsureNativeScriptModuleBindingsOptions {
	preserveNonPluginVendorImports?: boolean;
	resolvedSpecifierOverrides?: Map<string, string>;
}

interface NativeScriptImportBinding {
	default: Set<string>;
	namespace: Set<string>;
	named: Array<{ imported: string; local: string }>;
	sideEffectOnly: boolean;
}

interface SourceImportIntentCacheEntry {
	mtimeMs: number;
	size: number;
	resolvedSpecifierOverrides: Map<string, string>;
}

interface TopLevelImportRecord {
	start: number;
	end: number;
	text: string;
	source: string;
	clause: string | null;
	isTypeOnly: boolean;
}

const sourceImportIntentCache = new Map<string, SourceImportIntentCacheEntry>();
const EXPLICIT_RUNTIME_PLUGIN_SCRIPT_EXT_RE = /(?:\.(?:ios|android|visionos))?\.(?:ts|tsx|js|jsx|mjs|mts|cts)$/i;
const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'decorators-legacy', 'classProperties', 'classPrivateProperties', 'classPrivateMethods'] as const;

function hasExplicitRuntimePluginScriptExtension(segment: string): boolean {
	return EXPLICIT_RUNTIME_PLUGIN_SCRIPT_EXT_RE.test(segment);
}

function collectTopLevelImportRecords(code: string): TopLevelImportRecord[] {
	try {
		const ast = babelParse(code, {
			sourceType: 'module',
			plugins: [...MODULE_IMPORT_ANALYSIS_PLUGINS],
		}) as any;
		const body = ast?.program?.body;
		if (!Array.isArray(body)) {
			return [];
		}

		return body
			.filter((node: any) => node?.type === 'ImportDeclaration' && typeof node.start === 'number' && typeof node.end === 'number' && typeof node.source?.value === 'string')
			.map((node: any) => {
				const text = code.slice(node.start as number, node.end as number);
				const clause = Array.isArray(node.specifiers) && node.specifiers.length > 0 ? text.match(/^\s*import\s+([\s\S]*?)\s+from\s+["'][^"']+["'];?\s*$/)?.[1]?.trim() || null : null;
				return {
					start: node.start as number,
					end: node.end as number,
					text,
					source: node.source.value as string,
					clause,
					isTypeOnly: node.importKind === 'type',
				};
			});
	} catch {
		return [];
	}
}

function stripTopLevelImportRecords(code: string, records: TopLevelImportRecord[]): string {
	let stripped = code;
	for (const record of [...records].sort((left, right) => right.start - left.start)) {
		stripped = stripped.slice(0, record.start) + stripped.slice(record.end);
	}
	return stripped;
}

export function ensureNativeScriptModuleBindings(code: string, options?: EnsureNativeScriptModuleBindingsOptions): string {
	const importRecords = collectTopLevelImportRecords(code);
	if (!importRecords.length) {
		return code;
	}

	const preservedImports: string[] = [];
	const modules = new Map<string, NativeScriptImportBinding>();

	const getModuleBinding = (canonical: string) => {
		let entry = modules.get(canonical);
		if (!entry) {
			entry = {
				default: new Set<string>(),
				namespace: new Set<string>(),
				named: [],
				sideEffectOnly: false,
			};
			modules.set(canonical, entry);
		}
		return entry;
	};

	const parseNamedImports = (clause: string, binding: NativeScriptImportBinding) => {
		const inner = clause.replace(/^\{/, '').replace(/\}$/, '');
		inner
			.split(',')
			.map((segment) => segment.trim())
			.filter(Boolean)
			.forEach((segment) => {
				const [imported, local] = segment.split(/\s+as\s+/i).map((s) => s.trim());
				const resolvedImported = imported;
				const resolvedLocal = local || imported;
				if (resolvedImported) {
					binding.named.push({
						imported: resolvedImported,
						local: resolvedLocal,
					});
				}
			});
	};

	for (const record of importRecords) {
		const original = record.text.trim();
		if (!original) {
			continue;
		}
		if (record.isTypeOnly) {
			preservedImports.push(original);
			continue;
		}

		const rawSpec = record.source;
		const specifier = rawSpec.replace(PAT.QUERY_PATTERN, '');
		const preservedSpecifier = getPreservedImportSpecifier(specifier, options);

		if (!record.clause) {
			if (preservedSpecifier) {
				preservedImports.push(rewritePreservedImportSpecifier(original, rawSpec, preservedSpecifier));
				continue;
			}
			if (isEsmFrameworkPackageSpecifier(specifier)) {
				preservedImports.push(original);
				continue;
			}
			const runtimePluginBareSpecifier = resolveInternalRuntimePluginBareSpecifier(specifier, getProjectRootPath());
			let canonical = runtimePluginBareSpecifier || resolveVendorFromCandidate(specifier);
			const runtimePluginSpecifier = isLikelyNativeScriptRuntimePluginSpecifier(canonical || specifier, getProjectRootPath());
			if (options?.preserveNonPluginVendorImports && !runtimePluginSpecifier) {
				preservedImports.push(original);
				continue;
			}
			if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier, getProjectRootPath())) {
				canonical = specifier;
			}
			if (canonical && /^@nativescript\/core(\b|\/)/i.test(canonical)) {
				preservedImports.push(original);
				continue;
			}
			if (!canonical) {
				preservedImports.push(original);
				continue;
			}
			const binding = getModuleBinding(canonical);
			binding.sideEffectOnly = true;
			continue;
		}

		if (preservedSpecifier) {
			preservedImports.push(rewritePreservedImportSpecifier(original, rawSpec, preservedSpecifier));
			continue;
		}
		if (isEsmFrameworkPackageSpecifier(specifier)) {
			preservedImports.push(original);
			continue;
		}
		const runtimePluginBareSpecifier = resolveInternalRuntimePluginBareSpecifier(specifier, getProjectRootPath());
		let canonical = runtimePluginBareSpecifier || resolveVendorFromCandidate(specifier);
		const runtimePluginSpecifier = isLikelyNativeScriptRuntimePluginSpecifier(canonical || specifier, getProjectRootPath());
		if (options?.preserveNonPluginVendorImports && !runtimePluginSpecifier) {
			preservedImports.push(original);
			continue;
		}
		if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier, getProjectRootPath())) {
			canonical = specifier;
		}
		if (canonical && /^@nativescript\/core(\b|\/)/i.test(canonical)) {
			preservedImports.push(original);
			continue;
		}
		if (!canonical) {
			preservedImports.push(original);
			continue;
		}

		const binding = getModuleBinding(canonical);
		const trimmed = record.clause.trim();
		if (!trimmed) {
			binding.sideEffectOnly = true;
			continue;
		}
		if (trimmed.startsWith('*')) {
			const m = trimmed.match(/\*\s+as\s+(\w+)/i);
			if (m?.[1]) binding.namespace.add(m[1]);
			continue;
		}
		if (trimmed.startsWith('{')) {
			parseNamedImports(trimmed, binding);
			continue;
		}
		if (trimmed.includes(',') && trimmed.includes('{')) {
			const [defaultPart, namedPart] = trimmed.split(/,(.+)/, 2);
			const def = defaultPart.trim();
			if (def) binding.default.add(def);
			if (namedPart) parseNamedImports(namedPart.trim(), binding);
			continue;
		}
		binding.default.add(trimmed);
	}

	code = stripTopLevelImportRecords(code, importRecords);

	if (!modules.size) {
		if (preservedImports.length) {
			const preserved = preservedImports.join('\n') + '\n';
			return preserved + code;
		}
		return code;
	}

	let injection = 'var __nsVendorRegistry = (globalThis.__nsVendorRegistry ||= new Map());\n';
	injection += "var __NS_VENDOR_SOFT__ = (typeof globalThis.__NS_VENDOR_SOFT__ !== 'undefined' ? !!globalThis.__NS_VENDOR_SOFT__ : true);\n";
	injection += "var __nsVendorRequire = (typeof globalThis.__nsRequire === 'function' ? globalThis.__nsRequire : (typeof globalThis.require === 'function' ? globalThis.require : (spec => { throw new Error('__nsVendorRequire unavailable'); })));\n";
	injection += "try { (globalThis.__NS_VENDOR_ONCE__ ||= { loggedRequireMissing: false }); if (!globalThis.__NS_VENDOR_ONCE__.loggedRequireMissing && typeof __nsVendorRequire !== 'function') { console.warn('[ns-hmr][vendor][require-missing] using soft stubs=', __NS_VENDOR_SOFT__); globalThis.__NS_VENDOR_ONCE__.loggedRequireMissing = true; } } catch {}\n";
	injection += "var __nsMissing = function(name){ try { var fn = function(){ try { console.warn('[ns-hmr][vendor][stub]', name); } catch {} }; return new Proxy(fn, { get: (_t, p) => __nsMissing(name + '.' + String(p)) }); } catch { return {}; } };\n";
	injection += "var __nsHasInstall = function(x){ try { return (typeof x === 'function') || (typeof x === 'object' && x && typeof x.install === 'function'); } catch { return false; } };\n";
	injection += "var __nsDefault = function(mod){ try { return (mod && mod['default'] !== undefined) ? mod['default'] : mod; } catch { return mod; } };\n";
	injection += "var __nsNestedDefault = function(mod){ try { return (mod && mod.default && (typeof mod.default.default === 'function' || (typeof mod.default.default === 'object' && mod.default.default && typeof mod.default.default.install === 'function'))) ? mod.default.default : undefined; } catch { return undefined; } };\n";
	injection += "var __nsPick = function(mod, name){ try { if (mod && mod['default'] && mod['default'][name] !== undefined) return mod['default'][name]; } catch {} try { if (mod && mod[name] !== undefined) return mod[name]; } catch {} try { if (mod && typeof mod['default'] === 'function' && mod['default'].name === name) return mod['default']; } catch {} return undefined; };\n";

	let index = 0;
	for (const [canonical, binding] of modules) {
		const cacheKey = JSON.stringify(canonical);
		const moduleVar = `__nsVendorModule_${index++}`;
		injection += `var ${moduleVar} = __nsVendorRegistry.has(${cacheKey}) ? __nsVendorRegistry.get(${cacheKey}) : (() => { try { var mod = __nsVendorRequire(${cacheKey}); __nsVendorRegistry.set(${cacheKey}, mod); return mod; } catch (e) { try { console.error('[ns-hmr][vendor][require-failed]', ${cacheKey}, (e && (e.message||e)) ); } catch {} try { if (__NS_VENDOR_SOFT__) { var stub = __nsMissing(${cacheKey}); __nsVendorRegistry.set(${cacheKey}, stub); return stub; } } catch {} throw e; } })();\n`;

		binding.namespace.forEach((alias) => {
			injection += `var ${alias} = ${moduleVar};\n`;
			injection += `(${alias} && typeof ${alias} === 'object' && !('default' in ${alias})) && (${alias}.default = ${alias});\n`;
		});

		if (binding.named.length) {
			for (const { imported, local } of binding.named) {
				injection += `var ${local} = __nsPick(${moduleVar}, ${JSON.stringify(imported)});\n`;
			}
		}

		if (binding.default.size) {
			const defVar = `${moduleVar}__def`;
			injection += `var ${defVar} = __nsDefault(${moduleVar});\n`;
			binding.default.forEach((localName) => {
				injection += `var ${localName} = (__nsHasInstall(${defVar})
          ? ${defVar}
          : (__nsHasInstall(${moduleVar})
            ? ${moduleVar}
            : (function(){ const _n = __nsNestedDefault(${moduleVar}); return _n !== undefined ? _n : ${defVar}; })()));\n`;
			});
		}

		if (binding.sideEffectOnly && !binding.namespace.size && !binding.named.length && !binding.default.size) {
			injection += `void ${moduleVar};\n`;
		}
	}

	injection += '\n';
	const preserved = preservedImports.length ? preservedImports.join('\n') + '\n' : '';
	return preserved + injection + code;
}

function normalizeExtensionlessRuntimePluginSourceSpecifier(spec: string, projectRoot: string): string | null {
	if (!spec) {
		return null;
	}

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned || /^(?:\.|\/|https?:\/\/)/i.test(cleaned)) {
		return null;
	}

	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const rootPackageName = extractRootPackageName(normalized);
	if (!rootPackageName || !isLikelyNativeScriptRuntimePluginSpecifier(rootPackageName, projectRoot)) {
		return null;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
	if (!subpath || packageName !== rootPackageName) {
		return null;
	}

	const lastSegment = subpath.split('/').pop() || '';
	if (hasExplicitRuntimePluginScriptExtension(lastSegment)) {
		return null;
	}

	return normalized;
}

function normalizeRuntimePluginSourceSpecifier(spec: string, sourceFilePath: string, projectRoot: string): string | null {
	if (!spec) {
		return null;
	}

	const relativeSpecifier = normalizeRelativeRuntimePluginSourceSpecifier(spec, sourceFilePath, projectRoot);
	if (relativeSpecifier) {
		return relativeSpecifier;
	}

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned || /^(?:https?:\/\/)/i.test(cleaned)) {
		return null;
	}

	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const rootPackageName = extractRootPackageName(normalized);
	if (!rootPackageName || !isLikelyNativeScriptRuntimePluginSpecifier(rootPackageName, projectRoot)) {
		return null;
	}

	return normalized;
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

	const packageBaseName = packageName.split('/').pop() || '';
	const withoutExt = hasExplicitRuntimePluginScriptExtension(subpath) ? subpath.replace(/\.[^.]+$/, '') : subpath;
	const withoutPlatform = withoutExt.replace(/\.(ios|android|visionos)$/i, '');
	return withoutPlatform === 'index' || withoutPlatform === packageBaseName;
}

function collectMixedRuntimePluginRootPackages(source: string, projectRoot: string, sourceFilePath: string): Set<string> {
	const rootEntryPackages = new Set<string>();
	const nonRootSubpathPackages = new Set<string>();
	const extracted = astExtractImportsAndStripTypes(source);

	for (const importCode of extracted.imports) {
		const sourceSpecifier = importCode.match(/from\s+["']([^"']+)["']/)?.[1] || importCode.match(/^\s*import\s+["']([^"']+)["']/)?.[1] || null;
		const normalizedSpecifier = sourceSpecifier ? normalizeRuntimePluginSourceSpecifier(sourceSpecifier, sourceFilePath, projectRoot) : null;
		if (!normalizedSpecifier) {
			continue;
		}

		const { packageName } = resolveNodeModulesPackageBoundary(normalizedSpecifier, projectRoot);
		if (!packageName) {
			continue;
		}

		if (isRuntimePluginRootEntrySpecifier(normalizedSpecifier, projectRoot)) {
			rootEntryPackages.add(packageName);
			continue;
		}

		nonRootSubpathPackages.add(packageName);
	}

	return new Set(Array.from(rootEntryPackages).filter((packageName) => nonRootSubpathPackages.has(packageName)));
}

function normalizeRelativeRuntimePluginSourceSpecifier(spec: string, sourceFilePath: string, projectRoot: string): string | null {
	if (!spec || !sourceFilePath) {
		return null;
	}

	const cleaned = spec.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned || !/^\.\.?\//.test(cleaned)) {
		return null;
	}

	const lastSegment = cleaned.split('/').pop() || '';
	if (hasExplicitRuntimePluginScriptExtension(lastSegment)) {
		return null;
	}

	const sourceNodeModulesSpecifier = normalizeNodeModulesSpecifier(sourceFilePath);
	if (!sourceNodeModulesSpecifier) {
		return null;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(sourceNodeModulesSpecifier, projectRoot);
	if (!packageName || !subpath || !isLikelyNativeScriptRuntimePluginSpecifier(packageName, projectRoot)) {
		return null;
	}

	const sourceDir = path.posix.dirname(subpath);
	const resolvedSubpath = path.posix.normalize(path.posix.join(sourceDir === '.' ? '' : sourceDir, cleaned)).replace(/^\/+/, '');
	if (!resolvedSubpath || resolvedSubpath.startsWith('../') || resolvedSubpath === '.') {
		return null;
	}

	const normalized = `${packageName}/${resolvedSubpath}`;
	return shouldPreserveBareRuntimePluginSubpathImport(normalized, projectRoot) ? normalized : null;
}

function getResolvedSpecifierCandidateKeys(sourceSpecifier: string): string[] {
	const normalized = sourceSpecifier.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '');
	if (!normalized) {
		return [];
	}

	const suffixes = ['', '.js', '.ts', '.mjs', '.cjs', '.ios.js', '.android.js', '.visionos.js', '/index.js', '/index.ts', '/index.mjs', '/index.ios.js', '/index.android.js', '/index.visionos.js'];
	return Array.from(new Set(suffixes.map((suffix) => (suffix ? `${normalized}${suffix}` : normalized))));
}

function buildResolvedRuntimePluginSpecifierOverrides(source: string, projectRoot: string, sourceFilePath: string): Map<string, string> {
	const overrides = new Map<string, string>();
	const extracted = astExtractImportsAndStripTypes(source);
	const mixedRuntimePluginRootPackages = collectMixedRuntimePluginRootPackages(source, projectRoot, sourceFilePath);

	for (const importCode of extracted.imports) {
		const sourceSpecifier = importCode.match(/from\s+["']([^"']+)["']/)?.[1] || importCode.match(/^\s*import\s+["']([^"']+)["']/)?.[1] || null;
		const normalizedSpecifier = sourceSpecifier ? normalizeRuntimePluginSourceSpecifier(sourceSpecifier, sourceFilePath, projectRoot) : null;
		if (normalizedSpecifier) {
			const { packageName } = resolveNodeModulesPackageBoundary(normalizedSpecifier, projectRoot);
			if (packageName && mixedRuntimePluginRootPackages.has(packageName) && isRuntimePluginRootEntrySpecifier(normalizedSpecifier, projectRoot)) {
				for (const candidateKey of getResolvedSpecifierCandidateKeys(normalizedSpecifier)) {
					overrides.set(candidateKey, candidateKey);
				}
			}
		}

		const preservedSpecifier = sourceSpecifier ? normalizeExtensionlessRuntimePluginSourceSpecifier(sourceSpecifier, projectRoot) || normalizeRelativeRuntimePluginSourceSpecifier(sourceSpecifier, sourceFilePath, projectRoot) : null;
		if (!preservedSpecifier) {
			continue;
		}

		for (const candidateKey of getResolvedSpecifierCandidateKeys(preservedSpecifier)) {
			overrides.set(candidateKey, preservedSpecifier);
		}
	}

	return overrides;
}

function resolveProcessCodeSourceFilePath(sourceId: string, projectRoot: string): string | null {
	const cleaned = sourceId.replace(PAT.QUERY_PATTERN, '');
	if (!cleaned) {
		return null;
	}

	const expandCandidateVariants = (candidate: string): string[] => {
		if (!candidate) {
			return [];
		}

		const normalizedCandidate = candidate.replace(/\\/g, '/');
		const lastSegment = normalizedCandidate.split('/').pop() || '';
		const hasExplicitExtension = /(?:\.(?:ios|android|visionos))?\.(?:ts|tsx|js|jsx|mjs|mts|cts)$/i.test(lastSegment);
		if (hasExplicitExtension) {
			return [candidate];
		}

		const suffixes = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cts', '.ios.ts', '.ios.js', '.android.ts', '.android.js', '.visionos.ts', '.visionos.js', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.mjs', '/index.mts', '/index.cts', '/index.ios.ts', '/index.ios.js', '/index.android.ts', '/index.android.js', '/index.visionos.ts', '/index.visionos.js'];

		return Array.from(new Set(suffixes.map((suffix) => `${candidate}${suffix}`)));
	};

	const candidates: string[] = [];
	if (cleaned.startsWith('/@fs/')) {
		candidates.push(...expandCandidateVariants(cleaned.slice('/@fs'.length)));
	}
	if (/^(?:[A-Za-z]:)?\//.test(cleaned)) {
		candidates.push(...expandCandidateVariants(cleaned));
		candidates.push(...expandCandidateVariants(path.resolve(projectRoot, `.${cleaned}`)));
	} else {
		candidates.push(...expandCandidateVariants(path.resolve(projectRoot, cleaned.replace(/^\.\//, ''))));
	}

	for (const candidate of Array.from(new Set(candidates))) {
		try {
			if (candidate && existsSync(candidate) && statSync(candidate).isFile()) {
				return candidate;
			}
		} catch {}
	}

	return null;
}

export function getProcessCodeResolvedSpecifierOverrides(sourceId: string | undefined, projectRoot: string): Map<string, string> | undefined {
	if (!sourceId) {
		return undefined;
	}

	const sourceFilePath = resolveProcessCodeSourceFilePath(sourceId, projectRoot);
	if (!sourceFilePath) {
		return undefined;
	}

	try {
		const stats = statSync(sourceFilePath);
		const cached = sourceImportIntentCache.get(sourceFilePath);
		if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
			return cached.resolvedSpecifierOverrides;
		}

		const source = readFileSync(sourceFilePath, 'utf8');
		const resolvedSpecifierOverrides = buildResolvedRuntimePluginSpecifierOverrides(source, projectRoot, sourceFilePath);
		sourceImportIntentCache.set(sourceFilePath, {
			mtimeMs: stats.mtimeMs,
			size: stats.size,
			resolvedSpecifierOverrides,
		});
		return resolvedSpecifierOverrides;
	} catch {
		return undefined;
	}
}

function getPreservedImportSpecifier(specifier: string, options?: EnsureNativeScriptModuleBindingsOptions): string | null {
	if (!specifier) {
		return null;
	}

	const cleaned = specifier.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	const overrideSpecifier = options?.resolvedSpecifierOverrides?.get(cleaned) || options?.resolvedSpecifierOverrides?.get(normalized);
	if (overrideSpecifier) {
		return overrideSpecifier;
	}

	if (shouldPreserveBareRuntimePluginSubpathImport(cleaned, getProjectRootPath())) {
		return cleaned;
	}

	return null;
}

function rewritePreservedImportSpecifier(original: string, rawSpecifier: string, preservedSpecifier: string): string {
	if (!rawSpecifier || rawSpecifier === preservedSpecifier) {
		return original;
	}

	return original.replace(rawSpecifier, preservedSpecifier);
}
