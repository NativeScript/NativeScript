import { describe, expect, it } from 'vitest';
import { canonicalizeNsMAppImports } from './sfc-route-shared.js';

describe('canonicalizeNsMAppImports', () => {
	it('leaves canonical app-source static imports untouched', () => {
		const code = `import { b, c, dd } from "/ns/m/src/test2";`;
		expect(canonicalizeNsMAppImports(code)).toBe(code);
	});

	it('strips version tags from origin-prefixed, export-from, side-effect, and dynamic imports', () => {
		const code = ['import { a } from "http://localhost:5173/ns/m/__ns_hmr__/v7/src/test";', 'export * from "/ns/m/__ns_hmr__/v7/src/shared";', 'import "/ns/m/__ns_hmr__/v7/src/setup";', 'const m = await import("/ns/m/__ns_hmr__/v7/src/lazy");'].join('\n');
		const out = canonicalizeNsMAppImports(code);
		expect(out).toContain('"http://localhost:5173/ns/m/src/test"');
		expect(out).toContain('export * from "/ns/m/src/shared"');
		expect(out).toContain('import "/ns/m/src/setup"');
		expect(out).toContain('import("/ns/m/src/lazy")');
		expect(out).not.toContain('__ns_hmr__');
	});

	it('strips a stale version tag instead of preserving it', () => {
		const code = `import { b } from "/ns/m/__ns_hmr__/v2/src/test2";`;
		expect(canonicalizeNsMAppImports(code)).toBe(`import { b } from "/ns/m/src/test2";`);
	});

	it('leaves vendor imports untouched (stable module identity)', () => {
		const vendor = `import vue from "/ns/m/node_modules/nativescript-vue/dist/index.js";`;
		expect(canonicalizeNsMAppImports(vendor)).toBe(vendor);
	});

	it('leaves non-/ns/m imports untouched', () => {
		const code = `import { onMounted } from "/ns/rt";\nimport Comp from "/ns/asm/3?path=%2Fsrc%2FDetails.vue";`;
		expect(canonicalizeNsMAppImports(code)).toBe(code);
	});
});
