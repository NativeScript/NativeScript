import { describe, expect, it, vi } from 'vitest';

// parseAst (Oxc) rejected → the Babel fallback must produce identical records.
vi.mock('vite', async (importOriginal) => {
	const original = await importOriginal<typeof import('vite')>();
	return {
		...original,
		parseAst: () => {
			throw new Error('simulated Oxc parse failure');
		},
	};
});

const { collectTopLevelImportRecords } = await import('./websocket-served-module-helpers.js');
const { ensureNativeScriptModuleBindings } = await import('./websocket-module-bindings.js');

describe('collectTopLevelImportRecords (Babel fallback)', () => {
	it('produces the same records when parseAst throws', () => {
		const code = `const s = "héllo→";\nimport def, { a, b as c, "d-e" as f } from "pkg";\nimport type { T } from "./t";`;
		const records = collectTopLevelImportRecords(code);
		expect(records).toHaveLength(2);
		expect(records[0].source).toBe('pkg');
		expect(records[0].text).toBe(`import def, { a, b as c, "d-e" as f } from "pkg";`);
		expect(records[0].hasOnlyNamedSpecifiers).toBe(false);
		expect(records[0].namedBindings).toEqual([
			{ importedName: 'a', text: 'a' },
			{ importedName: 'b', text: 'b as c' },
			{ importedName: 'd-e', text: '"d-e" as f' },
		]);
		expect(records[1].source).toBe('./t');
	});

	it('still rewrites a vendor plugin import through the Babel fallback', () => {
		const input = `import { defineStore } from "pinia";\nexport const useServices = defineStore('services', () => ({}));\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).not.toMatch(/from\s+["']pinia["']/);
		expect(out).toContain('globalThis.__nsVendorRegistry');
	});
});

const { collectStaticImportDefaultIntents } = await import('./websocket-served-module-helpers.js');

describe('collectStaticImportDefaultIntents (Babel fallback)', () => {
	it('produces the same intents when parseAst throws', () => {
		const code = `import def, { a } from "x";\nimport { b } from "y";\nimport type { T } from "./t";`;
		expect(collectStaticImportDefaultIntents(code)).toEqual([
			{ src: 'x', wantsDefault: true },
			{ src: 'y', wantsDefault: false },
			{ src: './t', wantsDefault: false },
		]);
	});
});
