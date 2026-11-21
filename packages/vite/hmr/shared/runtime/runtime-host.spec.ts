import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
	vi.doUnmock('ns:module');
	vi.resetModules();
});

describe('loadNsRuntimeDevHostApi', () => {
	it("loads the dev surface from the ns:module builtin's default export", async () => {
		const configureLoader = () => undefined;
		const invalidateModules = () => undefined;
		vi.doMock('ns:module', () => ({ default: { configureLoader, invalidateModules } }));
		const { loadNsRuntimeDevHostApi, nsRuntimeDevHostApi } = await import('./runtime-host.js');

		expect(nsRuntimeDevHostApi()).toEqual({});
		const api = await loadNsRuntimeDevHostApi();
		expect(api.configureLoader).toBe(configureLoader);
		expect(nsRuntimeDevHostApi().invalidateModules).toBe(invalidateModules);
	});

	it('leaves an empty surface when the runtime has no ns:module builtin', async () => {
		const { loadNsRuntimeDevHostApi, nsRuntimeDevHostApi } = await import('./runtime-host.js');

		expect(await loadNsRuntimeDevHostApi()).toEqual({});
		expect(nsRuntimeDevHostApi()).toEqual({});
	});
});
