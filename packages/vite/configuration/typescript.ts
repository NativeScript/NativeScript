import { mergeConfig, type Plugin, type UserConfig } from 'vite';
import path from 'node:path';
import { baseConfig } from './base.js';
import { resolvePlatform } from '../helpers/cli-flags.js';
import { getPackageJson, getProjectFilePath, getProjectRootPath } from '../helpers/project.js';
import { getProjectAppPath } from '../helpers/utils.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';
import { type BundlerPlatform, createXmlLoaderPlugin, shouldExcludePlatformFile, toContextImportSpecifier, walkAppFiles } from '../helpers/bundler-context.js';

/**
 * TypeScript + XML NativeScript Vite configuration.
 * Adds a virtual require.context style registry (xml, js, ts, css, scss) similar to webpack5.
 * This enables the XML builder's module resolution (resolveModuleName) to find page/component files.
 */
function createBundlerContextPlugin(): Plugin {
	const VIRTUAL_ID = 'virtual:ns-bundler-context';
	const RESOLVED_ID = '\0' + VIRTUAL_ID;
	const platform: BundlerPlatform = resolvePlatform();
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
			const toImportSpecifier = toContextImportSpecifier;
			function toCtxKey(abs: string) {
				let rel = abs;
				if (rel.startsWith(appRootPrefix)) rel = rel.slice(appRootPrefix.length);
				else if (rel.startsWith('packages/core/src/')) rel = rel.slice('packages/core/src/'.length);
				return './' + rel;
			}
			const allFiles = walkAppFiles(appRoot).filter((f) => !shouldExcludePlatformFile(f, platform));
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
			const importLines: string[] = [];
			const registryEntries: string[] = [];
			const moduleMapLines: string[] = [];
			let index = 0;
			function pushImport(abs: string, raw: boolean) {
				const idLocal = `__m${index++}`;
				const spec = toImportSpecifier(abs) + (raw ? '?raw' : '');
				importLines.push(`import ${raw ? idLocal : `* as ${idLocal}`} from ${JSON.stringify(spec)};`);
				const cleaned = spec.replace(/\?raw$/, '');
				registryEntries.push(`registry.set(${JSON.stringify(toCtxKey(abs))}, ${JSON.stringify(cleaned)});`);
				moduleMapLines.push(`all[${JSON.stringify(cleaned)}] = ${idLocal};`);
			}
			xmlFiles.forEach((f) => pushImport(f, true));
			styleFiles.forEach((f) => pushImport(f, true));
			// Sort code files as well for determinism (some tests rely on early registration of core pages/components)
			codeFiles.sort((a, b) => a.localeCompare(b)).forEach((f) => pushImport(f, false));
			// We no longer manually register nickname modules here; core's registerBundlerModules already adds nicknames.
			const code = `// Generated virtual bundler context (platform=${platform || 'unknown'})\n${importLines.join('\n')}\n(function(){\n  const registry = new Map();\n  const all = {};\n  ${moduleMapLines.join('\n  ')}\n  ${registryEntries.join('\n  ')}\n  function context(key){\n    const real = registry.get(key);\n    if(!real) throw new Error('[ns-vite] Module not found in context: '+key);\n    return all[real];\n  }\n  context.keys = function(){ return Array.from(registry.keys()); };\n  // Register modules now with extension map so .ts/.scss nicknames resolve like webpack\n  try { if (global.registerBundlerModules) { global.registerBundlerModules(context, { '.ts': '.js', '.scss': '.css', '.sass': '.css', '.less': '.css' }); } } catch(e) { console.warn('[ns-vite] registerBundlerModules error', e); }\n  // Safety: ensure main-page nickname exists if XML present\n  try {\n    const hasMainPageXml = context.keys().some(k => /(^\\.\\/?main-page\\.xml$|\\/main-page\\.xml$)/.test(k));\n    if (hasMainPageXml && global.moduleExists && !global.moduleExists('main-page') && global.registerBundlerModules) {\n      global.registerBundlerModules(context, { '.ts': '.js', '.scss': '.css', '.sass': '.css', '.less': '.css' });\n    }\n  } catch(_) {}\n})();`;
			return { code, map: null } as any;
		},
	};
}

export const typescriptConfig = ({ mode }, options: TypeCheckControlOptions = {}): UserConfig => {
	// Note: the virtual:ns-ui-registration plugin is registered by baseConfig
	// from the declared flavor, paired with the entry import emission.
	return mergeConfig(baseConfig({ mode, flavor: 'typescript' }), {
		plugins: [...getTypeCheckPlugins('typescript', options.typeCheck), createXmlLoaderPlugin('ns-xml-loader-ts'), createBundlerContextPlugin()],
	});
};
