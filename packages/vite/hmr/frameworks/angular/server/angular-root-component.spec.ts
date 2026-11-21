import { describe, expect, it } from 'vitest';

import { isSameAngularModuleRel, resolveBootstrapRootComponent, toExtensionlessModuleRel } from './angular-root-component.js';

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
