import type { Plugin, ViteDevServer, TransformResult } from 'vite';
import { createRequire } from 'node:module';
import { sanitizeStrayCoreReferences, isDeepCoreSubpath } from './core-sanitize.js';
// AST tooling for robust transformations
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
// Ensure traverse callable across CJS/ESM builds
const babelTraverse: any = (traverse as any)?.default || (traverse as any);
import { existsSync, readFileSync, statSync } from 'fs';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { getCjsNamedExports } from '../helpers/cjs-named-exports.js';
import { stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import { WebSocketServer } from 'ws';
import * as path from 'path';
import { createHash } from 'crypto';
import * as PAT from './constants.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getMonorepoWorkspaceRoot, getPackageJson, getProjectFilePath, getProjectRootPath } from '../../helpers/project.js';
import { loadPrebuiltVendorManifest } from '../shared/vendor/manifest-loader.js';
import '../vendor-bootstrap.js';
import { linkAngularPartialsIfNeeded } from '../frameworks/angular/server/linker.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';
import { createProcessSfcCode } from '../frameworks/vue/server/sfc-transforms.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath } from '../../helpers/utils.js';
import { buildRuntimeConfig, generateImportMap } from './import-map.js';
import { getCliFlags } from '../../helpers/cli-flags.js';
import { buildCoreUrl, buildCoreUrlPath } from '../../helpers/ns-core-url.js';
import { resolveDeviceReachableOrigin, type DevHostPlatform } from '../../helpers/dev-host.js';
import { isRuntimeGraphExcludedPath, normalizeRuntimeGraphPath, shouldIncludeRuntimeGraphFile, shouldSkipRuntimeGraphDirectoryName } from './runtime-graph-filter.js';
import { getHmrSourceRoots } from '../../helpers/hmr-scope.js';
import { getTsConfigData } from '../../helpers/ts-config-paths.js';
import { resolveAngularCoreHmrImportSource, rewriteAngularEntryRegisterOnly } from './websocket-angular-entry.js';
import { angularSourceHasSemanticDecorator, canonicalizeTransformRequestCacheKey, collectAngularEvictionUrls, collectAngularHotUpdateRoots, collectAngularTransformCacheInvalidationUrls, collectAngularTransitiveImportersForInvalidation, collectGraphUpdateModulesForHotUpdate, normalizeHotReloadMatchPath, shouldInvalidateAngularTransitiveImporters, shouldSuppressDefaultViteHotUpdate, shouldSuppressViteFullReloadPayload, type HotUpdateGraphModuleLike, type PendingAngularReloadSuppressionEntry, type TransitiveImporterModuleLike } from './websocket-angular-hot-update.js';
import { classifyGraphUpsert, shouldBroadcastGraphUpsertDelta, shouldBumpGraphVersion, type GraphUpsertClassification } from './websocket-graph-upsert.js';
import { HmrModuleGraph } from './hmr-module-graph.js';
import { REQUIRE_GUARD_SNIPPET } from './require-guard.js';
import { registerNsRtBridgeRoute } from './ns-rt-route.js';
import { registerVendorUnifierHandler } from './websocket-vendor-unifier.js';
import { registerTxnHandler } from './websocket-txn.js';
import { registerSfcHandlers } from './websocket-sfc.js';
import { registerNsModuleServerRoute } from './websocket-ns-m.js';
import { registerNsCoreRoute } from './websocket-ns-core.js';
import { registerNsEntryRoutes } from './websocket-ns-entry.js';
import { handleNsHotUpdate } from './websocket-hot-update.js';
import { classifyBootRoute, createColdBootRequestCounter, formatPopulateInitialGraphSummary, formatServerStartupBanner, type ColdBootRequestCounter } from './perf-instrumentation.js';
import {
	extractVitePrebundleId,
	filterExistingNodeModulesTransformCandidates,
	getBlockedDeviceNodeModulesReason,
	getFlattenedManifestMap,
	isCoreGlobalsReference,
	isEsmFrameworkPackageSpecifier,
	isLikelyNativeScriptPluginSpecifier,
	isLikelyNativeScriptRuntimePluginSpecifier,
	isNativeScriptCoreModule,
	isNativeScriptPluginModule,
	normalizeNativeScriptCoreSpecifier,
	normalizeNodeModulesSpecifier,
	resolveInternalRuntimePluginBareSpecifier,
	resolveNodeModulesPackageBoundary,
	resolveVendorFromCandidate,
	resolveVendorRouting,
	rewriteFsAbsoluteToNsM,
	shouldPreserveBareRuntimePluginSubpathImport,
	stripDecoratedServePrefixes,
	tryReadRawExplicitJavaScriptModule,
	viteDepsPathToBareSpecifier,
} from './websocket-module-specifiers.js';
import { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides, type EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';
import { collectStaticExportNamesFromFile, collectStaticExportOriginsFromFile, normalizeCoreExportOriginsForRuntime, type CoreExportOrigin, type ParsedCoreBridgeRequest } from './websocket-core-bridge.js';
import { createSharedTransformRequestRunner, type SharedTransformRequestRunner, type SharedTransformRequestRunnerOptions } from './shared-transform-request.js';
import { formatNsMHmrServeTag, getNumericServeVersionTag, rewriteNsMImportPathForHmr } from './websocket-ns-m-paths.js';
import { assertNoOptimizedArtifacts, buildBootProgressSnippet, collectTopLevelImportRecords, deduplicateLinkerImports, ensureDestructureRtImports, ensureDynamicHmrImportHelper, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, ensureVersionedRtImports, hoistTopLevelStaticImports, repairImportEqualsAssignments, stripCoreGlobalsImports, stripViteDynamicImportVirtual, wrapCommonJsModuleForDevice } from './websocket-served-module-helpers.js';
export { buildBootProgressSnippet, wrapCommonJsModuleForDevice };

export { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides } from './websocket-module-bindings.js';
export type { EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';
export { stripDecoratedServePrefixes, tryReadRawExplicitJavaScriptModule } from './websocket-module-specifiers.js';
export { collectStaticExportNamesFromFile, collectStaticExportOriginsFromFile, normalizeCoreExportOriginsForRuntime, parseCoreBridgeRequest } from './websocket-core-bridge.js';
export { rewriteAngularEntryRegisterOnly } from './websocket-angular-entry.js';
// Re-export the canonical URL rewriter from `websocket-ns-m-paths.js` so the
// existing test suites (which import from `./websocket.js`) keep working
// without churn while the implementation lives in a focused module.
export { formatNsMHmrServeTag, rewriteNsMImportPathForHmr } from './websocket-ns-m-paths.js';
export { angularSourceHasSemanticDecorator, canonicalizeTransformRequestCacheKey, collectAngularEvictionUrls, collectAngularHotUpdateRoots, collectAngularTransformCacheInvalidationUrls, collectAngularTransitiveImportersForInvalidation, collectGraphUpdateModulesForHotUpdate, createSharedTransformRequestRunner, normalizeHotReloadMatchPath, shouldInvalidateAngularTransitiveImporters, shouldSuppressDefaultViteHotUpdate, shouldSuppressViteFullReloadPayload, classifyGraphUpsert, shouldBroadcastGraphUpsertDelta, shouldBumpGraphVersion };
export { collectCssHotUpdatePaths } from './websocket-css-hot-update.js';
export type { CoreExportOrigin, GraphUpsertClassification, HotUpdateGraphModuleLike, ParsedCoreBridgeRequest, PendingAngularReloadSuppressionEntry, SharedTransformRequestRunner, SharedTransformRequestRunnerOptions, TransitiveImporterModuleLike };

// Build a serialized process.env object from CLI --env.* flags.
// This is injected into every HTTP-served module so app code referencing
// process.env.TEST_ENV (etc.) works on device in HMR dev mode.
const __processEnvEntries: Record<string, string> = { NODE_ENV: 'development' };
try {
	const flags = getCliFlags();
	for (const [k, v] of Object.entries(flags || {})) {
		// Skip internal NativeScript build flags
		if (['ios', 'android', 'visionos', 'platform', 'hmr', 'verbose'].includes(k)) continue;
		__processEnvEntries[k] = String(v);
	}
} catch {}
const __processEnvJson = JSON.stringify(__processEnvEntries);

const APP_ROOT_DIR = getProjectAppPath();

// Absolute directories HMR is allowed to react to: the app source dir
// (`nativescript.config.ts` > `appPath`) plus tsconfig-configured shared
// libraries. Computed once per process (tsconfig data is itself memoized) and
// used to scope `handleHotUpdate` so non-source changes.
let _hmrSourceRoots: string[] | null = null;
function getHmrSourceRootsCached(): string[] {
	if (_hmrSourceRoots) return _hmrSourceRoots;
	let tsConfig: { paths?: Record<string, string[]>; baseUrl?: string } = {};
	try {
		tsConfig = getTsConfigData({ platform: '' });
	} catch {}
	_hmrSourceRoots = getHmrSourceRoots(tsConfig);
	return _hmrSourceRoots;
}

const APP_VIRTUAL_PREFIX = getProjectAppVirtualPath();
const APP_VIRTUAL_WITH_SLASH = `${APP_VIRTUAL_PREFIX}/`;
const DEFAULT_MAIN_ENTRY = getProjectAppRelativePath('app.ts');
const DEFAULT_MAIN_ENTRY_VIRTUAL = getProjectAppVirtualPath('app.ts');

// Memoized resolver for the project bootstrap entry as a posix
// project-relative path (e.g. `/src/main.ts`). This mirrors the
// resolution the cold-boot wrapper performs (`getPackageJson().main` →
// project-relative under `/<APP_ROOT_DIR>/`) so the eviction set for
// HMR always lines up with the URL the runtime actually re-imports.
// Resolved at first call and cached: `package.json` is read at startup
// and never changes during a dev session, so it's safe to memoize.
let __ns_bootstrap_entry_rel_cached: string | null = null;
function getBootstrapEntryRelPath(): string {
	if (__ns_bootstrap_entry_rel_cached) return __ns_bootstrap_entry_rel_cached;
	let entry = DEFAULT_MAIN_ENTRY_VIRTUAL;
	try {
		const pkg = getPackageJson();
		const main = (pkg && (pkg as any).main) || DEFAULT_MAIN_ENTRY;
		const abs = getProjectFilePath(main).replace(/\\/g, '/');
		const marker = `/${APP_ROOT_DIR}/`;
		const idx = abs.indexOf(marker);
		entry = idx >= 0 ? abs.substring(idx) : DEFAULT_MAIN_ENTRY_VIRTUAL;
	} catch {}
	if (!entry.startsWith('/')) {
		entry = '/' + entry;
	}
	__ns_bootstrap_entry_rel_cached = entry;
	return entry;
}

const STRATEGY_REGISTRY = new Map<string, FrameworkServerStrategy>([
	['vue', vueServerStrategy],
	['angular', angularServerStrategy],
	['solid', solidServerStrategy],
	['typescript', typescriptServerStrategy],
]);

function resolveFrameworkStrategy(flavor: string): FrameworkServerStrategy {
	const strategy = STRATEGY_REGISTRY.get(flavor);
	if (!strategy) {
		throw new Error(`[ns-hmr] Unsupported framework strategy: ${flavor}`);
	}
	return strategy;
}

function isSocketClientOpen(client: { readyState?: number; OPEN?: number } | null | undefined): boolean {
	if (!client) {
		return false;
	}

	const openState = typeof client.OPEN === 'number' ? client.OPEN : 1;
	return client.readyState === openState;
}

function getHmrSocketRoleFromRequestUrl(requestUrl: string | undefined): string {
	try {
		const url = new URL(requestUrl || '/ns-hmr', 'http://localhost');
		return url.searchParams.get('ns_hmr_role') || 'unknown';
	} catch {
		return 'unknown';
	}
}

function getHmrSocketRole(client: { __nsHmrClientRole?: string } | null | undefined): string {
	if (!client) {
		return 'unknown';
	}
	return typeof client.__nsHmrClientRole === 'string' && client.__nsHmrClientRole ? client.__nsHmrClientRole : 'unknown';
}

export function prepareAngularEntryForDevice(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	const rewrittenCode = rewriteImports(code, importerPath, sfcFileMap, depFileMap, projectRoot, verbose, outputDirOverrideRel, httpOrigin, resolveVendorAsHttp);

	return rewriteAngularEntryRegisterOnly(rewrittenCode, resolveAngularCoreHmrImportSource(rewrittenCode, httpOrigin));
}

const processSfcCode = createProcessSfcCode(processCodeForDevice);

interface ProcessCodeForDeviceOptions {
	resolvedSpecifierOverrides?: Map<string, string>;
}

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

// Guard any bare dynamic import(spec) occurring in assembled module code.
// We cannot override native dynamic import globally; for SFC assembler outputs we inline
// a tiny helper and rewrite "import(" to "__nsDynImport(" to prevent anomalous specs like '@'.
function guardBareDynamicImports(code: string): string {
	try {
		if (!code || typeof code !== 'string') return code;
		const NEEDLE = /(^|\n)\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/;
		const hasImportCall = /\bimport\s*\(/.test(code);
		if (!hasImportCall) return code;
		const helper = "const __nsDynImport = (spec) => { try { if (!spec || spec === '@') { return import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href); } } catch {} try { return import(spec); } catch (e) { return Promise.reject(e); } };\n";
		// Avoid double injection
		const inject = code.includes('const __nsDynImport =') ? '' : helper;
		// Replace bare import( ... ) that are not part of 'import.meta' or type-only contexts
		// Heuristic: replace 'import(' occurrences; skip 'import.meta'
		const rewritten = code.replace(/\bimport\s*\(/g, '__nsDynImport(');
		if (rewritten === code && !inject) return code;
		return inject + rewritten;
	} catch {
		return code;
	}
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

/**
 * Inject global bindings for given names
 */
function injectGlobalBindings(code: string, names: string[]): string {
	if (!names.length) return code;
	const lines = names.map((n) => `const ${n} = globalThis.${n};`);
	return lines.join('\n') + '\n' + code;
}

/**
 * Strip import.meta.hot blocks (balanced braces)
 */
function stripImportMetaHotBlocks(code: string): string {
	let result = code;
	const regex = /if\s*\(\s*import\.meta\.hot\s*\)\s*\{/g;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(result)) !== null) {
		let start = match.index;
		let i = start + match[0].length;
		let depth = 1;
		while (i < result.length && depth > 0) {
			const ch = result[i++];
			if (ch === '{') depth++;
			else if (ch === '}') depth--;
		}
		result = result.slice(0, start) + '/* removed import.meta.hot */\n' + result.slice(i);
		regex.lastIndex = start;
	}
	return result;
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

function registerDependencyFile(depFileMap: Map<string, string>, candidate: string | null, fileName: string): void {
	if (!candidate) return;

	const cleaned = candidate.replace(PAT.QUERY_PATTERN, '');
	const normalizedCandidate = normalizeNativeScriptCoreSpecifier(cleaned);
	if (isCoreGlobalsReference(normalizedCandidate)) {
		return;
	}
	if (isNativeScriptCoreModule(normalizedCandidate)) {
		return;
	}
	if (isNativeScriptPluginModule(normalizedCandidate)) {
		return;
	}
	if (resolveVendorFromCandidate(normalizedCandidate)) {
		return;
	}
	if (!cleaned) return;

	const variants = new Set<string>();
	variants.add(normalizedCandidate);
	variants.add(cleaned);

	const normalized = path.posix.normalize(cleaned);
	variants.add(normalized);

	const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
	variants.add(withSlash);

	const withoutExt = withSlash.replace(/\.(ts|js|mjs|tsx|jsx)$/i, '');
	variants.add(withoutExt);
	variants.add(`${withoutExt}.js`);
	variants.add(`${withoutExt}.mjs`);
	variants.add(`${withoutExt}.ts`);

	for (const variant of variants) {
		depFileMap.set(variant, fileName);
	}
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

function collectImportDependencies(code: string, importerPath: string): Set<string> {
	const importerDir = path.posix.dirname(importerPath);
	const deps = new Set<string>();
	const patterns = [PAT.IMPORT_PATTERN_1, PAT.IMPORT_PATTERN_2, PAT.EXPORT_PATTERN, PAT.IMPORT_PATTERN_3];

	for (const pattern of patterns) {
		pattern.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(code)) !== null) {
			const rawSpec = match[2];
			const spec = normalizeNativeScriptCoreSpecifier(rawSpec);
			if (!spec || !shouldRemapImport(spec)) {
				continue;
			}

			if (resolveVendorFromCandidate(spec)) {
				continue;
			}
			// Manifest-aware vendor spec detection
			try {
				if (resolveVendorSpecifier && resolveVendorSpecifier(spec)) {
					continue;
				}
			} catch {}

			const normalized = normalizeImportPath(spec, importerDir);
			if (normalized) {
				if (resolveVendorFromCandidate(normalized)) {
					continue;
				}
				try {
					if (resolveVendorSpecifier && resolveVendorSpecifier(normalized)) {
						continue;
					}
				} catch {}
				if (isCoreGlobalsReference(normalized)) {
					continue;
				}
				if (isNativeScriptCoreModule(normalized)) {
					continue;
				}
				if (isNativeScriptPluginModule(normalized)) {
					continue;
				}
				deps.add(normalized);
			}
		}
	}

	return deps;
}

/**
 * Clean code: remove Vite/Vue noise, rewrite to vendor
 */
function cleanCode(code: string, strategy: FrameworkServerStrategy): string {
	let result = code;

	// Remove Vite client and hot module noise
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '');
	result = result.replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');
	// Keep import.meta.hot call sites; runtime now provides a stable import.meta.hot.

	result = strategy.preClean?.(result) ?? result;
	result = strategy.rewriteFrameworkImports?.(result) ?? result;

	// Vendor manifest-driven import rewrites
	// NOTE: Static and side-effect vendor imports are intentionally NOT rewritten here.
	// They are left as import statements so that ensureNativeScriptModuleBindings()
	// (called later in processCodeForDevice) can transform them using the robust
	// __nsVendorRequire + __nsPick pattern that works on device.
	// Only dynamic imports are handled here since ensureNativeScriptModuleBindings
	// does not process dynamic import() calls.
	try {
		const manifest = getVendorManifest();
		if (manifest) {
			// Dynamic import rewrites: import('pkg') -> Promise.resolve(__nsVendor('id'))
			const dynImportRE = /(import\(\s*["'])([^"']+)(["']\s*\))/g;
			result = result.replace(dynImportRE, (full, pre, spec, post) => {
				if (isNativeScriptCoreModule(spec)) return full;
				const resolved = resolveVendorSpecifier(spec);
				if (!resolved || /^@nativescript\/core(\b|\/)/i.test(resolved)) return full;
				return `Promise.resolve(__nsVendor(${JSON.stringify(resolved)}))`;
			});
		}
	} catch (e) {
		// Non-fatal; fallback to original code if manifest logic fails
	}
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '').replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');

	// Clean up HMR noise
	result = strategy.postClean?.(result) ?? result;
	result = stripCoreGlobalsImports(result);

	return result;
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

function toDocumentsAbsoluteImport(importPath: string, projectRoot?: string): string | null {
	const projectRelative = getProjectRelativeImportPath(importPath, projectRoot);
	if (!projectRelative) {
		return null;
	}
	if (isNativeScriptCoreModule(projectRelative)) {
		return null;
	}
	return `__NSDOC__/${projectRelative}`;
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

// `rewriteNsMImportPathForHmr` and `getNumericServeVersionTag` live in
// `./websocket-ns-m-paths.js`. The path rewriter is part of the
// "Stable URL + Explicit Invalidation" architecture and must be a
// single source of truth so the canonicalization rules can't drift
// between modules. They are imported above and re-exported below for
// tests / external callers that historically reached them through this
// module.

function normalizeAbsoluteFilesystemImport(spec: string, importerPath: string, projectRoot?: string): string | null {
	if (!spec || typeof spec !== 'string') {
		return null;
	}

	let normalized = spec;
	if (normalized.startsWith('file://')) {
		normalized = normalized.replace(/^file:\/\//, '/');
	}

	if (!normalized.startsWith('/')) {
		return null;
	}

	const containsDocuments = normalized.includes('/Documents/');
	const projectRootNormalized = projectRoot?.replace(/\\/g, '/').replace(/\/+$/, '');
	const containsProjectRoot = projectRootNormalized ? normalized.includes(projectRootNormalized) : false;

	if (isNativeScriptCoreModule(normalized)) {
		return null;
	}

	if (!containsDocuments && !containsProjectRoot) {
		return null;
	}

	const absolute = toDocumentsAbsoluteImport(normalized, projectRoot);
	if (!absolute || absolute === spec) {
		return null;
	}

	return absolute;
}

/**
 * Process code for device: inject globals, remove framework imports
 */

function processCodeForDevice(code: string, isVitePreBundled: boolean, preserveVendorImports: boolean = false, isNodeModule: boolean = false, sourceId?: string, options?: ProcessCodeForDeviceOptions): string {
	let result = code;
	const resolvedSpecifierOverrides = options?.resolvedSpecifierOverrides || getProcessCodeResolvedSpecifierOverrides(sourceId, getProjectRootPath());
	const bindingOptions: EnsureNativeScriptModuleBindingsOptions = {
		preserveNonPluginVendorImports: preserveVendorImports,
		resolvedSpecifierOverrides,
	};

	// Ensure Angular partial declarations are linked before any sanitizers run so runtime never hits the JIT path.
	result = linkAngularPartialsIfNeeded(result);

	// Post-linker: deduplicate/resolve imports the Angular linker injected with bare specifiers
	result = deduplicateLinkerImports(result);

	// First: aggressively strip any lingering virtual dynamic-import-helper before anything else.
	// Doing this up-front prevents downstream dependency collection from seeing the virtual id.
	result = stripViteDynamicImportVirtual(result);

	// Skip reactive injection for Vite pre-bundled deps (they have Vue bundled already)
	if (isVitePreBundled) {
		return result;
	}

	// Inject ALL NativeScript/build globals at the top (matching global-defines.ts)
	// This ensures any code using __DEV__, __ANDROID__, __IOS__, etc. works correctly
	const allGlobals = [
		// Minimal process shim — populated with CLI --env.* flags at module load time.
		// In production builds, Vite/Rollup replaces process.env.* statically.
		// In HMR dev mode the code runs as-is on device, so we need the shim.
		//
		// IMPORTANT: every check goes through `globalThis.process` (a member
		// expression), NEVER bare `typeof process` (an identifier reference).
		// bare identifier resolution
		// against runtime-added global object properties is not reliable in
		// V8 module scope. `globalThis.process` is unambiguous: it always
		// reads the `process` property off the (single) global object.
		//
		// The shim is also strictly additive — it only initializes
		// `globalThis.process` and `globalThis.process.env` if they are
		// missing. App code that pre-populates `process.env` (e.g. an Azure
		// App Configuration boot module) is preserved; we never overwrite a
		// populated env with the bare `{ NODE_ENV: 'development' }` stub.
		`if (typeof globalThis.process === "undefined" || globalThis.process === null) { globalThis.process = { env: ${__processEnvJson} }; } else if (!globalThis.process.env) { globalThis.process.env = ${__processEnvJson}; }`,
		'const __ANDROID__ = globalThis.__ANDROID__ !== undefined ? globalThis.__ANDROID__ : false;',
		'const __IOS__ = globalThis.__IOS__ !== undefined ? globalThis.__IOS__ : false;',
		'const __VISIONOS__ = globalThis.__VISIONOS__ !== undefined ? globalThis.__VISIONOS__ : false;',
		'const __APPLE__ = globalThis.__APPLE__ !== undefined ? globalThis.__APPLE__ : (__IOS__ || __VISIONOS__);',
		'const __DEV__ = globalThis.__DEV__ !== undefined ? globalThis.__DEV__ : false;',
		'const __COMMONJS__ = globalThis.__COMMONJS__ !== undefined ? globalThis.__COMMONJS__ : false;',
		'const __NS_WEBPACK__ = globalThis.__NS_WEBPACK__ !== undefined ? globalThis.__NS_WEBPACK__ : false;',
		'const __NS_ENV_VERBOSE__ = globalThis.__NS_ENV_VERBOSE__ !== undefined ? !!globalThis.__NS_ENV_VERBOSE__ : false;',
		"const __CSS_PARSER__ = globalThis.__CSS_PARSER__ !== undefined ? globalThis.__CSS_PARSER__ : 'css-tree';",
		'const __UI_USE_XML_PARSER__ = globalThis.__UI_USE_XML_PARSER__ !== undefined ? globalThis.__UI_USE_XML_PARSER__ : true;',
		'const __UI_USE_EXTERNAL_RENDERER__ = globalThis.__UI_USE_EXTERNAL_RENDERER__ !== undefined ? globalThis.__UI_USE_EXTERNAL_RENDERER__ : false;',
		'const __TEST__ = globalThis.__TEST__ !== undefined ? globalThis.__TEST__ : false;',
	];
	result = allGlobals.join('\n') + '\n' + result;
	const nodeModuleProvenancePrelude = buildNodeModuleProvenancePrelude(sourceId);
	if (nodeModuleProvenancePrelude) {
		result = nodeModuleProvenancePrelude + result;
	}

	// AST normalization: inject /ns/rt helper aliases for underscore-prefixed identifiers.
	// ONLY for app source files — library code in node_modules should be served as-is.
	// Running the normalizer on libraries like tslib injects harmful destructures
	// (e.g., `const { SuppressedError } = __ns_rt_ns_1`) that shadow globals.
	if (!isNodeModule) {
		// CRITICAL ORDERING: canonicalise any bare `@nativescript/core[/sub]`
		// specifiers to `/ns/core[/sub]` BEFORE the AST normaliser sees them.
		// `astNormalizeModuleImportsAndHelpers` defensively rewrites bare
		// `@nativescript/core` imports and emits a one-shot
		// `[ast-normalizer] unexpected @nativescript/core spec` warning —
		// the warning means the upstream rewriter regressed. For Vue SFC
		// `<script>` blocks the bare specifier flows through Vite's
		// transform pipeline without a per-statement source-string rewrite
		// (Vite's resolver only edits the module graph, not the emitted
		// code), so the only upstream rewriter that can canonicalise these
		// in dev mode is this regex sweep. Running it here keeps the AST
		// normaliser purely a tripwire instead of an active rewriter.
		try {
			result = sanitizeStrayCoreReferences(result);
		} catch {}

		try {
			result = astNormalizeModuleImportsAndHelpers(result);
		} catch {}

		// Verify there are no duplicate top-level const/let bindings after AST normalization
		try {
			result = astVerifyAndAnnotateDuplicates(result);
		} catch {}
	}

	// If AST marker present OR this is a node_modules file, skip regex-based helper
	// alias injection. Library code should NOT get /ns/rt destructures injected —
	// underscore-prefixed identifiers in libraries are internal variables, not NS helpers.
	if (!isNodeModule && !/^\s*(?:\/\/|\/\*) \[ast-normalized\]/m.test(result)) {
		try {
			const underscored = new Set<string>();
			const re = /(^|[^.\w$])_([A-Za-z]\w*)\b/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(result))) {
				const name = m[2];
				if (name === 'ctx' || name === 'cache') continue;
				if (name.startsWith('hoisted_')) continue;
				if (name.startsWith('component_')) continue;
				if (name.startsWith('directive_')) continue;
				if (name === 'sfc_main') continue;
				if (name === 'ns_sfc__' || name.startsWith('ns_sfc')) continue;
				if (name.startsWith('sfc')) continue;
				try {
					const declRE = new RegExp(`(^|\\n)\\s*(?:const|let|var)\\s+_${name}\\b`);
					if (declRE.test(result)) continue;
				} catch {}
				underscored.add(name);
			}
			if (underscored.size) {
				const needed: string[] = [];
				for (const n of underscored) {
					const aliasNeedle = new RegExp(`\\b${n}\\s+as\\s+_${n}\\b`);
					if (!aliasNeedle.test(result)) needed.push(n);
				}
				if (needed.length) {
					const importLine = `import { ${needed.map((n) => `${n} as _${n}`).join(', ')} } from "/ns/rt";\n`;
					result = importLine + result;
				}
			}
		} catch {}
	}

	// In strict dev mode, proactively surface duplicate-binding diagnostics to avoid "already declared" runtime errors
	try {
		if (/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\]/m.test(result)) {
			const diagnosticLine = (result.match(/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\][^\n]*/m) || [])[0] || '// [ast-verify][duplicate-bindings]';
			const brief = diagnosticLine.replace(/^[^:]*:?\s?/, '');
			const escaped = brief.replace(/["\\]/g, '\\$&');
			const thrower = `throw new Error("[nsv-hmr] Duplicate top-level bindings detected: ${escaped}");`;
			result = `${thrower}\n` + result;
		}
	} catch {}

	// Remove Vite internal imports (dynamic-import-helper, etc.)
	// This handles both standalone lines and concatenated imports on the same line
	result = result.replace(/import\s+[^;]+\s+from\s+["']\/@id\/[^"']*["'];?\s*/g, '');
	// Also remove side-effect only virtual id imports like: import "/@id/__x00__vite/dynamic-import-helper.js";
	// These can slip through and cause the NativeScript runtime to attempt resolving
	// a non-existent physical file (e.g. /@id/__x00__vite/dynamic-import-helper.js) leading to
	// module not found crashes during HMR evaluation.
	if (/^[\t ]*import\s+["']\/@id\/[^"']+["'];?\s*$/m.test(result)) {
		result = result.replace(/^[\t ]*import\s+["']\/@id\/[^"']+["'];?\s*$/gm, '');
		// Inject a lightweight marker comment (harmless if left in output) so devs can confirm rewrite took place when viewing streamed artifact.
		result = `// [hmr-sanitize] stripped virtual /@id/ side-effect imports\n${result}`;
	}

	// IMPORTANT: Perform vendor-module binding injection BEFORE stripping Vite prebundle imports.
	// This allows the rewriter to see and canonicalize '/node_modules/.vite/deps/*' specifiers back
	// to their package ids (e.g., '@nativescript/firebase-core') and generate require-based bindings
	// so named imports like `{ firebase }` are preserved as const bindings.
	//
	// Some upstream transforms can emit a multiline form:
	//   import { x } from
	//   "/node_modules/.vite/deps/...";
	// If we don't normalize it, later stripping of naked string-only lines can leave
	// an invalid `import ... from` statement.
	try {
		result = result.replace(/(^|\n)([\t ]*import\s+[^;]*?\s+from)\s*\n\s*("\/?node_modules\/\.vite\/deps\/[^"\n]+"\s*;?\s*)/gm, (_m, p1, p2, p3) => `${p1}${p2} ${p3}`);
	} catch {}
	// When preserveVendorImports is true (HMR /ns/m/ endpoint), skip the
	// __nsVendorRequire + __nsPick rewrite. Vendor imports stay as bare
	// specifiers so the device-side import map resolves them via V8's native
	// module system, which correctly handles export * re-exports.
	result = ensureNativeScriptModuleBindings(result, bindingOptions);

	// Repair any accidental "import ... = expr" assignments that may have slipped in.
	try {
		result = repairImportEqualsAssignments(result);
	} catch {}

	// Strip Vite prebundle deps imports (both named and side-effect) and any malformed const string artifacts
	// Example problematic line observed: const "/node_modules/.vite/deps/@nativescript_firebase-messaging.js?v=...";
	if (/node_modules\/\.vite\/deps\//.test(result)) {
		result = rewriteVitePrebundleImportsForDevice(result, preserveVendorImports);
		// Malformed const string lines accidentally produced by upstream transforms
		result = result.replace(/^[\t ]*const\s+["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '// [hmr-sanitize] stripped malformed const prebundle ref\n');
		// Naked string-only lines pointing at prebundle deps
		result = result.replace(/^[\t ]*["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '// [hmr-sanitize] stripped prebundle side-effect literal\n');
	}

	// Dynamic aliasing covers helper imports; no further static list handling needed.

	// Handle navigation helpers (dev bridge): $navigateTo, $navigateBack
	// Note: do NOT inject $showModal as a named import; AST normalizer/destructure covers it when imported,
	// and free-uses are handled via AST injection. This avoids duplicate identifier redeclarations.
	if (/\$(?:navigate(?:To|Back)|showModal)\b/.test(result)) {
		const navHelpers: string[] = [];
		// Only consider free uses (not property access like obj.$navigateTo)
		const needTo = /(^|[^.\w$])\$navigateTo\b/.test(result);
		const needBack = /(^|[^.\w$])\$navigateBack\b/.test(result);
		const needShow = /\$showModal\b/.test(result);
		if (needTo) navHelpers.push('$navigateTo');
		if (needBack) navHelpers.push('$navigateBack');
		// Intentionally exclude $showModal from navHelpers injection to prevent named import reinsertion
		// Remove any direct imports/usages that might shadow globals
		// 1) From 'vue' or 'nativescript-vue' sources
		result = removeNamedImports(result, navHelpers);
		// 2) From our runtime bridge '/ns/rt' (versioned or not)
		try {
			// Do NOT re-introduce named imports from /ns/rt for nav helpers; drop them entirely after removing nav helpers.
			const rtNamedRE = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["'];?\s*/gm;
			// Also compute locally-declared helpers to drop regardless of free-use detection
			const hasLocalToForDrop = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateTo\b/.test(result);
			const hasLocalBackForDrop = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateBack\b/.test(result);
			result = result.replace(rtNamedRE, (full, pfx, specList) => {
				const drop = new Set<string>(navHelpers);
				if (hasLocalToForDrop) drop.add('$navigateTo');
				if (hasLocalBackForDrop) drop.add('$navigateBack');
				const remaining = String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.filter((entry) => {
						const base = entry.split(/\s+as\s+/i)[0].trim();
						return !drop.has(base);
					});
				if (!remaining.length) return pfx || '';
				// Preserve non-navigation named imports for later normalization
				return `${pfx}import { ${remaining.join(', ')} } from "/ns/rt";`;
			});
			// Also strip $navigateTo/$navigateBack from any destructuring previously created from /ns/rt
			// Also remove from destructures bound off any __ns_rt_ns temp (including _re)
			const rtDestructureRE = /(^|[\n;])\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?\s*/gm;
			result = result.replace(rtDestructureRE, (full, pfx, specList, varName) => {
				const cleaned = String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.filter((seg) => {
						const lhs = seg.split(':')[0].trim();
						return !/^\$navigate(?:To|Back)$/.test(lhs);
					});
				if (!cleaned.length) return pfx || '';
				return `${pfx}const { ${cleaned.join(', ')} } = ${varName};`;
			});
		} catch {}
		// Inject named imports from /ns/rt to provide bindings without redeclaration collisions
		const imports: string[] = [];
		const hasImportTo = /(^|\n)\s*import\s*\{[^}]*\$navigateTo[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["']/.test(result);
		const hasImportBack = /(^|\n)\s*import\s*\{[^}]*\$navigateBack[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["']/.test(result);
		const hasImportShow = /(^|\n)\s*import\s*\{[^}]*\$showModal[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["']/.test(result);
		// Avoid adding named imports if a local binding already exists (e.g., wrapper const)
		const hasLocalTo = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateTo\b/.test(result);
		const hasLocalBack = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateBack\b/.test(result);
		if (needTo && !hasImportTo && !hasLocalTo) imports.push('$navigateTo');
		if (needBack && !hasImportBack && !hasLocalBack) imports.push('$navigateBack');
		// Do not inject $showModal named import; avoid duplicates with destructures created upstream
		if (imports.length) {
			result = `import { ${imports.join(', ')} } from "/ns/rt";\n` + result;
		}
	}

	// Ensure vendor bindings also apply after potential wrapper injections above
	// (idempotent: second pass will be a no-op if imports already consumed).
	result = ensureNativeScriptModuleBindings(result, bindingOptions);
	try {
		result = repairImportEqualsAssignments(result);
	} catch {}

	// Rewrite any previously-injected vendor-based core access to the unified HTTP core bridge
	try {
		const vendorCoreRE1 = /globalThis\.__nsVendor\s*\(\s*["']@nativescript\/core["']\s*\)/g;
		const vendorCoreRE2 = /__nsVendor\s*\(\s*["']@nativescript\/core["']\s*\)/g;
		if (vendorCoreRE1.test(result) || vendorCoreRE2.test(result)) {
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
			if (!hasImport) {
				result = `import __ns_core_bridge from "/ns/core";\n` + result;
			}
			result = result.replace(vendorCoreRE1, '__ns_core_bridge');
			result = result.replace(vendorCoreRE2, '__ns_core_bridge');
		}
	} catch {}

	// Rewrite any explicit require('@nativescript/core[/sub]') calls to the unified core bridge
	try {
		const reqCoreRE1 = /(^|[^.\w$])require\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g;
		const reqCoreRE2 = /(?:globalThis|window|self)\.require\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g;
		if (reqCoreRE1.test(result) || reqCoreRE2.test(result)) {
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
			if (!hasImport) {
				result = `import __ns_core_bridge from "/ns/core";\n` + result;
			}
			result = result.replace(reqCoreRE1, (_m, p1, _sub) => `${p1}__ns_core_bridge`);
			result = result.replace(reqCoreRE2, '__ns_core_bridge');
		}
	} catch {}

	// Apply the three-pass safety net for stray @nativescript/core references
	// (naked string literals, dangling `from` merges, lingering resolved-path
	// references). Centralised in core-sanitize.sanitizeStrayCoreReferences so
	// every NS-M emitter applies the same passes in the same order.
	result = sanitizeStrayCoreReferences(result);

	result = ensureVariableDynamicImportHelper(result);

	// Normalize any lingering @nativescript/core imports to the /ns/core bridge (non-destructive best-effort)
	try {
		// Rewrite named imports from the /ns/core bridge into default import + destructuring.
		// This makes `import { Frame } from '@nativescript/core'` work even if the bridge provides only a default export.
		{
			let __core_ns_seq = 0;
			const toDestructureCore = (specList: string) =>
				specList
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.map((seg) => {
						const m = seg.split(/\s+as\s+/i);
						return m.length === 2 ? `${m[0].trim()}: ${m[1].trim()}` : seg;
					})
					.join(', ');
			const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
			result = result.replace(reNamed, (_full, pfx: string, specList: string, src: string) => {
				// Deep subpath URLs serve actual ESM with real named exports — skip.
				if (isDeepCoreSubpath(src)) return _full;
				__core_ns_seq++;
				const tmp = `__ns_core_ns${__core_ns_seq}`;
				const decl = `const { ${toDestructureCore(specList)} } = ${tmp};`;
				return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
			});
			const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
			result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, src: string) => {
				if (isDeepCoreSubpath(src)) return _full;
				const decl = `const { ${toDestructureCore(specList)} } = ${defName};`;
				return `${pfx}import ${defName} from ${JSON.stringify(src)};\n${decl}\n`;
			});
		}
	} catch {}

	// Note: Removed legacy var-based underscore prelude to avoid const/var redeclaration conflicts.
	// Normalize concatenated imports that may have ended up after a statement on the same line
	try {
		// Common concatenations
		// Keep a single semicolon before the import to avoid generating ';;'
		result = result.replace(/;\s*import\s+/g, ';\nimport ');
		result = result.replace(/}\s*import\s+/g, '}\nimport ');
		// Fallback: ensure any static import that isn't at start of line gets a newline before it.
		//
		// Only match after **structural** statement-ending characters: `;`, `}`, `)`, `]`. We
		// deliberately do NOT include `'`, `"`, or `` ` `` here — those are string-literal
		// terminators (and openers!), and including them caused the regex to fire inside
		// example code embedded in error strings. Concrete failure observed:
		// `@supabase/realtime-js` throws an Error whose message contains the literal
		// `'  import ws from "ws"\n' +`. With `'` in the delimiter class, the engine matched
		// the opening `'` of that string literal as a "statement terminator" and rewrote the
		// example to `'\nimport ws from "..."` — splitting the string across two lines and
		// producing a SyntaxError on device. The structural delimiters below do not appear
		// inside string-literal openers, so the rewrite is safe.
		result = result.replace(/([;}\)\]])\s*(import\s+[^;\n]*\s+from\s*["'][^"']+["'])/g, '$1\n$2');
	} catch {}

	// Collapse duplicate destructuring from the same temp namespace var (e.g., multiple const { x } = __ns_rt_ns1)
	try {
		const collapse = (code: string, prefix: string) => {
			const re = new RegExp(`(^|\\n)\\s*const\\s*\\{([^}]+)\\}\\s*=\\s*(${prefix}\\d+)\\s*;?\\s*`, 'gm');
			const byVar: Record<string, Set<string>> = {};
			code.replace(re, (_full, _pfx, specList, varName) => {
				const set = (byVar[varName] ||= new Set());
				String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.forEach((seg) => set.add(seg));
				return '';
			});
			if (Object.keys(byVar).length) {
				// Remove all existing destructures first
				code = code.replace(re, (full, pfx) => pfx || '');
				// Re-emit one per var
				const blocks = Object.entries(byVar).map(([varName, set]) => `const { ${Array.from(set).join(', ')} } = ${varName};`);
				code = blocks.join('\n') + '\n' + code;
			}
			return code;
		};
		result = collapse(result, '__ns_rt_ns');
		result = collapse(result, '__ns_core_ns');
	} catch {}

	// After consolidating destructures, hoist static import declarations to the very top so imports
	// always come before any statements that might reference their bindings. This ordering avoids
	// device runtimes that are stricter about imports-first semantics during module instantiation.
	try {
		result = hoistTopLevelStaticImports(result);
	} catch {}

	// Final safety: normalize any lingering named imports from /ns/rt into default+destructure
	// Skip for node_modules (no /ns/rt helpers needed) and when AST marker present
	try {
		if (!isNodeModule && !/^\s*\/\* \[ast-normalized\] \*\//m.test(result)) {
			result = ensureDestructureRtImports(result);
		}
	} catch {}

	// Post-pass: if both a destructure from __ns_rt_ns* and named imports from /ns/rt exist,
	// remove overlapping named specifiers to avoid "Identifier has already been declared".
	try {
		// Collect all bindings destructured from any __ns_rt_ns* temp
		const rtDestructureRE = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?\s*/gm;
		const rtBound = new Set<string>();
		let m: RegExpExecArray | null;
		while ((m = rtDestructureRE.exec(result)) !== null) {
			const specList = String(m[2] || '');
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.forEach((seg) => {
					const bind = seg.includes(':') ? seg.split(':')[1].trim() : seg;
					if (bind) rtBound.add(bind);
				});
		}
		if (rtBound.size) {
			// Rewrite named imports from /ns/rt by removing any specifiers already provided via destructure
			const rtNamedImportRE = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)["'];?\s*/gm;
			const edits: Array<{ start: number; end: number; text: string }> = [];
			while ((m = rtNamedImportRE.exec(result)) !== null) {
				const full = m[0];
				const pfx = m[1] || '';
				const specList = String(m[2] || '');
				const src = m[3];
				const kept: string[] = [];
				specList
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.forEach((seg) => {
						const name = seg.split(/\s+as\s+/i)[0].trim();
						if (!rtBound.has(name)) kept.push(seg);
					});
				let replacement = '';
				if (kept.length) {
					replacement = `${pfx}import { ${kept.join(', ')} } from ${JSON.stringify(src)};`;
				} else {
					// Drop the import entirely if nothing remains
					replacement = pfx || '';
				}
				edits.push({
					start: rtNamedImportRE.lastIndex - full.length,
					end: rtNamedImportRE.lastIndex,
					text: replacement,
				});
			}
			if (edits.length) {
				// Apply edits in reverse order
				edits
					.sort((a, b) => b.start - a.start)
					.forEach((e) => {
						result = result.slice(0, e.start) + e.text + result.slice(e.end);
					});
			}
		}
	} catch {}

	// Tidy-ups: remove stray lines that are only semicolons and collapse excessive blank lines
	try {
		// Remove lines that contain only an optional whitespace and a single ';'
		result = result.replace(/^[ \t]*;[ \t]*$/gm, '');
		// Collapse 3+ blank lines into at most 2 to keep output compact and consistent
		result = result.replace(/\n{3,}/g, '\n\n');
	} catch {}

	// De-duplicate destructured bindings across different temp vars to avoid 'Identifier has already been declared'
	try {
		const reDestructureAny = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_(?:rt|core)_[A-Za-z0-9_]+)\s*;?\s*/gm;
		const seenBindings = new Set<string>();
		const edits: Array<{ start: number; end: number; text: string }> = [];
		let m: RegExpExecArray | null;
		while ((m = reDestructureAny.exec(result)) !== null) {
			const full = m[0];
			const pfx = m.index;
			const specList = m[2] as string;
			const varName = m[3] as string;
			const entries = specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			const kept: string[] = [];
			for (const seg of entries) {
				const bind = seg.includes(':') ? seg.split(':')[1].trim() : seg;
				if (seenBindings.has(bind)) continue;
				seenBindings.add(bind);
				kept.push(seg);
			}
			const replacement = kept.length ? `${m[1]}const { ${kept.join(', ')} } = ${varName};` : m[1] || '';
			edits.push({ start: pfx, end: pfx + full.length, text: replacement });
		}
		if (edits.length) {
			// Apply edits in reverse order to not mess up indices
			edits
				.sort((a, b) => b.start - a.start)
				.forEach((e) => {
					result = result.slice(0, e.start) + e.text + result.slice(e.end);
				});
		}
	} catch {}

	// As a final safety net, neutralize any uses of Vite's CJS import helpers when the helper variable
	// itself is not declared (e.g., stripped earlier during sanitation). This prevents runtime errors like
	// "Cannot read properties of undefined (reading 'initNorrix')" on device when accessing
	// __vite__cjsImportX__pkg["prop"].
	try {
		result = stripDanglingViteCjsImports(result);
	} catch {}

	return result;
}

// Assert that sanitized code no longer contains any Vite optimized deps artifacts
// or virtual ids that could break the HTTP ESM loader on device. Throws with
// a helpful diagnostics message if any are found.
/**
 * THE SINGLE REWRITE FUNCTION - used everywhere for consistency
 */
export function rewriteImports(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	let result = code;
	// Pre-normalize concatenated imports onto their own lines.
	//
	// Babel's `genCode(ast, { retainLines: true })` in
	// `astNormalizeModuleImportsAndHelpers` (which runs before us in the SFC
	// asm pipeline, and in several other hot paths) can emit multiple
	// statements on a single line, e.g.:
	//   `} = __ns_rt_ns_1;import { $goTo } from "../utils";import PageWrapper from ...;`
	//
	// IMPORT_PATTERN_1/_2/_3/SIDE_EFFECT all anchor on `(?:^|\n)\s*import`,
	// so any import past the first one on a single line is silently dropped
	// by the rewriter. Downstream that leaves bare relative specifiers like
	// `../utils` to be resolved by the iOS HTTP ESM loader, which interprets
	// them relative to the `/ns/asm/0?path=...` URL and 404s on the
	// resulting `/ns/utils`. Splitting `;import` onto its own line makes the
	// existing patterns match every import, restoring the rewrite contract.
	//
	// Mirrors the same normalization already performed in
	// `core-sanitize.ts::normalizeStrayCoreStringLiterals` (`;\s*import` →
	// `;\nimport`) but applied universally at the rewriter entry point so
	// every caller benefits without having to opt in.
	result = result.replace(/;\s*import\s+/g, ';\nimport ');
	const httpOriginSafe = httpOrigin;
	const mixedRuntimePluginHttpRootPackages = collectMixedRuntimePluginHttpRootPackages(result, projectRoot);
	const isDynamicImportPrefix = (prefix: string): boolean => /import\(\s*["']?$/.test(prefix.trimStart());
	const importerDir = path.posix.dirname(importerPath);
	// Resolved once per `rewriteImports` call so the per-import `/@fs/` rewriter
	// can convert workspace-lib paths back into our `/ns/m/` pipeline. Memoized
	// upstream — calling here is cheap and we reuse the value below.
	const monorepoWorkspaceRootForRewrite = getMonorepoWorkspaceRoot(projectRoot);
	// Determine importer output relative path (project-relative .mjs) to compute relative imports consistently
	const importerOutRel = outputDirOverrideRel || getProjectRelativeImportPath(importerPath, projectRoot) || stripToProjectRelative(importerPath, projectRoot).replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	const importerOutDir = importerOutRel ? path.posix.dirname(importerOutRel) : '';
	const ensureRel = (p: string) => (p.startsWith('.') ? p : `./${p}`);
	const isNsSfcSpecifier = (spec: string): boolean => /^(?:https?:\/\/[^/]+)?\/ns\/sfc(?:\/\d+)?(?:\/|$)/.test(spec.replace(PAT.QUERY_PATTERN, ''));

	// Normalize all @nativescript/core imports to the unified HTTP ESM core bridge to guarantee a single realm on device
	try {
		let coreAliasIdx = 0;
		const mkAlias = () => `__NSC${coreAliasIdx++}`;
		// Use the canonical PATH form `/ns/core/<sub>`. The iOS HTTP ESM
		// loader caches module records by URL string — every emitter
		// (`buildCoreUrl()` / `buildCoreUrlPath()`, the runtime import map,
		// vendor `require()` shims, app-side rewrites, the cold-boot
		// preload in `entry-runtime.ts`) MUST produce the same byte
		// string for the same logical core subpath. A divergence creates
		// two distinct V8 module records for the same source. Each gets
		// its own class
		// identities (TextBase, View, etc.), and side-effect patches
		// applied to one (e.g. @nativescript-community/text's
		// `TextBase.prototype.setTextDecorationAndTransform` override
		// installed when vendor.mjs evaluates `overrideSpanAndFormattedString()`
		// from `@nativescript-community/ui-label/index-common.js`) are
		// invisible to the other — manifesting as inconsistent line-height /
		// letter-spacing rendering between HMR and no-HMR.
		//
		// Mirrors `normalizeCoreSub()` (helpers/ns-core-url.ts) so the URL
		// produced here is byte-identical to what `buildCoreUrl()` produces
		// for the bundle entry, import map, and external-urls plugin.
		// Delegate to the ONE canonical URL builder so every emitter (this
		// rewriter, core-sanitize, the runtime import map, the ns-core-external-urls
		// build plugin, and main-entry) produces byte-identical URLs for
		// the same logical core module. Any drift here would re-introduce
		// the realm-split bug.
		const coreUrl = (sub?: string) => (httpOriginSafe ? buildCoreUrl(httpOriginSafe, sub) : buildCoreUrlPath(sub));
		// Case 1: import { A, B } from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s*\{\s*([^}]+?)\s*\}\s*from\s+["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, names: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			const cleaned = names
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(', ');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst { ${cleaned} } = ${alias};`;
		});
		// Case 2: import Default, { A, B } from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+?)\s*\}\s*from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, defName: string, names: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			const cleaned = names
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(', ');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst ${defName} = (${alias}.default || ${alias});\nconst { ${cleaned} } = ${alias};`;
		});
		// Case 3: import Default from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, defName: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst ${defName} = (${alias}.default || ${alias});`;
		});
		// Case 4: import * as NS from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, nsName: string, sub: string) => {
			const url = coreUrl(sub || '');
			return `${pfx}import * as ${nsName} from ${JSON.stringify(url)};`;
		});
		// Case 5: side-effect import '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, sub: string) => {
			const url = coreUrl(sub || '');
			return `${pfx}import ${JSON.stringify(url)};`;
		});
		// Case 6: dynamic import('@nativescript/core[/sub]')
		result = result.replace(/import\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g, (_m, sub: string) => {
			const url = coreUrl(sub || '');
			return `import(${JSON.stringify(url)})`;
		});
	} catch {}

	// Inline JSON imports (package.json, config.json, etc.)
	// This must happen BEFORE other rewrites because JSON imports get a ?import query added by Vite
	result = result.replace(/import\s+(\w+)\s+from\s+["']([^"']+\.json(?:\?[^"']*)?)["'];?/g, (match, varName, jsonPath) => {
		try {
			// Remove query params like ?import
			const cleanPath = jsonPath.split('?')[0];

			// Resolve the JSON file path relative to the importer
			let fullPath: string;
			if (cleanPath.startsWith('/@fs/')) {
				// Vite filesystem URL: `/@fs/<abs-path>`. Strip the `/@fs` prefix
				// (4 chars, leaving the leading `/`) to recover the absolute
				// path. This matches `rewriteFsAbsoluteToNsM`'s convention and
				// covers both bare specifiers Vite pre-resolved out of the
				// project root (e.g. `emojibase-data/en/compact.json` →
				// `/@fs/.../node_modules/.../compact.json`) and tsconfig
				// path-alias targets that resolve outside the project root
				// (e.g. `~shared/...metadata.json` → `/@fs/.../tools/...json`).
				// Without this branch the next `else if` would `path.join` the
				// `/@fs/...` URL onto `projectRoot`, collapsing the leading `/`
				// and producing a malformed nested path that always misses on
				// `existsSync` and triggers a `ReferenceError` at runtime when
				// the JSON-import-failed comment leaves the binding undefined.
				fullPath = cleanPath.slice('/@fs'.length);
			} else if (cleanPath.startsWith('/')) {
				// Absolute from project root
				fullPath = path.join(projectRoot, cleanPath);
			} else if (cleanPath.startsWith('./') || cleanPath.startsWith('../')) {
				// Relative to importer - resolve from importer's location in project
				const importerFullPath = path.join(projectRoot, importerDir);
				fullPath = path.resolve(importerFullPath, cleanPath);
			} else {
				// Skip node_modules JSON imports
				return match;
			}

			if (existsSync(fullPath)) {
				const jsonContent = readFileSync(fullPath, 'utf-8');
				if (verbose) {
					console.log(`[rewrite] JSON inline: ${jsonPath} → const ${varName} = {...}`);
				}
				// Inline the JSON as a const declaration
				return `const ${varName} = ${jsonContent};`;
			} else {
				console.warn(`[rewrite] JSON file not found: ${fullPath} (specifier=${jsonPath})`);
			}
		} catch (error) {
			console.warn(`[rewrite] Could not inline JSON import: ${jsonPath}`, error);
		}

		// If we can't inline it, remove the import to prevent runtime errors
		// The code will fail with "varName is not defined" which is more debuggable
		return `/* JSON import failed: ${match} */`;
	});

	// Helper to resolve .vue file imports to absolute project paths
	const resolveVueKey = (spec: string): string | null => {
		if (!spec || typeof spec !== 'string') {
			return null;
		}

		// Only process .vue files
		if (!PAT.VUE_FILE_PATTERN.test(spec)) {
			return null;
		}

		let key: string;
		if (spec.startsWith('/')) {
			key = spec;
		} else if (spec.startsWith('./') || spec.startsWith('../')) {
			key = path.posix.normalize(path.posix.join(importerDir, spec));
			if (!key.startsWith('/')) key = '/' + key;
		} else {
			return null;
		}

		// Strip query params
		key = key.replace(PAT.QUERY_PATTERN, '');
		return key;
	};

	// Replacement function for all imports
	const replaceVueImport = (_match: string, prefix: string, spec: string, suffix: string): string => {
		// Safety check
		if (!spec || typeof spec !== 'string') {
			return `${prefix}${spec}${suffix}`;
		}

		// Guard 0: leave fully-qualified HTTP(S) URLs alone
		if (/^https?:\/\//.test(spec)) {
			return `${prefix}${spec}${suffix}`;
		}

		// Guard: anomalous bare '@' spec should be rewritten to a safe stub module.
		// This can surface from upstream alias mishaps; mapping it here avoids device-side
		// "instantiate failed @" errors.
		if (spec === '@') {
			const stub = `/ns/m/__invalid_at__.mjs`;
			if (verbose) {
				console.warn(`[rewrite] mapped bare '@' spec to stub: ${stub}`);
			}
			return `${prefix}${stub}${suffix}`;
		}

		spec = normalizeNativeScriptCoreSpecifier(spec);

		// Pull `/@fs/<abs-path>` URLs back into the `/ns/m/` pipeline so they
		// hit our CJS/UMD-wrapping handler. Vite emits `/@fs/...` for any
		// resolved id outside the configured `root` — including hoisted
		// `node_modules/<pkg>` entries and workspace libs in monorepos. Left
		// untouched, the device fetches them through Vite's standard
		// middleware which never invokes `wrapCommonJsModuleForDevice`, so a
		// UMD module like papaparse crashes on `(this).Papa = factory()`
		// because top-level `this` is `undefined` in ESM context.
		if (spec.startsWith('/@fs/')) {
			const rewritten = rewriteFsAbsoluteToNsM(spec, projectRoot, monorepoWorkspaceRootForRewrite);
			if (rewritten) {
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${rewritten}${suffix}`;
				}
				return `${prefix}${rewritten}${suffix}`;
			}
			// Path resolves outside both roots — leave Vite's URL alone as a
			// last resort. The original behaviour was to fall through here
			// and let downstream branches (e.g. `normalizeNodeModulesSpecifier`)
			// handle paths whose abs form happens to contain `/node_modules/`,
			// so preserve that for the unrewritable case below.
		}

		// Route Vite virtual modules (/@solid-refresh, etc.) through /ns/m/ so their
		// internal imports (e.g. solid-js) get vendor-rewritten by our pipeline.
		// Skip known Vite internals (/@vite/, /@id/) which are handled elsewhere.
		// `/@fs/` is intentionally excluded above; if we ever reach here with a
		// `/@fs/` spec it means the rewrite-to-`/ns/m/` pass couldn't anchor it
		// under projectRoot or workspaceRoot, so we fall through and rely on the
		// `normalizeNodeModulesSpecifier` branch below for paths that still
		// contain a `/node_modules/<pkg>/` segment.
		if (spec.startsWith('/@') && !/^\/@(?:vite|id|fs)\//.test(spec)) {
			const out = `/ns/m${spec}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${out}${suffix}`;
			}
			return `${prefix}${out}${suffix}`;
		}

		// Route internal NS endpoints to absolute HTTP origin for device
		if (spec.startsWith('/ns/')) {
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${spec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}

		if (isNativeScriptCoreModule(spec)) {
			return `${prefix}${spec}${suffix}`;
		}

		const nodeModulesSpecifier = normalizeNodeModulesSpecifier(spec);
		const normalizedRuntimePluginSpec = nodeModulesSpecifier || spec.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '');
		if (normalizedRuntimePluginSpec && mixedRuntimePluginHttpRootPackages.size > 0) {
			const { packageName } = resolveNodeModulesPackageBoundary(normalizedRuntimePluginSpec, projectRoot);
			if (packageName && mixedRuntimePluginHttpRootPackages.has(packageName)) {
				const httpNodeModulesSpecifier = nodeModulesSpecifier || normalizedRuntimePluginSpec;
				const httpSpec = `/ns/m/node_modules/${httpNodeModulesSpecifier}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
		}

		if (shouldPreserveBareRuntimePluginSubpathImport(spec, projectRoot)) {
			const httpSpec = `/ns/m/node_modules/${spec.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '')}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
			}
			return `${prefix}${httpSpec}${suffix}`;
		}

		const candidateNativeScriptSpec = nodeModulesSpecifier ?? spec;

		// ── Node modules routing ──────────────────────────────────────
		// Uses the package's own package.json exports field to determine
		// whether an import is the main entry (→ vendor bridge) or a
		// subpath entry (→ HTTP). This replaces the old heuristic-based
		// approach that tried to guess from file paths.
		if (nodeModulesSpecifier) {
			const vendorRouting = resolveVendorRouting(nodeModulesSpecifier, projectRoot);
			if (vendorRouting) {
				if (vendorRouting.route === 'vendor') {
					return `${prefix}${vendorRouting.bareSpec}${suffix}`;
				}
				// Vendor package but subpath/platform-specific → HTTP
				const httpSpec = `/ns/m/node_modules/${nodeModulesSpecifier}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
			// Not a vendor package → serve via HTTP from Vite dev server
			const httpSpec = `/ns/m/node_modules/${nodeModulesSpecifier}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
			}
			return `${prefix}${httpSpec}${suffix}`;
		}

		// Handle .vue imports
		if (PAT.VUE_FILE_PATTERN.test(spec)) {
			// Case A: SFC submodule variant (template/script) must keep its query to avoid self-import cycles.
			const isVueVariant = /\bvue&type=/.test(spec);
			if (isVueVariant) {
				// Preserve the full ?vue&type=... query and route via /ns/sfc so sanitation applies
				const qIdx = spec.indexOf('?');
				const base = qIdx !== -1 ? spec.slice(0, qIdx) : spec;
				const query = qIdx !== -1 ? spec.slice(qIdx) : '';
				// Resolve to absolute project path if relative
				let abs = base;
				if (!abs.startsWith('/')) {
					const joined = path.posix.normalize(path.posix.join(importerDir, abs));
					abs = joined.startsWith('/') ? joined : `/${joined}`;
				}
				const out = `/ns/sfc${abs}${query}`;
				if (verbose) {
					console.log(`[rewrite] .vue variant routed (http): ${spec} → ${out}`);
				}
				return `${prefix}${out}${suffix}`;
			}
			// Case B: plain .vue module → rewrite to SFC endpoint or local artifact
			const vueKey = resolveVueKey(spec.replace(PAT.QUERY_PATTERN, '')) || '';
			if (vueKey) {
				if (true) {
					const absVue = vueKey.startsWith('/') ? vueKey : '/' + vueKey;
					const out = `/ns/sfc${absVue}`;
					if (verbose) {
						console.log(`[rewrite] .vue rewrite (http): ${spec} → ${out}`);
					}
					return `${prefix}${out}${suffix}`;
				} else {
					const vueFile = sfcFileMap.get(vueKey);
					if (vueFile) {
						const target = `_ns_hmr/${APP_ROOT_DIR}/sfc/${vueFile}`;
						const relPath = importerOutDir ? ensureRel(path.posix.relative(importerOutDir, target)) : ensureRel(target);
						if (verbose) {
							console.log(`[rewrite] .vue rewrite: ${spec} → ${relPath}`);
						}
						return `${prefix}${relPath}${suffix}`;
					} else if (verbose) {
						console.log(`[rewrite] .vue NOT in sfcFileMap: ${vueKey}`);
					}
				}
			}
			return `${prefix}${spec}${suffix}`;
		}

		// Rewrite relative application imports to HTTP for served modules
		if (spec.startsWith('./') || spec.startsWith('../')) {
			const absMaybe = normalizeImportPath(spec, importerDir);
			const nodeModulesHttpSpec = absMaybe ? toNodeModulesHttpModuleId(absMaybe) : null;
			if (nodeModulesHttpSpec) {
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic relative node_modules import → ${nodeModulesHttpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(nodeModulesHttpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] relative node_modules import → ${nodeModulesHttpSpec} (from ${spec})`);
				return `${prefix}${nodeModulesHttpSpec}${suffix}`;
			}
			const baseId = absMaybe ? toAppModuleBaseId(absMaybe, projectRoot) : null; // e.g. /src/foo.mjs
			if (baseId) {
				const httpSpec = `/ns/m${baseId}`;
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic relative app import → ${httpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(httpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] relative app import → ${httpSpec} (from ${spec})`);
				return `${prefix}${httpSpec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}
		// Note: Do NOT rewrite bare application specifiers (e.g. "core/foo").
		// These will be inlined during bundleDependenciesInline() to avoid static HTTP imports on device.
		if (isApplicationImport(spec)) {
			const baseId = toAppModuleBaseId(spec, projectRoot);
			if (baseId) {
				const httpSpec = `/ns/m${baseId}`;
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic app import → ${httpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(httpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] absolute app import → ${httpSpec} (from ${spec})`);
				return `${prefix}${httpSpec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}

		// In HTTP mode, avoid rewriting to dep-*.mjs; let imports resolve via server endpoints
		const depKey = normalizeImportPath(spec, importerDir);
		if (depKey && !httpOriginSafe) {
			if (isNativeScriptCoreModule(depKey)) {
				return `${prefix}${spec}${suffix}`;
			}
			if (isNativeScriptPluginModule(depKey)) {
				return `${prefix}${spec}${suffix}`;
			}
			const depFile = findDependencyFileName(depFileMap, depKey);
			if (depFile) {
				if (verbose) {
					console.log(`[rewrite] dep import: ${spec} → ./${depFile}`);
				}
				return `${prefix}./${depFile}${suffix}`;
			}
		}

		// ── Bare specifier vendor routing ────────────────────────────
		// Bare specifiers like `pinia`, `dayjs`, `lodash` never reach
		// the `nodeModulesSpecifier` branch above because
		// `normalizeNodeModulesSpecifier` keys on a literal
		// `/node_modules/` segment in the path. Without this check
		// they'd fall straight into the HTTP fallback below and get
		// rewritten to `/ns/m/node_modules/<spec>`, which serves the
		// package source over HTTP and bypasses the device-side import
		// map's `<pkg>` → `ns-vendor://<pkg>` entry. For CJS/UMD
		// packages (e.g. Pinia) the bare HTTP path doesn't expose the
		// full named-exports surface (only the default export round-
		// trips), so consumers like
		// `import { defineStore } from "pinia"` blow up at instantiate
		// time with `SyntaxError: ... does not provide an export named
		// 'defineStore'`. Preserving the bare spec lets the vendor
		// bridge serve it from the prebuilt `bundle.mjs`, which already
		// re-exports the full CJS surface. Subpath imports
		// (`pinia/plugins/foo`) intentionally fall through to the
		// HTTP fallback — `resolveVendorRouting` returns
		// `{ route: 'http' }` for non-main-entry subpaths even when the
		// root package is in the manifest, mirroring the
		// `nodeModulesSpecifier` branch.
		if (spec && !spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../') && !/^https?:\/\//i.test(spec) && !spec.startsWith('ns-vendor:') && !spec.startsWith('@nativescript/core')) {
			const bareNpmRe = /^(?:@[A-Za-z0-9][\w.-]*\/)?[A-Za-z0-9][\w.-]*(?:\/[\w.\-/]+)?$/;
			if (bareNpmRe.test(spec)) {
				const bareVendorRouting = resolveVendorRouting(spec, projectRoot);
				if (bareVendorRouting?.route === 'vendor') {
					if (verbose) {
						console.log(`[rewrite] bare vendor import: ${spec} → ${bareVendorRouting.bareSpec}`);
					}
					return `${prefix}${bareVendorRouting.bareSpec}${suffix}`;
				}
			}
		}

		// Bare npm package specifier fallback — route to /ns/m/node_modules/.
		// This catches specifiers like `source-map-js/lib/source-map-generator.js`
		// emitted by helpers such as the CommonJS compat transform, which Vite
		// would normally resolve to an absolute path but which pass through the
		// rewriter as bare strings here. Under HMR (core external) bundle.mjs
		// depends on these resolving over HTTP rather than via a filesystem
		// bare-specifier lookup, which iOS can't satisfy and which crashes with
		// "Module not found".
		if (spec && !spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../') && !/^https?:\/\//i.test(spec) && !spec.startsWith('ns-vendor:') && !spec.startsWith('@nativescript/core')) {
			// Only treat as a package spec if it looks like one — disallow
			// plain identifiers like `moment` unresolved (those are left alone
			// for existing vendor-routing paths to handle).
			const bareNpmRe = /^(?:@[A-Za-z0-9][\w.-]*\/)?[A-Za-z0-9][\w.-]*(?:\/[\w.\-/]+)?$/;
			if (bareNpmRe.test(spec)) {
				const httpSpec = `/ns/m/node_modules/${spec}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
		}

		// Leave everything else unchanged (vendor imports, etc.)
		return `${prefix}${spec}${suffix}`;
	};

	// Apply to all import/export patterns (but only .vue files will be rewritten)
	result = result.replace(PAT.IMPORT_PATTERN_1, replaceVueImport);
	result = result.replace(PAT.IMPORT_PATTERN_2, replaceVueImport);
	result = result.replace(PAT.EXPORT_PATTERN, replaceVueImport);
	result = result.replace(PAT.IMPORT_PATTERN_3, replaceVueImport);
	// Side-effect imports (import "spec") — must run AFTER named-import patterns
	// since IMPORT_PATTERN_1 already handles `import ... from "spec"`.
	result = result.replace(PAT.IMPORT_PATTERN_SIDE_EFFECT, replaceVueImport);
	result = ensureDynamicHmrImportHelper(result);

	// Extra guard: map any lingering dynamic import('@') to a safe stub module path
	// to prevent device runtime normalization errors.
	// Example matched: import('@') or import("@") with optional whitespace before closing paren
	result = result.replace(/(import\(\s*['"])@(['"]\s*\))/g, (_m) => {
		const stubExpr = `import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href)`;
		if (verbose) {
			console.warn(`[rewrite] mapped dynamic import('@') to /ns/m/__invalid_at__.mjs via import.meta.url`);
		}
		return stubExpr;
	});

	// Also guard static spec forms that could erroneously be '@'
	// 1) ESM: import { x } from '@'
	result = result.replace(/(from\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			console.warn(`[rewrite] mapped static from '@' to ${stub}`);
		}
		return `${p1}${stub}${p2}`;
	});
	// 2) ESM side-effect: import '@'
	result = result.replace(/(import\s*(?!\()\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			console.warn(`[rewrite] mapped side-effect import '@' to ${stub}`);
		}
		return `${p1}${stub}${p2}`;
	});

	// Handle .vue imports with queries
	// In HTTP mode, skip legacy local-path rewrite to avoid mixing module origins
	result = result.replace(PAT.VUE_FILE_IMPORT, (_m, p1, spec, p3) => {
		if (httpOrigin) {
			if (isNsSfcSpecifier(spec)) {
				if (verbose) console.log(`[rewrite] .vue already routed (VUE_FILE_IMPORT http): ${spec}`);
				return `${p1}${spec}${p3}`;
			}
			// Route via /ns/sfc with full query preserved
			try {
				let base = spec;
				const qIdx = base.indexOf('?');
				const query = qIdx !== -1 ? base.slice(qIdx) : '';
				base = qIdx !== -1 ? base.slice(0, qIdx) : base;
				// Resolve relative to importerDir
				let abs = base;
				if (!abs.startsWith('/')) {
					const joined = path.posix.normalize(path.posix.join(importerDir, abs));
					abs = joined.startsWith('/') ? joined : '/' + joined;
				}
				const out = `/ns/sfc${abs}${query}`;
				if (verbose) console.log(`[rewrite] .vue variant routed (VUE_FILE_IMPORT http): ${spec} → ${out}`);
				return `${p1}${out}${p3}`;
			} catch {}
			return `${p1}${spec}${p3}`;
		}
		const vueKey = resolveVueKey(spec);
		if (vueKey) {
			const vueFile = sfcFileMap.get(vueKey);
			if (vueFile) {
				const target = `_ns_hmr/${APP_ROOT_DIR}/sfc/${vueFile}`;
				const relPath = importerOutDir ? ensureRel(path.posix.relative(importerOutDir, target)) : ensureRel(target);
				if (verbose) {
					console.log(`[rewrite] .vue rewrite (VUE_FILE_IMPORT): ${spec} → ${relPath}`);
				}
				return `${p1}${relPath}${p3}`;
			} else if (verbose) {
				console.log(`[rewrite] .vue NOT in sfcFileMap (VUE_FILE_IMPORT): ${vueKey}`);
			}
		}
		return `${p1}${spec}${p3}`;
	});

	// Final safeguard: normalize any remaining absolute filesystem dynamic imports to HTTP origin spec
	const absoluteDynamicPattern = /(import\(\s*["'])([^"']+)(["']\s*\))/g;
	result = result.replace(absoluteDynamicPattern, (match, _prefix, spec, _suffix) => {
		if (!spec || !spec.startsWith('/')) return match;
		// Handle internal NS endpoints
		if (spec.startsWith('/ns/')) {
			const expr = `import(new URL('${spec}', import.meta.url).href)`;
			if (verbose) console.log(`[rewrite][http] internal ns import (dynamic) → ${spec} via import.meta.url`);
			return expr;
		}
		const nodeModulesHttpSpec = toNodeModulesHttpModuleId(spec);
		if (nodeModulesHttpSpec) {
			const expr = `import(new URL('${nodeModulesHttpSpec}', import.meta.url).href)`;
			if (verbose) console.log(`[rewrite][http] absolute dynamic node_modules import → ${nodeModulesHttpSpec} via import.meta.url (from ${spec})`);
			return expr;
		}
		const baseId = toAppModuleBaseId(spec, projectRoot);
		if (!baseId) return match;
		const expr = `import(new URL('/ns/m${baseId}', import.meta.url).href)`;
		if (verbose) console.log(`[rewrite][http] absolute dynamic import → /ns/m${baseId} via import.meta.url (from ${spec})`);
		return expr;
	});

	return result;
}

// Plugin
function createHmrWebSocketPlugin(opts: { verbose?: boolean }, strategy: FrameworkServerStrategy): Plugin {
	const verbose = !!opts.verbose;
	let wss: WebSocketServer | null = null;
	let sharedTransformRequest!: SharedTransformRequestRunner;
	const pendingAngularReloadSuppressions = new Map<string, PendingAngularReloadSuppressionEntry>();
	const sfcFileMap = new Map<string, string>();
	const depFileMap = new Map<string, string>();
	// Generic module manifest (spec -> emitted relative .mjs path)
	// Populated lazily on-demand via ns:fetch-module responses and broadcast to clients.
	// Enables clients to short-circuit fetches for already-known modules and aids
	// consistent path normalization across reconnects.
	const moduleManifest = new Map<string, string>();
	let registrySent = false;
	let vendorBootstrapDone = false;
	let pluginRoot: string | undefined;
	// HMR module graph (spec -> deps/hash) with version tagging and delta/full
	// broadcasts. `wss`/`pluginRoot` are read lazily via accessors because both
	// are established later, during configureServer.
	const moduleGraph = new HmrModuleGraph({
		verbose,
		strategy,
		getWss: () => wss,
		getPluginRoot: () => pluginRoot,
	});
	// Tracks the background initial-graph population so handleHotUpdate can
	// await completion before computing delta roots for the first HMR event.
	let graphInitialPopulationPromise: Promise<void> | null = null;
	// Cold-boot /ns/m request counter — populated the first time a /ns/m
	// request arrives, finalized when the request window goes idle.
	// See Shared across requests so a single counter spans the whole cold boot.
	let coldBootCounter: ColdBootRequestCounter | null = null;
	function rememberAngularReloadSuppression(root: string, file: string, ttlMs = 3000) {
		const absPath = normalizeHotReloadMatchPath(file);
		const relPath = normalizeHotReloadMatchPath(file, root);
		pendingAngularReloadSuppressions.set(absPath, {
			absPath,
			relPath,
			expiresAt: Date.now() + ttlMs,
		});
	}
	function pruneAngularReloadSuppressions(now = Date.now()) {
		for (const [key, entry] of pendingAngularReloadSuppressions) {
			if (!entry || entry.expiresAt <= now) {
				pendingAngularReloadSuppressions.delete(key);
			}
		}
	}
	function isTypescriptFlavor(): boolean {
		try {
			return strategy?.flavor === 'typescript';
		} catch {
			return false;
		}
	}
	async function populateInitialGraph(server: ViteDevServer) {
		if (moduleGraph.size) return; // already populated
		const tStart = Date.now();
		const versionAtStart = moduleGraph.version;
		const root = server.config.root || process.cwd();
		// Avoid direct require in ESM build: lazily obtain fs & path via createRequire or dynamic import
		let fs: typeof import('fs');
		let pathMod: typeof import('path');
		try {
			// Prefer createRequire to stay synchronous
			const req = createRequire(import.meta.url);
			fs = req('fs');
			pathMod = req('path');
		} catch {
			// Fallback to dynamic imports (should not normally happen)
			fs = await import('fs');
			pathMod = await import('path');
		}
		// Route every bulk transform through `sharedTransformRequest` when it's
		// already been wired up — this way the background walk shares the 60s
		// TTL cache with live /ns/m requests, so the device sees cached results
		// for any file the walker already visited. The fallback keeps the
		// walker working during server tests where the shared runner isn't
		// constructed yet.
		const bulkTransform: (rel: string) => Promise<{ code?: string } | null | undefined> = (rel) => {
			if (sharedTransformRequest) {
				return sharedTransformRequest(rel) as Promise<{ code?: string } | null | undefined>;
			}
			return server.transformRequest(rel) as Promise<{ code?: string } | null | undefined>;
		};
		async function walk(dir: string) {
			for (const name of fs.readdirSync(dir)) {
				if (name === 'node_modules' || name.startsWith('.') || shouldSkipRuntimeGraphDirectoryName(name)) continue;
				const full = pathMod.join(dir, name);
				try {
					const stat = fs.statSync(full);
					if (stat.isDirectory()) await walk(full);
					else if (stat.isFile()) {
						if (shouldIncludeRuntimeGraphFile(full, /\.(vue|ts|js|mjs|tsx|jsx)$/i)) {
							const rel = '/' + pathMod.relative(root, full).split(pathMod.sep).join('/');
							// Transform via Vite to gather deps (ignore failures)
							try {
								const transformed = await bulkTransform(rel);
								const code = transformed?.code || '';
								const deps: string[] = [];
								// fallback to import relationships via moduleGraph
								const modNode = server.moduleGraph.getModuleById(full) || server.moduleGraph.getModuleById(rel);
								if (modNode) {
									for (const m of modNode.importedModules) {
										if (m.id) deps.push(m.id.split('?')[0]);
									}
								}
								// bumpVersion: false — the initial walk is a bulk load, not a live
								// edit. Keeping graphVersion stable during cold boot avoids double
								// cache-key drift.
								moduleGraph.upsert(rel, code, deps, { bumpVersion: false });
							} catch {}
						}
					}
				} catch {}
			}
		}
		try {
			await walk(pathMod.join(root, 'src'));
		} catch {}
		// Diagnostic summary. Gated behind the verbose flag so the
		// dev console stays quiet on a normal save. Flip
		// NS_VITE_VERBOSE=1 to surface slow cold-boot walks; a
		// `bumpedVersion=no` result is the happy path, `yes`
		// indicates a regression.
		if (verbose) {
			console.info(
				formatPopulateInitialGraphSummary({
					moduleCount: moduleGraph.size,
					durationMs: Date.now() - tStart,
					graphVersion: moduleGraph.version,
					bumpedVersion: moduleGraph.version !== versionAtStart,
				}),
			);
		}
	}
	// Kick off `populateInitialGraph` in the background (non-awaited) so /ns/m
	// responses are never blocked on a full tree walk. Returns the shared
	// promise so hot-update code paths can await completion before computing
	// delta roots for the first HMR event.
	function ensureInitialGraphPopulationStarted(server: ViteDevServer): Promise<void> {
		if (graphInitialPopulationPromise) {
			return graphInitialPopulationPromise;
		}
		if (moduleGraph.size) {
			graphInitialPopulationPromise = Promise.resolve();
			return graphInitialPopulationPromise;
		}
		graphInitialPopulationPromise = populateInitialGraph(server).catch((error) => {
			if (verbose) console.warn('[hmr-ws][graph] background initial population failed', error);
		});
		return graphInitialPopulationPromise;
	}
	return {
		name: 'nativescript-hmr-websocket',
		apply: 'serve',

		configureServer(server) {
			pluginRoot = server.config?.root || process.cwd();
			const httpServer = server.httpServer;
			if (!httpServer) return;
			const wsAny = server.ws as any;
			if (!wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__) {
				const originalSend = server.ws.send.bind(server.ws);
				wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__ = true;
				// Bridge Vite's stock WS broadcasts (`server.ws.send(...)`)
				// to our `/ns-hmr` WebSocket. Vite v8 keeps two completely
				// separate `WebSocketServer` instances: its own (default
				// path `/`, accepting `vite-hmr`/`vite-ping` protocols) and
				// ours (`/ns-hmr`, where the iOS device actually connects).
				// Plugin-emitted events like Analog's
				// `server.ws.send('angular:component-update', { id, ts })`
				// flow through Vite's `normalizedHotChannel.send` →
				// `wss.clients.forEach`, but those `wss.clients` are
				// EMPTY in NativeScript dev — the device never speaks the
				// `vite-hmr` protocol nor connects to `/`. Without a
				// bridge, every plugin-emitted custom event is logged on
				// the server (e.g. `(client) hmr update <html>`) but
				// silently dropped before reaching the device. Symptom:
				// the iOS HMR-applying overlay sticks at 5%
				// ("Preparing update") forever because Angular's compiled
				// `import.meta.hot.on('angular:component-update', cb)`
				// listeners never fire. We mirror the payload onto our
				// `/ns-hmr` clients here so the existing custom-event
				// dispatcher in `hmr/client/index.ts` (which forwards to
				// `__NS_DISPATCH_HOT_EVENT__`) actually runs.
				const bridgeToNsHmrClients = (payload: any, args: any[]): void => {
					try {
						let normalized: any;
						if (typeof args[0] === 'string') {
							normalized = { type: 'custom', event: args[0], data: args[1] };
						} else {
							normalized = payload;
						}
						if (!normalized) return;
						// Vite's stock `update` payload includes per-module
						// HMR boundary info that our device-side client
						// has no handler for (we drive HMR via our own
						// `ns:angular-update`/`ns:hmr-delta`/`ns:css-updates`
						// messages). Forwarding it would just look like
						// noise to the client. Custom events
						// (`type: 'custom'`) — including
						// `angular:component-update` and Analog's
						// CSS-direct/inline `update` shorthand — DO need
						// to reach the device, since they drive the
						// in-place `ɵɵreplaceMetadata` template-swap path.
						// Filter the relay to those.
						if (normalized.type !== 'custom') return;
						const stringified = JSON.stringify(normalized);
						let recipients = 0;
						wss?.clients.forEach((client: any) => {
							try {
								if (client && client.readyState === 1) {
									client.send(stringified);
									recipients++;
								}
							} catch {}
						});
						if (verbose) {
							const event = (normalized as any)?.event;
							console.log(`[hmr-ws][bridge] forwarded ${normalized.type}${event ? `:${event}` : ''} payload to ${recipients} /ns-hmr client(s)`);
						}
					} catch (err) {
						if (verbose) {
							console.warn('[hmr-ws][bridge] failed to forward payload to /ns-hmr clients', err);
						}
					}
				};
				server.ws.send = ((payload: any, ...rest: any[]) => {
					pruneAngularReloadSuppressions();
					if (
						shouldSuppressViteFullReloadPayload({
							payload,
							pendingEntries: pendingAngularReloadSuppressions.values(),
							root: pluginRoot,
						})
					) {
						if (verbose) {
							console.log('[hmr-ws][angular] suppressed vite full-reload payload', payload);
						}
						return;
					}

					bridgeToNsHmrClients(payload, [payload, ...rest]);
					return originalSend(payload, ...rest);
				}) as typeof server.ws.send;
			}
			// Transform concurrency. Historically we defaulted to 1 to avoid
			// race conditions during HTTP HMR startup, but the shared runner
			// already has per-URL coalescing and an async-cached result map,
			// so higher fan-out is safe and dramatically reduces cold-boot
			// time. We cap at 8 by default to match typical dev machines and
			// respect Vite's internal worker pool limits. Override via the
			// `NS_VITE_HMR_TRANSFORM_CONCURRENCY` env var when needed.
			const configuredTransformConcurrency = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CONCURRENCY || '', 10);
			const transformConcurrency = Number.isFinite(configuredTransformConcurrency) && configuredTransformConcurrency > 0 ? configuredTransformConcurrency : 8;
			// Keep transformed code cached for longer across HMR updates so
			// that unchanged neighbours of an edited file don't re-run
			// through the Angular/TypeScript/Vite transform pipeline. The
			// HMR flow explicitly invalidates affected URLs, so a longer TTL
			// is safe. Override with `NS_VITE_HMR_TRANSFORM_CACHE_MS`.
			const configuredTransformCacheMs = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CACHE_MS || '', 10);
			const transformCacheMs = Number.isFinite(configuredTransformCacheMs) && configuredTransformCacheMs >= 0 ? configuredTransformCacheMs : 60000;
			sharedTransformRequest = createSharedTransformRequestRunner(
				(url) => server.transformRequest(url),
				(url, timeoutMs) => {
					console.warn('[ns:m] slow transformRequest for', url, '(>' + timeoutMs + 'ms)');
				},
				{
					maxConcurrent: transformConcurrency,
					resultCacheTtlMs: transformCacheMs,
					getResultCacheKey: (url) => canonicalizeTransformRequestCacheKey(url, pluginRoot || process.cwd()),
				},
			);

			// Always-on startup banner — prints once per dev server process
			// so anyone investigating perf can immediately see which build
			// is live and what knobs are active.
			try {
				let pkgVersion = 'unknown';
				try {
					const req = createRequire(import.meta.url);
					const pkg = req('@nativescript/vite/package.json');
					if (pkg && typeof pkg.version === 'string') pkgVersion = pkg.version;
				} catch {
					// `@nativescript/vite/package.json` is not always exported; fall
					// back to reading the file from disk next to this module.
					try {
						const here = new URL(import.meta.url).pathname;
						const pkgPath = path.resolve(path.dirname(here), '..', '..', 'package.json');
						if (existsSync(pkgPath)) {
							const parsed = JSON.parse(readFileSync(pkgPath, 'utf-8'));
							if (parsed && typeof parsed.version === 'string') pkgVersion = parsed.version;
						}
					} catch {}
				}
				if (verbose) {
					console.info(
						formatServerStartupBanner({
							version: pkgVersion,
							transformConcurrency,
							transformCacheMs,
							lazyInitialGraph: true,
							graphVersion: moduleGraph.version,
						}),
					);
				}
			} catch {}

			// Always-on cold-boot request trace. Runs in front of every
			// other middleware so it catches all NS dev routes (/ns/m/*,
			// /ns/rt/*, /ns/core/*, /__ns_boot__/*, etc.) with a single
			// hook. Closes itself after an idle window so HMR edits don't
			// get rolled into the cold-boot numbers. The idle window is
			// generous by default (5s) because V8's HTTP ESM resolver
			// pauses between dep levels while parsing — a too-tight window
			// was closing after the first wave and under-reporting boot by
			// 100x. Override via `NS_VITE_HMR_BOOT_TRACE_IDLE_MS` when
			// profiling something tricky.
			try {
				const configuredIdleMs = Number.parseInt(process.env.NS_VITE_HMR_BOOT_TRACE_IDLE_MS || '', 10);
				const idleWindowMs = Number.isFinite(configuredIdleMs) && configuredIdleMs > 0 ? configuredIdleMs : 5000;
				const configuredSummaryEvery = Number.parseInt(process.env.NS_VITE_HMR_BOOT_TRACE_PROGRESS_EVERY || '', 10);
				const summaryEvery = Number.isFinite(configuredSummaryEvery) && configuredSummaryEvery >= 0 ? configuredSummaryEvery : 25;
				if (!coldBootCounter) {
					coldBootCounter = createColdBootRequestCounter({
						summaryEvery,
						idleWindowMs,
						// Gated on the verbose flag so cold-boot progress and
						// the final window-closed summary stay quiet by
						// default. Flip NS_VITE_VERBOSE=1 to surface them.
						log: (line) => {
							if (!verbose) return;
							console.info(line);
						},
					});
				}
			} catch {}
			server.middlewares.use((req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					const route = classifyBootRoute(urlObj.pathname);
					if (route === 'other') return next();
					if (!coldBootCounter) return next();
					const handle = coldBootCounter.record(urlObj.pathname);
					const finishOnce = () => {
						try {
							handle.finish();
						} catch {}
					};
					try {
						res.once('finish', finishOnce);
						res.once('close', finishOnce);
					} catch {}
				} catch {}
				next();
			});

			// Give `populateInitialGraph` a head start. Previously this only
			// kicked off on the first /ns/m hit, which meant populate was
			// competing with the device for the same 8 transform slots
			// throughout the first 4-5 seconds of cold boot. Starting at
			// `configureServer` time gives populate the full app
			// build/launch window (typically 2-3s on simulator) as a head
			// start, so more of its work lands before the device even
			// connects. Disable via `NS_VITE_HMR_DISABLE_POPULATE=1` when
			// profiling whether populate is helping or hurting a specific
			// app.
			try {
				const disablePopulate = process.env.NS_VITE_HMR_DISABLE_POPULATE === '1' || process.env.NS_VITE_HMR_DISABLE_POPULATE === 'true';
				if (disablePopulate) {
					if (verbose) console.info('[hmr-ws][populate] disabled via NS_VITE_HMR_DISABLE_POPULATE');
					// Short-circuit: mark as resolved so /ns/m never schedules it and
					// HMR still works (handleHotUpdate just has no pre-warmed graph).
					graphInitialPopulationPromise = Promise.resolve();
				} else {
					ensureInitialGraphPopulationStarted(server);
				}
			} catch {}

			// Attempt early vendor manifest bootstrap once per server.
			if (!vendorBootstrapDone) {
				vendorBootstrapDone = true;
				const root = server.config?.root || process.cwd();
				const existing = getVendorManifest();
				if (!existing) {
					const loaded = loadPrebuiltVendorManifest(root, verbose);
					if (!loaded && verbose) {
						console.warn('[hmr-ws][vendor] No vendor manifest found during bootstrap. Consider enabling vendorManifestPlugin earlier.');
					}
				} else if (verbose) {
					console.log('[hmr-ws][vendor] Manifest already present with', Object.keys(existing.modules).length, 'modules');
				}
				(globalThis as any).__NS_VENDOR_MANIFEST__ = getVendorManifest();
			}

			// Disable perMessageDeflate to avoid any extension negotiation quirks with native clients
			wss = new WebSocketServer({
				noServer: true,
				path: '/ns-hmr',
				perMessageDeflate: false,
			});

			if (verbose) {
				console.log('[hmr-ws] WebSocket configured on /ns-hmr');
			}

			httpServer.on('upgrade', (request, socket, head) => {
				try {
					if (verbose) {
						const ra = (request.socket as any)?.remoteAddress;
						const rp = (request.socket as any)?.remotePort;
						console.log('[hmr-ws][upgrade]', request.url, 'from', ra + (rp ? ':' + rp : ''));
					}
				} catch {}
				const pathname = new URL(request.url || '', 'http://localhost').pathname;
				if (pathname === '/ns-hmr') {
					wss?.handleUpgrade(request, socket, head, (ws) => {
						wss?.emit('connection', ws, request);
					});
				}
			});

			// Additional connection diagnostics
			wss.on('connection', (ws, req) => {
				const role = getHmrSocketRoleFromRequestUrl(req.url);
				(ws as any).__nsHmrClientRole = role;
				try {
					if (verbose) {
						const ra = (req.socket as any)?.remoteAddress;
						const rp = (req.socket as any)?.remotePort;
						console.log('[hmr-ws] Client connected', { role, remote: ra + (rp ? ':' + rp : '') });
					}
				} catch {}
				ws.on('close', () => {
					try {
						if (verbose) {
							const ra = (req.socket as any)?.remoteAddress;
							const rp = (req.socket as any)?.remotePort;
							console.log('[hmr-ws] Client disconnected', { role, remote: ra + (rp ? ':' + rp : '') });
						}
					} catch {}
				});
			});
			wss.on('error', (err) => {
				console.warn('[hmr-ws] server error:', err?.message || String(err));
			});

			// Import map endpoint: GET /ns/import-map.json
			// Returns the import map + runtime config for __nsConfigureRuntime()
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (urlObj.pathname !== '/ns/import-map.json') return next();

					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
					if (req.method === 'OPTIONS') {
						res.statusCode = 204;
						res.end();
						return;
					}

					// Determine origin from request headers or server config
					const host = req.headers.host || 'localhost:5173';
					const protocol = 'http';
					const origin = `${protocol}://${host}`;

					const runtimeConfig = buildRuntimeConfig({
						origin,
						flavor: strategy?.flavor || 'typescript',
					});

					res.setHeader('Content-Type', 'application/json');
					res.end(
						JSON.stringify(
							{
								importMap: JSON.parse(runtimeConfig.importMap),
								volatilePatterns: runtimeConfig.volatilePatterns,
							},
							null,
							2,
						),
					);
				} catch (err: any) {
					console.error('[import-map] error generating import map:', err?.message || err);
					res.statusCode = 500;
					res.end(JSON.stringify({ error: 'Failed to generate import map' }));
				}
			});

			// Dev-only HTTP ESM loader endpoint for device clients
			// 1) Legacy JSON module endpoint (kept temporarily): GET /ns-module?path=/abs -> { path, code, additionalFiles }
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (urlObj.pathname !== '/ns-module') return next();
					// CORS for device access
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
					if (req.method === 'OPTIONS') {
						res.statusCode = 204;
						res.end();
						return;
					}

					let spec = urlObj.searchParams.get('path') || urlObj.searchParams.get('spec') || '';
					if (!spec) {
						res.statusCode = 400;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: 'missing path' }));
						return;
					}
					// Mirror normalization from ws handler
					spec = spec.replace(/[?#].*$/, '');
					if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
					spec = spec.replace(/\/(index)(?:\/(?:index))+$/i, '/$1');
					if (spec.startsWith('./')) spec = spec.slice(1);
					if (!spec.startsWith('/')) spec = '/' + spec;

					// Transform via Vite with variant resolution (same as ws ns:fetch-module)
					const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
					const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
					const transformRoot = server.config?.root || process.cwd();
					const transformWorkspaceRoot = getMonorepoWorkspaceRoot(transformRoot);
					const candidates: string[] = [];
					if (hasExt) candidates.push(spec);
					candidates.push(baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs');
					const transformCandidates = filterExistingNodeModulesTransformCandidates(spec, candidates, transformRoot, transformWorkspaceRoot);
					let transformed: TransformResult | null = null;
					let resolvedCandidate: string | null = null;
					for (const cand of transformCandidates) {
						try {
							const r = await server.transformRequest(cand);
							if (r?.code) {
								transformed = r;
								resolvedCandidate = cand;
								break;
							}
						} catch {}
					}
					if (!transformed?.code) {
						res.statusCode = 404;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: 'transform-failed', path: spec }));
						return;
					}
					let code = transformed.code;
					// Prepend guard to capture any URL-based require attempts
					code = REQUIRE_GUARD_SNIPPET + code;
					// Apply same sanitation/rewrite pipeline used for WS path
					code = cleanCode(code, strategy);
					// preserveVendorImports=true: vendor imports stay as bare specifiers
					// for the device-side import map (ns-vendor://) instead of being
					// transformed to __nsVendorRequire calls with fragile __nsPick lookups.
					code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(resolvedCandidate || spec), resolvedCandidate || spec);
					code = rewriteImports(code, spec, sfcFileMap, depFileMap, server.config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
					code = ensureVariableDynamicImportHelper(code);
					// Enforce upstream guarantee: no optimized deps or virtual ids remain
					try {
						assertNoOptimizedArtifacts(code, `SFC ASM ${spec}`);
					} catch (e) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						return void res.end(JSON.stringify({ error: (e as any)?.message || String(e) }));
					}
					try {
						const origin = getServerOrigin(server);
						code = ensureVersionedRtImports(code, origin, moduleGraph.version);
						code = strategy.ensureVersionedImports?.(code, origin, moduleGraph.version) ?? code;
					} catch {}
					// Compute rel .mjs output path
					const specForRel = resolvedCandidate || spec;
					let rel = specForRel.replace(/^\//, '').replace(/\.(tsx?|jsx?)$/i, '.mjs');
					if (!rel.endsWith('.mjs')) rel += '.mjs';
					// Collect immediate relative .mjs deps similarly
					const additionalFiles: Array<{ path: string; code: string }> = [];
					try {
						const importRE = /from\s+["']([^"']+\.mjs)["']|import\(\s*["']([^"']+\.mjs)["']\s*\)/g;
						const importerDir = path.posix.dirname(specForRel);
						let m: RegExpExecArray | null;
						const seen = new Set<string>();
						while ((m = importRE.exec(code)) !== null) {
							let dep = m[1] || m[2];
							if (!dep) continue;
							if (!(dep.startsWith('./') || dep.startsWith('../'))) continue;
							let abs = path.posix.normalize(path.posix.join(importerDir, dep));
							if (!abs.startsWith('/')) abs = '/' + abs;
							const depBase = abs.replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '');
							if (seen.has(depBase)) continue;
							seen.add(depBase);
							const depCandidates = filterExistingNodeModulesTransformCandidates(depBase, [depBase + '.ts', depBase + '.js', depBase + '.tsx', depBase + '.jsx', depBase + '.mjs', depBase + '.mts', depBase + '.cts', depBase + '.vue', depBase + '/index.ts', depBase + '/index.js', depBase + '/index.tsx', depBase + '/index.jsx', depBase + '/index.mjs'], transformRoot, transformWorkspaceRoot);
							let depTrans: TransformResult | null = null;
							let depResolved: string | null = null;
							for (const c of depCandidates) {
								try {
									const r = await server.transformRequest(c);
									if (r?.code) {
										depTrans = r;
										depResolved = c;
										break;
									}
								} catch {}
							}
							if (depTrans?.code && depResolved) {
								let depCode = depTrans.code;
								depCode = cleanCode(depCode, strategy);
								depCode = processCodeForDevice(depCode, false, true, /(?:^|\/)node_modules\//.test(depResolved), depResolved);
								depCode = rewriteImports(depCode, depResolved, sfcFileMap, depFileMap, server.config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
								depCode = ensureVariableDynamicImportHelper(depCode);
								try {
									assertNoOptimizedArtifacts(depCode, `SFC ASM dep ${depResolved}`);
								} catch (e) {
									/* don't include bad deps */ continue;
								}
								try {
									depCode = ensureVersionedRtImports(depCode, getServerOrigin(server), moduleGraph.version);
									depCode = strategy.ensureVersionedImports?.(depCode, getServerOrigin(server), moduleGraph.version) ?? depCode;
								} catch {}
								let depRel = depResolved.replace(/^\//, '').replace(/\.(tsx?|jsx?)$/i, '.mjs');
								if (!depRel.endsWith('.mjs')) depRel += '.mjs';
								additionalFiles.push({ path: depRel, code: depCode });
							}
						}
					} catch {}
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ path: rel, code, additionalFiles }));
				} catch (e: any) {
					try {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ error: e?.message || String(e) }));
					} catch {}
				}
			});

			// 2) ESM module server for application/source modules: GET /ns/m/* — see websocket-ns-m.ts
			registerNsModuleServerRoute(server, {
				verbose,
				appVirtualWithSlash: APP_VIRTUAL_WITH_SLASH,
				sfcFileMap,
				depFileMap,
				getGraphVersion: () => moduleGraph.version,
				getStrategy: () => strategy,
				getServerOrigin,
				cleanCode,
				processCodeForDevice,
				rewriteImports,
				prepareAngularEntryForDevice,
				sharedTransformRequest,
				collectImportDependencies,
				ensureInitialGraphPopulationStarted,
				upsertGraphModule: (id, code, deps, opts) => {
					moduleGraph.upsert(id, code, deps, opts);
				},
			});

			// 2.5) ESM runtime bridge for NativeScript-Vue: GET /ns/rt[/<ver>] — see ns-rt-route.ts
			registerNsRtBridgeRoute(server, { getGraphVersion: () => moduleGraph.version });

			// 2.55) Dev-only vendor import unifier: rewrite 'vue'/'nativescript-vue' to /ns/rt/<ver>
			// so plugins and the app share a single Vue/NativeScript-Vue realm. See websocket-vendor-unifier.ts.
			registerVendorUnifierHandler(server, { getGraphVersion: () => moduleGraph.version, getServerOrigin, getStrategy: () => strategy });

			// 2.6) @nativescript/core device bridge (+ stray /node_modules/@nativescript/core redirect) — see websocket-ns-core.ts
			registerNsCoreRoute(server, {
				getGraphVersion: () => moduleGraph.version,
				getServerOrigin,
				sharedTransformRequest,
			});

			// 2.6a/2.6b) Device bootstrap: GET /ns/entry-rt + GET /ns/entry — see websocket-ns-entry.ts
			registerNsEntryRoutes(server, {
				verbose,
				appRootDir: APP_ROOT_DIR,
				defaultMainEntry: DEFAULT_MAIN_ENTRY,
				defaultMainEntryVirtual: DEFAULT_MAIN_ENTRY_VIRTUAL,
				getGraphVersion: () => moduleGraph.version,
				getServerOrigin,
			});

			// 2.6) Transactional HMR endpoint: GET /ns/txn/<ver> — one ESM that sequentially
			// imports all changed modules for the given graph version. See websocket-txn.ts.
			registerTxnHandler(server, {
				resolveTxnIds: (version, fallbackChangedIds) => {
					let ids = moduleGraph.getTxnBatch(version) || [];
					if (!ids.length && fallbackChangedIds.length) {
						try {
							ids = moduleGraph.computeTxnOrderForChanged(fallbackChangedIds);
						} catch {}
					}
					return ids;
				},
			});

			// SFC endpoints (/ns/sfc, /ns/sfc-meta, /ns/asm) — see websocket-sfc.ts
			registerSfcHandlers(server, {
				verbose,
				appVirtualWithSlash: APP_VIRTUAL_WITH_SLASH,
				sfcFileMap,
				depFileMap,
				getGraphVersion: () => moduleGraph.version,
				getStrategy: () => strategy,
				getServerOrigin,
				cleanCode,
				processCodeForDevice,
				rewriteImports,
			});

			wss.on('connection', async (ws) => {
				if (verbose) console.log('[hmr-ws] Client connected (dynamic fetch mode)');

				ws.on('close', () => verbose && console.log('[hmr-ws] Client disconnected'));
				ws.on('message', (data: any) => {
					try {
						const msg = JSON.parse(String(data));
						if (msg?.type === 'ns:hmr-resync-request') {
							moduleGraph.emitFullGraph(ws as any);
						} else if (msg?.type === 'ns:hmr-sfc-registry-request') {
							// Resend full SFC registry (lightweight code path)
							strategy
								.buildRegistry({
									server,
									sfcFileMap,
									depFileMap,
									wss: wss!,
									verbose,
									helpers: {
										cleanCode: (code: string) => cleanCode(code, strategy),
										collectImportDependencies,
										isCoreGlobalsReference,
										isNativeScriptCoreModule,
										isNativeScriptPluginModule,
										resolveVendorFromCandidate,
										createHash: (value: string) => createHash('md5').update(value).digest('hex'),
										rewriteImports,
										processSfcCode,
									},
								})
								.catch(() => {});
						} else if (msg?.type === 'ns:fetch-module' && msg.path && typeof msg.requestId !== 'undefined') {
							(async () => {
								const requestId = msg.requestId;
								let spec: string = msg.path;
								// Normalize: strip query/hash, ensure leading '/'
								if (typeof spec === 'string') {
									spec = spec.replace(/[?#].*$/, '');
									if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
									// Collapse accidental repeated index segments: /foo/index/index -> /foo/index
									spec = spec.replace(/\/(index)(?:\/(?:index))+$/i, '/$1');
									if (spec === '@') {
										try {
											((globalThis as any).__NS_FETCH_METRICS__ ||= {}).invalidAtSpec = ((globalThis as any).__NS_FETCH_METRICS__.invalidAtSpec || 0) + 1;
										} catch {}
										ws.send(
											JSON.stringify({
												type: 'ns:module-response',
												requestId,
												path: msg.path,
												error: 'invalid-spec-@',
											}),
										);
										return;
									}
									// Reject device artifact paths from _ns_hmr (client should never request these)
									if (/(?:\/_ns_hmr|Documents)\/src\/sfc\//.test(spec) || spec.startsWith('/_ns_hmr/')) {
										try {
											((globalThis as any).__NS_FETCH_METRICS__ ||= {}).artifactPathRejected = ((globalThis as any).__NS_FETCH_METRICS__.artifactPathRejected || 0) + 1;
										} catch {}
										ws.send(
											JSON.stringify({
												type: 'ns:module-response',
												requestId,
												path: msg.path,
												error: 'artifact-path-disallowed',
											}),
										);
										return;
									}
								}
								// Special-case JSON package metadata requests at project root ONLY: provide a tiny stub module (no transform)
								// Intentionally narrow match to '/package.json' (or 'package.json') to avoid catching relative imports like '../package.json'.
								if (/^\/?package\.json(?:\/index)?$/.test(spec)) {
									const root = server.config?.root || process.cwd();
									let json = '{}';
									try {
										json = readFileSync(path.join(root, 'package.json'), 'utf-8');
									} catch {}
									const code = `export default ${json}\n`;
									const rel = 'hmr-stubs/package.json.mjs';
									ws.send(
										JSON.stringify({
											type: 'ns:module-response',
											requestId,
											path: rel,
											code,
										}),
									);
									return;
								}
								// Basic transform response cache (spec -> { code, path, hash }) to reduce CPU for rapid repeated imports
								const fetchCache: any = ((globalThis as any).__NS_FETCH_CACHE__ ||= new Map());
								const FETCH_CACHE_VERSION = 2;
								try {
									// Normalize leading ./
									if (spec.startsWith('./')) spec = spec.slice(1);
									if (!spec.startsWith('/')) spec = '/' + spec;
									const cacheKey = spec + '::' + FETCH_CACHE_VERSION;
									if (fetchCache.has(cacheKey)) {
										const cached = fetchCache.get(cacheKey);
										ws.send(
											JSON.stringify({
												type: 'ns:module-response',
												requestId,
												path: cached.path,
												code: cached.code,
												cached: true,
											}),
										);
										return;
									}
									const root = server.config?.root || process.cwd();
									// Attempt transform via Vite with robust variant resolution (handles .mjs inputs)
									let transformed: TransformResult | null = null;
									let resolvedCandidate: string | null = null;
									const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
									const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
									const candidates: string[] = [];
									if (hasExt) {
										candidates.push(spec); // as-is
									}
									candidates.push(baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs');
									for (const cand of candidates) {
										try {
											const r = await server.transformRequest(cand);
											if (r?.code) {
												transformed = r;
												resolvedCandidate = cand;
												break;
											}
										} catch {}
									}
									if (!transformed?.code) {
										ws.send(
											JSON.stringify({
												type: 'ns:module-response',
												requestId,
												error: 'transform-failed',
												path: msg.path,
											}),
										);
										return;
									}
									let code = transformed.code;
									// Reuse existing sanitation chain (lightweight)
									code = cleanCode(code, strategy);
									code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(resolvedCandidate || spec), resolvedCandidate || spec);
									code = rewriteImports(code, spec, sfcFileMap, depFileMap, server.config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
									code = ensureVariableDynamicImportHelper(code);
									code = ensureGuardPlainDynamicImports(code, origin);
									// Determine output relative file path (project-relative .mjs)
									const specForRel = resolvedCandidate || spec;
									let rel = specForRel.replace(/^\//, '');
									rel = rel.replace(/\.(tsx?|jsx?)$/i, '.mjs');
									if (!rel.endsWith('.mjs')) rel += '.mjs';
									// Collect immediate relative .mjs dependencies and transform them as additional files
									const additionalFiles: Array<{ path: string; code: string }> = [];
									try {
										const importRE = /from\s+["']([^"']+\.mjs)["']|import\(\s*["']([^"']+\.mjs)["']\s*\)/g;
										const importerDir = path.posix.dirname(specForRel);
										let m: RegExpExecArray | null;
										const seen = new Set<string>();
										while ((m = importRE.exec(code)) !== null) {
											let dep = m[1] || m[2];
											if (!dep) continue;
											if (!(dep.startsWith('./') || dep.startsWith('../'))) continue;
											// Resolve to absolute
											let abs = path.posix.normalize(path.posix.join(importerDir, dep));
											if (!abs.startsWith('/')) abs = '/' + abs;
											const depBase = abs.replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '');
											if (seen.has(depBase)) continue;
											seen.add(depBase);
											// Transform dep via same candidate resolution
											const depHasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(depBase);
											const depNoExt = depHasExt ? depBase.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i, '') : depBase;
											const depCandidates = [depNoExt + '.ts', depNoExt + '.js', depNoExt + '.tsx', depNoExt + '.jsx', depNoExt + '.mjs', depNoExt + '.mts', depNoExt + '.cts', depNoExt + '.vue', depNoExt + '/index.ts', depNoExt + '/index.js', depNoExt + '/index.tsx', depNoExt + '/index.jsx', depNoExt + '/index.mjs'];
											let depTrans: TransformResult | null = null;
											let depResolved: string | null = null;
											for (const cand of depCandidates) {
												try {
													const r = await server.transformRequest(cand);
													if (r?.code) {
														depTrans = r;
														depResolved = cand;
														break;
													}
												} catch {}
											}
											if (depTrans?.code && depResolved) {
												let depCode = depTrans.code;
												depCode = cleanCode(depCode, strategy);
												depCode = processCodeForDevice(depCode, false, true, /(?:^|\/)node_modules\//.test(depResolved), depResolved);
												depCode = rewriteImports(depCode, depResolved, sfcFileMap, depFileMap, server.config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
												depCode = ensureVariableDynamicImportHelper(depCode);
												depCode = ensureGuardPlainDynamicImports(depCode, origin);
												let depRel = depResolved.replace(/^\//, '').replace(/\.(tsx?|jsx?)$/i, '.mjs');
												if (!depRel.endsWith('.mjs')) depRel += '.mjs';
												additionalFiles.push({ path: depRel, code: depCode });
											}
										}
									} catch {}
									// Store in cache (simple size cap 200 entries)
									try {
										if (fetchCache.size > 200) {
											const firstKey = fetchCache.keys().next().value;
											if (firstKey) fetchCache.delete(firstKey);
										}
										fetchCache.set(cacheKey, { code, path: rel });
										// Update manifest and broadcast incremental update (debounced to minimize chatter)
										if (!moduleManifest.has(spec)) {
											moduleManifest.set(spec, rel);
											const single = {
												type: 'ns:module-manifest',
												entries: { [spec]: rel },
												ts: Date.now(),
												delta: true,
											};
											wss?.clients.forEach((c) => {
												if (isSocketClientOpen(c)) {
													try {
														c.send(JSON.stringify(single));
													} catch {}
												}
											});
										}
									} catch {}
									ws.send(
										JSON.stringify({
											type: 'ns:module-response',
											requestId,
											path: rel,
											code,
											additionalFiles,
										}),
									);
								} catch (e: any) {
									ws.send(
										JSON.stringify({
											type: 'ns:module-response',
											requestId,
											path: msg.path,
											error: e?.message || String(e),
										}),
									);
								}
							})();
						}
					} catch {}
				});

				// Populate initial graph (only once) before sending anything
				try {
					await populateInitialGraph(server);
				} catch (e) {
					if (verbose) console.warn('[hmr-ws][graph] initial population failed', e);
				}
				// Send SFC registry on every connection (not just the first).
				// When the NativeScript app restarts (e.g. CLI auto-reload), the new
				// JS context has an empty sfcArtifactMap. Without the registry the
				// rescue-mount cannot find the root .vue component.
				try {
					await strategy.buildRegistry({
						server,
						sfcFileMap,
						depFileMap,
						wss: wss!,
						verbose,
						helpers: {
							cleanCode: (code: string) => cleanCode(code, strategy),
							collectImportDependencies,
							isCoreGlobalsReference,
							isNativeScriptCoreModule,
							isNativeScriptPluginModule,
							resolveVendorFromCandidate,
							createHash: (value: string) => createHash('md5').update(value).digest('hex'),
							rewriteImports,
							processSfcCode,
						},
					});
					registrySent = true;
				} catch (error) {
					console.warn('[hmr-ws] Failed to send registry:', error);
				}
				moduleGraph.emitFullGraph(ws as any);

				// After sending registry & graph also send current module manifest if any
				if (moduleManifest.size) {
					const manifestObj: Record<string, string> = {};
					moduleManifest.forEach((v, k) => (manifestObj[k] = v));
					try {
						ws.send(
							JSON.stringify({
								type: 'ns:module-manifest',
								entries: manifestObj,
								ts: Date.now(),
							}),
						);
					} catch {}
				}
			});
		},

		async handleHotUpdate(ctx) {
			return handleNsHotUpdate(ctx, {
				wss,
				moduleGraph,
				strategy,
				verbose,
				sfcFileMap,
				depFileMap,
				sharedTransformRequest,
				processSfcCode,
				collectImportDependencies,
				rewriteImports,
				cleanCode,
				getServerOrigin,
				getHmrSourceRootsCached,
				getBootstrapEntryRelPath,
				isSocketClientOpen,
				getHmrSocketRole,
				shouldRemapImport,
				rememberAngularReloadSuppression,
				getGraphInitialPopulationPromise: () => graphInitialPopulationPromise,
				appRootDir: APP_ROOT_DIR,
				appVirtualWithSlash: APP_VIRTUAL_WITH_SLASH,
			});
		},
	};
}

// Framework-specific HMR WebSocket plugins
export function hmrWebSocketVue(opts: { verbose?: boolean }): Plugin {
	return createHmrWebSocketPlugin(opts, resolveFrameworkStrategy('vue'));
}

export function hmrWebSocketAngular(opts: { verbose?: boolean }): Plugin {
	return createHmrWebSocketPlugin(opts, resolveFrameworkStrategy('angular'));
}

export function hmrWebSocketSolid(opts: { verbose?: boolean }): Plugin {
	return createHmrWebSocketPlugin(opts, resolveFrameworkStrategy('solid'));
}

export function hmrWebSocketTypescript(opts: { verbose?: boolean }): Plugin {
	return createHmrWebSocketPlugin(opts, resolveFrameworkStrategy('typescript'));
}

/**
 * Dev-server origin baked into every module served to the device
 * (`/ns/core/...`, `/ns/m/...`). MUST match the origin `dev-host.ts` bakes
 * into `bundle.mjs`; if they disagree V8 keys them as different modules and
 * the app ends up with two `@nativescript/core` realms (a singleton-state
 * split). `resolveDeviceReachableOrigin` keeps every platform in lock-step:
 * Android wildcard/loopback -> `10.0.2.2`, iOS/visionOS wildcard ->
 * `localhost`, explicit non-loopback `server.host` -> trusted verbatim
 * (physical devices opt into LAN via `NS_HMR_PREFER_LAN_HOST`/`NS_HMR_HOST`).
 */
function getServerOrigin(server: ViteDevServer): string {
	const platform: DevHostPlatform = detectDevHostPlatform();
	const isHttps = !!server.config.server?.https;
	const protocol: 'http' | 'https' = isHttps ? 'https' : 'http';
	const httpServer = server.httpServer as any;
	const addr = httpServer?.address?.();
	const port = Number(server.config.server?.port || addr?.port || 5173);

	try {
		const { origin } = resolveDeviceReachableOrigin({
			host: server.config.server?.host,
			platform,
			protocol,
			port,
		});
		if (/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
			return origin;
		}
		console.warn('[hmr][origin] invariant failed for resolveDeviceReachableOrigin:', origin);
	} catch (err) {
		console.warn('[hmr][origin] resolveDeviceReachableOrigin threw:', (err as any)?.message || String(err));
	}

	// Last-ditch fallback for the implausible case where the resolver
	// throws (CI containers with no NICs, exotic `process.env` shapes,
	// etc.). We deliberately do NOT consult `resolvedUrls.network[0]`
	// here — see the file-level comment above for why.
	const hostCfg = server.config.server?.host;
	const fallbackHost = typeof hostCfg === 'string' && hostCfg && hostCfg !== '0.0.0.0' ? hostCfg : platform === 'android' ? '10.0.2.2' : '127.0.0.1';
	const origin = `${protocol}://${fallbackHost}:${port}`;
	if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
		console.warn('[hmr][origin] invariant failed for constructed origin:', origin);
	}
	return origin;
}

/**
 * Resolve the device target platform from the CLI flags the dev server
 * was launched with. The `--env.android` / `--env.visionos` flags are
 * surfaced by the NativeScript CLI when it spawns Vite; iOS is the
 * safe default when no flag is set so the helper stays a pure
 * function and standalone `vite serve` sessions still get sensible
 * URLs.
 */
function detectDevHostPlatform(): DevHostPlatform {
	try {
		const flags = (getCliFlags() || {}) as Record<string, unknown>;
		if (flags.android) return 'android';
		if (flags.visionos) return 'visionos';
	} catch {}
	return 'ios';
}

// Test-only export: allow unit tests to run the sanitizer on snippets without booting a server
// Safe in production builds; this is a named export that tests can import explicitly.
export const __test_processCodeForDevice = processCodeForDevice;
export const __test_resolveVendorRouting = resolveVendorRouting;
export const __test_getBlockedDeviceNodeModulesReason = getBlockedDeviceNodeModulesReason;
export const __test_getServerOrigin = getServerOrigin;
