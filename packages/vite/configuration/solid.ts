import solid from 'vite-plugin-solid';
import path from 'path';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getProjectRootPath } from '../helpers/project.js';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = getProjectRootPath();
const solidPath = path.resolve(projectRoot, 'node_modules/solid-js');

const prod = !!process.env.production;

// Built-in JSX runtime shim — maps automatic JSX transform's jsx() to
// Solid's createComponent() without pulling in the web renderer (solid-js/h).
const jsxRuntimeShimPath = resolve(dirname(__dirname), 'shims', 'solid-jsx-runtime.js');

const plugins = [
	{
		...alias({
			entries: {
				// Fix the web alias - it should NOT point to web/dist but to the main dist
				'solid-js/web': resolve(solidPath, `web/dist/${prod ? 'web' : 'dev'}.js`),
				// Alias solid-js modules to proper locations
				'solid-js/universal': resolve(solidPath, `universal/dist/${prod ? 'universal' : 'dev'}.js`),
				'solid-js/store': resolve(solidPath, `store/dist/${prod ? 'store' : 'dev'}.js`),
				// Automatic JSX transform runtime — must come before the catch-all
				// 'solid-js' entry to avoid prefix-matching to solid-js/dist/dev.js
				'solid-js/jsx-runtime': jsxRuntimeShimPath,
				'solid-js/jsx-dev-runtime': jsxRuntimeShimPath,
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

export const solidConfig = ({ mode }, options: TypeCheckControlOptions = {}): UserConfig => {
	return mergeConfig(baseConfig({ mode, flavor: 'solid' }), {
		plugins: [...getTypeCheckPlugins('solid', options.typeCheck), ...plugins],
		optimizeDeps: {
			// Solid HMR-only quirk: NS apps that load `@nativescript/core` end up
			// pulling `css-tree`, whose `data-patch.js` does
			// `import { createRequire } from 'module';`. The base config aliases
			// the bare `'module'` specifier to a polyfill that exports
			// `createRequire`, but if Vite's depscanner ALSO discovers it
			// (because Solid keeps optimizeDeps enabled), Vite pre-bundles the
			// polyfill at `/node_modules/.vite/deps/module.js` and rewrites the
			// import to point there. The HMR /ns/m/ pipeline's
			// `rewriteVitePrebundleImportsForDevice` then can't map that
			// pre-bundled URL back to a known bare specifier (because `module`
			// isn't a real package), and SILENTLY DROPS the entire import
			// statement — leaving `createRequire` undefined at runtime. The
			// Angular config disables optimizeDeps wholesale so it never sees
			// this; Solid keeps optimizeDeps active for `solid-js` etc., so we
			// surgically exclude `module` (and `node:module`) here. With both
			// excluded, the alias resolves the import directly to the polyfill
			// file and the HMR pipeline leaves it intact.
			exclude: ['module', 'node:module'],
		},
	});
};
