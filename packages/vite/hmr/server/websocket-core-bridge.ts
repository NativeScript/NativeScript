import { existsSync, readFileSync, statSync } from 'node:fs';
import * as path from 'node:path';

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

const REQUIRE_GUARD_SNIPPET = `// [guard] install require('http(s)://') detector\n(()=>{try{var g=globalThis;if(g.__NS_REQUIRE_GUARD_INSTALLED__){}else{var mk=function(o,l){return function(){try{var s=arguments[0];if(typeof s==='string'&&/^(?:https?:)\\/\\//.test(s)){var e=new Error('[ns-hmr][require-guard] require of URL: '+s+' via '+l);try{console.error(e.message+'\\n'+(e.stack||''));}catch(e2){}try{g.__NS_REQUIRE_GUARD_LAST__={spec:s,stack:e.stack,label:l,ts:Date.now()};}catch(e3){}}}catch(e1){}return o.apply(this, arguments);};};if(typeof g.require==='function'&&!g.require.__NS_REQ_GUARDED__){var o1=g.require;g.require=mk(o1,'require');g.require.__NS_REQ_GUARDED__=true;}if(typeof g.__nsRequire==='function'&&!g.__nsRequire.__NS_REQ_GUARDED__){var o2=g.__nsRequire;g.__nsRequire=mk(o2,'__nsRequire');g.__nsRequire.__NS_REQ_GUARDED__=true;}g.__NS_REQUIRE_GUARD_INSTALLED__=true;}}catch(e){}})();\n`;

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

export function parseCoreBridgeRequest(pathname: string, searchParams: URLSearchParams, currentGraphVersion: number): ParsedCoreBridgeRequest | null {
	if (!pathname) return null;
	if (!(pathname === '/ns/core' || pathname === '/ns/core/' || pathname.startsWith('/ns/core/'))) {
		return null;
	}
	if (/^\/ns\/core\/\d+(?:\/.*)$/.test(pathname)) {
		return null;
	}
	const afterCore = pathname.replace(/^\/ns\/core\/?/, '');
	if (afterCore.startsWith('/')) {
		return null;
	}
	const hasExplicitVersion = /^\d+$/.test(afterCore);
	const ver = hasExplicitVersion ? afterCore : String(currentGraphVersion || 0);
	const sub = searchParams.get('p') || (afterCore && !hasExplicitVersion ? afterCore : '');
	const normalizedSub = sub ? sub.replace(/^\/+/, '') : null;
	return {
		hasExplicitVersion,
		ver,
		sub: normalizedSub || '',
		normalizedSub,
		key: normalizedSub ? `@nativescript/core/${normalizedSub}` : '@nativescript/core',
	};
}
