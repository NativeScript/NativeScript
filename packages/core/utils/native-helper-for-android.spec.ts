import { describe, it, expect, afterEach } from 'vitest';
import { isRealDevice } from './native-helper-for-android';

function setBuild(build: { FINGERPRINT?: string; HARDWARE?: string }) {
	(globalThis as any).android = { ...(globalThis as any).android, os: { Build: build } };
}

describe('isRealDevice (Android)', () => {
	const previousAndroid = (globalThis as any).android;

	afterEach(() => {
		(globalThis as any).android = previousAndroid;
	});

	it('is true on a physical device', () => {
		setBuild({ FINGERPRINT: 'google/husky/husky:14/AP1A.240305.019/11445699:user/release-keys', HARDWARE: 'husky' });
		expect(isRealDevice()).toBe(true);
	});

	it('is false on the Android Emulator', () => {
		setBuild({ FINGERPRINT: 'google/sdk_gphone64_arm64/emu64a:14/UE1A.230829.036/10857395:userdebug/dev-keys', HARDWARE: 'ranchu' });
		expect(isRealDevice()).toBe(false);

		setBuild({ FINGERPRINT: 'generic/sdk_phone_x86/generic_x86:9/PSR1.180720.012/4923214:userdebug/test-keys', HARDWARE: 'goldfish' });
		expect(isRealDevice()).toBe(false);
	});

	it('is false on Genymotion', () => {
		setBuild({ FINGERPRINT: 'Android/vbox86p/vbox86p:10/QQ1D.200205.002/1:userdebug/test-keys', HARDWARE: 'vbox86' });
		expect(isRealDevice()).toBe(false);
	});

	it('is true when the build fields are missing', () => {
		setBuild({});
		expect(isRealDevice()).toBe(true);
	});
});
