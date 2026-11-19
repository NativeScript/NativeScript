import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// NativeScript-safe automatic-JSX runtime shim (see shims/react-jsx-runtime.ts).
const jsxRuntimeShimPath = resolve(dirname(__dirname), 'shims', 'react-jsx-runtime.js');

// React for NativeScript renders through DOMiNATIVE via the
// `@nativescript-community/react` renderer (a react-reconciler host config that
// drives dominative's DOM — the React analog of `@nativescript-community/solid-js`).
// So, unlike the native-element `react-nativescript` path, there is NO
// `react-dom -> react-nativescript` aliasing here: the web markup renders as-is
// through dominative + masonkit, exactly like the Solid flavor.
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
			// CommonJS packages: pre-bundled so the device gets ESM named exports.
			// Every importer resolves an included package to its one pre-bundle,
			// so `react` stays a single instance (two would split the hooks dispatcher).
			include: ['react', 'react-reconciler'],
		},
	});
};
