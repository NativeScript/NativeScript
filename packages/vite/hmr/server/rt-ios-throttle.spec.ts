import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Lightweight sanity: ensure /ns/rt $navigateTo exists in the runtime source
// and prefers the runtime implementation over vm to avoid cross-realm issues.

describe('ns/rt $navigateTo implementation preference', () => {
	it('uses single-path app navigator with diagnostics marker', () => {
		const file = join(__dirname, 'websocket.ts');
		const src = readFileSync(file, 'utf-8');
		// Single-path marker in $navigateTo implementation
		expect(src).toMatch(/\$navigateTo\(single-path\)/);
	});
});
