import fs from 'node:fs';
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

	it('gives TypeScript and JavaScript the core reboot module as their entry boundary', () => {
		for (const flavor of ['typescript', 'javascript']) {
			expect(getBuiltInServerStrategy(flavor)?.entryBoundary).toEqual({ module: '@nativescript/vite/hmr/frameworks/core/client/reboot.js', dispose: 'prepareHmrReboot', settled: 'whenHmrRebootSettled' });
		}
		expect(getBuiltInServerStrategy('react')?.entryBoundary).toBeUndefined();
	});

	it('gives Vue its own reboot module as the entry boundary', () => {
		expect(getBuiltInServerStrategy('vue')?.entryBoundary).toEqual({ module: '@nativescript/vite/hmr/frameworks/vue/client/reboot.js', dispose: 'prepareHmrReboot', settled: 'whenHmrRebootSettled' });
	});

	it('names entry boundary modules the package exports', () => {
		const exportsMap = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).exports;
		for (const flavor of ['typescript', 'vue']) {
			const subpath = getBuiltInServerStrategy(flavor)!.entryBoundary!.module.replace('@nativescript/vite/', './');
			expect(exportsMap[subpath]).toBe(subpath);
			expect(fs.existsSync(new URL(subpath.replace(/\.js$/, '.ts'), new URL('../../', import.meta.url)))).toBe(true);
		}
	});

	it("keeps Angular's /@ng/component query as identity and re-fetches it on every import", () => {
		const angular = getBuiltInServerStrategy('angular');
		expect(angular?.preserveQueryPaths?.()).toEqual(['/@ng/component']);
		expect(angular?.volatilePatterns?.()).toEqual(['/@ng/component']);
		expect(getBuiltInServerStrategy('vue')?.preserveQueryPaths).toBeUndefined();
	});
});
