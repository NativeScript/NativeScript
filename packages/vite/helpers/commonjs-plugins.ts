// Support various @nativescript/core transient commonjs dependency cases

export const commonjsPlugins = [
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
