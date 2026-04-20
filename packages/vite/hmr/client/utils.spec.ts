import { describe, expect, it } from 'vitest';

import { getGraphVersion, setGraphVersion } from './utils.js';

describe('setGraphVersion', () => {
	it('publishes the current graph version on globalThis', () => {
		const g = globalThis as any;
		const previousGraphVersion = getGraphVersion();
		const previousGlobalGraphVersion = g.__NS_HMR_GRAPH_VERSION__;

		try {
			setGraphVersion(408);

			expect(getGraphVersion()).toBe(408);
			expect(g.__NS_HMR_GRAPH_VERSION__).toBe(408);
		} finally {
			setGraphVersion(previousGraphVersion);
			g.__NS_HMR_GRAPH_VERSION__ = previousGlobalGraphVersion;
		}
	});
});
