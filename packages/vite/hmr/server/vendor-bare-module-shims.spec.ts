import { describe, it, expect } from 'vitest';
import { buildVueVendorShim, buildPiniaVendorShim } from './vendor-bare-module-shims.js';

// Regression for plan 001: the generated Vue shim must not reference an
// undeclared `vm` identifier. In strict-mode ESM, `v.createApp || (vm && ...)`
// throws `ReferenceError: vm is not defined` the moment `v.createApp` is falsy
// (the case the registry-miss fallback exists for), aborting the whole module.

function declaresIdentifier(code: string, name: string): boolean {
	return new RegExp(`\\b(?:const|let|var)\\s+${name}\\b`).test(code);
}

describe('buildVueVendorShim', () => {
	for (const pkg of ['vue', 'nativescript-vue'] as const) {
		describe(pkg, () => {
			const code = buildVueVendorShim(pkg);

			it('does not reference an undeclared `vm` identifier', () => {
				const usesVm = /\bvm\b/.test(code);
				// either `vm` is never used, or it is explicitly declared
				expect(usesVm ? declaresIdentifier(code, 'vm') : true).toBe(true);
			});

			it('resolves createApp / registerElement from the merged module `v`', () => {
				expect(code).toContain('export const createApp = v.createApp');
				expect(code).toContain('export const registerElement = v.registerElement');
			});
		});
	}
});

describe('buildPiniaVendorShim', () => {
	it('references no undeclared `vm` and exports from the resolved module `p`', () => {
		const code = buildPiniaVendorShim();
		expect(/\bvm\b/.test(code)).toBe(false);
		expect(code).toContain('export const createPinia = p.createPinia');
	});
});
