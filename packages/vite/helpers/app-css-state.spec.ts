import { describe, expect, it } from 'vitest';

import { getAppCssState, setAppCssState, type AppCssState } from './app-css-state.js';

function makeState(path: string): AppCssState {
	return { path, deps: new Set([path]), refresh: async () => ({ changed: true, changedSinceStartup: false }) };
}

describe('app-css-state', () => {
	it('round-trips on the same server object', () => {
		const server = { config: {} } as any;
		const state = makeState('/proj/src/app-a.css');
		setAppCssState(server, state);
		expect(getAppCssState(server)).toBe(state);
	});

	it('survives Vite 8 hot-update server wrappers (different identity, forwarding reads)', () => {
		// Vite 8's legacy `handleHotUpdate` hook receives a backward-compat
		// WRAPPER over the dev server: property reads forward to the real
		// server but the wrapper is a different object. A WeakMap keyed by
		// the raw server therefore always missed from the hot-update path —
		// which silently killed the Tailwind content-file broadcast (new
		// utility classes in templates never regenerated app.css).
		const rawServer = { config: {} } as any;
		const state = makeState('/proj/src/app-b.css');
		setAppCssState(rawServer, state);

		// Prototype-inheriting wrapper (the Object.create-style compat shape).
		const wrapper = Object.assign(Object.create(rawServer), { moduleGraph: {} });
		expect(getAppCssState(wrapper)).toBe(state);
	});

	it('falls back to config identity when property forwarding is unavailable', () => {
		const config = {};
		const rawServer = { config } as any;
		const state = makeState('/proj/src/app-c.css');
		setAppCssState(rawServer, state);

		// A wrapper that does NOT inherit properties but shares the same
		// ResolvedConfig object — the config-keyed WeakMap covers it.
		const detachedWrapper = { config } as any;
		expect(getAppCssState(detachedWrapper)).toBe(state);
	});

	it('returns undefined for an unrelated server', () => {
		expect(getAppCssState({ config: {} } as any)).toBeUndefined();
	});
});
