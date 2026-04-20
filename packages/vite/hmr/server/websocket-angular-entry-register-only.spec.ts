import { describe, expect, it } from 'vitest';

import { prepareAngularEntryForDevice, rewriteAngularEntryRegisterOnly } from './websocket.js';

describe('rewriteAngularEntryRegisterOnly', () => {
	it('rewrites Angular entry modules to support register-only refreshes', () => {
		const input = `
import { runNativeScriptAngularApp } from '@nativescript/angular';
import { initBackgroundHttp } from '@nativescript/background-http';

initBackgroundHttp();

runNativeScriptAngularApp({
	appModuleBootstrap: () => bootstrapApplication(AppComponent),
});
`;

		const output = rewriteAngularEntryRegisterOnly(input);

		expect(output).toContain('import * as __nsAngularCoreForHmr from "@angular/core";');
		expect(output).toContain('globalThis.__NS_REMEMBER_ANGULAR_CORE__(__nsAngularCoreForHmr);');
		expect(output).toContain('if (!globalThis.__NS_ANGULAR_HMR_REGISTER_ONLY__)');
		expect(output).toContain('const __nsAngularAppRunOptions = {');
		expect(output).toContain('globalThis.__NS_UPDATE_ANGULAR_APP_OPTIONS__(__nsAngularAppRunOptions);');
		expect(output).toContain('runNativeScriptAngularApp(__nsAngularAppRunOptions);');
		expect(output).toContain('initBackgroundHttp();');
	});

	it('normalizes the injected Angular core handoff import through the HTTP Angular module path', () => {
		const input = `
import { runNativeScriptAngularApp } from '@nativescript/angular';
import { enableProdMode } from '@angular/core';

runNativeScriptAngularApp({
	appModuleBootstrap: () => bootstrapApplication(AppComponent),
});
`;

		const output = prepareAngularEntryForDevice(input, '/src/main.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('import * as __nsAngularCoreForHmr from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";');
		expect(output).toContain('globalThis.__NS_REMEMBER_ANGULAR_CORE__(__nsAngularCoreForHmr);');
		expect(output).not.toContain('import * as __nsAngularCoreForHmr from "@angular/core";');
	});

	it('leaves non-entry Angular modules unchanged', () => {
		const input = `export const ready = true;\n`;

		expect(rewriteAngularEntryRegisterOnly(input)).toBe(input);
	});
});
