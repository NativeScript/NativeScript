import path from 'path';

import type { Plugin } from 'vite';

import { findPackageInNodeModules } from './module-resolution.js';
import { getProjectRootPath } from './project.js';

// Support various @nativescript/core transient commonjs dependency cases

const PROJECT_ROOT = getProjectRootPath();
const SOURCE_MAP_JS_ROOT = findPackageInNodeModules('source-map-js', PROJECT_ROOT)?.replace(/\\/g, '/');
const STRIP_QUERY_RE = /[?#].*$/;

export function getSourceMapJsCompatSubpath(id: string): string | null {
	if (!id) return null;

	const cleaned = id.replace(STRIP_QUERY_RE, '').replace(/\\/g, '/');
	if (!cleaned) return null;

	if (cleaned === 'source-map-js') {
		return 'source-map.js';
	}

	if (cleaned === 'source-map-js/source-map.js' || cleaned.startsWith('source-map-js/lib/')) {
		return cleaned.slice('source-map-js/'.length);
	}

	const nodeModulesMarker = '/node_modules/source-map-js';
	const nodeModulesIndex = cleaned.lastIndexOf(nodeModulesMarker);
	if (nodeModulesIndex !== -1) {
		const tail = cleaned.slice(nodeModulesIndex + nodeModulesMarker.length).replace(/^\//, '');
		return tail || 'source-map.js';
	}

	if (SOURCE_MAP_JS_ROOT) {
		if (cleaned === SOURCE_MAP_JS_ROOT) {
			return 'source-map.js';
		}
		if (cleaned.startsWith(`${SOURCE_MAP_JS_ROOT}/`)) {
			return cleaned.slice(SOURCE_MAP_JS_ROOT.length + 1);
		}
	}

	return null;
}

export function transformSourceMapJsCompatModule(code: string, id: string): string {
	const subpath = getSourceMapJsCompatSubpath(id);
	if (!subpath || (!subpath.endsWith('.js') && subpath !== 'source-map.js')) {
		return code;
	}

	if (!/\b(?:exports\.|module\.exports|require\(['"])/.test(code)) {
		return code;
	}

	const currentDir = path.posix.dirname(subpath);
	const importBindings = new Map<string, string>();
	const importLines: string[] = [];

	const getImportBinding = (request: string): string | null => {
		if (!request.startsWith('.') && !request.startsWith('/')) {
			return null;
		}

		let resolved = path.posix.normalize(path.posix.join(currentDir, request));
		if (!path.posix.extname(resolved)) {
			resolved += '.js';
		}
		resolved = resolved.replace(/^\//, '');
		const specifier = `source-map-js/${resolved}`;

		let binding = importBindings.get(specifier);
		if (!binding) {
			binding = `__ns_source_map_js_req_${importBindings.size}`;
			importBindings.set(specifier, binding);
			importLines.push(`import ${binding} from ${JSON.stringify(specifier)};`);
		}

		return binding;
	};

	let transformed = code;
	transformed = transformed.replace(/require\((['"])([^'"]+)\1\)\.([A-Za-z_$][\w$]*)/g, (match, _quote, request, prop) => {
		const binding = getImportBinding(request);
		return binding ? `${binding}.${prop}` : match;
	});
	transformed = transformed.replace(/require\((['"])([^'"]+)\1\)/g, (match, _quote, request) => {
		const binding = getImportBinding(request);
		return binding ?? match;
	});

	const namedExports = new Set<string>();
	const exportsRe = /\bexports\s*\.\s*([A-Za-z_$][\w$]*)\s*=/g;
	let exportMatch: RegExpExecArray | null;
	while ((exportMatch = exportsRe.exec(transformed)) !== null) {
		const name = exportMatch[1];
		if (name !== '__esModule' && name !== 'default') {
			namedExports.add(name);
		}
	}

	const definePropertyRe = /Object\s*\.\s*defineProperty\s*\(\s*exports\s*,\s*['"]([^'"]+)['"]/g;
	while ((exportMatch = definePropertyRe.exec(transformed)) !== null) {
		const name = exportMatch[1];
		if (name !== '__esModule' && name !== 'default') {
			namedExports.add(name);
		}
	}

	const output: string[] = [];
	if (importLines.length) {
		output.push(...importLines, '');
	}
	output.push('const module = { exports: {} };');
	output.push('const exports = module.exports;');
	output.push(transformed.trimEnd());
	output.push('');
	output.push('const __cjs_mod = module.exports;');
	output.push('export default __cjs_mod;');

	if (namedExports.size) {
		const entries = Array.from(namedExports);
		const tempDecls = entries.map((name, index) => `const __cjs_export_${index} = __cjs_mod[${JSON.stringify(name)}];`);
		const reExports = entries.map((name, index) => `__cjs_export_${index} as ${name}`);
		output.push(...tempDecls);
		output.push(`export { ${reExports.join(', ')} };`);
	}

	output.push('');
	return output.join('\n');
}

const sourceMapJsCompatPlugin: Plugin = {
	name: 'source-map-js-compat',
	enforce: 'pre',
	transform(code, id) {
		if (!getSourceMapJsCompatSubpath(id)) {
			return null;
		}

		const transformed = transformSourceMapJsCompatModule(code, id);
		if (transformed === code) {
			return null;
		}

		return {
			code: transformed,
			map: null,
		};
	},
};

export const commonjsPlugins = [
	sourceMapJsCompatPlugin,
	// Fix html-entities ESM compatibility issue
	{
		name: 'html-entities-compat',
		enforce: 'pre',
		resolveId(id) {
			if (id === 'html-entities') {
				return id;
			}
			return null;
		},
		load(id) {
			if (id === 'html-entities') {
				// html-entities exports: exports.encode = encode; exports.decode = decode; exports.decodeEntity = decodeEntity;
				return {
					code: `
import * as htmlEntitiesModule from 'html-entities/lib/index.js';
export const encode = htmlEntitiesModule.encode;
export const decode = htmlEntitiesModule.decode;
export const decodeEntity = htmlEntitiesModule.decodeEntity;
export default htmlEntitiesModule;
`,
					moduleType: 'js',
				};
			}
			return null;
		},
	},
	// Fix fast-xml-parser ESM compatibility issue
	{
		name: 'fast-xml-parser-compat',
		enforce: 'pre',
		resolveId(id) {
			if (id === 'fast-xml-parser') {
				return id;
			}
			return null;
		},
		load(id) {
			if (id === 'fast-xml-parser') {
				// fast-xml-parser exports: exports.XMLParser = XMLParser; exports.XMLBuilder = XMLBuilder; exports.XMLValidator = XMLValidator; etc.
				return {
					code: `
import * as fastXmlParser from 'fast-xml-parser/src/fxp.js';
export const XMLParser = fastXmlParser.XMLParser;
export const XMLBuilder = fastXmlParser.XMLBuilder;
export const XMLValidator = fastXmlParser.XMLValidator;
export const X2jOptions = fastXmlParser.X2jOptions;
export const J2xOptions = fastXmlParser.J2xOptions;
export default fastXmlParser;
`,
					moduleType: 'js',
				};
			}
			return null;
		},
	},
];
