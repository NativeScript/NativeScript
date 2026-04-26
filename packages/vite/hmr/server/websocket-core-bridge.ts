import { existsSync, readFileSync, statSync } from 'node:fs';
import * as path from 'node:path';
import { normalizeCoreSub } from '../../helpers/ns-core-url.js';

export type CoreExportOrigin = {
	moduleId: string;
	mode: 'named' | 'module';
	importedName?: string;
	canonicalSubpath?: string;
};

export type ParsedCoreBridgeRequest = {
	hasExplicitVersion: boolean;
	ver: string;
	sub: string;
	normalizedSub: string | null;
	key: string;
};

const REQUIRE_GUARD_SNIPPET = `// [guard] install require('http(s)://') detector\n(()=>{try{var g=globalThis;if(g.__NS_REQUIRE_GUARD_INSTALLED__){}else{var mk=function(o,l){return function(){try{var s=arguments[0];if(typeof s==='string'&&/^(?:https?:)\\/\\//.test(s)){var e=new Error('[ns-hmr][require-guard] require of URL: '+s+' via '+l);console.error(e.message+'\\n'+(e.stack||''));try{g.__NS_REQUIRE_GUARD_LAST__={spec:s,stack:e.stack,label:l,ts:Date.now()};}catch(e3){}}}catch(e1){}return o.apply(this, arguments);};};if(typeof g.require==='function'&&!g.require.__NS_REQ_GUARDED__){var o1=g.require;g.require=mk(o1,'require');g.require.__NS_REQ_GUARDED__=true;}if(typeof g.__nsRequire==='function'&&!g.__nsRequire.__NS_REQ_GUARDED__){var o2=g.__nsRequire;g.__nsRequire=mk(o2,'__nsRequire');g.__nsRequire.__NS_REQ_GUARDED__=true;}g.__NS_REQUIRE_GUARD_INSTALLED__=true;}}catch(e){}})();\n`;

export function extractDirectExportedNames(code: string): string[] {
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

export async function resolveRuntimeCoreModulePath(normalizedSubpath: string, resolveModuleId: (moduleId: string) => Promise<string | null> | string | null): Promise<string | null> {
	const cleanedSubpath = String(normalizedSubpath || '').replace(/^\/+/, '');
	const candidates: string[] = [];
	if (!cleanedSubpath || cleanedSubpath === 'index.js') {
		candidates.push('@nativescript/core');
	} else {
		if (/\/index\.js$/i.test(cleanedSubpath)) {
			const packageSubpath = cleanedSubpath.replace(/\/index\.js$/i, '');
			if (packageSubpath) {
				candidates.push(`@nativescript/core/${packageSubpath}`);
			}
		}
		candidates.push(`@nativescript/core/${cleanedSubpath}`);
	}
	for (const candidate of candidates) {
		try {
			const resolved = await resolveModuleId(candidate);
			if (resolved) {
				return String(resolved).replace(/[?#].*$/, '');
			}
		} catch {}
	}
	return null;
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
	// Include platform-specific variants (.ios.js / .android.js / .visionos.js).
	// @nativescript/core ships only platform-specific files for many submodules
	// (e.g. `./application/index.ios.js`, no plain `./application/index.js`), so
	// a plain Node-style resolution misses them and the recursive export-name
	// walk fails to follow `export * from './application'`. Without this, the
	// /ns/core bridge's named-export list omits `Application`, and any static
	// `import { Application } from '@nativescript/core'` through the bridge
	// fails with "module does not provide an export named 'Application'".
	//
	// Prefer .ios variants at the top since the HMR dev server is iOS-first;
	// .android variants are still tried so Android serving also works.
	const platformVariants = ['.ios.ts', '.ios.js', '.ios.mjs', '.android.ts', '.android.js', '.android.mjs', '.visionos.ts', '.visionos.js', '.visionos.mjs'];
	const candidates = [path.resolve(importerDir, spec), path.resolve(importerDir, `${spec}.ts`), path.resolve(importerDir, `${spec}.js`), path.resolve(importerDir, `${spec}.mjs`), ...platformVariants.map((ext) => path.resolve(importerDir, `${spec}${ext}`)), path.resolve(importerDir, spec, 'index.ts'), path.resolve(importerDir, spec, 'index.js'), path.resolve(importerDir, spec, 'index.mjs'), ...platformVariants.map((ext) => path.resolve(importerDir, spec, `index${ext}`))];
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
	// Use a null-prototype map so keys like `toString`, `constructor`, or
	// `hasOwnProperty` — which DO appear as real exports in some core
	// subpaths (e.g. `@nativescript/core/ui/gestures/gestures-common`
	// re-exports `toString`) — don't collide with Object.prototype's own
	// properties. Previously `origins['toString']` returned the inherited
	// Function, and the subsequent `existing.some(...)` call threw
	// "existing.some is not a function", causing the whole subpath's
	// export discovery to bail and fall back to a pure `export *` which
	// in turn leaked into the "hasKey not provided" downstream crash.
	const origins: Record<string, CoreExportOrigin[]> = Object.create(null);
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
	// Tolerate trailing comments on `export * from '…'` lines. @nativescript/core
	// has lines like `export * from './layouts'; // barrel export`, and the
	// previous strict `[ \t]*$` anchor refused to match them — which silently
	// skipped recursion into ./layouts, omitting GridLayout/LayoutBase (and
	// any name reached through a similarly-commented star re-export) from the
	// /ns/core bridge's named-export list.
	const starRe = /^[ \t]*export\s+\*\s+from\s+["']([^"']+)["'][^\n]*$/gm;
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

export async function normalizeCoreExportOriginsForRuntime(exportOrigins: Record<string, CoreExportOrigin[]>, resolveModuleId: (moduleId: string) => Promise<string | null> | string | null, rootModulePath: string): Promise<Record<string, CoreExportOrigin[]>> {
	const cleanedRoot = String(rootModulePath || '').replace(/[?#].*$/, '');
	if (!cleanedRoot || !exportOrigins || typeof exportOrigins !== 'object') {
		return exportOrigins;
	}
	const resolutionCache = new Map<string, string | null>();
	const normalizedOrigins: Record<string, CoreExportOrigin[]> = {};
	for (const [exportedName, entries] of Object.entries(exportOrigins)) {
		normalizedOrigins[exportedName] = await Promise.all(
			(entries || []).map(async (entry) => {
				if (!entry?.moduleId || !entry.moduleId.startsWith('@nativescript/core')) {
					return entry;
				}
				let resolvedPath = resolutionCache.get(entry.moduleId);
				if (resolvedPath === undefined) {
					try {
						resolvedPath = (await resolveModuleId(entry.moduleId)) || null;
					} catch {
						resolvedPath = null;
					}
					resolvedPath = resolvedPath ? String(resolvedPath).replace(/[?#].*$/, '') : null;
					resolutionCache.set(entry.moduleId, resolvedPath);
				}
				if (!resolvedPath) {
					return entry;
				}
				const canonicalSubpath = canonicalCoreSubpathForFile(resolvedPath, cleanedRoot);
				if (!canonicalSubpath || canonicalSubpath === entry.canonicalSubpath) {
					return entry;
				}
				return { ...entry, canonicalSubpath };
			}),
		);
	}
	return normalizedOrigins;
}

export function ensureVersionedCoreImports(code: string, _origin: string, ver: number): string {
	try {
		code = code.replace(/(["'])(?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(\?p=[^"']+)?\1/g, (_m, q, qp) => `${q}/ns/core/${ver}${qp || ''}${q}`);
		code = code.replace(/import\(\s*(["'])(?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(\?p=[^"']+)?\1\s*\)/g, (_m, q, qp) => `import(${q}/ns/core/${ver}${qp || ''}${q})`);
	} catch {}
	return code;
}

export function hasModuleDefaultExport(moduleCode: string): boolean {
	if (!moduleCode || typeof moduleCode !== 'string') return false;
	return /\bexport\s+default\b/.test(moduleCode) || /\bexport\s*\{[^}]*\bdefault\b[^}]*\}/.test(moduleCode);
}

// Versioned `/ns/core/<ver>?p=<sub>` proxy modules have been removed.
// The current /ns/core handler serves Vite-transformed @nativescript/core
// source directly with a self-registering preamble; no proxy layer is
// needed. Leaving the helpers wired up would have guaranteed drift
// between the URL canonicalizer and the module registry.

export function parseCoreBridgeRequest(pathname: string, searchParams: URLSearchParams, currentGraphVersion: number): ParsedCoreBridgeRequest | null {
	if (!pathname) return null;
	if (!(pathname === '/ns/core' || pathname === '/ns/core/' || pathname.startsWith('/ns/core/'))) {
		return null;
	}
	// Reject legacy versioned path-based deep imports. Every emitter now
	// uses the canonical `/ns/core/<sub>` form. Serving a legacy request
	// like `/ns/core/3/ui/frame/index.js` would split iOS's HTTP ESM
	// cache across versioned and canonical URLs for the same file,
	// re-triggering the double-evaluation bug. Also reject bare
	// trailing-slash variants like `/ns/core/3/` which don't match the
	// accepted forms `/ns/core` / `/ns/core/<sub>`.
	if (/^\/ns\/core\/\d+\/.*$/.test(pathname)) {
		return null;
	}
	const afterCore = pathname.replace(/^\/ns\/core\/?/, '');
	if (afterCore.startsWith('/')) {
		return null;
	}
	const hasExplicitVersion = /^\d+$/.test(afterCore);
	const ver = hasExplicitVersion ? afterCore : String(currentGraphVersion || 0);
	// Keep the raw ?p= value (including any `.js` / `/index` suffix) in
	// `sub` and `normalizedSub` so existing call sites still see the
	// as-requested spelling. Canonicalization for Invariant A identity
	// lookups is the handler's responsibility — see the /ns/core bridge
	// middleware in websocket.ts which uses normalizeCoreSub() before
	// populating globalThis.__NS_CORE_MODULES__.
	const sub = searchParams.get('p') || (afterCore && !hasExplicitVersion ? afterCore : '');
	const normalizedSub = sub ? sub.replace(/^\/+/, '') : null;
	// Guard: normalizeCoreSub is imported at the top of this module so
	// adding it to the returned request here costs nothing, but keeping
	// the RAW subpath in `normalizedSub` (matching the historical shape)
	// preserves wire-level compatibility with specs and external callers.
	void normalizeCoreSub;
	return {
		hasExplicitVersion,
		ver,
		sub: normalizedSub || '',
		normalizedSub,
		key: normalizedSub ? `@nativescript/core/${normalizedSub}` : '@nativescript/core',
	};
}
