import { describe, expect, it } from 'vitest';

import { createHmrPendingMessage, isHmrPendingMessage } from './websocket-hmr-pending.js';

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

describe('isHmrPendingMessage', () => {
	it('accepts well-formed pending messages', () => {
		expect(
			isHmrPendingMessage({
				type: 'ns:hmr-pending',
				origin: 'http://localhost:8080',
				path: '/src/foo.ts',
				kind: 'ts',
				timestamp: 1,
			}),
		).toBe(true);
	});

	it("rejects messages with the wrong type field (e.g. legacy 'hmr:update')", () => {
		expect(
			isHmrPendingMessage({
				type: 'hmr:update',
				path: '/src/foo.ts',
				kind: 'ts',
				timestamp: 1,
			}),
		).toBe(false);
	});

	it('rejects messages missing required fields', () => {
		expect(isHmrPendingMessage({ type: 'ns:hmr-pending', kind: 'ts', timestamp: 1 })).toBe(false);
		expect(isHmrPendingMessage({ type: 'ns:hmr-pending', path: '/p', timestamp: 1 })).toBe(false);
		expect(isHmrPendingMessage({ type: 'ns:hmr-pending', path: '/p', kind: 'ts' })).toBe(false);
		expect(isHmrPendingMessage({ type: 'ns:hmr-pending', path: '', kind: 'ts', timestamp: 1 })).toBe(false);
	});

	it('rejects non-objects', () => {
		expect(isHmrPendingMessage(null)).toBe(false);
		expect(isHmrPendingMessage(undefined)).toBe(false);
		expect(isHmrPendingMessage('string')).toBe(false);
		expect(isHmrPendingMessage(42)).toBe(false);
	});

	it('rejects messages with an unknown kind even if everything else is well-formed', () => {
		expect(
			isHmrPendingMessage({
				type: 'ns:hmr-pending',
				origin: 'o',
				path: '/p',
				kind: 'binary',
				timestamp: 1,
			}),
		).toBe(false);
	});
});
