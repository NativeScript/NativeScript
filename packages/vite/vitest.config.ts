import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['./**/*.spec.ts'],
		globals: false,
		reporters: 'default',
		watch: false,
	},
});
