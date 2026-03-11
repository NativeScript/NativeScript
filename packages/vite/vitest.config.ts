import { defineConfig } from 'vitest/config';

export default defineConfig({
	root: import.meta.dirname,
	test: {
		environment: 'node',
		include: ['**/*.spec.ts'],
		globals: false,
		reporters: 'default',
		watch: false,
	},
});
