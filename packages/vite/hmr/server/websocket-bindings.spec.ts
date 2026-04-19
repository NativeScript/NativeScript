import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, it, expect } from 'vitest';
import { ensureNativeScriptModuleBindings, rewriteImports } from './websocket.js';

// Helper to normalize whitespace for robust assertions
function squish(s: string) {
	return s.replace(/\s+/g, ' ').trim();
}

describe('ensureNativeScriptModuleBindings', () => {
	it('rewrites pinia named import to vendor require binding and binds defineStore', () => {
		const input = `import { defineStore } from "pinia";\nexport const useServices = defineStore('services', () => ({}));\n`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// Drops the original import
		expect(text).not.toMatch(/from\s+["']pinia["']/);
		// Injects vendor registry + require (lenient checks to avoid brittle regex)
		expect(text).toContain('globalThis.__nsVendorRegistry');
		expect(text).toContain('new Map()');
		expect(text).toMatch(/(?:const|var)\s+__nsVendorRequire\s*=\s*\(typeof\s+globalThis\.__nsRequire|typeof\s+globalThis\.require/);
		// Allocates a module cache var and resolves 'pinia'
		expect(text).toMatch(/(?:const|var) __nsVendorModule_\d+\s*=\s*__nsVendorRegistry\.has\(['"]pinia['"]\)/);
		// Binds defineStore via helper from default or namespace
		expect(text).toMatch(/(?:const|var)\s+defineStore\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*["']defineStore["']\)/);
		// Uses defineStore call
		expect(text).toMatch(/defineStore\('services'/);
	});

	it('does not vendor-inject @nativescript/core imports', () => {
		const input = `import { Frame } from '@nativescript/core';\nexport const f = Frame;\n`;
		const out = ensureNativeScriptModuleBindings(input);
		// Should leave the import intact (no vendor registry prelude injected)
		expect(out).not.toMatch(/__nsVendorRegistry/);
		expect(out).toMatch(/from ['"]@nativescript\/core['"]/);
	});

	it('does not vendor-inject @nativescript/angular root imports', () => {
		const input = `import { registerElement } from '@nativescript/angular';\nexport const fn = registerElement;\n`;
		const out = ensureNativeScriptModuleBindings(input);

		expect(out).not.toMatch(/__nsVendorRegistry/);
		expect(out).toMatch(/from ['"]@nativescript\/angular['"]/);
	});

	it('handles named-only plugin import without leaving broken import remnants', () => {
		const input = `import { install } from '@nativescript/firebase-messaging';\nexport const x = install;`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// Original import removed
		expect(text).not.toMatch(/import\s*\{\s*install\s*\}\s*from/);
		// Should bind a named const for install via helper
		expect(text).toMatch(/(?:const|var)\s+install\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*["']install["']\)/);
	});

	it('handles default plugin import with safe helper variable', () => {
		const input = `import FM from '@nativescript/firebase-messaging';\nexport const y = FM;`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// Original import removed
		expect(text).not.toMatch(/import\s+FM\s+from/);
		// Must not create identifiers that include quotes or slashes
		expect(text).not.toMatch(/__nsDef_\d+_["'\/]/);
		// Should define a per-module default candidate and bind FM from it
		expect(text).toMatch(/(?:const|var)\s+__nsVendorModule_\d+__def\s*=\s*__nsDefault\(__nsVendorModule_\d+\)/);
		expect(text).toMatch(/(?:const|var)\s+FM\s*=\s*\(__nsHasInstall\(__nsVendorModule_\d+__def\)/);
	});

	it('only vendor-binds NativeScript runtime plugins when preserving other bare vendor imports', () => {
		const input = `import { computed } from '@angular/core';\nimport { InAppReview } from '@valor/nativescript-in-app-review';\nexport const fn = computed;\nexport const review = InAppReview;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).toContain(`from '@angular/core'`);
		expect(text).not.toMatch(/from\s+['"]@valor\/nativescript-in-app-review['"]/);
		expect(text).toMatch(/(?:const|var)\s+InAppReview\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]InAppReview['"]\)/);
	});

	it('preserves @nativescript/angular imports while still vendor-binding runtime plugins during HMR', () => {
		const input = `import { registerElement } from '@nativescript/angular';\nimport { InAppReview } from '@valor/nativescript-in-app-review';\nexport const fn = registerElement;\nexport const review = InAppReview;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).toContain(`from '@nativescript/angular'`);
		expect(text).not.toMatch(/from\s+['"]@valor\/nativescript-in-app-review['"]/);
		expect(text).toMatch(/(?:const|var)\s+InAppReview\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]InAppReview['"]\)/);
	});
});

describe('ensureNativeScriptModuleBindings — package metadata NativeScript detection', () => {
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

	it('vendor-binds packages with NativeScript metadata even when preserving other bare vendor imports', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
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

		process.chdir(root);

		const input = `import { SyncStatus } from '@norrix/client-sdk';\nexport const value = SyncStatus;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).not.toContain(`from '@norrix/client-sdk'`);
		expect(text).toMatch(/(?:const|var)\s+SyncStatus\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]SyncStatus['"]\)/);
	});

	it('preserves exact bare runtime-plugin subpaths instead of collapsing them to the root package', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'ui-chart'), { recursive: true });
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

		process.chdir(root);

		const input = `import { LineData } from '@nativescript-community/ui-chart/data/LineData.js';\nexport const value = LineData;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).not.toContain(`from '@nativescript-community/ui-chart/data/LineData.js'`);
		expect(text).toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-chart\/data\/LineData\.js['"]\)/);
		expect(text).not.toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/ui-chart['"]\)/);
		expect(text).toMatch(/(?:const|var)\s+LineData\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]LineData['"]\)/);
	});

	it('preserves bare extensionless runtime-plugin subpaths from user code as ESM imports', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@mleleux', 'nativescript-revenuecat', 'Product'), { recursive: true });
		mkdirSync(join(root, 'node_modules', '@norrix', 'client-sdk'), { recursive: true });
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

		process.chdir(root);

		const input = `import { BillingPeriod } from '@mleleux/nativescript-revenuecat/Product/common';\nimport { SyncStatus } from '@norrix/client-sdk';\nexport const monthly = BillingPeriod.MONTH;\nexport const sync = SyncStatus;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).toContain(`from '@mleleux/nativescript-revenuecat/Product/common'`);
		expect(text).not.toMatch(/__nsVendorRegistry\.has\(['"]@mleleux\/nativescript-revenuecat\/Product\/common['"]\)/);
		expect(text).toMatch(/(?:const|var)\s+SyncStatus\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]SyncStatus['"]\)/);
	});

	it('restores extensionless runtime-plugin subpath specifiers from resolved node_modules imports when source intent is provided', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
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

		process.chdir(root);

		const input = `import { BillingPeriod } from "/node_modules/@mleleux/nativescript-revenuecat/Product/common.js";\nexport const monthly = BillingPeriod.MONTH;`;
		const out = ensureNativeScriptModuleBindings(input, {
			preserveNonPluginVendorImports: true,
			resolvedSpecifierOverrides: new Map([['@mleleux/nativescript-revenuecat/Product/common.js', '@mleleux/nativescript-revenuecat/Product/common']]),
		});
		const text = squish(out);

		expect(text).toContain(`from "@mleleux/nativescript-revenuecat/Product/common"`);
		expect(text).not.toMatch(/__nsVendorRegistry\.has\(['"]@mleleux\/nativescript-revenuecat\/Product\/common\.js['"]\)/);
	});

	it('keeps preserved imports separated so rewriteImports can canonicalize RevenueCat deep subpaths', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
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

		process.chdir(root);

		const input = `import { inject } from '@angular/core';\nimport { BillingPeriod } from '@mleleux/nativescript-revenuecat/Product/common';\nexport const value = BillingPeriod.MONTH;\nvoid inject;`;
		const bound = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		expect(bound).toContain(`@angular/core';\nimport { BillingPeriod }`);

		const rewritten = rewriteImports(bound, '/src/app.ts', new Map(), new Map(), root, false, undefined, 'http://localhost:5173', true);
		expect(rewritten).toContain('@mleleux/nativescript-revenuecat/Product/common');
		expect(rewritten).toContain('/ns/m/node_modules/@mleleux/nativescript-revenuecat/Product/common');
	});

	it('collapses declared CommonJS main-entry runtime-plugin subpaths back to the root package', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-websocket-bindings-'));
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

		process.chdir(root);

		const input = `import { SyncStatus } from '@norrix/client-sdk/dist/index.commonjs.js';\nexport const value = SyncStatus;`;
		const out = ensureNativeScriptModuleBindings(input, { preserveNonPluginVendorImports: true });
		const text = squish(out);

		expect(text).not.toContain(`from '@norrix/client-sdk/dist/index.commonjs.js'`);
		expect(text).toMatch(/__nsVendorRegistry\.has\(['"]@norrix\/client-sdk['"]\)/);
		expect(text).not.toMatch(/__nsVendorRegistry\.has\(['"]@norrix\/client-sdk\/dist\/index\.commonjs\.js['"]\)/);
		expect(text).toMatch(/(?:const|var)\s+SyncStatus\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*['"]SyncStatus['"]\)/);
	});

	it('is safe to run twice on the same module text', () => {
		const input = `import { defineStore } from "pinia";\nexport const useServices = defineStore('services', () => ({}));\n`;
		const once = ensureNativeScriptModuleBindings(input);
		const twice = ensureNativeScriptModuleBindings(once);
		const text = squish(twice);

		expect(text).not.toContain('const __nsVendorRegistry =');
		expect(text).not.toContain('const __nsVendorModule_0 =');
		expect(text).toContain('var __nsVendorRegistry =');
		expect(text).toContain('var __nsVendorModule_0 =');
	});
});
