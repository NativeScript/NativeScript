import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { __test_collectVendorModules as collectVendorModules, __test_createVendorBundleRuntimeModule as createVendorBundleRuntimeModule } from './manifest.js';

describe('collectVendorModules', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('includes stacktrace-js when the package resolves in the project', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', 'stacktrace-js'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: {} }, null, 2));
		writeFileSync(join(root, 'node_modules', 'stacktrace-js', 'package.json'), JSON.stringify({ name: 'stacktrace-js', version: '1.0.0' }, null, 2));

		const collected = collectVendorModules(root, 'ios', 'angular');

		expect(collected.entries).toContain('stacktrace-js');
	});

	it('skips stacktrace-js when the package is not installed', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: {} }, null, 2));

		const collected = collectVendorModules(root, 'ios', 'angular');

		expect(collected.entries).not.toContain('stacktrace-js');
	});

	it('excludes Angular framework packages so they resolve only through HTTP', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(
			join(root, 'package.json'),
			JSON.stringify(
				{
					name: 'fixture-app',
					version: '0.0.0',
					dependencies: {
						'@nativescript/angular': '*',
						'@angular/core': '*',
						'@angular/common': '*',
						'@angular/compiler': '*',
						'@angular/forms': '*',
						'@angular/router': '*',
						'@angular/platform-browser': '*',
					},
				},
				null,
				2,
			),
		);

		for (const name of ['@nativescript/angular', '@angular/core', '@angular/common', '@angular/compiler', '@angular/forms', '@angular/router', '@angular/platform-browser']) {
			mkdirSync(join(root, 'node_modules', ...name.split('/')), { recursive: true });
			writeFileSync(join(root, 'node_modules', ...name.split('/'), 'package.json'), JSON.stringify({ name, version: '1.0.0' }, null, 2));
		}

		const collected = collectVendorModules(root, 'ios', 'angular');

		for (const name of ['@nativescript/angular', '@angular/core', '@angular/common', '@angular/compiler', '@angular/forms', '@angular/router', '@angular/platform-browser']) {
			expect(collected.entries).not.toContain(name);
		}
	});

	it('emits the same runtime bundle contract for served vendor modules', () => {
		const code = createVendorBundleRuntimeModule({
			code: 'export const __nsVendorModuleMap = { "pinia": {} };\n',
			manifest: {
				version: 1,
				createdAt: '2026-04-18T00:00:00.000Z',
				hash: 'hash-123',
				modules: {
					pinia: {
						id: 'pinia',
						exports: { '*': true },
					},
				},
				aliases: {},
			},
			entries: ['pinia'],
		});

		expect(code).toContain('export const __nsVendorModuleMap = { "pinia": {} };');
		expect(code).toContain('export const vendorManifest = {"version":1,"createdAt":"2026-04-18T00:00:00.000Z","hash":"hash-123"');
		expect(code).toContain('export default vendorManifest;');
	});
});
