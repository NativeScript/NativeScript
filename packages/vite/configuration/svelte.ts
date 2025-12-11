import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import alias from '@rollup/plugin-alias';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const svelteConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode, flavor: 'svelte' }), {
		// Ensure "svelte" export condition is honored for Svelte-native packages
		resolve: {
			conditions: ['svelte', 'module', 'react-native', 'import', 'browser', 'default'],
		},
		plugins: [
			{
				// Keep behavior consistent with other framework configs (React/Vue)
				...alias({
					entries: {
						// Ensure set-value always resolves to our shim
						'set-value': resolve(__dirname, '../shims/set-value.js'),
					},
				}),
				enforce: 'pre',
			},
			// Standard Svelte Vite plugin; picks up svelte.config.js from the app root
			svelte(),
		],
	});
};
