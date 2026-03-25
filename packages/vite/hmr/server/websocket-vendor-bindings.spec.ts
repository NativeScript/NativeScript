import { describe, it, expect } from 'vitest';
import { ensureNativeScriptModuleBindings } from './websocket.js';

// Helper to normalize whitespace for robust assertions
function squish(s: string) {
	return s.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Basic binding patterns (existing tests, preserved)
// ---------------------------------------------------------------------------
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
		expect(text).toMatch(/const\s+__nsVendorRequire\s*=\s*\(typeof\s+globalThis\.__nsRequire|typeof\s+globalThis\.require/);
		// Allocates a module cache var and resolves 'pinia'
		expect(text).toMatch(/const __nsVendorModule_\d+\s*=\s*__nsVendorRegistry\.has\(['"]pinia['"]\)/);
		// Binds defineStore via helper from default or namespace
		expect(text).toMatch(/const\s+defineStore\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*["']defineStore["']\)/);
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

	it('handles named-only plugin import without leaving broken import remnants', () => {
		const input = `import { install } from '@nativescript/firebase-messaging';\nexport const x = install;`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// Original import removed
		expect(text).not.toMatch(/import\s*\{\s*install\s*\}\s*from/);
		// Should bind a named const for install via helper
		expect(text).toMatch(/const\s+install\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*["']install["']\)/);
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
		expect(text).toMatch(/const\s+__nsVendorModule_\d+__def\s*=\s*__nsDefault\(__nsVendorModule_\d+\)/);
		expect(text).toMatch(/const\s+FM\s*=\s*\(__nsHasInstall\(__nsVendorModule_\d+__def\)/);
	});
});

// ---------------------------------------------------------------------------
// Scoped package patterns (the @tanstack/solid-router case that broke)
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — scoped packages', () => {
	it('rewrites @tanstack/solid-router named import', () => {
		const input = `import { createRootRoute } from "@tanstack/solid-router";\nexport const Route = createRootRoute();\n`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// Original import removed
		expect(text).not.toMatch(/from\s+["']@tanstack\/solid-router["']/);
		// Vendor module allocated
		expect(text).toMatch(/__nsVendorRegistry\.has\(['"]@tanstack\/solid-router['"]\)/);
		// createRootRoute bound via __nsPick
		expect(text).toMatch(/const\s+createRootRoute\s*=\s*__nsPick\(__nsVendorModule_\d+,\s*["']createRootRoute["']\)/);
		// Function call preserved
		expect(text).toContain('createRootRoute()');
	});

	it('rewrites @nativescript-community/solid-js named imports', () => {
		const input = `import { render, insert, createElement } from "@nativescript-community/solid-js";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		expect(text).not.toMatch(/from\s+["']@nativescript-community\/solid-js["']/);
		expect(text).toMatch(/__nsVendorRegistry\.has\(['"]@nativescript-community\/solid-js['"]\)/);
		expect(text).toMatch(/const\s+render\s*=\s*__nsPick/);
		expect(text).toMatch(/const\s+insert\s*=\s*__nsPick/);
		expect(text).toMatch(/const\s+createElement\s*=\s*__nsPick/);
	});

	it('rewrites multiple scoped imports from different packages', () => {
		const input = [`import { createRootRoute, createRoute } from "@tanstack/solid-router";`, `import { createRouter } from "@tanstack/router-core";`, `import { render } from "@nativescript-community/solid-js";`, `export const r = createRootRoute();`].join('\n');
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		// All original imports removed
		expect(text).not.toMatch(/from\s+["']@tanstack/);
		expect(text).not.toMatch(/from\s+["']@nativescript-community/);
		// All packages allocated in registry
		expect(text).toMatch(/@tanstack\/solid-router/);
		expect(text).toMatch(/@tanstack\/router-core/);
		expect(text).toMatch(/@nativescript-community\/solid-js/);
	});
});

// ---------------------------------------------------------------------------
// Vite-rewritten specifiers (/node_modules/ paths)
// NOTE: ensureNativeScriptModuleBindings handles BARE specifiers only.
// Vite-rewritten /node_modules/ paths are handled upstream by rewriteImports
// (replaceVueImport), which either converts them to bare specifiers for
// vendor lookup or routes them through /ns/m/node_modules/ for HTTP serving.
// By the time ensureNativeScriptModuleBindings runs, these should already
// be transformed. These tests document this boundary.
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — Vite-rewritten paths (boundary)', () => {
	it('does NOT transform /node_modules/ paths (handled by rewriteImports upstream)', () => {
		const input = `import { $DEVCOMP } from "/node_modules/solid-js/dist/dev.js?v=57e43d24";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		// ensureNativeScriptModuleBindings preserves /node_modules/ imports —
		// these are caught by rewriteImports (replaceVueImport) which runs separately
		expect(out).toMatch(/\/node_modules\//);
	});

	it('does NOT transform /node_modules/@scoped/ paths (handled by rewriteImports upstream)', () => {
		const input = `import { createRootRoute } from "/node_modules/@tanstack/solid-router/dist/esm/index.js?v=abc";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/\/node_modules\//);
	});
});

// ---------------------------------------------------------------------------
// Namespace imports
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — namespace imports', () => {
	it('rewrites namespace import (import * as)', () => {
		const input = `import * as SolidRouter from "@tanstack/solid-router";\nexport const x = SolidRouter.createRoute;\n`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		expect(text).not.toMatch(/import\s+\*\s+as\s+SolidRouter\s+from/);
		// SolidRouter should be bound to the vendor module
		expect(text).toMatch(/SolidRouter/);
	});
});

// ---------------------------------------------------------------------------
// Side-effect only imports
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — side-effect imports', () => {
	it('handles side-effect import of vendor package', () => {
		const input = `import "pinia";\nexport const x = 1;\n`;
		const out = ensureNativeScriptModuleBindings(input);
		// Side-effect vendor import should not leave a raw import statement
		// that would cause device-side fetch to /node_modules/pinia
		expect(out).not.toMatch(/import\s+["']pinia["']/);
	});
});

// ---------------------------------------------------------------------------
// Mixed default + named imports
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — mixed imports', () => {
	it('handles default + named combined import', () => {
		const input = `import Router, { createRoute } from "@tanstack/solid-router";\nexport { Router, createRoute };\n`;
		const out = ensureNativeScriptModuleBindings(input);
		const text = squish(out);
		expect(text).not.toMatch(/from\s+["']@tanstack\/solid-router["']/);
		// Both bindings should be present
		expect(text).toMatch(/Router/);
		expect(text).toMatch(/createRoute/);
	});
});

// ---------------------------------------------------------------------------
// Preservation rules
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — preservation', () => {
	it('preserves @nativescript/core imports (handled by core bridge)', () => {
		const input = `import { Application, Frame } from "@nativescript/core";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/from\s+["']@nativescript\/core["']/);
		expect(out).not.toMatch(/__nsVendorRegistry/);
	});

	it('preserves @nativescript/core subpath imports', () => {
		const input = `import { View } from "@nativescript/core/ui/core/view";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/@nativescript\/core/);
	});

	it('preserves relative imports', () => {
		const input = `import { App } from "./app";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/from\s+["']\.\/app["']/);
	});

	it('preserves /ns/ internal imports', () => {
		const input = `import core from "/ns/core/123";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/from\s+["']\/ns\/core/);
	});

	it('preserves HTTP URL imports', () => {
		const input = `import mod from "http://localhost:5173/ns/m/src/app";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		expect(out).toMatch(/from\s+["']http:\/\//);
	});
});

// ---------------------------------------------------------------------------
// Output structure validation (device compatibility)
// ---------------------------------------------------------------------------
describe('ensureNativeScriptModuleBindings — output structure', () => {
	it('uses typeof checks for require (no bare require reference)', () => {
		const input = `import { defineStore } from "pinia";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		// Must use typeof to avoid ReferenceError on device
		expect(out).toMatch(/typeof\s+globalThis\.__nsRequire\s*===\s*['"]function['"]/);
		// Must NOT use bare `require` without typeof check
		expect(out).not.toMatch(/[^.]require\s*\?/);
	});

	it('uses __nsPick for named exports (not destructuring from import)', () => {
		const input = `import { createRootRoute } from "@tanstack/solid-router";\n`;
		const out = ensureNativeScriptModuleBindings(input);
		// Named exports use __nsPick which safely traverses default/namespace
		expect(out).toMatch(/__nsPick\(/);
		// No import statement with the vendor specifier should remain
		expect(out).not.toMatch(/import\s+\{[^}]*createRootRoute[^}]*\}\s+from/);
	});

	it('caches vendor module in registry (not re-requiring per import)', () => {
		const input = [`import { createRootRoute } from "@tanstack/solid-router";`, `import { createRoute } from "@tanstack/solid-router";`].join('\n');
		const out = ensureNativeScriptModuleBindings(input);
		// Both should reference the same __nsVendorModule_N
		const moduleRefs = out.match(/__nsVendorModule_(\d+)/g) || [];
		const uniqueNums = new Set(moduleRefs.map((r) => r.replace('__nsVendorModule_', '')));
		// Should reuse the same module cache variable
		expect(uniqueNums.size).toBe(1);
	});
});
