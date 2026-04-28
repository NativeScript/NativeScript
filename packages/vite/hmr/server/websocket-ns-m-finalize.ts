import type { FrameworkServerStrategy } from './framework-strategy.js';

import { fixDanglingCoreFrom, normalizeAnyCoreSpecToBridge, normalizeStrayCoreStringLiterals } from './core-sanitize.js';
import { assertNoOptimizedArtifacts, buildBootProgressSnippet, deduplicateLinkerImports, dedupeRtNamedImportsAgainstDestructures, ensureDestructureCoreImports, ensureGuardPlainDynamicImports, ensureVariableDynamicImportHelper, ensureVersionedRtImports, hoistTopLevelStaticImports, wrapCommonJsModuleForDevice } from './websocket-served-module-helpers.js';
import { ensureVersionedCoreImports } from './websocket-core-bridge.js';
import { formatNsMHmrServeTag, getNumericServeVersionTag, rewriteNsMImportPathForHmr } from './websocket-ns-m-paths.js';

export interface FinalizeNsMServedModuleHelpers {
	requireGuardSnippet: string;
	cleanCode(code: string): string;
	processCodeForDevice(code: string, sourceId?: string): string;
	rewriteImports(code: string, importerPath: string): string;
	rewriteAngularEntry(code: string, importerPath: string): string;
	expandStarExports(code: string): Promise<string>;
	warn?(message: string, error: unknown): void;
}

export interface FinalizeNsMServedModuleOptions {
	code: string;
	spec: string;
	resolvedCandidate: string | null;
	forcedVer: string | null;
	bootTaggedRequest: boolean;
	graphVersion: number;
	serverOrigin: string;
	strategy: FrameworkServerStrategy;
	helpers: FinalizeNsMServedModuleHelpers;
}

function appendRoutesDefaultExport(code: string): string {
	if (/\bexport\s+default\b/.test(code)) {
		return code;
	}
	const hasNamedRoutes = /\bexport\s*\{\s*routes\s*\}/.test(code);
	const hasConstRoutes = /\bconst\s+routes\s*=/.test(code) || /\bvar\s+routes\s*=/.test(code) || /\blet\s+routes\s*=/.test(code);
	if (hasNamedRoutes && hasConstRoutes) {
		return `${code}\nexport default routes;\n`;
	}
	return code;
}

export async function finalizeNsMServedModule(options: FinalizeNsMServedModuleOptions): Promise<string> {
	const { spec, resolvedCandidate, forcedVer, bootTaggedRequest, graphVersion, serverOrigin, strategy, helpers } = options;
	let code = `${helpers.requireGuardSnippet}${options.code}`;

	code = helpers.cleanCode(code);
	code = helpers.processCodeForDevice(code, resolvedCandidate || spec);
	if (strategy.flavor === 'angular') {
		code = helpers.rewriteAngularEntry(code, resolvedCandidate || spec);
	} else {
		code = helpers.rewriteImports(code, resolvedCandidate || spec);
	}

	try {
		code = await helpers.expandStarExports(code);
	} catch (error) {
		helpers.warn?.('[ns/m] export* expansion failed', error);
	}

	code = dedupeRtNamedImportsAgainstDestructures(code);
	code = ensureVariableDynamicImportHelper(code);
	code = ensureGuardPlainDynamicImports(code, serverOrigin);

	try {
		const previous = code;
		code = normalizeStrayCoreStringLiterals(code);
		code = fixDanglingCoreFrom(code);
		code = normalizeAnyCoreSpecToBridge(code);
		if (code !== previous) {
			code = `// [hmr-sanitize] core-literal->bridge\n${code}`;
		}
	} catch {}

	try {
		code = deduplicateLinkerImports(code);
	} catch {}

	code = wrapCommonJsModuleForDevice(code, resolvedCandidate || null);
	assertNoOptimizedArtifacts(code, `NS M ${resolvedCandidate || spec}`);
	code = appendRoutesDefaultExport(code);

	const versionNumber = getNumericServeVersionTag(forcedVer, Number(graphVersion || 0));
	code = ensureVersionedRtImports(code, serverOrigin, versionNumber);
	code = strategy.ensureVersionedImports(code, serverOrigin, versionNumber);
	code = ensureVersionedCoreImports(code, serverOrigin, versionNumber);

	// Prefer the current graph version over the request's forcedVer for child
	// import paths: a parent requested at /ns/m/__ns_hmr__/live/... must emit
	// children tagged with the current graph version, not 'live'. Otherwise the
	// same file lands in two iOS HTTP ESM cache entries (one at /live/..., one
	// at /v{N}/...) when different parents request it at different tags,
	// producing duplicate Angular class identities and NG0912 collisions.
	const pickServeTagSource = (): string | number => {
		const rawForced = String(forcedVer || '').trim();
		const gv = Number(graphVersion || 0);
		if (rawForced === 'live' && gv > 0) {
			return gv;
		}
		return forcedVer || graphVersion || 0;
	};
	const serveTag = formatNsMHmrServeTag(pickServeTagSource());
	const rewritePath = (value: string) => rewriteNsMImportPathForHmr(value, serveTag, bootTaggedRequest);
	code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_match: string, before: string, value: string, after: string) => `${before}${rewritePath(value)}${after}`);
	code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, (_match: string, before: string, value: string, after: string) => `${before}${rewritePath(value)}${after}`);
	code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, (_match: string, before: string, value: string, after: string) => `${before}${rewritePath(value)}${after}`);
	code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, (_match: string, before: string, value: string, after: string) => `${before}${rewritePath(value)}${after}`);
	code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, (_match: string, before: string, value: string, after: string) => `${before}${rewritePath(value)}${after}`);
	code = code.replace(/new\s+URL\(\s*["'](\/ns\/m\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_match: string, value: string) => JSON.stringify(`${serverOrigin}${rewritePath(value)}`));
	code = code.replace(/new\s+URL\(\s*["']\/ns\/sfc(\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_match: string, value: string) => JSON.stringify(`${serverOrigin}/ns/sfc/${serveTag}${value}`));

	code = ensureDestructureCoreImports(code);

	if (bootTaggedRequest) {
		const bootProgressSnippet = buildBootProgressSnippet(String(spec || '').replace(/\\/g, '/'));
		code = `${bootProgressSnippet}${code}`;
		code = hoistTopLevelStaticImports(code);
	}

	return code;
}
