import { describe, it, expect } from 'vitest';

import { buildNsRtBridgeModule } from './websocket-runtime-compat.js';

describe('ns/rt $navigateTo implementation preference', () => {
	it('uses the app navigator bridge with a missing-navigator diagnostic', () => {
		const src = buildNsRtBridgeModule('7', '');
		expect(src).toContain('__nsNavigateUsingApp');
		expect(src).toContain('$navigateTo unavailable: app navigator missing');
	});
});
