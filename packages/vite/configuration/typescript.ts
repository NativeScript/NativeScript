import { mergeConfig, type Plugin, type UserConfig } from 'vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { getPackageJson, getProjectFilePath, getProjectRootPath } from '../helpers/project.js';
import { getProjectAppPath } from '../helpers/utils.js';

/**
 * TypeScript + XML NativeScript Vite configuration.
 * Adds a virtual require.context style registry (xml, js, ts, css, scss) similar to webpack5.
 * This enables the XML builder's module resolution (resolveModuleName) to find page/component files.
 */
function createBundlerContextPlugin(): Plugin {
	const VIRTUAL_ID = 'virtual:ns-bundler-context';
	const RESOLVED_ID = '\0' + VIRTUAL_ID;
	const flags = getCliFlags();
	const platform: 'android' | 'ios' | 'visionos' | undefined = flags.android ? 'android' : flags.ios ? 'ios' : flags.visionos ? 'visionos' : undefined;
	// Determine the app's declared main entry to avoid eagerly importing it (which would execute Application.run too early)
	const projectRoot = getProjectRootPath();
	const pkg = getPackageJson();
	const appRoot = getProjectAppPath();
	const appRootPrefix = `${appRoot}/`;
	let mainEntryRel: string | undefined;
	try {
		const mainAbs = getProjectFilePath(pkg.main);
		const rel = path.posix.relative(projectRoot.replace(/\\/g, '/'), mainAbs.replace(/\\/g, '/'));
		mainEntryRel = rel.replace(/^\/+/, ''); // e.g., 'src/main.ts'
	} catch {}

	return {
		name: 'ns-bundler-context-ts',
		enforce: 'pre',
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			return null;
		},
		load(id) {
			if (id !== RESOLVED_ID) return null;
			// Build platform-filtered static module registry similar to webpack's require.context.
			// Generic: only XML, styles and their paired code-behind files. Test/app specific additions belong in app vite.config.ts.
			const roots = [appRoot];
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
			function listAll(): string[] {
				const files: string[] = [];
				for (const r of roots) walk(r, files);
				return files;
			}
			function shouldExcludeAbsolute(p: string) {
				const file = p.split('/').pop() || '';
				if (file.startsWith('_')) return true;
				if (/\.d\.ts$/.test(p)) return true;
				if (/([.-]worker)\.(ts|js)$/.test(file)) return true;
				const isAndroidTagged = /\.android\./.test(p);
				const isIosTagged = /\.ios\./.test(p) || /\.visionos\./.test(p);
				if (platform === 'android' && isIosTagged) return true;
				if (['ios', 'visionos'].includes(platform) && isAndroidTagged) return true;
				return false;
			}
			function toImportSpecifier(abs: string) {
				return '/' + abs.replace(/^\/+/, '');
			}
			function toCtxKey(abs: string) {
				let rel = abs;
				if (rel.startsWith(appRootPrefix)) rel = rel.slice(appRootPrefix.length);
				else if (rel.startsWith('packages/core/src/')) rel = rel.slice('packages/core/src/'.length);
				return './' + rel;
			}
			const allFiles = listAll().filter((f) => !shouldExcludeAbsolute(f));
			const xmlFiles = allFiles.filter((f) => f.endsWith('.xml'));
			const styleFiles = allFiles.filter((f) => /\.(css|scss|less|sass)$/.test(f));
			// Import only code-behind files paired with XML (mirrors webpack's contextual resolution)
			const xmlBases = new Set(xmlFiles.map((x) => x.slice(0, -'.xml'.length)));
			const codeFiles: string[] = [];
			for (const base of xmlBases) {
				const tsCandidate = `${base}.ts`;
				const jsCandidate = `${base}.js`;
				if ((!mainEntryRel || tsCandidate !== mainEntryRel) && allFiles.includes(tsCandidate)) codeFiles.push(tsCandidate);
				else if ((!mainEntryRel || jsCandidate !== mainEntryRel) && allFiles.includes(jsCandidate)) codeFiles.push(jsCandidate);
			}
			// Do not include additional modules beyond XML-paired code-behind to avoid early side effects.
			let importLines: string[] = [];
			let registryEntries: string[] = [];
			let moduleMapLines: string[] = [];
			let index = 0;
			function pushImport(abs: string, raw: boolean) {
				const idLocal = `__m${index++}`;
				const spec = toImportSpecifier(abs) + (raw ? '?raw' : '');
				importLines.push(`import ${raw ? idLocal : `* as ${idLocal}`} from '${spec}';`);
				const cleaned = spec.replace(/\?raw$/, '');
				registryEntries.push(`registry.set('${toCtxKey(abs)}','${cleaned}');`);
				moduleMapLines.push(`all['${cleaned}'] = ${idLocal};`);
			}
			xmlFiles.forEach((f) => pushImport(f, true));
			styleFiles.forEach((f) => pushImport(f, true));
			// Sort code files as well for determinism (some tests rely on early registration of core pages/components)
			codeFiles.sort((a, b) => a.localeCompare(b)).forEach((f) => pushImport(f, false));
			// We no longer manually register nickname modules here; core's registerBundlerModules already adds nicknames.
			const code = `// Generated virtual bundler context (platform=${platform || 'unknown'})\n${importLines.join('\n')}\n(function(){\n  const registry = new Map();\n  const all = {};\n  ${moduleMapLines.join('\n  ')}\n  ${registryEntries.join('\n  ')}\n  function context(key){\n    const real = registry.get(key);\n    if(!real) throw new Error('[ns-vite] Module not found in context: '+key);\n    return all[real];\n  }\n  context.keys = function(){ return Array.from(registry.keys()); };\n  // Register modules now with extension map so .ts/.scss nicknames resolve like webpack\n  try { if (global.registerBundlerModules) { global.registerBundlerModules(context, { '.ts': '.js', '.scss': '.css', '.sass': '.css', '.less': '.css' }); } } catch(e) { try { console.warn('[ns-vite] registerBundlerModules error', e); } catch(_) {} }\n  // Safety: ensure main-page nickname exists if XML present\n  try {\n    const hasMainPageXml = context.keys().some(k => /(^\\.\\/?main-page\\.xml$|\\/main-page\\.xml$)/.test(k));\n    if (hasMainPageXml && global.moduleExists && !global.moduleExists('main-page') && global.registerBundlerModules) {\n      global.registerBundlerModules(context, { '.ts': '.js', '.scss': '.css', '.sass': '.css', '.less': '.css' });\n    }\n  } catch(_) {}\n})();`;
			return { code, map: null } as any;
		},
		transform(code, id) {
			// Ensure style system is initialized before any UI component modules register CSS properties
			// and ensure the bundler context is imported early in the virtual entry (parity with JS config)
			if (id.endsWith('virtual:entry-with-polyfills')) {
				const marker = "import '@nativescript/core/bundle-entry-points';";
				if (code.includes(marker)) {
					const injected = `${marker}\nimport '@nativescript/core/ui/styling/style';\nimport '@nativescript/core/ui/styling/style-properties';\nimport 'virtual:ns-bundler-context';\n(function(){\n  try {\n    const __ui = (global.loadModule ? global.loadModule('@nativescript/core/ui') : (global.require ? global.require('@nativescript/core/ui') : null));\n    if (__ui && __ui.View) {\n      const View = __ui.View;\n      const props = ['order','flexGrow','flexShrink','flexWrapBefore','alignSelf'];\n      for (const p of props) {\n        const d = Object.getOwnPropertyDescriptor(View.prototype, p);\n        if (d && typeof d.set === 'function') {\n          const origSet = d.set;\n          Object.defineProperty(View.prototype, p, {\n            configurable: true,\n            enumerable: d.enumerable,\n            get: d.get,\n            set(value){\n              if (value === undefined || value === null) return;\n              if (!this || !this._style) {\n                try { if (this && !this._style) this._style = this.style; } catch(_) {}\n                if (!this || !this._style) return;\n              }\n              return origSet.call(this, value);\n            }\n          });\n        }\n      }\n      // Force layout invalidation for alignment/visibility/size property changes \n      const forceProps = ['horizontalAlignment','verticalAlignment','visibility','height','width'];\n      for (const p of forceProps) {\n        const d = Object.getOwnPropertyDescriptor(View.prototype, p);\n        if (d && typeof d.set === 'function') {\n          const orig = d.set;\n          Object.defineProperty(View.prototype, p, {\n            configurable: true,\n            enumerable: d.enumerable,\n            get: d.get,\n            set(value){\n              const prev = this[p];\n              try { orig.call(this, value); } finally {\n                if (prev !== value) { try { this && this.requestLayout && this.requestLayout(); } catch(_) {} }\n              }\n            }\n          });\n        }\n      }\n    }\n  } catch(_) {}\n})();\n`;
					return { code: code.replace(marker, injected), map: null };
				}
			}
			return null;
		},
	};
}

function createXmlLoaderPlugin(): Plugin {
	return {
		name: 'ns-xml-loader-ts',
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

export const typescriptConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode }), {
		plugins: [createXmlLoaderPlugin(), createBundlerContextPlugin()],
	});
};
