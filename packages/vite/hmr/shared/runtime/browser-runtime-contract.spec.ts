import { describe, expect, it } from 'vitest';

import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, assertNsDevSessionDescriptor, readNsRuntimeDevHostApi } from './browser-runtime-contract.js';

describe('browser runtime contract', () => {
	it('accepts a valid dev session descriptor', () => {
		expect(() =>
			assertNsDevSessionDescriptor({
				sessionId: 'session-1',
				origin: 'http://localhost:5173',
				entryUrl: 'http://localhost:5173/src/main.ts',
				clientUrl: 'http://localhost:5173/@vite/client',
				wsUrl: 'ws://localhost:5173',
				platform: 'ios',
				hostModules: [...NS_DEFAULT_HOST_MODULES],
				features: { ...NS_DEFAULT_DEV_FEATURE_FLAGS },
			}),
		).not.toThrow();
	});

	it('rejects a descriptor with an invalid host module id', () => {
		expect(() =>
			assertNsDevSessionDescriptor({
				sessionId: 'session-1',
				origin: 'http://localhost:5173',
				entryUrl: 'http://localhost:5173/src/main.ts',
				clientUrl: 'http://localhost:5173/@vite/client',
				wsUrl: 'ws://localhost:5173',
				platform: 'ios',
				hostModules: ['vendor://runtime'],
			}),
		).toThrow('Invalid dev session hostModules');
	});

	it('exposes the runtime host api from the __NS_DEV__ namespace', () => {
		const configureRuntime = () => undefined;
		const invalidateModules = () => undefined;
		const getLoadedModuleUrls = () => ['http://localhost:5173/src/main.ts'];
		const kickstartPrefetch = () => null;
		const setDevBootComplete = () => undefined;
		const terminateAllWorkers = () => 0;

		const api = readNsRuntimeDevHostApi({
			__NS_DEV__: {
				configureRuntime,
				invalidateModules,
				getLoadedModuleUrls,
				kickstartPrefetch,
				setDevBootComplete,
				terminateAllWorkers,
			},
		} as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBe(configureRuntime);
		expect(api.invalidateModules).toBe(invalidateModules);
		expect(api.getLoadedModuleUrls).toBe(getLoadedModuleUrls);
		expect(api.kickstartPrefetch).toBe(kickstartPrefetch);
		expect(api.setDevBootComplete).toBe(setDevBootComplete);
		expect(api.terminateAllWorkers).toBe(terminateAllWorkers);
	});

	it('yields an empty api when __NS_DEV__ is not installed (non-dev environments)', () => {
		const api = readNsRuntimeDevHostApi({} as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBeUndefined();
		expect(api.invalidateModules).toBeUndefined();
		expect(api.getLoadedModuleUrls).toBeUndefined();
		expect(api.kickstartPrefetch).toBeUndefined();
		expect(api.setDevBootComplete).toBeUndefined();
		expect(api.terminateAllWorkers).toBeUndefined();
	});
});
