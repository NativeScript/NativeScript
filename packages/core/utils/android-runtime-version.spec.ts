import { describe, it, expect } from 'vitest';
import { isVersionAtLeast } from './android-runtime-version';

describe('isVersionAtLeast', () => {
	const atLeast912 = (version: unknown) => isVersionAtLeast(version, 9, 1, 2);

	it('is false for values that are not version strings', () => {
		expect(atLeast912(undefined)).toBe(false);
		expect(atLeast912(null)).toBe(false);
		expect(atLeast912(913)).toBe(false);
		expect(atLeast912('')).toBe(false);
		expect(atLeast912('garbage')).toBe(false);
		expect(atLeast912('9.1')).toBe(false);
		expect(atLeast912('v9.2.0')).toBe(false);
		expect(atLeast912('9.2.0 ')).toBe(false);
		expect(atLeast912('9.2.0-')).toBe(false);
	});

	it('is false for prereleases of the target release and older versions', () => {
		expect(atLeast912('9.1.1')).toBe(false);
		expect(atLeast912('9.1.2-next.2026-11-11-1')).toBe(false);
		expect(atLeast912('9.0.10')).toBe(false);
		expect(atLeast912('8.99.99')).toBe(false);
	});

	it('is true for the target release, newer versions and their prereleases', () => {
		expect(atLeast912('9.1.2')).toBe(true);
		expect(atLeast912('9.1.3')).toBe(true);
		expect(atLeast912('9.1.3-alpha.1')).toBe(true);
		expect(atLeast912('9.2.0')).toBe(true);
		expect(atLeast912('9.10.0')).toBe(true);
		expect(atLeast912('10.0.0')).toBe(true);
	});
});
