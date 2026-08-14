import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: ['packages/core/vite.config.ts', 'packages/vite/vitest.config.ts'],
	},
});
