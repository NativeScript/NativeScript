import { describe, expect, it } from 'vitest';
import { transformEntryRuntimeForEval } from './http-only-boot.js';

describe('transformEntryRuntimeForEval', () => {
	it('rewrites the default export to __NS_START_ENTRY__ and strips named helper exports', () => {
		const input = ['export function helper() { return 1; }', 'const sentinel = 42;', 'export default async function startEntry() { return sentinel; }'].join('\n');

		const output = transformEntryRuntimeForEval(input);

		expect(output).toContain('function helper()');
		expect(output).toContain('globalThis.__NS_START_ENTRY__=async function startEntry()');
		expect(output).not.toContain('export function helper');
		expect(output).not.toContain('export default');
	});
});
