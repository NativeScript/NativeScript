import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { rewriteImports } from './websocket.js';

describe('rewriteImports NativeScript runtime plugin routing', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('rewrites a root runtime plugin main entry to the bare package specifier', () => {
		const input = `import { Manager } from "/node_modules/@nativescript-community/gesturehandler/gesturehandler";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "@nativescript-community/gesturehandler"');
		expect(out).not.toContain('/ns/m/node_modules/@nativescript-community/gesturehandler/gesturehandler');
	});

	it('rewrites a platform runtime plugin main entry to the bare package specifier', () => {
		const input = `import { install } from "/node_modules/@nativescript-community/gesturehandler/gesturehandler.ios.js";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "@nativescript-community/gesturehandler"');
		expect(out).not.toContain('gesturehandler.ios.js');
	});

	it('keeps non-main runtime plugin subpaths on HTTP routing', () => {
		const input = `import { BaseGestureRootView } from "/node_modules/@nativescript-community/gesturehandler/gesturehandler.common.js";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/gesturehandler/gesturehandler.common.js"');
	});

	it('keeps @nativescript/angular root export files on HTTP instead of collapsing them into plugin vendor routing', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@nativescript', 'angular'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@nativescript', 'angular', 'package.json'),
			JSON.stringify(
				{
					name: '@nativescript/angular',
					exports: {
						'.': './fesm2022/nativescript-angular.mjs',
						'./polyfills': './fesm2022/nativescript-angular-polyfills.mjs',
					},
				},
				null,
				2,
			),
		);

		const input = `import { registerElement } from "/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs"');
		expect(out).not.toContain('from "@nativescript/angular"');
	});

	it('keeps nested runtime plugin internals on their exact bare package subpath', () => {
		const input = `import { Line } from "/node_modules/@nativescript-community/ui-canvas/shapes/index.js";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "@nativescript-community/ui-canvas/shapes/index.js"');
		expect(out).not.toContain('/ns/m/node_modules/@nativescript-community/ui-canvas/shapes/index.js');
	});

	it('keeps deep runtime-plugin data modules on their exact bare package subpath', () => {
		const input = `import { LineData } from "/node_modules/@nativescript-community/ui-chart/data/LineData.js";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "@nativescript-community/ui-chart/data/LineData.js"');
		expect(out).not.toContain('from "@nativescript-community/ui-chart"');
		expect(out).not.toContain('/ns/m/node_modules/@nativescript-community/ui-chart/data/LineData.js');
	});

	it('rewrites bare extensionless runtime-plugin subpaths from user code to explicit HTTP URLs', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@mleleux', 'nativescript-revenuecat'), { recursive: true });
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

		const input = `import { BillingPeriod } from "@mleleux/nativescript-revenuecat/Product/common";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@mleleux/nativescript-revenuecat/Product/common"');
		expect(out).not.toContain('from "@mleleux/nativescript-revenuecat/Product/common"');
	});

	it('rewrites dotted bare runtime-plugin subpaths from user code to explicit HTTP URLs', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
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

		const input = `import { CanvasBase } from "@nativescript-community/ui-canvas/index.common";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/index.common"');
		expect(out).not.toContain('from "@nativescript-community/ui-canvas/index.common"');
	});

	it('keeps a runtime-plugin root entry on HTTP when the same module preserves a subpath from that package family', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
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

		const input = [`import { CanvasView } from "/node_modules/@nativescript-community/ui-canvas/index.js";`, `import { Line } from "@nativescript-community/ui-canvas/shapes";`].join('\n');
		const out = rewriteImports(input, '/src/app.component.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/index.js"');
		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/shapes"');
		expect(out).not.toContain('from "@nativescript-community/ui-canvas"');
	});

	it('keeps resolved runtime-plugin exact subpaths on HTTP when the same module also loads the root package family', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
		tempRoots.push(root);

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
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'index.js'), 'export const CanvasView = {}\n');
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'ui-canvas', 'shapes', 'index.js'), 'export const Line = {}\n');

		const input = [`import { CanvasView } from "/node_modules/@nativescript-community/ui-canvas/index.js";`, `import { Line } from "/node_modules/@nativescript-community/ui-canvas/shapes/index.js";`].join('\n');
		const out = rewriteImports(input, '/src/app.component.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/index.js"');
		expect(out).toContain('from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-canvas/shapes/index.js"');
		expect(out).not.toContain('from "@nativescript-community/ui-canvas/shapes/index.js"');
	});

	it('keeps declared CommonJS main-entry runtime plugins on the root bare package', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-runtime-plugin-route-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@norrix', 'client-sdk'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@norrix', 'client-sdk', 'package.json'),
			JSON.stringify(
				{
					name: '@norrix/client-sdk',
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

		const input = `import { SyncStatus } from "/node_modules/@norrix/client-sdk/dist/index.commonjs.js";\n`;
		const out = rewriteImports(input, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);

		expect(out).toContain('from "@norrix/client-sdk"');
		expect(out).not.toContain('from "@norrix/client-sdk/dist/index.commonjs.js"');
		expect(out).not.toContain('/ns/m/node_modules/@norrix/client-sdk/dist/index.commonjs.js');
	});
});
