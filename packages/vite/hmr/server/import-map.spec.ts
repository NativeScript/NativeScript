import { beforeEach, describe, expect, it, vi } from 'vitest';

const packageJsons = vi.hoisted(() => new Map<string, string>());

vi.mock('fs', () => ({
	readFileSync: (file: string) => {
		const text = packageJsons.get(String(file).replace(/\\/g, '/'));
		if (text === undefined) throw Object.assign(new Error(`ENOENT: ${file}`), { code: 'ENOENT' });
		return text;
	},
}));

import { collectImportMapSpecifiers, getCanonicalization, getVolatilePatterns } from './import-map.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';

const ORIGIN = 'http://localhost:5173';
const APP = '/workspace/app';

function setAppPackageJson(pkg: Record<string, unknown>) {
	packageJsons.set(`${APP}/package.json`, JSON.stringify(pkg));
}

function collect(strategy?: FrameworkServerStrategy) {
	return collectImportMapSpecifiers({ origin: ORIGIN, flavor: strategy?.flavor ?? 'typescript', projectRoot: APP, strategy });
}

describe('collectImportMapSpecifiers', () => {
	beforeEach(() => {
		packageJsons.clear();
	});

	it("keys @nativescript/core first, then the package name of each of the app's dependencies", () => {
		setAppPackageJson({
			dependencies: { '@nativescript/core': '~9.0.0', rxjs: '^7.8.0', '@ngx-translate/core': '^15.0.0' },
			devDependencies: { 'only-at-build-time': '^1.0.0' },
		});

		const specifiers = collect();

		expect(specifiers.slice(0, 3)).toEqual(['@nativescript/core', 'rxjs', '@ngx-translate/core']);
		expect(specifiers.filter((spec) => spec === '@nativescript/core')).toHaveLength(1);
		expect(specifiers).not.toContain('only-at-build-time');
		expect(specifiers.some((spec) => spec.endsWith('/'))).toBe(false);
	});

	it('leaves out build tooling, platform runtimes and this package', () => {
		setAppPackageJson({
			dependencies: { '@nativescript/vite': '*', '@nativescript/ios': '*', '@nativescript/android': '*', vite: '*', '@types/node': '*', '@vitejs/plugin-vue': '*', 'solid-js': '*' },
		});

		const specifiers = collect();

		expect(specifiers).not.toContain('@nativescript/vite');
		expect(specifiers).not.toContain('@nativescript/ios');
		expect(specifiers).not.toContain('@nativescript/android');
		expect(specifiers).not.toContain('vite');
		expect(specifiers).not.toContain('@types/node');
		expect(specifiers).not.toContain('@vitejs/plugin-vue');
		expect(specifiers).toContain('solid-js');
	});

	it('keys only @nativescript/core and the builtins when the app has no readable package.json', () => {
		const specifiers = collect();

		expect(specifiers[0]).toBe('@nativescript/core');
		expect(specifiers.every((spec) => spec === '@nativescript/core' || spec.startsWith('node:'))).toBe(true);
	});

	it('adds framework specifiers once, after the dependencies', () => {
		setAppPackageJson({ dependencies: { 'solid-js': '*', '@nativescript-community/solid-js': '*' } });

		const specifiers = collect({ flavor: 'solid', importMapSpecifiers: () => ['solid-js', 'solid-js/web'] });

		expect(specifiers.filter((spec) => spec === 'solid-js')).toHaveLength(1);
		expect(specifiers.indexOf('solid-js/web')).toBeGreaterThan(specifiers.indexOf('@nativescript-community/solid-js'));
	});

	it('keys node: builtins but not their bare names', () => {
		const specifiers = collect();

		expect(specifiers).toContain('node:url');
		expect(specifiers).toContain('node:path');
		expect(specifiers).not.toContain('url');
	});

	it('reads package.json on every call, so an added dependency is keyed without a restart', () => {
		setAppPackageJson({ dependencies: {} });
		expect(collect()).not.toContain('rxjs');

		setAppPackageJson({ dependencies: { rxjs: '*' } });
		expect(collect()).toContain('rxjs');
	});
});

describe('getVolatilePatterns', () => {
	it("is only the strategy's patterns: a Vite `?v=` URL is one module instance, not a re-fetch", () => {
		expect(getVolatilePatterns()).toEqual([]);
		expect(getVolatilePatterns({ flavor: 'angular', volatilePatterns: () => ['/@ng/component'] })).toEqual(['/@ng/component']);
	});
});

describe('getCanonicalization', () => {
	const angular = { flavor: 'angular', preserveQueryPaths: () => ['/@ng/component'] } as FrameworkServerStrategy;

	it("preserves the query of Angular's component-relative /@ng/component URLs (the runtime matches by path substring)", () => {
		const canon = getCanonicalization(angular);
		expect(canon.preserveQueryFor).toEqual(['/@ng/component']);
		const url = `${ORIGIN}/src/app/home/@ng/component?c=src%2Fapp%2Fhome%2Fhome.component.ts%40HomeComponent&t=1700000000000`;
		expect(canon.preserveQueryFor.some((p) => new URL(url).pathname.includes(p))).toBe(true);
	});

	it('declares no query-normalizing dev prefix, so the runtime keeps every query as identity', () => {
		expect(getCanonicalization()).toEqual({ preserveQueryFor: [] });
	});
});
