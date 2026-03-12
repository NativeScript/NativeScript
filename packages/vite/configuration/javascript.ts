import { mergeConfig, type Plugin, type UserConfig } from 'vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { getProjectAppPath } from '../helpers/utils.js';

/**
 * Registers bundler modules for plain JavaScript apps (no .ts files),
 * mimicking webpack's require.context used by NativeScript's XML builder.
 * It generates a virtual context whose keys() return './<relative-path>' entries
 * and invokes global.registerBundlerModules(context).
 */
function createBundlerContextPlugin(): Plugin {
	const VIRTUAL_ID = 'virtual:ns-bundler-context';
	const RESOLVED_ID = '\0' + VIRTUAL_ID;
	const ENTRY_ID = '\0virtual:entry-with-polyfills';
	const flags = getCliFlags();
	const platform: 'android' | 'ios' | 'visionos' | undefined = flags.android ? 'android' : flags.ios ? 'ios' : flags.visionos ? 'visionos' : undefined;
	const appRoot = getProjectAppPath();
	const appRootPrefix = `${appRoot}/`;

	return {
		name: 'ns-bundler-context-js',
		enforce: 'pre',
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;
			// Build a platform-filtered static module registry at build time using recursive fs walk (no fast-glob dependency).
			const roots = [appRoot];
			const styleExtsSet = new Set(['css', 'scss', 'less', 'sass']);
			function walk(dir: string, out: string[]) {
				let entries: string[] = [];
				try {
					entries = readdirSync(dir);
				} catch {
					return out;
				}
				for (const entry of entries) {
					const full = path.posix.join(dir, entry);
					let st: any;
					try {
						st = statSync(full);
					} catch {
						continue;
					}
					if (st.isDirectory()) walk(full, out);
					else out.push(full);
				}
				return out;
			}
			function enumerate(filter: (ext: string) => boolean) {
				const files: string[] = [];
				for (const r of roots) walk(r, files);
				return files.filter((f) => filter(f.split('.').pop() || ''));
			}
			function shouldExcludeAbsolute(p: string) {
				const file = p.split('/').pop() || '';
				if (file.startsWith('_')) return true;
				if (/\.d\.ts$/.test(p)) return true;
				if (/([.-]worker)\.(ts|js)$/.test(file)) return true;
				const isAndroidTagged = /\.android\./.test(p);
				const isIosTagged = /\.ios\./.test(p) || /\.visionos\./.test(p);
				if (platform === 'android' && isIosTagged) return true;
				if ((platform === 'ios' || platform === 'visionos') && isAndroidTagged) return true;
				return false;
			}
			function toImportSpecifier(abs: string) {
				return '/' + abs.replace(/^\/+/, '');
			}
			function toCtxKey(abs: string) {
				let rel = abs;
				if (rel.startsWith(appRootPrefix)) rel = rel.slice(appRootPrefix.length);
				return './' + rel;
			}
			const xmlFiles = enumerate((ext) => ext === 'xml').filter((f) => !shouldExcludeAbsolute(f));
			const styleFiles = enumerate((ext) => styleExtsSet.has(ext)).filter((f) => !shouldExcludeAbsolute(f));
			const jsFiles = enumerate((ext) => ext === 'js').filter((f) => !shouldExcludeAbsolute(f));
			let importLines: string[] = [];
			let registryEntries: string[] = [];
			let moduleMapLines: string[] = [];
			let index = 0;
			function pushImport(abs: string, raw: boolean) {
				const id = `__m${index++}`;
				const spec = toImportSpecifier(abs) + (raw ? '?raw' : '');
				importLines.push(`import ${raw ? id : `* as ${id}`} from '${spec}';`);
				const ctxKey = toCtxKey(abs);
				registryEntries.push(`registry.set('${ctxKey}', '${spec.replace(/\?raw$/, '')}');`);
				moduleMapLines.push(`all['${spec.replace(/\?raw$/, '')}'] = ${id};`);
			}
			xmlFiles.forEach((f) => pushImport(f, true));
			styleFiles.forEach((f) => pushImport(f, true));
			jsFiles.forEach((f) => pushImport(f, false));
			const code = `// Generated virtual bundler context (platform=${platform || 'unknown'})\n${importLines.join('\n')}\n(function(){\n  const registry = new Map();\n  const all = {};\n  ${moduleMapLines.join('\n  ')}\n  ${registryEntries.join('\n  ')}\n  function context(key){\n    const real = registry.get(key);\n    if(!real) throw new Error('[ns-vite] Module not found in context: '+key);\n    return all[real];\n  }\n  context.keys = function(){ return Array.from(registry.keys()); };\n  const g = (typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : {}));\n  if(g && typeof g.registerBundlerModules === 'function'){ g.registerBundlerModules(context); } else { setTimeout(()=>{ try { g.registerBundlerModules && g.registerBundlerModules(context); } catch{} },0); }\n})();`;
			return { code, map: null } as any;
		},
		transform(code, id) {
			// Inject our registration immediately after bundle-entry-points import
			if (id === ENTRY_ID || id.endsWith('virtual:entry-with-polyfills')) {
				const marker = "import '@nativescript/core/bundle-entry-points';";
				if (code.includes(marker)) {
					return {
						code: code.replace(
							marker,
							`${marker}\n// Ensure style system is initialized before any UI component modules register CSS properties\nimport '@nativescript/core/ui/styling/style';\nimport '@nativescript/core/ui/styling/style-properties';\nimport 'virtual:ns-bundler-context';\n// Patch CSS accessors to be resilient to early default initializations before style exists\n(function(){\n  try {\n    const __ui = (global.loadModule ? global.loadModule('@nativescript/core/ui') : (global.require ? global.require('@nativescript/core/ui') : null));\n    if (__ui && __ui.View) {\n      const View = __ui.View;\n      const props = ['order','flexGrow','flexShrink','flexWrapBefore','alignSelf'];\n      for (const p of props) {\n        const d = Object.getOwnPropertyDescriptor(View.prototype, p);\n        if (d && typeof d.set === 'function') {\n          const origSet = d.set;\n          Object.defineProperty(View.prototype, p, {\n            configurable: true,\n            enumerable: d.enumerable,\n            get: d.get,\n            set(value){\n              if (value === undefined || value === null) return;\n              if (!this || !this._style) {\n                try { if (this && !this._style) this._style = this.style; } catch(_) {}\n                if (!this || !this._style) return;\n              }\n              return origSet.call(this, value);\n            }\n          });\n        }\n      }\n    }\n  } catch(_) {}\n})();\n// Vite adjustment: register short core UI element module names (e.g. Frame, StackLayout)\n// Some XML builder paths attempt to load 'Frame' directly instead of the barrel.\n// We expose individual element names so global.loadModule('Frame') works.\ntry {\n  const __ui = (global.loadModule ? global.loadModule('@nativescript/core/ui') : (global.require ? global.require('@nativescript/core/ui') : null));\n  if (__ui && global.registerModule) {\n    const existsFn = global.moduleExists ? (n) => global.moduleExists(n) : () => false;\n    Object.keys(__ui).forEach(k => {\n      if (k && k[0] === k[0].toUpperCase() && !existsFn(k)) {\n        try {\n          global.registerModule(k, () => ({ [k]: __ui[k] }));\n        } catch (e) { /* swallow */ }\n      }\n    });\n  }\n} catch(e) { /* ignore */ }\n`,
						),
						map: null,
					};
				}
			}
			return null;
		},
	};
}

function createXmlLoaderPlugin(): Plugin {
	return {
		name: 'ns-xml-loader-js',
		enforce: 'pre',
		load(id) {
			if (!id.endsWith('.xml')) return null;
			try {
				const src = readFileSync(id, 'utf-8');
				const xml = JSON.stringify(src)
					.replace(/\u2028/g, '\\u2028')
					.replace(/\u2029/g, '\\u2029');
				const code = `const ___XML___ = ${xml};\nexport default ___XML___;`;
				return { code, map: null } as any;
			} catch {
				return null;
			}
		},
	};
}

export const javascriptConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode }), {
		plugins: [createXmlLoaderPlugin(), createBundlerContextPlugin()],
	});
};
