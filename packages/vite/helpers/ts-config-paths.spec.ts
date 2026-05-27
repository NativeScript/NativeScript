import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTsConfigPathsResolver } from './ts-config-paths.js';

const tempDirs: string[] = [];

function createFixture(): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-tsconfig-paths-'));
	tempDirs.push(root);
	fs.mkdirSync(path.join(root, 'lib', 'menu'), { recursive: true });
	fs.writeFileSync(path.join(root, 'root.ts'), 'export const root = true;\n');
	fs.writeFileSync(path.join(root, 'lib', 'index.ts'), 'export const lib = true;\n');
	fs.writeFileSync(path.join(root, 'lib', 'menu', 'index.ts'), 'export const menu = true;\n');
	return root;
}

function resolveWith(paths: Record<string, string[]>, source: string): string | null | undefined {
	const plugin = createTsConfigPathsResolver({ paths, baseUrl: '.', platform: 'ios' });
	if (!plugin || typeof plugin.resolveId !== 'function') {
		throw new Error('tsconfig path resolver plugin was not created');
	}
	return (plugin.resolveId as (source: string) => string | null | undefined)(source);
}

afterEach(() => {
	for (const root of tempDirs.splice(0)) {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

describe('createTsConfigPathsResolver', () => {
	it('prefers an exact alias over a wildcard fallback', () => {
		const root = createFixture();
		const paths = {
			'@scope/common': [path.join(root, 'root.ts')],
			'@scope/common/*': [path.join(root, 'lib', '*')],
		};

		expect(resolveWith(paths, '@scope/common')).toBe(path.join(root, 'root.ts'));
		expect(resolveWith(paths, '@scope/common/menu')).toBe(path.join(root, 'lib', 'menu', 'index.ts'));
	});

	it('does not match the bare prefix with only a trailing wildcard alias', () => {
		const root = createFixture();

		expect(
			resolveWith(
				{
					'@scope/common/*': [path.join(root, 'lib', '*')],
				},
				'@scope/common',
			),
		).toBeNull();
	});

	it('removes a Windows separator wildcard before constructing subpaths', () => {
		const resolved = resolveWith(
			{
				'@scope/common/*': ['C:\\repo\\libs\\common\\src\\lib\\*'],
			},
			'@scope/common/menu',
		);

		expect(resolved).not.toContain('*');
		expect(resolved!.replace(/\\/g, '/')).toMatch(/C:\/repo\/libs\/common\/src\/lib\/menu$/);
	});
});
