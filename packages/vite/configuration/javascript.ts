import { mergeConfig, type Plugin, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { getProjectAppPath } from '../helpers/utils.js';
import { type BundlerPlatform, createXmlLoaderPlugin, shouldExcludePlatformFile, toContextImportSpecifier, walkAppFiles } from '../helpers/bundler-context.js';
import { createUiRegistrationPlugin } from '../helpers/ui-registration.js';

/**
 * Registers bundler modules for plain JavaScript apps (no .ts files),
 * mimicking webpack's require.context used by NativeScript's XML builder.
 * It generates a virtual context whose keys() return './<relative-path>' entries
 * and invokes global.registerBundlerModules(context).
 */
function createBundlerContextPlugin(): Plugin {
	const VIRTUAL_ID = 'virtual:ns-bundler-context';
	const RESOLVED_ID = '\0' + VIRTUAL_ID;
	const flags = getCliFlags();
	const platform: BundlerPlatform = flags.android ? 'android' : flags.ios ? 'ios' : flags.visionos ? 'visionos' : undefined;
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
			const styleExtsSet = new Set(['css', 'scss', 'less', 'sass']);
			function enumerate(filter: (ext: string) => boolean) {
				return walkAppFiles(appRoot).filter((f) => filter(f.split('.').pop() || ''));
			}
			function toCtxKey(abs: string) {
				let rel = abs;
				if (rel.startsWith(appRootPrefix)) rel = rel.slice(appRootPrefix.length);
				return './' + rel;
			}
			const shouldExcludeAbsolute = (p: string) => shouldExcludePlatformFile(p, platform);
			const toImportSpecifier = toContextImportSpecifier;
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
				importLines.push(`import ${raw ? id : `* as ${id}`} from ${JSON.stringify(spec)};`);
				const ctxKey = toCtxKey(abs);
				registryEntries.push(`registry.set(${JSON.stringify(ctxKey)}, ${JSON.stringify(spec.replace(/\?raw$/, ''))});`);
				moduleMapLines.push(`all[${JSON.stringify(spec.replace(/\?raw$/, ''))}] = ${id};`);
			}
			xmlFiles.forEach((f) => pushImport(f, true));
			styleFiles.forEach((f) => pushImport(f, true));
			jsFiles.forEach((f) => pushImport(f, false));
			const code = `// Generated virtual bundler context (platform=${platform || 'unknown'})\n${importLines.join('\n')}\n(function(){\n  const registry = new Map();\n  const all = {};\n  ${moduleMapLines.join('\n  ')}\n  ${registryEntries.join('\n  ')}\n  function context(key){\n    const real = registry.get(key);\n    if(!real) throw new Error('[ns-vite] Module not found in context: '+key);\n    return all[real];\n  }\n  context.keys = function(){ return Array.from(registry.keys()); };\n  const g = (typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : {}));\n  if(g && typeof g.registerBundlerModules === 'function'){ g.registerBundlerModules(context); } else { setTimeout(()=>{ try { g.registerBundlerModules && g.registerBundlerModules(context); } catch{} },0); }\n})();`;
			return { code, map: null } as any;
		},
	};
}

export const javascriptConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode }), {
		plugins: [createXmlLoaderPlugin('ns-xml-loader-js'), createBundlerContextPlugin(), createUiRegistrationPlugin('javascript')],
	});
};
