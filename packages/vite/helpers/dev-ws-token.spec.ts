import { mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { devWsTokenFile, readOrCreateDevWsToken } from './dev-ws-token.js';

const roots: string[] = [];
const newRoot = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'ns-ws-token-'));
	roots.push(root);
	return root;
};

afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('readOrCreateDevWsToken', () => {
	it('creates one token per project and returns it on every later read', () => {
		const root = newRoot();
		const token = readOrCreateDevWsToken(root);
		expect(token).toMatch(/^[\w-]{24}$/);
		expect(readOrCreateDevWsToken(root)).toBe(token);
		expect(readdirSync(path.dirname(devWsTokenFile(root)))).toEqual(['dev-ws-token']);
	});

	it('gives different projects different tokens', () => {
		expect(readOrCreateDevWsToken(newRoot())).not.toBe(readOrCreateDevWsToken(newRoot()));
	});
});
