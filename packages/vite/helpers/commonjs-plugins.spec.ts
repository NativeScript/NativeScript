import { describe, expect, it } from 'vitest';

import { getSourceMapJsCompatSubpath, transformSourceMapJsCompatModule } from './commonjs-plugins.js';

describe('source-map-js compat', () => {
	it('detects source-map-js module ids across bare, node_modules, and resolved file paths', () => {
		expect(getSourceMapJsCompatSubpath('source-map-js')).toBe('source-map.js');
		expect(getSourceMapJsCompatSubpath('source-map-js/lib/source-map-generator.js')).toBe('lib/source-map-generator.js');
		expect(getSourceMapJsCompatSubpath('/workspace/node_modules/source-map-js/lib/source-map-generator.js?import')).toBe('lib/source-map-generator.js');
	});

	it('rewrites the package entry to explicit subpath imports with synthesized exports', () => {
		const source = ["exports.SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;", "exports.SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;", "exports.SourceNode = require('./lib/source-node').SourceNode;"].join('\n');

		const output = transformSourceMapJsCompatModule(source, 'source-map-js');

		expect(output).toContain('import __ns_source_map_js_req_0 from "source-map-js/lib/source-map-generator.js";');
		expect(output).toContain('import __ns_source_map_js_req_1 from "source-map-js/lib/source-map-consumer.js";');
		expect(output).toContain('import __ns_source_map_js_req_2 from "source-map-js/lib/source-node.js";');
		expect(output).toContain('exports.SourceMapGenerator = __ns_source_map_js_req_0.SourceMapGenerator;');
		expect(output).toContain('exports.SourceMapConsumer = __ns_source_map_js_req_1.SourceMapConsumer;');
		expect(output).toContain('exports.SourceNode = __ns_source_map_js_req_2.SourceNode;');
		expect(output).toContain('export default __cjs_mod;');
		expect(output).toContain('__cjs_export_0 as SourceMapGenerator');
		expect(output).toContain('__cjs_export_1 as SourceMapConsumer');
		expect(output).toContain('__cjs_export_2 as SourceNode');
	});

	it('rewrites lib modules with relative requires into explicit ESM imports', () => {
		const source = ["var util = require('./util');", "var ArraySet = require('./array-set').ArraySet;", 'function SourceMapGenerator() { return ArraySet && util; }', 'exports.SourceMapGenerator = SourceMapGenerator;'].join('\n');

		const output = transformSourceMapJsCompatModule(source, '/workspace/node_modules/source-map-js/lib/source-map-generator.js');

		expect(output).toContain('source-map-js/lib/util.js');
		expect(output).toContain('source-map-js/lib/array-set.js');
		expect(output).toContain('var util = __ns_source_map_js_req_');
		expect(output).toContain('var ArraySet = __ns_source_map_js_req_');
		expect(output).toContain('exports.SourceMapGenerator = SourceMapGenerator;');
		expect(output).toContain('export default __cjs_mod;');
		expect(output).toContain('as SourceMapGenerator');
	});

	it('leaves unrelated modules unchanged', () => {
		const source = 'export const value = 1;\n';

		expect(transformSourceMapJsCompatModule(source, '/workspace/src/example.ts')).toBe(source);
	});
});
