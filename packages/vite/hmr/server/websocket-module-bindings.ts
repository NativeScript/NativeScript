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

const sourceImportIntentCache = new Map<string, SourceImportIntentCacheEntry>();

export function ensureNativeScriptModuleBindings(code: string, options?: EnsureNativeScriptModuleBindingsOptions): string {
	const importRegex = /(^|\n)\s*import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];?/gm;
	const sideEffectRegex = /(^|\n)\s*import\s+["']([^"']+)["'];?/gm;

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

	code = code.replace(importRegex, (full: string, pfx: string, clause: string, rawSpec: string) => {
		const original = full.replace(/^\n/, '');
		if (full.trimStart().startsWith('import type')) {
			preservedImports.push(original);
			return pfx || '';
		}
		const specifier = rawSpec.replace(PAT.QUERY_PATTERN, '');
		const preservedSpecifier = getPreservedImportSpecifier(specifier, options);
		if (preservedSpecifier) {
			preservedImports.push(rewritePreservedImportSpecifier(original, rawSpec, preservedSpecifier));
			return pfx || '';
		}
		if (isEsmFrameworkPackageSpecifier(specifier)) {
			preservedImports.push(original);
			return pfx || '';
		}
		const runtimePluginBareSpecifier = resolveInternalRuntimePluginBareSpecifier(specifier, getProjectRootPath());
		let canonical = runtimePluginBareSpecifier || resolveVendorFromCandidate(specifier);
		const runtimePluginSpecifier = isLikelyNativeScriptRuntimePluginSpecifier(canonical || specifier, getProjectRootPath());
		if (options?.preserveNonPluginVendorImports && !runtimePluginSpecifier) {
			preservedImports.push(original);
			return pfx || '';
		}
		if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier, getProjectRootPath())) {
			canonical = specifier;
		}
		if (canonical && /^@nativescript\/core(\b|\/)/i.test(canonical)) {
			preservedImports.push(original);
			return pfx || '';
		}
		if (!canonical) {
			preservedImports.push(original);
			return pfx || '';
		}

		const binding = getModuleBinding(canonical);
		const trimmed = String(clause).trim();
		if (!trimmed) {
			binding.sideEffectOnly = true;
			return pfx || '';
		}
		if (trimmed.startsWith('*')) {
			const m = trimmed.match(/\*\s+as\s+(\w+)/i);
			if (m?.[1]) binding.namespace.add(m[1]);
			return pfx || '';
		}
		if (trimmed.startsWith('{')) {
			parseNamedImports(trimmed, binding);
			return pfx || '';
		}
		if (trimmed.includes(',') && trimmed.includes('{')) {
			const [defaultPart, namedPart] = trimmed.split(/,(.+)/, 2);
			const def = defaultPart.trim();
			if (def) binding.default.add(def);
			if (namedPart) parseNamedImports(namedPart.trim(), binding);
			return pfx || '';
		}
		binding.default.add(trimmed);
		return pfx || '';
	});

	code = code.replace(sideEffectRegex, (full: string, _pfx: string, rawSpec: string) => {
		const original = full.replace(/^\n/, '');
		const specifier = rawSpec.replace(PAT.QUERY_PATTERN, '');
		const preservedSpecifier = getPreservedImportSpecifier(specifier, options);
		if (preservedSpecifier) {
			preservedImports.push(rewritePreservedImportSpecifier(original, rawSpec, preservedSpecifier));
			return _pfx || '';
		}
		if (isEsmFrameworkPackageSpecifier(specifier)) {
			preservedImports.push(original);
			return _pfx || '';
		}
		const runtimePluginBareSpecifier = resolveInternalRuntimePluginBareSpecifier(specifier, getProjectRootPath());
		let canonical = runtimePluginBareSpecifier || resolveVendorFromCandidate(specifier);
		const runtimePluginSpecifier = isLikelyNativeScriptRuntimePluginSpecifier(canonical || specifier, getProjectRootPath());
		if (options?.preserveNonPluginVendorImports && !runtimePluginSpecifier) {
			preservedImports.push(original);
			return _pfx || '';
		}
		if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier, getProjectRootPath())) {
			canonical = specifier;
		}
		if (canonical && /^@nativescript\/core(\b|\/)/i.test(canonical)) {
			preservedImports.push(original);
			return _pfx || '';
		}
		if (!canonical) {
			preservedImports.push(original);
			return _pfx || '';
		}
		const binding = getModuleBinding(canonical);
		binding.sideEffectOnly = true;
		return _pfx || '';
	});

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
	if (/\.[a-z0-9]+$/i.test(lastSegment)) {
		return null;
	}

	return normalized;
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
	if (/\.[a-z0-9]+$/i.test(lastSegment)) {
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

	const suffixes = ['', '.js', '.ts', '.mjs', '.cjs', '.ios.js', '.android.js', '.visionos.js', '/index.js', '/index.ts', '/index.mjs'];
	return Array.from(new Set(suffixes.map((suffix) => (suffix ? `${normalized}${suffix}` : normalized))));
}

function buildResolvedRuntimePluginSpecifierOverrides(source: string, projectRoot: string, sourceFilePath: string): Map<string, string> {
	const overrides = new Map<string, string>();
	const extracted = astExtractImportsAndStripTypes(source);

	for (const importCode of extracted.imports) {
		const sourceSpecifier = importCode.match(/from\s+["']([^"']+)["']/)?.[1] || importCode.match(/^\s*import\s+["']([^"']+)["']/)?.[1] || null;
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
