import { describe, expect, it } from 'vitest';

import { classifyServedModule, classifyServedRequest, hasEsmDefaultExport } from './websocket-served-module-helpers.js';

describe('classifyServedRequest', () => {
	it('treats a package request as library code when its resolved id is a symlink target outside node_modules', () => {
		// `file:` / `npm link` packages resolve to their real path, which has no
		// node_modules segment; the request spec still identifies a vendor package.
		expect(classifyServedRequest('/node_modules/nativescript-vue', '/Users/dev/nativescript-vue/dist/index.js')).toBe('library');
		expect(classifyServedRequest('/node_modules/nativescript-vue/dist/renderer/index.js', '/Users/dev/nativescript-vue/dist/renderer/index.js')).toBe('library');
	});

	it('keeps library classification when only the resolved id is under node_modules', () => {
		expect(classifyServedRequest('/src/app.ts', '/proj/node_modules/some-pkg/index.js')).toBe('library');
	});

	it('classifies app sources as app', () => {
		expect(classifyServedRequest('/src/components/Home.vue', '/proj/src/components/Home.vue')).toBe('app');
		expect(classifyServedRequest('/src/app.ts', null)).toBe('app');
	});

	it('falls back to the spec when nothing resolved', () => {
		expect(classifyServedRequest('/node_modules/pkg/index.js', null)).toBe('library');
		expect(classifyServedModule('/node_modules/pkg/index.js')).toBe('library');
	});
});

describe('hasEsmDefaultExport', () => {
	it.each([
		['export default 17;', true],
		['const named = 23; export { named as default };', true],
		['export { default } from "./base.mjs";', true],
		['export * as default from "./base.mjs";', true],
		['export const named = 99;', false],
		['export * from "./base.mjs";', false],
		['// export default 17;\nexport const text = "export default 17";', false],
		['export { type Value as default } from "./types";', false],
		['module.exports = 17;', false],
	])('%s → %s', (code, expected) => {
		expect(hasEsmDefaultExport(code)).toBe(expected);
	});

	it('returns null for unparseable code', () => {
		expect(hasEsmDefaultExport('export default (;')).toBeNull();
	});
});

import { collectTopLevelImportRecords } from './websocket-served-module-helpers.js';
import { ensureNativeScriptModuleBindings } from './websocket-module-bindings.js';

describe('collectTopLevelImportRecords (Oxc parseAst path)', () => {
	it('collects default, named, and string-named specifiers', () => {
		const code = `import def, { a, b as c, "d-e" as f } from "pkg";`;
		const records = collectTopLevelImportRecords(code);
		expect(records).toHaveLength(1);
		expect(records[0].source).toBe('pkg');
		expect(records[0].text).toBe(code);
		expect(records[0].start).toBe(0);
		expect(records[0].end).toBe(code.length);
		expect(records[0].hasOnlyNamedSpecifiers).toBe(false);
		expect(records[0].namedBindings).toEqual([
			{ importedName: 'a', text: 'a' },
			{ importedName: 'b', text: 'b as c' },
			{ importedName: 'd-e', text: '"d-e" as f' },
		]);
	});

	it('marks named-only specifier lists and exact text after non-ASCII content', () => {
		const code = `const s = "héllo→";\nimport { x } from "m";`;
		const records = collectTopLevelImportRecords(code);
		expect(records).toHaveLength(1);
		expect(records[0].text).toBe(`import { x } from "m";`);
		expect(records[0].hasOnlyNamedSpecifiers).toBe(true);
	});

	it('collects import type declarations', () => {
		const records = collectTopLevelImportRecords(`import type { T } from "./t";`);
		expect(records).toHaveLength(1);
		expect(records[0].source).toBe('./t');
	});

	it('handles TS+JSX input', () => {
		const code = `import { render } from "x";\ninterface P { a: number }\nconst el = <div a={1} />;\nrender(el);\n`;
		const records = collectTopLevelImportRecords(code);
		expect(records).toHaveLength(1);
		expect(records[0].source).toBe('x');
	});

	it('returns [] for code with no imports', () => {
		expect(collectTopLevelImportRecords(`const a = 1;\nexport { a };`)).toEqual([]);
	});

	it('parses a long minified line full of block comments without Babel quadratic scan', () => {
		// Babel's skipBlockComment rescans to the next line break per comment;
		// 12000 comments over a ~20MB single line is ~10s through the old path.
		// Measured on this machine: Babel 10.32s, Oxc 0.047s.
		const code = `import {a} from "m";\n` + '/*#__PURE__*/'.repeat(12000) + 'const s="' + 'x'.repeat(20 * 1000 * 1000) + '";';
		const t0 = performance.now();
		const records = collectTopLevelImportRecords(code);
		const ms = performance.now() - t0;
		expect(records).toHaveLength(1);
		expect(records[0].source).toBe('m');
		expect(ms).toBeLessThan(2000);
	}, 30000);
});

describe('ensureNativeScriptModuleBindings via Oxc import records', () => {
	it('still rewrites a vendor plugin import', () => {
		const input = `import { defineStore } from "pinia";\nexport const useServices = defineStore('services', () => ({}));\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).not.toMatch(/from\s+["']pinia["']/);
		expect(out).toContain('globalThis.__nsVendorRegistry');
	});
});

import { collectStaticImportDefaultIntents } from './websocket-served-module-helpers.js';

describe('collectStaticImportDefaultIntents (Oxc parseAst path)', () => {
	it('reports default/named/namespace mixes', () => {
		const code = `import def, { a } from "x";\nimport { b } from "y";\nimport * as ns from "z";\nimport type { T } from "./t";`;
		expect(collectStaticImportDefaultIntents(code)).toEqual([
			{ src: 'x', wantsDefault: true },
			{ src: 'y', wantsDefault: false },
			{ src: 'z', wantsDefault: false },
			{ src: './t', wantsDefault: false },
		]);
	});

	it('handles the long-line comment payload fast', () => {
		const code = `import {a} from "m";\n` + '/*#__PURE__*/'.repeat(12000) + 'const s="' + 'x'.repeat(20 * 1000 * 1000) + '";';
		const t0 = performance.now();
		expect(collectStaticImportDefaultIntents(code)).toEqual([{ src: 'm', wantsDefault: false }]);
		expect(performance.now() - t0).toBeLessThan(2000);
	}, 30000);
});
