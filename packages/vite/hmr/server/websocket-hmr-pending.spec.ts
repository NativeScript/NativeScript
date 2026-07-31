import { describe, expect, it } from 'vitest';

import { createHmrPendingMessage } from './websocket-hmr-pending.js';

describe('createHmrPendingMessage', () => {
	it('produces the documented shape with all fields preserved', () => {
		const msg = createHmrPendingMessage({
			origin: 'http://10.0.0.1:8080',
			path: '/src/app/foo.ts',
			kind: 'ts',
			timestamp: 1700000000000,
		});
		expect(msg).toEqual({
			type: 'ns:hmr-pending',
			origin: 'http://10.0.0.1:8080',
			path: '/src/app/foo.ts',
			kind: 'ts',
			timestamp: 1700000000000,
		});
	});

	it("normalizes unknown kinds to 'unknown' rather than leaking them through", () => {
		const msg = createHmrPendingMessage({
			origin: 'http://example.com',
			path: '/src/foo.bin',
			// Vite plugins occasionally invent new kinds; we don't want a
			// future plugin's surprise classification to escape into the
			// client schema.
			kind: 'binary',
			timestamp: 1,
		});
		expect(msg.kind).toBe('unknown');
	});

	it('coerces obviously-missing fields to safe defaults', () => {
		const msg = createHmrPendingMessage({
			origin: undefined as any,
			path: undefined as any,
			kind: undefined as any,
			timestamp: undefined as any,
		});
		expect(msg).toEqual({
			type: 'ns:hmr-pending',
			origin: '',
			path: '',
			kind: 'unknown',
			timestamp: 0,
		});
	});

	it("accepts each known kind ('ts', 'css', 'html', 'unknown')", () => {
		for (const kind of ['ts', 'css', 'html', 'unknown'] as const) {
			expect(createHmrPendingMessage({ origin: 'o', path: '/p', kind, timestamp: 1 }).kind).toBe(kind);
		}
	});
});
