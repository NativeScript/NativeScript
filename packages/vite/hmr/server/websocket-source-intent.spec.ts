import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { __test_processCodeForDevice as processCodeForDevice, getProcessCodeResolvedSpecifierOverrides, rewriteImports } from './websocket.js';

describe('processCodeForDevice source import intent', () => {
	const tempRoots: string[] = [];
	const originalCwd = process.cwd();

	afterEach(() => {
		process.chdir(originalCwd);
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('restores extensionless runtime-plugin subpaths from resolved node_modules imports for app modules', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-source-intent-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'src'), { recursive: true });
		mkdirSync(join(root, 'node_modules', '@mleleux', 'nativescript-revenuecat', 'Product'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@mleleux', 'nativescript-revenuecat', 'package.json'),
			JSON.stringify(
				{
					name: '@mleleux/nativescript-revenuecat',
					main: './index',
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
		writeFileSync(join(root, 'src', 'app.ts'), [`import { BillingPeriod } from '@mleleux/nativescript-revenuecat/Product/common';`, `export const monthly = BillingPeriod.MONTH;`].join('\n'));

		process.chdir(root);

		const viteTransformed = [`import { BillingPeriod } from "/node_modules/@mleleux/nativescript-revenuecat/Product/common.js";`, `export const monthly = BillingPeriod.MONTH;`].join('\n');
		const processed = processCodeForDevice(viteTransformed, false, true, false, '/src/app.ts');
		expect(processed).toContain(`from "@mleleux/nativescript-revenuecat/Product/common"`);
		expect(processed).not.toContain(`from "/node_modules/@mleleux/nativescript-revenuecat/Product/common.js"`);
		expect(processed).not.toMatch(/__nsVendorRegistry\.has\(['"]@mleleux\/nativescript-revenuecat\/Product\/common\.js['"]\)/);

		const rewritten = rewriteImports(processed, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@mleleux/nativescript-revenuecat/Product/common"');
	});

	it('restores extensionless runtime-plugin subpaths when the served app module id is extensionless', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-source-intent-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'src'), { recursive: true });
		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'shapes'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript-community/ui-canvas',
					main: './index',
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
		writeFileSync(join(root, 'src', 'app.component.ts'), [`import { Line } from '@nativescript-community/ui-canvas/shapes';`, `export const canvasLine = Line;`].join('\n'));

		process.chdir(root);

		const viteTransformed = [`import { Line } from "/node_modules/@nativescript-community/ui-canvas/shapes/index.js";`, `export const canvasLine = Line;`].join('\n');
		const processed = processCodeForDevice(viteTransformed, false, true, false, '/src/app.component');
		expect(processed).toContain(`from "@nativescript-community/ui-canvas/shapes"`);
		expect(processed).not.toContain(`from "/node_modules/@nativescript-community/ui-canvas/shapes/index.js"`);
		expect(processed).not.toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-canvas\/shapes\/index\.js['"]\)/);

		const rewritten = rewriteImports(processed, '/src/app.component', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/shapes"');
	});

	it('preserves mixed runtime-plugin root and subpath imports so both stay on the /ns/m HTTP path', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-source-intent-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'src'), { recursive: true });
		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'shapes'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript-community/ui-canvas',
					main: './index',
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
		writeFileSync(join(root, 'src', 'app.component.ts'), [`import { CanvasView } from '@nativescript-community/ui-canvas';`, `import { Line } from '@nativescript-community/ui-canvas/shapes';`, `export const canvasTypes = [CanvasView, Line];`].join('\n'));

		process.chdir(root);

		const viteTransformed = [`import { CanvasView } from "/node_modules/@nativescript-community/ui-canvas/index.ios.js";`, `import { Line } from "/node_modules/@nativescript-community/ui-canvas/shapes/index.js";`, `export const canvasTypes = [CanvasView, Line];`].join('\n');
		const overrides = getProcessCodeResolvedSpecifierOverrides('/src/app.component.ts', root);
		expect(overrides?.get('@nativescript-community/ui-canvas/index.ios.js')).toBe('@nativescript-community/ui-canvas/index.ios.js');
		const processed = processCodeForDevice(viteTransformed, false, true, false, '/src/app.component.ts');

		expect(processed).toContain(`from "@nativescript-community/ui-canvas/index.ios.js"`);
		expect(processed).toContain(`from "@nativescript-community/ui-canvas/shapes"`);
		expect(processed).not.toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-canvas['"]\)/);

		const rewritten = rewriteImports(processed, '/src/app.component.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/index.ios.js"');
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/shapes"');
	});

	it('restores extensionless same-package runtime-plugin imports for node_modules modules before rewrite routing', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-source-intent-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'ui-chart', 'data'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@nativescript-community', 'ui-chart', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript-community/ui-chart',
					main: './index',
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
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'ui-chart', 'data', 'LineDataSet.js'), [`import { LineRadarDataSet } from './LineRadarDataSet';`, `export class LineDataSet extends LineRadarDataSet {}`].join('\n'));

		process.chdir(root);

		const viteTransformed = [`import { LineRadarDataSet } from "/node_modules/@nativescript-community/ui-chart/data/LineRadarDataSet.js";`, `export class LineDataSet extends LineRadarDataSet {}`].join('\n');
		const sourceId = '/node_modules/@nativescript-community/ui-chart/data/LineDataSet.js';
		const processed = processCodeForDevice(viteTransformed, false, true, true, sourceId);

		expect(processed).toContain(`from "@nativescript-community/ui-chart/data/LineRadarDataSet"`);
		expect(processed).not.toContain(`from "/node_modules/@nativescript-community/ui-chart/data/LineRadarDataSet.js"`);
		expect(processed).not.toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-chart\/data\/LineRadarDataSet\.js['"]\)/);

		const rewritten = rewriteImports(processed, sourceId, new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-chart/data/LineRadarDataSet"');
		expect(rewritten).not.toContain('from "@nativescript-community/ui-chart/data/LineRadarDataSet"');
	});

	it('restores dotted same-package runtime-plugin imports for node_modules modules before rewrite routing', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-source-intent-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript-community/ui-canvas',
					main: './index',
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
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'index.ios.js'), [`import { Canvas, Paint } from './canvas.ios';`, `import { CanvasBase } from './index.common';`, `export class CanvasView extends CanvasBase {}`, `export const deps = [Canvas, Paint];`].join('\n'));

		process.chdir(root);

		const sourceId = '/node_modules/@nativescript-community/ui-canvas/index.ios.js';
		const viteTransformed = [`import { Canvas, Paint } from "/node_modules/@nativescript-community/ui-canvas/canvas.ios.js";`, `import { CanvasBase } from "/node_modules/@nativescript-community/ui-canvas/index.common.js";`, `export class CanvasView extends CanvasBase {}`, `export const deps = [Canvas, Paint];`].join('\n');
		const processed = processCodeForDevice(viteTransformed, false, true, true, sourceId);

		expect(processed).toContain(`from "@nativescript-community/ui-canvas/canvas.ios"`);
		expect(processed).toContain(`from "@nativescript-community/ui-canvas/index.common"`);
		expect(processed).not.toContain(`from "/node_modules/@nativescript-community/ui-canvas/index.common.js"`);
		expect(processed).not.toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-canvas['"]\)/);

		const rewritten = rewriteImports(processed, sourceId, new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/canvas.ios"');
		expect(rewritten).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/index.common"');
	});
});
