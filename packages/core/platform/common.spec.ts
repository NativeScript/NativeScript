import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('tvOS platform identity', () => {
	it('loads with bundlers that do not define the new tvOS flag', async () => {
		delete (globalThis as any).__TVOS__;
		const platform = await import('./common');
		expect(platform.isTvOS).toBe(false);
		const { Device } = await import('./device/index.ios');
		expect(Device.os).toBe('iOS');
	});

	it('recognizes tvOS as both tvOS and iOS-compatible', async () => {
		vi.stubGlobal('__TVOS__', true);
		vi.stubGlobal('__IOS__', false);
		vi.stubGlobal('__VISIONOS__', false);
		const platform = await import('./common');
		expect(platform.isTvOS).toBe(true);
		expect(platform.isIOS).toBe(true);
		const { Device } = await import('./device/index.ios');
		expect(Device.os).toBe('tvOS');
	});
});
