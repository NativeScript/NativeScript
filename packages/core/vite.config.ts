/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

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
	},
	test: {
		watch: false,
		globals: true,
		environment: 'node',
		setupFiles: ['vitest.setup.ts'],
		include: ['**/*.{test,spec}.{ts,mts}'],
		reporters: ['default'],
		coverage: {
			reportsDirectory: '../../coverage/packages/core',
			provider: 'v8',
		},
	},
});
