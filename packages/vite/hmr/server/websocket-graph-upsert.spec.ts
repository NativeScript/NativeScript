import { describe, expect, it } from 'vitest';

import { classifyGraphUpsert, shouldBroadcastGraphUpsertDelta, shouldBumpGraphVersion } from './websocket.js';

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

describe('shouldBumpGraphVersion', () => {
	it('never bumps the version for unchanged classifications', () => {
		// The unchanged path early-returns in upsertGraphModule, so advancing
		// graphVersion for it would desync the graph from the URL tag the
		// client has already cached.
		expect(shouldBumpGraphVersion('unchanged', true)).toBe(false);
		expect(shouldBumpGraphVersion('unchanged', false)).toBe(false);
		expect(shouldBumpGraphVersion('unchanged')).toBe(false);
	});

	it('bumps the version for changed entries by default (live-edit path)', () => {
		expect(shouldBumpGraphVersion('changed')).toBe(true);
		expect(shouldBumpGraphVersion('changed', true)).toBe(true);
	});

	it('bumps the version for inserted entries by default (live-edit path)', () => {
		expect(shouldBumpGraphVersion('inserted')).toBe(true);
		expect(shouldBumpGraphVersion('inserted', true)).toBe(true);
	});

	it('suppresses version bumps for serve-time warm-ups (bumpVersion: false)', () => {
		// /ns/m serve-time upserts and the initial-graph walk pass
		// `bumpVersion: false`. They populate the graph without advancing the
		// URL tag, preserving the stable `v1` cache key across the cold boot.
		expect(shouldBumpGraphVersion('inserted', false)).toBe(false);
		expect(shouldBumpGraphVersion('changed', false)).toBe(false);
		expect(shouldBumpGraphVersion('unchanged', false)).toBe(false);
	});
});
