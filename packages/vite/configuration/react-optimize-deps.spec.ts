import { describe, expect, it, vi } from 'vitest';

vi.mock('./base.js', () => ({ baseConfig: vi.fn(() => ({})) }));

import { reactConfig } from './react.js';

describe('reactConfig optimizeDeps', () => {
	it('pre-bundles the CommonJS React packages and nothing else', () => {
		const config = reactConfig({ mode: 'development' });
		expect(config.optimizeDeps?.include).toEqual(['react', 'react-reconciler']);
		expect(config.optimizeDeps?.exclude).toBeUndefined();
	});
});
