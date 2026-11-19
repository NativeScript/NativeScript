import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock('fs', () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	readFileSync: vi.fn(),
}));

const mockGetVendorManifest = vi.fn(() => null as unknown);
const mockListVendorModules = vi.fn(() => [] as string[]);

vi.mock('../shared/vendor/registry.js', () => ({
	getVendorManifest: (...args: unknown[]) => mockGetVendorManifest(...args),
	listVendorModules: (...args: unknown[]) => mockListVendorModules(...args),
}));

vi.mock('../../helpers/project.js', () => ({
	getProjectRootPath: vi.fn(() => '/workspace/app'),
}));

import { collectImportMapSpecifiers, getCanonicalization } from './import-map.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';

function strategyWithImportMapSpecifiers(specifiers: string[]): FrameworkServerStrategy {
	return { importMapSpecifiers: () => specifiers } as unknown as FrameworkServerStrategy;
}

function dir(name: string) {
	return {
		name,
		isDirectory: () => true,
		isSymbolicLink: () => false,
	};
}

const ORIGIN = 'http://localhost:5173';

describe('collectImportMapSpecifiers', () => {
	beforeEach(() => {
		mockExistsSync.mockReturnValue(true);
		mockReaddirSync.mockImplementation((target: string) => {
			const normalized = String(target).replace(/\\/g, '/');
			if (normalized.endsWith('/node_modules')) {
				return [dir('@nativescript'), dir('@vitejs'), dir('vite'), dir('solid-js')];
			}
			if (normalized.endsWith('/node_modules/@nativescript')) {
				return [dir('vite')];
			}
			if (normalized.endsWith('/node_modules/@vitejs')) {
				return [dir('plugin-vue')];
			}
			return [];
		});
		mockGetVendorManifest.mockReturnValue(null);
		mockListVendorModules.mockReturnValue([]);
	});

	it('omits build-time and prefix-only package roots', () => {
		const specifiers = collectImportMapSpecifiers({ origin: ORIGIN, flavor: 'angular' });

		expect(specifiers).not.toContain('@nativescript/vite');
		expect(specifiers).not.toContain('vite');
		expect(specifiers).not.toContain('@vitejs/plugin-vue');
		expect(specifiers).toContain('solid-js');
		expect(specifiers.some((spec) => spec.endsWith('/'))).toBe(false);
	});

	it('adds framework specifiers once, in map order', () => {
		const specifiers = collectImportMapSpecifiers({
			origin: ORIGIN,
			flavor: 'solid',
			strategy: strategyWithImportMapSpecifiers(['solid-js', 'solid-js/web']),
		});

		expect(specifiers.filter((spec) => spec === 'solid-js')).toHaveLength(1);
		expect(specifiers).toContain('solid-js/web');
		expect(specifiers.indexOf('solid-js/web')).toBeGreaterThan(specifiers.indexOf('@nativescript/core'));
	});

	it('keys @nativescript/core once and never its subpaths, even when the vendor manifest lists them', () => {
		mockGetVendorManifest.mockReturnValue({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test-hash',
			modules: {},
			aliases: {
				'@nativescript/core/ui/frame/activity.android': '@nativescript/core/ui/frame/activity.android',
			},
		});
		mockListVendorModules.mockReturnValue(['@nativescript/core', '@nativescript/core/ui/frame/activity.android', '@nativescript/core/application', 'rxjs']);

		const specifiers = collectImportMapSpecifiers({ origin: ORIGIN, flavor: 'angular' });

		expect(specifiers.filter((spec) => spec === '@nativescript/core')).toHaveLength(1);
		expect(specifiers).not.toContain('@nativescript/core/ui/frame/activity.android');
		expect(specifiers).not.toContain('@nativescript/core/application');
		expect(specifiers[0]).toBe('rxjs');
	});

	it('keys node: builtins but not their bare names', () => {
		const specifiers = collectImportMapSpecifiers({ origin: ORIGIN, flavor: 'angular' });

		expect(specifiers).toContain('node:url');
		expect(specifiers).toContain('node:path');
		expect(specifiers).not.toContain('url');
	});
});

describe('vendor specifiers', () => {
	beforeEach(() => {
		mockExistsSync.mockReturnValue(true);
		mockReaddirSync.mockImplementation((target: string) => {
			const normalized = String(target).replace(/\\/g, '/');
			if (normalized.endsWith('/node_modules')) {
				return [dir('rxjs'), dir('@ngx-translate'), dir('vue')];
			}
			if (normalized.endsWith('/node_modules/@ngx-translate')) {
				return [dir('core')];
			}
			return [];
		});
		mockGetVendorManifest.mockReturnValue(null);
		mockListVendorModules.mockReturnValue([]);
	});

	it('keys vendor roots first and aliases only when their canonical package is keyed', () => {
		mockGetVendorManifest.mockReturnValue({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test-hash',
			modules: {},
			aliases: { 'rxjs/operators': 'rxjs', 'not-vendored/sub': 'not-vendored' },
		});
		mockListVendorModules.mockReturnValue(['rxjs', '@ngx-translate/core']);

		const specifiers = collectImportMapSpecifiers({ origin: ORIGIN, flavor: 'vue' });

		expect(specifiers.slice(0, 3)).toEqual(['rxjs', '@ngx-translate/core', 'rxjs/operators']);
		expect(specifiers).not.toContain('not-vendored/sub');
		expect(specifiers).toContain('vue');
		expect(specifiers.filter((spec) => spec === 'rxjs')).toHaveLength(1);
	});
});

/**
 * The query decision of the iOS runtime's `CanonicalizeHttpUrlKey`
 * (HttpLoader.mm): a `preserveQueryFor` substring keeps the query verbatim,
 * a `forPathPrefixes` prefix drops `stripParams` and sorts the rest, any
 * other path keeps the query verbatim.
 */
function runtimeKey(url: string, canon: ReturnType<typeof getCanonicalization>): string {
	const u = new URL(url);
	const base = `${u.origin}${u.pathname}`;
	const query = u.search.slice(1);
	if (canon.preserveQueryFor.some((p) => p && u.pathname.includes(p))) return url;
	if (!canon.forPathPrefixes.some((p) => p && u.pathname.startsWith(p))) return url;
	const kept = query
		.split('&')
		.filter(Boolean)
		.filter((pair) => !canon.stripParams.includes(pair.split('=')[0]))
		.sort();
	return kept.length ? `${base}?${kept.join('&')}` : base;
}

describe('getCanonicalization', () => {
	const angular = { flavor: 'angular', preserveQueryPaths: () => ['/@ng/component'] } as FrameworkServerStrategy;

	it('keys /ns/v module URLs like a browser: t and import stay part of the identity', () => {
		const canon = getCanonicalization(angular);
		expect(runtimeKey(`${ORIGIN}/ns/v/src/app/home.component.ts?t=1700000000000`, canon)).toBe(`${ORIGIN}/ns/v/src/app/home.component.ts?t=1700000000000`);
		expect(runtimeKey(`${ORIGIN}/ns/v/src/data.json?import&t=1700000000000`, canon)).toBe(`${ORIGIN}/ns/v/src/data.json?import&t=1700000000000`);
		expect(runtimeKey(`${ORIGIN}/ns/v/src/main.ts`, canon)).not.toBe(runtimeKey(`${ORIGIN}/ns/v/src/main.ts?t=1700000000000`, canon));
	});

	it("preserves Angular's /@ng/component query under /ns/v", () => {
		const canon = getCanonicalization(angular);
		expect(canon.preserveQueryFor).toEqual(['/@ng/component']);
		const url = `${ORIGIN}/ns/v/src/app/@ng/component?c=src%2Fapp%2Fhome.component.ts%40HomeComponent&t=1700000000000`;
		expect(canon.preserveQueryFor.some((p) => new URL(url).pathname.includes(p))).toBe(true);
		expect(runtimeKey(url, canon)).toBe(url);
	});

	it('declares no query-normalizing dev prefix', () => {
		expect(getCanonicalization()).toEqual({ stripParams: [], forPathPrefixes: [], preserveQueryFor: [] });
	});
});
