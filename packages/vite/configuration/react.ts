import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// NativeScript-safe automatic-JSX runtime shim (see shims/react-jsx-runtime.ts).
// react/jsx-runtime + react/jsx-dev-runtime are CJS modules whose named exports
// the dev server's raw `/ns/m` serving can't statically detect, so the device
// fails with "does not provide an export named 'jsx'". The shim reimplements the
// runtime on React.createElement and exposes explicit named exports.
const jsxRuntimeShimPath = resolve(dirname(__dirname), 'shims', 'react-jsx-runtime.js');

// React for NativeScript renders through DOMiNATIVE via the
// `@nativescript-community/react` renderer (a react-reconciler host config that
// drives dominative's DOM — the React analog of `@nativescript-community/solid-js`).
// So, unlike the native-element `react-nativescript` path, there is NO
// `react-dom -> react-nativescript` aliasing here: the web markup renders as-is
// through dominative + masonkit, exactly like the Solid flavor.
//
// `react` must resolve as a single instance (see the `case 'react'` note in
// base.ts → `disableOptimizeDeps`): two copies would split the hooks dispatcher
// and silently break hooks/context.
export const reactConfig = ({ mode }, options: TypeCheckControlOptions = {}): UserConfig => {
	return mergeConfig(baseConfig({ mode, flavor: 'react' }), {
		plugins: [
			...getTypeCheckPlugins('react', options.typeCheck),
			{
				...alias({
					entries: {
						// Automatic JSX runtime → NS-safe shim (must come before any
						// broad `react` entry so it isn't prefix-matched away).
						'react/jsx-runtime': jsxRuntimeShimPath,
						'react/jsx-dev-runtime': jsxRuntimeShimPath,
					},
				}),
				enforce: 'pre' as const,
			},
		],
		esbuild: {
			jsx: 'automatic',
			jsxImportSource: 'react',
		},
		optimizeDeps: {
			// `module` / `node:module` are aliased to local polyfills (see base.ts);
			// keep them out of the depscanner. Also exclude the renderer entry so the
			// device's `/ns/m` loader resolves it through normal resolution rather
			// than a pre-bundle URL that the package `exports` map can't serve there
			// (mirrors Solid excluding `@nativescript/vite/solid-bootstrap`).
			exclude: ['module', 'node:module', '@nativescript-community/react'],
		},
	});
};
