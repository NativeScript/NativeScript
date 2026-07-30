import { describe, it, expect } from 'vitest';
import { ensureNativeScriptModuleBindings } from './websocket.js';

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
