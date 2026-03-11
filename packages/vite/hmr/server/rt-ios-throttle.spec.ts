import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Lightweight sanity: ensure /ns/rt $navigateTo exists in the runtime source
// and prefers the runtime implementation over vm to avoid cross-realm issues.

describe('ns/rt $navigateTo implementation preference', () => {
	it('uses the app navigator bridge with a missing-navigator diagnostic', () => {
		const file = join(__dirname, 'websocket.ts');
		const src = readFileSync(file, 'utf-8');
		expect(src).toContain('__nsNavigateUsingApp');
		expect(src).toContain('$navigateTo unavailable: app navigator missing');
	});
});
