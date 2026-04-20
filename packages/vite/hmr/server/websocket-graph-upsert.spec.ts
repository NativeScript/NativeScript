import { describe, expect, it } from 'vitest';

import { classifyGraphUpsert, shouldBroadcastGraphUpsertDelta } from './websocket.js';

describe('graph upsert broadcast gating', () => {
	it('classifies first discovery as inserted', () => {
		expect(classifyGraphUpsert(undefined, 'hash-a', ['/src/app/main.ts'])).toBe('inserted');
	});

	it('classifies unchanged graph entries without emitting a delta', () => {
		const existing = { hash: 'hash-a', deps: ['/src/app/main.ts', '/src/app/routes.ts'] };
		expect(classifyGraphUpsert(existing, 'hash-a', ['/src/app/main.ts', '/src/app/routes.ts'])).toBe('unchanged');
		expect(shouldBroadcastGraphUpsertDelta('unchanged')).toBe(false);
	});

	it('classifies hash or dependency changes as changed', () => {
		const existing = { hash: 'hash-a', deps: ['/src/app/main.ts'] };
		expect(classifyGraphUpsert(existing, 'hash-b', ['/src/app/main.ts'])).toBe('changed');
		expect(classifyGraphUpsert(existing, 'hash-a', ['/src/app/other.ts'])).toBe('changed');
		expect(shouldBroadcastGraphUpsertDelta('changed')).toBe(true);
	});

	it('does not broadcast inserted modules unless the caller marks them as a real hot update', () => {
		expect(shouldBroadcastGraphUpsertDelta('inserted')).toBe(false);
		expect(shouldBroadcastGraphUpsertDelta('inserted', true)).toBe(true);
	});

	it('allows callers to suppress graph delta broadcast even when the graph changes', () => {
		expect(shouldBroadcastGraphUpsertDelta('changed', false, false)).toBe(false);
		expect(shouldBroadcastGraphUpsertDelta('inserted', true, false)).toBe(false);
	});
});
