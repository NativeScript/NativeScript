import { describe, expect, it } from 'vitest';

import { decodeAngularComponentUpdateId, isAngularRootComponentUpdate, isSameAngularModuleRel, resolveBootstrapRootComponent, toExtensionlessModuleRel } from './angular-root-component.js';

const STANDALONE_MAIN = `
import { bootstrapApplication, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideZonelessChangeDetection()],
    }),
});
`;

describe('toExtensionlessModuleRel', () => {
	it('normalizes to a leading-slash extensionless POSIX key', () => {
		expect(toExtensionlessModuleRel('src/app/app.component.ts')).toBe('/src/app/app.component');
		expect(toExtensionlessModuleRel('/src/app/app.component.html')).toBe('/src/app/app.component');
		expect(toExtensionlessModuleRel('\\src\\app\\app.component.scss')).toBe('/src/app/app.component');
		expect(toExtensionlessModuleRel('//src//app//app.component')).toBe('/src/app/app.component');
	});
});

describe('isSameAngularModuleRel', () => {
	it('matches a template edit against its component regardless of extension', () => {
		expect(isSameAngularModuleRel('/src/app/app.component.html', '/src/app/app.component.ts')).toBe(true);
		expect(isSameAngularModuleRel('src/app/app.component', '/src/app/app.component.ts')).toBe(true);
	});
	it('does not match different modules or empty inputs', () => {
		expect(isSameAngularModuleRel('/src/app/app.component.ts', '/src/app/home.component.ts')).toBe(false);
		expect(isSameAngularModuleRel('', '/src/app/app.component.ts')).toBe(false);
		expect(isSameAngularModuleRel(null, undefined)).toBe(false);
	});
});

describe('resolveBootstrapRootComponent', () => {
	it('resolves a standalone bootstrapApplication(AppComponent) entry', () => {
		const root = resolveBootstrapRootComponent({ entrySource: STANDALONE_MAIN, entryRel: '/src/main.ts' });
		expect(root).toEqual({ moduleRel: '/src/app/app.component', className: 'AppComponent' });
	});

	it('traces an aliased named import back to the declared class name', () => {
		const source = `import { AppComponent as Root } from './app/app.component';\nbootstrapApplication(Root, {});`;
		const root = resolveBootstrapRootComponent({ entrySource: source, entryRel: '/src/main.ts' });
		expect(root).toEqual({ moduleRel: '/src/app/app.component', className: 'AppComponent' });
	});

	it('handles a default import (falls back to the local bootstrap name)', () => {
		const source = `import AppComponent from './app/app.component';\nbootstrapApplication(AppComponent, {});`;
		const root = resolveBootstrapRootComponent({ entrySource: source, entryRel: '/src/main.ts' });
		expect(root).toEqual({ moduleRel: '/src/app/app.component', className: 'AppComponent' });
	});

	it('resolves a ~/ aliased import against the app root', () => {
		const source = `import { AppComponent } from '~/app/app.component';\nbootstrapApplication(AppComponent, {});`;
		const root = resolveBootstrapRootComponent({ entrySource: source, entryRel: '/src/main.ts', appRootRel: '/src' });
		expect(root).toEqual({ moduleRel: '/src/app/app.component', className: 'AppComponent' });
	});

	it('returns null when no bootstrapApplication call is present (e.g. NgModule)', () => {
		const source = `import { AppModule } from './app/app.module';\nplatformNativeScriptDynamic().bootstrapModule(AppModule);`;
		expect(resolveBootstrapRootComponent({ entrySource: source, entryRel: '/src/main.ts' })).toBeNull();
	});

	it('returns null when the bootstrapped symbol has no resolvable import', () => {
		const source = `const AppComponent = class {};\nbootstrapApplication(AppComponent, {});`;
		expect(resolveBootstrapRootComponent({ entrySource: source, entryRel: '/src/main.ts' })).toBeNull();
	});
});

describe('decodeAngularComponentUpdateId', () => {
	it('decodes Analog encodeURIComponent(relativePath@ClassName) ids', () => {
		const id = encodeURIComponent('src/app/app.component.ts@AppComponent');
		expect(decodeAngularComponentUpdateId(id)).toEqual({ moduleRel: '/src/app/app.component', className: 'AppComponent' });
	});
	it('tolerates non-encoded ids and missing class names', () => {
		expect(decodeAngularComponentUpdateId('src/app/app.component.ts')).toEqual({ moduleRel: '/src/app/app.component', className: '' });
	});
	it('returns null for empty/invalid input', () => {
		expect(decodeAngularComponentUpdateId('')).toBeNull();
		expect(decodeAngularComponentUpdateId(undefined)).toBeNull();
		expect(decodeAngularComponentUpdateId(42)).toBeNull();
	});
});

describe('isAngularRootComponentUpdate', () => {
	const root = { moduleRel: '/src/app/app.component', className: 'AppComponent' };

	it('matches the root component by module path', () => {
		const id = encodeURIComponent('src/app/app.component.ts@AppComponent');
		expect(isAngularRootComponentUpdate(root, id)).toBe(true);
	});

	it('matches the root component by class name when the path base differs', () => {
		const id = encodeURIComponent('apps/demo/src/app/app.component.ts@AppComponent');
		// Path differs (monorepo base), but class name still identifies the root.
		expect(isAngularRootComponentUpdate(root, id)).toBe(true);
	});

	it('does not match a non-root component', () => {
		const id = encodeURIComponent('src/app/home/home.component.ts@HomeComponent');
		expect(isAngularRootComponentUpdate(root, id)).toBe(false);
	});

	it('is false when no root is known', () => {
		expect(isAngularRootComponentUpdate(null, encodeURIComponent('src/app/app.component.ts@AppComponent'))).toBe(false);
	});
});
