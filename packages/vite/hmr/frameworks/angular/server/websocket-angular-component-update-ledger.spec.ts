import { describe, expect, it } from 'vitest';

import { createAngularComponentUpdateLedger, normalizeAngularComponentUpdateId } from './websocket-angular-hot-update.js';

describe('normalizeAngularComponentUpdateId', () => {
	it('decodes Analog-encoded ids to the URLSearchParams shape', () => {
		expect(normalizeAngularComponentUpdateId('src%2Fapp%2Fcomponents%2Fsignup%2Fsignup.component.ts%40SignupComponent')).toBe('src/app/components/signup/signup.component.ts@SignupComponent');
	});

	it('passes already-decoded ids through unchanged', () => {
		expect(normalizeAngularComponentUpdateId('src/app/app.component.ts@AppComponent')).toBe('src/app/app.component.ts@AppComponent');
	});

	it('returns null for non-strings and empty strings', () => {
		expect(normalizeAngularComponentUpdateId(undefined)).toBeNull();
		expect(normalizeAngularComponentUpdateId(null)).toBeNull();
		expect(normalizeAngularComponentUpdateId(42)).toBeNull();
		expect(normalizeAngularComponentUpdateId('')).toBeNull();
	});

	it('falls back to the raw string on malformed percent-encoding', () => {
		expect(normalizeAngularComponentUpdateId('src/app/%E0%A4%A')).toBe('src/app/%E0%A4%A');
	});
});

describe('createAngularComponentUpdateLedger', () => {
	it('matches only exact (id, timestamp) pairs that were recorded', () => {
		const ledger = createAngularComponentUpdateLedger();
		ledger.record({ id: 'src%2Fapp%2Ffoo.component.ts%40FooComponent', timestamp: 1000 });

		// The device echoes the broadcast timestamp; boot-time fetches use a
		// fresh Date.now() that was never broadcast.
		expect(ledger.isLive('src/app/foo.component.ts@FooComponent', 1000)).toBe(true);
		expect(ledger.isLive('src/app/foo.component.ts@FooComponent', 1001)).toBe(false);
		expect(ledger.isLive('src/app/bar.component.ts@BarComponent', 1000)).toBe(false);
	});

	it('keeps every timestamp from rapid sequential edits live', () => {
		const ledger = createAngularComponentUpdateLedger();
		ledger.record({ id: 'a.ts%40A', timestamp: 1 });
		ledger.record({ id: 'a.ts%40A', timestamp: 2 });
		ledger.record({ id: 'a.ts%40A', timestamp: 3 });
		expect(ledger.isLive('a.ts@A', 1)).toBe(true);
		expect(ledger.isLive('a.ts@A', 2)).toBe(true);
		expect(ledger.isLive('a.ts@A', 3)).toBe(true);
	});

	it('ignores payloads without a string id or finite numeric timestamp', () => {
		const ledger = createAngularComponentUpdateLedger();
		ledger.record(undefined);
		ledger.record(null);
		ledger.record({});
		ledger.record({ id: 'a.ts%40A' });
		ledger.record({ id: 'a.ts%40A', timestamp: 'now' });
		ledger.record({ id: 'a.ts%40A', timestamp: NaN });
		ledger.record({ id: 7, timestamp: 1 });
		expect(ledger.isLive('a.ts@A', 1)).toBe(false);
	});

	it('caps recorded timestamps per component, evicting the oldest', () => {
		const ledger = createAngularComponentUpdateLedger();
		for (let t = 1; t <= 20; t++) {
			ledger.record({ id: 'a.ts%40A', timestamp: t });
		}
		// Cap is 16: 1..4 evicted, 5..20 retained.
		expect(ledger.isLive('a.ts@A', 4)).toBe(false);
		expect(ledger.isLive('a.ts@A', 5)).toBe(true);
		expect(ledger.isLive('a.ts@A', 20)).toBe(true);
	});
});
