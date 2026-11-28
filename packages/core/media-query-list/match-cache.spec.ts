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
import { Screen } from '../platform/screen';

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

	it('reads no device state for a query it cannot evaluate', () => {
		const unsupportedQuery = '(color-gamut: p3)';
		const screenReads = vi.spyOn(Screen.mainScreen, 'widthPixels', 'get');
		const readsBefore = device.propertyReads;

		expect(checkIfMediaQueryMatches(unsupportedQuery)).toBe(false);
		expect(checkIfMediaQueryMatches(unsupportedQuery)).toBe(false);
		expect(device.propertyReads).toBe(readsBefore);
		expect(screenReads).not.toHaveBeenCalled();

		screenReads.mockRestore();
	});

	it('reads only the device state the query names', () => {
		const widthQuery = `(max-width: ${Screen.mainScreen.widthDIPs})`;
		const screenReads = vi.spyOn(Screen.mainScreen, 'widthPixels', 'get');
		const readsBefore = device.propertyReads;

		expect(checkIfMediaQueryMatches(widthQuery)).toBe(true);
		expect(device.propertyReads).toBe(readsBefore);
		expect(screenReads).toHaveBeenCalled();

		screenReads.mockClear();

		expect(checkIfMediaQueryMatches('(orientation: portrait)')).toBe(true);
		expect(device.propertyReads).toBe(readsBefore + 1);
		expect(screenReads).not.toHaveBeenCalled();

		screenReads.mockRestore();
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
