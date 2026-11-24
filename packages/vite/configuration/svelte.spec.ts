import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
	svelteVersion: '5.59.0' as string | null,
	cliFlags: {} as Record<string, string | boolean>,
	platform: 'ios' as string | undefined,
	baseFlavors: [] as string[],
}));

// baseConfig resolves @nativescript/core from disk; only the Svelte layer is under test
vi.mock('./base.js', () => ({
	baseConfig: ({ flavor }: { flavor: string }) => {
		state.baseFlavors.push(flavor);
		return { resolve: { conditions: ['module', 'browser', 'default'], extensions: ['.ios.ts', '.ts', '.mjs', '.json'] } };
	},
}));
vi.mock('../helpers/cli-flags.js', () => ({
	getCliFlags: () => state.cliFlags,
	resolvePlatform: () => state.platform,
}));
vi.mock('../helpers/svelte-version.js', async (importOriginal) => ({
	...(await importOriginal<typeof import('../helpers/svelte-version.js')>()),
	getProjectSvelteVersion: () => state.svelteVersion,
}));

import { svelteConfig } from './svelte.js';
import { registerFrameworkFlavor } from '../hmr/framework-flavors.js';

beforeEach(() => {
	state.svelteVersion = '5.59.0';
	state.cliFlags = {};
	state.platform = 'ios';
	state.baseFlavors = [];
});

describe('svelteConfig', () => {
	it('declares the svelte flavor and adds vite-plugin-svelte', () => {
		const config = svelteConfig({ mode: 'production' });
		expect(state.baseFlavors).toEqual(['svelte']);
		const pluginNames = (config.plugins ?? []).flat().map((p: any) => p?.name);
		expect(pluginNames).toContain('vite-plugin-svelte');
	});

	it('resolves Svelte 5 to its client runtime on top of the base conditions', () => {
		const config = svelteConfig({ mode: 'production' });
		expect(config.resolve?.conditions).toEqual(['module', 'browser', 'default', 'svelte-custom-renderer', 'svelte', 'development|production']);
	});

	it('appends platform-specific .svelte extensions after the base ones', () => {
		expect(svelteConfig({ mode: 'production' }).resolve?.extensions).toEqual(['.ios.ts', '.ts', '.mjs', '.json', '.ios.svelte', '.svelte']);
		state.platform = 'android';
		expect(svelteConfig({ mode: 'production' }).resolve?.extensions?.slice(-2)).toEqual(['.android.svelte', '.svelte']);
		state.platform = 'visionos';
		expect(svelteConfig({ mode: 'production' }).resolve?.extensions?.slice(-2)).toEqual(['.ios.svelte', '.svelte']);
	});

	it('rejects Svelte 4 with a pointer to @nativescript/webpack', () => {
		state.svelteVersion = '4.2.19';
		expect(() => svelteConfig({ mode: 'production' })).toThrow(/requires Svelte 5 \(found svelte@4\.2\.19\).*@nativescript\/webpack/);
		expect(state.baseFlavors).toEqual([]);
	});

	it('fails clearly when svelte is not installed', () => {
		state.svelteVersion = null;
		expect(() => svelteConfig({ mode: 'production' })).toThrow(/`svelte` package is not installed/);
	});

	it('allows a development build without HMR', () => {
		expect(() => svelteConfig({ mode: 'development' })).not.toThrow();
	});

	it('asks for --no-hmr when HMR is requested and no svelte flavor is registered', () => {
		state.cliFlags = { hmr: true };
		expect(() => svelteConfig({ mode: 'development' })).toThrow(/--no-hmr/);
	});

	// Registration is global and permanent, so this case runs last.
	it('defers to a registered svelte flavor for HMR', () => {
		registerFrameworkFlavor({
			flavor: 'svelte',
			server: { flavor: 'svelte', matchesFile: () => false, processFile: async () => {}, buildRegistry: async () => {} } as any,
			client: '@example/svelte-hmr/client',
		});
		state.cliFlags = { hmr: true };
		expect(() => svelteConfig({ mode: 'development' })).not.toThrow();
	});
});
