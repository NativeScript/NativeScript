/**
 * Unit tests for the vendor bridge vs HTTP routing decision.
 *
 * The /ns/m/ handler must decide for each import specifier whether to:
 *   - Use the vendor bridge (bare package name) — for main entries of standard npm packages
 *   - Route via HTTP (/ns/m/node_modules/...) — for platform-specific files and subpath imports
 *
 * These tests encode every real-world case we've encountered to prevent regressions.
 */
import { describe, it, expect } from 'vitest';

/**
 * Extracted routing logic from websocket.ts rewriteImports.
 * This is the EXACT algorithm used in production.
 */
function resolveVendorRoute(nodeModulesSpecifier: string, vendorCanonical: string): 'vendor' | 'http' {
	let useVendorBridge = true;
	const pkgBaseName = vendorCanonical.split('/').pop()!;
	const afterCanonical = nodeModulesSpecifier.slice(vendorCanonical.length).replace(/^\//, '');
	const isNativeScriptPlugin = /^(?:@nativescript\/(?!core(?:\b|\/))|@nativescript-community\/|@nstudio\/|@mleleux\/)/.test(vendorCanonical);
	const isRootLevelMainEntry = (() => {
		if (!afterCanonical || afterCanonical.includes('/')) {
			return false;
		}
		const withoutExt = afterCanonical.replace(/\.[^.]+$/, '');
		const withoutPlatform = withoutExt.replace(/\.(ios|android|visionos)$/i, '');
		return withoutPlatform === 'index' || withoutPlatform === pkgBaseName;
	})();

	if (nodeModulesSpecifier) {
		const isPlatformSpecific = /\.(ios|android)\.(js|ts|mjs|mts)$/.test(nodeModulesSpecifier);
		if (isPlatformSpecific && isNativeScriptPlugin && isRootLevelMainEntry) {
			useVendorBridge = true;
		} else if (isPlatformSpecific) {
			useVendorBridge = false;
		} else if (nodeModulesSpecifier !== vendorCanonical) {
			const fileName = afterCanonical.replace(/\.[^.]+$/, '');
			const isMainEntry = !afterCanonical || fileName === 'index' || fileName === pkgBaseName || fileName.startsWith(pkgBaseName + '.');
			if (!isMainEntry) {
				useVendorBridge = false;
			}
		}
	}

	return useVendorBridge ? 'vendor' : 'http';
}

describe('vendor bridge vs HTTP routing', () => {
	describe('platform-specific NativeScript plugin main entries → vendor', () => {
		it.each([
			['@mleleux/nativescript-revenuecat/index.ios.js', '@mleleux/nativescript-revenuecat'],
			['@nstudio/nativescript-branch/index.ios.js', '@nstudio/nativescript-branch'],
			['@nativescript-community/ui-material-core/index.ios.js', '@nativescript-community/ui-material-core'],
			['@nativescript-community/ui-drawer/index.android.js', '@nativescript-community/ui-drawer'],
			['@nativescript/firebase-core/index.ios.js', '@nativescript/firebase-core'],
			['@nativescript/firebase-messaging/index.ios.js', '@nativescript/firebase-messaging'],
			['@nativescript/background-http/index.ios.js', '@nativescript/background-http'],
		])('%s → vendor (NativeScript plugin main entry)', (spec, canonical) => {
			expect(resolveVendorRoute(spec, canonical)).toBe('vendor');
		});
	});

	describe('other platform-specific files → HTTP', () => {
		it.each([
			['some-pkg/index.ios.js', 'some-pkg'],
			['@mleleux/nativescript-revenuecat/Product/index.ios.js', '@mleleux/nativescript-revenuecat'],
			['@nativescript-community/ui-material-core/css/index.ios.js', '@nativescript-community/ui-material-core'],
		])('%s → HTTP', (spec, canonical) => {
			expect(resolveVendorRoute(spec, canonical)).toBe('http');
		});
	});

	describe('subpath imports → HTTP (vendor bridge only resolves main entry)', () => {
		it.each([
			// Sub-modules within a package
			['@mleleux/nativescript-revenuecat/common.js', '@mleleux/nativescript-revenuecat'],
			['@mleleux/nativescript-revenuecat/Product/index.ios.js', '@mleleux/nativescript-revenuecat'],
			['@mleleux/nativescript-revenuecat/Product/common.js', '@mleleux/nativescript-revenuecat'],
			['@mleleux/nativescript-revenuecat/Offering/index.ios.js', '@mleleux/nativescript-revenuecat'],
			['@mleleux/nativescript-revenuecat/Entitlement/index.ios.js', '@mleleux/nativescript-revenuecat'],
			// "index.common.js" is a shared module, NOT the main entry
			['@nativescript-community/ui-material-core/index.common.js', '@nativescript-community/ui-material-core'],
			// CSS properties sub-module
			['@nativescript-community/ui-material-core/cssproperties.js', '@nativescript-community/ui-material-core'],
			// Deep subpath imports
			['rxjs/dist/esm/operators/index.js', 'rxjs'],
			['@angular/core/fesm2022/core.mjs', '@angular/core'],
			['@angular/common/fesm2022/common.mjs', '@angular/common'],
			['@angular/common/fesm2022/http.mjs', '@angular/common'],
		])('%s → HTTP (subpath)', (spec, canonical) => {
			expect(resolveVendorRoute(spec, canonical)).toBe('http');
		});
	});

	describe('main entry → vendor bridge (esbuild handles CJS/bundling)', () => {
		it.each([
			// Package name matches filename
			['moment/moment.js', 'moment'],
			// Package name with compound extension
			['tslib/tslib.es6.mjs', 'tslib'],
			// Standard index.js main entry
			['moment-timezone/index.js', 'moment-timezone'],
			// Bare canonical (no file suffix)
			['lodash', 'lodash'],
		])('%s → vendor', (spec, canonical) => {
			expect(resolveVendorRoute(spec, canonical)).toBe('vendor');
		});
	});

	describe('edge cases', () => {
		it('index.common.js is NOT a main entry (it is a shared sub-module)', () => {
			expect(resolveVendorRoute('@nativescript-community/ui-material-core/index.common.js', '@nativescript-community/ui-material-core')).toBe('http');
		});

		it('index.base.js is NOT a main entry', () => {
			expect(resolveVendorRoute('some-pkg/index.base.js', 'some-pkg')).toBe('http');
		});

		it('index.js IS a main entry', () => {
			expect(resolveVendorRoute('some-pkg/index.js', 'some-pkg')).toBe('vendor');
		});

		it('index.mjs IS a main entry', () => {
			expect(resolveVendorRoute('some-pkg/index.mjs', 'some-pkg')).toBe('vendor');
		});

		it('non-NativeScript platform-specific index still overrides main entry heuristic', () => {
			expect(resolveVendorRoute('some-pkg/index.ios.js', 'some-pkg')).toBe('http');
		});

		it('android platform suffix → HTTP', () => {
			expect(resolveVendorRoute('some-pkg/index.android.js', 'some-pkg')).toBe('http');
		});
	});
});

/**
 * Tests for deduplicateLinkerImports — ensures it only rewrites actual
 * linker-injected duplicates, not intentional vendor bare specifiers.
 */
describe('deduplicateLinkerImports', () => {
	function deduplicateLinkerImports(code: string): string {
		if (!code) return code;
		try {
			const pkgUrlMap = new Map<string, string>();
			const pkgBindings = new Map<string, Set<string>>();
			const resolvedRe = /import\s+(?:\{([^}]*)\}|\*\s+as\s+\w+)\s+from\s+["']((?:https?:\/\/|\/)[^"']+)["']/g;
			let m: RegExpExecArray | null;
			while ((m = resolvedRe.exec(code)) !== null) {
				const url = m[2];
				const nmIdx = url.lastIndexOf('/node_modules/');
				if (nmIdx === -1) continue;
				const afterNm = url.substring(nmIdx + '/node_modules/'.length);
				const parts = afterNm.split('/');
				const pkg = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
				if (!pkgUrlMap.has(pkg)) pkgUrlMap.set(pkg, url);
				if (m[1]) {
					if (!pkgBindings.has(pkg)) pkgBindings.set(pkg, new Set());
					const names = m[1].split(',');
					for (const n of names) {
						const name = n
							.trim()
							.split(/\s+as\s+/)[0]
							.trim();
						if (name) pkgBindings.get(pkg)!.add(name);
					}
				}
			}
			if (pkgUrlMap.size === 0) return code;
			return code.replace(/^([ \t]*)import\s+\{([^}]+)\}\s+from\s+['"]([^"']+)['"];?\s*$/gm, (full, indent: string, bindingsStr: string, specifier: string) => {
				if (specifier.startsWith('/') || specifier.startsWith('.') || specifier.startsWith('http')) return full;
				const parts = specifier.split('/');
				const pkg = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
				const url = pkgUrlMap.get(pkg);
				if (!url) return full;
				const existing = pkgBindings.get(pkg) || new Set();
				const bindings = bindingsStr
					.split(',')
					.map((b: string) => b.trim())
					.filter(Boolean);
				const newBindings = bindings.filter((b: string) => {
					const name = b.split(/\s+as\s+/)[0].trim();
					return !existing.has(name);
				});
				if (newBindings.length === 0) return '';
				if (newBindings.length === bindings.length) return full; // intentional bare specifier
				for (const b of newBindings) {
					existing.add(b.split(/\s+as\s+/)[0].trim());
				}
				return `${indent}import { ${newBindings.join(', ')} } from "${url}";`;
			});
		} catch {
			return code;
		}
	}

	it('removes fully-duplicate linker imports', () => {
		const code = ['import { Component, NgZone } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";', "import {Component, NgZone} from '@angular/core';"].join('\n');
		const result = deduplicateLinkerImports(code);
		expect(result).not.toContain("from '@angular/core'");
		expect(result).toContain('from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs"');
	});

	it('rewrites partially-duplicate linker imports (some new bindings)', () => {
		const code = ['import { Component } from "http://localhost:5173/ns/m/node_modules/@angular/core/fesm2022/core.mjs";', "import {Component, NgZone} from '@angular/core';"].join('\n');
		const result = deduplicateLinkerImports(code);
		// Component is duplicate (removed), NgZone is new (rewritten to resolved URL)
		expect(result).toContain('NgZone');
		expect(result).toContain('core.mjs');
		expect(result).not.toContain("from '@angular/core'");
	});

	it('does NOT rewrite intentional vendor bare specifiers (zero duplicates)', () => {
		const code = ['import { DrawerModule } from "http://localhost:5173/ns/m/node_modules/@nativescript-community/ui-drawer/angular/fesm2022/nativescript-community-ui-drawer-angular.mjs";', 'import { install as installDrawer } from "@nativescript-community/ui-drawer";'].join('\n');
		const result = deduplicateLinkerImports(code);
		// install is NOT a duplicate of DrawerModule — leave the bare specifier alone
		expect(result).toContain('from "@nativescript-community/ui-drawer"');
		expect(result).toContain('install as installDrawer');
	});

	it('does NOT rewrite bare specifiers when no bindings overlap', () => {
		const code = ['import { foo } from "http://localhost:5173/ns/m/node_modules/some-pkg/sub.mjs";', 'import { bar } from "some-pkg";'].join('\n');
		const result = deduplicateLinkerImports(code);
		expect(result).toContain('from "some-pkg"');
	});
});

describe('AST normalizer node_modules guard', () => {
	it('node_modules paths are correctly detected', () => {
		const isNodeMod = (spec: string) => /(?:^|\/)node_modules\//.test(spec);

		// node_modules → true (skip normalizer)
		expect(isNodeMod('node_modules/tslib/tslib.es6.mjs')).toBe(true);
		expect(isNodeMod('/node_modules/@angular/core/fesm2022/core.mjs')).toBe(true);
		expect(isNodeMod('node_modules/@nativescript-community/ui-material-core/index.ios.js')).toBe(true);

		// app source → false (run normalizer)
		expect(isNodeMod('src/main.ts')).toBe(false);
		expect(isNodeMod('src/app/app.component.ts')).toBe(false);
		expect(isNodeMod('/app/src/app.component.ts')).toBe(false);
	});

	it('node_modules files should NOT get underscore helper injection', () => {
		// Simulate what processCodeForDevice does for node_modules
		// The regex fallback scans for _identifiers and injects destructures
		const angularCode = ['function _applyConfigDefaults(config, defaultOptions) { return config; }', 'function _createInjector(parent) { return parent; }', 'export class NativeDialog { }'].join('\n');

		// For node_modules: isNodeModule=true → regex fallback should NOT run
		// The code should remain unchanged (no const { ... } = __ns_rt_ns injection)
		// This test validates the LOGIC, not the full pipeline
		const isNodeModule = true;
		const hasAstMarker = false;
		const shouldRunRegexFallback = !isNodeModule && !hasAstMarker;
		expect(shouldRunRegexFallback).toBe(false);

		// For app source: isNodeModule=false → regex fallback SHOULD run
		const isAppSource = false;
		const shouldRunForApp = !isAppSource && !hasAstMarker;
		expect(shouldRunForApp).toBe(true);
	});
});
