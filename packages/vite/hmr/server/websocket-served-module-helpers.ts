import { parse as babelParse } from '@babel/parser';
import * as t from '@babel/types';

import * as PAT from './constants.js';
import { isDeepCoreSubpath } from './core-sanitize.js';
import { extractDirectExportedNames } from './websocket-core-bridge.js';

const MODULE_IMPORT_ANALYSIS_PLUGINS = ['typescript', 'jsx', 'importMeta', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'decorators-legacy'] as any;

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

export function buildBootProgressSnippet(bootModuleLabel: string): string {
	const normalizedLabel = JSON.stringify(String(bootModuleLabel || '').replace(/\\/g, '/'));
	return [
		`const __nsBootGlobal=globalThis;`,
		`try{if(!__nsBootGlobal.__NS_HMR_BOOT_COMPLETE__){const __nsBootApi=__nsBootGlobal.__NS_HMR_DEV_OVERLAY__;if(__nsBootApi&&typeof __nsBootApi.setBootStage==='function'){const __nsBootCount=(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__=Number(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__||0)+1);__nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__=${normalizedLabel};const __nsBootNow=Date.now();const __nsBootLast=Number(__nsBootGlobal.__NS_HMR_BOOT_LAST_PROGRESS_AT__||0);if(__nsBootCount<=8||__nsBootCount%6===0||__nsBootNow-__nsBootLast>90){__nsBootGlobal.__NS_HMR_BOOT_LAST_PROGRESS_AT__=__nsBootNow;const __nsBootProgress=Math.min(94,82+Math.min(10,Math.round((Math.log(__nsBootCount+1)/Math.LN2)*2)));__nsBootApi.setBootStage('importing-main',{detail:'Evaluated '+__nsBootCount+' modules\\n'+__nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__,attempt:Number(__nsBootGlobal.__NS_HMR_BOOT_MAIN_ATTEMPT__||1),attempts:Number(__nsBootGlobal.__NS_HMR_BOOT_MAIN_ATTEMPTS__||6),progress:__nsBootProgress});}}}}catch(__nsBootErr){}`,
		`if(!__nsBootGlobal.__NS_HMR_BOOT_COMPLETE__){const __nsBootCount=Number(__nsBootGlobal.__NS_HMR_BOOT_MODULE_COUNT__||0);if(__nsBootCount<=24||__nsBootCount%8===0){await new Promise((resolve)=>setTimeout(resolve,0));}}`,
		'',
	].join('\n');
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

export function ensureGuardPlainDynamicImports(code: string, _origin: string): string {
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

// alpha.59 — Stable URL helper for dynamic imports.
//
// Pre-alpha.59 the helper synthesized `/ns/m/__ns_hmr__/<tag>/<rest>` URLs
// from `globalThis.__NS_HMR_GRAPH_VERSION__` and an importer-derived tag.
// That tag flowed straight into V8's `g_moduleRegistry` cache key — so a
// `graphVersion` bump on every save effectively flushed the whole module
// graph (HMR latency was dominated by Vite re-transforming the unchanged
// closure on every save, ~3s per cycle).
//
// alpha.59 inverts that contract:
//   * The runtime canonicalizes any URL shape (boot prefix, hmr prefix,
//     stable) to a single key via `CanonicalizeHttpUrlKey`.
//   * The Angular client receives an explicit eviction set in
//     `ns:angular-update` and calls `__nsInvalidateModules` before
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
//      transitive cold-boot graph on alpha.59 + alpha.59 boot
//      sequences. Once HMR takes over (`__NS_HMR_BOOT_COMPLETE__` is
//      set on the global), no prefix is added — the runtime
//      canonicalizer collapses any historical prefix to the same key.
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

function extractExportedNames(code: string): string[] {
	return extractDirectExportedNames(code);
}

export async function expandStarExports(code: string, server: { transformRequest(path: string): Promise<{ code?: string } | null | undefined> }, _projectRoot: string, verbose?: boolean): Promise<string> {
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

export function ensureVersionedRtImports(code: string, origin: string, ver: number): string {
	if (!code || !origin || !Number.isFinite(ver)) return code;
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["'])/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["']\s*\))/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	return code;
}

export function stripViteDynamicImportVirtual(code: string): string {
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
	return /\bnode_modules\/@nativescript\/vite\/hmr\/(?:client|frameworks)\//.test(contextLabel);
}

export function assertNoOptimizedArtifacts(code: string, contextLabel: string): void {
	try {
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
	} catch (error) {
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
		const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(reNamed, (_full, prefix: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const tempName = `__ns_core_ns_re${coreImportCounter > 0 ? `_${coreImportCounter}` : ''}`;
			coreImportCounter++;
			const decl = `const { ${toDestructure(specList)} } = ${tempName};`;
			return `${prefix}import ${tempName} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
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
