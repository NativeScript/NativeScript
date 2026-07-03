import { parse as babelParse } from '@babel/parser';
import * as t from '@babel/types';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import * as PAT from './constants.js';
import { isDeepCoreSubpath } from './core-sanitize.js';
import { getCjsNamedExports } from '../helpers/cjs-named-exports.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { extractDirectExportedNames, parseExportSpecList } from './websocket-core-bridge.js';
import { resolveCandidateFilePath } from './websocket-module-specifiers.js';

let cachedWorkspaceCoreRoot: string | null | undefined;

/**
 * Absolute root of @nativescript/core when it is consumed from monorepo
 * source (`<workspace>/packages/core` in the NativeScript repo) rather than
 * node_modules. Returns null for standalone apps.
 */
export function getWorkspaceCoreSourceRoot(): string | null {
	if (cachedWorkspaceCoreRoot !== undefined) return cachedWorkspaceCoreRoot;
	cachedWorkspaceCoreRoot = null;
	try {
		const wsRoot = getMonorepoWorkspaceRoot();
		if (wsRoot) {
			const pkgPath = path.join(wsRoot, 'packages/core/package.json');
			if (existsSync(pkgPath)) {
				const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
				if (pkg?.name === '@nativescript/core') {
					cachedWorkspaceCoreRoot = path.resolve(wsRoot, 'packages/core').replace(/\\/g, '/');
				}
			}
		}
	} catch {}
	return cachedWorkspaceCoreRoot;
}

/**
 * True when a served module path points into @nativescript/core consumed from
 * monorepo source. These modules are library code: the app-source HMR passes
 * (AST normalization, /ns/rt underscore-helper alias injection) must NOT run
 * on them — they exist for compiled app/SFC output, and on core sources they
 * misread internals (e.g. `ClassInfo._getBase`) as Vue template helpers and
 * inject destructures that shadow real bindings or TDZ-crash on the circular
 * /ns/rt dependency. In standalone apps core lives under node_modules and is
 * already excluded by the node_modules check.
 */
export function isWorkspaceCoreModulePath(p: string | undefined | null): boolean {
	if (!p) return false;
	const coreRoot = getWorkspaceCoreSourceRoot();
	if (!coreRoot) return false;
	const normalized = String(p).split('?')[0].replace(/\\/g, '/');
	return normalized.includes(coreRoot + '/') || /(^|\/)packages\/core\//.test(normalized);
}

/**
 * True when a served module path points into the @nativescript/vite package
 * routed via its monorepo build output (`dist/packages/vite/...`). Apps that
 * consume the package via `file:../../dist/packages/vite` get a node_modules
 * SYMLINK, and require.resolve follows it to the real dist path — so the
 * served URL carries no `node_modules/` segment and escapes the node_modules
 * library check. Like core source, this is library code: the app-source HMR
 * passes (AST normalization, /ns/rt alias injection) must not run on it —
 * e.g. the HMR client bundle already carries its own `__ns_rt_ns_re` import,
 * and a second injected one is a duplicate-declaration SyntaxError on device.
 */
export function isWorkspaceVitePackageModulePath(p: string | undefined | null): boolean {
	if (!p) return false;
	const normalized = String(p).split('?')[0].replace(/\\/g, '/');
	return /(^|\/)dist\/packages\/vite\//.test(normalized);
}

export type ServedModuleKind = 'app' | 'library';

/**
 * Single classification point for the /ns/m served-module pipeline. The
 * app-source passes inside processCodeForDevice (AST normalization, /ns/rt
 * underscore-helper alias injection) must run ONLY on 'app' modules; 'library'
 * code is served as-is plus import rewriting. Three things count as library:
 *   - anything under node_modules
 *   - @nativescript/core consumed from monorepo source (packages/core)
 *   - the @nativescript/vite package served from its dist build output
 *     (file:../../dist/packages/vite symlinks resolve to the real dist path,
 *     so no node_modules segment appears in the URL)
 * Add the next workspace-library case HERE, not at a call site.
 */
export function classifyServedModule(p: string | undefined | null): ServedModuleKind {
	if (!p) return 'app';
	const normalized = String(p).split('?')[0].replace(/\\/g, '/');
	if (/(?:^|\/)node_modules\//.test(normalized)) return 'library';
	if (isWorkspaceCoreModulePath(normalized)) return 'library';
	if (isWorkspaceVitePackageModulePath(normalized)) return 'library';
	return 'app';
}

export const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'decorators-legacy'] as any;

export type TopLevelImportRecord = {
	start: number;
	end: number;
	text: string;
	source: string;
	hasOnlyNamedSpecifiers: boolean;
	namedBindings: Array<{ importedName: string; text: string }>;
};

export function collectTopLevelImportRecords(code: string): TopLevelImportRecord[] {
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

export function hoistTopLevelStaticImports(code: string): string {
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

// Boot-progress instrumentation snippet (server-side string-only).
//
// Injected at the top of every `__ns_boot__/b1`-tagged module the dev
// server serves during cold boot. The snippet is FULLY SYNCHRONOUS —
// even one conditional top-level `await` would mark the module async
// in V8, propagating an async-promise chain through the entire boot
// graph and tripping the iOS 10 s top-level-await deadline (see
// `ModuleInternal.mm::pumpAsyncProgress`). It just bumps the
// `__NS_HMR_BOOT_MODULE_COUNT__` / `__NS_HMR_BOOT_LAST_MODULE__`
// globals; the 250 ms heartbeat in `session-bootstrap.ts` owns
// `setBootStage` and runs `boot-progress.ts::computeBootImportProgress`
// against those counters plus elapsed wall-clock to drive the bar.
// The iOS runtime's `MaybePumpJSThreadDuringBoot` keeps the JS-thread
// CFRunLoop ticking between sync fetches so the heartbeat can fire
// during the otherwise-blocking cold-boot module walk.
//
// Regression-tested by `websocket-integrity.spec.ts` (snippet stays
// fully synchronous + propagates exactly via the boot-tag prefix).
export function buildBootProgressSnippet(bootModuleLabel: string): string {
	const normalizedLabel = JSON.stringify(String(bootModuleLabel || '').replace(/\\/g, '/'));
	return [`const __nsBootGlobal=globalThis;`, `try{if(!__nsBootGlobal.__NS_HMR_BOOT_COMPLETE__){__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__=Number(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__||0)+1;__nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__=${normalizedLabel};}}catch(__nsBootErr){}`, ''].join('\n');
}

export function stripCoreGlobalsImports(code: string): string {
	const pattern = /^\s*(?:import\s+(?:[^'"\n]*from\s+)?|export\s+\*\s+from\s+)["'][^"']*(?:@nativescript(?:[/_-])core(?:[\/_-])globals|@nativescript_core_globals)[^"']*["'];?\s*$/gm;
	return code.replace(pattern, '');
}

export function ensureVariableDynamicImportHelper(code: string): string {
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
		`    const error = new Error("Cannot dynamically import: " + request);\n` +
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

export function ensureGuardPlainDynamicImports(code: string): string {
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

// Stable URL helper for dynamic imports.
//
// Older versions of the helper synthesized
// `/ns/m/__ns_hmr__/<tag>/<rest>` URLs from
// `globalThis.__NS_HMR_GRAPH_VERSION__` and an importer-derived tag.
// That tag flowed straight into V8's `g_moduleRegistry` cache key — so
// a `graphVersion` bump on every save effectively flushed the whole
// module graph (HMR latency was dominated by Vite re-transforming the
// unchanged closure on every save).
//
// The current contract inverts that:
//   * The runtime canonicalizes any URL shape (boot prefix, hmr prefix,
//     stable) to a single key via `CanonicalizeHttpUrlKey`.
//   * The Angular client receives an explicit eviction set in
//     `ns:angular-update` and calls `__NS_DEV__.invalidateModules` before
//     re-importing the entry, so V8 only refetches modules that
//     actually changed.
//   * The dynamic-import helper no longer needs to busy-construct
//     versioned URLs. Boot prefix preservation still matters at COLD
//     boot because the server-side handler routes `/__ns_boot__/b1/`
//     paths to the boot-progress instrumentation snippet — but the
//     prefix is read from `import.meta.url`, never synthesized from
//     `__NS_HMR_GRAPH_VERSION__`.
//
// The helper is intentionally tiny:
//   1. `@` and falsy specs route to `/ns/m/__invalid_at__.mjs` (existing
//      defensive sentinel for misencoded imports).
//   2. `/ns/m/...` specs that don't yet have a boot prefix get one
//      added when the caller is itself a boot-tagged module. This
//      keeps the boot-progress instrumentation flowing through the
//      transitive cold-boot graph during cold-boot sequences. Once HMR
//      takes over (`__NS_HMR_BOOT_COMPLETE__` is set on the global), no
//      prefix is added — the runtime canonicalizer collapses any
//      historical prefix to the same key.
//   3. Everything else is a pass-through `import(spec)`.
export function ensureDynamicHmrImportHelper(code: string): string {
	try {
		if (!code.includes('__nsDynamicHmrImport(')) return code;
		if (code.includes('const __nsDynamicHmrImport =')) return code;
		const helper =
			'const __nsDynamicHmrImport = (spec) => {\n' +
			"  const __nsm = '/ns' + '/m';\n" +
			"  try { if (!spec || spec === '@') { return import(new URL(__nsm + '/__invalid_at__.mjs', import.meta.url).href); } } catch {}\n" +
			'  try {\n' +
			"    if (typeof spec !== 'string' || !spec.startsWith(__nsm + '/')) return import(spec);\n" +
			'    const g = globalThis;\n' +
			"    const inBoot = !g.__NS_HMR_BOOT_COMPLETE__ && typeof import.meta !== 'undefined' && import.meta && typeof import.meta.url === 'string' && import.meta.url.includes('/__ns_boot__/b1/');\n" +
			"    const noBootPrefixYet = !spec.startsWith(__nsm + '/__ns_boot__/');\n" +
			"    const isAppModule = !spec.startsWith(__nsm + '/node_modules/');\n" +
			"    const finalSpec = inBoot && noBootPrefixYet && isAppModule ? __nsm + '/__ns_boot__/b1' + spec.slice(__nsm.length) : spec;\n" +
			"    const origin = typeof g.__NS_HTTP_ORIGIN__ === 'string' && /^https?:\\/\\//.test(g.__NS_HTTP_ORIGIN__) ? g.__NS_HTTP_ORIGIN__ : '';\n" +
			'    return import(origin ? origin + finalSpec : new URL(finalSpec, import.meta.url).href);\n' +
			'  } catch {}\n' +
			'  return import(spec);\n' +
			'};\n';
		return helper + code;
	} catch {
		return code;
	}
}

/**
 * Star-export expansion must be TRANSITIVE.
 *
 * The expansion below replaces `export * from "url"` with an explicit named
 * list, so any name missing from that list is silently dropped from the
 * importer's export surface — the device then fails at link time with
 * "does not provide an export named '<name>'". Real packages routinely chain
 * star re-exports (`index.ios.js → export * from './canvas'` →
 * `canvas.ios.js → export * from './canvas.common'`), so the name set for a
 * star target is the union of its direct exports, its named re-exports, and
 * — recursively — every nested `export * from` chain, cycles included.
 *
 * This mirrors `collectStaticExportOriginsFromFile` in
 * `websocket-core-bridge.ts`, which solved the identical problem for the
 * /ns/core bridge (see its `Application` comment). That walker reads files
 * from disk; this one works on Vite-transformed code via the shared
 * transformer, because star targets here are served URLs (aliases, /@fs
 * paths, platform-extension resolution already applied by Vite's resolver).
 * If you change export-name semantics in one walker, check the other.
 */
const STAR_EXPANSION_MAX_DEPTH = 64;

/**
 * Normalize a star-export target (served URL or nested transformed
 * specifier) into a root-relative path feedable to Vite's transform
 * pipeline. Returns null for specifiers that cannot be walked (bare ids,
 * relative specs with no parent context).
 */
function normalizeStarExportTargetPath(spec: string, parentVitePath?: string | null): string | null {
	let p = String(spec || '').trim();
	if (!p) return null;
	p = p.replace(/^https?:\/\/[^/]+/, '');
	p = p.replace(/[?#].*$/, '');
	p = p.replace(/^\/ns\/m\//, '/');
	p = p.replace(/^\/__ns_boot__\/[^/]+/, '');
	p = p.replace(/\/__ns_hmr__\/[^/]+/, '');
	if (p.startsWith('.')) {
		// Vite's import analysis normally rewrites nested specifiers to
		// root-relative URLs; resolve any relative stragglers against the
		// parent module's directory.
		const parent = String(parentVitePath || '')
			.replace(/\\/g, '/')
			.replace(/[?#].*$/, '');
		if (!parent.startsWith('/')) return null;
		p = path.posix.normalize(path.posix.join(path.posix.dirname(parent), p));
	}
	return p.startsWith('/') ? p : null;
}

type ModuleExportSurface = {
	/** Names this module exports lexically (direct decls, `export {}` lists, named re-exports, `export * as ns`). */
	ownNames: Set<string>;
	/** Source specifiers of `export * from "..."` statements. */
	starSources: string[];
};

function scanModuleExportSurface(code: string): ModuleExportSurface {
	const ownNames = new Set<string>(extractDirectExportedNames(code));
	for (const m of code.matchAll(/\bexport\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']+["']/g)) {
		ownNames.add(m[1]);
	}
	for (const m of code.matchAll(/\bexport\s*\{([^}]+)\}\s*from\s*["'][^"']+["']/g)) {
		for (const { exportedName } of parseExportSpecList(m[1])) {
			ownNames.add(exportedName);
		}
	}
	const starSources: string[] = [];
	// Tolerate trailing comments/code on the line (see the identical fix in
	// websocket-core-bridge.ts: a strict `$` anchor silently skipped
	// `export * from './layouts'; // barrel export` lines).
	for (const m of code.matchAll(/^[ \t]*export\s+\*\s+from\s+["']([^"']+)["'][^\n]*$/gm)) {
		starSources.push(m[1]);
	}
	return { ownNames, starSources };
}

/**
 * Recursively collect the full export-name set of a star-export target,
 * following nested `export * from` chains. Cycle-safe via the DFS `stack`
 * set (a revisited module contributes nothing new at that point — its names
 * are already being collected by the outer visit, matching spec
 * GetExportedNames semantics). Returns null when the target itself cannot
 * be transformed; partial failures deeper in the chain are reported through
 * `diagnostics` while still returning every name that could be collected.
 */
async function collectStarTargetExportNames(vitePath: string, transformer: (url: string) => Promise<{ code?: string } | null | undefined>, stack: Set<string>, depth: number, diagnostics: string[]): Promise<Set<string> | null> {
	if (stack.has(vitePath)) return new Set();
	if (depth > STAR_EXPANSION_MAX_DEPTH) {
		diagnostics.push(`star-export chain deeper than ${STAR_EXPANSION_MAX_DEPTH} at ${vitePath}`);
		return null;
	}
	let targetCode: string | undefined;
	try {
		targetCode = (await transformer(vitePath))?.code ?? undefined;
	} catch {}
	if (!targetCode) {
		diagnostics.push(`unresolvable star-export target ${vitePath}`);
		return null;
	}
	const surface = scanModuleExportSurface(targetCode);
	const names = new Set(surface.ownNames);
	stack.add(vitePath);
	try {
		for (const spec of surface.starSources) {
			const childPath = normalizeStarExportTargetPath(spec, vitePath);
			if (!childPath) {
				diagnostics.push(`unwalkable nested star-export specifier ${JSON.stringify(spec)} in ${vitePath}`);
				continue;
			}
			const childNames = await collectStarTargetExportNames(childPath, transformer, stack, depth + 1, diagnostics);
			if (!childNames) continue;
			for (const n of childNames) names.add(n);
		}
	} finally {
		stack.delete(vitePath);
	}
	// `export *` never re-exports default.
	names.delete('default');
	return names;
}

export async function expandStarExports(code: string, server: { transformRequest(path: string): Promise<{ code?: string } | null | undefined> }, projectRoot: string, verbose?: boolean, sharedTransformer?: (url: string) => Promise<{ code?: string } | null | undefined>, importerId?: string): Promise<string> {
	const STAR_RE = /^[ \t]*export\s+\*\s+from\s+["']([^"']+)["'];?(?=[ \t]*(?:\/\/[^\n]*)?$)/gm;
	let match: RegExpExecArray | null;
	const replacements: Array<{ full: string; url: string }> = [];

	while ((match = STAR_RE.exec(code)) !== null) {
		const url = match[1];
		if (!url.includes('/node_modules/')) continue;
		replacements.push({ full: match[0], url });
	}

	if (!replacements.length) return code;

	// Names already exported lexically by the importing module. Per spec,
	// lexical exports shadow star-exported names — re-emitting them in an
	// explicit list would be a duplicate-export SyntaxError on device.
	const claimed = new Set(scanModuleExportSurface(code).ownNames);

	// Resolve each star-export target in parallel through the shared runner
	// (when provided) so they share the /ns/m TTL cache and concurrency gate.
	const baseTransformer = sharedTransformer ?? ((url: string) => server.transformRequest(url));
	// A bare `/node_modules/<pkg>/...` URL is NOT transformable on its own:
	// Vite's bare-specifier resolver is gated by the package's
	// `package.json#exports` and refuses internal sub-paths even when the file
	// is on disk (e.g. `css-tree/lib/version.js`, `css-what/dist/esm/types.js`),
	// and in a monorepo the package is hoisted ABOVE the app's `root` so the
	// path doesn't exist relative to it at all. Either way the transform
	// returns nothing and the star target is mis-reported as "unresolvable",
	// silently dropping its names from the importer's export surface. Mirror the
	// main /ns/m route (`filterExistingNodeModulesTransformCandidates`): resolve
	// the path to a concrete file under the project or workspace root and feed
	// the `/@fs/<abs>` form to Vite, which bypasses the `exports` gate. Falls
	// back to the raw URL for anything that doesn't resolve to a real file.
	const workspaceRoot = projectRoot ? getMonorepoWorkspaceRoot(projectRoot) : null;
	const transformer = (url: string) => {
		if (projectRoot && url.includes('/node_modules/')) {
			const abs = resolveCandidateFilePath(url, projectRoot, workspaceRoot);
			if (abs) {
				// Posix-normalize and guarantee a leading slash so Windows drive
				// letters produce the `/@fs/C:/...` form Vite expects.
				const absPosix = abs.replace(/\\/g, '/');
				return baseTransformer(`/@fs${absPosix.startsWith('/') ? '' : '/'}${absPosix}`);
			}
		}
		return baseTransformer(url);
	};
	const resolved = await Promise.all(
		replacements.map(async (rep) => {
			const diagnostics: string[] = [];
			const vitePath = normalizeStarExportTargetPath(rep.url, null);
			if (!vitePath) {
				diagnostics.push(`unwalkable star-export URL ${rep.url}`);
				return { rep, names: null as Set<string> | null, diagnostics };
			}
			const names = await collectStarTargetExportNames(vitePath, transformer, new Set<string>(), 0, diagnostics);
			if (verbose && names) {
				console.log(`[ns/m] expanded export* -> ${names.size} names from ${vitePath}${diagnostics.length ? ' (partial)' : ''}`);
			}
			return { rep, names, diagnostics };
		}),
	);

	for (const entry of resolved) {
		if (entry.diagnostics.length) {
			// Always-on: an incomplete expansion silently narrows the importer's
			// export surface, which surfaces on device as a link-time
			// "does not provide an export named ..." with no server-side trace.
			console.warn(`[ns/m][export*] incomplete star-export expansion${importerId ? ` in ${importerId}` : ''} for ${entry.rep.url}: ${entry.diagnostics.join('; ')}`);
		}
		if (!entry.names) continue;
		// First star wins for names provided by multiple siblings; duplicates
		// would be a SyntaxError, and spec-ambiguous names have no good answer.
		const emit = Array.from(entry.names).filter((n) => !claimed.has(n));
		for (const n of emit) claimed.add(n);
		// An empty list still keeps the dependency edge (side effects,
		// evaluation order) via a side-effect import.
		const explicit = emit.length ? `export { ${emit.join(', ')} } from ${JSON.stringify(entry.rep.url)};` : `import ${JSON.stringify(entry.rep.url)};`;
		code = code.replace(entry.rep.full, explicit);
	}

	return code;
}

export function repairImportEqualsAssignments(code: string): string {
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

// Canonicalize `/ns/rt` imports: collapse any versioned form
// (`/ns/rt/<n>`, `/@ns/rt/<n>`) to the single unversioned `/ns/rt` URL.
// One canonical URL per bridge module — the runtime treats the literal
// URL as module identity, so emitting `/ns/rt/<ver>` would mint a new
// module realm per graph version. (The GET route still ACCEPTS the
// versioned form for stale in-flight code; see ns-rt-route.ts.)
export function canonicalizeRtImports(code: string, origin: string): string {
	if (!code || !origin) return code;
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["'])/g, (_m, p1, p3) => `${p1}/ns/rt${p3}`);
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["']\s*\))/g, (_m, p1, p3) => `${p1}/ns/rt${p3}`);
	return code;
}

export function stripViteDynamicImportVirtual(code: string): string {
	if (!/\/@id\/__x00__vite\/dynamic-import-helper/.test(code)) {
		return code;
	}
	const original = code;
	// Statement-scoped, NOT line-anchored: Vite 8 emits its injected imports
	// concatenated on ONE line with the module's original first line, e.g.
	//   import …"/@vite/client";import …"/@id/__x00__vite/dynamic-import-helper.js";/**
	// A `^…$`-anchored replace would delete the whole line — including the
	// module's leading `/**`, leaving an orphaned JSDoc body that is a
	// SyntaxError ("Unexpected token '*'") on device.
	code = code.replace(/import\s+[^;'"\n]*['"][^'"\n]*\/@id\/__x00__vite\/dynamic-import-helper[^'"\n]*['"]\s*;?/g, '');
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

export function extractExportMetadata(code: string): { hasDefault: boolean; named: string[] } {
	const named = new Set<string>();
	let hasDefault = /\bexport\s+default\b/.test(code);
	try {
		for (const match of code.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
			if (match[1]) named.add(match[1]);
		}
		for (const match of code.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
			const inner = (match[1] || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			for (const seg of inner) {
				const direct = seg.match(/^([A-Za-z_$][A-Za-z0-9_$]*)(?:\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*))?$/);
				if (!direct) continue;
				const base = direct[1];
				const alias = direct[2];
				if (base === 'default') {
					hasDefault = true;
					continue;
				}
				named.add(alias || base);
			}
		}
	} catch {}
	named.delete('default');
	return { hasDefault, named: Array.from(named) };
}

function shouldAllowLocalCoreSanitizerPaths(contextLabel: string): boolean {
	// The @nativescript/vite HMR runtime (client + framework strategies)
	// legitimately references local core paths in strings — allow it whether it
	// is served from node_modules or from the monorepo dist output
	// (`file:../../dist/packages/vite` symlinks resolve to the real dist path,
	// so no node_modules segment appears in the served URL).
	return /\b(?:node_modules\/@nativescript\/vite|dist\/packages\/vite)\/hmr\/(?:client|frameworks)\//.test(contextLabel);
}

export function assertNoOptimizedArtifacts(code: string, contextLabel: string): void {
	const offenders: string[] = [];
	const lines = code.split('\n');
	const tests: Array<RegExp> = [/\b__VITE_PLUGIN__\b/, /\b__VITE_PRELOAD__\b/];
	const localCore = /(^|[^\w@])(?:\.\.?\/|\/)??@nativescript[\/_-]core\//i;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		for (const re of tests) {
			if (re.test(line)) {
				offenders.push(`${i + 1}: ${line.substring(0, 200)}`);
				break;
			}
		}
		if (localCore.test(line)) {
			const trimmed = line.trimStart();
			if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
				continue;
			}
			if (shouldAllowLocalCoreSanitizerPaths(contextLabel)) {
				continue;
			}
			// Only module-resolution contexts (import/export/require) leak to the
			// device ESM loader. A core path appearing as plain runtime string data
			// — e.g. component-builder's `const CORE_UI_BARREL = '@nativescript/core/ui'`
			// passed to `global.loadModule()`, which reads the bundler module
			// registry, not the ESM loader — is legitimate and must not fail serving.
			if (!/(?:\bimport\b|\bexport\b|\bfrom\s*["']|\brequire\s*\()/.test(line)) {
				continue;
			}
			offenders.push(`${i + 1}: ${line.substring(0, 200)} [local-core-path]`);
		}
		if (offenders.length >= 10) break;
	}
	if (offenders.length) {
		const msg = `[sanitize-fail] Optimized deps/virtual id artifacts detected in ${contextLabel}. These cannot be evaluated by the device HTTP ESM loader. Offending lines (first ${Math.min(5, offenders.length)} shown):\n` + offenders.slice(0, 5).join('\n');
		const error: any = new Error(msg);
		error.code = 'NS_SANITIZE_FAIL';
		error.offenders = offenders;
		throw error;
	}
}

export function ensureDestructureCoreImports(code: string): string {
	try {
		let result = code;
		let coreImportCounter = 0;
		const toDestructure = (specList: string) =>
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => {
					const match = seg.split(/\s+as\s+/i);
					return match.length === 2 ? `${match[0].trim()}: ${match[1].trim()}` : seg;
				})
				.join(', ');
		const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
		result = result.replace(reNamed, (_full, prefix: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const tempName = `__ns_core_ns_re${coreImportCounter > 0 ? `_${coreImportCounter}` : ''}`;
			coreImportCounter++;
			const decl = `const { ${toDestructure(specList)} } = ${tempName};`;
			return `${prefix}import ${tempName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
		result = result.replace(reMixed, (_full, prefix: string, defName: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const decl = `const { ${toDestructure(specList)} } = ${defName};`;
			return `${prefix}import ${defName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		return result;
	} catch {
		return code;
	}
}

export function ensureDestructureRtImports(code: string): string {
	try {
		let result = code;
		const toDestructure = (specList: string) =>
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => {
					const match = seg.split(/\s+as\s+/i);
					return match.length === 2 ? `${match[0].trim()}: ${match[1].trim()}` : seg;
				})
				.join(', ');
		const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)['"];?\s*/gm;
		result = result.replace(reNamed, (_full, prefix: string, specList: string, src: string) => {
			const tempName = `__ns_rt_ns_re`;
			const decl = `const { ${toDestructure(specList)} } = ${tempName};`;
			return `${prefix}import ${tempName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)['"];?\s*/gm;
		result = result.replace(reMixed, (_full, prefix: string, defName: string, specList: string, src: string) => {
			const decl = `const { ${toDestructure(specList)} } = ${defName};`;
			return `${prefix}import ${defName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		return result;
	} catch {
		return code;
	}
}

export function dedupeRtNamedImportsAgainstDestructures(code: string): string {
	try {
		let result = code;
		const rtDestructureRE = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?/gm;
		const rtBound = new Set<string>();
		let match: RegExpExecArray | null;
		while ((match = rtDestructureRE.exec(result)) !== null) {
			const specList = String(match[2] || '');
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
		const rtNamedImportRE = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)['"];?\s*/gm;
		const edits: Array<{ start: number; end: number; text: string }> = [];
		while ((match = rtNamedImportRE.exec(result)) !== null) {
			const full = match[0];
			const prefix = match[1] || '';
			const specList = String(match[2] || '');
			const src = match[3];
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
				replacement = `${prefix}import { ${kept.join(', ')} } from ${JSON.stringify(src)};`;
			} else {
				replacement = prefix || '';
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
				.forEach((edit) => {
					result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
				});
		}
		return result;
	} catch {
		return code;
	}
}

export function deduplicateLinkerImports(code: string): string {
	if (!code) return code;
	try {
		const imports = collectTopLevelImportRecords(code);
		if (!imports.length) {
			return code;
		}

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

export function wrapCommonJsModuleForDevice(code: string, absolutePath?: string | null): string {
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
		let match: RegExpExecArray | null;
		while ((match = exportsRe.exec(code)) !== null) {
			const name = match[1];
			if (name !== '__esModule' && name !== 'default') {
				namedExports.add(name);
			}
		}

		const defPropRe = /Object\s*\.\s*defineProperty\s*\(\s*exports\s*,\s*['"]([^'"]+)['"]/g;
		while ((match = defPropRe.exec(code)) !== null) {
			const name = match[1];
			if (name !== '__esModule' && name !== 'default') {
				namedExports.add(name);
			}
		}

		// Static enumeration only sees `exports.foo = ...` and `Object.defineProperty(exports, 'foo', ...)`.
		// Real-world packages like lodash attach their entire surface to a function inside an IIFE and
		// then `module.exports = thatFunction`. Static analysis returns zero in that case. To handle
		// these modules we ALSO load the package in the dev-server's Node context (only when we have a
		// node_modules path) and merge the runtime keys. See `helpers/cjs-named-exports.ts` for the
		// reasoning and safety boundaries.
		if (absolutePath) {
			try {
				for (const n of getCjsNamedExports(absolutePath)) {
					namedExports.add(n);
				}
			} catch {
				/* fall through to whatever we caught statically */
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
			// Resolve relative specifiers against the HTTP-served module's URL
			// before delegating to NS's runtime require. Keeps ./sibling and
			// ../parent requires routable through the HTTP ESM loader rather
			// than NS's filesystem-based require.
			`  var __nsResolvedSpec = spec;\n` +
			`  try {\n` +
			`    if (typeof spec === 'string' && (spec.indexOf('./') === 0 || spec.indexOf('../') === 0)) {\n` +
			`      var __nsParentUrl = (typeof import.meta !== 'undefined' && import.meta && typeof import.meta.url === 'string') ? import.meta.url : null;\n` +
			`      if (__nsParentUrl) {\n` +
			`        var __nsResolvedUrl = new URL(spec, __nsParentUrl);\n` +
			`        if (!/\\.[A-Za-z0-9]+$/.test(__nsResolvedUrl.pathname.split('/').pop() || '')) {\n` +
			`          __nsResolvedUrl.pathname = __nsResolvedUrl.pathname.replace(/\\/+$/, '') + '.js';\n` +
			`        }\n` +
			`        __nsResolvedSpec = __nsResolvedUrl.href;\n` +
			`      }\n` +
			`    }\n` +
			`  } catch (e) {}\n` +
			`  try { var __nsRecord = globalThis.__NS_RECORD_MODULE_PROVENANCE__; if (typeof __nsRecord === 'function') { __nsRecord(String(__nsResolvedSpec), { kind: __ns_cjs_require_kind, specifier: String(spec), url: __nsResolvedSpec !== spec ? __nsResolvedSpec : undefined, via: 'cjs-wrapper', parent: (typeof import.meta !== 'undefined' && import.meta && import.meta.url) ? import.meta.url : undefined }); } } catch (e) {}\n` +
			`  var mod = __ns_cjs_require_base(__nsResolvedSpec);\n` +
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
