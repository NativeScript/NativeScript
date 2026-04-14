import { describe, expect, it, vi } from 'vitest';

vi.mock('@analogjs/vite-plugin-angular', () => ({
	default: vi.fn(() => []),
}));

vi.mock('../helpers/angular/angular-linker.js', () => ({
	angularLinkerVitePlugin: vi.fn(() => ({ name: 'mock-angular-linker-pre' })),
	angularLinkerVitePluginPost: vi.fn(() => ({ name: 'mock-angular-linker-post' })),
}));

vi.mock('../helpers/cli-flags.js', () => ({
	getCliFlags: vi.fn(() => ({})),
}));

vi.mock('../configuration/base.js', () => ({
	baseConfig: vi.fn(() => ({
		build: {
			rolldownOptions: {
				output: {
					manualChunks: () => 'vendor',
					chunkFileNames: '[name]-[hash].mjs',
				},
			},
		},
	})),
}));

import { angularConfig } from '../configuration/angular.js';
import angular from '@analogjs/vite-plugin-angular';

const angularPluginFactory = vi.mocked(angular);

describe('angularConfig non-HMR development output', () => {
	it('enables the Angular compilation API for development no-HMR builds', () => {
		angularPluginFactory.mockClear();

		angularConfig({ mode: 'development' });

		expect(angularPluginFactory).toHaveBeenCalledWith(
			expect.objectContaining({
				experimental: {
					useAngularCompilationAPI: true,
				},
			}),
		);
	});

	it('keeps the Angular compilation API disabled outside development no-HMR mode', () => {
		angularPluginFactory.mockClear();

		angularConfig({ mode: 'production' });

		expect(angularPluginFactory).toHaveBeenCalledWith(
			expect.objectContaining({
				experimental: {
					useAngularCompilationAPI: false,
				},
			}),
		);
	});

	it('disables chunk splitting for development rebuilds', () => {
		const config = angularConfig({ mode: 'development' });
		const output = (config.build as any).rolldownOptions.output;

		expect(output.codeSplitting).toBe(false);
		expect('manualChunks' in output).toBe(false);
		expect('chunkFileNames' in output).toBe(false);
	});

	it('keeps the base chunking strategy outside development no-HMR mode', () => {
		const config = angularConfig({ mode: 'production' });
		const output = (config.build as any).rolldownOptions.output;

		expect(output.codeSplitting).toBeUndefined();
		expect(typeof output.manualChunks).toBe('function');
		expect(output.chunkFileNames).toBe('[name]-[hash].mjs');
	});
});
