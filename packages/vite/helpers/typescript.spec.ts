import { describe, expect, it } from 'vitest';
import { loadTypeScript } from './typescript.js';

describe('loadTypeScript', () => {
	it('returns the compiler API when typescript is installed', () => {
		const ts = loadTypeScript();
		expect(ts).not.toBeNull();
		expect(typeof ts!.createSourceFile).toBe('function');
	});

	it('returns the same instance on every call', () => {
		expect(loadTypeScript()).toBe(loadTypeScript());
	});
});
