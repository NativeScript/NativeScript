import { describe, expect, it } from 'vitest';

import { NS_DEFAULT_DEV_FEATURE_FLAGS, NS_DEFAULT_HOST_MODULES, assertNsDevSessionDescriptor } from './browser-runtime-contract.js';

describe('browser runtime contract', () => {
	it('accepts a valid dev session descriptor', () => {
		expect(() =>
			assertNsDevSessionDescriptor({
				sessionId: 'session-1',
				origin: 'http://localhost:5173',
				entryUrl: 'http://localhost:5173/src/main.ts',
				clientUrl: 'http://localhost:5173/@vite/client',
				wsUrl: 'ws://localhost:5173/vite-hmr?token=t',
				wsProtocol: 'vite-hmr',
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
				wsUrl: 'ws://localhost:5173/vite-hmr?token=t',
				wsProtocol: 'vite-hmr',
				platform: 'ios',
				hostModules: ['vendor://runtime'],
			}),
		).toThrow('Invalid dev session hostModules');
	});
});
