import { builtinModules } from 'node:module';
import { NS_DEV_EXPR } from '../hmr/shared/runtime/dev-globals.js';

const STUBBED_BUILTINS = ['fs', 'path', 'os', 'url', 'crypto', 'util', 'stream', 'events', 'buffer', 'http', 'https', 'net', 'tls', 'dns', 'child_process', 'module', 'zlib', 'querystring', 'assert', 'constants', 'vm'];

function builtinsTableLiteral(names: readonly string[]): string {
	return `{ ${names.map((name) => `${/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)}: 1`).join(', ')} }`;
}

/**
 * The `globalThis.require` installed by `bundle.mjs`, as code. The runtime's own
 * require resolves on disk only and never consults the import map, so served
 * code reaches `@nativescript/core` through the dev globals' `coreModules`.
 * Under HMR a miss throws; in bundled builds it returns `{}`.
 */
export function createRequireShimCode(opts: { hmrActive: boolean }): string {
	let imports = '';
	imports += "try { if (typeof globalThis !== 'undefined') {\n";
	if (opts.hmrActive) {
		imports += `  var __nsDev = ${NS_DEV_EXPR};\n`;
	}
	imports += "  var __nsOrigRequire = typeof globalThis.require === 'function' ? globalThis.require : null;\n";
	imports += `  var __nsNodeBuiltins = ${builtinsTableLiteral(STUBBED_BUILTINS)};\n`;
	// Mirrors normalizeCoreSub() in helpers/ns-core-url.ts.
	imports += '  var __nsNormSub = function (s) {\n';
	imports += "    if (!s) return '';\n";
	imports += "    var t = String(s).split('?')[0].split('#')[0].trim();\n";
	imports += "    t = t.replace(/^\\/+/, '').replace(/\\/+$/, '');\n";
	imports += "    t = t.replace(/\\.(?:mjs|cjs|js)$/, '');\n";
	imports += "    if (t.length >= 6 && t.substring(t.length - 6) === '/index') t = t.substring(0, t.length - 6);\n";
	imports += "    if (!t || t === 'index') return '';\n";
	imports += '    return t;\n';
	imports += '  };\n';
	// Invariant D: CJS/ESM interop shape helper.
	//
	// A shape function that converts
	// ESM Module Namespace Objects (which have [[Prototype]] = null
	// per spec §9.4.6) into plain Objects that inherit from
	// Object.prototype. CJS consumers — especially zone.js's
	// patchMethod() — call `hasOwnProperty`, `toString`, etc. on
	// their require() result; a null-proto namespace throws
	// "X is not a function" on the first such call.
	//
	// Properties:
	//   - Recursive: @nativescript/core re-exports Utils/Http/Trace
	//     as nested namespaces (`export * as Utils from './utils'`),
	//     each also null-proto. Shallow wrapping leaves those.
	//   - Identity-preserving via a WeakMap cache keyed on the
	//     underlying namespace. zone.js MUTATES its target (stashes
	//     delegate symbols, overwrites methods); a fresh copy per
	//     require() would lose those mutations on the next lookup.
	//   - Under HMR, published as the dev globals' `cjsShape` so the served
	//     core's registration footer shares this one cache and sees
	//     mutation-consistent shapes.
	imports += '  var __nsShapeCache = new WeakMap();\n';
	imports += `  var __nsShapeCjs = ${opts.hmrActive ? '__nsDev.cjsShape || (__nsDev.cjsShape = ' : '('}function __nsShape(obj) {\n`;
	imports += "    if (!obj || typeof obj !== 'object') return obj;\n";
	imports += '    var proto = Object.getPrototypeOf(obj);\n';
	imports += '    var isNsModule = false;\n';
	imports += "    try { isNsModule = obj[Symbol.toStringTag] === 'Module'; } catch (e) {}\n";
	imports += '    if (proto !== null && !isNsModule) return obj;\n';
	imports += '    if (__nsShapeCache.has(obj)) return __nsShapeCache.get(obj);\n';
	imports += '    var out = {};\n';
	imports += '    __nsShapeCache.set(obj, out);\n';
	imports += '    try {\n';
	imports += '      var keys = Object.keys(obj);\n';
	imports += '      for (var i = 0; i < keys.length; i++) {\n';
	imports += '        var k = keys[i];\n';
	imports += '        try { out[k] = __nsShape(obj[k]); } catch (e) {}\n';
	imports += '      }\n';
	imports += '    } catch (e) {}\n';
	imports += '    return out;\n';
	imports += '  });\n';
	imports += opts.hmrActive ? devRequireCode() : bundledRequireCode();
	imports += '  _nsReq.context = function () { var _c = { keys: function () { return []; } }; _c.__esModule = true; return _c; };\n';
	imports += '  if (__nsOrigRequire) { try { _nsReq.resolve = __nsOrigRequire.resolve ? __nsOrigRequire.resolve.bind(__nsOrigRequire) : function (id) { return id; }; } catch (e) {} }\n';
	imports += '  globalThis.require = _nsReq;\n';
	imports += '} } catch {}\n';
	return imports;
}

function bundledRequireCode(): string {
	let code = '';
	code += '  var _nsReq = function (id) {\n';
	code += '    try {\n';
	code += "      var n = String(id || '');\n";
	// Kept-external builtins must reach the runtime before the stub table.
	code += "      if (__nsOrigRequire && (n.indexOf('ns:') === 0 || n.indexOf('node:') === 0)) {\n";
	code += '        try { return __nsOrigRequire(n); } catch (e) {}\n';
	code += '      }\n';
	code += "      var stripped = n.indexOf('node:') === 0 ? n.slice(5) : n;\n";
	code += '      if (__nsNodeBuiltins[stripped]) return {};\n';
	// The native loader may return a raw (null-proto) ESM namespace.
	code += '      if (__nsOrigRequire) return __nsShapeCjs(__nsOrigRequire(id));\n';
	code += '    } catch (e) {}\n';
	code += '    return {};\n';
	code += '  };\n';
	return code;
}

function devRequireCode(): string {
	// Builtins outside the stub table go to the runtime first and stub only on a miss.
	const otherBuiltins = builtinModules.filter((name) => !name.startsWith('node:') && !name.startsWith('_') && !STUBBED_BUILTINS.includes(name));
	let code = '';
	code += `  var __nsOtherBuiltins = ${builtinsTableLiteral(otherBuiltins)};\n`;
	code += '  var __nsIsCore = function (n) {\n';
	code += "    return n === '@nativescript/core' || n.indexOf('@nativescript/core/') === 0;\n";
	code += '  };\n';
	code += '  var __nsMiss = function (n, e) {\n';
	code += '    var hint;\n';
	code += '    if (__nsIsCore(n)) {\n';
	// Core is excluded from the dep optimizer: only an ESM import of the served module registers it in `coreModules`.
	code += `      hint = "the served app hasn't evaluated that @nativescript/core module yet. Import '" + n + "' as ESM (e.g. in the app entry) so it evaluates before it is required.";\n`;
	code += '    } else if (/^(?:[./~]|[A-Za-z][\\w+.-]*:)/.test(n)) {\n';
	code += "      hint = 'require() resolves on disk only.';\n";
	code += '    } else {\n';
	code += `      hint = "require() resolves on disk only. Add '" + n + "', or the CommonJS package that requires it, to optimizeDeps.include, or import it as ESM.";\n`;
	code += '    }\n';
	code += `    var err = new Error("[ns-entry] require('" + n + "') can't be resolved in a dev session: " + hint + (e && e.message ? ' Runtime error: ' + e.message : ''));\n`;
	code += '    if (e) err.cause = e;\n';
	code += '    return err;\n';
	code += '  };\n';
	code += '  var _nsReq = function (id) {\n';
	code += "    var n = String(id || '');\n";
	// Kept-external builtins must reach the runtime before the stub table.
	code += "    if (__nsOrigRequire && (n.indexOf('ns:') === 0 || n.indexOf('node:') === 0)) {\n";
	code += '      try { return __nsOrigRequire(n); } catch (e) {\n';
	code += "        if (n.indexOf('ns:') === 0) throw e;\n";
	code += '      }\n';
	code += '    }\n';
	code += "    if (n.indexOf('node:') === 0) return {};\n";
	code += '    if (__nsNodeBuiltins[n]) return {};\n';
	code += '    if (__nsIsCore(n)) {\n';
	code += '      var table = __nsDev.coreModules;\n';
	code += '      if (table) {\n';
	// The served core's footer can register namespaces before this
	// shim installs `cjsShape`, so entries may be unshaped; shape on read.
	code += '        if (table[n]) return __nsShapeCjs(table[n]);\n';
	code += "        var rawSub = n === '@nativescript/core' ? '' : n.slice('@nativescript/core/'.length);\n";
	code += '        var normSub = __nsNormSub(rawSub);\n';
	code += "        var bareKey = normSub ? '@nativescript/core/' + normSub : '@nativescript/core';\n";
	code += '        if (table[bareKey]) return __nsShapeCjs(table[bareKey]);\n';
	code += '        if (table[normSub]) return __nsShapeCjs(table[normSub]);\n';
	code += '      }\n';
	code += '    }\n';
	code += '    if (!__nsOrigRequire) {\n';
	code += '      if (__nsOtherBuiltins[n]) return {};\n';
	code += '      throw __nsMiss(n, null);\n';
	code += '    }\n';
	code += '    var mod;\n';
	code += '    try { mod = __nsOrigRequire(id); } catch (e) {\n';
	code += '      if (__nsOtherBuiltins[n]) return {};\n';
	code += '      throw __nsMiss(n, e);\n';
	code += '    }\n';
	// The native loader may return a raw (null-proto) ESM namespace.
	code += '    return __nsShapeCjs(mod);\n';
	code += '  };\n';
	return code;
}
