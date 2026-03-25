import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { normalizeNodeModulesSpecifier, resolveVendorFromCandidate } from './websocket.js';
import { registerVendorManifest, clearVendorManifest } from '../shared/vendor/registry.js';

// ---------------------------------------------------------------------------
// normalizeNodeModulesSpecifier — extracts subpath after /node_modules/
// ---------------------------------------------------------------------------
describe('normalizeNodeModulesSpecifier', () => {
	it('returns null for empty spec', () => {
		expect(normalizeNodeModulesSpecifier('')).toBeNull();
	});

	it('returns null for spec without /node_modules/', () => {
		expect(normalizeNodeModulesSpecifier('solid-js')).toBeNull();
		expect(normalizeNodeModulesSpecifier('./src/app.tsx')).toBeNull();
		expect(normalizeNodeModulesSpecifier('@tanstack/solid-router')).toBeNull();
	});

	it('extracts full subpath after /node_modules/', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/solid-js/dist/dev.js?v=abc')).toBe('solid-js/dist/dev.js');
	});

	it('extracts scoped package with subpath', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/@tanstack/solid-router/dist/index.js?v=abc')).toBe('@tanstack/solid-router/dist/index.js');
	});

	it('strips query params', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/solid-js?v=abc')).toBe('solid-js');
	});

	it('returns null for .vite/ paths inside node_modules', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/.vite/deps/solid-js.js')).toBeNull();
	});

	it('uses lastIndexOf for nested node_modules', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/foo/node_modules/bar/dist/index.js')).toBe('bar/dist/index.js');
	});

	it('handles package at root (no subpath)', () => {
		expect(normalizeNodeModulesSpecifier('/node_modules/solid-js')).toBe('solid-js');
	});

	it('handles backslashes (Windows paths)', () => {
		expect(normalizeNodeModulesSpecifier('\\node_modules\\solid-js\\dist\\dev.js')).toBe('solid-js/dist/dev.js');
	});
});

// ---------------------------------------------------------------------------
// resolveVendorFromCandidate — full resolution chain with manifest
// ---------------------------------------------------------------------------
describe('resolveVendorFromCandidate (with manifest)', () => {
	beforeEach(() => {
		registerVendorManifest({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test',
			modules: {
				'solid-js': { id: 'solid-js', exports: { createSignal: true, $DEVCOMP: true } },
				'@tanstack/solid-router': { id: '@tanstack/solid-router', exports: { createRootRoute: true } },
				'@tanstack/router-core': { id: '@tanstack/router-core', exports: {} },
				'@nativescript-community/solid-js': { id: '@nativescript-community/solid-js', exports: {} },
				pinia: { id: 'pinia', exports: { defineStore: true } },
			},
			aliases: { 'solid-js/web': 'solid-js' },
		});
	});

	afterEach(() => {
		clearVendorManifest();
	});

	describe('bare package names (direct lookup)', () => {
		it('solid-js → solid-js', () => {
			expect(resolveVendorFromCandidate('solid-js')).toBe('solid-js');
		});

		it('@tanstack/solid-router → @tanstack/solid-router', () => {
			expect(resolveVendorFromCandidate('@tanstack/solid-router')).toBe('@tanstack/solid-router');
		});

		it('pinia → pinia', () => {
			expect(resolveVendorFromCandidate('pinia')).toBe('pinia');
		});
	});

	describe('subpath specifiers (post normalizeNodeModulesSpecifier)', () => {
		// This is the exact chain that was broken: normalizeNodeModulesSpecifier
		// returns "solid-js/dist/dev.js" and resolveVendorFromCandidate must
		// resolve it to "solid-js".
		it('solid-js/dist/dev.js → solid-js', () => {
			expect(resolveVendorFromCandidate('solid-js/dist/dev.js')).toBe('solid-js');
		});

		it('solid-js/web → solid-js (via alias)', () => {
			expect(resolveVendorFromCandidate('solid-js/web')).toBe('solid-js');
		});

		it('@tanstack/solid-router/dist/esm/index.js → @tanstack/solid-router', () => {
			expect(resolveVendorFromCandidate('@tanstack/solid-router/dist/esm/index.js')).toBe('@tanstack/solid-router');
		});

		it('@nativescript-community/solid-js/dist/index.js → @nativescript-community/solid-js', () => {
			expect(resolveVendorFromCandidate('@nativescript-community/solid-js/dist/index.js')).toBe('@nativescript-community/solid-js');
		});
	});

	describe('unknown packages → null', () => {
		it('unknown-package → null', () => {
			expect(resolveVendorFromCandidate('unknown-package')).toBeNull();
		});

		it('unknown-package/dist/index.js → null', () => {
			expect(resolveVendorFromCandidate('unknown-package/dist/index.js')).toBeNull();
		});

		it('@unknown/pkg/dist/index.js → null', () => {
			expect(resolveVendorFromCandidate('@unknown/pkg/dist/index.js')).toBeNull();
		});
	});

	describe('null/empty handling', () => {
		it('null → null', () => {
			expect(resolveVendorFromCandidate(null)).toBeNull();
		});

		it('undefined → null', () => {
			expect(resolveVendorFromCandidate(undefined)).toBeNull();
		});

		it('empty string → null', () => {
			expect(resolveVendorFromCandidate('')).toBeNull();
		});
	});
});

describe('resolveVendorFromCandidate (without manifest)', () => {
	beforeEach(() => {
		clearVendorManifest();
	});

	it('returns null for any specifier', () => {
		expect(resolveVendorFromCandidate('solid-js')).toBeNull();
		expect(resolveVendorFromCandidate('solid-js/dist/dev.js')).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// End-to-end: normalizeNodeModulesSpecifier → resolveVendorFromCandidate
// ---------------------------------------------------------------------------
describe('full resolution chain: Vite path → vendor match', () => {
	beforeEach(() => {
		registerVendorManifest({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test',
			modules: {
				'solid-js': { id: 'solid-js', exports: {} },
				'@tanstack/solid-router': { id: '@tanstack/solid-router', exports: {} },
			},
			aliases: { 'solid-js/web': 'solid-js' },
		});
	});

	afterEach(() => {
		clearVendorManifest();
	});

	const e2eCases = [
		{ desc: 'solid-js Vite path', input: '/node_modules/solid-js/dist/dev.js?v=57e43d24', expected: 'solid-js' },
		{ desc: 'solid-js/web Vite path', input: '/node_modules/solid-js/web/dist/web.js?v=abc', expected: 'solid-js' },
		{ desc: '@tanstack/solid-router Vite path', input: '/node_modules/@tanstack/solid-router/dist/esm/index.js?v=def', expected: '@tanstack/solid-router' },
		{ desc: 'non-vendor package', input: '/node_modules/some-unknown-lib/dist/index.js', expected: null },
	];

	for (const tc of e2eCases) {
		it(tc.desc, () => {
			// Step 1: normalizeNodeModulesSpecifier extracts subpath
			const nodeModSpec = normalizeNodeModulesSpecifier(tc.input);
			expect(nodeModSpec).not.toBeNull();
			// Step 2: resolveVendorFromCandidate resolves to vendor name
			const vendor = resolveVendorFromCandidate(nodeModSpec);
			expect(vendor).toBe(tc.expected);
		});
	}
});
