import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getCliFlags, resolvePlatform } from '../helpers/cli-flags.js';
import { getMajorVersion, getProjectSvelteVersion } from '../helpers/svelte-version.js';
import { getFrameworkFlavor } from '../hmr/framework-flavors.js';

// Svelte 5 serves its server runtime unless a client condition matches.
// esm-env reads `process.env` at runtime without development/production.
const SVELTE_5_CONDITIONS = ['svelte-custom-renderer', 'svelte', 'development|production'];

function assertSupportedSvelte(): void {
	const version = getProjectSvelteVersion();
	if (!version) {
		throw new Error('[@nativescript/vite] svelteConfig: the `svelte` package is not installed in this project.');
	}
	const major = getMajorVersion(version);
	if (major === null || major < 5) {
		throw new Error(`[@nativescript/vite] svelteConfig requires Svelte 5 (found svelte@${version}). Svelte 4 under Vite needs @sveltejs/vite-plugin-svelte 3, which supports only Vite 5; keep Svelte 4 projects on @nativescript/webpack.`);
	}
}

function assertHmrSupported(mode: string): void {
	if (mode !== 'development' || !getCliFlags().hmr || getFrameworkFlavor('svelte')) {
		return;
	}
	throw new Error('[@nativescript/vite] svelteConfig: HMR is not supported for Svelte yet. Run with --no-hmr (e.g. `ns run ios --no-hmr`).');
}

function svelteExtensions(): string[] {
	const platform = resolvePlatform();
	const suffix = platform === 'visionos' ? 'ios' : platform;
	return suffix ? [`.${suffix}.svelte`, '.svelte'] : ['.svelte'];
}

/**
 * Vite config for Svelte 5 apps (e.g. `@nativescript-community/svelte-native` 5+).
 * Compiler options and preprocessors come from the project's `svelte.config.js`.
 * @param env Vite config env; `mode` selects development or production.
 * @returns The merged Vite user config.
 */
export const svelteConfig = ({ mode }: { mode: string }): UserConfig => {
	assertSupportedSvelte();
	assertHmrSupported(mode);

	return mergeConfig(baseConfig({ mode, flavor: 'svelte' }), {
		resolve: {
			conditions: SVELTE_5_CONDITIONS,
			extensions: svelteExtensions(),
		},
		plugins: [svelte()],
	});
};
