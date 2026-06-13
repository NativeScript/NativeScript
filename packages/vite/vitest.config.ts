import { defineConfig } from 'vitest/config';

export default defineConfig({
	root: import.meta.dirname,
	test: {
		environment: 'node',
		include: ['**/*.spec.ts'],
		globals: false,
		reporters: 'default',
		watch: false,
		coverage: {
			provider: 'v8',
			reportsDirectory: '../../coverage/packages/vite',
			reporter: ['text-summary', 'html'],
			include: ['configuration/**', 'helpers/**', 'hmr/**', 'polyfills/**', 'runtime/**', 'shims/**', 'transformers/**', 'index.ts'],
			exclude: ['**/*.spec.ts', '**/__tests__/**', 'dist/**', '**/*.d.ts'],
		},
	},
});
