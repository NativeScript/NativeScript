import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { clearVendorManifest, registerVendorManifest } from '../shared/vendor/registry.js';
import { __test_resolveVendorRouting as resolveVendorRouting } from './websocket.js';

describe('resolveVendorRouting', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		clearVendorManifest();
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('routes non-exports main field files like stacktrace.js through the vendor bridge', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', 'stacktrace-js'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'stacktrace-js', 'package.json'), JSON.stringify({ name: 'stacktrace-js', version: '2.0.2', main: './stacktrace.js' }, null, 2));

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'stacktrace-js': {
					id: 'stacktrace-js',
					exports: { default: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('stacktrace-js/stacktrace.js', root)).toEqual({ route: 'vendor', bareSpec: 'stacktrace-js' });
	});

	it('keeps export-based nested build outputs on HTTP', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@angular', 'common'), { recursive: true });
		writeFileSync(
			join(root, 'node_modules', '@angular', 'common', 'package.json'),
			JSON.stringify(
				{
					name: '@angular/common',
					version: '0.0.0',
					exports: {
						'.': './fesm2022/common.mjs',
						'./http': './fesm2022/http.mjs',
					},
				},
				null,
				2,
			),
		);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'@angular/common': {
					id: '@angular/common',
					exports: { CommonModule: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('@angular/common/fesm2022/common.mjs', root)).toEqual({ route: 'http' });
	});

	it('keeps @nativescript/angular root export files on HTTP instead of collapsing them into plugin vendor routing', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@nativescript', 'angular'), { recursive: true });
		writeFileSync(
			join(root, 'node_modules', '@nativescript', 'angular', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript/angular',
					version: '0.0.0',
					exports: {
						'.': './fesm2022/nativescript-angular.mjs',
						'./polyfills': './fesm2022/nativescript-angular-polyfills.mjs',
					},
				},
				null,
				2,
			),
		);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'@nativescript/angular': {
					id: '@nativescript/angular',
					exports: { registerElement: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('@nativescript/angular/fesm2022/nativescript-angular.mjs', root)).toEqual({ route: 'http' });
	});

	it('routes NativeScript metadata packages with CommonJS main entries through the vendor bridge', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@norrix', 'client-sdk'), { recursive: true });
		writeFileSync(
			join(root, 'node_modules', '@norrix', 'client-sdk', 'package.json'),
			JSON.stringify(
				{
					name: '@norrix/client-sdk',
					version: '1.0.0',
					main: './dist/index.commonjs.js',
					peerDependencies: {
						'@nativescript/core': '>=8.0.0',
					},
					nativescript: {
						platforms: {
							ios: '8.0.0',
						},
					},
				},
				null,
				2,
			),
		);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'@norrix/client-sdk': {
					id: '@norrix/client-sdk',
					exports: { default: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('@norrix/client-sdk/dist/index.commonjs.js', root)).toEqual({ route: 'vendor', bareSpec: '@norrix/client-sdk' });
	});

	it('routes nested internal runtime-plugin subpaths through their exact bare package subpath', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'@nativescript-community/ui-canvas': {
					id: '@nativescript-community/ui-canvas',
					exports: { CanvasView: true, Line: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('@nativescript-community/ui-canvas/shapes/index.js', root)).toEqual({ route: 'vendor', bareSpec: '@nativescript-community/ui-canvas/shapes/index.js' });
	});

	it('keeps deep runtime-plugin data modules on their exact bare package subpath', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'@nativescript-community/ui-chart': {
					id: '@nativescript-community/ui-chart',
					exports: { LineChart: true, PieChart: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('@nativescript-community/ui-chart/data/LineData.js', root)).toEqual({ route: 'vendor', bareSpec: '@nativescript-community/ui-chart/data/LineData.js' });
	});

	it('keeps nested package entry points on HTTP instead of collapsing them to the root plugin', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-vendor-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', 'nativescript-fonticon', 'angular'), { recursive: true });
		writeFileSync(
			join(root, 'node_modules', 'nativescript-fonticon', 'package.json'),
			JSON.stringify(
				{
					name: 'nativescript-fonticon',
					version: '8.1.3',
					main: './index.js',
					nativescript: {
						platforms: {
							ios: '6.0.0',
						},
					},
				},
				null,
				2,
			),
		);
		writeFileSync(
			join(root, 'node_modules', 'nativescript-fonticon', 'angular', 'package.json'),
			JSON.stringify(
				{
					name: 'nativescript-fonticon-angular',
					version: '8.1.3',
					module: './fesm2022/nativescript-fonticon-angular.mjs',
					exports: {
						'.': './fesm2022/nativescript-fonticon-angular.mjs',
					},
				},
				null,
				2,
			),
		);

		registerVendorManifest({
			version: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			hash: 'test',
			modules: {
				'nativescript-fonticon': {
					id: 'nativescript-fonticon',
					exports: { FontIconFactory: true },
				},
			},
			aliases: {},
		});

		expect(resolveVendorRouting('nativescript-fonticon/angular/fesm2022/nativescript-fonticon-angular.mjs', root)).toEqual({ route: 'http' });
	});
});
