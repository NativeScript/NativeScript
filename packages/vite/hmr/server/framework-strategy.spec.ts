import { describe, expect, it } from 'vitest';
import { getBuiltInServerStrategy } from './framework-strategy.js';

describe('built-in server strategies', () => {
	it('exists for every built-in flavor', () => {
		for (const flavor of ['angular', 'vue', 'solid', 'react', 'typescript', 'javascript']) {
			expect(getBuiltInServerStrategy(flavor)?.flavor).toBe(flavor);
		}
		expect(getBuiltInServerStrategy('unknown')).toBeUndefined();
	});

	it('adds framework import-map specifiers for Vue and Solid', () => {
		expect(getBuiltInServerStrategy('vue')?.importMapSpecifiers?.()).toEqual(['nativescript-vue', 'vue']);
		expect(getBuiltInServerStrategy('solid')?.importMapSpecifiers?.()).toEqual(['solid-js']);
		expect(getBuiltInServerStrategy('angular')?.importMapSpecifiers).toBeUndefined();
	});

	it("keeps Angular's /@ng/component query as identity and re-fetches it on every import", () => {
		const angular = getBuiltInServerStrategy('angular');
		expect(angular?.preserveQueryPaths?.()).toEqual(['/@ng/component']);
		expect(angular?.volatilePatterns?.()).toEqual(['/@ng/component']);
		expect(getBuiltInServerStrategy('vue')?.preserveQueryPaths).toBeUndefined();
	});
});
