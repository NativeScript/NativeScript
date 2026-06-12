import { describe, expect, it } from 'vitest';
import { ensureVersionedNsMAppImports } from './sfc-route-shared.js';

describe('ensureVersionedNsMAppImports', () => {
	it('versions app-source static imports (the repro: SFC artifact importing test2)', () => {
		const code = `import { b, c, dd } from "/ns/m/src/test2";`;
		expect(ensureVersionedNsMAppImports(code, 3)).toBe(`import { b, c, dd } from "/ns/m/__ns_hmr__/v3/src/test2";`);
	});

	it('versions origin-prefixed, export-from, side-effect, and dynamic imports', () => {
		const code = ['import { a } from "http://localhost:5173/ns/m/src/test";', 'export * from "/ns/m/src/shared";', 'import "/ns/m/src/setup";', 'const m = await import("/ns/m/src/lazy");'].join('\n');
		const out = ensureVersionedNsMAppImports(code, 7);
		expect(out).toContain('"http://localhost:5173/ns/m/__ns_hmr__/v7/src/test"');
		expect(out).toContain('export * from "/ns/m/__ns_hmr__/v7/src/shared"');
		expect(out).toContain('import "/ns/m/__ns_hmr__/v7/src/setup"');
		expect(out).toContain('import("/ns/m/__ns_hmr__/v7/src/lazy")');
	});

	it('replaces a stale version tag instead of stacking a second one', () => {
		const code = `import { b } from "/ns/m/__ns_hmr__/v2/src/test2";`;
		expect(ensureVersionedNsMAppImports(code, 3)).toBe(`import { b } from "/ns/m/__ns_hmr__/v3/src/test2";`);
	});

	it('leaves vendor and boot-tagged imports untouched (stable module identity)', () => {
		const vendor = `import vue from "/ns/m/node_modules/nativescript-vue/dist/index.js";`;
		const boot = `import "/ns/m/__ns_boot__/b1/src/app";`;
		expect(ensureVersionedNsMAppImports(vendor, 5)).toBe(vendor);
		expect(ensureVersionedNsMAppImports(boot, 5)).toBe(boot);
	});

	it('leaves non-/ns/m imports and invalid versions untouched', () => {
		const code = `import { onMounted } from "/ns/rt";\nimport Comp from "/ns/asm/3?path=%2Fsrc%2FDetails.vue";`;
		expect(ensureVersionedNsMAppImports(code, 4)).toBe(code);
		const nsm = `import { b } from "/ns/m/src/test2";`;
		expect(ensureVersionedNsMAppImports(nsm, NaN)).toBe(nsm);
	});
});
