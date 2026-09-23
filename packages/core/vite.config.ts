/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
	root: __dirname,
	cacheDir: '../../node_modules/.vite/packages/core',
	plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },
	resolve: {
		extensions: ['.ts', '.ios.ts'],
		alias: {
			// ‘~’ at import root → /absolute/path/to/src
			'~': fileURLToPath(new URL('./', import.meta.url)),
		},
	},
	test: {
		watch: false,
		globals: true,
		environment: 'node',
		// VITEST_NO_OPT=1 runs the worker interpreter-only, which is how iOS executes
		// (V8 jitless) and reads very differently in benchmarks. `--max-opt=0` is what
		// `--jitless` does to javascript, without also disabling the WebAssembly vite
		// needs; plain `--no-opt` only drops turbofan and measures almost nothing.
		pool: 'forks',
		execArgv: process.env['VITEST_NO_OPT'] ? ['--max-opt=0'] : [],
		setupFiles: ['vitest.setup.ts'],
		include: ['**/*.{test,spec}.{ts,mts}'],
		reporters: ['default'],
		coverage: {
			reportsDirectory: '../../coverage/packages/core',
			provider: 'v8',
		},
	},
});
