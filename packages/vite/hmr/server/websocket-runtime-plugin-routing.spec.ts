import { describe, expect, it } from 'vitest';
import { rewriteImports } from './websocket.js';

describe('rewriteImports NativeScript runtime plugin routing', () => {
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
});
