import type { Plugin, ViteDevServer, TransformResult } from 'vite';
import { createRequire } from 'node:module';
import { normalizeStrayCoreStringLiterals, fixDanglingCoreFrom, normalizeAnyCoreSpecToBridge, isDeepCoreSubpath, rewriteSpecifiersForDevice } from './core-sanitize.js';
// AST tooling for robust transformations
import { parse as babelParse } from '@babel/parser';
import { genCode } from '../helpers/babel.js';
import babelCore from '@babel/core';
import traverse from '@babel/traverse';
// Ensure traverse callable across CJS/ESM builds
const babelTraverse: any = (traverse as any)?.default || (traverse as any);
import * as t from '@babel/types';
import { existsSync, readFileSync, statSync } from 'fs';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { stripRtCoreSentinel, stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import { WebSocketServer } from 'ws';
import * as path from 'path';
import { createHash } from 'crypto';
import * as PAT from './constants.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getPackageJson, getProjectFilePath, getProjectRootPath } from '../../helpers/project.js';
import { loadPrebuiltVendorManifest } from '../shared/vendor/manifest-loader.js';
import '../vendor-bootstrap.js';
import { NS_NATIVE_TAGS } from './compiler.js';
import { vueSfcCompiler } from '../frameworks/vue/server/compiler.js';
import { linkAngularPartialsIfNeeded } from '../frameworks/angular/server/linker.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';
import { typescriptServerStrategy } from '../frameworks/typescript/server/strategy.js';
import { buildInlineTemplateBlock, createProcessSfcCode, extractTemplateRender, processTemplateVariantMinimal } from '../frameworks/vue/server/sfc-transforms.js';
import { astExtractImportsAndStripTypes } from '../helpers/ast-extract.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath } from '../../helpers/utils.js';
import { buildRuntimeConfig, generateImportMap } from './import-map.js';
import { getCliFlags } from '../../helpers/cli-flags.js';
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
	resolveCandidateFilePath,
	resolveInternalRuntimePluginBareSpecifier,
	resolveNodeModulesPackageBoundary,
	resolveVendorFromCandidate,
	resolveVendorRouting,
	shouldPreserveBareRuntimePluginSubpathImport,
	stripDecoratedServePrefixes,
	tryReadRawExplicitJavaScriptModule,
	viteDepsPathToBareSpecifier,
} from './websocket-module-specifiers.js';
import { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides, type EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';

export { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides } from './websocket-module-bindings.js';
export type { EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';
export { stripDecoratedServePrefixes, tryReadRawExplicitJavaScriptModule } from './websocket-module-specifiers.js';

const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

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

const { parse, compileTemplate, compileScript } = vueSfcCompiler;

const APP_ROOT_DIR = getProjectAppPath();
const APP_VIRTUAL_PREFIX = getProjectAppVirtualPath();
const APP_VIRTUAL_WITH_SLASH = `${APP_VIRTUAL_PREFIX}/`;
const DEFAULT_MAIN_ENTRY = getProjectAppRelativePath('app.ts');
const DEFAULT_MAIN_ENTRY_VIRTUAL = getProjectAppVirtualPath('app.ts');

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

let ACTIVE_STRATEGY: FrameworkServerStrategy;

function isSocketClientOpen(client: { readyState?: number; OPEN?: number } | null | undefined): boolean {
	if (!client) {
		return false;
	}

	const openState = typeof client.OPEN === 'number' ? client.OPEN : 1;
	return client.readyState === openState;
}

function shouldAllowLocalCoreSanitizerPaths(contextLabel: string): boolean {
	return /\bnode_modules\/@nativescript\/vite\/hmr\/(?:client|frameworks)\//.test(contextLabel);
}

export type GraphUpsertClassification = 'unchanged' | 'inserted' | 'changed';

export function classifyGraphUpsert(existing: { hash: string; deps: string[] } | undefined, nextHash: string, nextDeps: string[]): GraphUpsertClassification {
	if (!existing) {
		return 'inserted';
	}
	if (existing.hash === nextHash && existing.deps.length === nextDeps.length && existing.deps.every((d, i) => d === nextDeps[i])) {
		return 'unchanged';
	}
	return 'changed';
}

export function shouldBroadcastGraphUpsertDelta(classification: GraphUpsertClassification, emitDeltaOnInsert: boolean = false): boolean {
	return classification === 'changed' || (classification === 'inserted' && emitDeltaOnInsert);
}

const processSfcCode = createProcessSfcCode(processCodeForDevice);

interface ProcessCodeForDeviceOptions {
	resolvedSpecifierOverrides?: Map<string, string>;
}

// Bare specifiers and special skip patterns (virtual, data:, etc.)
const VENDOR_PACKAGES = /^[A-Za-z@][^:\/\s]*$/;
const SKIP_PATTERNS = /^(?:data:|blob:|node:|virtual:|vite:|\0|\/@@?id|\/__vite|__vite|__x00__)/;

function canonicalizeTransformRequestCacheKey(url: string, projectRoot: string): string {
	if (!url) return url;

	const [rawPath, rawQuery = ''] = url.split('?', 2);
	let normalizedPath = rawPath;
	const root = projectRoot ? projectRoot.replace(/\\/g, '/') : '';

	if (normalizedPath.startsWith('/@fs/')) {
		const fsPath = normalizedPath.slice('/@fs'.length).replace(/\\/g, '/');
		if (root && fsPath.startsWith(root)) {
			const rel = fsPath.slice(root.length);
			normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
		}
	} else if (root && normalizedPath.replace(/\\/g, '/').startsWith(root)) {
		const rel = normalizedPath.replace(/\\/g, '/').slice(root.length);
		normalizedPath = rel.startsWith('/') ? rel : `/${rel}`;
	}

	if (!rawQuery) {
		return normalizedPath;
	}

	const params = new URLSearchParams(rawQuery);
	params.delete('t');
	params.delete('v');
	const kept = Array.from(params.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
		if (leftKey === rightKey) {
			return leftValue.localeCompare(rightValue);
		}
		return leftKey.localeCompare(rightKey);
	});
	if (!kept.length) {
		return normalizedPath;
	}

	const normalizedQuery = new URLSearchParams();
	for (const [key, value] of kept) {
		normalizedQuery.append(key, value);
	}

	return `${normalizedPath}?${normalizedQuery.toString()}`;
}

type HotUpdateGraphModuleLike = {
	id?: string | null;
	importedModules?: Iterable<{ id?: string | null }>;
	importers?: Iterable<HotUpdateGraphModuleLike>;
};

const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'decorators-legacy'] as any;

type TopLevelImportRecord = {
	start: number;
	end: number;
	text: string;
	source: string;
	hasOnlyNamedSpecifiers: boolean;
	namedBindings: Array<{ importedName: string; text: string }>;
};

function collectTopLevelImportRecords(code: string): TopLevelImportRecord[] {
	if (!code || typeof code !== 'string' || !/\bimport\b/.test(code)) {
		return [];
	}

	try {
		const ast = babelParse(code, {
			sourceType: 'module',
			plugins: MODULE_IMPORT_ANALYSIS_PLUGINS,
		}) as any;
		const body = ast?.program?.body;
		if (!Array.isArray(body)) {
			return [];
		}

		return body
			.filter((node: any) => t.isImportDeclaration(node) && typeof node.start === 'number' && typeof node.end === 'number' && typeof node.source?.value === 'string')
			.map((node: any) => ({
				start: node.start as number,
				end: node.end as number,
				text: code.slice(node.start as number, node.end as number),
				source: node.source.value as string,
				hasOnlyNamedSpecifiers: Array.isArray(node.specifiers) && node.specifiers.length > 0 && node.specifiers.every((spec: any) => t.isImportSpecifier(spec)),
				namedBindings: Array.isArray(node.specifiers)
					? node.specifiers
							.filter((spec: any) => t.isImportSpecifier(spec) && typeof spec.start === 'number' && typeof spec.end === 'number')
							.map((spec: any) => ({
								importedName: t.isIdentifier(spec.imported) ? spec.imported.name : String(spec.imported?.value || ''),
								text: code.slice(spec.start as number, spec.end as number),
							}))
					: [],
			}));
	} catch {
		return [];
	}
}

function hoistTopLevelStaticImports(code: string): string {
	const imports = collectTopLevelImportRecords(code);
	if (!imports.length) {
		return code;
	}

	let stripped = code;
	for (const imp of [...imports].sort((left, right) => right.start - left.start)) {
		stripped = stripped.slice(0, imp.start) + stripped.slice(imp.end);
	}

	const hoisted: string[] = [];
	const seen = new Set<string>();
	for (const imp of imports) {
		const text = imp.text.trim();
		if (!text || seen.has(text)) {
			continue;
		}
		seen.add(text);
		hoisted.push(text);
	}

	if (!hoisted.length) {
		return stripped;
	}

	return `${hoisted.join('\n')}\n${stripped.replace(/^\s*\n+/, '')}`;
}

export function buildBootProgressSnippet(bootModuleLabel: string): string {
	const normalizedLabel = JSON.stringify(String(bootModuleLabel || '').replace(/\\/g, '/'));
	return [
		`const __nsBootGlobal=globalThis;`,
		`try{if(!__nsBootGlobal.__NS_HMR_BOOT_COMPLETE__){const __nsBootApi=__nsBootGlobal.__NS_HMR_DEV_OVERLAY__;if(__nsBootApi&&typeof __nsBootApi.setBootStage==='function'){const __nsBootCount=(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__=Number(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__||0)+1);__nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__=${normalizedLabel};const __nsBootNow=Date.now();const __nsBootLast=Number(__nsBootGlobal.__NS_HMR_BOOT_LAST_PROGRESS_AT__||0);if(__nsBootCount<=8||__nsBootCount%6===0||__nsBootNow-__nsBootLast>90){__nsBootGlobal.__NS_HMR_BOOT_LAST_PROGRESS_AT__=__nsBootNow;const __nsBootProgress=Math.min(94,82+Math.min(10,Math.round((Math.log(__nsBootCount+1)/Math.LN2)*2)));__nsBootApi.setBootStage('importing-main',{detail:'Evaluated '+__nsBootCount+' modules\\n'+__nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__,attempt:Number(__nsBootGlobal.__NS_HMR_BOOT_MAIN_ATTEMPT__||1),attempts:Number(__nsBootGlobal.__NS_HMR_BOOT_MAIN_ATTEMPTS__||6),progress:__nsBootProgress});}}}}catch(__nsBootErr){}`,
		`if(!__nsBootGlobal.__NS_HMR_BOOT_COMPLETE__){const __nsBootCount=Number(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__||0);if(__nsBootCount<=24||__nsBootCount%8===0){await new Promise((resolve)=>setTimeout(resolve,0));}}`,
		'',
	].join('\n');
}

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

export function collectGraphUpdateModulesForHotUpdate(options: { file: string; flavor: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined }): HotUpdateGraphModuleLike[] {
	const targets = new Map<string, HotUpdateGraphModuleLike>();
	const addTarget = (mod?: HotUpdateGraphModuleLike | null) => {
		const id = mod?.id?.replace(/\?.*$/, '');
		if (!id) return;
		if (!targets.has(id)) {
			targets.set(id, mod!);
		}
	};

	if (options.flavor === 'angular' && /\.(html|htm)$/i.test(options.file)) {
		for (const mod of options.modules || []) {
			for (const importer of mod?.importers || []) {
				const importerId = importer?.id || '';
				if (/\.[cm]?[jt]sx?(?:$|\?)/i.test(importerId)) {
					addTarget(importer);
				}
			}
		}

		if (!targets.size) {
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.ts')));
			addTarget(options.getModuleById(options.file.replace(/\.(html|htm)$/i, '.js')));
		}

		return Array.from(targets.values());
	}

	if (!options.file.endsWith('.vue')) {
		addTarget(options.getModuleById(options.file) || options.getModuleById(options.file + '?vue'));
	}

	return Array.from(targets.values());
}

export function collectAngularHotUpdateRoots(options: { file: string; modules?: Iterable<HotUpdateGraphModuleLike>; getModuleById: (id: string) => HotUpdateGraphModuleLike | undefined; getModulesByFile?: (file: string) => Iterable<HotUpdateGraphModuleLike> | undefined | null }): HotUpdateGraphModuleLike[] {
	const roots: HotUpdateGraphModuleLike[] = [];
	const seenIds = new Set<string>();
	const seenObjects = new Set<HotUpdateGraphModuleLike>();

	const addRoot = (mod?: HotUpdateGraphModuleLike | null) => {
		if (!mod) {
			return;
		}

		if (mod.id) {
			if (seenIds.has(mod.id)) {
				return;
			}
			seenIds.add(mod.id);
			roots.push(mod);
			return;
		}

		if (seenObjects.has(mod)) {
			return;
		}
		seenObjects.add(mod);
		roots.push(mod);
	};

	if (/\.(html|htm)$/i.test(options.file)) {
		for (const mod of collectGraphUpdateModulesForHotUpdate({
			file: options.file,
			flavor: 'angular',
			modules: options.modules,
			getModuleById: options.getModuleById,
		})) {
			addRoot(mod);
		}
		return roots;
	}

	if (!/\.(m|c)?ts$/i.test(options.file)) {
		return roots;
	}

	for (const mod of options.modules || []) {
		addRoot(mod);
	}

	for (const mod of options.getModulesByFile?.(options.file) || []) {
		addRoot(mod);
	}

	if (!roots.length) {
		addRoot(options.getModuleById(options.file));
	}

	return roots;
}

type TransitiveImporterModuleLike = {
	id?: string | null;
	file?: string | null;
	importers?: Iterable<TransitiveImporterModuleLike> | null;
};

export function collectAngularTransitiveImportersForInvalidation(options: { modules: Iterable<TransitiveImporterModuleLike> | undefined | null; isExcluded?: (id: string) => boolean; maxDepth?: number }): TransitiveImporterModuleLike[] {
	const visited = new Set<TransitiveImporterModuleLike>();
	const collected = new Map<string, TransitiveImporterModuleLike>();
	const isExcluded = options.isExcluded ?? ((id: string) => id.includes('/node_modules/'));
	const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 16));

	const normalizeId = (value: string | null | undefined): string => (value ?? '').replace(/\?.*$/, '');

	const walk = (mod: TransitiveImporterModuleLike | undefined | null, depth: number): void => {
		if (!mod || visited.has(mod)) {
			return;
		}
		visited.add(mod);

		if (depth >= maxDepth) {
			return;
		}

		const importers = mod.importers;
		if (!importers) {
			return;
		}

		for (const importer of importers) {
			if (!importer) continue;
			const importerId = normalizeId(importer.id);
			if (!importerId) {
				walk(importer, depth + 1);
				continue;
			}
			if (isExcluded(importerId)) {
				continue;
			}
			if (!collected.has(importerId)) {
				collected.set(importerId, importer);
			}
			walk(importer, depth + 1);
		}
	};

	for (const mod of options.modules || []) {
		walk(mod, 0);
	}

	return Array.from(collected.values());
}

export function shouldInvalidateAngularTransitiveImporters(options: { flavor: string; file: string }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	return /\.(?:html|htm|(m|c)?[jt]sx?)$/i.test(options.file);
}

function isExtensionlessAngularAppTransformCandidate(id: string): boolean {
	return id.startsWith(APP_VIRTUAL_WITH_SLASH) && /\.(?:[mc]?[jt]sx?)$/i.test(id);
}

function addAngularTransformCacheInvalidationUrl(targets: Set<string>, rawId: string | null | undefined, projectRoot?: string): void {
	const id = String(rawId || '');
	if (!id) {
		return;
	}

	const cacheKey = projectRoot ? canonicalizeTransformRequestCacheKey(id, projectRoot) : id;
	targets.add(cacheKey);

	const normalizedId = cacheKey.replace(/\?.*$/, '');
	if (!isExtensionlessAngularAppTransformCandidate(normalizedId)) {
		return;
	}

	targets.add(normalizedId.replace(/\.(?:[mc]?[jt]sx?)$/i, ''));
}

export function collectAngularTransformCacheInvalidationUrls(options: { file: string; isTs: boolean; hotUpdateRoots: Iterable<{ id?: string | null }>; transitiveImporters?: Iterable<{ id?: string | null }>; projectRoot?: string }): string[] {
	const urls = new Set<string>();

	if (options.isTs) {
		addAngularTransformCacheInvalidationUrl(urls, options.file, options.projectRoot);
	}

	for (const mod of options.hotUpdateRoots || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	for (const mod of options.transitiveImporters || []) {
		addAngularTransformCacheInvalidationUrl(urls, mod?.id, options.projectRoot);
	}

	return Array.from(urls);
}

export function shouldSuppressDefaultViteHotUpdate(options: { flavor: string; file: string }): boolean {
	if (options.flavor !== 'angular') {
		return false;
	}

	return /\.(html|htm|ts)$/i.test(options.file);
}

type PendingAngularReloadSuppressionEntry = {
	absPath: string;
	relPath: string;
	expiresAt: number;
};

export function normalizeHotReloadMatchPath(raw: string, root?: string): string {
	let normalized = String(raw || '')
		.split('?')[0]
		.replace(/\\/g, '/')
		.replace(/^file:\/\//, '');

	if (root) {
		const rootNormalized = root.replace(/\\/g, '/');
		if (normalized.startsWith(rootNormalized)) {
			normalized = normalized.slice(rootNormalized.length);
		}
	}

	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}

	return normalized;
}

export function shouldSuppressViteFullReloadPayload(options: { payload: any; pendingEntries: Iterable<PendingAngularReloadSuppressionEntry>; root?: string; now?: number }): boolean {
	const { payload, pendingEntries, root } = options;
	const now = options.now ?? Date.now();

	if (!payload || payload.type !== 'full-reload') {
		return false;
	}

	const payloadPath = typeof payload.path === 'string' && payload.path !== '*' ? normalizeHotReloadMatchPath(payload.path, root) : null;
	const payloadTriggeredBy = typeof payload.triggeredBy === 'string' ? normalizeHotReloadMatchPath(payload.triggeredBy, root) : null;

	for (const entry of pendingEntries) {
		if (!entry || entry.expiresAt <= now) {
			continue;
		}

		if (payloadTriggeredBy === entry.absPath || payloadTriggeredBy === entry.relPath || payloadPath === entry.relPath || payloadPath === entry.absPath) {
			return true;
		}
	}

	return false;
}

type SharedTransformRequestRunnerOptions = {
	maxConcurrent?: number;
	resultCacheTtlMs?: number;
	getResultCacheKey?: (url: string) => string;
};

type SharedTransformRequestRunner = ((url: string, timeoutMs?: number) => Promise<TransformResult | null>) & {
	invalidate: (url: string) => void;
	invalidateMany: (urls: Iterable<string>) => void;
	clear: () => void;
};

export function createSharedTransformRequestRunner(transformRequest: (url: string) => Promise<TransformResult | null>, onTimeout?: (url: string, timeoutMs: number) => void, options: SharedTransformRequestRunnerOptions = {}): SharedTransformRequestRunner {
	const inFlight = new Map<string, { execution: Promise<TransformResult | null>; started: Promise<void>; cacheKey: string; generation: number }>();
	const recentResults = new Map<string, { expiresAt: number; result: TransformResult }>();
	const cacheGenerations = new Map<string, number>();
	const queue: Array<() => void> = [];
	const maxConcurrent = Math.max(1, Math.floor(options.maxConcurrent ?? 1));
	const resultCacheTtlMs = Math.max(0, Math.floor(options.resultCacheTtlMs ?? 0));
	const getResultCacheKey = options.getResultCacheKey ?? ((url: string) => url);
	let activeCount = 0;

	const getCacheGeneration = (cacheKey: string) => cacheGenerations.get(cacheKey) ?? 0;
	const invalidateCacheKey = (cacheKey: string) => {
		cacheGenerations.set(cacheKey, getCacheGeneration(cacheKey) + 1);
		recentResults.delete(cacheKey);
	};

	const pruneRecentResults = () => {
		if (!recentResults.size) {
			return;
		}

		const now = Date.now();
		for (const [key, entry] of recentResults) {
			if (entry.expiresAt <= now) {
				recentResults.delete(key);
			}
		}
	};

	const rememberRecentResult = (url: string, result: TransformResult | null, generation: number) => {
		if (!result || resultCacheTtlMs <= 0) {
			return;
		}

		const cacheKey = getResultCacheKey(url);
		if (getCacheGeneration(cacheKey) !== generation) {
			return;
		}
		recentResults.delete(cacheKey);
		recentResults.set(cacheKey, {
			expiresAt: Date.now() + resultCacheTtlMs,
			result,
		});

		if (recentResults.size > 512) {
			const oldestKey = recentResults.keys().next().value;
			if (oldestKey) {
				recentResults.delete(oldestKey);
			}
		}
	};

	const runNext = () => {
		while (activeCount < maxConcurrent) {
			const next = queue.shift();
			if (!next) {
				return;
			}

			activeCount += 1;
			next();
		}
	};

	const schedule = <T>(task: () => Promise<T>): { execution: Promise<T>; started: Promise<void> } => {
		let resolveStarted: (() => void) | null = null;
		const started = new Promise<void>((resolve) => {
			resolveStarted = resolve;
		});

		const execution = new Promise<T>((resolve, reject) => {
			queue.push(() => {
				let started: Promise<T>;
				resolveStarted?.();
				try {
					started = Promise.resolve(task());
				} catch (error) {
					started = Promise.reject(error);
				}

				started.then(resolve, reject).finally(() => {
					activeCount = Math.max(0, activeCount - 1);
					runNext();
				});
			});

			runNext();
		});

		return { execution, started };
	};

	const withTimeout = (entry: { execution: Promise<TransformResult | null>; started: Promise<void> }, url: string, timeoutMs: number) => {
		if (!(timeoutMs > 0)) {
			return entry.execution;
		}

		return entry.started.then(
			() =>
				new Promise<TransformResult | null>((resolve, reject) => {
					const timer = setTimeout(() => {
						try {
							onTimeout?.(url, timeoutMs);
						} catch {}
					}, timeoutMs);

					entry.execution.then(resolve, reject).finally(() => {
						clearTimeout(timer);
					});
				}),
		);
	};

	const runner = ((url: string, timeoutMs = 120000) => {
		pruneRecentResults();
		const cacheKey = getResultCacheKey(url);
		const generation = getCacheGeneration(cacheKey);
		const recent = recentResults.get(cacheKey);
		if (recent && recent.expiresAt > Date.now()) {
			return Promise.resolve(recent.result);
		}

		const existingExecution = inFlight.get(url);
		if (existingExecution && existingExecution.generation === generation && existingExecution.cacheKey === cacheKey) {
			return withTimeout(existingExecution, url, timeoutMs);
		}

		const scheduled = schedule(async () => {
			const result = await Promise.resolve(transformRequest(url));
			rememberRecentResult(url, result, generation);
			return result;
		});
		let execution: Promise<TransformResult | null>;
		execution = scheduled.execution.finally(() => {
			if (inFlight.get(url)?.execution === execution) {
				inFlight.delete(url);
			}
		});

		const entry = { execution, started: scheduled.started, cacheKey, generation };
		inFlight.set(url, entry);

		return withTimeout(entry, url, timeoutMs);
	}) as SharedTransformRequestRunner;

	runner.invalidate = (url: string) => {
		invalidateCacheKey(getResultCacheKey(url));
	};

	runner.invalidateMany = (urls: Iterable<string>) => {
		for (const url of urls || []) {
			runner.invalidate(url);
		}
	};

	runner.clear = () => {
		recentResults.clear();
		cacheGenerations.clear();
	};

	return runner;
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

function stripCoreGlobalsImports(code: string): string {
	const pattern = /^\s*(?:import\s+(?:[^'"\n]*from\s+)?|export\s+\*\s+from\s+)["'][^"']*(?:@nativescript(?:[/_-])core(?:[\/_-])globals|@nativescript_core_globals)[^"']*["'];?\s*$/gm;
	return code.replace(pattern, '');
}

function ensureVariableDynamicImportHelper(code: string): string {
	if (!code.includes('__variableDynamicImportRuntimeHelper')) {
		return code;
	}

	if (PAT.VARIABLE_DYNAMIC_IMPORT_HELPER_PATTERN.test(code)) {
		return code;
	}
	const helper =
		`const __variableDynamicImportRuntimeHelper = (map, request, importMode) => {\n` +
		`  try { if (request === '@') { return import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href); } } catch {}\n` +
		`  const loader = map && (map[request] || map[request?.replace(/\\\\/g, "/")]);\n` +
		`  if (!loader) {\n` +
		`    const error = new Error(\"Cannot dynamically import: \" + request);\n` +
		`    error.code = 'ERR_MODULE_NOT_FOUND';\n` +
		`    return Promise.reject(error);\n` +
		`  }\n` +
		`  try {\n` +
		`    return loader(importMode);\n` +
		`  } catch (err) {\n` +
		`    return Promise.reject(err);\n` +
		`  }\n` +
		`};\n`;

	return `${helper}${code}`;
}

function ensureGuardPlainDynamicImports(code: string, origin: string): string {
	try {
		if (!code || !/\bimport\s*\(/.test(code)) return code;
		const wrapper = `const __ns_import = (s) => { try { if (s === '@') { return import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href); } } catch {} return import(s); }\n`;
		const replaced = code.replace(/(^|[^\.\w$])import\s*\(/g, (_m, p1) => `${p1}__ns_import(`);
		if (replaced !== code) {
			return wrapper + replaced;
		}
		return code;
	} catch {
		return code;
	}
}

function ensureDynamicHmrImportHelper(code: string): string {
	try {
		if (!code.includes('__nsDynamicHmrImport(')) return code;
		if (code.includes('const __nsDynamicHmrImport =')) return code;
		const helper =
			'const __nsDynamicHmrImport = (spec) => {\n' +
			"  const __nsm = '/ns' + '/m';\n" +
			"  try { if (!spec || spec === '@') { return import(new URL(__nsm + '/__invalid_at__.mjs', import.meta.url).href); } } catch {}\n" +
			'  try {\n' +
			"    if (typeof spec === 'string' && spec.startsWith(__nsm + '/')) {\n" +
			"      if (spec.includes('/__ns_hmr__/')) { return import(new URL(spec, import.meta.url).href); }\n" +
			'      const g = globalThis;\n' +
			"      const nonce = typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0;\n" +
			"      const tag = nonce ? `n${nonce}` : 'live';\n" +
			"      const nextPath = __nsm + '/__ns_hmr__/' + encodeURIComponent(tag) + spec.slice(__nsm.length);\n" +
			"      const origin = typeof g.__NS_HTTP_ORIGIN__ === 'string' && /^https?:\\/\\//.test(g.__NS_HTTP_ORIGIN__) ? g.__NS_HTTP_ORIGIN__ : '';\n" +
			'      return import(origin ? origin + nextPath : new URL(nextPath, import.meta.url).href);\n' +
			'    }\n' +
			'  } catch {}\n' +
			'  return import(spec);\n' +
			'};\n';
		return helper + code;
	} catch {
		return code;
	}
}

async function expandStarExports(code: string, server: any, projectRoot: string, verbose?: boolean): Promise<string> {
	const STAR_RE = /^[ \t]*(export\s+\*\s+from\s+["'])([^"']+)(["'];?)[ \t]*$/gm;
	let match: RegExpExecArray | null;
	const replacements: Array<{ full: string; url: string; prefix: string; suffix: string }> = [];

	while ((match = STAR_RE.exec(code)) !== null) {
		const url = match[2];
		if (!url.includes('/node_modules/')) continue;
		replacements.push({ full: match[0], url, prefix: match[1], suffix: match[3] });
	}

	if (!replacements.length) return code;

	for (const rep of replacements) {
		try {
			let vitePath = rep.url.replace(/^https?:\/\/[^/]+/, '');
			vitePath = vitePath.replace(/^\/ns\/m\//, '/');
			vitePath = vitePath.replace(/^\/__ns_boot__\/[^/]+/, '');
			vitePath = vitePath.replace(/\/__ns_hmr__\/[^/]+/, '');

			const result = await server.transformRequest(vitePath);
			if (!result?.code) continue;

			const names = extractExportedNames(result.code);
			if (!names.length) continue;

			const explicit = `export { ${names.join(', ')} } from ${JSON.stringify(rep.url)};`;
			code = code.replace(rep.full, explicit);
			if (verbose) {
				console.log(`[ns/m] expanded export* -> ${names.length} names from ${vitePath}`);
			}
		} catch {}
	}

	return code;
}

function extractExportedNames(code: string): string[] {
	return extractDirectExportedNames(code);
}

type CoreExportOrigin = {
	moduleId: string;
	mode: 'named' | 'module';
	importedName?: string;
	canonicalSubpath?: string;
};

function extractDirectExportedNames(code: string): string[] {
	const names = new Set<string>();
	const declRe = /\bexport\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g;
	let match: RegExpExecArray | null;
	while ((match = declRe.exec(code)) !== null) {
		names.add(match[1]);
	}
	const namespaceRe = /\bexport\s+namespace\s+([A-Za-z_$][\w$]*)/g;
	while ((match = namespaceRe.exec(code)) !== null) {
		names.add(match[1]);
	}
	const varRe = /\bexport\s+(?:const|let|var)\s+([^=;{]+)/g;
	while ((match = varRe.exec(code)) !== null) {
		const decl = match[1].trim();
		if (decl.startsWith('{')) {
			const inner = decl.replace(/^\{|\}$/g, '');
			for (const part of inner.split(',')) {
				const name = part.split(':')[0].trim();
				if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
			}
		} else {
			const name = decl.split(/[\s,=]/)[0].trim();
			if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
		}
	}
	const directBraceRe = /\bexport\s*\{([^}]+)\}(?!\s*from)/g;
	while ((match = directBraceRe.exec(code)) !== null) {
		for (const part of match[1].split(',')) {
			const trimmed = part.trim();
			const asMatch = trimmed.match(/(\S+)\s+as\s+(\S+)/);
			const name = asMatch ? asMatch[2] : trimmed.split(/\s/)[0];
			if (name && /^[A-Za-z_$][\w$]*$/.test(name) && name !== 'default') {
				names.add(name);
			}
		}
	}
	return Array.from(names);
}

function parseExportSpecList(specList: string): Array<{ importedName: string; exportedName: string }> {
	return String(specList || '')
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			const asMatch = part.match(/(\S+)\s+as\s+(\S+)/i);
			if (asMatch) {
				return { importedName: asMatch[1].trim(), exportedName: asMatch[2].trim() };
			}
			const name = part.split(/\s/)[0]?.trim() || '';
			return { importedName: name, exportedName: name };
		})
		.filter(({ exportedName, importedName }) => /^[A-Za-z_$][\w$]*$/.test(exportedName) && exportedName !== 'default' && /^[A-Za-z_$][\w$]*$/.test(importedName));
}

function runtimeModuleIdForFile(modulePath: string, rootEntryPath: string): string | null {
	const cleanedPath = String(modulePath || '').replace(/[?#].*$/, '');
	const cleanedRoot = String(rootEntryPath || '').replace(/[?#].*$/, '');
	if (!cleanedPath || !cleanedRoot) return null;
	const rootDir = path.dirname(cleanedRoot);
	let rel = path.relative(rootDir, cleanedPath).replace(/\\/g, '/');
	if (!rel || rel === 'index.ts' || rel === 'index.js' || rel === 'index.mjs') {
		return '@nativescript/core';
	}
	rel = rel.replace(/\.(?:ts|js|mjs)$/, '');
	rel = rel.replace(/\/index$/, '');
	return `@nativescript/core/${rel}`;
}

function runtimeModuleIdFromLocalSpecifier(spec: string, currentModuleId: string): string | null {
	if (!spec.startsWith('.')) return spec || null;
	const base = currentModuleId.replace(/^@nativescript\/core(?:\/|$)/, '');
	const baseDir = base ? `/${base}` : '/';
	let rel = path.posix.normalize(path.posix.join(baseDir, spec)).replace(/^\/+/, '');
	rel = rel.replace(/\.(?:ts|js|mjs)$/, '');
	rel = rel.replace(/\/index$/, '');
	return rel ? `@nativescript/core/${rel}` : '@nativescript/core';
}

function canonicalCoreSubpathForFile(modulePath: string, rootEntryPath: string): string | null {
	const cleanedPath = String(modulePath || '').replace(/[?#].*$/, '');
	const cleanedRoot = String(rootEntryPath || '').replace(/[?#].*$/, '');
	if (!cleanedPath || !cleanedRoot) return null;
	const rootDir = path.dirname(cleanedRoot);
	let rel = path.relative(rootDir, cleanedPath).replace(/\\/g, '/');
	if (!rel || rel === 'index.ts' || rel === 'index.js' || rel === 'index.mjs') {
		return null;
	}
	rel = rel.replace(/\.(?:ts|js|mjs)$/, '.js');
	return rel;
}

function canonicalCoreSubpathFromLocalSpecifier(spec: string, currentCanonicalSubpath: string | null): string | null {
	if (!spec.startsWith('.')) return null;
	const baseDir = currentCanonicalSubpath ? path.posix.dirname(currentCanonicalSubpath) : '.';
	let rel = path.posix.normalize(path.posix.join(baseDir, spec)).replace(/^\.?\/?/, '');
	if (!rel) return null;
	if (/\.(?:ts|js|mjs)$/i.test(rel)) {
		return rel.replace(/\.(?:ts|js|mjs)$/i, '.js');
	}
	return `${rel.replace(/\/+$/, '')}/index.js`;
}

function appendCoreExportOrigin(map: Record<string, CoreExportOrigin[]>, exportedName: string, origin: CoreExportOrigin): void {
	if (!/^[A-Za-z_$][\w$]*$/.test(exportedName) || exportedName === 'default') return;
	const existing = map[exportedName] || (map[exportedName] = []);
	if (existing.some((entry) => entry.moduleId === origin.moduleId && entry.mode === origin.mode && entry.importedName === origin.importedName)) {
		return;
	}
	existing.push(origin);
}

function resolveLocalExportTarget(spec: string, importerId: string): string | null {
	const importerPath = String(importerId || '').replace(/[?#].*$/, '');
	if (!importerPath) return null;
	const importerDir = path.dirname(importerPath);
	const candidates = [path.resolve(importerDir, spec), path.resolve(importerDir, `${spec}.ts`), path.resolve(importerDir, `${spec}.js`), path.resolve(importerDir, `${spec}.mjs`), path.resolve(importerDir, spec, 'index.ts'), path.resolve(importerDir, spec, 'index.js'), path.resolve(importerDir, spec, 'index.mjs')];
	for (const candidate of candidates) {
		if (existsSync(candidate) && !statSync(candidate).isDirectory()) {
			return candidate;
		}
	}
	return null;
}

export function collectStaticExportNamesFromFile(modulePath: string, seen: Set<string> = new Set()): string[] {
	return Object.keys(collectStaticExportOriginsFromFile(modulePath, modulePath, seen));
}

export function collectStaticExportOriginsFromFile(modulePath: string, rootEntryPath: string = modulePath, seen: Set<string> = new Set()): Record<string, CoreExportOrigin[]> {
	const cleanedPath = String(modulePath || '').replace(/[?#].*$/, '');
	const cleanedRoot = String(rootEntryPath || '').replace(/[?#].*$/, '');
	if (!cleanedPath || !cleanedRoot || seen.has(cleanedPath) || !existsSync(cleanedPath)) {
		return {};
	}
	seen.add(cleanedPath);
	let code = '';
	try {
		code = readFileSync(cleanedPath, 'utf8');
	} catch {
		return {};
	}
	const currentModuleId = runtimeModuleIdForFile(cleanedPath, cleanedRoot) || '@nativescript/core';
	const currentCanonicalSubpath = canonicalCoreSubpathForFile(cleanedPath, cleanedRoot);
	const origins: Record<string, CoreExportOrigin[]> = {};
	for (const name of extractDirectExportedNames(code)) {
		appendCoreExportOrigin(origins, name, { moduleId: currentModuleId, mode: 'named', importedName: name, canonicalSubpath: currentCanonicalSubpath || undefined });
	}
	const starAsRe = /\bexport\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g;
	let match: RegExpExecArray | null;
	while ((match = starAsRe.exec(code)) !== null) {
		const exportedName = match[1];
		const spec = match[2];
		const resolvedTarget = spec.startsWith('.') ? resolveLocalExportTarget(spec, cleanedPath) : null;
		const moduleId = resolvedTarget ? runtimeModuleIdForFile(resolvedTarget, cleanedRoot) : spec.startsWith('.') ? runtimeModuleIdFromLocalSpecifier(spec, currentModuleId) : spec;
		const canonicalSubpath = resolvedTarget ? canonicalCoreSubpathForFile(resolvedTarget, cleanedRoot) : spec.startsWith('.') ? canonicalCoreSubpathFromLocalSpecifier(spec, currentCanonicalSubpath) : undefined;
		if (!moduleId) continue;
		appendCoreExportOrigin(origins, exportedName, { moduleId, mode: 'module', canonicalSubpath: canonicalSubpath || undefined });
	}
	const namedReExportRe = /\bexport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
	while ((match = namedReExportRe.exec(code)) !== null) {
		const specList = match[1];
		const spec = match[2];
		const resolvedTarget = spec.startsWith('.') ? resolveLocalExportTarget(spec, cleanedPath) : null;
		const moduleId = resolvedTarget ? runtimeModuleIdForFile(resolvedTarget, cleanedRoot) : spec.startsWith('.') ? runtimeModuleIdFromLocalSpecifier(spec, currentModuleId) : spec;
		const canonicalSubpath = resolvedTarget ? canonicalCoreSubpathForFile(resolvedTarget, cleanedRoot) : spec.startsWith('.') ? canonicalCoreSubpathFromLocalSpecifier(spec, currentCanonicalSubpath) : undefined;
		if (!moduleId) continue;
		for (const { exportedName, importedName } of parseExportSpecList(specList)) {
			appendCoreExportOrigin(origins, exportedName, { moduleId, mode: 'named', importedName, canonicalSubpath: canonicalSubpath || undefined });
		}
	}
	const directBraceRe = /\bexport\s*\{([^}]+)\}(?!\s*from)/g;
	while ((match = directBraceRe.exec(code)) !== null) {
		for (const { exportedName, importedName } of parseExportSpecList(match[1])) {
			appendCoreExportOrigin(origins, exportedName, { moduleId: currentModuleId, mode: 'named', importedName, canonicalSubpath: currentCanonicalSubpath || undefined });
		}
	}
	const starRe = /^[ \t]*export\s+\*\s+from\s+["']([^"']+)["'];?[ \t]*$/gm;
	while ((match = starRe.exec(code)) !== null) {
		const spec = match[1];
		if (!spec.startsWith('.')) continue;
		const resolvedTarget = resolveLocalExportTarget(spec, cleanedPath);
		const moduleId = resolvedTarget ? runtimeModuleIdForFile(resolvedTarget, cleanedRoot) : runtimeModuleIdFromLocalSpecifier(spec, currentModuleId);
		const canonicalSubpath = resolvedTarget ? canonicalCoreSubpathForFile(resolvedTarget, cleanedRoot) : canonicalCoreSubpathFromLocalSpecifier(spec, currentCanonicalSubpath);
		if (!resolvedTarget) continue;
		const childOrigins = collectStaticExportOriginsFromFile(resolvedTarget, cleanedRoot, seen);
		for (const [exportedName, entries] of Object.entries(childOrigins)) {
			if (moduleId) {
				appendCoreExportOrigin(origins, exportedName, { moduleId, mode: 'named', importedName: exportedName, canonicalSubpath: canonicalSubpath || undefined });
			}
			for (const entry of entries) {
				appendCoreExportOrigin(origins, exportedName, entry);
			}
		}
	}
	return origins;
}

function repairImportEqualsAssignments(code: string): string {
	try {
		if (!code || typeof code !== 'string') return code;
		code = code.replace(/(^|\n)\s*import\s*\{([^}]+)\}\s*=\s*([^;]+);?/g, (_m, p1: string, specList: string, rhs: string) => {
			const cleaned = String(specList)
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => seg.replace(/\s+as\s+/i, ': '))
				.join(', ');
			return `${p1}const { ${cleaned} } = ${rhs};`;
		});
		code = code.replace(/(^|\n)\s*import\s*\*\s*as\s*([A-Za-z_$][\w$]*)\s*=\s*([^;]+);?/g, (_m, p1: string, ns: string, rhs: string) => `${p1}const ${ns} = (${rhs});`);
		code = code.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);?/g, (_m, p1: string, id: string, rhs: string) => `${p1}const ${id} = ${rhs};`);
	} catch {}
	return code;
}

function ensureVersionedRtImports(code: string, origin: string, ver: number): string {
	if (!code || !origin || !Number.isFinite(ver)) return code;
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?\/(?:\ns|ns)\/rt(?:\/[\d]+)?(["'])/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["']\s*\))/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	return code;
}

export function ensureVersionedCoreImports(code: string, origin: string, ver: number): string {
	try {
		code = code.replace(/(["'])(?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(\?p=[^"']+)?\1/g, (_m, q, qp) => `${q}/ns/core/${ver}${qp || ''}${q}`);
		code = code.replace(/import\(\s*(["'])(?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(\?p=[^"']+)?\1\s*\)/g, (_m, q, qp) => `import(${q}/ns/core/${ver}${qp || ''}${q})`);
	} catch {}
	return code;
}

function hasModuleDefaultExport(moduleCode: string): boolean {
	if (!moduleCode || typeof moduleCode !== 'string') return false;
	return /\bexport\s+default\b/.test(moduleCode) || /\bexport\s*\{[^}]*\bdefault\b[^}]*\}/.test(moduleCode);
}

export function buildVersionedCoreSubpathAliasModule(sub: string, ver: number | string, namedExports: string[] = [], hasDefaultExport: boolean = false): string {
	const normalizedSub = (sub || '').replace(/^\/+/, '');
	const canonicalUrl = `/ns/core/${ver}?p=${normalizedSub}`;
	const filteredExports = Array.from(new Set(namedExports)).filter((name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && name !== 'default' && name !== '__esModule');
	const exportLines = filteredExports.length ? `export { ${filteredExports.join(', ')} } from ${JSON.stringify(canonicalUrl)};\n` : `export * from ${JSON.stringify(canonicalUrl)};\n`;
	if (hasDefaultExport) {
		return `export { default } from ${JSON.stringify(canonicalUrl)};\n` + exportLines;
	}
	return `import * as __ns_core_alias from ${JSON.stringify(canonicalUrl)};\n` + `export default __ns_core_alias;\n` + exportLines;
}

export function buildVersionedCoreMainBridgeModule(key: string, ver: number | string, namedExports: string[] = [], exportOrigins: Record<string, CoreExportOrigin[]> = {}): string {
	const filteredExports = Array.from(new Set(namedExports)).filter((name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && name !== 'default' && name !== '__esModule');
	const namedExportDeclarations = filteredExports.length ? filteredExports.map((name) => `const ${name} = __getCoreExport(${JSON.stringify(name)});`).join('\n') + '\n' : '';
	const namedExportObjectLiteral = filteredExports.length ? `{ ${filteredExports.join(', ')} }` : '{}';
	const namedExportStatement = filteredExports.length ? `export { ${filteredExports.join(', ')} };\n` : '';
	const serializedExportOrigins = JSON.stringify(exportOrigins);
	const staticOriginImports = new Map<string, string>();
	const staticOriginImportLines: string[] = [];
	let staticOriginCounter = 0;
	for (const entries of Object.values(exportOrigins)) {
		for (const entry of entries) {
			if (!entry.canonicalSubpath) continue;
			if (staticOriginImports.has(entry.canonicalSubpath)) continue;
			const localName = `__ns_core_origin_${staticOriginCounter++}`;
			staticOriginImports.set(entry.canonicalSubpath, localName);
			staticOriginImportLines.push(`import * as ${localName} from ${JSON.stringify(`/ns/core/${ver}?p=${entry.canonicalSubpath}`)};`);
		}
	}
	const staticOriginModulesLiteral = staticOriginImports.size
		? `{ ${Array.from(staticOriginImports.entries())
				.map(([subpath, localName]) => `${JSON.stringify(subpath)}: ${localName}`)
				.join(', ')} }`
		: '{}';
	return (
		(staticOriginImportLines.length ? `${staticOriginImportLines.join('\n')}\n` : '') +
		REQUIRE_GUARD_SNIPPET +
		`// [ns-core-bridge][v${ver}] HTTP-only ESM bridge\n` +
		`const g = globalThis;\n` +
		`const reg = (g.__nsVendorRegistry ||= new Map());\n` +
		`const __unwrapNsModule = (mod) => {\n  if (!mod) return null;\n  try { if ((typeof mod === 'object' || typeof mod === 'function') && Object.prototype.hasOwnProperty.call(mod, 'default')) { const keys = Object.keys(mod).filter((entry) => entry !== '__esModule'); if (!keys.length || (keys.length === 1 && keys[0] === 'default')) return mod.default; } } catch {}\n  return mod;\n};\n` +
		`const __resolveNsModule = (moduleId) => {\n  try { if (typeof g.moduleExists === 'function' && g.moduleExists(moduleId) && typeof g.loadModule === 'function') { const mod = g.loadModule(moduleId); if (mod) return __unwrapNsModule(mod); } } catch {}\n  try { if (reg && reg.get) { const mod = reg.get(moduleId); if (mod) return __unwrapNsModule(mod); } } catch {}\n  try { const req = g.__nsVendorRequire || g.__nsRequire || g.require; if (typeof req === 'function') { const mod = req(moduleId); if (mod) return __unwrapNsModule(mod); } } catch {}\n  try { const nr = g.__nativeRequire; if (typeof nr === 'function') { const mod = nr(moduleId, '/'); if (mod) return __unwrapNsModule(mod); } } catch {}\n  return null;\n};\n` +
		`const __pickApplicationApi = (candidate) => {\n  if (!candidate) return null;\n  const candidates = [candidate, candidate.Application, candidate.app, candidate.application];\n  for (const entry of candidates) { if (entry && (typeof entry.run === 'function' || typeof entry.on === 'function' || typeof entry.resetRootView === 'function')) return entry; }\n  return null;\n};\n` +
		`let __nsPrimaryCoreReady = false;\nlet __nsPrimaryCore = null;\nconst __getPrimaryCore = () => { if (!__nsPrimaryCoreReady) { __nsPrimaryCore = __resolveNsModule(${JSON.stringify(key)}) || __resolveNsModule('@nativescript/core') || null; __nsPrimaryCoreReady = true; } return __nsPrimaryCore; };\n` +
		`let __nsCoreUiReady = false;\nlet __nsCoreUi = null;\nconst __getCoreUi = () => { if (!__nsCoreUiReady) { __nsCoreUi = __resolveNsModule('@nativescript/core/ui') || null; __nsCoreUiReady = true; } return __nsCoreUi; };\n` +
		`const __nsCoreExportOrigins = ${serializedExportOrigins};\nconst __nsCoreOriginModules = ${staticOriginModulesLiteral};\n` +
		`const __resolveFromExportOrigins = (name) => { const entries = __nsCoreExportOrigins && __nsCoreExportOrigins[name]; if (!entries || !entries.length) return undefined; for (const entry of entries) { try { const mod = (entry.canonicalSubpath && __nsCoreOriginModules[entry.canonicalSubpath]) || __resolveNsModule(entry.moduleId); if (!mod) continue; if (entry.mode === 'module') return mod; const importedName = entry.importedName || name; if (importedName === 'Application') { const picked = __pickApplicationApi(mod); if (picked) return picked; } if (mod && mod[importedName] !== undefined) return mod[importedName]; } catch {} } return undefined; };\n` +
		`const __getCoreExport = (name) => { if (name === 'Application' && g.Application && (typeof g.Application.run === 'function' || typeof g.Application.on === 'function' || typeof g.Application.resetRootView === 'function')) return g.Application; if (name === 'Application') { const appModule = __resolveNsModule('@nativescript/core/application'); const pickedApp = __pickApplicationApi(appModule); if (pickedApp) return pickedApp; } const primary = __getPrimaryCore(); if (name === 'Application') { const pickedPrimary = __pickApplicationApi(primary); if (pickedPrimary) return pickedPrimary; } try { if (primary && primary[name] !== undefined) return primary[name]; } catch {} const ui = __getCoreUi(); try { if (ui && ui[name] !== undefined) return ui[name]; } catch {} const viaOrigins = __resolveFromExportOrigins(name); if (viaOrigins !== undefined) return viaOrigins; try { const v = g[name]; if (v !== undefined) return v; } catch {} return undefined; };\n` +
		namedExportDeclarations +
		`const __nsNamedCore = ${namedExportObjectLiteral};\n` +
		`const __core = new Proxy(__nsNamedCore, { get(_t, p){ if (p === 'default') return __core; if (p === Symbol.toStringTag) return 'Module'; try { if (typeof p === 'string' && Object.prototype.hasOwnProperty.call(__nsNamedCore, p)) { const value = __nsNamedCore[p]; if (value !== undefined) return value; } } catch {} return __getCoreExport(p); } });\n` +
		namedExportStatement +
		`export default __core;\n`
	);
}

function stripViteDynamicImportVirtual(code: string): string {
	if (!/\/@id\/__x00__vite\/dynamic-import-helper/.test(code)) {
		return code;
	}
	const original = code;
	code = code.replace(/^[\t ]*import[^\n]*\/@id\/__x00__vite\/dynamic-import-helper[^\n]*$/gm, '');
	if (/\/@id\/__x00__vite\/dynamic-import-helper/.test(code)) {
		code = code.replace(/\/@id\/__x00__vite\/dynamic-import-helper[^"'`)]*/g, '/__NS_UNUSED_DYNAMIC_IMPORT_HELPER__');
	}
	if (!/__variableDynamicImportRuntimeHelper/.test(code)) {
		const inline = `const __variableDynamicImportRuntimeHelper = (map, request, importMode) => {\n  try { if (request === '@') { return import('/ns/m/__invalid_at__.mjs'); } } catch {}\n  const loader = map && (map[request] || map[request?.replace(/\\\\/g, '/')]);\n  if (!loader) { const e = new Error('Cannot dynamically import: ' + request); /*@ts-ignore*/ e.code = 'ERR_MODULE_NOT_FOUND'; return Promise.reject(e); }\n  try { return loader(importMode); } catch (e) { return Promise.reject(e); }\n};\n`;
		code = inline + code;
	}
	if (code !== original) {
		code = `// [hmr-sanitize] removed virtual dynamic-import-helper\n${code}`;
	}
	return code;
}

const REQUIRE_GUARD_SNIPPET = `// [guard] install require('http(s)://') detector\n(()=>{try{var g=globalThis;if(g.__NS_REQUIRE_GUARD_INSTALLED__){}else{var mk=function(o,l){return function(){try{var s=arguments[0];if(typeof s==='string'&&/^(?:https?:)\\/\\//.test(s)){var e=new Error('[ns-hmr][require-guard] require of URL: '+s+' via '+l);try{console.error(e.message+'\\n'+(e.stack||''));}catch(e2){}try{g.__NS_REQUIRE_GUARD_LAST__={spec:s,stack:e.stack,label:l,ts:Date.now()};}catch(e3){}}}catch(e1){}return o.apply(this, arguments);};};if(typeof g.require==='function'&&!g.require.__NS_REQ_GUARDED__){var o1=g.require;g.require=mk(o1,'require');g.require.__NS_REQ_GUARDED__=true;}if(typeof g.__nsRequire==='function'&&!g.__nsRequire.__NS_REQ_GUARDED__){var o2=g.__nsRequire;g.__nsRequire=mk(o2,'__nsRequire');g.__nsRequire.__NS_REQ_GUARDED__=true;}g.__NS_REQUIRE_GUARD_INSTALLED__=true;}}catch(e){}})();\n`;

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

// Extract a quick set of export names and whether a default export exists from ESM code.
// This uses conservative regex scanning for metadata only (no code rewriting).
function extractExportMetadata(code: string): {
	hasDefault: boolean;
	named: string[];
} {
	const named = new Set<string>();
	let hasDefault = /\bexport\s+default\b/.test(code);
	try {
		// export const foo, export let foo, export function bar, export class Baz
		for (const m of code.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
			if (m[1]) named.add(m[1]);
		}
		// export { a, b as c }
		for (const m of code.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
			const inner = (m[1] || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			for (const seg of inner) {
				// forms: name or name as alias or default as name
				const dm = seg.match(/^([A-Za-z_$][A-Za-z0-9_$]*)(?:\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*))?$/);
				if (dm) {
					const base = dm[1];
					const alias = dm[2];
					if (base === 'default') {
						hasDefault = true;
						continue;
					}
					named.add(alias || base);
				}
			}
		}
	} catch {}
	// Remove default if accidentally included
	named.delete('default');
	return { hasDefault, named: Array.from(named) };
}

function normalizeImportPath(spec: string, importerDir: string): string | null {
	if (!spec) return null;

	let key: string;
	if (spec.startsWith('/')) {
		key = spec;
	} else if (spec.startsWith('./') || spec.startsWith('../')) {
		key = path.posix.normalize(path.posix.join(importerDir, spec));
		if (!key.startsWith('/')) {
			key = '/' + key;
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
function cleanCode(code: string): string {
	let result = code;

	// Remove Vite client and hot module noise
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '');
	result = result.replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');
	// Keep import.meta.hot call sites; runtime now provides a stable import.meta.hot.

	result = ACTIVE_STRATEGY.preClean(result);
	result = ACTIVE_STRATEGY.rewriteFrameworkImports(result);

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
	result = ACTIVE_STRATEGY.postClean(result);
	result = stripCoreGlobalsImports(result);

	return result;
}

// ============================================================================
// APPLICATION IMPORT HELPERS
// ============================================================================

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

export function rewriteNsMImportPathForHmr(p: string, ver: string | number, bootTaggedRequest: boolean): string {
	const toHmrServeTag = (value: string | number): string => {
		const raw = String(value ?? '').trim();
		if (!raw) {
			return 'v0';
		}
		if (raw === 'live' || /^n\d+$/i.test(raw) || /^v[^/]+$/i.test(raw)) {
			return raw;
		}
		if (/^\d+$/.test(raw)) {
			return `v${raw}`;
		}
		return raw;
	};
	if (!p || !p.startsWith('/ns/m/')) {
		return p;
	}

	const canonicalNodeModulesPath = p.replace(/^\/ns\/m\/__ns_boot__\/b1\/__ns_hmr__\/[^/]+\/node_modules\//, '/ns/m/node_modules/').replace(/^\/ns\/m\/__ns_hmr__\/[^/]+\/node_modules\//, '/ns/m/node_modules/');

	if (canonicalNodeModulesPath.startsWith('/ns/m/node_modules/')) {
		return canonicalNodeModulesPath;
	}

	if (canonicalNodeModulesPath.startsWith('/ns/m/__ns_boot__/')) {
		return canonicalNodeModulesPath;
	}

	if (canonicalNodeModulesPath.startsWith('/ns/m/__ns_hmr__/')) {
		return bootTaggedRequest ? `/ns/m/__ns_boot__/b1${canonicalNodeModulesPath.slice('/ns/m'.length)}` : canonicalNodeModulesPath;
	}

	const tag = toHmrServeTag(ver);
	const hmrPrefix = `/ns/m/__ns_hmr__/${tag}`;
	const bootHmrPrefix = `/ns/m/__ns_boot__/b1/__ns_hmr__/${tag}`;
	return (bootTaggedRequest ? bootHmrPrefix : hmrPrefix) + canonicalNodeModulesPath.slice('/ns/m'.length);
}

function getNumericServeVersionTag(tag: string | null | undefined, fallback: number): number {
	const raw = String(tag || '').trim();
	if (!raw) {
		return fallback;
	}
	const versionMatch = raw.match(/^v(\d+)$/);
	if (versionMatch?.[1]) {
		return Number(versionMatch[1]);
	}
	if (/^\d+$/.test(raw)) {
		return Number(raw);
	}
	return fallback;
}

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
 * After the Angular linker runs on code that Vite has already resolved (bare
 * specifiers → full URLs), the linker injects NEW import statements with bare
 * specifiers (e.g. `import {Component} from '@angular/core'`).  These cause:
 *   1. Duplicate-identifier SyntaxErrors (the name was already imported via URL)
 *   2. Unresolvable bare specifiers at runtime on device
 *
 * This function:
 *   • builds a map  packageName → resolvedURL  from existing resolved imports
 *   • collects all binding names already imported per package
 *   • for each bare-specifier import, removes duplicate bindings
 *   • rewrites any genuinely-new bindings to use the resolved URL
 */
function deduplicateLinkerImports(code: string): string {
	if (!code) return code;
	try {
		const imports = collectTopLevelImportRecords(code);
		if (!imports.length) {
			return code;
		}

		// ── Step 1: collect resolved imports already in the file ──────────
		const pkgUrlMap = new Map<string, string>();
		const pkgBindings = new Map<string, Set<string>>();

		for (const imp of imports) {
			const url = imp.source;
			if (!/^https?:\/\//.test(url) && !url.startsWith('/')) {
				continue;
			}
			const nmIdx = url.lastIndexOf('/node_modules/');
			if (nmIdx === -1) continue;

			const afterNm = url.substring(nmIdx + '/node_modules/'.length);
			const parts = afterNm.split('/');
			const pkg = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];

			if (!pkgUrlMap.has(pkg)) pkgUrlMap.set(pkg, url);

			if (imp.namedBindings.length) {
				if (!pkgBindings.has(pkg)) pkgBindings.set(pkg, new Set());
				for (const binding of imp.namedBindings) {
					if (binding.importedName) pkgBindings.get(pkg)!.add(binding.importedName);
				}
			}
		}

		if (pkgUrlMap.size === 0) return code;

		// ── Step 2: rewrite bare-specifier imports ───────────────────────
		const edits: Array<{ start: number; end: number; text: string }> = [];
		for (const imp of imports) {
			if (!imp.hasOnlyNamedSpecifiers) {
				continue;
			}
			const specifier = imp.source;
			if (specifier.startsWith('/') || specifier.startsWith('.') || specifier.startsWith('http')) {
				continue;
			}

			const parts = specifier.split('/');
			const pkg = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
			const url = pkgUrlMap.get(pkg);
			if (!url) {
				continue;
			}

			const existing = pkgBindings.get(pkg) || new Set<string>();
			const newBindings = imp.namedBindings.filter((binding) => !existing.has(binding.importedName));

			if (newBindings.length === 0) {
				edits.push({ start: imp.start, end: imp.end, text: '' });
				continue;
			}

			if (newBindings.length === imp.namedBindings.length) {
				continue;
			}

			for (const binding of newBindings) {
				existing.add(binding.importedName);
			}

			edits.push({
				start: imp.start,
				end: imp.end,
				text: `import { ${newBindings.map((binding) => binding.text).join(', ')} } from ${JSON.stringify(url)};`,
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
	} catch {
		return code;
	}
}

export function wrapCommonJsModuleForDevice(code: string): string {
	if (!code) return code;

	try {
		const hasExportDefault = /\bexport\s+default\b/.test(code) || /export\s*\{\s*default\s*(?:as\s*default)?\s*\}/.test(code);
		const hasNamedExports = /\bexport\s+(?:const|let|var|function|class|async)\b/.test(code) || /\bexport\s*\{/.test(code);
		const hasCjsExports = /\bmodule\s*\.\s*exports\b/.test(code) || /\bexports\s*\.\s*\w/.test(code);
		if (hasExportDefault || hasNamedExports || !hasCjsExports) {
			return code;
		}

		const namedExports = new Set<string>();
		const exportsRe = /\bexports\s*\.\s*([A-Za-z_$][\w$]*)\s*=/g;
		let em: RegExpExecArray | null;
		while ((em = exportsRe.exec(code)) !== null) {
			const name = em[1];
			if (name !== '__esModule' && name !== 'default') {
				namedExports.add(name);
			}
		}

		const defPropRe = /Object\s*\.\s*defineProperty\s*\(\s*exports\s*,\s*['"]([^'"]+)['"]/g;
		while ((em = defPropRe.exec(code)) !== null) {
			const name = em[1];
			if (name !== '__esModule' && name !== 'default') {
				namedExports.add(name);
			}
		}

		let suffix = `\nvar __cjs_mod = module.exports;\nexport default __cjs_mod;\n`;
		if (namedExports.size) {
			const entries = Array.from(namedExports);
			const temps = entries.map((name, i) => `var __cjs_e${i} = __cjs_mod[${JSON.stringify(name)}];`);
			const reExports = entries.map((name, i) => `__cjs_e${i} as ${name}`);
			suffix += `${temps.join(' ')}\nexport { ${reExports.join(', ')} };\n`;
		}

		const prelude =
			`var module = { exports: {} }; var exports = module.exports;\n` +
			`var __ns_cjs_require_base = (typeof globalThis.__nsBaseRequire === 'function' ? globalThis.__nsBaseRequire : (typeof globalThis.__nsRequire === 'function' ? globalThis.__nsRequire : (typeof globalThis.require === 'function' ? globalThis.require : undefined)));\n` +
			`var __ns_cjs_require_kind = (typeof globalThis.__nsBaseRequire === 'function' ? 'base-require' : (typeof globalThis.__nsRequire === 'function' ? 'vendor-require' : 'global-require'));\n` +
			`var require = function(spec) {\n` +
			`  if (!__ns_cjs_require_base) { throw new Error('require is not defined'); }\n` +
			`  try { var __nsRecord = globalThis.__NS_RECORD_MODULE_PROVENANCE__; if (typeof __nsRecord === 'function') { __nsRecord(String(spec), { kind: __ns_cjs_require_kind, specifier: String(spec), via: 'cjs-wrapper', parent: (typeof import.meta !== 'undefined' && import.meta && import.meta.url) ? import.meta.url : undefined }); } } catch (e) {}\n` +
			`  var mod = __ns_cjs_require_base(spec);\n` +
			`  try {\n` +
			`    if (mod && (typeof mod === 'object' || typeof mod === 'function') && mod.default !== undefined) {\n` +
			`      var keys = [];\n` +
			`      try { keys = Object.keys(mod); } catch (e) {}\n` +
			`      var defaultOnly = keys.length === 1 && keys[0] === 'default';\n` +
			`      var esModuleOnly = keys.length === 2 && keys.indexOf('default') !== -1 && keys.indexOf('__esModule') !== -1;\n` +
			`      if (mod.__esModule || defaultOnly || esModuleOnly) { return mod.default; }\n` +
			`    }\n` +
			`  } catch (e) {}\n` +
			`  return mod;\n` +
			`};\n`;

		return `${prelude}${code}${suffix}`;
	} catch {
		return code;
	}
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
		`if (typeof process === "undefined") { globalThis.process = { env: ${__processEnvJson} }; } else if (!process.env) { process.env = ${__processEnvJson}; }`,
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
			// Ensure an import for the core bridge exists
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[\d]+)?(?:\?p=[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
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
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[\d]+)?(?:\?p=[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
			if (!hasImport) {
				result = `import __ns_core_bridge from "/ns/core";\n` + result;
			}
			result = result.replace(reqCoreRE1, (_m, p1, _sub) => `${p1}__ns_core_bridge`);
			result = result.replace(reqCoreRE2, '__ns_core_bridge');
		}
	} catch {}

	// Normalize stray string-literal side-effect lines that still reference @nativescript/core
	// into proper imports of the unified core bridge. This prevents the local-core-path
	// fast-fail from triggering due to upstream transforms that emitted naked literals.
	try {
		result = normalizeStrayCoreStringLiterals(result);
	} catch {}
	try {
		result = fixDanglingCoreFrom(result);
	} catch {}
	try {
		result = normalizeAnyCoreSpecToBridge(result);
	} catch {}

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
			const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
			result = result.replace(reNamed, (_full, pfx: string, specList: string, src: string) => {
				// Deep subpath URLs serve actual ESM with real named exports — skip.
				if (isDeepCoreSubpath(src)) return _full;
				__core_ns_seq++;
				const tmp = `__ns_core_ns${__core_ns_seq}`;
				const decl = `const { ${toDestructureCore(specList)} } = ${tmp};`;
				return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
			});
			const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
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
		// Only match after statement-ending characters (;, }, ), ], quotes) — NOT after `*` or
		// spaces inside JSDoc comment blocks, which would accidentally extract example imports
		// from documentation comments and hoist them as real code.
		result = result.replace(/([;}\)\]'"`])\s*(import\s+[^;\n]*\s+from\s*["'][^"']+["'])/g, '$1\n$2');
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
function assertNoOptimizedArtifacts(code: string, contextLabel: string): void {
	try {
		const offenders: string[] = [];
		const lines = code.split('\n');
		const tests: Array<RegExp> = [
			// Allow Vite dev indirections like /@id/ and /.vite/deps when served via HTTP.
			// Only flag clearly invalid virtual placeholders if they surface in output.
			/\b__VITE_PLUGIN__\b/,
			/\b__VITE_PRELOAD__\b/,
		];
		// Absolute or relative local @nativescript/core usage indicates a split realm risk; fail fast
		const localCore = /(^|[^\w@])(?:\.\.?\/|\/)??@nativescript[\/_-]core\//i;
		for (let i = 0; i < lines.length; i++) {
			const ln = lines[i];
			for (const re of tests) {
				if (re.test(ln)) {
					offenders.push(`${i + 1}: ${ln.substring(0, 200)}`);
					break;
				}
			}
			if (localCore.test(ln)) {
				// Comments can never cause split-realm risk at runtime — skip them.
				// Library authors commonly reference @nativescript/core in comments
				// (e.g. TSDoc /// <reference> directives, module resolution notes).
				const trimmed = ln.trimStart();
				if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
					continue;
				}
				if (shouldAllowLocalCoreSanitizerPaths(contextLabel)) {
					continue;
				}
				offenders.push(`${i + 1}: ${ln.substring(0, 200)} [local-core-path]`);
			}
			if (offenders.length >= 10) break;
		}
		if (offenders.length) {
			const msg = `[sanitize-fail] Optimized deps/virtual id artifacts detected in ${contextLabel}. These cannot be evaluated by the device HTTP ESM loader. Offending lines (first ${Math.min(5, offenders.length)} shown):\n` + offenders.slice(0, 5).join('\n');
			const err: any = new Error(msg);
			// Attach details for server logs / higher-level handlers
			(err as any).code = 'NS_SANITIZE_FAIL';
			(err as any).offenders = offenders;
			throw err;
		}
	} catch (e) {
		// If diagnostics generation itself fails, do not mask the underlying issue
		throw e;
	}
}

// Ensure there are no lingering named imports from the unified core bridge.
// Converts named imports from /ns/core[/ver][?p=...] into default import + destructuring.
function ensureDestructureCoreImports(code: string): string {
	try {
		let result = code;
		let coreImportCounter = 0;
		const toDestructure = (specList: string) =>
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => {
					const m = seg.split(/\s+as\s+/i);
					return m.length === 2 ? `${m[0].trim()}: ${m[1].trim()}` : seg;
				})
				.join(', ');
		// import { A, B } from '/ns/core[/ver][?p=...]'
		const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(reNamed, (_full, pfx: string, specList: string, src: string) => {
			// Deep subpath URLs serve actual ESM with real named exports — skip.
			if (isDeepCoreSubpath(src)) return _full;
			const tmp = `__ns_core_ns_re${coreImportCounter > 0 ? `_${coreImportCounter}` : ''}`;
			coreImportCounter++;
			const decl = `const { ${toDestructure(specList)} } = ${tmp};`;
			return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		// import Default, { A, B } from '/ns/core[...]'
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const decl = `const { ${toDestructure(specList)} } = ${defName};`;
			return `${pfx}import ${defName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		return result;
	} catch {
		return code;
	}
}

// Converts any named imports from the runtime bridge (/ns/rt[/ver]) into a default import + destructuring.
// This guarantees helper aliases like _resolveComponent remain bound even if we later normalize imports.
function ensureDestructureRtImports(code: string): string {
	try {
		let result = code;
		const toDestructure = (specList: string) =>
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => {
					// Preserve alias mapping (e.g., resolveComponent as _resolveComponent)
					const m = seg.split(/\s+as\s+/i);
					return m.length === 2 ? `${m[0].trim()}: ${m[1].trim()}` : seg;
				})
				.join(', ');
		const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)['"];?\s*/gm;
		result = result.replace(reNamed, (_full, pfx: string, specList: string, src: string) => {
			const tmp = `__ns_rt_ns_re`;
			const decl = `const { ${toDestructure(specList)} } = ${tmp};`;
			return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)['"];?\s*/gm;
		result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, _src: string) => {
			const decl = `const { ${toDestructure(specList)} } = ${defName};`;
			return `${pfx}import ${defName} from ${JSON.stringify(_src)};\n${decl}\n`;
		});
		return result;
	} catch {
		return code;
	}
}

// Remove overlapping named imports from /ns/rt that duplicate bindings already provided
// by destructuring a default /ns/rt import (e.g., const { $showModal } = __ns_rt_ns_1;).
function dedupeRtNamedImportsAgainstDestructures(code: string): string {
	try {
		let result = code;
		// Collect bindings created from any destructure of __ns_rt_ns* temps
		const rtDestructureRE = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?/gm;
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
		if (!rtBound.size) return result;
		// For any named import from /ns/rt (versioned or not), drop specifiers that are already bound
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
					const importedName = seg.split(/\s+as\s+/i)[0].trim();
					if (!rtBound.has(importedName)) kept.push(seg);
				});
			let replacement = '';
			if (kept.length) {
				replacement = `${pfx}import { ${kept.join(', ')} } from ${JSON.stringify(src)};`;
			} else {
				replacement = pfx || '';
			}
			edits.push({
				start: rtNamedImportRE.lastIndex - full.length,
				end: rtNamedImportRE.lastIndex,
				text: replacement,
			});
		}
		if (edits.length) {
			edits
				.sort((a, b) => b.start - a.start)
				.forEach((e) => {
					result = result.slice(0, e.start) + e.text + result.slice(e.end);
				});
		}
		return result;
	} catch {
		return code;
	}
}

/**
 * THE SINGLE REWRITE FUNCTION - used everywhere for consistency
 */
export function rewriteImports(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	let result = code;
	const httpOriginSafe = httpOrigin;
	const isDynamicImportPrefix = (prefix: string): boolean => /import\(\s*["']?$/.test(prefix.trimStart());
	const importerDir = path.posix.dirname(importerPath);
	// Determine importer output relative path (project-relative .mjs) to compute relative imports consistently
	const importerOutRel = outputDirOverrideRel || getProjectRelativeImportPath(importerPath, projectRoot) || stripToProjectRelative(importerPath, projectRoot).replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	const importerOutDir = importerOutRel ? path.posix.dirname(importerOutRel) : '';
	const ensureRel = (p: string) => (p.startsWith('.') ? p : `./${p}`);
	const isNsSfcSpecifier = (spec: string): boolean => /^(?:https?:\/\/[^/]+)?\/ns\/sfc(?:\/\d+)?(?:\/|$)/.test(spec.replace(PAT.QUERY_PATTERN, ''));

	// Normalize all @nativescript/core imports to the unified HTTP ESM core bridge to guarantee a single realm on device
	try {
		let coreAliasIdx = 0;
		const mkAlias = () => `__NSC${coreAliasIdx++}`;
		const coreUrl = (sub?: string) => {
			const p = (sub || '').replace(/^\//, '');
			return `${httpOriginSafe || ''}/ns/core` + (p ? `?p=${p}` : '');
		};
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
			if (cleanPath.startsWith('/')) {
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
				console.warn(`[rewrite] JSON file not found: ${fullPath}`);
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
				try {
					console.warn(`[rewrite] mapped bare '@' spec to stub: ${stub}`);
				} catch {}
			}
			return `${prefix}${stub}${suffix}`;
		}

		spec = normalizeNativeScriptCoreSpecifier(spec);

		// Route Vite virtual modules (/@solid-refresh, etc.) through /ns/m/ so their
		// internal imports (e.g. solid-js) get vendor-rewritten by our pipeline.
		// Skip known Vite internals (/@vite/, /@id/, /@fs/) which are handled elsewhere.
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

		if (shouldPreserveBareRuntimePluginSubpathImport(spec, projectRoot)) {
			const httpSpec = `/ns/m/node_modules/${spec.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '')}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
			}
			return `${prefix}${httpSpec}${suffix}`;
		}

		const nodeModulesSpecifier = normalizeNodeModulesSpecifier(spec);
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
			try {
				console.warn(`[rewrite] mapped dynamic import('@') to /ns/m/__invalid_at__.mjs via import.meta.url`);
			} catch {}
		}
		return stubExpr;
	});

	// Also guard static spec forms that could erroneously be '@'
	// 1) ESM: import { x } from '@'
	result = result.replace(/(from\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			try {
				console.warn(`[rewrite] mapped static from '@' to ${stub}`);
			} catch {}
		}
		return `${p1}${stub}${p2}`;
	});
	// 2) ESM side-effect: import '@'
	result = result.replace(/(import\s*(?!\()\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			try {
				console.warn(`[rewrite] mapped side-effect import '@' to ${stub}`);
			} catch {}
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

// ============================================================================
// PLUGIN
// ============================================================================

function createHmrWebSocketPlugin(opts: { verbose?: boolean }): Plugin {
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
	// Graph state
	interface GraphModule {
		id: string;
		deps: string[];
		hash: string;
	}
	let pluginRoot: string | undefined;
	let graphVersion = 0;
	// Transactional HMR batches: map graphVersion -> ordered list of changed ids for that version
	const txnBatches: Map<number, string[]> = new Map();
	const graph = new Map<string, GraphModule>();
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
	// Compute a dependency-closed, topologically sorted list of modules for a given set of changed ids.
	// Only include application modules we can serve (e.g., under /src and known .vue/.ts/.js entries in the graph).
	function computeTxnOrderForChanged(changedIds: string[]): string[] {
		const includeExt = (id: string) => ACTIVE_STRATEGY.matchesFile(id) || /\.(ts|js|mjs|tsx|jsx)$/i.test(id);
		const isApp = (id: string) => id.startsWith(APP_VIRTUAL_WITH_SLASH);
		const roots = changedIds.map(normalizeGraphId).filter((id) => graph.has(id) && (isApp(id) || ACTIVE_STRATEGY.matchesFile(id)) && includeExt(id));
		const toVisit = new Set<string>();
		// Collect dependency closure (downstream deps from roots)
		const stack: string[] = [...roots];
		while (stack.length) {
			const id = stack.pop()!;
			if (toVisit.has(id)) continue;
			toVisit.add(id);
			const m = graph.get(id);
			if (m) {
				for (const d of m.deps) {
					if (!graph.has(d)) continue;
					if ((isApp(d) || ACTIVE_STRATEGY.matchesFile(d)) && includeExt(d) && !toVisit.has(d)) {
						stack.push(d);
					}
				}
			}
		}
		// Topological order: deps first (post-order DFS)
		const ordered: string[] = [];
		const temp = new Set<string>();
		const perm = new Set<string>();
		const visit = (id: string) => {
			if (perm.has(id)) return;
			if (temp.has(id)) {
				perm.add(id);
				return;
			} // cycle: bail out
			temp.add(id);
			const m = graph.get(id);
			if (m) {
				for (const d of m.deps) {
					if (toVisit.has(d)) visit(d);
				}
			}
			temp.delete(id);
			perm.add(id);
			ordered.push(id);
		};
		for (const id of toVisit) visit(id);
		// Ensure we only include those that were part of closure (already ensured) and preserve an order where deps appear before dependents
		return ordered;
	}
	function normalizeGraphId(raw: string): string {
		if (!raw) return raw;
		let id = raw.split('?')[0].replace(/\\/g, '/');
		// Strip file:// prefix
		id = id.replace(/^file:\/\//, '');
		if (pluginRoot) {
			const rootNorm = pluginRoot.replace(/\\/g, '/');
			if (id.startsWith(rootNorm)) {
				id = id.slice(rootNorm.length);
			}
		}
		if (!id.startsWith('/')) id = '/' + id;
		// Collapse nested app root indicators when present (defensive)
		const idx = id.indexOf(APP_VIRTUAL_WITH_SLASH);
		if (idx !== -1) id = id.slice(idx);
		return id;
	}
	function computeHash(content: string): string {
		let h = 0;
		for (let i = 0; i < content.length; i++) {
			h = (h * 31 + content.charCodeAt(i)) | 0;
		}
		return ('00000000' + (h >>> 0).toString(16)).slice(-8);
	}
	function fullGraphPayload() {
		return {
			type: 'ns:hmr-full-graph',
			version: graphVersion,
			modules: Array.from(graph.values()).map((m) => ({
				id: m.id,
				deps: m.deps,
				hash: m.hash,
			})),
		};
	}
	function emitFullGraph(ws: WebSocket) {
		try {
			if (verbose) {
				try {
					const payload = fullGraphPayload();
					console.log('[hmr-ws][graph] emitFullGraph version', payload.version, 'modules=', payload.modules.length);
					if (payload.modules.length) {
						console.log(
							'[hmr-ws][graph] sample module ids',
							payload.modules.slice(0, 5).map((m: any) => m.id),
						);
					}
				} catch {}
			}
			ws.send(JSON.stringify(fullGraphPayload()));
		} catch {}
	}
	function emitDelta(changed: GraphModule[], removed: string[]) {
		if (!wss) return;
		// Record this version's txn batch order
		try {
			const changedIds = changed.map((m) => m.id);
			if (changedIds.length) {
				const ordered = computeTxnOrderForChanged(changedIds);
				txnBatches.set(graphVersion, ordered);
				// Keep only the last ~20 versions
				if (txnBatches.size > 20) {
					const drop = Array.from(txnBatches.keys())
						.sort((a, b) => a - b)
						.slice(0, txnBatches.size - 20);
					for (const k of drop) txnBatches.delete(k);
				}
			}
		} catch {}
		const payload = {
			type: 'ns:hmr-delta',
			baseVersion: graphVersion - 1,
			newVersion: graphVersion,
			changed: changed.map((m) => ({ id: m.id, deps: m.deps, hash: m.hash })),
			removed,
		};
		const json = JSON.stringify(payload);
		wss.clients.forEach((c) => {
			try {
				c.send(json);
			} catch {}
		});
	}
	function upsertGraphModule(rawId: string, code: string, deps: string[], options?: { emitDeltaOnInsert?: boolean }) {
		const id = normalizeGraphId(rawId);
		const normDeps = deps
			.map((d) => normalizeGraphId(d))
			.filter(Boolean)
			.slice()
			.sort();
		const hash = computeHash(code);
		const existing = graph.get(id);
		const classification = classifyGraphUpsert(existing, hash, normDeps);
		if (classification === 'unchanged') return existing;
		graphVersion++;
		const gm: GraphModule = { id, deps: normDeps, hash };
		graph.set(id, gm);
		if (verbose) {
			try {
				console.log('[hmr-ws][graph] upsert', { id, deps: normDeps, hash, graphVersion, classification });
				console.log('[hmr-ws][graph] size', graph.size);
			} catch {}
		}
		if (shouldBroadcastGraphUpsertDelta(classification, options?.emitDeltaOnInsert === true)) {
			emitDelta([gm], []);
		}
		return gm;
	}
	function isTypescriptFlavor(): boolean {
		try {
			return ACTIVE_STRATEGY?.flavor === 'typescript';
		} catch {
			return false;
		}
	}
	function removeGraphModule(id: string) {
		if (!graph.has(id)) return;
		graph.delete(id);
		graphVersion++;
		emitDelta([], [id]);
	}
	async function populateInitialGraph(server: ViteDevServer) {
		if (graph.size) return; // already populated
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
		async function walk(dir: string) {
			for (const name of fs.readdirSync(dir)) {
				const full = pathMod.join(dir, name);
				if (name === 'node_modules' || name.startsWith('.')) continue;
				try {
					const stat = fs.statSync(full);
					if (stat.isDirectory()) await walk(full);
					else if (stat.isFile()) {
						if (/\.(vue|ts|js|mjs|tsx|jsx)$/.test(name)) {
							const rel = '/' + pathMod.relative(root, full).split(pathMod.sep).join('/');
							// Transform via Vite to gather deps (ignore failures)
							try {
								const transformed = await server.transformRequest(rel);
								const code = transformed?.code || '';
								const deps: string[] = [];
								// fallback to import relationships via moduleGraph
								const modNode = server.moduleGraph.getModuleById(full) || server.moduleGraph.getModuleById(rel);
								if (modNode) {
									for (const m of modNode.importedModules) {
										if (m.id) deps.push(m.id.split('?')[0]);
									}
								}
								upsertGraphModule(rel, code, deps);
							} catch {}
						}
					}
				} catch {}
			}
		}
		try {
			await walk(pathMod.join(root, 'src'));
		} catch {}
	}
	return {
		name: 'nativescript-hmr-websocket',
		apply: 'serve',

		configureServer(server) {
			pluginRoot = (server as any).config?.root || process.cwd();
			const httpServer = server.httpServer;
			if (!httpServer) return;
			const wsAny = server.ws as any;
			if (!wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__) {
				const originalSend = server.ws.send.bind(server.ws);
				wsAny.__NS_ANGULAR_FULL_RELOAD_FILTER_INSTALLED__ = true;
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

					return originalSend(payload, ...rest);
				}) as typeof server.ws.send;
			}
			// Default to serialized transform execution for deterministic HTTP HMR startup.
			// Higher fan-out can be re-enabled explicitly via NS_VITE_HMR_TRANSFORM_CONCURRENCY.
			const configuredTransformConcurrency = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CONCURRENCY || '1', 10);
			const transformConcurrency = Number.isFinite(configuredTransformConcurrency) && configuredTransformConcurrency > 0 ? configuredTransformConcurrency : 1;
			const configuredTransformCacheMs = Number.parseInt(process.env.NS_VITE_HMR_TRANSFORM_CACHE_MS || '15000', 10);
			const transformCacheMs = Number.isFinite(configuredTransformCacheMs) && configuredTransformCacheMs >= 0 ? configuredTransformCacheMs : 15000;
			sharedTransformRequest = createSharedTransformRequestRunner(
				(url) => server.transformRequest(url),
				(url, timeoutMs) => {
					try {
						console.warn('[ns:m] slow transformRequest for', url, '(>' + timeoutMs + 'ms)');
					} catch {}
				},
				{
					maxConcurrent: transformConcurrency,
					resultCacheTtlMs: transformCacheMs,
					getResultCacheKey: (url) => canonicalizeTransformRequestCacheKey(url, pluginRoot || process.cwd()),
				},
			);

			// Attempt early vendor manifest bootstrap once per server.
			if (!vendorBootstrapDone) {
				vendorBootstrapDone = true;
				const root = (server as any).config?.root || process.cwd();
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
				try {
					if (verbose) {
						const ra = (req.socket as any)?.remoteAddress;
						const rp = (req.socket as any)?.remotePort;
						console.log('[hmr-ws] Client connected', ra + (rp ? ':' + rp : ''));
					}
				} catch {}
			});
			wss.on('error', (err) => {
				try {
					console.warn('[hmr-ws] server error:', err?.message || String(err));
				} catch {}
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
						flavor: ACTIVE_STRATEGY?.flavor || 'typescript',
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
					const transformRoot = (server as any).config?.root || process.cwd();
					const candidates: string[] = [];
					if (hasExt) candidates.push(spec);
					candidates.push(baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs');
					const transformCandidates = filterExistingNodeModulesTransformCandidates(spec, candidates, transformRoot);
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
					code = cleanCode(code);
					// preserveVendorImports=true: vendor imports stay as bare specifiers
					// for the device-side import map (ns-vendor://) instead of being
					// transformed to __nsVendorRequire calls with fragile __nsPick lookups.
					code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(resolvedCandidate || spec), resolvedCandidate || spec);
					code = rewriteImports(code, spec, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
					code = ensureVariableDynamicImportHelper(code);
					// Enforce upstream guarantee: no optimized deps or virtual ids remain
					try {
						assertNoOptimizedArtifacts(code, `SFC ASM ${spec}`);
					} catch (e) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						return void res.end(JSON.stringify({ error: (e as any)?.message || String(e) }));
					}
					// Optional diagnostics: when ?diag=1, inject simple entry/exit logs to help isolate
					// execution-time failures on device without changing semantics.
					try {
						const wantDiag = urlObj.searchParams.get('diag') === '1';
						if (wantDiag) {
							const importerPath = spec.replace(/[?#].*$/, '');
							const enter = `try { console.log('[sfc][enter]', ${JSON.stringify(importerPath)}, 'hasReq=', (typeof globalThis.__nsRequire==='function'||typeof globalThis.require==='function')); } catch {}`;
							const exit = `\n;try { console.log('[sfc][loaded]', ${JSON.stringify(importerPath)}); } catch {}`;
							code = `${enter}\n${code}${exit}`;
						}
					} catch {}
					try {
						const origin = getServerOrigin(server);
						code = ensureVersionedRtImports(code, origin, graphVersion);
						code = ACTIVE_STRATEGY.ensureVersionedImports(code, origin, graphVersion);
						code = ensureVersionedCoreImports(code, origin, graphVersion);
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
							const depCandidates = filterExistingNodeModulesTransformCandidates(depBase, [depBase + '.ts', depBase + '.js', depBase + '.tsx', depBase + '.jsx', depBase + '.mjs', depBase + '.mts', depBase + '.cts', depBase + '.vue', depBase + '/index.ts', depBase + '/index.js', depBase + '/index.tsx', depBase + '/index.jsx', depBase + '/index.mjs'], transformRoot);
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
								depCode = cleanCode(depCode);
								depCode = processCodeForDevice(depCode, false, true, /(?:^|\/)node_modules\//.test(depResolved), depResolved);
								depCode = rewriteImports(depCode, depResolved, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
								depCode = ensureVariableDynamicImportHelper(depCode);
								try {
									assertNoOptimizedArtifacts(depCode, `SFC ASM dep ${depResolved}`);
								} catch (e) {
									/* don't include bad deps */ continue;
								}
								try {
									depCode = ensureVersionedRtImports(depCode, getServerOrigin(server), graphVersion);
									depCode = ACTIVE_STRATEGY.ensureVersionedImports(depCode, getServerOrigin(server), graphVersion);
									depCode = ensureVersionedCoreImports(depCode, getServerOrigin(server), graphVersion);
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

			// 2) ESM endpoint for application modules: GET /ns/m?path=/abs OR /ns/m/abs -> returns JS module
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (!urlObj.pathname.startsWith('/ns/m')) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					// Disable caching for dev ESM endpoints to avoid device-side stale module reuse
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					// Support both query (?path=/abs) and path-style (/ns/m/abs)
					let spec = urlObj.searchParams.get('path') || '';
					// Optional graph version pin for deterministic boot
					let forcedVer = urlObj.searchParams.get('v');
					let bootTaggedRequest = false;
					if (!spec) {
						const base = '/ns/m';
						let rest = urlObj.pathname.slice(base.length);
						if (rest && rest !== '/') spec = rest;
					}
					// Special-case stub for anomalous '@' imports emitted as '/__invalid_at__.mjs'
					if (spec === '/__invalid_at__.mjs' || spec === '__invalid_at__.mjs') {
						res.statusCode = 200;
						res.end("// invalid '@' import stub\nexport {}\n");
						return;
					}
					if (!spec) {
						res.statusCode = 200;
						res.end('export {}\n');
						return;
					}
					const serverRoot = ((server as any).config?.root || process.cwd()) as string;
					spec = spec.replace(/[?#].*$/, '');
					// Accept path-based boot/HMR prefixes:
					//   /ns/m/__ns_boot__/b1/<real-spec>
					//   /ns/m/__ns_hmr__/<tag>/<real-spec>
					//   /ns/m/__ns_boot__/b1/__ns_hmr__/<tag>/<real-spec>
					// The iOS HTTP ESM loader canonicalizes cache keys by stripping query params,
					// so we must carry the cache-buster in the path.
					try {
						const decorated = stripDecoratedServePrefixes(spec);
						spec = decorated.cleanedSpec;
						bootTaggedRequest = decorated.bootTaggedRequest;
						forcedVer ||= decorated.forcedVer;
					} catch {}
					// Normalize absolute filesystem paths back to project-relative ids (e.g. /src/app.ts)
					try {
						const toPosix = (p: string) => p.replace(/\\/g, '/');
						const rootPosix = toPosix(serverRoot);
						const specPosix = toPosix(spec);
						// If spec is an absolute path under the project root, convert to '/'+relative
						const isAbsFs = /^\//.test(specPosix) || /^[A-Za-z]:\//.test(spec); // posix or win drive
						if (isAbsFs) {
							let rel = specPosix.startsWith(rootPosix) ? specPosix.slice(rootPosix.length) : require('path').posix.relative(rootPosix, specPosix);
							if (!rel.startsWith('..')) {
								if (!rel.startsWith('/')) rel = '/' + rel;
								// Ensure leading '/src' style when path maps into src
								spec = rel;
							}
						}
					} catch {}
					// Serve Vite virtual modules (/@id/ prefix). These are internal
					// virtual modules (e.g., \0nsvite:nsconfig-json for ~/package.json)
					// that don't exist on disk. Decode the ID and load via plugin container.
					if (spec.startsWith('/@id/')) {
						try {
							// First try Vite's transform pipeline directly
							const vr = await sharedTransformRequest(spec);
							if (vr?.code) {
								res.statusCode = 200;
								res.end(vr.code);
								return;
							}
						} catch {}
						try {
							// Fallback: decode the virtual module ID (__x00__ → \0) and
							// load through the plugin container directly
							const rawId = spec.slice('/@id/'.length).replace(/__x00__/g, '\0');
							const loadResult = await (server as any).pluginContainer.load(rawId);
							if (loadResult) {
								const code = typeof loadResult === 'string' ? loadResult : loadResult.code;
								if (code) {
									res.statusCode = 200;
									res.end(code);
									return;
								}
							}
						} catch {}
					}
					if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
					if (spec.startsWith('./')) spec = spec.slice(1);
					const blockedNodeModulesReason = getBlockedDeviceNodeModulesReason(spec);
					if (blockedNodeModulesReason) {
						res.statusCode = 404;
						res.end(`// [ns:m] blocked device import\nthrow new Error(${JSON.stringify(`[ns/m] ${blockedNodeModulesReason}`)});\nexport {};\n`);
						return;
					}
					if (!spec.startsWith('/')) spec = '/' + spec;
					const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
					const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
					const candidates = [...(hasExt ? [spec] : []), baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs'];
					const transformCandidates = filterExistingNodeModulesTransformCandidates(spec, candidates, serverRoot);
					let transformed: TransformResult | null = null;
					let resolvedCandidate: string | null = null;
					const rawExplicitModule = tryReadRawExplicitJavaScriptModule(spec, serverRoot);
					if (rawExplicitModule) {
						transformed = { code: rawExplicitModule.code } as TransformResult;
						resolvedCandidate = rawExplicitModule.resolvedId;
					}
					// Queue and dedupe transformRequest calls so heavy app graphs do not
					// overwhelm Vite with concurrent work. Slow-transform warnings start only
					// when the transform actually begins executing, and requests stay pending
					// until Vite returns a real result.
					const transformWithTimeout = (url: string, timeoutMs = 120000): Promise<TransformResult | null> => {
						return sharedTransformRequest(url, timeoutMs);
					};
					if (!transformed?.code) {
						for (const cand of transformCandidates) {
							try {
								const r = await transformWithTimeout(cand);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = cand;
									break;
								}
							} catch {}
						}
					}
					// Fallback 1: ask Vite to resolve the id, then transform the resolved id (handles aliases and virtual ids)
					if (!transformed?.code) {
						try {
							const rid = await (server as any).pluginContainer?.resolveId?.(spec, undefined);
							const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
							if (ridStr) {
								const r = await transformWithTimeout(ridStr);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = ridStr;
								}
							}
						} catch {}
					}
					// Fallback 1b: if spec is a /node_modules/ path, extract bare specifier
					// and try resolveId with that. This handles package.json "exports" field
					// resolution (e.g., solid-js/jsx-runtime → solid-js/dist/solid.js).
					if (!transformed?.code && spec.includes('/node_modules/')) {
						try {
							const nmIdx = spec.lastIndexOf('/node_modules/');
							const bare = spec.slice(nmIdx + '/node_modules/'.length);
							if (bare && !bare.startsWith('.')) {
								const rid = await (server as any).pluginContainer?.resolveId?.(bare, undefined);
								const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
								if (ridStr) {
									const r = await sharedTransformRequest(ridStr);
									if (r?.code) {
										transformed = r;
										resolvedCandidate = ridStr;
									}
								}
							}
						} catch {}
					}
					// Fallback 2: try /@fs absolute path under project root (Vite file system alias)
					if (!transformed?.code) {
						try {
							const toPosix = (p: string) => p.replace(/\\/g, '/');
							const rootPosix = toPosix(serverRoot).replace(/\/$/, '');
							const absPosix = `${rootPosix}${spec.startsWith('/') ? '' : '/'}${spec}`;
							const fsId = `/@fs${absPosix}`;
							if (resolveCandidateFilePath(fsId, serverRoot)) {
								const r = await transformWithTimeout(fsId);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = fsId;
								}
							}
						} catch {}
					}
					// Fallback 3: try adding ?import to hint Vite's transform pipeline
					if (!transformed?.code) {
						for (const cand of transformCandidates) {
							try {
								const r = await transformWithTimeout(`${cand}${cand.includes('?') ? '&' : '?'}import`);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = `${cand}?import`;
									break;
								}
							} catch {}
						}
					}
					// Solid HMR: patch @@solid-refresh's $$refreshESM to do inline patching
					// during module re-evaluation instead of deferring to hot.accept() callback.
					// In NativeScript's HTTP ESM environment, accept callbacks are registered
					// but not invoked by the HMR client. By adding a direct patchRegistry()
					// call when hot.data already has a stored registry, component updates
					// apply immediately when the module re-evaluates.
					try {
						if (transformed?.code && ACTIVE_STRATEGY?.flavor === 'solid' && (resolvedCandidate || spec || '').includes('@solid-refresh')) {
							const PATCH_SENTINEL = '/* __ns_solid_refresh_patched__ */';
							const alreadyPatched = transformed.code.includes(PATCH_SENTINEL);
							console.log('[hmr-ws][solid] @solid-refresh patch check:', { spec: resolvedCandidate || spec, alreadyPatched, codeLen: transformed.code.length });
							if (!alreadyPatched) {
								let patchedCode = transformed.code;

								// Patch 1: Bypass shouldWarnAndDecline() — the vendor-bundled solid-js
								// may not have the 'development' condition active, making DEV empty/undefined.
								// In NativeScript HMR mode we are always in dev, so force it to return false.
								const declineCheck = 'function shouldWarnAndDecline() {';
								if (patchedCode.includes(declineCheck)) {
									patchedCode = patchedCode.replace(declineCheck, `${PATCH_SENTINEL}\nfunction shouldWarnAndDecline() { return false; /* NS HMR: always allow refresh */ }\nfunction __original_shouldWarnAndDecline() {`);
									console.log('[hmr-ws][solid] bypassed shouldWarnAndDecline() for NativeScript HMR');
								}

								// Patch 2: Force createMemo path in createProxy.
								// Without the 'development' condition, $DEVCOMP is not set on components,
								// so createProxy falls through to `return s(props)` — a direct call with
								// no reactive subscription. When patchComponent fires update() (the signal
								// setter), nobody is listening. By forcing the createMemo path, HMRComp
								// subscribes to the signal and re-renders when the component changes.
								const proxyCondition = 'if (!s || $DEVCOMP in s) {';
								if (patchedCode.includes(proxyCondition)) {
									patchedCode = patchedCode.replace(proxyCondition, 'if (true) { /* NS HMR: always use createMemo for reactive HMR updates */');
									console.log('[hmr-ws][solid] forced createMemo path in createProxy for NativeScript HMR');
								}

								// Patch 3: Inline patchRegistry call so updates apply immediately
								// on module re-evaluation (accept callbacks are not invoked by the HMR client).
								const marker = 'hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;';
								if (patchedCode.includes(marker)) {
									const patchCode = [
										`console.log('[solid-refresh][$$refreshESM] hot.data keys=', hot.data ? Object.keys(hot.data) : 'no-data', 'has=', !!(hot.data && hot.data[SOLID_REFRESH]));`,
										`if (hot.data[SOLID_REFRESH]) {`,
										`  console.log('[solid-refresh][$$refreshESM] patching: oldComponents=', hot.data[SOLID_REFRESH].components ? hot.data[SOLID_REFRESH].components.size : 0, 'newComponents=', registry.components ? registry.components.size : 0);`,
										`  var _shouldInvalidate = patchRegistry(hot.data[SOLID_REFRESH], registry);`,
										`  console.log('[solid-refresh][$$refreshESM] patchRegistry result: shouldInvalidate=', _shouldInvalidate);`,
										`} else {`,
										`  console.log('[solid-refresh][$$refreshESM] first load — creating registry, components=', registry.components ? registry.components.size : 0);`,
										`}`,
									].join('\n    ');
									patchedCode = patchedCode.replace(marker, `${patchCode}\n    ${marker}`);
									console.log('[hmr-ws][solid] added inline patchRegistry for NativeScript HMR');
								}

								// Work on a copy to avoid mutating Vite's cached TransformResult
								transformed = { ...transformed, code: patchedCode };
							}
						}
					} catch {}
					// NOTE: Path-based cache busting for /ns/m/* imports is applied in the
					// finalize step below (after rewriteImports adds the /ns/m/ prefix).
					// The block here only handles TypeScript-specific graph population.
					try {
						if (transformed?.code) {
							const code = transformed.code;
							// TypeScript-specific graph population: when TS flavor is active
							// and this is an application module under the virtual app root,
							// upsert it into the HMR graph so ns:hmr-full-graph is non-empty.
							try {
								if (isTypescriptFlavor()) {
									const id = (resolvedCandidate || spec).replace(/[?#].*$/, '');
									// Only track app modules (under APP_VIRTUAL_WITH_SLASH) and ts/js/tsx/jsx/mjs.
									const isApp = id.startsWith(APP_VIRTUAL_WITH_SLASH) || id.startsWith('/app/');
									if (isApp && /\.(ts|tsx|js|jsx|mjs|mts|cts)$/i.test(id)) {
										const deps = Array.from(collectImportDependencies(code, id));
										if (verbose) {
											try {
												console.log('[hmr-ws][ts-graph] candidate', { id, depsCount: deps.length });
											} catch {}
										}
										upsertGraphModule(id, code, deps);
									}
								}
							} catch {}
						}
					} catch {}
					// If transformRequest failed, handle bare-module vendor shims for 'vue' and 'pinia'
					if (!transformed?.code) {
						const bare = spec.startsWith('/') ? spec.slice(1) : spec;
						const isBare = bare && !bare.includes('/') && !/\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(bare);
						if (isBare && (bare === 'vue' || bare === 'nativescript-vue' || bare === 'pinia')) {
							const pkg = bare;
							let code = '';
							if (pkg === 'vue' || pkg === 'nativescript-vue') {
								// Re-export Vue helpers from vendor NativeScript-Vue (fallback to 'vue' if present)
								code = `
const g = globalThis;
const reg = g.__nsVendorRegistry;
const req = reg && g.__nsVendorRequire ? g.__nsVendorRequire : (g.__nsRequire || g.require);
let mod = reg && reg.get('${pkg === 'vue' ? 'nativescript-vue' : 'nativescript-vue'}');
if (!mod && req) {
  try { mod = req('${pkg === 'vue' ? 'nativescript-vue' : 'nativescript-vue'}'); } catch {}
  ${pkg === 'vue' ? "if (!mod) { try { mod = req('vue'); } catch {} }" : ''}
}
mod = mod || {};
const v = (mod.default ?? mod);
export default v;
export const defineComponent = v.defineComponent;
export const resolveComponent = v.resolveComponent;
export const createVNode = v.createVNode;
export const createTextVNode = v.createTextVNode;
export const createCommentVNode = v.createCommentVNode;
export const Fragment = v.Fragment;
export const withCtx = v.withCtx;
export const openBlock = v.openBlock;
export const createBlock = v.createBlock;
export const createElementVNode = v.createElementVNode || v.createVNode;
export const createElementBlock = v.createElementBlock || v.createBlock;
export const renderSlot = v.renderSlot;
export const mergeProps = v.mergeProps;
export const toHandlers = v.toHandlers;
export const renderList = v.renderList;
export const normalizeProps = v.normalizeProps;
export const guardReactiveProps = v.guardReactiveProps;
export const withDirectives = v.withDirectives;
export const resolveDirective = v.resolveDirective;
export const withModifiers = v.withModifiers;
export const withKeys = v.withKeys;
export const ref = v.ref;
export const shallowRef = v.shallowRef;
export const unref = v.unref;
export const computed = v.computed;
export const onMounted = v.onMounted;
export const onBeforeUnmount = v.onBeforeUnmount;
export const onUnmounted = v.onUnmounted;
export const watch = v.watch;
export const nextTick = v.nextTick;
export const createApp = v.createApp || (vm && vm.createApp);
export const registerElement = v.registerElement || (vm && vm.registerElement);
export const normalizeClass = v.normalizeClass;
export const normalizeStyle = v.normalizeStyle;
export const toDisplayString = v.toDisplayString;
`;
							} else if (pkg === 'pinia') {
								// Re-export Pinia APIs from vendor pinia module
								code = `
const g = globalThis;
const reg = g.__nsVendorRegistry;
const req = reg && g.__nsVendorRequire ? g.__nsVendorRequire : (g.__nsRequire || g.require);
let mod = reg && reg.get('pinia');
if (!mod && req) { try { mod = req('pinia'); } catch {} }
mod = mod || {};
const p = (mod.default ?? mod);
export default p;
export const createPinia = p.createPinia;
export const defineStore = p.defineStore;
export const storeToRefs = p.storeToRefs;
export const setActivePinia = p.setActivePinia;
export const getActivePinia = p.getActivePinia;
export const mapStores = p.mapStores;
export const mapState = p.mapState;
export const mapGetters = p.mapGetters;
export const mapActions = p.mapActions;
export const mapWritableState = p.mapWritableState;
export const piniaSymbol = p.piniaSymbol;
`;
							}
							res.statusCode = 200;
							res.end(code || 'export {}\n');
							return;
						}
						// Generic bare module resolution via Vite plugin container
						if (isBare) {
							try {
								const resolved = await (server as any).pluginContainer?.resolveId?.(spec, undefined);
								const resolvedId = typeof resolved === 'string' ? resolved : resolved?.id || null;
								if (resolvedId) {
									const r = await server.transformRequest(resolvedId);
									if (r?.code) {
										transformed = r;
										resolvedCandidate = resolvedId;
									}
								}
							} catch {}
						}
						if (!transformed?.code) {
							// Emit a module that throws with context for easier on-device debugging
							try {
								const tried = Array.from(new Set(transformCandidates.length > 0 ? transformCandidates : candidates)).slice(0, 12);
								const out = `// [ns:m] transform miss path=${spec} tried=${tried.length}\n` + `throw new Error(${JSON.stringify(`[ns/m] transform failed for ${spec} (tried ${tried.length} candidates).`)});\nexport {};\n`;
								res.statusCode = 404;
								res.end(out);
								return;
							} catch {
								res.statusCode = 404;
								res.end('export {}\n');
								return;
							}
						}
					}
					let code = transformed.code;
					// Prepend guard to capture any URL-based require attempts
					code = REQUIRE_GUARD_SNIPPET + code;
					code = cleanCode(code);
					const isNodeMod = /(?:^|\/)node_modules\//.test(resolvedCandidate || spec || '');
					code = processCodeForDevice(code, false, true, isNodeMod, resolvedCandidate || spec);
					// Solid HMR: The NativeScript iOS/Android runtime provides import.meta.hot
					// natively (via InitializeImportMetaHot in HMRSupport.mm) with C++-backed
					// persistent hot.data that survives across module re-evaluations.
					// cleanCode() strips Vite's __vite__createHotContext assignment, which is
					// correct — the runtime's native hot context is better.
					// We inject a diagnostic log to trace hot.data state during development.
					try {
						if (ACTIVE_STRATEGY?.flavor === 'solid' && /\.(tsx|jsx)$/i.test(resolvedCandidate || spec)) {
							const moduleId = (resolvedCandidate || spec).replace(/[?#].*$/, '');
							// Diagnostic: log import.meta.hot state on device to trace solid-refresh flow
							code = `try{if(typeof import.meta!=='undefined'&&import.meta.hot){var _hd=import.meta.hot.data;var _sr=_hd&&_hd['solid-refresh'];console.log('[solid-hmr][native-hot]',${JSON.stringify(moduleId)},'hasHot=true','hasData=',!!_hd,'hasSolidRefresh=',!!_sr,'dataKeys=',_hd?Object.keys(_hd):[]);}else{console.log('[solid-hmr][native-hot]',${JSON.stringify(moduleId)},'hasHot=',!!(typeof import.meta!=='undefined'&&import.meta.hot));}}catch(e){console.log('[solid-hmr][native-hot] error',e);}\n` + code;
							console.log('[hmr-ws][solid] diagnostic injected for', moduleId, '(using runtime native import.meta.hot)');
						}
					} catch {}
					code = rewriteImports(code, resolvedCandidate || spec, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server), true);

					// Expand `export * from "url"` into explicit named re-exports.
					// NativeScript's HTTP ESM loader may not propagate star-re-exports across
					// HTTP module boundaries (the namespace object gets direct exports but
					// misses re-exported names). By expanding to `export { a, b } from "url"`,
					// the engine sees explicit named exports and resolves them correctly.
					try {
						code = await expandStarExports(code, server, (server as any).config?.root || process.cwd(), verbose);
					} catch (e: any) {
						if (verbose) console.warn('[ns/m] export* expansion failed:', e?.message);
					}

					// Dedupe any /ns/rt named imports that duplicate destructured bindings off default /ns/rt
					try {
						code = dedupeRtNamedImportsAgainstDestructures(code);
					} catch {}
					code = ensureVariableDynamicImportHelper(code);
					// Final safety: guard any plain dynamic import(...) occurrences to reroute anomalous '@' specs
					try {
						code = ensureGuardPlainDynamicImports(code, getServerOrigin(server));
					} catch {}
					// Extra hardening: normalize any remaining core references to the unified bridge
					// - Stray string-literals
					// - Dangling `from` merges
					// - Any spec (including /node_modules resolves) that still references '@nativescript/core'
					// Do this right before the final fast-fail assertion. If a rewrite occurred, add a small marker for diagnostics.
					try {
						const __before = code;
						code = normalizeStrayCoreStringLiterals(code);
						code = fixDanglingCoreFrom(code);
						code = normalizeAnyCoreSpecToBridge(code);
						if (code !== __before) {
							code = `// [hmr-sanitize] core-literal->bridge\n` + code;
						}
					} catch {}
					// Final pass: deduplicate/resolve any bare-specifier imports that slipped
					// through the pipeline (e.g., extracted from JSDoc comments by import-splitting
					// regexes, or injected by the Angular linker on already-resolved code).
					try {
						code = deduplicateLinkerImports(code);
					} catch {}
					// CJS/UMD wrapping: if a module uses module.exports but has no ESM export default,
					// wrap it with CJS shims so the device HTTP ESM loader can consume it.
					// This handles npm packages that use CommonJS but aren't pre-bundled by Vite.
					//
					// Key constraints this must handle:
					//  - CJS modules often declare local vars with the same names as their exports
					//    (e.g. `function createLTTB() {...}; exports.createLTTB = createLTTB;`)
					//    so `export var { createLTTB }` would cause a duplicate declaration.
					//  - UMD modules reference `this` at top level (undefined in ESM) but
					//    typically fall back to `self` or `globalThis`.
					//  - `module`, `exports` must be shims since they don't exist in ESM.
					try {
						code = wrapCommonJsModuleForDevice(code);
					} catch {}
					try {
						assertNoOptimizedArtifacts(code, `NS M ${resolvedCandidate || spec}`);
					} catch (e) {
						res.statusCode = 500;
						return void res.end(`throw new Error(${JSON.stringify((e as any)?.message || String(e))});\nexport {};`);
					}
					// Defensive export normalization: if a module defines `routes` and only exports it named,
					// add a default export alias so both `import { routes }` and `import routes` work.
					try {
						if (!/\bexport\s+default\b/.test(code)) {
							const hasNamedRoutes = /\bexport\s*\{\s*routes\s*\}/.test(code);
							const hasConstRoutes = /\bconst\s+routes\s*=/.test(code) || /\bvar\s+routes\s*=/.test(code) || /\blet\s+routes\s*=/.test(code);
							if (hasNamedRoutes && hasConstRoutes) {
								code += `\nexport default routes;\n`;
							}
						}
					} catch {}

					try {
						const verNum = getNumericServeVersionTag(forcedVer, Number(graphVersion || 0));
						code = ensureVersionedRtImports(code, getServerOrigin(server), verNum);
						code = ACTIVE_STRATEGY.ensureVersionedImports(code, getServerOrigin(server), verNum);
						code = ensureVersionedCoreImports(code, getServerOrigin(server), verNum);
					} catch {}
					// Finalize: stamp all internal /ns/m imports with PATH-based cache busting.
					// IMPORTANT: use path prefix (not ?v= query) because the iOS HTTP ESM loader
					// strips query params when computing module cache keys, so ?v= doesn't bust the V8 cache.
					try {
						const ver = (() => {
							const raw = String(forcedVer || '').trim();
							if (raw) {
								if (raw === 'live' || /^n\d+$/i.test(raw) || /^v[^/]+$/i.test(raw)) {
									return raw;
								}
								if (/^\d+$/.test(raw)) {
									return `v${raw}`;
								}
							}
							return `v${String(graphVersion || 0)}`;
						})();
						const origin = getServerOrigin(server);
						const rewritePath = (p: string) => rewriteNsMImportPathForHmr(p, ver, bootTaggedRequest);
						// 1) Static imports: import ... from "/ns/m/..."
						code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
						// 2) Side-effect imports: import "/ns/m/..."
						code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
						// 3) Dynamic imports: import("/ns/m/...")
						code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
						// 4) new URL("/ns/m/...", import.meta.url)
						code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
						// 5) __ns_import(new URL('/ns/m/...', import.meta.url).href)
						code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, (_m: string, a: string, p: string, b: string) => `${a}${rewritePath(p)}${b}`);
						// 6) Force absolute HTTP for new URL('/ns/m/...', import.meta.url).href → "${origin}/ns/m/__ns_hmr__/..."
						try {
							code = code.replace(/new\s+URL\(\s*["'](\/ns\/m\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}${rewritePath(p1)}`)}`);
						} catch {}
						// 7) Also fix SFC new URL('/ns/sfc/...', import.meta.url).href → "${origin}/ns/sfc/<ver>/..."
						try {
							code = code.replace(/new\s+URL\(\s*["']\/ns\/sfc(\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}/ns/sfc/${ver}${p1}`)}`);
						} catch {}
					} catch {}
					// Final guard: eliminate any lingering named imports from /ns/core to avoid
					// evaluation-time "does not provide an export named ..." in the device runtime.
					try {
						code = ensureDestructureCoreImports(code);
					} catch {}

					// Boot-time module graph progress: while the app is still replacing the
					// placeholder, emit lightweight progress updates as /ns/m modules begin
					// evaluating. This keeps the overlay moving during large initial graphs.
					try {
						if (bootTaggedRequest) {
							const bootModuleLabel = String(spec || '').replace(/\\/g, '/');
							const bootProgressSnippet = buildBootProgressSnippet(bootModuleLabel);
							code = bootProgressSnippet + code;
							code = hoistTopLevelStaticImports(code);
						}
					} catch {}

					// Dev-only: link-check static imports to surface missing bindings early
					try {
						const devCheck = process.env.NODE_ENV !== 'production';
						if (devCheck) {
							const ast = babelParse(code, {
								sourceType: 'module',
								plugins: MODULE_IMPORT_ANALYSIS_PLUGINS,
							}) as any;
							const imports: Array<{ src: string; wantsDefault: boolean }> = [];
							babelTraverse(ast, {
								ImportDeclaration(p: any) {
									const src = p.node.source.value;
									if (typeof src !== 'string') return;
									const wantsDefault = p.node.specifiers.some((s: any) => s.type === 'ImportDefaultSpecifier');
									imports.push({ src, wantsDefault });
								},
							});
							// Resolve and verify each static import that asks for default
							for (const imp of imports) {
								if (!imp.wantsDefault) continue;
								// Only check our served endpoints and app modules
								if (/^https?:\/\/[^\s]+\/ns\//.test(imp.src) || /^https?:\/\/[^\s]+\/.+/.test(imp.src)) {
									const u = new URL(imp.src, 'http://localhost');
									// Fetch target module's sanitized code using server.transformRequest or by routing through our own endpoints heuristically
									let targetCode = '';
									try {
										if (u.pathname.startsWith('/ns/asm')) {
											// Reconstruct: call our own assembler handler to get code (preferred)
											const target = await server.transformRequest(imp.src.replace(/^https?:\/\/[^/]+/, ''));
											targetCode = target?.code || '';
										} else if (u.pathname.startsWith('/ns/sfc')) {
											// Delegator re-exports default from /ns/asm — skip; assembler will be checked when imported by upstream
											continue;
										} else if (u.pathname.startsWith('/ns/m')) {
											// Resolve to local project path and transform with same candidate logic as /ns/m handler
											let local = u.pathname.replace(/^\/ns\/m/, '');
											try {
												// Normalize project-relative path
												if (local.startsWith('@/')) local = APP_VIRTUAL_WITH_SLASH + local.slice(2);
												if (local.startsWith('./')) local = local.slice(1);
												if (!local.startsWith('/')) local = '/' + local;
												const hasExt = /(\.ts|\.tsx|\.js|\.jsx|\.mjs|\.mts|\.cts|\.vue)$/i.test(local);
												const baseNoExt = hasExt ? local.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : local;
												const cands = [...(hasExt ? [local] : []), baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs'];
												let t: TransformResult | null = null;
												for (const cand of cands) {
													try {
														const r = await server.transformRequest(cand);
														if (r?.code) {
															t = r;
															break;
														}
													} catch {}
													if (t?.code) break;
												}
												if (!t?.code) {
													try {
														const rid = await (server as any).pluginContainer?.resolveId?.(local, undefined);
														const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
														if (ridStr) {
															const r2 = await server.transformRequest(ridStr);
															if (r2?.code) t = r2;
														}
													} catch {}
												}
												targetCode = t?.code || '';
											} catch {}
										} else if (u.pathname.startsWith('/ns/rt') || u.pathname.startsWith('/ns/core')) {
											// Bridges export named/default as needed; skip default check
											continue;
										}
									} catch {}
									if (!targetCode) continue;
									const hasDefault = /\bexport\s+default\b/.test(targetCode) || /export\s*\{\s*default\s*(?:as\s*default)?\s*\}/.test(targetCode);
									if (!hasDefault) {
										// CJS/UMD modules won't have `export default` — they get CJS-wrapped
										// by the serving pipeline. Only warn, don't fatally block the importer.
										const hasCjsPattern = /\bmodule\s*\.\s*exports\b/.test(targetCode) || /\bexports\s*\.\s*\w/.test(targetCode);
										if (hasCjsPattern) {
											try {
												console.warn(`[ns:m][link-check] CJS module without export default: ${u.pathname} (will be CJS-wrapped at serve time)`);
											} catch {}
											continue;
										}
										const msg = `[link-check] Missing default export in ${u.pathname}${u.search} (imported by ${resolvedCandidate || spec})`;
										// Emit a module that throws to surface the exact offender
										res.statusCode = 200;
										res.end(`throw new Error(${JSON.stringify(msg)});\nexport {};`);
										return;
									}
								}
							}
						}
					} catch (eLC) {
						try {
							console.warn('[ns:m][link-check] failed', (eLC as any)?.message || eLC);
						} catch {}
					}
					// Diagnostic: dump served code to terminal when ?__diag=1 is in the original URL
					try {
						if (urlObj?.searchParams?.get('__diag') === '1') {
							const specId = resolvedCandidate || spec;
							console.log(`\n${'='.repeat(80)}\n[ns:m][DIAG] ${specId}\n${'='.repeat(80)}`);
							console.log(code);
							console.log(`${'='.repeat(80)}\n[ns:m][DIAG] END ${specId}\n${'='.repeat(80)}\n`);
						}
					} catch {}
					res.statusCode = 200;
					res.end(code);
				} catch (e) {
					try {
						console.warn('[sfc-asm] error serving', req.url, e && (e as any).message ? (e as any).message : e);
					} catch {}
					res.statusCode = 500;
					res.end('export {}\n');
				}
			});

			// 2.5) ESM runtime bridge for NativeScript-Vue: GET /ns/rt
			// Provides a single authoritative source of Vue helpers bound to the NativeScript renderer.
			// V2.1: Lazy ensure bridge — does not statically import vue. It lazily resolves helpers from
			// globalThis or vendor registry/require on first evaluation, then exports references so SFCs
			// can immediately call them during module evaluation.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					// Accept only /ns/rt and /ns/rt/<ver> for cache-busting semantics
					if (!(urlObj.pathname === '/ns/rt' || /^\/ns\/rt\/[\d]+$/.test(urlObj.pathname))) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					const rtVerSeg = urlObj.pathname.replace(/^\/ns\/rt\/?/, '');
					const rtVer = /^[0-9]+$/.test(rtVerSeg) ? rtVerSeg : String(graphVersion || 0);
					const origin = getServerOrigin(server);
					let code =
						`// [ns-rt][v2.3] NativeScript-Vue runtime bridge (module-scoped cache, no globals)\n` +
						`const __origin = ((typeof globalThis !== 'undefined' && globalThis && globalThis.__NS_HTTP_ORIGIN__) || (new URL(import.meta.url)).origin);\n` +
						`let __ns_core_bridge = null; try { import(__origin + "/ns/core/${rtVer}").then(m => { __ns_core_bridge = m; }).catch(() => {}); } catch {}\n` +
						`const g = globalThis;\n` +
						`const reg = (g.__nsVendorRegistry ||= new Map());\n` +
						`const req = reg && reg.get ? (g.__nsVendorRequire || g.__nsRequire || g.require) : (g.__nsRequire || g.require);\n` +
						`let __cached_rt = null;\n` +
						`let __cached_vm = null;\n` +
						`const __RT_REALM_TAG = (globalThis.__NS_RT_REALM__ ||= Math.random().toString(36).slice(2));\n` +
						// Unconditional one-shot evaluation marker to confirm bridge is executed on device
						`try { if (!(globalThis.__NS_RT_ONCE__ && globalThis.__NS_RT_ONCE__.eval)) { (globalThis.__NS_RT_ONCE__ ||= {}).eval = true; console.log('[ns-rt] evaluated', { rtRealm: __RT_REALM_TAG }); } } catch {}\n` +
						`function __ensure(){\n` +
						`  if (__cached_rt) return __cached_rt;\n` +
						`  let vm = null;\n` +
						`  try { vm = reg && reg.has && reg.has('nativescript-vue') ? reg.get('nativescript-vue') : (typeof req==='function' ? req('nativescript-vue') : null); } catch {}\n` +
						`  if (!vm) { try { vm = reg && reg.has && reg.has('vue') ? reg.get('vue') : (typeof req==='function' ? req('vue') : null); } catch {} }\n` +
						`  const rt = (vm && (vm.default ?? vm)) || {};\n` +
						`  __cached_vm = vm;\n` +
						`  __cached_rt = rt;\n` +
						`  return rt;\n` +
						`}\n` +
						`// Soft-globals for @nativescript/core when missing (dev-only safety)\n` +
						`try {\n` +
						`  const dev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;\n` +
						`  if (dev) {\n` +
						`    const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {};\n` +
						`    if (ns) {\n` +
						`      if (!g.Frame && ns.Frame) g.Frame = ns.Frame;\n` +
						`      if (!g.Page && ns.Page) g.Page = ns.Page;\n` +
						`      if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application);\n` +
						`    }\n` +
						`  }\n` +
						`} catch {}\n` +
						`const __get = (k) => { const rt = __ensure(); const v = rt && rt[k]; if (typeof v !== 'function' && v === undefined) { throw new Error('[ns-rt] missing export '+k); } return v; };\n` +
						`export const __realm = __RT_REALM_TAG;\n` +
						`export const defineComponent = (...a) => (__get('defineComponent'))(...a);\n` +
						`export const resolveComponent = (...a) => (__ensure().resolveComponent)(...a);\n` +
						`export const createVNode = (...a) => (__ensure().createVNode)(...a);\n` +
						`export const createTextVNode = (...a) => (__ensure().createTextVNode)(...a);\n` +
						`export const createCommentVNode = (...a) => (__ensure().createCommentVNode)(...a);\n` +
						`export const Fragment = (__ensure().Fragment);\n` +
						`export const Teleport = (__ensure().Teleport);\n` +
						`export const Transition = (__ensure().Transition);\n` +
						`export const TransitionGroup = (__ensure().TransitionGroup);\n` +
						`export const KeepAlive = (__ensure().KeepAlive);\n` +
						`export const Suspense = (__ensure().Suspense);\n` +
						`export const withCtx = (...a) => (__ensure().withCtx)(...a);\n` +
						`export const openBlock = (...a) => (__ensure().openBlock)(...a);\n` +
						`export const createBlock = (...a) => (__ensure().createBlock)(...a);\n` +
						`export const createElementVNode = (...a) => (__ensure().createElementVNode)(...a);\n` +
						`export const createElementBlock = (...a) => (__ensure().createElementBlock)(...a);\n` +
						`export const renderSlot = (...a) => (__ensure().renderSlot)(...a);\n` +
						`export const mergeProps = (...a) => (__ensure().mergeProps)(...a);\n` +
						`export const toHandlers = (...a) => (__ensure().toHandlers)(...a);\n` +
						`export const renderList = (...a) => (__ensure().renderList)(...a);\n` +
						`export const normalizeProps = (...a) => (__ensure().normalizeProps)(...a);\n` +
						`export const guardReactiveProps = (...a) => (__ensure().guardReactiveProps)(...a);\n` +
						`export const normalizeClass = (...a) => (__ensure().normalizeClass)(...a);\n` +
						`export const normalizeStyle = (...a) => (__ensure().normalizeStyle)(...a);\n` +
						`export const toDisplayString = (...a) => (__ensure().toDisplayString)(...a);\n` +
						`export const withDirectives = (...a) => (__ensure().withDirectives)(...a);\n` +
						`export const resolveDirective = (...a) => (__ensure().resolveDirective)(...a);\n` +
						`export const withModifiers = (...a) => (__ensure().withModifiers)(...a);\n` +
						`export const withKeys = (...a) => (__ensure().withKeys)(...a);\n` +
						`export const resolveDynamicComponent = (...a) => (__ensure().resolveDynamicComponent)(...a);\n` +
						`export const isVNode = (...a) => (__ensure().isVNode)(...a);\n` +
						`export const cloneVNode = (...a) => (__ensure().cloneVNode)(...a);\n` +
						`export const isRef = (...a) => (__ensure().isRef)(...a);\n` +
						`export const ref = (...a) => (__ensure().ref)(...a);\n` +
						`export const shallowRef = (...a) => (__ensure().shallowRef)(...a);\n` +
						`export const unref = (...a) => (__ensure().unref)(...a);\n` +
						`export const computed = (...a) => (__ensure().computed)(...a);\n` +
						`export const reactive = (...a) => (__ensure().reactive)(...a);\n` +
						`export const readonly = (...a) => (__ensure().readonly)(...a);\n` +
						`export const isReactive = (...a) => (__ensure().isReactive)(...a);\n` +
						`export const isReadonly = (...a) => (__ensure().isReadonly)(...a);\n` +
						`export const toRaw = (...a) => (__ensure().toRaw)(...a);\n` +
						`export const markRaw = (...a) => (__ensure().markRaw)(...a);\n` +
						`export const shallowReactive = (...a) => (__ensure().shallowReactive)(...a);\n` +
						`export const shallowReadonly = (...a) => (__ensure().shallowReadonly)(...a);\n` +
						`export const watch = (...a) => (__ensure().watch)(...a);\n` +
						`export const watchEffect = (...a) => (__ensure().watchEffect)(...a);\n` +
						`export const watchPostEffect = (...a) => (__ensure().watchPostEffect)(...a);\n` +
						`export const watchSyncEffect = (...a) => (__ensure().watchSyncEffect)(...a);\n` +
						`export const onBeforeMount = (...a) => (__ensure().onBeforeMount)(...a);\n` +
						`export const onMounted = (...a) => (__ensure().onMounted)(...a);\n` +
						`export const onBeforeUpdate = (...a) => (__ensure().onBeforeUpdate)(...a);\n` +
						`export const onUpdated = (...a) => (__ensure().onUpdated)(...a);\n` +
						`export const onBeforeUnmount = (...a) => (__ensure().onBeforeUnmount)(...a);\n` +
						`export const onUnmounted = (...a) => (__ensure().onUnmounted)(...a);\n` +
						`export const onActivated = (...a) => (__ensure().onActivated)(...a);\n` +
						`export const onDeactivated = (...a) => (__ensure().onDeactivated)(...a);\n` +
						`export const onErrorCaptured = (...a) => (__ensure().onErrorCaptured)(...a);\n` +
						`export const onRenderTracked = (...a) => (__ensure().onRenderTracked)(...a);\n` +
						`export const onRenderTriggered = (...a) => (__ensure().onRenderTriggered)(...a);\n` +
						`export const nextTick = (...a) => (__ensure().nextTick)(...a);\n` +
						`export const h = (...a) => (__ensure().h)(...a);\n` +
						`export const provide = (...a) => (__ensure().provide)(...a);\n` +
						`export const inject = (...a) => (__ensure().inject)(...a);\n` +
						`export const vShow = (__ensure().vShow);\n` +
						`export const createApp = (...a) => (__ensure().createApp)(...a);\n` +
						`export const registerElement = (...a) => (__ensure().registerElement)(...a);\n` +
						`export const $navigateTo = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); try { if (!(g && g.Frame)) { const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {}; if (ns) { if (!g.Frame && ns.Frame) g.Frame = ns.Frame; if (!g.Page && ns.Page) g.Page = ns.Page; if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application); } } } catch {} try { const hmrRealm = (g && g.__NS_HMR_REALM__) || 'unknown'; const hasTop = !!(g && g.Frame && g.Frame.topmost && g.Frame.topmost()); const top = hasTop ? g.Frame.topmost() : null; const ctor = top && top.constructor && top.constructor.name; } catch {} if (g && typeof g.__nsNavigateUsingApp === 'function') { try { return g.__nsNavigateUsingApp(...a); } catch (e) { try { console.error('[ns-rt] $navigateTo app navigator error', e); } catch {} throw e; } } try { console.error('[ns-rt] $navigateTo unavailable: app navigator missing'); } catch {} throw new Error('$navigateTo unavailable: app navigator missing'); } ;\n` +
						`export const $navigateBack = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$navigateBack || (vm.default && vm.default.$navigateBack))) || (rt && (rt.$navigateBack || (rt.runtimeHelpers && rt.runtimeHelpers.navigateBack))); let res; try { const via = (impl && (impl === (vm && vm.$navigateBack) || impl === (vm && vm.default && vm.default.$navigateBack))) ? 'vm' : (impl ? 'rt' : 'none'); } catch {} try { if (typeof impl === 'function') res = impl(...a); } catch {} try { const top = (g && g.Frame && g.Frame.topmost && g.Frame.topmost()); if (!res && top && top.canGoBack && top.canGoBack()) { res = top.goBack(); } } catch {} try { const hook = g && (g.__NS_HMR_ON_NAVIGATE_BACK || g.__NS_HMR_ON_BACK || g.__nsAttemptBackRemount); if (typeof hook === 'function') hook(); } catch {} return res; }\n` +
						`export const $showModal = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$showModal || (vm.default && vm.default.$showModal))) || (rt && (rt.$showModal || (rt.runtimeHelpers && rt.runtimeHelpers.showModal))); try { if (typeof impl === 'function') return impl(...a); } catch (e) { } return undefined; }\n` +
						`export default {\n` +
						`  defineComponent, resolveComponent, createVNode, createTextVNode, createCommentVNode,\n` +
						`  Fragment, Teleport, Transition, TransitionGroup, KeepAlive, Suspense, withCtx, openBlock,\n` +
						`  createBlock, createElementVNode, createElementBlock, renderSlot, mergeProps, toHandlers,\n` +
						`  renderList, normalizeProps, guardReactiveProps, normalizeClass, normalizeStyle, toDisplayString,\n` +
						`  withDirectives, resolveDirective, withModifiers, withKeys, resolveDynamicComponent,\n` +
						`  isVNode, cloneVNode, isRef, ref, shallowRef, unref, computed, reactive, readonly, isReactive, isReadonly, toRaw, markRaw, shallowReactive, shallowReadonly,\n` +
						`  watch, watchEffect, watchPostEffect, watchSyncEffect, onBeforeMount, onMounted, onBeforeUpdate, onUpdated,\n` +
						`  onBeforeUnmount, onUnmounted, onActivated, onDeactivated, onErrorCaptured, onRenderTracked, onRenderTriggered, nextTick, h, provide, inject, vShow, createApp, registerElement,\n` +
						`  $navigateTo, $navigateBack, $showModal\n` +
						`};\n`;
					// Prepend guard and ship (harmless, keeps diagnostics consistent)
					code = REQUIRE_GUARD_SNIPPET + code;
					res.statusCode = 200;
					res.end(code);
				} catch (e) {
					res.statusCode = 500;
					res.end('export {}\n');
				}
			});

			// 2.55) Dev-only vendor import unifier: rewrite 'vue'/'nativescript-vue' to /ns/rt/<ver>
			// This ensures plugins and app share a single Vue/NativeScript-Vue instance/realm.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					const p = urlObj.pathname || '';
					// Ignore our own core/rt bridge endpoints and non-JS assets, but DO allow /ns/m/* through
					if (/^\/ns\/(?:rt|core)(?:\/|$)/.test(p)) return next();
					if (!/(\.m?js$|\.ts$|\/node_modules\/|\/\.vite\/deps\/|^\/@id\/|^\/@fs\/)/.test(p)) return next();
					if (/\.css($|\?)/.test(p)) return next();
					const reqUrl = req.url || '';
					const transformed = await server.transformRequest(reqUrl);
					if (!transformed?.code) return next();
					const origin = getServerOrigin(server);
					const ver = Number(graphVersion || 0);
					const rewrite = ACTIVE_STRATEGY.rewriteVendorSpec;
					if (!rewrite) return next();
					const before = transformed.code;
					const code = rewrite(before, origin, ver);
					if (code === before) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					res.statusCode = 200;
					res.end(code);
				} catch {
					return next();
				}
			});

			// 2.6) ESM bridge for @nativescript/core: GET /ns/core[/<ver>][?p=sub/path]
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					// Match /ns/core, /ns/core/<ver>, and /ns/core/<subpath> (path-based deep imports)
					if (!urlObj.pathname.startsWith('/ns/core')) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					const afterCore = urlObj.pathname.replace(/^\/ns\/core\/?/, '');
					const hasExplicitVersion = /^[0-9]+$/.test(afterCore);
					const ver = /^[0-9]+$/.test(afterCore) ? afterCore : String(graphVersion || 0);
					// Support both query-based (?p=data/observable/index.js) and
					// path-based (/ns/core/data/observable/index.js) subpath formats.
					// The device's HTTP ESM loader may use either depending on the import map.
					const sub = urlObj.searchParams.get('p') || (afterCore && !/^[0-9]+$/.test(afterCore) ? afterCore : '');
					const key = sub ? `@nativescript/core/${sub}` : `@nativescript/core`;

					// Any @nativescript/core subpath import (including shallow ones like
					// `utils`) may expose exports that are not available from the root
					// vendor bundle namespace. Serve the actual transformed module content
					// instead of the lightweight proxy bridge.
					if (sub) {
						try {
							const normalizedSub = sub.replace(/^\/+/, '');
							const projectRoot = (server as any).config?.root || process.cwd();
							const coreSpecifier = `@nativescript/core/${normalizedSub}`;
							const resolved = await (server as any).pluginContainer?.resolveId?.(coreSpecifier, undefined);
							const resolvedId = typeof resolved === 'string' ? resolved : resolved?.id || null;
							const modulePath = resolvedId || `/node_modules/@nativescript/core/${normalizedSub}`;
							const transformed = await sharedTransformRequest(modulePath);

							if (!hasExplicitVersion) {
								if (transformed?.code) {
									const expandedModuleCode = await expandStarExports(transformed.code, server, projectRoot, verbose);
									res.statusCode = 200;
									res.end(buildVersionedCoreSubpathAliasModule(normalizedSub, ver, extractExportedNames(expandedModuleCode), hasModuleDefaultExport(expandedModuleCode)));
									return;
								}
								res.statusCode = 200;
								res.end(buildVersionedCoreSubpathAliasModule(normalizedSub, ver));
								return;
							}
							if (transformed?.code) {
								// Minimal pipeline: Vite already produces correct ESM.
								// ONLY rewrite specifier strings to device-fetchable URLs.
								// Do NOT run processCodeForDevice, rewriteImports, or any
								// other heavy transform — those mangle newlines, eat exports,
								// and cause cascading "does not provide an export" failures.
								const moduleCode = rewriteSpecifiersForDevice(transformed.code, getServerOrigin(server), Number(ver));
								res.statusCode = 200;
								res.end(moduleCode);
								return;
							}
						} catch (e) {
							try {
								console.warn('[ns-core-bridge] deep subpath serve failed:', sub, (e as any)?.message);
							} catch {}
						}
					}

					// Main entry or shallow subpath: use proxy bridge
					let code = buildVersionedCoreMainBridgeModule(key, ver);
					if (!sub) {
						try {
							const projectRoot = (server as any).config?.root || process.cwd();
							const coreSpecifier = '@nativescript/core';
							const resolved = await (server as any).pluginContainer?.resolveId?.(coreSpecifier, undefined);
							const resolvedId = typeof resolved === 'string' ? resolved : resolved?.id || null;
							const modulePath = resolvedId || '/node_modules/@nativescript/core/index.js';
							const staticExportNames = collectStaticExportNamesFromFile(modulePath);
							const staticExportOrigins = collectStaticExportOriginsFromFile(modulePath);
							if (staticExportNames.length) {
								code = buildVersionedCoreMainBridgeModule(key, ver, staticExportNames, staticExportOrigins);
							} else {
								const transformed = await sharedTransformRequest(modulePath);
								if (transformed?.code) {
									const expandedModuleCode = await expandStarExports(transformed.code, server, projectRoot, verbose);
									code = buildVersionedCoreMainBridgeModule(key, ver, extractExportedNames(expandedModuleCode));
								}
							}
						} catch (e) {
							try {
								console.warn('[ns-core-bridge] main bridge export discovery failed:', (e as any)?.message);
							} catch {}
						}
					}
					res.statusCode = 200;
					res.end(code);
				} catch (e) {
					next();
				}
			});

			// 2.6a) Serve compiled entry runtime module: GET /ns/entry-rt[?v=<ver>]
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (!(urlObj.pathname === '/ns/entry-rt')) return next();
					try {
						if (verbose) {
							const ra = (req.socket as any)?.remoteAddress;
							const rp = (req.socket as any)?.remotePort;
							console.log('[hmr-http] GET /ns/entry-rt from', ra + (rp ? ':' + rp : ''));
						}
					} catch {}
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					let content = '';
					try {
						const _req = createRequire(import.meta.url);
						const entryRtPath = _req.resolve('@nativescript/vite/hmr/entry-runtime.js');
						content = readFileSync(entryRtPath, 'utf-8');
					} catch (e) {
						// .js not found (source tree without build) — transform .ts on the fly
						try {
							const tsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'entry-runtime.ts');
							if (existsSync(tsPath)) {
								const tsSource = readFileSync(tsPath, 'utf-8');
								const result = babelCore.transformSync(tsSource, {
									filename: tsPath,
									plugins: [[pluginTransformTypescript, { isTSX: false, allowDeclareFields: true }]],
									sourceType: 'module',
								});
								if (result?.code) {
									content = result.code;
								}
							}
						} catch (e2) {
							if (verbose) console.warn('[hmr-http] entry-runtime.ts transform failed', e2);
						}
						if (!content) {
							content = 'export default async function start(){ console.error("[/ns/entry-rt] not found"); }\n';
						}
					}
					console.log('[hmr-http] /ns/entry-rt serving', content.length, 'bytes');
					res.statusCode = 200;
					res.end(content);
				} catch (e) {
					console.warn('[hmr-http] /ns/entry-rt error', e);
					next();
				}
			});

			// 2.6b) HTTP-only app entry endpoint: GET /ns/entry[/<ver>]
			// Thin wrapper that imports the compiled entry runtime and starts it with parameters.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (!(urlObj.pathname === '/ns/entry' || /^\/ns\/entry\/[\d]+$/.test(urlObj.pathname))) return next();
					try {
						if (verbose) {
							const ra = (req.socket as any)?.remoteAddress;
							const rp = (req.socket as any)?.remotePort;
							console.log('[hmr-http] GET /ns/entry from', ra + (rp ? ':' + rp : ''));
						}
					} catch {}
					const verSeg = urlObj.pathname.replace(/^\/ns\/entry\/?/, '');
					// Resolve app main entry to an absolute path-like key used by /ns/m
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					const ver = /^[0-9]+$/.test(verSeg) ? verSeg : String(graphVersion || 0);
					const origin = getServerOrigin(server) || `${urlObj.protocol}//${urlObj.host}`;
					// Resolve app main entry to an absolute path-like key used by /ns/m
					let mainEntry = '/';
					try {
						const pkg = getPackageJson();
						const main = pkg?.main || DEFAULT_MAIN_ENTRY;
						const abs = getProjectFilePath(main).replace(/\\/g, '/');
						// Normalize to '/app/...'
						const marker = `/${APP_ROOT_DIR}/`;
						const idx = abs.indexOf(marker);
						mainEntry = idx >= 0 ? abs.substring(idx) : DEFAULT_MAIN_ENTRY_VIRTUAL;
					} catch {}
					// Build a tiny wrapper that imports the compiled entry runtime from the dev server
					let code =
						REQUIRE_GUARD_SNIPPET +
						`// [ns-entry][v${ver}] wrapper (script-safe) bytes will follow\n` +
						`(async function(){\n` +
						`  let origin = ${JSON.stringify(origin)}; const main = ${JSON.stringify(mainEntry)}; const __ns_graph_ver = ${JSON.stringify(ver)};\n` +
						`  try { const __b = (globalThis && globalThis.__NS_ENTRY_BASE__) ? String(globalThis.__NS_ENTRY_BASE__) : ''; if (__b) { try { const __o = new URL(__b).origin; if (__o) origin = __o; } catch {} } } catch {}\n` +
						`  const __VERBOSE__ = (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) || (globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.verbose) || (globalThis && globalThis.__NS_ENV_VERBOSE__) || ${JSON.stringify(!!verbose)};\n` +
						`  if (__VERBOSE__) console.info('[ns-entry][wrapper] start', { origin, main, ver: __ns_graph_ver });\n` +
						`  async function __ns_import_entry_rt(u){\n` +
						`    // Prefer fetch+eval script transformation to avoid module import limitations on device\n` +
						`    try { const r = await fetch(u); const t = await r.text(); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt fetched bytes', (t&&t.length)||0);\n` +
						`      // Transform 'export default function' or 'export default async function' into global assignment\n` +
						`      let s = t.replace(/export\\s+default\\s+async\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=async function $1')\n` +
						`               .replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_$]+)?/,'globalThis.__NS_START_ENTRY__=function $1');\n` +
						`      // Fallback: if function-form replacements didn't run, handle expression default export too\n` +
						`      if (String(s).indexOf('__NS_START_ENTRY__') === -1) { s = 'globalThis.__NS_START_ENTRY__=' + s.replace(/export\\s+default\\s*/,''); }\n` +
						`      try { (0,eval)(s); } catch (ee) { console.error('[ns-entry][wrapper] eval entry-rt failed', ee && (ee.message||ee)); throw ee; }\n` +
						`      const fn = globalThis.__NS_START_ENTRY__; if (!fn) { throw new Error('entry-rt missing __NS_START_ENTRY__'); }\n` +
						`      return { default: fn };\n` +
						`    } catch(e) { console.error('[ns-entry][wrapper] entry-rt fetch/eval failed', e && (e.message||e)); throw e; }\n` +
						`  }\n` +
						`  const __entryRtUrl = '/ns/entry-rt?v=' + String(__ns_graph_ver);\n` +
						`  let __mod; try { __mod = await __ns_import_entry_rt(__entryRtUrl); if (__VERBOSE__) console.info('[ns-entry][wrapper] entry-rt ready'); } catch (e) { console.error('[ns-entry][wrapper] failed to prepare entry-rt', e && (e.message||e)); throw e; }\n` +
						`  const startEntry = (__mod && (__mod.default || __mod));\n` +
						`  try { await startEntry({ origin, main, ver: __ns_graph_ver, verbose: !!__VERBOSE__ }); if (__VERBOSE__) console.info('[ns-entry][wrapper] startEntry() resolved'); } catch (e) { console.error('[ns-entry][wrapper] startEntry() failed', e && (e.message||e)); throw e; }\n` +
						`})();\n`;
					code = code + `\n//# sourceURL=${origin}/ns/entry`;
					res.statusCode = 200;
					res.end(code);
				} catch (e) {
					next();
				}
			});

			// 2.6) Transactional HMR endpoint: GET /ns/txn/<ver>
			// Returns a single ESM that sequentially imports all changed modules for the given graphVersion.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					const p = urlObj.pathname || '';
					if (!p.startsWith('/ns/txn')) return next();
					let verStr = p.replace('/ns/txn', '').replace(/^\//, '');
					const ver = Number(verStr || urlObj.searchParams.get('v') || 0);
					let ids = txnBatches.get(ver) || [];
					if (!ids.length) {
						// Attempt to rebuild from any changed modules at this version if present in graph history is unavailable.
						// Fallback heuristic: use all modules with latest hash change equal to this version (we don't store per-module version, so use any changedIds from query 'ids' if provided)
						try {
							const q = (urlObj.searchParams.get('ids') || '')
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean);
							if (q.length) ids = computeTxnOrderForChanged(q);
						} catch {}
					}
					const origin = getServerOrigin(server) || `${urlObj.protocol}//${urlObj.host}`;
					const lines: string[] = [];
					lines.push(`// [txn] version=${ver} count=${ids.length}`);
					if (!ids.length) {
						lines.push(`export default true;`);
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
						res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
						res.setHeader('Pragma', 'no-cache');
						res.setHeader('Expires', '0');
						res.statusCode = 200;
						res.end(lines.join('\n'));
						return;
					}
					for (const id of ids) {
						const isVue = /\.vue$/i.test(id);
						const safe = id.startsWith('/') ? id : '/' + id;
						const abs = isVue ? `/ns/asm/${ver}?path=${encodeURIComponent(safe)}` : `/ns/m${safe}`;
						lines.push(`await import(${JSON.stringify(abs)});`);
					}
					lines.push(`export default true;`);
					const code = lines.join('\n');
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					res.statusCode = 200;
					res.end(code);
					return;
				} catch (e) {
					/* fallthrough */
				}
				return next();
			});

			// 3) ESM endpoint for SFC modules: GET /ns/sfc?path=/src/Comp.vue[?vue&type=*] OR /ns/sfc/src/Comp.vue[?vue&type=*]
			// Also accept alias /ns/sfc
			// Preserves variant queries (?vue&type=script|template|style) and adds a diagnostic signature comment.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					const p = urlObj.pathname;
					// Only match exactly "/ns/sfc" or paths under it.
					const isNs = p === '/ns/sfc' || p.startsWith('/ns/sfc/');
					if (!isNs) return next();
					if (p.startsWith('/ns/asm') || p.startsWith('/ns/sfc-meta')) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');

					const base = '/ns/sfc';
					// Determine request spec, preserving variant query when present and handling optional version in path
					let pathParam = urlObj.searchParams.get('path') || ''; // may include its own query
					const rawRemainder = urlObj.pathname.slice(base.length) || '';
					let verFromPath: string | null = null;
					let pathStyle = rawRemainder;
					if (rawRemainder && rawRemainder.startsWith('/')) {
						const parts = rawRemainder.split('/'); // ["", maybe "<ver>", ...]
						if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
							verFromPath = parts[1];
							pathStyle = '/' + parts.slice(2).join('/');
						}
					}
					if (pathStyle && pathStyle !== '/' && !pathParam) {
						if (!pathStyle.startsWith('/')) pathStyle = '/' + pathStyle;
						// Include endpoint query for variant-style requests (e.g. /ns/sfc/Comp.vue?vue&type=template)
						pathParam = pathStyle + (urlObj.search || '');
					}
					let fullSpec = pathParam || '';
					if (!fullSpec) {
						res.statusCode = 200;
						res.end('export {}\n');
						return;
					}
					if (fullSpec.startsWith('@/')) fullSpec = APP_VIRTUAL_WITH_SLASH + fullSpec.slice(2);
					if (!fullSpec.startsWith('/')) fullSpec = '/' + fullSpec;

					const isVariant = /[?&]vue&type=/.test(fullSpec);
					const variantTypeMatch = /[?&]type=([^&]+)/.exec(fullSpec);
					const variantType = variantTypeMatch?.[1] || null;
					const isStyleVariant = /[?&]type=style\b/.test(fullSpec);

					// Determine candidate for transformRequest
					// For full SFCs we prefer a clean base path + '?vue'; if that fails, try base without query as fallback.
					let candidate = fullSpec;
					let transformed: TransformResult | null = null;
					if (!isVariant) {
						const basePath = fullSpec.replace(/[?#].*$/, '');
						const candidates = [basePath + (basePath.includes('?') ? '&' : '?') + 'vue', basePath];
						for (const c of candidates) {
							try {
								const r = await server.transformRequest(c);
								if (r?.code) {
									transformed = r;
									candidate = c;
									break;
								}
							} catch {}
						}
						if (!transformed?.code) {
							if (verbose) {
								try {
									console.warn(`[sfc][serve] transform miss for`, fullSpec);
								} catch {}
							}
							// Emit an erroring module to surface the failure at import site with helpful hints
							try {
								const tried = candidates.slice(0, 8);
								const out = `// [sfc] transform miss kind=full path=${fullSpec.replace(/\n/g, '')} tried=${tried.length}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for full SFC: ' + fullSpec + ' (tried ' + tried.length + ')')});\nexport {}\n`;
								res.statusCode = 404;
								res.end(out);
								return;
							} catch {
								res.statusCode = 404;
								res.end('export {}\n');
								return;
							}
						}
					} else {
						try {
							transformed = await server.transformRequest(candidate);
						} catch {}
						if (!transformed?.code) {
							try {
								const out = `// [sfc] transform miss kind=variant path=${fullSpec.replace(/\n/g, '')}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for variant: ' + fullSpec)});\nexport {}\n`;
								res.statusCode = 404;
								res.end(out);
								return;
							} catch {
								res.statusCode = 404;
								res.end('export {}\n');
								return;
							}
						}
					}

					// For style variants, return an empty module immediately
					if (isStyleVariant) {
						const sig = `// [sfc] kind=variant:style path=${fullSpec.replace(/\n/g, '')} len=0 default=false\n`;
						res.statusCode = 200;
						res.end(`${sig}export {}\n`);
						return;
					}

					let code = transformed.code;
					// Prepend guard to capture any URL-based require attempts
					code = REQUIRE_GUARD_SNIPPET + code;
					const projectRoot = (server as any).config?.root || process.cwd();
					// IMPORTANT: Do not run cleanCode() on template variant; it can strip required pieces.
					// We'll handle script/full SFC below, and treat template minimally right away.

					// Full SFCs delegate to deterministic assembler module; variants (script/template) still go through processing
					if (!isVariant) {
						const importerPath = fullSpec.replace(/[?#].*$/, '');
						const origin = getServerOrigin(server);
						const ver = verFromPath || '0';
						const asmPath = `/ns/asm/${ver}?path=${encodeURIComponent(importerPath)}`;
						const delegated = `// [sfc] kind=full (delegated to assembler) path=${importerPath}\nexport * from ${JSON.stringify(asmPath)};\nexport { default } from ${JSON.stringify(asmPath)};\n`;
						res.statusCode = 200;
						res.end(delegated);
						return;
					} else {
						// Variants
						if (variantType === 'template') {
							const preferSelfCompile = !!process.env.NS_HMR_SELF_COMPILE_TEMPLATE;
							// Compile the template ourselves to guarantee no Vite HMR code and stable output
							if (preferSelfCompile)
								try {
									const projectRootT = (server as any).config?.root || process.cwd();
									const basePath = fullSpec.replace(/[?#].*$/, '');
									const abs = path.join(projectRootT, basePath.replace(/^\//, ''));
									let sfcSrc = '';
									try {
										sfcSrc = readFileSync(abs, 'utf-8');
									} catch {}
									if (sfcSrc) {
										const { descriptor } = parse(sfcSrc, { filename: abs });
										const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
										let bindingMetadata: any = undefined;
										try {
											const s: any = (compileScript as any)(
												descriptor as any,
												{
													id,
													inlineTemplate: false,
													reactivityTransform: false,
												} as any,
											);
											bindingMetadata = s?.bindings;
										} catch {}
										const tpl = descriptor.template?.content || '';
										const ct: any = compileTemplate({
											source: tpl,
											id,
											filename: abs,
											isProd: false,
											ssr: false,
											compilerOptions: {
												bindingMetadata,
												isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
											},
										} as any);
										let out = (ct && (ct.code || '')) || '';
										// Map Vue helper imports to runtime bridge
										try {
											out = out.replace(/from\s+["'](?:nativescript-vue|vue)[^"']*["']/g, 'from "/ns/rt"');
										} catch {}
										// No import.meta.hot present when compiling ourselves, but keep minimal sanitizer just in case
										out = processTemplateVariantMinimal(out);
										code = out;
									} else {
										code = 'export {}\n';
									}
								} catch (eTplSelf) {
									if (verbose) {
										try {
											console.warn('[sfc][template][self-compile][fail]', fullSpec, (eTplSelf as any)?.message);
										} catch {}
									}
									code = transformed.code || 'export {}\n';
									code = processTemplateVariantMinimal(code);
								}
							else {
								// Prefer using Vite's template transform and apply minimal sanitization; avoids compiler mismatches and warnings
								code = transformed.code || 'export {}\n';
								code = processTemplateVariantMinimal(code);
							}
							// fall through to shared post-processing (versioning, signature, etc.)
						}

						// Script variants still need vendor mappings and general device processing (no SFC assembly)
						// IMPORTANT: Use a Babel AST transform to remove imports of the template variant and
						// neutralize their usage without brittle regex.
						try {
							const ast = babelParse(code, {
								sourceType: 'module',
								plugins: ['typescript'] as any,
							}) as any;
							const templateBindings = new Set<string>();
							const navToLocals: string[] = [];
							const navBackLocals: string[] = [];
							babelTraverse(ast, {
								ImportDeclaration(path: any) {
									const spec = path.node.source.value || '';
									// Remove template variant imports and collect their local identifiers for neutralization
									if (typeof spec === 'string' && /\.vue\?[^\n]*type=template/.test(spec)) {
										const ids: string[] = [];
										for (const s of path.node.specifiers) {
											if (t.isImportSpecifier(s)) {
												const imported = t.isIdentifier(s.imported) ? s.imported.name : undefined;
												const local = t.isIdentifier(s.local) ? s.local.name : undefined;
												if ((imported === 'render' || imported === undefined) && local) ids.push(local);
											} else if (t.isImportDefaultSpecifier(s) || t.isImportNamespaceSpecifier(s)) {
												if (t.isIdentifier(s.local)) ids.push(s.local.name);
											}
										}
										ids.forEach((n) => templateBindings.add(n));
										path.remove();
										return;
									}
									// Rewrite $navigateTo/$navigateBack imports from nativescript-vue (or prebundle) to use globals
									const isNsVue = typeof spec === 'string' && (/nativescript-vue/.test(spec) || /vendor\.mjs$/.test(spec) || /\/node_modules\/\.vite\/deps\/nativescript-vue\.js/.test(spec));
									if (isNsVue) {
										const remain: typeof path.node.specifiers = [];
										for (const s of path.node.specifiers) {
											if (t.isImportSpecifier(s)) {
												const imported = t.isIdentifier(s.imported) ? s.imported.name : undefined;
												const local = t.isIdentifier(s.local) ? s.local.name : undefined;
												if (local && (imported === '$navigateTo' || imported === 'navigateTo')) {
													navToLocals.push(local);
													continue;
												}
												if (local && (imported === '$navigateBack' || imported === 'navigateBack')) {
													navBackLocals.push(local);
													continue;
												}
											}
											remain.push(s);
										}
										if (remain.length) {
											path.node.specifiers = remain;
										} else {
											path.remove();
										}
									}
								},
							});
							if (templateBindings.size) {
								babelTraverse(ast, {
									Identifier(path: any) {
										if (templateBindings.has(path.node.name)) {
											path.replaceWith(t.identifier('undefined'));
										}
									},
									AssignmentExpression(path: any) {
										// Guard component.render = <alias> to avoid TDZ when alias is undefined
										if (
											t.isMemberExpression(path.node.left) &&
											t.isIdentifier(path.node.left.property, {
												name: 'render',
											})
										) {
											const e = t.identifier('__e');
											const guarded = t.tryStatement(t.blockStatement([t.variableDeclaration('const', [t.variableDeclarator(e, path.node.right as any)]), t.ifStatement(t.logicalExpression('&&', t.binaryExpression('!==', t.unaryExpression('typeof', path.node.left.object as any, true), t.stringLiteral('undefined')), t.binaryExpression('!==', t.unaryExpression('typeof', e, true), t.stringLiteral('undefined'))), t.blockStatement([t.expressionStatement(t.assignmentExpression('=', path.node.left as any, e))]))]), t.catchClause(t.identifier('_e'), t.blockStatement([])));
											path.replaceWithMultiple([guarded]);
										}
									},
								});
							}
							let outCode = genCode(ast as any).code;
							if (navToLocals.length || navBackLocals.length) {
								const shimLines: string[] = [];
								for (const n of navToLocals) shimLines.push(`import __ns_rt_nav_to_mod from "/ns/rt";\nconst ${n} = (...args) => __ns_rt_nav_to_mod.$navigateTo(...args);`);
								for (const n of navBackLocals) shimLines.push(`import __ns_rt_nav_back_mod from "/ns/rt";\nconst ${n} = (...args) => __ns_rt_nav_back_mod.$navigateBack(...args);`);
								outCode = shimLines.join('\n') + '\n' + outCode;
							}
							code = outCode;
						} catch {}

						code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(fullSpec), fullSpec);
						// Transform static .vue imports into static imports from the assembler (no TLA) via AST
						try {
							const importerPath = fullSpec.replace(/[?#].*$/, '');
							const origin = getServerOrigin(server);
							const ver = verFromPath || '0';
							const ast2 = babelParse(code, {
								sourceType: 'module',
								plugins: ['typescript'] as any,
							}) as any;
							babelTraverse(ast2, {
								ImportDeclaration(p: any) {
									const src = p.node.source.value || '';
									if (typeof src !== 'string') return;
									if (/^https?:\/\//.test(src)) return; // leave absolute URLs
									if (/\.vue(?:$|\?)/.test(src)) {
										let spec = src;
										// Resolve to absolute project path
										if (spec.startsWith('./') || spec.startsWith('../')) {
											spec = path.posix.normalize(path.posix.join(path.posix.dirname(importerPath), spec));
											if (!spec.startsWith('/')) spec = '/' + spec;
										} else if (!spec.startsWith('/')) {
											// Handle '@/'
											if (spec.startsWith('@@/')) spec = '/' + spec.slice(2);
											if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
										}
										// Strip query for plain .vue (keep variant imports intact)
										if (!/\bvue&type=/.test(src)) {
											spec = spec.replace(/[?#].*$/, '');
											const asmUrl = `/ns/asm/${ver}?path=${encodeURIComponent(spec)}&mode=inline`;
											p.node.source = t.stringLiteral(asmUrl);
										}
									}
								},
							});
							code = genCode(ast2 as any).code;
						} catch {}

						// After rewrites, strip any TypeScript syntax from the script variant to avoid device-side parse errors
						try {
							const importerPath = fullSpec.replace(/[?#].*$/, '');
							const tsRes = await babelCore.transformAsync(code, {
								plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
								sourceType: 'module',
								// Help Babel infer TS parsing even if the virtual filename isn't .ts
								filename: importerPath.endsWith('.vue') ? importerPath.replace(/\.vue$/, '.ts') : importerPath + '.ts',
								comments: true,
								configFile: false,
								babelrc: false,
							});
							if (tsRes?.code) {
								code = tsRes.code;
							}
						} catch (eTsVar) {
							if (verbose) {
								try {
									console.warn('[sfc][variant:script][babel-ts][fail]', fullSpec, (eTsVar as any)?.message);
								} catch {}
							}
						}
					}

					const importerPath = fullSpec.replace(/[?#].*$/, '');
					// Only run cleanCode for non-template cases (script/full). Template code must remain intact.
					if (!isVariant || variantType !== 'template') {
						code = cleanCode(code);
					}
					code = rewriteImports(code, importerPath, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, getServerOrigin(server));
					code = ensureVariableDynamicImportHelper(code);
					try {
						// For variant requests under /ns/sfc, prefer the version from the path segment when present
						// so that any internal '/ns/rt', '/ns/core', or '/ns/sfc' imports are aligned with the same version.
						const verNum = Number(verFromPath || '0');
						if (Number.isFinite(verNum) && verNum > 0) {
							code = ensureVersionedRtImports(code, getServerOrigin(server), verNum);
							code = ACTIVE_STRATEGY.ensureVersionedImports(code, getServerOrigin(server), verNum);
							code = ensureVersionedCoreImports(code, getServerOrigin(server), verNum);
						} else {
							code = ensureVersionedRtImports(code, getServerOrigin(server), graphVersion);
							code = ACTIVE_STRATEGY.ensureVersionedImports(code, getServerOrigin(server), graphVersion);
							code = ensureVersionedCoreImports(code, getServerOrigin(server), graphVersion);
						}
					} catch {}
					// Final guard for SFC variant output as well
					try {
						code = ensureDestructureCoreImports(code);
					} catch {}

					// CRITICAL: As a last step for script/template variants, re-run AST normalization and strip
					// any sentinel destructures that could cause duplicate locals, then re-apply core versioning.
					try {
						code = astNormalizeModuleImportsAndHelpers(code);
					} catch {}
					try {
						// Remove any rt->core sentinel destructures that slipped in late
						code = stripRtCoreSentinel(code);
					} catch {}
					try {
						const verNum = Number(verFromPath || '0');
						if (Number.isFinite(verNum) && verNum > 0) {
							code = ensureVersionedRtImports(code, getServerOrigin(server), verNum);
							code = ensureVersionedCoreImports(code, getServerOrigin(server), verNum);
						} else {
							code = ensureVersionedRtImports(code, getServerOrigin(server), graphVersion);
							code = ensureVersionedCoreImports(code, getServerOrigin(server), graphVersion);
						}
					} catch {}
					// Last-chance sanitizer for dangling Vite CJS import helper usages that may surface after late transforms
					try {
						code = stripDanglingViteCjsImports(code);
					} catch {}

					const hasDefault = /\bexport\s+default\b/.test(code);
					const kind = isVariant ? `variant:${variantType || 'unknown'}` : 'full';
					const sig = `// [sfc] kind=${kind} path=${importerPath} len=${code.length} default=${hasDefault} wrapped=${false}\n`;
					if (verbose) {
						try {
							console.log(`[sfc][serve] ${fullSpec} kind=${kind} default=${hasDefault} bytes=${code.length}`);
						} catch {}
					}
					// Ensure script variants always provide a default export if they declare a component
					if (!hasDefault) {
						// Prefer an explicit identifier if present
						const m = code.match(/\b(?:const|let|var)\s+(__ns_sfc__|_sfc_main)\b/);
						if (m && m[1]) {
							code += `\nexport default ${m[1]};`;
						} else if (/\b_defineComponent\s*\(|\bdefineComponent\s*\(/.test(code)) {
							// Fallback: export whichever is defined at runtime without throwing on missing identifiers
							code += `\nexport default (typeof __ns_sfc__ !== "undefined" ? __ns_sfc__ : (typeof _sfc_main !== "undefined" ? _sfc_main : undefined));`;
						}
					}
					res.statusCode = 200;
					res.end(sig + code);
				} catch (e) {
					res.statusCode = 500;
					res.end('export {}\n');
				}
			});

			// 4) JSON metadata endpoint for SFCs: GET /ns/sfc-meta?path=/src/Comp.vue OR /ns/sfc-meta/<ver>?path=/src/Comp.vue
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (!urlObj.pathname.startsWith('/ns/sfc-meta')) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/json; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					// Accept optional version segment similar to /ns/sfc
					{
						const metaBase = '/ns/sfc-meta';
						if (urlObj.pathname.startsWith(metaBase + '/')) {
							const rawRemainder = urlObj.pathname.slice(metaBase.length);
							const parts = rawRemainder.split('/');
							if (parts.length > 2 && /^[0-9]+$/.test(parts[1] || '')) {
								// consume version but we don't need it server-side
							}
						}
					}
					let spec = urlObj.searchParams.get('path') || '';
					if (!spec) {
						res.statusCode = 400;
						res.end(JSON.stringify({ error: 'missing path' }));
						return;
					}
					if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
					if (!spec.startsWith('/')) spec = '/' + spec;
					const base = spec.replace(/[?#].*$/, '');
					// Transform variants to inspect exports
					const [scriptR, templateR] = await Promise.all([server.transformRequest(base + '?vue&type=script'), server.transformRequest(base + '?vue&type=template')]);
					const scriptCode = scriptR?.code || '';
					const templateCode = templateR?.code || '';
					const scriptMeta = extractExportMetadata(scriptCode);
					// Robust render detection: Vue compiler may emit several shapes:
					// 1) export function render(_ctx, _cache) { ... }
					// 2) function render(_ctx,_cache) { ... } (later exported)
					// 3) export const render = (_ctx,_cache) => { ... }
					// 4) const render = (...) => { ... } (later exported)
					// 5) export { render } or export { render as render }
					// 6) Object property forms (rare in template output) render: (...) => {}
					const hasRender = /export\s+function\s+render\s*\(/.test(templateCode) || /(?:^|\n)\s*function\s+render\s*\(/.test(templateCode) || /export\s+(?:const|let|var)\s+render\s*=/.test(templateCode) || /(?:^|\n)\s*(?:const|let|var)\s+render\s*=/.test(templateCode) || /\brender\s*[:=]\s*/.test(templateCode) || /export\s*\{\s*render\s*(?:as\s*render)?\s*\}/.test(templateCode);
					if (hasRender && verbose) {
						try {
							console.log('[sfc-meta] detected render for', base);
						} catch {}
					} else if (!hasRender && verbose) {
						try {
							console.warn('[sfc-meta] render NOT detected for', base);
						} catch {}
					}
					const hash = createHash('md5').update(base).digest('hex').slice(0, 8);
					const payload = {
						path: base,
						hasScript: !!scriptCode,
						hasTemplate: !!templateCode,
						hasStyle: false,
						scriptExports: scriptMeta.named,
						scriptHasDefault: scriptMeta.hasDefault,
						templateHasRender: hasRender,
						hmrId: hash,
					};
					res.statusCode = 200;
					res.end(JSON.stringify(payload));
				} catch (e: any) {
					res.statusCode = 500;
					res.end(JSON.stringify({ error: e?.message || String(e) }));
				}
			});

			// 5) Deterministic SFC assembler: GET /ns/asm?path=/src/Comp.vue
			// Place BEFORE any broader /ns/sfc* handlers that might accidentally match and delegate.
			server.middlewares.use(async (req, res, next) => {
				try {
					const urlObj = new URL(req.url || '', 'http://localhost');
					if (!urlObj.pathname.startsWith('/ns/asm')) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					// Optional version segment as first path component after /ns/asm
					const asmBase = '/ns/asm';
					const asmRemainder = urlObj.pathname.slice(asmBase.length) || '';
					let verFromPath: string | null = null;
					if (asmRemainder && asmRemainder.startsWith('/')) {
						const p = asmRemainder.split('/');
						if (p.length > 1 && /^[0-9]+$/.test(p[1] || '')) {
							verFromPath = p[1];
						}
					}
					let spec = urlObj.searchParams.get('path') || '';
					const diag = urlObj.searchParams.get('diag') === '1';
					if (!spec) {
						res.statusCode = 400;
						res.end('export {}\n');
						return;
					}
					if (spec.startsWith('@/')) spec = APP_VIRTUAL_WITH_SLASH + spec.slice(2);
					if (!spec.startsWith('/')) spec = '/' + spec;
					const base = spec.replace(/[?#].*$/, '');
					if (diag) {
						const code = `// [sfc-asm] ${base} (diag)\n` + `// vue shim for diag-only instantiation\n` + `var _createElementVNode = globalThis.createElementVNode || globalThis._createElementVNode;\n` + `const __ns_sfc__ = { name: ${JSON.stringify(base.split('/').pop() || 'DiagComp')}, render(){ return _createElementVNode ? _createElementVNode('StackLayout') : (globalThis.createElementVNode ? globalThis.createElementVNode('StackLayout') : {}); } };\nexport default __ns_sfc__;\n`;
						res.statusCode = 200;
						res.end(code);
						return;
					}
					const projectRoot = (server as any).config?.root || process.cwd();
					// Ensure variant transforms exist so imports resolve (avoid Promise.all short-circuit on single failure)
					const safeTransform = async (cand: string): Promise<TransformResult | null> => {
						try {
							return await server.transformRequest(cand);
						} catch {
							return null;
						}
					};
					const scriptR = await safeTransform(base + '?vue&type=script');
					const templateR = await safeTransform(base + '?vue&type=template');
					const fullR = await safeTransform(base + '?vue');
					const hasScript = !!scriptR?.code;
					const hasTemplate = !!templateR?.code;
					const origin = getServerOrigin(server);
					const ver = String(verFromPath || graphVersion || Date.now());
					const scriptUrl = `${origin}/ns/sfc/${ver}${base}?vue&type=script`;
					const templateCode = templateR?.code || '';

					// INLINE-FIRST assembler: compile SFC source into a self-contained ESM module (enhanced diagnostics)
					try {
						const root = (server as any).config?.root || process.cwd();
						const abs = path.join(root, base.replace(/^\//, ''));
						let sfcSrc = '';
						try {
							sfcSrc = readFileSync(abs, 'utf-8');
						} catch {}
						if (sfcSrc) {
							const { descriptor } = parse(sfcSrc, { filename: abs });
							const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
							// 1) Compile script (prefer inlineTemplate for a complete module)
							let compiledScript = '' as string;
							let bindingMetadata: any = undefined;
							let triedInlineTemplate = false;
							let hadScriptDefaultPre = false;
							let usedInlineScript = false;
							try {
								// First try inlineTemplate for a holistic, self-contained module with render + hoists
								// Use a strict NativeScript native element detector for inlineTemplate that does NOT treat generic PascalCase as native.
								// This ensures imported components like PageWrapper remain true components and get referenced via bindings.
								const isNSNative = (tag: string) => NS_NATIVE_TAGS.has(tag);
								const sInline: any = (compileScript as any)(
									descriptor as any,
									{
										id,
										inlineTemplate: true,
										reactivityTransform: false,
										// Pass only strict NS native element predicate; avoid broad PascalCase heuristic here.
										templateOptions: {
											compilerOptions: { isCustomElement: isNSNative },
										},
									} as any,
								);
								triedInlineTemplate = true;
								if (/export\s+default/.test(sInline?.content || '')) {
									compiledScript = sInline.content;
									bindingMetadata = sInline?.bindings;
									hadScriptDefaultPre = true;
									usedInlineScript = true;
								} else {
									// Fallback to standard script (no inline) and attempt separate template compile
									const s: any = (compileScript as any)(
										descriptor as any,
										{
											id,
											inlineTemplate: false,
											reactivityTransform: false,
										} as any,
									);
									compiledScript = s?.content || '';
									bindingMetadata = s?.bindings;
									hadScriptDefaultPre = /export\s+default/.test(compiledScript);
									usedInlineScript = false;
								}
							} catch (eScript) {
								if (verbose) {
									try {
										console.warn('[sfc-asm][compileScript] failed', base, (eScript as any)?.message);
									} catch {}
								}
								// Retry without inlineTemplate
								try {
									const s: any = (compileScript as any)(
										descriptor as any,
										{
											id,
											inlineTemplate: false,
											reactivityTransform: false,
										} as any,
									);
									compiledScript = s?.content || '';
									bindingMetadata = s?.bindings;
									hadScriptDefaultPre = /export\s+default/.test(compiledScript);
									usedInlineScript = false;
								} catch (eNoInline) {
									if (verbose) {
										try {
											console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (eNoInline as any)?.message);
										} catch {}
									}
								}
							}
							// Final fallback: if script compile yielded nothing, use the variant-transformed script
							if (!compiledScript && scriptR?.code) {
								try {
									compiledScript = scriptR.code;
									hadScriptDefaultPre = /export\s+default/.test(compiledScript);
								} catch {}
							}
							// If inlineTemplate produced a default export AND visibly contains a render, allow early-return.
							// Visible render forms we accept:
							//  - export function render(...) { ... }
							//  - setup(...) { ... return (_ctx, _cache) => { ... } }
							const hasInlineRender = /(^|\n)\s*export\s+function\s+render\s*\(/.test(compiledScript || '') || /\breturn\s*\(\s*_ctx\s*,\s*_cache\s*\)\s*=>\s*\{/.test(compiledScript || '');
							// Always use canonical assembler path; avoid inlineTemplate early-return which can miss render attachment
							// If we reached here, we are going to assemble canonically. Ensure the script we use does NOT include inlineTemplate render.
							if (usedInlineScript) {
								try {
									const sNoInline: any = (compileScript as any)(
										descriptor as any,
										{
											id,
											inlineTemplate: false,
											reactivityTransform: false,
										} as any,
									);
									compiledScript = sNoInline?.content || compiledScript;
									bindingMetadata = sNoInline?.bindings || bindingMetadata;
								} catch (eNoInline) {
									if (verbose) {
										try {
											console.warn('[sfc-asm][compileScript][no-inline-fallback] failed', base, (eNoInline as any)?.message);
										} catch {}
									}
								}
							}
							// 2) Compile template
							let compiledTplCode = '' as string;
							let templateErr: any = null;
							try {
								const tplSrc = descriptor.template?.content || '';
								if (tplSrc) {
									const ct: any = compileTemplate({
										source: tplSrc,
										id,
										filename: abs,
										isProd: false,
										ssr: false,
										compilerOptions: {
											bindingMetadata,
											isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
										},
									} as any);
									compiledTplCode = (ct && (ct.code || '')) || '';
									if (ct?.errors?.length && verbose) {
										try {
											console.warn('[sfc-asm][compileTemplate][errors]', base, ct.errors);
										} catch {}
									}
								}
							} catch (eTpl) {
								templateErr = eTpl;
								if (verbose) {
									try {
										console.warn('[sfc-asm][compileTemplate] failed', base, (eTpl as any)?.message);
									} catch {}
								}
								// Fallback: use the variant-transformed template code if available
								try {
									if (templateR?.code) compiledTplCode = templateR.code;
								} catch {}
							}
							// If still no template code, synthesize a minimal render stub so the module is valid
							if (!compiledTplCode) {
								try {
									compiledTplCode = "export function render(){ const _ = (globalThis.createElementVNode||globalThis._createElementVNode); return _? _('StackLayout') : {}; }\n";
								} catch {}
							}
							// 3) Sanitize script and rewrite .vue imports to inline assembler
							let scriptBody = compiledScript || '';
							if (scriptBody) {
								// Do NOT strip Vue/nativescript-vue imports; retarget them to the runtime bridge so helpers (e.g., onMounted) are bound.
								// Preserve the import clause and only rewrite the source to '/ns/rt'.
								scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["'](?:vue|nativescript-vue|~\/vendor\.mjs)(?:\/[^"]*)?["'];?/g, (_m: string, pfx: string, clause: string) => `${pfx}import ${clause} from "/ns/rt";`);
								try {
									const importerDir = path.posix.dirname(base);
									scriptBody = scriptBody.replace(/(^|\n)\s*import\s+([^;\n]+)\s+from\s+["']([^"'\n]+\.vue)(?:\?[^"'\n]*)?["'];?/g, (_m: string, pfx: string, clause: string, spec: string) => {
										let absImp = spec;
										if (spec.startsWith('./') || spec.startsWith('../')) {
											absImp = path.posix.normalize(path.posix.join(importerDir, spec));
											if (!absImp.startsWith('/')) absImp = '/' + absImp;
										} else if (!spec.startsWith('/')) {
											if (absImp.startsWith('@/')) absImp = APP_VIRTUAL_WITH_SLASH + absImp.slice(2);
										}
										const asmUrl = `/ns/asm/${ver}?path=${encodeURIComponent(absImp)}&mode=inline`;
										return `${pfx}import ${clause} from ${JSON.stringify(asmUrl)};`;
									});
								} catch {}
							}
							// 4) Extract render from compiled template and prepare a full inline template block
							let helperBindings = '';
							let renderDecl = '';
							let inlineBlock: string | undefined = undefined;
							let renderOk = false;
							if (compiledTplCode) {
								try {
									// Build a full inline template block to preserve hoists where possible
									inlineBlock = buildInlineTemplateBlock(compiledTplCode) || undefined;
									if (!inlineBlock) {
										const extracted = extractTemplateRender(compiledTplCode);
										helperBindings = extracted.helperBindings;
										renderDecl = extracted.renderDecl;
										inlineBlock = extracted.inlineBlock;
										renderOk = extracted.ok;
									} else {
										renderOk = true;
									}
								} catch (eExtract) {
									if (verbose) {
										try {
											console.warn('[sfc-asm][extractTemplateRender] failed', base, (eExtract as any)?.message);
										} catch {}
									}
								}
							}
							// Final guard: if no inline render extracted, attempt to import template variant or synthesize a no-op render
							if (!renderOk && !inlineBlock) {
								try {
									const templateUrl = `${origin}/ns/sfc/${ver}${base}?vue&type=template`;
									const importLine = `import * as __template from ${JSON.stringify(templateUrl)};`;
									// Attach only if scriptTransformed produces __ns_sfc__ later
									helperBindings += `\n${importLine}`;
									renderDecl += `\nfunction __ns_getRender(){\n  try {\n    if (__template && __template.render) return __template.render;\n  } catch (_e) {}\n  try {\n    const _ = globalThis.createElementVNode || globalThis._createElementVNode;\n    return _ ? function(){ return _('StackLayout'); } : function(){ return {}; };\n  } catch (_e) { return function(){ return {}; }; }\n}\n`;
									renderOk = true;
								} catch {}
							}
							// 5) Convert default export to const __ns_sfc__
							let scriptTransformed = scriptBody;
							if (scriptTransformed) {
								scriptTransformed = scriptTransformed.replace(/(^|\n)\s*export\s+default\s+/g, '$1const __ns_sfc__ = ').replace(/(^|\n)\s*export\s*\{[^}]*\}\s*;?\s*/g, '\n/* removed named exports for inline asm */\n');
								// Normalize any prior declaration of __ns_sfc__ to a plain assignment to avoid redeclare
								// Accept a semicolon before the declaration too
								scriptTransformed = scriptTransformed.replace(/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\s*=\s*/g, '$1__ns_sfc__ = ');
								// Ensure a single declaration appears once before first assignment
								if (!/(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(scriptTransformed)) {
									scriptTransformed = `let __ns_sfc__;\n` + scriptTransformed;
								}
								// Remove stray leading braces (artifact defense)
								scriptTransformed = scriptTransformed.replace(/^\s*\}+(?=\s*[^}])/, (m) => `/* [asm-fix] removed ${m.length} stray leading braces */\n`);
							} else {
								try {
									const compName = (base.split('/').pop() || 'Component').replace(/\.vue$/i, '') || 'Component';
									scriptTransformed = `import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({ __name: ${JSON.stringify(compName)} });`;
								} catch {
									scriptTransformed = `import { defineComponent as _defineComponent } from "/ns/rt";\nlet __ns_sfc__;\n__ns_sfc__ = /*@__PURE__*/_defineComponent({});`;
								}
							}
							// 6) Emit final inline module with diagnostics comment
							const parts: string[] = [];
							parts.push(`// [sfc-asm] ${base} (inline-compiled)`);
							// Deterministic path: always use extracted helperBindings + renderDecl + scriptTransformed (ignore inlineBlock)
							// Emit hoisted template bindings first
							if (helperBindings) parts.push(helperBindings);
							// IMPORTANT: place script (with its imports) BEFORE renderDecl so imports never appear inside the render function.
							parts.push(scriptTransformed);
							parts.push(renderDecl);
							parts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : undefined); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
							parts.push(`// diagnostic: hadScriptDefaultPre=${hadScriptDefaultPre} triedInlineTemplate=${triedInlineTemplate} renderOk=${renderOk} tplBytes=${compiledTplCode.length} scriptBytes=${(compiledScript || '').length} templateErr=${templateErr ? (templateErr as any)?.message : ''}`);
							parts.push(`export function render(){ const f = (typeof __ns_getRender==='function' ? __ns_getRender() : (__ns_sfc__ && __ns_sfc__.render)); return typeof f==='function' ? f.apply(this, arguments) : undefined; }`);
							parts.push(`export default __ns_sfc__`);
							let inlineCode = parts.filter(Boolean).join('\n');
							inlineCode = processCodeForDevice(inlineCode, false, true);
							try {
								inlineCode = ensureVersionedCoreImports(inlineCode, getServerOrigin(server), Number(ver));
							} catch {}
							try {
								inlineCode = ensureDestructureCoreImports(inlineCode);
							} catch {}
							// Replace legacy mutation pipeline with canonical assembler for reliability
							{
								// First: strip TypeScript robustly using Babel transform
								try {
									const tsRes = await babelCore.transformAsync(scriptTransformed, {
										plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
										ast: false,
										sourceType: 'module',
										configFile: false,
										babelrc: false,
									} as any);
									if (tsRes?.code) scriptTransformed = tsRes.code;
								} catch (eTs) {
									if (verbose) {
										try {
											console.warn('[sfc-asm][babel-ts][fail]', base, (eTs as any)?.message);
										} catch {}
									}
								}
								// Hoist imports + strip residual TS via AST
								let importLines: string[] = [];
								try {
									const astRes = astExtractImportsAndStripTypes(scriptTransformed);
									importLines = astRes.imports;
									scriptTransformed = astRes.body;
									if (astRes.diagnostics.length && verbose) {
										try {
											console.warn('[sfc-asm][ast]', base, astRes.diagnostics.join('; '));
										} catch {}
									}
								} catch (eAst) {
									if (verbose) {
										try {
											console.warn('[sfc-asm][ast][fail]', base, (eAst as any)?.message);
										} catch {}
									}
								}
								// Ensure renderDecl ends with closing brace ONLY for function declaration forms
								// Avoid appending to const-assignment forms like: const __ns_render = (function(){ ... })();
								if (renderDecl && /(^|\n)\s*(?:export\s+)?function\s+__ns_render\s*\(/.test(renderDecl) && !/\}\s*$/.test(renderDecl)) {
									renderDecl = renderDecl.trimEnd() + '\n}';
								}
								const outParts: string[] = [];
								outParts.push(`// [sfc-asm] ${base} (inline-compiled)`);
								outParts.push('// [sfc-asm][canonical]');
								if (importLines.length) outParts.push(Array.from(new Set(importLines)).join('\n'));
								// Place component script first so the component object exists before we attach render.
								outParts.push(scriptTransformed);
								// Prefer full template block to guarantee presence of all hoisted constants.
								if (inlineBlock) {
									outParts.push(inlineBlock);
								} else {
									if (helperBindings) outParts.push(helperBindings);
									if (renderDecl && renderDecl.trim()) outParts.push(renderDecl);
								}
								outParts.push(`try { if (!__ns_sfc__.render) Object.defineProperty(__ns_sfc__, 'render', { configurable: true, enumerable: true, get(){ const r = (typeof __ns_getRender==='function' ? __ns_getRender() : (typeof __ns_render==='function' ? __ns_render : undefined)); Object.defineProperty(__ns_sfc__, 'render', { value: r, writable: true, configurable: true, enumerable: true }); return r; }, set(v){ Object.defineProperty(__ns_sfc__, 'render', { value: v, writable: true, configurable: true, enumerable: true }); } }); } catch(_e){}`);
								outParts.push(`// diagnostic: hadScriptDefaultPre=${hadScriptDefaultPre} triedInlineTemplate=${triedInlineTemplate} renderOk=${renderOk} tplBytes=${compiledTplCode.length} scriptBytes=${(compiledScript || '').length} templateErr=${templateErr ? (templateErr as any)?.message : ''}`);
								// Export named render as a function that resolves lazily
								outParts.push('export function render(){ const f = (typeof __ns_getRender==="function" ? __ns_getRender() : (typeof __ns_render==="function" ? __ns_render : (__ns_sfc__ && __ns_sfc__.render))); return typeof f === "function" ? f.apply(this, arguments) : undefined; }');
								outParts.push('export default __ns_sfc__');
								let inlineCode2 = outParts.filter(Boolean).join('\n');
								inlineCode2 = processCodeForDevice(inlineCode2, false, true);
								try {
									inlineCode2 = ensureVersionedCoreImports(inlineCode2, getServerOrigin(server), Number(ver));
								} catch {}
								try {
									inlineCode2 = ensureDestructureCoreImports(inlineCode2);
								} catch {}
								// Hoist any late imports that accidentally landed after render or script assembly
								try {
									const lateImportRe = /^(?!\/\/).*^\s*import\s+[^;]+;?$/gm;
									const allImports: string[] = [];
									inlineCode2 = inlineCode2.replace(lateImportRe, (imp) => {
										allImports.push(imp);
										return '';
									});
									if (allImports.length) {
										// Place after helperBindings sentinel
										inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, `$1${Array.from(new Set(allImports)).join('\n')}\n/* [asm-fix] re-hoisted ${allImports.length} imports */\n`);
									}
								} catch {}
								// After hoisting, re-run AST normalization and duplicate-binding verification.
								// This guards against freshly hoisted imports reintroducing identifiers that collide
								// with earlier destructures (e.g., __ns_core_ns_1), which would otherwise surface at device runtime.
								try {
									inlineCode2 = astNormalizeModuleImportsAndHelpers(inlineCode2);
								} catch {}
								try {
									inlineCode2 = astVerifyAndAnnotateDuplicates(inlineCode2);
									if (/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\]/m.test(inlineCode2)) {
										const diagnosticLine = (inlineCode2.match(/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\][^\n]*/m) || [])[0] || '// [ast-verify][duplicate-bindings]';
										const brief = diagnosticLine.replace(/^[^:]*:?\s?/, '');
										const escaped = brief.replace(/["\\]/g, '\\$&');
										const thrower = `throw new Error("[nsv-hmr] Duplicate top-level bindings detected post-hoist: ${escaped}");`;
										inlineCode2 = `${thrower}\n` + inlineCode2;
									}
								} catch {}
								// Minimal cleanup only (avoid destructive type stripping breaking object literal property defaults)
								try {
									// Heal cases where a TS type strip earlier removed initializer: plain 'default' inside props objects
									// becomes 'default: undefined'. We only match when followed by ',' or '}' or newline to avoid 'export default'.
									inlineCode2 = inlineCode2.replace(/\bdefault\b\s*(?=\}|,|\n)/g, 'default: undefined');
									// Remove obvious leftover angle generic markers
									inlineCode2 = inlineCode2.replace(/<unknown>/g, '');
									// Fix accidental '}=> {' sequences
									inlineCode2 = inlineCode2.replace(/}\s*=>\s*\{/g, '');
									// No-op: removed prior broken normalization. Handlers are fixed in the dedicated passes below.
								} catch {}
								// Removed redundant render closure heal that could inject an extra '}' before component script.
								// Rewrite any remaining imports (e.g., relative app paths) to HTTP ESM endpoints
								try {
									inlineCode2 = rewriteImports(inlineCode2, base, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, getServerOrigin(server));
								} catch {}
								// Final TS strip on the whole assembled module (safety net)
								try {
									const tsFinal = await babelCore.transformAsync(inlineCode2, {
										plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
										ast: false,
										sourceType: 'module',
										configFile: false,
										babelrc: false,
									} as any);
									if (tsFinal?.code) inlineCode2 = tsFinal.code;
								} catch {}
								// Heal Vue v-model update handlers that lost the ": else" branch during transforms:
								// "onUpdate:modelValue": _cache[N] || (_cache[N] = $event => _isRef(name) ? name.value = $event)
								// → add else branch to keep syntax valid: : (name = $event)
								try {
									// Fix missing else branch on v-model handlers: support dotted expressions (e.g., $setup.acceptTerms)
									const reMissingElse = /\"onUpdate:modelValue\"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*\$event\s*=>\s*_isRef\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)\s*\?\s*\2\.value\s*=\s*\$event\s*\)/g;
									inlineCode2 = inlineCode2.replace(reMissingElse, (_m, idx: string, expr: string) => {
										return `\"onUpdate:modelValue\": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`;
									});
									// Repair malformed handlers without an arrow (introduced by previous transforms):
									// Convert pattern assigning to $event without an arrow into a proper arrow using the same target expression.
									const reMalformed = /\"onUpdate:modelValue\"\s*:\s*_cache\[(\d+)\]\s*\|\|\s*\(_cache\[\1\]\s*=\s*[^=]*\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)[^=]*=\s*\$event\s*\)\s*\)/g;
									inlineCode2 = inlineCode2.replace(reMalformed, (_m, idx: string, expr: string) => {
										return `\"onUpdate:modelValue\": _cache[${idx}] || (_cache[${idx}] = $event => (_isRef(${expr}) ? (${expr}.value = $event) : (${expr} = $event)))`;
									});
								} catch {}
								// Structural heal: ensure balanced braces before the first import statement
								try {
									const idx = inlineCode2.search(/^[\t ]*import\b/m);
									if (idx > 0) {
										const prefix = inlineCode2.slice(0, idx);
										let open = 0,
											close = 0;
										let inS = false,
											inD = false,
											inT = false,
											inLC = false,
											inBC = false;
										for (let i = 0; i < prefix.length; i++) {
											const ch = prefix[i],
												nx = prefix[i + 1];
											if (inLC) {
												if (ch === '\n') inLC = false;
												continue;
											}
											if (inBC) {
												if (ch === '*' && nx === '/') {
													inBC = false;
													i++;
												}
												continue;
											}
											if (inS) {
												if (ch === '\\') {
													i++;
													continue;
												}
												if (ch === "'") inS = false;
												continue;
											}
											if (inD) {
												if (ch === '\\') {
													i++;
													continue;
												}
												if (ch === '"') inD = false;
												continue;
											}
											if (inT) {
												if (ch === '\\') {
													i++;
													continue;
												}
												if (ch === '`') inT = false;
												continue;
											}
											if (ch === '/' && nx === '/') {
												inLC = true;
												i++;
												continue;
											}
											if (ch === '/' && nx === '*') {
												inBC = true;
												i++;
												continue;
											}
											if (ch === "'") {
												inS = true;
												continue;
											}
											if (ch === '"') {
												inD = true;
												continue;
											}
											if (ch === '`') {
												inT = true;
												continue;
											}
											if (ch === '{') open++;
											else if (ch === '}') close++;
										}
										const missing = open - close;
										if (missing > 0) {
											inlineCode2 = inlineCode2.slice(0, idx) + '}'.repeat(missing) + '\n' + inlineCode2.slice(idx);
										}
									}
								} catch {}
								// Final TS strip on the whole assembled module (safety net)
								try {
									const tsFinal = await babelCore.transformAsync(inlineCode2, {
										plugins: [[pluginTransformTypescript as any, { allowDeclareFields: true }]],
										ast: false,
										sourceType: 'module',
										configFile: false,
										babelrc: false,
									} as any);
									if (tsFinal?.code) inlineCode2 = tsFinal.code;
								} catch {}
								inlineCode2 = ensureVariableDynamicImportHelper(inlineCode2);
								inlineCode2 = ensureGuardPlainDynamicImports(inlineCode2, origin);
								inlineCode2 = REQUIRE_GUARD_SNIPPET + inlineCode2;
								// If no render materialized, return a clear error module for deterministic failure
								try {
									const lacksRender = !/__ns_render\b/.test(inlineCode2) && !/__ns_sfc__\.render\s*=/.test(inlineCode2);
									if (lacksRender) {
										const err = `throw new Error(\"[sfc-asm] ${base}: no render generated by assembler\");\nexport default {};`;
										res.statusCode = 200;
										res.end(err);
										return;
									}
								} catch {}
								// Cosmetic and parser-friendly: ensure a newline after the canonical banner
								try {
									inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\])(?!\n)/, '$1\n');
								} catch {}
								// Bust device cache for runtime bridge so helpers are always current for this graph version
								try {
									const origin = getServerOrigin(server);
									inlineCode2 = ensureVersionedRtImports(inlineCode2, origin, Number(ver));
									inlineCode2 = ACTIVE_STRATEGY.ensureVersionedImports(inlineCode2, origin, Number(ver));
									inlineCode2 = ensureVersionedCoreImports(inlineCode2, origin, Number(ver));
								} catch {}
								// Normalize imports/helpers via AST to ensure _defineComponent and other helpers are bound once
								try {
									inlineCode2 = astNormalizeModuleImportsAndHelpers(inlineCode2);
								} catch {}
								// Guarantee a concrete component object exists before exporting default.
								try {
									// Detect an existing declaration of __ns_sfc__ even if it's appended after a semicolon on the same line
									// e.g., "import ...;let __ns_sfc__;" (no newline). Accept start-of-string, newline, or semicolon as anchors.
									const hasDecl = /(^|[\n;])\s*(?:const|let|var)\s+__ns_sfc__\b/.test(inlineCode2);
									if (!hasDecl) {
										inlineCode2 = inlineCode2.replace(/(\/\/ \[sfc-asm\]\[canonical\]\n)/, `$1let __ns_sfc__ = {};\n`);
									}
									// Heal empty declarations (e.g., "let __ns_sfc__;" → initialize to {}), also when preceded by a semicolon
									inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*let\s+__ns_sfc__\s*;?/g, '$1let __ns_sfc__ = {};');
									inlineCode2 = inlineCode2.replace(/(^|[\n;])\s*var\s+__ns_sfc__\s*;?/g, '$1var __ns_sfc__ = {};');
								} catch {}
								if (!/export\s+default\s+__ns_sfc__/.test(inlineCode2) && /__ns_sfc__/.test(inlineCode2)) inlineCode2 += '\nexport default __ns_sfc__';
								res.statusCode = 200;
								res.end(inlineCode2);
								return;
							}
						}
					} catch {}
					// Do not use compiled ?vue or variant fallbacks; assembler must succeed or emit an error
					// Prefer compiling template from source via compiler-sfc; fallback to variant extraction
					let inlineOk = false;
					let helperBindings = '';
					let renderDecl = '';
					let inlineBlock: string | undefined = undefined;
					try {
						const root = (server as any).config?.root || process.cwd();
						const abs = path.join(root, base.replace(/^\//, ''));
						let sfcSrc = '';
						try {
							sfcSrc = readFileSync(abs, 'utf-8');
						} catch {}
						if (sfcSrc) {
							const { descriptor } = parse(sfcSrc, { filename: abs });
							const tpl = descriptor.template?.content || '';
							if (tpl) {
								const id = createHash('md5').update(abs).digest('hex').slice(0, 8);
								const ct = compileTemplate({
									source: tpl,
									id,
									filename: abs,
									isProd: false,
									ssr: false,
									compilerOptions: {
										isCustomElement: (tag: string) => NS_NATIVE_TAGS.has(tag),
									},
								});
								let compiled = (ct && (ct.code || '')) || '';
								if (compiled) {
									// Prefer a full inline template block preserving hoists
									inlineBlock = buildInlineTemplateBlock(compiled) || undefined;
									if (inlineBlock) {
										inlineOk = true;
									} else {
										const extracted = extractTemplateRender(compiled);
										inlineOk = extracted.ok;
										helperBindings = extracted.helperBindings;
										renderDecl = extracted.renderDecl;
										inlineBlock = extracted.inlineBlock;
									}
								}
							}
						}
					} catch {}
					// If compiler-sfc path didn't succeed, attempt variant extraction once
					if (!inlineOk) {
						const extracted = extractTemplateRender(templateCode);
						inlineOk = extracted.ok;
						helperBindings = extracted.helperBindings;
						renderDecl = extracted.renderDecl;
						inlineBlock = extracted.inlineBlock;
					}
					let asm: string;
					if (inlineOk) {
						const diagLine = `// diagnostic:inlineOk ver=${ver} inlineBlock=${!!(inlineBlock && inlineBlock.trim())} helperBindingsLen=${helperBindings.length} renderDeclLen=${renderDecl.length}`;
						if (inlineBlock && inlineBlock.trim()) {
							asm = [`// [sfc-asm] ${base} (inlined template body)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, inlineBlock, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, `export default __ns_sfc__;`, diagLine].join('\n');
						} else {
							asm = [`// [sfc-asm] ${base} (inlined template)`, `export * from ${JSON.stringify(scriptUrl)};`, `import * as __script from ${JSON.stringify(scriptUrl)};`, helperBindings, renderDecl, `const __ns_sfc__ = (__script && __script.default) ? __script.default : {};`, `try { if (typeof __ns_render === 'function' && !__ns_sfc__.render) __ns_sfc__.render = __ns_render; } catch {}`, `export default __ns_sfc__;`, diagLine].filter(Boolean).join('\n');
						}
					} else {
						// Deterministic error path when template extraction failed
						res.statusCode = 500;
						res.end(`throw new Error('[sfc-asm] ${base}: template extraction failed');\nexport default {};`);
						return;
					}
					// Run full device processing so helper aliasing and globals are consistent in this path too
					let code = REQUIRE_GUARD_SNIPPET + asm;
					code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(base), base);
					try {
						code = ensureVersionedCoreImports(code, getServerOrigin(server), Number(ver));
					} catch {}
					code = rewriteImports(code, base, sfcFileMap, depFileMap, projectRoot, !!verbose, undefined, getServerOrigin(server));
					try {
						code = ensureDestructureCoreImports(code);
					} catch {}
					code = ensureVariableDynamicImportHelper(code);
					code = ensureGuardPlainDynamicImports(code, origin);
					try {
						const origin = getServerOrigin(server);
						code = ensureVersionedRtImports(code, origin, Number(ver));
						code = ACTIVE_STRATEGY.ensureVersionedImports(code, origin, Number(ver));
						code = ensureVersionedCoreImports(code, origin, Number(ver));
					} catch {}
					// Inline-template body path already runs processCodeForDevice (AST + sanitizers); no additional _defineComponent fix needed
					res.statusCode = 200;
					res.end(code);
				} catch (e) {
					res.statusCode = 500;
					res.end('export {}\n');
				}
			});

			wss.on('connection', async (ws) => {
				if (verbose) console.log('[hmr-ws] Client connected (dynamic fetch mode)');

				ws.on('close', () => verbose && console.log('[hmr-ws] Client disconnected'));
				ws.on('message', (data: any) => {
					try {
						const msg = JSON.parse(String(data));
						if (msg?.type === 'ns:hmr-resync-request') {
							emitFullGraph(ws as any);
						} else if (msg?.type === 'ns:hmr-sfc-registry-request') {
							// Resend full SFC registry (lightweight code path)
							ACTIVE_STRATEGY.buildRegistry({
								server,
								sfcFileMap,
								depFileMap,
								wss: wss!,
								verbose,
								helpers: {
									cleanCode,
									collectImportDependencies,
									isCoreGlobalsReference,
									isNativeScriptCoreModule,
									isNativeScriptPluginModule,
									resolveVendorFromCandidate,
									createHash: (value: string) => createHash('md5').update(value).digest('hex'),
									rewriteImports,
									processSfcCode,
								},
							}).catch(() => {});
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
									const root = (server as any).config?.root || process.cwd();
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
									const root = (server as any).config?.root || process.cwd();
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
									code = cleanCode(code);
									code = processCodeForDevice(code, false, true, /(?:^|\/)node_modules\//.test(resolvedCandidate || spec), resolvedCandidate || spec);
									try {
										code = ensureVersionedCoreImports(code, getServerOrigin(server), graphVersion);
									} catch {}
									code = rewriteImports(code, spec, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
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
												depCode = cleanCode(depCode);
												depCode = processCodeForDevice(depCode, false, true, /(?:^|\/)node_modules\//.test(depResolved), depResolved);
												try {
													depCode = ensureVersionedCoreImports(depCode, getServerOrigin(server), graphVersion);
												} catch {}
												depCode = rewriteImports(depCode, depResolved, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
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
					await ACTIVE_STRATEGY.buildRegistry({
						server,
						sfcFileMap,
						depFileMap,
						wss: wss!,
						verbose,
						helpers: {
							cleanCode,
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
				emitFullGraph(ws as any);

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
			const { file, server } = ctx;
			if (!wss) {
				return;
			}
			// Graph update for this file change (wrapped to avoid aborting rest of handler)
			try {
				const skipAngularHtmlGraphUpdate = ACTIVE_STRATEGY.flavor === 'angular' && /\.(html|htm)$/i.test(file);
				if (!skipAngularHtmlGraphUpdate) {
					const graphTargets = collectGraphUpdateModulesForHotUpdate({
						file,
						flavor: ACTIVE_STRATEGY.flavor,
						modules: ctx.modules,
						getModuleById: (id) => server.moduleGraph.getModuleById(id) as HotUpdateGraphModuleLike | undefined,
					});
					for (const mod of graphTargets) {
						if (!mod?.id) continue;
						try {
							const deps = Array.from(mod.importedModules || [])
								.map((m) => (m.id || '').replace(/\?.*$/, ''))
								.filter(Boolean);
							const transformed = await server.transformRequest(mod.id);
							const code = transformed?.code || '';
							upsertGraphModule((mod.id || '').replace(/\?.*$/, ''), code, deps, { emitDeltaOnInsert: true });
						} catch (error) {
							if (verbose) console.warn('[hmr-ws][v2] failed graph update target', mod.id, error);
						}
					}
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][v2] failed graph update', e);
			}

			const root = server.config.root || process.cwd();
			const srcDir = `${root}/src`;
			const coreDir = `${root}/core`;
			const appDir = `${root}/${APP_ROOT_DIR}`;
			const normalizedFile = file.split(path.sep).join('/');
			const inSrcOrCore = normalizedFile.includes(srcDir) || normalizedFile.includes(coreDir);
			const inApp = normalizedFile.includes(appDir);
			const shouldIgnore = !(inSrcOrCore || inApp);
			if (shouldIgnore) return;
			if (verbose) console.log(`[hmr-ws] Hot update for: ${file}`);

			// Handle CSS updates
			if (file.endsWith('.css')) {
				try {
					let rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');

					const origin = getServerOrigin(server);
					const msg = {
						type: 'ns:css-updates',
						origin,
						updates: [
							{
								type: 'css-update',
								path: rel,
								acceptedPath: rel,
								timestamp: Date.now(),
							},
						],
					};

					wss.clients.forEach((client) => {
						if (isSocketClientOpen(client)) {
							client.send(JSON.stringify(msg));
						}
					});
				} catch (error) {
					console.warn('[hmr-ws] CSS update failed:', error);
				}
				return;
			}

			// Framework-specific hot update handling
			if (ACTIVE_STRATEGY.flavor === 'angular') {
				// For Angular, react to component TS or external template HTML changes under /src
				const isHtml = file.endsWith('.html');
				const isTs = file.endsWith('.ts');
				const angularHotUpdateRoots = collectAngularHotUpdateRoots({
					file,
					modules: ctx.modules,
					getModuleById: (id) => server.moduleGraph.getModuleById(id) as HotUpdateGraphModuleLike | undefined,
					getModulesByFile: (targetFile) => (server.moduleGraph as any).getModulesByFile?.(targetFile) as Iterable<HotUpdateGraphModuleLike> | undefined,
				});
				if (!(isHtml || isTs)) return;

				if (angularHotUpdateRoots.length) {
					for (const mod of angularHotUpdateRoots) {
						try {
							server.moduleGraph.invalidateModule(mod as any);
						} catch (invalidationError) {
							if (verbose) {
								console.warn('[hmr-ws][angular] hot-update root invalidation failed', mod?.id, invalidationError);
							}
						}
					}
					if (verbose) {
						console.log('[hmr-ws][angular] invalidated hot-update root modules:', angularHotUpdateRoots.length);
					}
				}

				const angularTransitiveInvalidationRoots = (angularHotUpdateRoots.length ? angularHotUpdateRoots : (ctx.modules as unknown as Iterable<TransitiveImporterModuleLike>)) as Iterable<TransitiveImporterModuleLike>;

				if (shouldInvalidateAngularTransitiveImporters({ flavor: ACTIVE_STRATEGY.flavor, file })) {
					try {
						const transitiveImporters = collectAngularTransitiveImportersForInvalidation({
							modules: angularTransitiveInvalidationRoots,
							isExcluded: (id) => id.includes('/node_modules/'),
							maxDepth: 16,
						});
						for (const mod of transitiveImporters) {
							try {
								server.moduleGraph.invalidateModule(mod as any);
							} catch (invalidationError) {
								if (verbose) {
									console.warn('[hmr-ws][angular] transitive importer invalidation failed', mod?.id, invalidationError);
								}
							}
						}
						if (verbose && transitiveImporters.length) {
							console.log('[hmr-ws][angular] invalidated transitive importers:', transitiveImporters.length);
						}
					} catch (error) {
						if (verbose) console.warn('[hmr-ws][angular] transitive importer collection failed', error);
					}
				}

				try {
					const transitiveImporters = shouldInvalidateAngularTransitiveImporters({ flavor: ACTIVE_STRATEGY.flavor, file })
						? collectAngularTransitiveImportersForInvalidation({
								modules: angularTransitiveInvalidationRoots,
								isExcluded: (id) => id.includes('/node_modules/'),
								maxDepth: 16,
							})
						: [];
					const transformCacheInvalidationUrls = new Set(
						collectAngularTransformCacheInvalidationUrls({
							file,
							isTs,
							hotUpdateRoots: angularHotUpdateRoots,
							transitiveImporters,
							projectRoot: server.config.root || process.cwd(),
						}),
					);
					if (transformCacheInvalidationUrls.size) {
						sharedTransformRequest.invalidateMany(transformCacheInvalidationUrls);
						if (verbose) {
							console.log('[hmr-ws][angular] purged shared transform cache entries:', transformCacheInvalidationUrls.size);
						}
					}
				} catch (error) {
					if (verbose) console.warn('[hmr-ws][angular] shared transform cache purge failed', error);
				}
				try {
					const root = server.config.root || process.cwd();
					const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
					rememberAngularReloadSuppression(root, file);
					const origin = getServerOrigin(server);
					const msg = {
						type: 'ns:angular-update',
						origin,
						path: rel,
						timestamp: Date.now(),
					} as const;
					if (verbose) {
						console.log(
							'[hmr-ws][angular] broadcasting update',
							Array.from(wss.clients || []).map((client) => ({ readyState: client.readyState, openState: (client as any).OPEN })),
						);
					}
					wss.clients.forEach((client) => {
						if (isSocketClientOpen(client)) {
							client.send(JSON.stringify(msg));
						}
					});
				} catch (error) {
					console.warn('[hmr-ws][angular] update failed:', error);
				}
				if (shouldSuppressDefaultViteHotUpdate({ flavor: ACTIVE_STRATEGY.flavor, file })) {
					return [];
				}
				return;
			}

			// TypeScript flavor: emit generic graph delta for app XML/TS/style changes
			if (ACTIVE_STRATEGY.flavor === 'typescript') {
				try {
					const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
					if (verbose) console.log('[hmr-ws][ts] app file hot update', { file, rel });
					// Treat the changed file itself as a graph module with no deps. We only
					// care that its hash/identity changes so the client sees a delta and can
					// perform a TS root reset. Code is not used for execution here.
					upsertGraphModule(rel, '', [], { emitDeltaOnInsert: true });
				} catch (e) {
					if (verbose) console.warn('[hmr-ws][ts] failed to emit delta for', file, e);
				}
				return;
			}

			// Solid flavor: emit graph delta for app TSX/TS/JSX file changes.
			// The common graph-update block above (moduleGraph lookup) may have
			// already emitted a delta if the file was in Vite's module graph.
			// This handler ensures a delta is emitted even if the module wasn't
			// found (e.g. new file, or moduleGraph mismatch), and provides
			// Solid-specific logging. The client-side processQueue handles
			// propagation from non-component .ts files to .tsx component boundaries.
			if (ACTIVE_STRATEGY.flavor === 'solid') {
				const isSolidFile = /\.(tsx?|jsx?)$/i.test(file);
				if (!isSolidFile) return;
				try {
					const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
					if (verbose) console.log('[hmr-ws][solid] app file hot update', { file, rel });
					// If the common block already upserted (hash changed), this will
					// detect unchanged hash and no-op. If the common block missed it
					// (module not in Vite's graph), this forces the delta emission.
					const normalizedId = normalizeGraphId(rel);
					const existing = graph.get(normalizedId);
					if (!existing) {
						// Module not in graph yet — force upsert with timestamp-based
						// hash so the client sees a change.
						upsertGraphModule(rel, `/* solid-hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });
					}
					// Log what we're sending so devs can trace the flow on the server side.
					if (verbose) {
						const gm = graph.get(normalizedId);
						console.log('[hmr-ws][solid] delta module', { id: gm?.id, hash: gm?.hash });
					}
				} catch (e) {
					if (verbose) console.warn('[hmr-ws][solid] failed to handle hot update for', file, e);
				}
				return;
			}

			// Handle .vue file updates
			if (!file.endsWith('.vue')) {
				if (verbose) console.log('[hmr-ws] Not a .vue file, skipping');
				return;
			}

			console.log('[hmr-ws] Processing .vue file update...');

			try {
				const root = server.config.root || process.cwd();
				let rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');

				// Transform the .vue file
				const transformed = await server.transformRequest(rel);
				if (!transformed?.code) return;

				let code = transformed.code;

				// Clean and process
				code = cleanCode(code);

				// Process dependencies
				const visitedPaths = new Set<string>();
				const importerDir = path.posix.dirname(rel);

				// Collect dependencies from this file
				const deps = new Set<string>();
				const collectDeps = (pattern: RegExp) => {
					let match: RegExpExecArray | null;
					while ((match = pattern.exec(code)) !== null) {
						const spec = match[2];
						if (!spec || PAT.VUE_FILE_PATTERN.test(spec) || !shouldRemapImport(spec)) {
							continue;
						}

						let key: string;
						if (spec.startsWith('/')) {
							key = spec;
						} else if (spec.startsWith('./') || spec.startsWith('../')) {
							key = path.posix.normalize(path.posix.join(importerDir, spec));
							if (!key.startsWith('/')) key = '/' + key;
						} else {
							continue;
						}

						key = key.replace(PAT.QUERY_PATTERN, '');
						deps.add(key);
					}
				};

				collectDeps(PAT.IMPORT_PATTERN_1);
				collectDeps(PAT.IMPORT_PATTERN_2);
				collectDeps(PAT.EXPORT_PATTERN);
				collectDeps(PAT.IMPORT_PATTERN_3);

				// CRITICAL: Collect .vue file imports separately
				// Use matchAll() to avoid regex state issues
				const vueDeps = new Set<string>();
				const vueImportMatches = [...code.matchAll(PAT.IMPORT_PATTERN_1), ...code.matchAll(PAT.VUE_FILE_IMPORT)];

				for (const match of vueImportMatches) {
					const spec = match[2];
					if (!spec || !PAT.VUE_FILE_PATTERN.test(spec)) {
						continue;
					}

					let key: string;
					if (spec.startsWith('/')) {
						key = spec.replace(PAT.QUERY_PATTERN, '');
					} else if (spec.startsWith('./') || spec.startsWith('../')) {
						key = path.posix.normalize(path.posix.join(importerDir, spec.replace(PAT.QUERY_PATTERN, '')));
						if (!key.startsWith('/')) key = '/' + key;
					} else {
						continue;
					}

					// Ensure this .vue file is registered in sfcFileMap
					if (!sfcFileMap.has(key)) {
						const hash = createHash('md5').update(key).digest('hex').slice(0, 8);
						sfcFileMap.set(key, `sfc-${hash}.mjs`);
						if (verbose) {
							console.log(`[hmr-ws] Registered .vue import: ${key} → sfc-${hash}.mjs`);
						}
					}

					// Add to vueDeps for separate processing
					vueDeps.add(key);
				}

				// Process .vue dependencies (they stay as sfc-*.mjs imports)
				for (const vueDep of vueDeps) {
					await ACTIVE_STRATEGY.processFile({
						filePath: vueDep,
						server,
						sfcFileMap,
						depFileMap,
						visitedPaths,
						wss,
						verbose,
						helpers: {
							cleanCode,
							collectImportDependencies,
							isCoreGlobalsReference,
							isNativeScriptCoreModule,
							isNativeScriptPluginModule,
							resolveVendorFromCandidate,
							createHash: (value: string) => createHash('md5').update(value).digest('hex'),
						},
					});
				}

				// Process with consistent SFC processor (removes non-.vue imports)
				code = processSfcCode(code);

				// Rewrite ONLY .vue imports (everything else is now inlined)
				const projectRoot = server.config.root || process.cwd();
				code = rewriteImports(code, rel, sfcFileMap, depFileMap, projectRoot, opts.verbose, undefined);
				upsertGraphModule(rel, code, [...deps, ...vueDeps]);

				// Add HMR runtime prelude (CRITICAL for runtime)
				const hmrPrelude = `
// Embedded HMR Runtime for NativeScript runtime
const createHotContext = (id) => ({
  on: (event, handler) => {
    if (!globalThis.__NS_HMR_HANDLERS__) globalThis.__NS_HMR_HANDLERS__ = new Map();
    if (!globalThis.__NS_HMR_HANDLERS__.has(id)) globalThis.__NS_HMR_HANDLERS__.set(id, []);
    globalThis.__NS_HMR_HANDLERS__.get(id).push({ event, handler });
  },
  accept: (handler) => {
    if (!globalThis.__NS_HMR_ACCEPTS__) globalThis.__NS_HMR_ACCEPTS__ = new Map();
    globalThis.__NS_HMR_ACCEPTS__.set(id, handler);
  }
});

if (typeof import.meta === 'undefined') {
  globalThis.importMeta = { hot: null };
} else if (!import.meta.hot) {
  import.meta.hot = null;
}

const __vite__createHotContext = createHotContext;

if (typeof __VUE_HMR_RUNTIME__ === 'undefined') {
  globalThis.__VUE_HMR_RUNTIME__ = {
    createRecord: () => true,
    reload: () => {},
    rerender: () => {},
  };
}

// Install a lightweight guard to capture require('http(s)://...') attempts with stack traces
(() => {
  try {
    const g = globalThis;
    if (g.__NS_REQUIRE_GUARD_INSTALLED__) return;
	const makeGuard = (orig, label) => function () {
      try {
        const spec = arguments[0];
        if (typeof spec === 'string' && /^(?:https?:)\/\//.test(spec)) {
          const err = new Error('[ns-hmr][require-guard] require of URL: ' + spec + ' via ' + label);
          const stack = err.stack || '';
          try { console.error(err.message + '\n' + stack); } catch {}
          try { g.__NS_REQUIRE_GUARD_LAST__ = { spec, stack, label, ts: Date.now() }; } catch {}
        }
      } catch {}
      return orig.apply(this, arguments);
    };
    if (typeof g.require === 'function' && !g.require.__NS_REQ_GUARDED__) {
      const orig = g.require; g.require = makeGuard(orig, 'require'); g.require.__NS_REQ_GUARDED__ = true;
    }
    if (typeof g.__nsRequire === 'function' && !g.__nsRequire.__NS_REQ_GUARDED__) {
      const orig = g.__nsRequire; g.__nsRequire = makeGuard(orig, '__nsRequire'); g.__nsRequire.__NS_REQ_GUARDED__ = true;
    }
    g.__NS_REQUIRE_GUARD_INSTALLED__ = true;
  } catch {}
})();
`;

				code = hmrPrelude + '\n' + code;

				// Update SFC registry
				const hash = createHash('md5').update(rel).digest('hex').slice(0, 8);
				const hmrId = hash;
				const fileName = sfcFileMap.get(rel) || `sfc-${hash}.mjs`;
				sfcFileMap.set(rel, fileName);

				const ts = Date.now();
				const absolutePath = `file://${path.resolve(file)}`;

				// FIRST: Send mapping-only registry update (no code)
				const registryUpdateMsg = {
					type: 'ns:vue-sfc-registry-update',
					path: rel,
					fileName,
					ts,
					version: graphVersion,
				};

				wss.clients.forEach((client) => {
					if (isSocketClientOpen(client)) {
						client.send(JSON.stringify(registryUpdateMsg));
					}
				});

				// SECOND/THIRD: Removed WS code-push and template URL emissions in HTTP-only mode.
				// The device loads SFC artifacts via HTTP endpoints directly; WS remains metadata-only.
				const id = path
					.basename(file)
					.replace(/\.vue$/i, '')
					.toLowerCase();
				// placeholder source for any legacy dynamic module shapes that may still reference it
				const source = '';

				// FOURTH: Send dynamic module message (CRITICAL - this is what triggers the actual HMR!)
				const moduleId = `hmr-${id}-${ts}`;
				const modulePath = `/${rel}?hmr=${ts}`;
				let appDeps: string[] | undefined;
				try {
					// Enhanced dependency harvesting for pre-await:
					//  * Preserve .mjs extension when present so client can await exact filesystem module
					//  * Recognize rewritten __NSDOC__/foo/bar.mjs and convert to /foo/bar.mjs base form
					//  * Convert absolute app paths to /app-style references (with extension) for uniformity
					//  * Exclude vendor runtime/plugin modules and synthetic dep-* & sfc-* artifacts as before
					const raw = collectImportDependencies(code, rel);
					const filtered: Set<string> = new Set();
					const addCandidate = (orig: string) => {
						if (!orig) return;
						let cleaned = orig.replace(PAT.QUERY_PATTERN, '');
						if (isCoreGlobalsReference(cleaned)) return;
						if (isNativeScriptCoreModule(cleaned)) return;
						if (isNativeScriptPluginModule(cleaned)) return;
						if (resolveVendorFromCandidate(cleaned)) return;
						if (/\bdep-[a-f0-9]{8}\.mjs$/i.test(cleaned)) return;
						if (/\bsfc-[a-f0-9]{8}\.mjs$/i.test(cleaned)) return;
						// Normalize __NSDOC__/ prefix
						if (cleaned.startsWith('__NSDOC__/')) {
							cleaned = cleaned.substring('__NSDOC__/'.length);
							if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
						}
						// Relative path (./ or ../) → resolve to absolute /path relative to SFC file
						if (cleaned.startsWith('./') || cleaned.startsWith('../')) {
							const importerDir = path.posix.dirname(rel);
							let abs = path.posix.normalize(path.posix.join(importerDir, cleaned));
							if (!abs.startsWith('/')) abs = '/' + abs;
							cleaned = abs;
						}
						if (!cleaned.startsWith('/')) return; // still not absolute app path
						cleaned = cleaned.replace(/\.(ts|js|tsx|jsx|mts|cts)$/i, '.mjs');
						if (!/\.mjs$/i.test(cleaned)) return;
						filtered.add(cleaned);
					};
					for (const spec of raw) {
						addCandidate(spec);
					}

					// Additional scan: after rewrites, application imports may appear only as string literals
					// with the canonical placeholder __NSDOC__/ – collect them directly.
					const NSDOC_IMPORT_PATTERN = /__NSDOC__\/([A-Za-z0-9_\-./]+?\.mjs)\b/g;
					{
						let m: RegExpExecArray | null;
						while ((m = NSDOC_IMPORT_PATTERN.exec(code)) !== null) {
							const relSpec = m[1]; // path relative to documents root
							if (relSpec) {
								const normalized = '/' + relSpec.replace(/^\/+/, '');
								addCandidate(normalized);
							}
						}
					}

					// Heuristic for barrel index modules that might not have explicit .mjs import strings
					const utilsIndexCandidate = `${APP_VIRTUAL_WITH_SLASH}utils/index.mjs`;
					const hasUtilsIndex = Array.from(filtered).some((p) => p.toLowerCase() === utilsIndexCandidate.toLowerCase());
					if (!hasUtilsIndex) {
						const utilsMarker = `${APP_VIRTUAL_WITH_SLASH}utils/`;
						if (code.includes(utilsMarker)) {
							addCandidate(utilsIndexCandidate);
						}
					}
					if (filtered.size) {
						appDeps = Array.from(filtered);
					}
				} catch {
					// Silently ignore errors – dependency pre-await is an optimization only
				}

				// After computing appDeps: no WS push. Client discovers deps via HTTP imports on demand.

				// Legacy dynamic module protocol removed in v2 graph system.
			} catch (error) {
				console.warn('[hmr-ws] HMR update failed:', error);
				console.error(error);
			}

			// CRITICAL: Return empty array to prevent Vite's default HMR
			return [];
		},
	};
}

// ----------
// Framework-specific HMR WebSocket plugins
// ----------
export function hmrWebSocketVue(opts: { verbose?: boolean }): Plugin {
	ACTIVE_STRATEGY = resolveFrameworkStrategy('vue');
	return createHmrWebSocketPlugin(opts);
}

export function hmrWebSocketAngular(opts: { verbose?: boolean }): Plugin {
	ACTIVE_STRATEGY = resolveFrameworkStrategy('angular');
	return createHmrWebSocketPlugin(opts);
}

export function hmrWebSocketSolid(opts: { verbose?: boolean }): Plugin {
	ACTIVE_STRATEGY = resolveFrameworkStrategy('solid');
	return createHmrWebSocketPlugin(opts);
}

export function hmrWebSocketTypescript(opts: { verbose?: boolean }): Plugin {
	ACTIVE_STRATEGY = resolveFrameworkStrategy('typescript');
	return createHmrWebSocketPlugin(opts);
}

/**
 * Get server origin for URLs
 */
function getServerOrigin(server: ViteDevServer): string {
	const urls: any = (server as any).resolvedUrls;
	// Prefer a real LAN/network URL when available so emulators/devices can reach the host directly.
	if (urls?.network?.length) {
		try {
			const u = new URL(String(urls.network[0]));
			const origin = `${u.protocol}//${u.host}`;
			if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
				console.warn('[hmr][origin] invariant failed for resolvedUrls.network:', urls.network[0], '→', origin);
			}
			return origin;
		} catch {
			// Fallthrough to local below if network parse fails
		}
	}
	if (urls?.local?.length) {
		try {
			const u = new URL(String(urls.local[0]));
			const origin = `${u.protocol}//${u.host}`;
			if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
				console.warn('[hmr][origin] invariant failed for resolvedUrls.local:', urls.local[0], '→', origin);
			}
			return origin;
		} catch {
			// Fallthrough to manual construction
		}
	}

	const isHttps = !!server.config.server?.https;
	const httpServer = server.httpServer as any;
	const addr = httpServer?.address?.();
	const port = Number(server.config.server?.port || addr?.port || 5173);
	const hostCfg = server.config.server?.host;
	const host = typeof hostCfg === 'string' && hostCfg !== '0.0.0.0' ? hostCfg : '127.0.0.1';

	const origin = `${isHttps ? 'https' : 'http'}://${host}:${port}`;
	if (!/^https?:\/\/[\w\-.:\[\]]+$/.test(origin)) {
		console.warn('[hmr][origin] invariant failed for constructed origin:', origin);
	}
	return origin;
}

// Test-only export: allow unit tests to run the sanitizer on snippets without booting a server
// Safe in production builds; this is a named export that tests can import explicitly.
export const __test_processCodeForDevice = processCodeForDevice;
export const __test_resolveVendorRouting = resolveVendorRouting;
export const __test_getBlockedDeviceNodeModulesReason = getBlockedDeviceNodeModulesReason;
