import { describe, expect, it, vi } from 'vitest';

// baseConfig resolves @nativescript/core from disk; only the Vue layer is under test
vi.mock('./base.js', () => ({ baseConfig: () => ({}) }));

import { vueConfig } from './vue.js';

describe('vueConfig', () => {
	it('aliases vue to nativescript-vue through resolve.alias rather than a rollup alias plugin', () => {
		// Under rolldown, @rollup/plugin-alias resolved the bare replacement to
		// the package directory and every SFC's injected `from "vue"` failed.
		const config = vueConfig({ mode: 'production' });
		const aliases = config.resolve?.alias as Array<{ find: string | RegExp; replacement: string }>;
		expect(Array.isArray(aliases)).toBe(true);
		expect(aliases).toContainEqual({ find: 'vue', replacement: 'nativescript-vue' });
		const pluginNames = (config.plugins ?? []).flat().map((p: any) => p?.name);
		expect(pluginNames).not.toContain('alias');
	});
});
