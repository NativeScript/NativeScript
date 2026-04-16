import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tryReadRawExplicitJavaScriptModule } from './websocket.js';

describe('tryReadRawExplicitJavaScriptModule', () => {
	let fixtureRoot: string | null = null;

	afterEach(() => {
		if (fixtureRoot) {
			rmSync(fixtureRoot, { recursive: true, force: true });
			fixtureRoot = null;
		}
	});

	it('reads explicit on-disk JavaScript modules under the project root', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-raw-js-'));
		mkdirSync(join(fixtureRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/pkg/index.ios.js'), 'export const value = 42;\n');

		const result = tryReadRawExplicitJavaScriptModule('/node_modules/pkg/index.ios.js', fixtureRoot);

		expect(result).toEqual({
			code: 'export const value = 42;\n',
			resolvedId: '/node_modules/pkg/index.ios.js',
		});
	});

	it('skips raw explicit JavaScript fastpath for NativeScript runtime plugins', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-raw-js-'));
		mkdirSync(join(fixtureRoot, 'node_modules/@nativescript-community/gesturehandler'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/@nativescript-community/gesturehandler/gesturehandler.common.js'), 'import { Manager } from "./gesturehandler";\nexport const value = Manager;\n');
		writeFileSync(join(fixtureRoot, 'node_modules/@nativescript-community/gesturehandler/gesturehandler.ios.js'), 'export const Manager = 42;\n');

		expect(tryReadRawExplicitJavaScriptModule('/node_modules/@nativescript-community/gesturehandler/gesturehandler.common.js', fixtureRoot)).toBeNull();
		expect(tryReadRawExplicitJavaScriptModule('/node_modules/@nativescript-community/gesturehandler/gesturehandler.ios.js', fixtureRoot)).toBeNull();
	});

	it('skips modules outside the project root and non-JavaScript requests', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-raw-js-'));
		mkdirSync(join(fixtureRoot, 'src'), { recursive: true });
		mkdirSync(join(fixtureRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'src/app.ts'), 'export const app = true;\n');
		writeFileSync(join(fixtureRoot, 'node_modules/pkg/node-module-helper.js'), 'import { createRequire } from "module";\nconst require = createRequire(import.meta.url);\nexport { require };\n');

		expect(tryReadRawExplicitJavaScriptModule('/src/app.ts', fixtureRoot)).toBeNull();
		expect(tryReadRawExplicitJavaScriptModule('/../secrets.js', fixtureRoot)).toBeNull();
		expect(tryReadRawExplicitJavaScriptModule('/@id/__x00__virtual.js', fixtureRoot)).toBeNull();
		expect(tryReadRawExplicitJavaScriptModule('/node_modules/@angular/core/fesm2022/core.mjs', fixtureRoot)).toBeNull();
		expect(tryReadRawExplicitJavaScriptModule('/node_modules/pkg/node-module-helper.js', fixtureRoot)).toBeNull();
	});
});
