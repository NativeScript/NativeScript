import solid from 'vite-plugin-solid';
import path from 'path';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { findMonorepoWorkspaceRoot, getProjectRootPath } from '../helpers/project.js';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';
import { findSolidPackagesShippingJsx } from '../hmr/frameworks/solid/build/solid-jsx-deps.js';

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
	const projectRoot = getProjectRootPath();
	const monorepoRoot = findMonorepoWorkspaceRoot(projectRoot);
	// Any Solid library that ships `.jsx`/`.tsx` files in its published
	// output (e.g. `solid-navigation`'s `dist/src/*.jsx`) MUST bypass
	// Vite's depscanner. The depscanner concatenates the package into
	// `node_modules/.vite/deps/<pkg>.js` with the JSX preserved, then
	// `vite:import-analysis` hits the first JSX expression and aborts the
	// dev server with `Failed to parse source for import analysis…`. The
	// `vite-plugin-solid` `transform` hook only runs on ids ending in
	// `.jsx`/`.tsx`, so it never sees the pre-bundled `.js` to fix it.
	// Excluding these packages routes them through the normal serve
	// pipeline, where the original `.jsx` ids match the Solid plugin's
	// filter. See `hmr/frameworks/solid/build/solid-jsx-deps.ts` for the detection rules.
	const solidJsxPackages = findSolidPackagesShippingJsx(projectRoot, monorepoRoot);
	return mergeConfig(baseConfig({ mode, flavor: 'solid' }), {
		plugins: [...getTypeCheckPlugins('solid', options.typeCheck), ...plugins],
		optimizeDeps: {
			// Defense-in-depth: keep `module` / `node:module` out of the
			// depscanner's pre-bundle set even if a downstream config swaps
			// out the base `optimizeDeps.exclude`. The root rationale (and the
			// canonical exclude list) lives in `configuration/base.ts`; see
			// the comment above `optimizeDepsExclude` there for the full
			// css-tree → createRequire → HMR rewrite chain that necessitates
			// this. Vite's `mergeConfig` concatenates `exclude` arrays, so
			// duplicating these here is harmless.
			exclude: ['module', 'node:module', ...solidJsxPackages],
		},
	});
};
