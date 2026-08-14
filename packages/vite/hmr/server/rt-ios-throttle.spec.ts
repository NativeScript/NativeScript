import { describe, it, expect } from 'vitest';

import { buildNsRtBridgeModule } from './ns-rt-bridge.js';

describe('ns/rt $navigateTo implementation preference', () => {
	it('uses the app navigator bridge with a missing-navigator diagnostic', () => {
		const src = buildNsRtBridgeModule({ rtVer: '7', requireGuardSnippet: '', vendorExports: [] });
		expect(src).toContain('__nsNavigateUsingApp');
		expect(src).toContain('$navigateTo unavailable: app navigator missing');
	});
});
