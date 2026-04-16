import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { filterExistingNodeModulesTransformCandidates } from './websocket.js';

describe('filterExistingNodeModulesTransformCandidates', () => {
	let fixtureRoot: string | null = null;

	afterEach(() => {
		if (fixtureRoot) {
			rmSync(fixtureRoot, { recursive: true, force: true });
			fixtureRoot = null;
		}
	});

	it('fast-fails missing node_modules subpath candidates', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-'));
		mkdirSync(join(fixtureRoot, 'node_modules/@nativescript-community/ui-drawer'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/@nativescript-community/ui-drawer/index.js'), 'export const Drawer = true;\n');

		const candidates = ['/node_modules/@nativescript-community/ui-drawer/common.ts', '/node_modules/@nativescript-community/ui-drawer/common.js', '/node_modules/@nativescript-community/ui-drawer/common/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/@nativescript-community/ui-drawer/common', candidates, fixtureRoot)).toEqual([]);
	});

	it('keeps existing explicit node_modules files', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-'));
		mkdirSync(join(fixtureRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/pkg/index.js'), 'export const value = 42;\n');

		const candidates = ['/node_modules/pkg/index.ts', '/node_modules/pkg/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/pkg/index', candidates, fixtureRoot)).toEqual(['/node_modules/pkg/index.js']);
	});

	it('leaves non-node_modules candidates unchanged', () => {
		const candidates = ['/src/app.ts', '/src/app.js'];

		expect(filterExistingNodeModulesTransformCandidates('/src/app', candidates, '/tmp/project')).toEqual(candidates);
	});
});
