import { vi } from 'vitest';

const device = vi.hoisted(() => ({
	orientation: 'portrait',
	listeners: new Set<(args: any) => void>(),
	propertyReads: 0,
}));

vi.mock('../application/helpers-common', async (importOriginal) => ({
	...(await importOriginal<typeof import('../application/helpers-common')>()),
	getApplicationProperties: () => {
		device.propertyReads++;

		return { orientation: device.orientation, systemAppearance: 'light' };
	},
	toggleApplicationEventListeners: (toAdd: boolean, callback: (args: any) => void) => {
		if (toAdd) {
			device.listeners.add(callback);
		} else {
			device.listeners.delete(callback);
		}
	},
}));

import { checkIfMediaQueryMatches, matchMedia } from '.';

function notifyDeviceChange() {
	for (const listener of [...device.listeners]) {
		listener({ eventName: 'orientationChanged' });
	}
}

describe('media-query-list match cache', () => {
	const portraitQuery = '(orientation: portrait)';

	beforeEach(() => {
		device.orientation = 'portrait';
		notifyDeviceChange();
	});

	it('reuses a result until the device changes', () => {
		expect(checkIfMediaQueryMatches(portraitQuery)).toBe(true);

		const readsAfterFirstCheck = device.propertyReads;
		device.orientation = 'landscape';

		expect(checkIfMediaQueryMatches(portraitQuery)).toBe(true);
		expect(device.propertyReads).toBe(readsAfterFirstCheck);

		notifyDeviceChange();

		expect(checkIfMediaQueryMatches(portraitQuery)).toBe(false);
		expect(device.propertyReads).toBe(readsAfterFirstCheck + 1);
	});

	it('caches queries that do not match', () => {
		const unsupportedQuery = '(color-gamut: p3)';

		expect(checkIfMediaQueryMatches(unsupportedQuery)).toBe(false);

		const readsAfterFirstCheck = device.propertyReads;

		expect(checkIfMediaQueryMatches(unsupportedQuery)).toBe(false);
		expect(device.propertyReads).toBe(readsAfterFirstCheck);
	});

	it('keeps MediaQueryList change notifications in sync with the cache', () => {
		expect(checkIfMediaQueryMatches(portraitQuery)).toBe(true);

		const mql = matchMedia(portraitQuery);
		let notifiedMatches: boolean | undefined;
		mql.addEventListener('change', (data: any) => {
			notifiedMatches = data.matches;
		});

		device.orientation = 'landscape';
		notifyDeviceChange();

		expect(mql.matches).toBe(false);
		expect(notifiedMatches).toBe(false);
		expect(checkIfMediaQueryMatches(portraitQuery)).toBe(false);
	});
});
