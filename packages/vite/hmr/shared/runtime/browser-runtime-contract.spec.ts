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

	it('exposes the runtime host api from the ns:runtime builtin module', () => {
		const configureRuntime = () => undefined;
		const invalidateModules = () => undefined;
		const getLoadedModuleUrls = () => ['http://localhost:5173/src/main.ts'];
		const setDevBootComplete = () => undefined;
		const terminateAllWorkers = () => 0;

		const nsRuntime = {
			configureRuntime,
			invalidateModules,
			getLoadedModuleUrls,
			setDevBootComplete,
			terminateAllWorkers,
		};
		const api = readNsRuntimeDevHostApi({
			require: (specifier: string) => {
				if (specifier === 'ns:runtime') return nsRuntime;
				throw new Error(`No such built-in module: ${specifier}`);
			},
		} as unknown as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBe(configureRuntime);
		expect(api.invalidateModules).toBe(invalidateModules);
		expect(api.getLoadedModuleUrls).toBe(getLoadedModuleUrls);
		expect(api.setDevBootComplete).toBe(setDevBootComplete);
		expect(api.terminateAllWorkers).toBe(terminateAllWorkers);
	});

	it('yields an empty api when there is no global require (non-dev environments)', () => {
		const api = readNsRuntimeDevHostApi({} as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBeUndefined();
		expect(api.invalidateModules).toBeUndefined();
		expect(api.getLoadedModuleUrls).toBeUndefined();
		expect(api.setDevBootComplete).toBeUndefined();
		expect(api.terminateAllWorkers).toBeUndefined();
	});

	it('yields an empty api when require does not know the ns:runtime builtin', () => {
		const api = readNsRuntimeDevHostApi({
			require: (specifier: string) => {
				throw new Error(`No such built-in module: ${specifier}`);
			},
		} as unknown as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBeUndefined();
		expect(api.invalidateModules).toBeUndefined();
	});
});
