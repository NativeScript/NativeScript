import { describe, expect, it } from 'vitest';

import { normalizeHotReloadMatchPath, shouldSuppressViteFullReloadPayload } from './websocket.js';

describe('shouldSuppressViteFullReloadPayload', () => {
	const root = '/Users/example/app';
	const entry = {
		absPath: normalizeHotReloadMatchPath('/Users/example/app/src/app/components/login/login.component.html'),
		relPath: normalizeHotReloadMatchPath('/Users/example/app/src/app/components/login/login.component.html', root),
		expiresAt: 5_000,
	};

	it('suppresses a Vite full-reload payload that targets the handled Angular template file', () => {
		expect(
			shouldSuppressViteFullReloadPayload({
				payload: {
					type: 'full-reload',
					path: '/src/app/components/login/login.component.html',
				},
				pendingEntries: [entry],
				root,
				now: 1_000,
			}),
		).toBe(true);
	});

	it('suppresses a Vite full-reload payload when triggeredBy points at the handled file', () => {
		expect(
			shouldSuppressViteFullReloadPayload({
				payload: {
					type: 'full-reload',
					path: '*',
					triggeredBy: '/Users/example/app/src/app/components/login/login.component.html',
				},
				pendingEntries: [entry],
				root,
				now: 1_000,
			}),
		).toBe(true);
	});

	it('does not suppress unrelated or expired full-reload payloads', () => {
		expect(
			shouldSuppressViteFullReloadPayload({
				payload: {
					type: 'full-reload',
					path: '/src/app/components/signup/signup.component.html',
				},
				pendingEntries: [entry],
				root,
				now: 1_000,
			}),
		).toBe(false);

		expect(
			shouldSuppressViteFullReloadPayload({
				payload: {
					type: 'full-reload',
					path: '/src/app/components/login/login.component.html',
				},
				pendingEntries: [entry],
				root,
				now: 6_000,
			}),
		).toBe(false);
	});
});
