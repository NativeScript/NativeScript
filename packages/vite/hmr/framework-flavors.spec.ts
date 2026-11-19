import { describe, expect, it } from 'vitest';
import { getFlavorVendorExcludes, getFrameworkFlavor, getFrameworkServerStrategy, registerFrameworkFlavor } from './framework-flavors.js';

const server = { flavor: 'fw', importMapSpecifiers: () => ['fw-runtime'] };

describe('registerFrameworkFlavor', () => {
	it('rejects a built-in name and a mismatched server flavor', () => {
		expect(() => registerFrameworkFlavor({ flavor: 'vue', server: { ...server, flavor: 'vue' } })).toThrow(/built-in/);
		expect(() => registerFrameworkFlavor({ flavor: 'fw', server: { flavor: 'typescript' } })).toThrow(/declares flavor "typescript"/);
	});

	it('registers and looks up a flavor', () => {
		registerFrameworkFlavor({ flavor: 'fw', server });
		expect(getFrameworkFlavor('fw')?.server).toBe(server);
		expect(getFrameworkFlavor('nope')).toBeUndefined();
	});

	it('accepts a flavor without a server strategy', () => {
		registerFrameworkFlavor({ flavor: 'bare' });
		expect(getFrameworkServerStrategy('bare')).toBeUndefined();
	});
});

describe('getFrameworkServerStrategy', () => {
	it('returns built-in strategies before registered ones', () => {
		expect(getFrameworkServerStrategy('angular')?.flavor).toBe('angular');
		registerFrameworkFlavor({ flavor: 'fw', server });
		expect(getFrameworkServerStrategy('fw')).toBe(server);
		expect(getFrameworkServerStrategy('unknown')).toBeUndefined();
	});
});

describe('vendor policy', () => {
	it('rejects a malformed vendor.exclude', () => {
		expect(() => registerFrameworkFlavor({ flavor: 'fw', server, vendor: { exclude: 'octane' as unknown as string[] } })).toThrow(/vendor\.exclude/);
		expect(() => registerFrameworkFlavor({ flavor: 'fw', server, vendor: { exclude: [''] } })).toThrow(/vendor\.exclude/);
	});

	it('exposes the excluded package roots of the registered flavor only', () => {
		registerFrameworkFlavor({ flavor: 'fw', server, vendor: { exclude: [' octane ', 'react-dom'] } });
		expect([...getFlavorVendorExcludes('fw')]).toEqual(['octane', 'react-dom']);
		expect(getFlavorVendorExcludes('vue').size).toBe(0);
		expect(getFlavorVendorExcludes(undefined).size).toBe(0);
		registerFrameworkFlavor({ flavor: 'fw', server });
		expect(getFlavorVendorExcludes('fw').size).toBe(0);
	});
});
