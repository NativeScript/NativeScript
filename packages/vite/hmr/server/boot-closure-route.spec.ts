import { describe, expect, it } from 'vitest';

import { buildBootClosureUrls } from './boot-closure-route.js';
import { CORE_BUNDLE_PATH } from './core-bundle.js';

const origin = 'http://192.168.1.5:5173';

describe('buildBootClosureUrls', () => {
	it('orders entry first, then bridges, then the script-only graph closure', () => {
		const urls = buildBootClosureUrls({
			origin,
			entryPathname: '/src/app.ts',
			graphModuleIds: ['/src/app.ts', '/src/pages/home.ts', '/src/styles.css', 'not-absolute.ts'],
		});
		expect(urls[0]).toBe(`${origin}/ns/m/src/app`);
		expect(urls).toContain(`${origin}/ns/rt`);
		expect(urls).toContain(`${origin}/ns/core`);
		expect(urls).toContain(`${origin}/ns/m/src/pages/home`);
		// non-script and non-absolute ids are excluded; entry deduped
		expect(urls.filter((u) => u === `${origin}/ns/m/src/app`)).toHaveLength(1);
		expect(urls.some((u) => u.includes('styles'))).toBe(false);
		expect(urls.some((u) => u.includes('not-absolute'))).toBe(false);
		// core bundle only rides along when requested
		expect(urls).not.toContain(`${origin}${CORE_BUNDLE_PATH}`);
	});

	it('inserts /ns/core-bundle.mjs right after the entry in bundle mode', () => {
		const urls = buildBootClosureUrls({
			origin,
			entryPathname: 'src/app.ts',
			graphModuleIds: [],
			includeCoreBundle: true,
		});
		expect(urls[0]).toBe(`${origin}/ns/m/src/app`);
		expect(urls[1]).toBe(`${origin}${CORE_BUNDLE_PATH}`);
		expect(urls[2]).toBe(`${origin}/ns/rt`);
		expect(urls[3]).toBe(`${origin}/ns/core`);
	});
});
