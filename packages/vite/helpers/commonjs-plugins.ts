// Support various @nativescript/core transient commonjs dependency cases

export const commonjsPlugins = [
	// Fix source-map-js subpath imports for css-tree compatibility
	{
		name: 'source-map-js-subpath-compat',
		enforce: 'pre',
		resolveId(id) {
			if (id === 'source-map-js/lib/source-map-generator.js') {
				return '\0source-map-generator-virtual';
			}
			return null;
		},
		load(id) {
			if (id === '\0source-map-generator-virtual') {
				// Import the main source-map-js package and extract SourceMapGenerator
				return `
import * as sourceMapJs from 'source-map-js';
const { SourceMapGenerator } = sourceMapJs;
export { SourceMapGenerator };
`;
			}
			return null;
		},
	},
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
				return `
import * as htmlEntitiesModule from 'html-entities/lib/index.js';
export const encode = htmlEntitiesModule.encode;
export const decode = htmlEntitiesModule.decode;
export const decodeEntity = htmlEntitiesModule.decodeEntity;
export default htmlEntitiesModule;
`;
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
				return `
import * as fastXmlParser from 'fast-xml-parser/src/fxp.js';
export const XMLParser = fastXmlParser.XMLParser;
export const XMLBuilder = fastXmlParser.XMLBuilder;
export const XMLValidator = fastXmlParser.XMLValidator;
export const X2jOptions = fastXmlParser.X2jOptions;
export const J2xOptions = fastXmlParser.J2xOptions;
export default fastXmlParser;
`;
			}
			return null;
		},
	},
];
