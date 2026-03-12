import solid from 'vite-plugin-solid';
import path from 'path';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getProjectRootPath } from '../helpers/project.js';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = getProjectRootPath();
const solidPath = path.resolve(projectRoot, 'node_modules/solid-js');

const prod = !!process.env.production;

const plugins = [
	{
		...alias({
			entries: {
				// Fix the web alias - it should NOT point to web/dist but to the main dist
				'solid-js/web': resolve(solidPath, `web/dist/${prod ? 'web' : 'dev'}.js`),
				// Alias solid-js modules to proper locations
				'solid-js/universal': resolve(solidPath, `universal/dist/${prod ? 'universal' : 'dev'}.js`),
				'solid-js/store': resolve(solidPath, `store/dist/${prod ? 'store' : 'dev'}.js`),
				'solid-js': resolve(solidPath, `dist/${prod ? 'solid' : 'dev'}.js`),
			},
		}),
		enforce: 'pre',
	},
	// Enable SolidJS support with NativeScript configuration
	solid({
		// Configure for development
		dev: !prod,
		// Enable HMR for development
		hot: !prod,
		// Configure solid compiler options for NativeScript
		solid: {
			// Use universal instead of dom for NativeScript compatibility
			generate: 'universal',
			hydratable: false,
			// Use the NativeScript community SolidJS renderer
			moduleName: '@nativescript-community/solid-js',
		},
	}),
];

export const solidConfig = ({ mode }): UserConfig => {
	return mergeConfig(baseConfig({ mode }), {
		plugins,
	});
};
