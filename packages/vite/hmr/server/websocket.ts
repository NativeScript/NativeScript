/*
RAW BYPASS DIAGNOSTICS (added):
  Purpose: Fetch original Vite transform output (unsanitized) for differential comparison with sanitized/device-processed output.
  Endpoints supporting ?raw=1:
  - /ns/asm[/(ver)]?path=/abs/or/@/alias/Comp.vue&raw=1
      Returns either full compiled ?vue output (if available) or concatenated script/template variant transforms.
  - /ns/sfc[/(ver)]?path=/abs/or/@/alias/Comp.vue[?vue&type=script|template]&raw=1
      Returns direct transformRequest result (before cleanCode/processCodeForDevice/rewriteImports delegation).
  Response markers:
    - // [sfc-asm] <path> (raw bypass)
    - // [sfc] raw bypass path=<spec>
    - Hash banner: // [hash:<sha1>] bytes=<len> raw=1 <endpoint>
    - X-NS-Source-Hash header mirrors hash for correlation with runtime compile logs.
  Usage Workflow:
    1. Fetch sanitized module normally (without raw=1) and note its hash banner and failing runtime log containing [http-esm][compile][v8-error].
    2. Fetch same URL with &raw=1 (or ?raw=1 if no existing query) to obtain unsanitized baseline.
    3. Diff raw vs sanitized focusing near reported line/column from v8-error log.
    4. Identify sanitation regex introducing syntax issue; adjust in cleanCode/processCodeForDevice.
*/
import type { Plugin, ViteDevServer, TransformResult } from 'vite';
import { createRequire } from 'node:module';
import { normalizeStrayCoreStringLiterals, fixDanglingCoreFrom, normalizeAnyCoreSpecToBridge } from './core-sanitize.js';
// AST tooling for robust transformations
import { parse as babelParse } from '@babel/parser';
import { genCode } from '../helpers/babel.js';
import babelCore from '@babel/core';
import pluginTransformTypescript from '@babel/plugin-transform-typescript';
import traverse from '@babel/traverse';
// Ensure traverse callable across CJS/ESM builds
const babelTraverse: any = (traverse as any)?.default || (traverse as any);
import * as t from '@babel/types';
import { existsSync, readFileSync } from 'fs';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { stripRtCoreSentinel, stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import { WebSocketServer } from 'ws';
import * as path from 'path';
import { createHash } from 'crypto';
import * as PAT from './constants.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getPackageJson, getProjectFilePath } from '../../helpers/project.js';
import { loadPrebuiltVendorManifest } from '../shared/vendor/manifest-loader.js';
import '../vendor-bootstrap.js';
import type { VendorManifest } from '../shared/vendor/manifest.js';
import { NS_NATIVE_TAGS } from './compiler.js';
import { vueSfcCompiler } from '../frameworks/vue/server/compiler.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { angularServerStrategy } from '../frameworks/angular/server/strategy.js';
import { buildInlineTemplateBlock, createProcessSfcCode, extractTemplateRender, processTemplateVariantMinimal } from '../frameworks/vue/server/sfc-transforms.js';
import { astExtractImportsAndStripTypes } from '../helpers/ast-extract.js';

const { parse, compileTemplate, compileScript } = vueSfcCompiler;

const STRATEGY_REGISTRY = new Map<string, FrameworkServerStrategy>([
	['vue', vueServerStrategy],
	['angular', angularServerStrategy],
]);

function resolveFrameworkStrategy(flavor: string): FrameworkServerStrategy {
	return STRATEGY_REGISTRY.get(flavor);
}

let ACTIVE_STRATEGY: FrameworkServerStrategy;

const processSfcCode = createProcessSfcCode(processCodeForDevice);

// Bare specifiers and special skip patterns (virtual, data:, etc.)
const VENDOR_PACKAGES = /^[A-Za-z@][^:\/\s]*$/;
const SKIP_PATTERNS = /^(?:data:|blob:|node:|virtual:|vite:|\0|\/@@?id|\/__vite|__vite|__x00__)/;

// Minimal helpers to support vendor pre-bundle detection
function extractVitePrebundleId(spec: string): string | null {
	const m = spec.match(/\.vite\/deps\/([^?]+?)\.[mc]?js/);
	if (m) return m[1];
	const m2 = spec.match(/__x00__([^?]+?)\.[mc]?js/);
	if (m2) return m2[1];
	return null;
}

function getFlattenedManifestMap(manifest: VendorManifest): Map<string, string> {
	const map = new Map<string, string>();
	const mods = Object.keys(manifest.modules || {});
	for (const canonical of mods) {
		const flat = canonical.replace(/\./g, '__').replace(/\//g, '_');
		map.set(flat, canonical);
		const alias = (manifest.aliases as any)?.[canonical];
		if (alias) {
			const aliasFlat = String(alias).replace(/\./g, '__').replace(/\//g, '_');
			map.set(aliasFlat, canonical);
		}
	}
	return map;
}

// NativeScript module detectors
function isCoreGlobalsReference(spec: string): boolean {
	return /@nativescript(?:[\/_-])core(?:[\/_-])globals/.test(spec || '');
}
function isNativeScriptCoreModule(spec: string): boolean {
	return /^(?:@nativescript[\/_-]core|@nativescript\/core)(?:\b|\/)/i.test(spec || '');
}
function isNativeScriptPluginModule(spec: string): boolean {
	return /^@nativescript\//i.test(spec || '') && !isNativeScriptCoreModule(spec || '');
}

// Looser detector for NativeScript plugin-style specifiers that should be resolved
// via device require() rather than HTTP during HMR. This includes popular community
// scopes in addition to @nativescript/* (excluding core).
function isLikelyNativeScriptPluginSpecifier(spec: string): boolean {
	if (!spec) return false;
	const s = spec.replace(PAT.QUERY_PATTERN, '');
	// Absolute or relative paths are not bare packages
	if (/^(?:\.|\/|https?:\/\/)/i.test(s)) return false;
	// App alias paths like '@/...' are not vendor packages
	if (s.startsWith('@@/')) return false; // extremely rare double '@' alias
	if (s.startsWith('~/')) return false; // NativeScript tilde alias (app root)
	if (s.startsWith('@/')) return false; // Common Vite alias for src
	// .vue SFCs are not vendor packages
	if (/\.vue(?:\?|$)/i.test(s)) return false;
	// Exclude core and vue runtime which are handled by dedicated bridges
	if (/^@nativescript\/core(\b|\/)/i.test(s)) return false;
	if (/^(?:vue|nativescript-vue)(?:\b|\/)/i.test(s)) return false;
	// Treat any other bare package id as device-resolved (require) during HMR
	return true;
}

export function ensureNativeScriptModuleBindings(code: string): string {
	// Proceed even if a vendor manifest isn't available; we'll still vendor-bind
	// likely NativeScript plugin-style specifiers (e.g., 'pinia', '@scope/pkg')
	// via require() so device can resolve them from the app bundle.

	const importRegex = /(^|\n)\s*import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];?/gm;
	const sideEffectRegex = /(^|\n)\s*import\s+["']([^"']+)["'];?/gm;

	// Collect non-vendor imports so we can hoist them above the injected vendor prelude.
	// This ensures any residual ESM imports (like SFCs) remain at the true top-level for parsers
	// that require imports to precede other statements.
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

	// Handle "import ... from 'x'" forms
	code = code.replace(importRegex, (full: string, pfx: string, clause: string, rawSpec: string) => {
		// Capture original for potential preservation (strip the leading newline to avoid double spacing when hoisted)
		const original = full.replace(/^\n/, '');
		// Do not touch type-only imports other than hoisting
		if (full.trimStart().startsWith('import type')) {
			preservedImports.push(original);
			return pfx || '';
		}
		const specifier = rawSpec.replace(PAT.QUERY_PATTERN, '');
		let canonical = resolveVendorFromCandidate(specifier);
		// If not found in vendor manifest, treat well-known NativeScript plugin-style packages
		// as require() based modules so the device can resolve them from the app bundle or vendor.
		if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier)) {
			canonical = specifier;
		}
		// CRITICAL: never vendor-inject @nativescript/core here — preserve for the later core-bridge pass.
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
			return pfx || ''; // erase the import line
		}
		// namespace: import * as ns from 'x'
		if (trimmed.startsWith('*')) {
			const m = trimmed.match(/\*\s+as\s+(\w+)/i);
			if (m?.[1]) binding.namespace.add(m[1]);
			return pfx || '';
		}
		// named: import { a, b as c } from 'x'
		if (trimmed.startsWith('{')) {
			parseNamedImports(trimmed, binding);
			return pfx || '';
		}
		// default + named: import Default, { a as A } from 'x'
		if (trimmed.includes(',') && trimmed.includes('{')) {
			const [defaultPart, namedPart] = trimmed.split(/,(.+)/, 2);
			const def = defaultPart.trim();
			if (def) binding.default.add(def);
			if (namedPart) parseNamedImports(namedPart.trim(), binding);
			return pfx || '';
		}
		// default only
		binding.default.add(trimmed);
		return pfx || '';
	});

	// Handle side-effect only imports: import 'x'
	code = code.replace(sideEffectRegex, (full: string, _pfx: string, rawSpec: string) => {
		const original = full.replace(/^\n/, '');
		const specifier = rawSpec.replace(PAT.QUERY_PATTERN, '');
		let canonical = resolveVendorFromCandidate(specifier);
		if (!canonical && isLikelyNativeScriptPluginSpecifier(specifier)) {
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

	// If there are no vendor modules to bind, still hoist preserved imports if any were collected.
	if (!modules.size) {
		if (preservedImports.length) {
			const preserved = preservedImports.join('') + '\n';
			return preserved + code;
		}
		return code;
	}

	let injection = 'const __nsVendorRegistry = (globalThis.__nsVendorRegistry ||= new Map());\n';
	// Soft vendor fallback mode: when a plugin module is not available during HMR, provide a stub so the module can instantiate.
	// Toggle with globalThis.__NS_VENDOR_SOFT__ (default true)
	// Use JS-safe global access (no TS casts) to avoid syntax errors on device
	injection += "const __NS_VENDOR_SOFT__ = (typeof globalThis.__NS_VENDOR_SOFT__ !== 'undefined' ? !!globalThis.__NS_VENDOR_SOFT__ : true);\n";
	// Provide a require fallback that throws lazily so callers can soft-stub in the catch block.
	injection += "const __nsVendorRequire = (typeof globalThis.__nsRequire === 'function' ? globalThis.__nsRequire : (typeof globalThis.require === 'function' ? globalThis.require : (spec => { throw new Error('__nsVendorRequire unavailable'); })));\n";
	// One-time diagnostic if require is missing; avoid spewing on every module
	injection += "try { (globalThis.__NS_VENDOR_ONCE__ ||= { loggedRequireMissing: false }); if (!globalThis.__NS_VENDOR_ONCE__.loggedRequireMissing && typeof __nsVendorRequire !== 'function') { console.warn('[ns-hmr][vendor][require-missing] using soft stubs=', __NS_VENDOR_SOFT__); globalThis.__NS_VENDOR_ONCE__.loggedRequireMissing = true; } } catch {}\n";
	injection += "function __nsMissing(name){ try { const fn = function(){ try { console.warn('[ns-hmr][vendor][stub]', name); } catch {} }; return new Proxy(fn, { get: (_t, p) => __nsMissing(name + '.' + String(p)) }); } catch { return {}; } }\n";
	// Helper utils to simplify robust property/default selection without using optional chaining/nullish
	injection += "function __nsHasInstall(x){ try { return (typeof x === 'function') || (typeof x === 'object' && x && typeof x.install === 'function'); } catch { return false; } }\n";
	injection += "function __nsDefault(mod){ try { return (mod && mod['default'] !== undefined) ? mod['default'] : mod; } catch { return mod; } }\n";
	injection += "function __nsNestedDefault(mod){ try { return (mod && mod.default && (typeof mod.default.default === 'function' || (typeof mod.default.default === 'object' && mod.default.default && typeof mod.default.default.install === 'function'))) ? mod.default.default : undefined; } catch { return undefined; } }\n";
	injection += "function __nsPick(mod, name){ try { if (mod && mod['default'] && mod['default'][name] !== undefined) return mod['default'][name]; } catch {} try { if (mod && mod[name] !== undefined) return mod[name]; } catch {} try { if (mod && typeof mod['default'] === 'function' && mod['default'].name === name) return mod['default']; } catch {} return undefined; }\n";

	let index = 0;
	for (const [canonical, binding] of modules) {
		const cacheKey = JSON.stringify(canonical);
		const moduleVar = `__nsVendorModule_${index++}`;
		injection += `const ${moduleVar} = __nsVendorRegistry.has(${cacheKey}) ? __nsVendorRegistry.get(${cacheKey}) : (() => { try { const mod = __nsVendorRequire(${cacheKey}); __nsVendorRegistry.set(${cacheKey}, mod); return mod; } catch (e) { try { console.error('[ns-hmr][vendor][require-failed]', ${cacheKey}, (e && (e.message||e)) ); } catch {} try { if (__NS_VENDOR_SOFT__) { const stub = __nsMissing(${cacheKey}); __nsVendorRegistry.set(${cacheKey}, stub); return stub; } } catch {} throw e; } })();\n`;

		binding.namespace.forEach((alias) => {
			// For namespace imports, expose both the raw module and a default fallback for interop consumers
			injection += `const ${alias} = ${moduleVar};\n`;
			injection += `(${alias} && typeof ${alias} === 'object' && !('default' in ${alias})) && (${alias}.default = ${alias});\n`;
		});

		if (binding.named.length) {
			// Bind each named import robustly from either default or namespace using helper.
			for (const { imported, local } of binding.named) {
				const localName = local;
				const importedName = imported;
				injection += `const ${localName} = __nsPick(${moduleVar}, ${JSON.stringify(importedName)});\n`;
			}
		}

		if (binding.default.size) {
			// Create one stable default candidate per module and reuse for all default locals
			const defVar = `${moduleVar}__def`;
			injection += `const ${defVar} = __nsDefault(${moduleVar});\n`;
			binding.default.forEach((localName) => {
				injection += `const ${localName} = (__nsHasInstall(${defVar})
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
	// Hoist preserved non-vendor imports to the very top for maximum ESM compatibility
	const preserved = preservedImports.length ? preservedImports.join('') + '\n' : '';
	return preserved + injection + code;
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

function normalizeNativeScriptCoreSpecifier(spec: string): string {
	let normalized = spec.replace(/@nativescript[_-]core/gi, '@nativescript/core').replace(/@nativescript\/core\/index\.js$/i, '@nativescript/core/index.js');

	if (normalized.startsWith('/node_modules/')) {
		const idx = normalized.toLowerCase().indexOf('@nativescript/core');
		if (idx !== -1) {
			normalized = normalized.slice(idx);
		}
	}

	if (normalized.toLowerCase().startsWith('@nativescript/core')) {
		normalized = normalized.replace(/\?[^"'`]*$/, '');
	}

	return normalized;
}

function normalizeNodeModulesSpecifier(spec: string): string | null {
	if (!spec) {
		return null;
	}

	let normalized = spec.replace(/\\/g, '/');
	const idx = normalized.lastIndexOf('/node_modules/');
	if (idx === -1) {
		return null;
	}

	let subPath = normalized.slice(idx + '/node_modules/'.length);
	if (!subPath) {
		return null;
	}

	subPath = subPath.replace(PAT.QUERY_PATTERN, '');

	if (!subPath) {
		return null;
	}

	// Skip Vite pre-bundled deps that we already map to vendor
	if (subPath.startsWith('.vite/')) {
		return null;
	}

	return subPath.startsWith('/') ? subPath.slice(1) : subPath;
}

function resolveVendorFromCandidate(specifier: string | null | undefined): string | null {
	if (!specifier) {
		return null;
	}

	const manifest = getVendorManifest();
	if (!manifest) {
		return null;
	}

	const cleaned = specifier.replace(PAT.QUERY_PATTERN, '');
	const direct = resolveVendorSpecifier(cleaned);
	if (direct) {
		return direct;
	}

	const flattenedId = extractVitePrebundleId(cleaned);
	if (flattenedId) {
		const flattenedMap = getFlattenedManifestMap(manifest);
		const flatMatch = flattenedMap.get(flattenedId);
		if (flatMatch) {
			return flatMatch;
		}
		for (const [flatKey, canonical] of flattenedMap.entries()) {
			if (flattenedId === flatKey || flattenedId.startsWith(`${flatKey}_`)) {
				return canonical;
			}
		}
		const guessedId = flattenedId.replace(/__/g, '.').replace(/_/g, '/');
		if (guessedId && guessedId !== flattenedId) {
			const guessedCanonical = resolveVendorSpecifier(guessedId);
			if (guessedCanonical) {
				return guessedCanonical;
			}
			const prefix = findVendorPrefix(guessedId, manifest);
			if (prefix) {
				return prefix;
			}
		}
	}

	const normalizedCore = normalizeNativeScriptCoreSpecifier(cleaned);
	if (normalizedCore !== cleaned) {
		const nsCanonical = resolveVendorSpecifier(normalizedCore);
		if (nsCanonical) {
			return nsCanonical;
		}
	}

	const nodeModulesSpecifier = normalizeNodeModulesSpecifier(cleaned);
	if (nodeModulesSpecifier) {
		const canonical = resolveVendorSpecifier(nodeModulesSpecifier);
		if (canonical) {
			return canonical;
		}
		const prefix = findVendorPrefix(nodeModulesSpecifier, manifest);
		if (prefix) {
			return prefix;
		}
	}

	const prefix = findVendorPrefix(cleaned, manifest);
	if (prefix) {
		return prefix;
	}

	return null;
}

function findVendorPrefix(specifier: string, manifest: NonNullable<ReturnType<typeof getVendorManifest>>): string | null {
	const { modules } = manifest;
	const keys = Object.keys(modules || {});
	for (const key of keys) {
		if (specifier === key || specifier.startsWith(`${key}/`)) {
			return key;
		}
	}
	return null;
}

// ----------------------------------------------------------------------------
// NativeScript template compile helpers
// ----------------------------------------------------------------------------
// Many NativeScript UI elements are represented as PascalCase tags (e.g., GridLayout, StackLayout, Img).
// When the Vue SFC compiler encounters unknown PascalCase tags, it normally generates
// top-level `_resolveComponent("Tag")` hoists. Those evaluate at module load time and require
// an active rendering instance, which we don't have during HMR module evaluation on device.
// Marking these tags as custom elements prevents resolveComponent hoists and compiles them
// as native element vnodes instead. Imported components remain correctly bound via
// bindingMetadata and are NOT treated as custom elements.

interface NativeScriptImportBinding {
	default: Set<string>;
	namespace: Set<string>;
	named: Array<{ imported: string; local: string }>;
	sideEffectOnly: boolean;
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

// Final safety net for plain dynamic import(expressions) that might slip through
// Vite's helper transformation. We rewrite occurrences of `import(` to `__ns_import(`
// and inject a small wrapper that maps the anomalous request '@' to a harmless stub.
function ensureGuardPlainDynamicImports(code: string, origin: string): string {
	try {
		if (!code || !/\bimport\s*\(/.test(code)) return code;
		const w = `const __ns_import = (s) => { try { if (s === '@') { return import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href); } } catch {} return import(s); }\n`;
		// Replace only when `import(` is not part of an identifier or property (no preceding "." or word char)
		const replaced = code.replace(/(^|[^\.\w$])import\s*\(/g, (_m, p1) => `${p1}__ns_import(`);
		if (replaced !== code) {
			return w + replaced;
		}
		return code;
	} catch {
		return code;
	}
}

// Heal accidental "import ... = expr" assignments produced by upstream transforms.
// These are invalid JS; convert to equivalent const assignments.
function repairImportEqualsAssignments(code: string): string {
	try {
		if (!code || typeof code !== 'string') return code;
		// import { a, b as c } = expr; -> const { a, b: c } = expr;
		code = code.replace(/(^|\n)\s*import\s*\{([^}]+)\}\s*=\s*([^;]+);?/g, (_m, p1: string, specList: string, rhs: string) => {
			const cleaned = String(specList)
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.map((seg) => seg.replace(/\s+as\s+/i, ': '))
				.join(', ');
			return `${p1}const { ${cleaned} } = ${rhs};`;
		});
		// import * as ns = expr; -> const ns = (expr);
		code = code.replace(/(^|\n)\s*import\s*\*\s*as\s*([A-Za-z_$][\w$]*)\s*=\s*([^;]+);?/g, (_m, p1: string, ns: string, rhs: string) => {
			return `${p1}const ${ns} = (${rhs});`;
		});
		// import name = expr; -> const name = expr;
		code = code.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);?/g, (_m, p1: string, id: string, rhs: string) => {
			return `${p1}const ${id} = ${rhs};`;
		});
	} catch {}
	return code;
}

// Ensure imports of the NativeScript-Vue runtime bridge '/ns/rt' are versioned to
// bust the device HTTP loader cache whenever the HMR graph version increments.
function ensureVersionedRtImports(code: string, origin: string, ver: number): string {
	if (!code || !origin || !Number.isFinite(ver)) return code;
	// Static imports: import { ... } from ".../ns/rt" (plus optional version)
	code = code.replace(/(from\s+["'])(?:https?:\/\/[^"']+)?\/(?:\ns|ns)\/rt(?:\/[\d]+)?(["'])/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	// Dynamic imports: import(".../ns/rt") (plus optional version)
	code = code.replace(/(import\(\s*["'])(?:https?:\/\/[^"']+)?\/(?:\@ns|ns)\/rt(?:\/[\d]+)?(["']\s*\))/g, (_m, p1, p3) => `${p1}/ns/rt/${ver}${p3}`);
	return code;
}

// Ensure imports of @nativescript/core resolve via the unified /ns/core bridge to keep a single realm
function ensureVersionedCoreImports(code: string, origin: string, ver: number): string {
	try {
		// Static imports already handled in rewriteImports; just ensure absolute origin prefix and version
		code = code.replace(/(["'])\/ns\/core(\?p=[^"']+)?\1/g, (_m, q: string, qp?: string) => `${q}/ns/core/${ver}${qp || ''}${q}`);
		// Dynamic imports already handled in rewriteImports; ensure origin and version
		code = code.replace(/import\(\s*(["'])\/ns\/core(\?p=[^"']+)?\1\s*\)/g, (_m, q: string, qp?: string) => `import(${q}/ns/core/${ver}${qp || ''}${q})`);
	} catch {}
	return code;
}

// Hardened removal of Vite's virtual dynamic-import-helper. Some variants (side-effect only
// or minified forms) slipped past earlier regexes causing runtime attempts to resolve
// /@id/__x00__vite/dynamic-import-helper.js which does not exist in the device mirror.
// We aggressively strip any reference and inline a helper if necessary.
function stripViteDynamicImportVirtual(code: string): string {
	if (!/\/@id\/__x00__vite\/dynamic-import-helper/.test(code)) {
		return code;
	}
	const original = code;
	// Remove any import lines referencing the virtual helper (with or without bindings)
	code = code.replace(/^[\t ]*import[^\n]*\/@id\/__x00__vite\/dynamic-import-helper[^\n]*$/gm, '');
	// If any raw spec strings remain (e.g. concatenated), neutralize them
	if (/\/@id\/__x00__vite\/dynamic-import-helper/.test(code)) {
		code = code.replace(/\/@id\/__x00__vite\/dynamic-import-helper[^"'`)]*/g, '/__NS_UNUSED_DYNAMIC_IMPORT_HELPER__');
	}
	// Ensure helper present
	if (!/__variableDynamicImportRuntimeHelper/.test(code)) {
		const inline = `const __variableDynamicImportRuntimeHelper = (map, request, importMode) => {\n  try { if (request === '@') { return import('/ns/m/__invalid_at__.mjs'); } } catch {}\n  const loader = map && (map[request] || map[request?.replace(/\\\\/g, '/')]);\n  if (!loader) { const e = new Error('Cannot dynamically import: ' + request); /*@ts-ignore*/ e.code = 'ERR_MODULE_NOT_FOUND'; return Promise.reject(e); }\n  try { return loader(importMode); } catch (e) { return Promise.reject(e); }\n};\n`;
		code = inline + code;
	}
	if (code !== original) {
		code = `// [hmr-sanitize] removed virtual dynamic-import-helper\n${code}`;
	}
	return code;
}

// Small snippet injected into device-delivered modules to capture any require('http(s)://') calls
const REQUIRE_GUARD_SNIPPET = `// [guard] install require('http(s)://') detector\n(()=>{try{var g=globalThis;if(g.__NS_REQUIRE_GUARD_INSTALLED__){}else{var mk=function(o,l){return function(){try{var s=arguments[0];if(typeof s==='string'&&/^(?:https?:)\\/\\//.test(s)){var e=new Error('[ns-hmr][require-guard] require of URL: '+s+' via '+l);try{console.error(e.message+'\\n'+(e.stack||''));}catch(e2){}try{g.__NS_REQUIRE_GUARD_LAST__={spec:s,stack:e.stack,label:l,ts:Date.now()};}catch(e3){}}}catch(e1){}return o.apply(this, arguments);};};if(typeof g.require==='function'&&!g.require.__NS_REQ_GUARDED__){var o1=g.require;g.require=mk(o1,'require');g.require.__NS_REQ_GUARDED__=true;}if(typeof g.__nsRequire==='function'&&!g.__nsRequire.__NS_REQ_GUARDED__){var o2=g.__nsRequire;g.__nsRequire=mk(o2,'__nsRequire');g.__nsRequire.__NS_REQ_GUARDED__=true;}g.__NS_REQUIRE_GUARD_INSTALLED__=true;}}catch(e){}})();\n`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Origin invariant: we own both client and server. All URLs must use an explicit
// http(s)://host:port origin with no trailing slash. Build it deterministically
// where needed; do not post-sanitize.

/**
 * Check if an import spec should be remapped to dep-*.mjs
 */
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

// (legacy wrapSfcWithStableDefault removed; full SFCs now delegate to /ns/asm)

function removeNamedImports(code: string, names: string[]): string {
	const regex = /^(\s*import\s*\{)([^}]*)(\}\s*from\s*['"][^'"]+['"];?)/gm;
	return code.replace(regex, (_m, p1, specList, p3) => {
		// Only strip for known globalized framework sources (Vue/Nativescript-Vue).
		// Keep imports from all other packages (Pinia, third-party libs, app modules) intact.
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
	try {
		const manifest = getVendorManifest();
		if (manifest) {
			// Pattern: capture full import statement (static) with optional bindings
			// import X from 'pkg'; | import {a,b as c} from "pkg"; | import * as ns from 'pkg';
			const staticImportRE = /(import\s+([^;]*?)\s+from\s*["'])([^"']+)(["'];?)/g;
			result = result.replace(staticImportRE, (full, pre, bindings, spec, post) => {
				// Do not vendor-rewrite @nativescript/core — handled by the unified HTTP bridge later
				if (isNativeScriptCoreModule(spec)) return full;
				const resolved = resolveVendorSpecifier(spec);
				if (!resolved || /^@nativescript\/core(\b|\/)/i.test(resolved)) return full; // not vendor or is core
				// Determine binding style
				const trimmed = (bindings || '').trim();
				let injected = '';
				if (!trimmed || trimmed === '') {
					// Side-effect import: import 'pkg'; -> we drop it (vendor already evaluated)
					return `/* vendor side-effect dropped: ${spec} */`;
				}
				// Default + named or default only
				// Examples of trimmed:
				//   defaultExport
				//   { a, b as c }
				//   * as ns
				//   defaultExport, { a, b }
				const globalAccessor = `globalThis.__nsVendor && globalThis.__nsVendor(${JSON.stringify(resolved)})`;
				const ensureHelper = `globalThis.__nsVendor=require? (globalThis.__nsVendor|| (globalThis.__nsVendor=(id)=>{const m=(globalThis.__NS_VENDOR_MANIFEST__?globalThis.__NS_VENDOR_MANIFEST__.modules[id]:null);return (globalThis.__nsModules && globalThis.__nsModules.get? (globalThis.__nsModules.get(id)||globalThis.__nsModules.get(m?.id||id)):undefined);})):globalThis.__nsVendor`;
				if (trimmed.startsWith('{')) {
					// Named only
					injected = `${ensureHelper}; const ${trimmed} = ${globalAccessor} || {};`;
				} else if (trimmed.startsWith('*')) {
					// Namespace import: * as ns
					const m = /\*\s+as\s+(\w+)/.exec(trimmed);
					if (m) {
						injected = `${ensureHelper}; const ${m[1]} = ${globalAccessor} || {};`;
					}
				} else if (trimmed.includes(',')) {
					// default plus named
					const parts = trimmed.split(',');
					const def = parts[0].trim();
					const named = parts.slice(1).join(',').trim();
					injected = `${ensureHelper}; const __vmod = ${globalAccessor} || {}; const ${def} = __vmod.default || __vmod; const ${named} = __vmod;`;
				} else {
					// default only
					injected = `${ensureHelper}; const ${trimmed} = (${globalAccessor}||{}).default || ${globalAccessor};`;
				}
				return injected;
			});

			// Bare side-effect imports: import 'pkg';
			const sideEffectRE = /(import\s*["'])([^"']+)(["'];?)/g;
			result = result.replace(sideEffectRE, (full, pre, spec, post) => {
				if (isNativeScriptCoreModule(spec)) return full;
				const resolved = resolveVendorSpecifier(spec);
				if (!resolved || /^@nativescript\/core(\b|\/)/i.test(resolved)) return full;
				return `/* vendor side-effect skipped: ${spec} */`;
			});

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
function processCodeForDevice(code: string, isVitePreBundled: boolean): string {
	let result = code;

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
		'const __ANDROID__ = globalThis.__ANDROID__ !== undefined ? globalThis.__ANDROID__ : false;',
		'const __IOS__ = globalThis.__IOS__ !== undefined ? globalThis.__IOS__ : false;',
		'const __VISIONOS__ = globalThis.__VISIONOS__ !== undefined ? globalThis.__VISIONOS__ : false;',
		'const __APPLE__ = globalThis.__APPLE__ !== undefined ? globalThis.__APPLE__ : false;',
		'const __DEV__ = globalThis.__DEV__ !== undefined ? globalThis.__DEV__ : false;',
		'const __COMMONJS__ = globalThis.__COMMONJS__ !== undefined ? globalThis.__COMMONJS__ : false;',
		'const __NS_WEBPACK__ = globalThis.__NS_WEBPACK__ !== undefined ? globalThis.__NS_WEBPACK__ : true;',
		'const __NS_ENV_VERBOSE__ = globalThis.__NS_ENV_VERBOSE__ !== undefined ? !!globalThis.__NS_ENV_VERBOSE__ : false;',
		"const __CSS_PARSER__ = globalThis.__CSS_PARSER__ !== undefined ? globalThis.__CSS_PARSER__ : 'css-tree';",
		'const __UI_USE_XML_PARSER__ = globalThis.__UI_USE_XML_PARSER__ !== undefined ? globalThis.__UI_USE_XML_PARSER__ : true;',
		'const __UI_USE_EXTERNAL_RENDERER__ = globalThis.__UI_USE_EXTERNAL_RENDERER__ !== undefined ? globalThis.__UI_USE_EXTERNAL_RENDERER__ : false;',
		'const __TEST__ = globalThis.__TEST__ !== undefined ? globalThis.__TEST__ : false;',
	];
	result = allGlobals.join('\n') + '\n' + result;

	// Prefer AST-based normalization for imports and helper aliases; fallback regex if parsing fails
	try {
		result = astNormalizeModuleImportsAndHelpers(result);
	} catch {}

	// Verify there are no duplicate top-level const/let bindings after AST normalization
	try {
		result = astVerifyAndAnnotateDuplicates(result);
	} catch {}

	// If AST marker present, skip regex-based helper alias injection to avoid duplicates
	// Accept both line and block comment markers emitted by the normalizer
	if (!/^\s*(?:\/\/|\/\*) \[ast-normalized\]/m.test(result)) {
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
	result = ensureNativeScriptModuleBindings(result);

	// Repair any accidental "import ... = expr" assignments that may have slipped in.
	try {
		result = repairImportEqualsAssignments(result);
	} catch {}

	// Strip Vite prebundle deps imports (both named and side-effect) and any malformed const string artifacts
	// Example problematic line observed: const "/node_modules/.vite/deps/@nativescript_firebase-messaging.js?v=...";
	if (/node_modules\/\.vite\/deps\//.test(result)) {
		// Named imports from prebundle deps
		result = result.replace(/^[\t ]*import\s+[^;]*from\s+["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '');
		// Side-effect only imports from prebundle deps
		result = result.replace(/^[\t ]*import\s+["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '');
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
	result = ensureNativeScriptModuleBindings(result);
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

	result = ensureVariableDynamicImportHelper(result);

	// Normalize any lingering @nativescript/core imports to the /ns/core bridge (non-destructive best-effort)
	try {
		result = result.replace(/from\s+["']@nativescript\/core([^"'\n]*)["']/g, (_m, sub: string) => {
			const qp = (sub || '').trim().replace(/^\//, '');
			return `from "/ns/core${qp ? `?p=${qp}` : ''}"`;
		});
		result = result.replace(/import\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g, (_m, sub: string) => {
			const qp = (sub || '').trim().replace(/^\//, '');
			return `import("/ns/core${qp ? `?p=${qp}` : ''}")`;
		});
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
				__core_ns_seq++;
				const tmp = `__ns_core_ns${__core_ns_seq}`;
				const decl = `const { ${toDestructureCore(specList)} } = ${tmp};`;
				return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
			});
			const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
			result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, src: string) => {
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
		// Fallback: ensure any static import that isn't at start of line gets a newline before it
		result = result.replace(/([^\n])\s*(import\s+[^;\n]*\s+from\s*["'][^"']+["'])/g, '$1\n$2');
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
		const importLineRe = /^\s*import\s+[^;]+;?\s*$/gm;
		const lines: string[] = [];
		result = result.replace(importLineRe, (imp) => {
			lines.push(imp.trim());
			return '';
		});
		if (lines.length) {
			const hoisted = Array.from(new Set(lines)).join('\n') + '\n';
			result = hoisted + result;
		}
	} catch {}

	// Final safety: normalize any lingering named imports from /ns/rt into default+destructure
	// Skip when AST normalization marker present to avoid introducing duplicate temp imports
	try {
		if (!/^\s*\/\* \[ast-normalized\] \*\//m.test(result)) {
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
			const tmp = `__ns_core_ns_re`; // temp binding name is not reused elsewhere after hoist
			const decl = `const { ${toDestructure(specList)} } = ${tmp};`;
			return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
		});
		// import Default, { A, B } from '/ns/core[...]'
		const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, src: string) => {
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
function rewriteImports(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string): string {
	let result = code;
	const httpOriginSafe = httpOrigin;
	const importerDir = path.posix.dirname(importerPath);
	// Determine importer output relative path (project-relative .mjs) to compute relative imports consistently
	const importerOutRel = outputDirOverrideRel || getProjectRelativeImportPath(importerPath, projectRoot) || stripToProjectRelative(importerPath, projectRoot).replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	const importerOutDir = importerOutRel ? path.posix.dirname(importerOutRel) : '';
	const ensureRel = (p: string) => (p.startsWith('.') ? p : `./${p}`);

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
		const candidateNativeScriptSpec = nodeModulesSpecifier ?? spec;

		const vendorCanonical = resolveVendorFromCandidate(nodeModulesSpecifier ?? spec);

		if (vendorCanonical) {
			if (nodeModulesSpecifier) {
				return `${prefix}${nodeModulesSpecifier.replace(PAT.QUERY_PATTERN, '')}${suffix}`;
			}
			return `${prefix}${spec.replace(PAT.QUERY_PATTERN, '')}${suffix}`;
		}

		if (isNativeScriptPluginModule(candidateNativeScriptSpec)) {
			const bareSpecifier = candidateNativeScriptSpec.replace(PAT.QUERY_PATTERN, '');
			return `${prefix}${bareSpecifier}${suffix}`;
		}

		if (nodeModulesSpecifier) {
			return `${prefix}${nodeModulesSpecifier}${suffix}`;
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
			const vueKey = resolveVueKey(spec.replace(PAT.QUERY_PATTERN, ''));
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
						const target = `_ns_hmr/src/sfc/${vueFile}`;
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
			const baseId = absMaybe ? toAppModuleBaseId(absMaybe, projectRoot) : null; // e.g. /src/foo.mjs
			if (baseId) {
				const httpSpec = `/ns/m${baseId}`;
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
				const target = `_ns_hmr/src/sfc/${vueFile}`;
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
	// Compute a dependency-closed, topologically sorted list of modules for a given set of changed ids.
	// Only include application modules we can serve (e.g., under /src and known .vue/.ts/.js entries in the graph).
	function computeTxnOrderForChanged(changedIds: string[]): string[] {
		const includeExt = (id: string) => ACTIVE_STRATEGY.matchesFile(id) || /\.(ts|js|mjs|tsx|jsx)$/i.test(id);
		const isApp = (id: string) => id.startsWith('/src/');
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
		// Collapse ./src/ or /src/ when nested (defensive)
		const idx = id.indexOf('/src/');
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
	function upsertGraphModule(rawId: string, code: string, deps: string[]) {
		const id = normalizeGraphId(rawId);
		const normDeps = deps
			.map((d) => normalizeGraphId(d))
			.filter(Boolean)
			.slice()
			.sort();
		const hash = computeHash(code);
		const existing = graph.get(id);
		if (existing && existing.hash === hash && existing.deps.length === normDeps.length && existing.deps.every((d, i) => d === normDeps[i])) return; // unchanged
		graphVersion++;
		const gm: GraphModule = { id, deps: normDeps, hash };
		graph.set(id, gm);
		emitDelta([gm], []);
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
					if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
					spec = spec.replace(/\/(index)(?:\/(?:index))+$/i, '/$1');
					if (spec.startsWith('./')) spec = spec.slice(1);
					if (!spec.startsWith('/')) spec = '/' + spec;

					// Transform via Vite with variant resolution (same as ws ns:fetch-module)
					const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
					const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
					const candidates: string[] = [];
					if (hasExt) candidates.push(spec);
					candidates.push(baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs');
					let transformed: TransformResult | null = null;
					let resolvedCandidate: string | null = null;
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
					code = processCodeForDevice(code, false);
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
							const depCandidates = [depBase + '.ts', depBase + '.js', depBase + '.tsx', depBase + '.jsx', depBase + '.mjs', depBase + '.mts', depBase + '.cts', depBase + '.vue', depBase + '/index.ts', depBase + '/index.js', depBase + '/index.tsx', depBase + '/index.jsx', depBase + '/index.mjs'];
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
								depCode = processCodeForDevice(depCode, false);
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
					const forcedVer = urlObj.searchParams.get('v');
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
					spec = spec.replace(/[?#].*$/, '');
					// Normalize absolute filesystem paths back to project-relative ids (e.g. /src/app.ts)
					try {
						const projectRoot = ((server as any).config?.root || process.cwd()) as string;
						const toPosix = (p: string) => p.replace(/\\/g, '/');
						const rootPosix = toPosix(projectRoot);
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
					if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
					if (spec.startsWith('./')) spec = spec.slice(1);
					if (!spec.startsWith('/')) spec = '/' + spec;
					const hasExt = /\.(ts|tsx|js|jsx|mjs|mts|cts|vue)$/i.test(spec);
					const baseNoExt = hasExt ? spec.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '') : spec;
					const candidates = [...(hasExt ? [spec] : []), baseNoExt + '.ts', baseNoExt + '.js', baseNoExt + '.tsx', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', baseNoExt + '.vue', baseNoExt + '/index.ts', baseNoExt + '/index.js', baseNoExt + '/index.tsx', baseNoExt + '/index.jsx', baseNoExt + '/index.mjs'];
					let transformed: TransformResult | null = null;
					let resolvedCandidate: string | null = null;
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
					// Fallback 1: ask Vite to resolve the id, then transform the resolved id (handles aliases and virtual ids)
					if (!transformed?.code) {
						try {
							const rid = await (server as any).pluginContainer?.resolveId?.(spec, undefined);
							const ridStr = typeof rid === 'string' ? rid : rid?.id || null;
							if (ridStr) {
								const r = await server.transformRequest(ridStr);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = ridStr;
								}
							}
						} catch {}
					}
					// Fallback 2: try /@fs absolute path under project root (Vite file system alias)
					if (!transformed?.code) {
						try {
							const projectRoot = ((server as any).config?.root || process.cwd()) as string;
							const toPosix = (p: string) => p.replace(/\\/g, '/');
							const rootPosix = toPosix(projectRoot).replace(/\/$/, '');
							const absPosix = `${rootPosix}${spec.startsWith('/') ? '' : '/'}${spec}`;
							const fsId = `/@fs${absPosix}`;
							const r = await server.transformRequest(fsId);
							if (r?.code) {
								transformed = r;
								resolvedCandidate = fsId;
							}
						} catch {}
					}
					// Fallback 3: try adding ?import to hint Vite's transform pipeline
					if (!transformed?.code) {
						for (const cand of candidates) {
							try {
								const r = await server.transformRequest(`${cand}${cand.includes('?') ? '&' : '?'}import`);
								if (r?.code) {
									transformed = r;
									resolvedCandidate = `${cand}?import`;
									break;
								}
							} catch {}
						}
					}
					// RAW BYPASS: allow fetching original Vite transform before sanitation for diffing/debugging
					if (urlObj.searchParams.get('raw') === '1') {
						const raw = transformed?.code || 'export {}\n';
						try {
							const h = createHash('sha1').update(raw).digest('hex');
							res.setHeader('X-NS-Source-Hash', h);
							res.statusCode = 200;
							res.end(`// [hash:${h}] bytes=${raw.length} raw=1 m path=${spec}\n` + raw);
						} catch {
							res.statusCode = 200;
							res.end(`// [raw=1] m path=${spec}\n` + raw);
						}
						return;
					}
					// Post-transform: inject cache-busting version for all internal /ns/m/* imports to avoid stale module reuse on device
					try {
						if (transformed?.code) {
							const ver = Number((global as any).graphVersion || graphVersion || 0);
							let code = transformed.code;
							// 1) Static imports: import ... from "/ns/m/..."
							code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, `$1$2?v=${ver}$3`);
							// 2) Side-effect imports: import "/ns/m/..."
							code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, `$1$2?v=${ver}$3`);
							// 3) Dynamic imports: import("/ns/m/...")
							code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, `$1$2?v=${ver}$3`);
							// 4) new URL("/ns/m/...", import.meta.url)
							code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, `$1$2?v=${ver}$3`);
							// 5) __ns_import(new URL('/ns/m/...', import.meta.url).href)
							code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, `$1$2?v=${ver}$3`);
							transformed.code = code;
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
							// Enhanced diagnostics: emit a module that throws with context for easier on-device debugging
							try {
								const tried = Array.from(new Set(candidates)).slice(0, 12);
								let out = `// [ns:m] transform miss path=${spec} tried=${tried.length}\n` + `throw new Error(${JSON.stringify(`[ns/m] transform failed for ${spec} (tried ${tried.length} candidates). Use ?raw=1 to inspect Vite output.`)});\nexport {};\n`;
								try {
									const h = createHash('sha1').update(out).digest('hex');
									res.setHeader('X-NS-Source-Hash', h);
									out = `// [hash:${h}] bytes=${out.length}\n` + out;
								} catch {}
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
					code = processCodeForDevice(code, false);
					code = rewriteImports(code, resolvedCandidate || spec, sfcFileMap, depFileMap, (server as any).config?.root || process.cwd(), !!verbose, undefined, getServerOrigin(server));
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
						const verNum = Number(forcedVer || graphVersion || 0);
						code = ensureVersionedRtImports(code, getServerOrigin(server), verNum);
						code = ACTIVE_STRATEGY.ensureVersionedImports(code, getServerOrigin(server), verNum);
						code = ensureVersionedCoreImports(code, getServerOrigin(server), verNum);
					} catch {}
					// Finalize: also stamp all internal /ns/m imports with ?v=<ver> after all rewrites
					try {
						const ver = String(forcedVer || graphVersion || 0);
						const origin = getServerOrigin(server);
						// 1) Static imports: import ... from "/ns/m/..."
						code = code.replace(/(from\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, `$1$2?v=${ver}$3`);
						// 2) Side-effect imports: import "/ns/m/..."
						code = code.replace(/(import\s*(?!\()\s*["'])(\/ns\/m\/[^"'?]+)(["'])/g, `$1$2?v=${ver}$3`);
						// 3) Dynamic imports: import("/ns/m/...")
						code = code.replace(/(import\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*\))/g, `$1$2?v=${ver}$3`);
						// 4) new URL("/ns/m/...", import.meta.url)
						code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\))/g, `$1$2?v=${ver}$3`);
						// 5) __ns_import(new URL('/ns/m/...', import.meta.url).href)
						code = code.replace(/(new\s+URL\(\s*["'])(\/ns\/m\/[^"'?]+)(["']\s*,\s*import\.meta\.url\s*\)\.href)/g, `$1$2?v=${ver}$3`);
						// 6) Force absolute HTTP for new URL('/ns/m/...', import.meta.url).href → "${origin}/ns/m/..."
						try {
							code = code.replace(/new\s+URL\(\s*["'](\/ns\/m\/[^"'?]+)(?:\?[^"']*)?["']\s*,\s*import\.meta\.url\s*\)\.href/g, (_m: string, p1: string) => `${JSON.stringify(`${origin}${p1}?v=${ver}`)}`);
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

					// Dev-only: link-check static imports to surface missing bindings early
					try {
						const devCheck = process.env.NODE_ENV !== 'production';
						if (devCheck) {
							const ast = babelParse(code, {
								sourceType: 'module',
								plugins: ['typescript', 'importMeta'] as any,
							}) as any;
							const imports: Array<{ src: string; wantsDefault: boolean }> = [];
							babelTraverse(ast, {
								ImportDeclaration(p) {
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
												if (local.startsWith('@/')) local = '/src/' + local.slice(2);
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
					try {
						const h = createHash('sha1').update(code).digest('hex');
						res.setHeader('X-NS-Source-Hash', h);
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
						`export const $navigateTo = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); if (g.__NS_VERBOSE_RT_NAV__ || g.__NS_DEV_LOGS__) console.log('[ns-rt] $navigateTo invoked'); try { if (!(g && g.Frame)) { const ns = (__ns_core_bridge && (__ns_core_bridge.__esModule && __ns_core_bridge.default ? __ns_core_bridge.default : (__ns_core_bridge.default || __ns_core_bridge))) || __ns_core_bridge || {}; if (ns) { if (!g.Frame && ns.Frame) g.Frame = ns.Frame; if (!g.Page && ns.Page) g.Page = ns.Page; if (!g.Application && (ns.Application||ns.app||ns.application)) g.Application = (ns.Application||ns.app||ns.application); } } } catch {} try { const hmrRealm = (g && g.__NS_HMR_REALM__) || 'unknown'; const hasTop = !!(g && g.Frame && g.Frame.topmost && g.Frame.topmost()); const top = hasTop ? g.Frame.topmost() : null; const ctor = top && top.constructor && top.constructor.name; if (g.__NS_VERBOSE_RT_NAV__ || g.__NS_DEV_LOGS__) { console.log('[ns-rt] $navigateTo(single-path)', { via: 'app', rtRealm: __RT_REALM_TAG, hmrRealm, hasTop, topCtor: ctor }); } } catch {} if (g && typeof g.__nsNavigateUsingApp === 'function') { try { return g.__nsNavigateUsingApp(...a); } catch (e) { try { console.error('[ns-rt] $navigateTo app navigator error', e); } catch {} throw e; } } try { console.error('[ns-rt] $navigateTo unavailable: app navigator missing'); } catch {} throw new Error('$navigateTo unavailable: app navigator missing'); } ;\n` +
						`export const $navigateBack = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$navigateBack || (vm.default && vm.default.$navigateBack))) || (rt && (rt.$navigateBack || (rt.runtimeHelpers && rt.runtimeHelpers.navigateBack))); let res; try { const via = (impl && (impl === (vm && vm.$navigateBack) || impl === (vm && vm.default && vm.default.$navigateBack))) ? 'vm' : (impl ? 'rt' : 'none'); if (globalThis && (globalThis.__NS_VERBOSE_RT_NAV__ || globalThis.__NS_DEV_LOGS__)) { console.log('[ns-rt] $navigateBack', { via }); } } catch {} try { if (typeof impl === 'function') res = impl(...a); } catch {} try { const top = (g && g.Frame && g.Frame.topmost && g.Frame.topmost()); if (!res && top && top.canGoBack && top.canGoBack()) { res = top.goBack(); } } catch {} try { const hook = g && (g.__NS_HMR_ON_NAVIGATE_BACK || g.__NS_HMR_ON_BACK || g.__nsAttemptBackRemount); if (typeof hook === 'function') hook(); } catch {} return res; }\n` +
						`export const $showModal = (...a) => { const vm = (__cached_vm || (void __ensure(), __cached_vm)); const rt = __ensure(); const impl = (vm && (vm.$showModal || (vm.default && vm.default.$showModal))) || (rt && (rt.$showModal || (rt.runtimeHelpers && rt.runtimeHelpers.showModal))); try { if (typeof impl === 'function') return impl(...a); } catch (e) { try { if (g && (g.__NS_VERBOSE_RT_NAV__ || g.__NS_DEV_LOGS__)) { console.error('[ns-rt] $showModal error', e); } } catch {} } return undefined; }\n` +
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
					if (!(urlObj.pathname === '/ns/core' || /^\/ns\/core\/[\d]+$/.test(urlObj.pathname))) return next();
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
					res.setHeader('Pragma', 'no-cache');
					res.setHeader('Expires', '0');
					const verSeg = urlObj.pathname.replace(/^\/ns\/core\/?/, '');
					const ver = /^[0-9]+$/.test(verSeg) ? verSeg : String(graphVersion || 0);
					const sub = urlObj.searchParams.get('p') || '';
					const key = sub ? `@nativescript/core/${sub}` : `@nativescript/core`;
					// HTTP-only core bridge: do NOT use require/createRequire. Export a proxy that maps
					// property access to globalThis first, then to any available vendor registry module.
					let code =
						REQUIRE_GUARD_SNIPPET +
						`// [ns-core-bridge][v${ver}] HTTP-only ESM bridge (default proxy only)\n` +
						`const g = globalThis;\n` +
						`const reg = (g.__nsVendorRegistry ||= new Map());\n` +
						`const __getVendorCore = () => { try { const m = reg && reg.get ? (reg.get(${JSON.stringify(key)}) || reg.get('@nativescript/core')) : null; return (m && (m.__esModule && m.default ? m.default : (m.default || m))) || m || null; } catch { return null; } };\n` +
						`const __core = new Proxy({}, { get(_t, p){ if (p === 'default') return __core; if (p === Symbol.toStringTag) return 'Module'; try { const v = g[p]; if (v !== undefined) return v; } catch {} try { const vc = __getVendorCore(); return vc ? vc[p] : undefined; } catch {} return undefined; } });\n` +
						`// Default export: namespace-like proxy\n` +
						`export default __core;\n`;
					try {
						const h = createHash('sha1').update(code).digest('hex');
						res.setHeader('X-NS-Source-Hash', h);
						code = `// [hash:${h}] bytes=${code.length} core\n` + code;
					} catch {}
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
						const req = createRequire(import.meta.url);
						const entryRtPath = req.resolve('@nativescript/vite/hmr/entry-runtime.js');
						const fs = req('fs') as typeof import('fs');
						content = fs.readFileSync(entryRtPath, 'utf-8');
					} catch (e) {
						content = 'export default async function start(){ console.error("[/ns/entry-rt] not found"); }\n';
					}
					try {
						const h = createHash('sha1').update(content).digest('hex');
						res.setHeader('X-NS-Source-Hash', h);
						content = `// [hash:${h}] bytes=${content.length} entry-rt\n` + content;
					} catch {}
					res.statusCode = 200;
					res.end(content);
				} catch (e) {
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
						const main = pkg?.main || 'src/app.ts';
						const abs = getProjectFilePath(main).replace(/\\\\/g, '/');
						// Normalize to '/src/...' if within project root
						const idx = abs.indexOf('/src/');
						mainEntry = idx >= 0 ? abs.substring(idx) : '/src/app.ts';
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
					try {
						const h = createHash('sha1').update(code).digest('hex');
						res.setHeader('X-NS-Source-Hash', h);
						const banner = `// [hash:${h}] bytes=${code.length} entry\n`;
						if (verbose) {
							try {
								console.log('[hmr-http] reply /ns/entry hash', h, 'bytes', code.length);
							} catch {}
						}
						code = banner + code + `\n//# sourceURL=${origin}/ns/entry`;
					} catch {}
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
					if (fullSpec.startsWith('@/')) fullSpec = '/src/' + fullSpec.slice(2);
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
								let out = `// [sfc] transform miss kind=full path=${fullSpec.replace(/\n/g, '')} tried=${tried.length}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for full SFC: ' + fullSpec + ' (tried ' + tried.length + ')')});\nexport {}\n`;
								try {
									const h = createHash('sha1').update(out).digest('hex');
									res.setHeader('X-NS-Source-Hash', h);
									out = `// [hash:${h}] bytes=${out.length}\n` + out;
								} catch {}
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
								let out = `// [sfc] transform miss kind=variant path=${fullSpec.replace(/\n/g, '')}\n` + `throw new Error(${JSON.stringify('[ns/sfc] transform failed for variant: ' + fullSpec)});\nexport {}\n`;
								try {
									const h = createHash('sha1').update(out).digest('hex');
									res.setHeader('X-NS-Source-Hash', h);
									out = `// [hash:${h}] bytes=${out.length}\n` + out;
								} catch {}
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

					// RAW BYPASS: serve unsanitized transform output (or direct transform of candidate) when ?raw=1
					const rawBypass = urlObj.searchParams.get('raw') === '1';
					if (rawBypass) {
						try {
							let rawOut = transformed.code || 'export {}\n';
							try {
								const h = createHash('sha1').update(rawOut).digest('hex');
								res.setHeader('X-NS-Source-Hash', h);
								rawOut = `// [hash:${h}] bytes=${rawOut.length} raw=1 sfc kind=${isVariant ? 'variant' : 'full'}\n` + rawOut;
							} catch {}
							res.statusCode = 200;
							res.end(`// [sfc] raw bypass path=${fullSpec.replace(/\n/g, '')}\n` + rawOut);
							return;
						} catch (eRaw) {
							try {
								console.warn('[sfc][raw] failed', fullSpec, (eRaw as any)?.message);
							} catch {}
							res.statusCode = 200;
							res.end('// [sfc] raw bypass error\nexport {}\n');
							return;
						}
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
								ImportDeclaration(path) {
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
									Identifier(path) {
										if (templateBindings.has(path.node.name)) {
											path.replaceWith(t.identifier('undefined'));
										}
									},
									AssignmentExpression(path) {
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

						code = processCodeForDevice(code, false);
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
								ImportDeclaration(p) {
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
											if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
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
					try {
						const h = createHash('sha1').update(code).digest('hex');
						res.setHeader('X-NS-Source-Hash', h);
						code = `// [hash:${h}] bytes=${code.length}\n` + code;
					} catch {}

					// Diagnostic: when serving full SFCs, emit a short snippet and search for common compiled patterns
					try {
						if (!isVariant && verbose) {
							const snippet = code.slice(0, 1024).replace(/\n/g, '\\n');
							const hasExportHelper = /_export_sfc\s*\(/.test(code);
							const hasSfcMain = /_sfc_main\b/.test(code);
							const hasNsReal = /__ns_real__\b/.test(code);
							console.log(`[sfc][serve][diag] ${fullSpec} snippet=${snippet}`);
							console.log(`[sfc][serve][diag] patterns exportHelper=${hasExportHelper} sfcMain=${hasSfcMain} mergedVar=${hasNsReal}`);
						}
					} catch (e) {
						try {
							console.warn('[sfc][serve][diag] print failed', e);
						} catch {}
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
					if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
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
					if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
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

					// RAW BYPASS: return unsanitized compiled SFC or script/template when ?raw=1 for differential debugging
					const rawBypass = urlObj.searchParams.get('raw') === '1';
					if (rawBypass) {
						try {
							let rawOut = '';
							if (fullR?.code) {
								rawOut = fullR.code;
							} else if (scriptR?.code || templateR?.code) {
								// Reconstruct minimal module if only variants available
								const parts: string[] = [];
								if (scriptR?.code) parts.push('// [raw][script]\n' + scriptR.code);
								if (templateR?.code) parts.push('// [raw][template]\n' + templateR.code);
								rawOut = parts.join('\n');
							}
							if (!rawOut) {
								rawOut = 'export {}\n';
							}
							try {
								const h = createHash('sha1').update(rawOut).digest('hex');
								res.setHeader('X-NS-Source-Hash', h);
								rawOut =
									`// [hash:${h}] bytes=${rawOut.length} raw=1 asm
` + rawOut;
							} catch {}
							res.statusCode = 200;
							res.end(`// [sfc-asm] ${base} (raw bypass)\n` + rawOut);
							return;
						} catch (eRaw) {
							try {
								console.warn('[sfc-asm][raw] failed', base, (eRaw as any)?.message);
							} catch {}
							res.statusCode = 200;
							res.end('// [sfc-asm] raw bypass error\nexport {}\n');
							return;
						}
					}

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
											if (absImp.startsWith('@/')) absImp = '/src/' + absImp.slice(2);
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
							inlineCode = processCodeForDevice(inlineCode, false);
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
								inlineCode2 = processCodeForDevice(inlineCode2, false);
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
								try {
									const h = createHash('sha1').update(inlineCode2).digest('hex');
									res.setHeader('X-NS-Source-Hash', h);
									inlineCode2 = `// [hash:${h}] bytes=${inlineCode2.length}\n` + inlineCode2;
								} catch {}
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
					code = processCodeForDevice(code, false);
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
									if (spec.startsWith('@/')) spec = '/src/' + spec.slice(2);
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
									code = processCodeForDevice(code, false);
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
												depCode = processCodeForDevice(depCode, false);
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
											wss.clients.forEach((c) => {
												if (c.readyState === c.OPEN) {
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
				// Send SFC registry on first connection
				if (!registrySent) {
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
				const mod = server.moduleGraph.getModuleById(file) || server.moduleGraph.getModuleById(file + '?vue');
				if (mod) {
					const deps = Array.from(mod.importedModules)
						.map((m) => (m.id || '').replace(/\?.*$/, ''))
						.filter(Boolean);
					const transformed = await server.transformRequest(mod.id!);
					const code = transformed?.code || '';
					upsertGraphModule((mod.id || '').replace(/\?.*$/, ''), code, deps);
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][v2] failed graph update', e);
			}

			const root = server.config.root || process.cwd();
			const srcDir = `${root}/src`;
			const coreDir = `${root}/core`;
			const normalizedFile = file.split(path.sep).join('/');
			const shouldIgnore = !(normalizedFile.includes(srcDir) || normalizedFile.includes(coreDir));
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
						if (client.readyState === client.OPEN) {
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
				if (!(isHtml || isTs)) return;
				try {
					const root = server.config.root || process.cwd();
					const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
					const origin = getServerOrigin(server);
					const msg = {
						type: 'ns:angular-update',
						origin,
						path: rel,
						timestamp: Date.now(),
					} as const;
					wss.clients.forEach((client) => {
						if (client.readyState === client.OPEN) {
							client.send(JSON.stringify(msg));
						}
					});
				} catch (error) {
					console.warn('[hmr-ws][angular] update failed:', error);
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
					if (client.readyState === client.OPEN) {
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
					// If an import referencing '/src/utils' (without explicit 'index') was collapsed by rewriting,
					// ensure '/src/utils/index.mjs' is included when we see either '/src/utils' base or a usage pattern.
					if (!Array.from(filtered).some((p) => /\/src\/utils\/index\.mjs$/i.test(p))) {
						// Simple pattern: presence of 'src/utils/' substring in code implies possible barrel usage.
						if (/src\/utils\//.test(code)) {
							addCandidate('/src/utils/index.mjs');
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
