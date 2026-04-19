import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import * as path from 'path';

import { typescriptServerStrategy } from './strategy.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';

const APP_ENTRY = getProjectAppVirtualPath('main.ts');
const APP_ENTRY_WITH_QUERY = `${APP_ENTRY}?import`;

describe('typescriptServerStrategy', () => {
	it('matches app runtime modules and excludes TypeScript test files', () => {
		expect(typescriptServerStrategy.matchesFile(APP_ENTRY)).toBe(true);
		expect(typescriptServerStrategy.matchesFile(APP_ENTRY_WITH_QUERY)).toBe(true);
		expect(typescriptServerStrategy.matchesFile(getProjectAppVirtualPath('main.spec.ts'))).toBe(false);
		expect(typescriptServerStrategy.matchesFile(`${getProjectAppVirtualPath('main.test.ts')}?import`)).toBe(false);
		expect(typescriptServerStrategy.matchesFile(getProjectAppVirtualPath('__tests__/main.ts'))).toBe(false);
	});

	it('builds the TypeScript registry without test files', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'typescript-strategy-'));
		try {
			const srcDir = path.join(tmpRoot, 'src');
			const testDir = path.join(srcDir, '__tests__');
			mkdirSync(path.join(srcDir, 'app'), { recursive: true });
			mkdirSync(testDir, { recursive: true });

			writeFileSync(path.join(srcDir, 'main.ts'), 'export const main = true;');
			writeFileSync(path.join(srcDir, 'app', 'helpers.ts'), 'export const helpers = true;');
			writeFileSync(path.join(srcDir, 'app', 'helpers.spec.ts'), 'export const spec = true;');
			writeFileSync(path.join(srcDir, 'app', 'helpers.test.ts'), 'export const test = true;');
			writeFileSync(path.join(testDir, 'harness.ts'), 'export const harness = true;');

			const sent: any[] = [];
			const client = {
				OPEN: 1,
				readyState: 1,
				send: vi.fn((message: string) => sent.push(JSON.parse(message))),
			};
			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => ({ code: `// transformed ${id}` })),
			} as any;

			await typescriptServerStrategy.buildRegistry({
				server,
				sfcFileMap: new Map(),
				depFileMap: new Map(),
				wss: { clients: new Set([client]) } as any,
				verbose: false,
			});

			expect(server.transformRequest).toHaveBeenCalledWith('/src/main.ts');
			expect(server.transformRequest).toHaveBeenCalledWith('/src/app/helpers.ts');
			expect(server.transformRequest).not.toHaveBeenCalledWith('/src/app/helpers.spec.ts');
			expect(server.transformRequest).not.toHaveBeenCalledWith('/src/app/helpers.test.ts');
			expect(sent).toHaveLength(1);
			expect(sent[0]).toEqual({
				type: 'ns:ts-module-registry',
				modules: ['/src/app/helpers.ts', '/src/main.ts'],
				ts: expect.any(Number),
			});
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});
});
