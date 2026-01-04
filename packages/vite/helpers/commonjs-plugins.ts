// Support various @nativescript/core transient commonjs dependency cases

export const commonjsPlugins = [
	// Fully virtualize source-map-js to avoid commonjs transform errors and ESM compatibility issues
	// The module has complex internal structure that causes issues with both commonjs plugin transform
	// and direct inclusion in ESM bundles
	{
		name: 'source-map-js-esm-compat',
		enforce: 'pre',
		resolveId(id, importer, options) {
			// Handle the main source-map-js import
			if (id === 'source-map-js') {
				return '\0source-map-js-virtual';
			}
			// Handle subpath imports like source-map-js/lib/source-map-generator.js
			if (id === 'source-map-js/lib/source-map-generator.js') {
				return '\0source-map-generator-virtual';
			}
			// Handle the source-map.js entry point directly
			if (id.endsWith('source-map-js/source-map.js')) {
				return '\0source-map-js-virtual';
			}
			return null;
		},
		load(id) {
			if (id === '\0source-map-js-virtual') {
				// Provide stub implementations for source-map-js
				// These are used by css-tree for source map generation which is not needed at runtime
				return `
// Stub implementation of source-map-js for NativeScript runtime
// Source maps are handled at build time, not runtime

export class SourceMapGenerator {
  constructor(options) {
    this._file = options?.file;
    this._sourceRoot = options?.sourceRoot;
    this._sources = [];
    this._names = [];
    this._mappings = [];
  }
  addMapping(mapping) {}
  setSourceContent(sourceFile, content) {}
  toJSON() {
    return {
      version: 3,
      file: this._file || '',
      sourceRoot: this._sourceRoot || '',
      sources: this._sources,
      names: this._names,
      mappings: ''
    };
  }
  toString() {
    return JSON.stringify(this.toJSON());
  }
}

export class SourceMapConsumer {
  constructor(rawSourceMap) {}
  static fromSourceMap(generator) { return new SourceMapConsumer({}); }
  originalPositionFor(args) { return { source: null, line: null, column: null, name: null }; }
  generatedPositionFor(args) { return { line: null, column: null, lastColumn: null }; }
  eachMapping(callback) {}
  destroy() {}
}

export class SourceNode {
  constructor(line, column, source, chunk, name) {
    this.children = [];
    this.line = line;
    this.column = column;
    this.source = source;
    this.name = name;
    if (chunk) this.add(chunk);
  }
  add(chunk) {
    if (Array.isArray(chunk)) {
      chunk.forEach(c => this.add(c));
    } else if (chunk) {
      this.children.push(chunk);
    }
    return this;
  }
  prepend(chunk) {
    if (Array.isArray(chunk)) {
      this.children = chunk.concat(this.children);
    } else if (chunk) {
      this.children.unshift(chunk);
    }
    return this;
  }
  walk(fn) {}
  join(sep) { return this; }
  replaceRight(pattern, replacement) { return this; }
  setSourceContent(sourceFile, content) {}
  walkSourceContents(fn) {}
  toString() {
    return this.children.map(c => typeof c === 'string' ? c : c.toString()).join('');
  }
  toStringWithSourceMap(args) {
    return { code: this.toString(), map: new SourceMapGenerator(args) };
  }
}

export default { SourceMapGenerator, SourceMapConsumer, SourceNode };
`;
			}
			if (id === '\0source-map-generator-virtual') {
				// Inline the SourceMapGenerator class directly to avoid virtual-to-virtual import issues
				return `
// Stub implementation of SourceMapGenerator for NativeScript runtime
export class SourceMapGenerator {
  constructor(options) {
    this._file = options?.file;
    this._sourceRoot = options?.sourceRoot;
    this._sources = [];
    this._names = [];
    this._mappings = [];
  }
  addMapping(mapping) {}
  setSourceContent(sourceFile, content) {}
  toJSON() {
    return {
      version: 3,
      file: this._file || '',
      sourceRoot: this._sourceRoot || '',
      sources: this._sources,
      names: this._names,
      mappings: ''
    };
  }
  toString() {
    return JSON.stringify(this.toJSON());
  }
}
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
