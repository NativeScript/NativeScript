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

	it('exposes the runtime host api from global hooks', () => {
		const configureRuntime = () => undefined;
		const startDevSession = async () => undefined;
		const invalidateModules = () => undefined;
		const reloadDevApp = async () => undefined;
		const applyStyleUpdate = () => undefined;
		const getLoadedModuleUrls = () => ['http://localhost:5173/src/main.ts'];

		const api = readNsRuntimeDevHostApi({
			__nsConfigureDevRuntime: configureRuntime,
			__nsSupportsRuntimeConfigUrl: true,
			__nsStartDevSession: startDevSession,
			__nsInvalidateModules: invalidateModules,
			__nsReloadDevApp: reloadDevApp,
			__nsApplyStyleUpdate: applyStyleUpdate,
			__nsGetLoadedModuleUrls: getLoadedModuleUrls,
		} as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBe(configureRuntime);
		expect(api.supportsRuntimeConfigUrl).toBe(true);
		expect(api.startDevSession).toBe(startDevSession);
		expect(api.invalidateModules).toBe(invalidateModules);
		expect(api.reloadDevApp).toBe(reloadDevApp);
		expect(api.applyStyleUpdate).toBe(applyStyleUpdate);
		expect(api.getLoadedModuleUrls).toBe(getLoadedModuleUrls);
	});

	it('falls back to the legacy runtime configure hook', () => {
		const configureRuntime = () => undefined;

		const api = readNsRuntimeDevHostApi({
			__nsConfigureRuntime: configureRuntime,
			__nsStartDevSession: async () => undefined,
		} as Partial<typeof globalThis>);

		expect(api.configureRuntime).toBe(configureRuntime);
		expect(api.supportsRuntimeConfigUrl).toBe(false);
	});
});
