import { describe, expect, it, vi } from 'vitest';

vi.mock('@analogjs/vite-plugin-angular', () => ({
	default: vi.fn(() => []),
}));

vi.mock('../helpers/cli-flags.js', () => ({
	getCliFlags: vi.fn(() => ({})),
}));

vi.mock('./base.js', () => ({
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

import { angularConfig } from './angular.js';
import angular from '@analogjs/vite-plugin-angular';

const angularPluginFactory = vi.mocked(angular);

describe('angularConfig non-HMR development output', () => {
	it('never enables the Angular compilation API', () => {
		for (const mode of ['development', 'production']) {
			angularPluginFactory.mockClear();

			angularConfig({ mode });

			expect(angularPluginFactory).toHaveBeenCalledWith(
				expect.objectContaining({
					experimental: {
						useAngularCompilationAPI: false,
					},
				}),
			);
		}
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

describe('angularConfig optimizeDeps', () => {
	it('leaves the dev dependency policy to the base config', () => {
		const config = angularConfig({ mode: 'development' });
		expect(config.optimizeDeps).toBeUndefined();
		expect((config.plugins ?? []).flat().map((p: any) => p?.name)).not.toContain('ns-disable-optimize-deps');
	});
});
