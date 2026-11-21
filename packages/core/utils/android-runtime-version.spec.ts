import { describe, it, expect } from 'vitest';
import { isVersionGreaterThan } from './android-runtime-version';

describe('isVersionGreaterThan', () => {
	const greaterThan912 = (version: unknown) => isVersionGreaterThan(version, 9, 1, 2);

	it('is false for values that are not version strings', () => {
		expect(greaterThan912(undefined)).toBe(false);
		expect(greaterThan912(null)).toBe(false);
		expect(greaterThan912(913)).toBe(false);
		expect(greaterThan912('')).toBe(false);
		expect(greaterThan912('garbage')).toBe(false);
		expect(greaterThan912('9.1')).toBe(false);
		expect(greaterThan912('v9.2.0')).toBe(false);
		expect(greaterThan912('9.2.0 ')).toBe(false);
		expect(greaterThan912('9.2.0-')).toBe(false);
	});

	it('is false for the target release, its prereleases and older versions', () => {
		expect(greaterThan912('9.1.1')).toBe(false);
		expect(greaterThan912('9.1.2')).toBe(false);
		expect(greaterThan912('9.1.2-next.2026-11-11-1')).toBe(false);
		expect(greaterThan912('9.0.10')).toBe(false);
		expect(greaterThan912('8.99.99')).toBe(false);
	});

	it('is true for newer versions and their prereleases', () => {
		expect(greaterThan912('9.1.3')).toBe(true);
		expect(greaterThan912('9.1.3-alpha.1')).toBe(true);
		expect(greaterThan912('9.2.0')).toBe(true);
		expect(greaterThan912('9.10.0')).toBe(true);
		expect(greaterThan912('10.0.0')).toBe(true);
	});
});
