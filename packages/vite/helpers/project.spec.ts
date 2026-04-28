import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { clearMonorepoWorkspaceRootCache, findMonorepoWorkspaceRoot, getMonorepoWorkspaceRoot } from './project.js';

function createTempTree(): { root: string; cleanup: () => void } {
	const root = mkdtempSync(join(tmpdir(), 'ns-vite-monorepo-'));
	return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

describe('findMonorepoWorkspaceRoot', () => {
	it('returns null when no monorepo markers are present anywhere up to /tmp', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'app');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(appDir, 'package.json'), JSON.stringify({ name: 'app', version: '0.0.0' }));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(null);
		} finally {
			cleanup();
		}
	});

	it('detects an Nx monorepo root via nx.json', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'ns-console-tablet');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'nx.json'), '{}');
			writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'ws-root' }));
			writeFileSync(join(appDir, 'package.json'), JSON.stringify({ name: 'app' }));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('detects a Rush monorepo via rush.json', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'rush.json'), '{}');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('detects a Turborepo via turbo.json', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'turbo.json'), '{}');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('detects pnpm workspace via pnpm-workspace.yaml', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'packages', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('detects npm/yarn workspace via package.json#workspaces', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'packages', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'ws-root', private: true, workspaces: ['packages/*'] }));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('detects Deno workspace via deno.json#workspace', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'deno.json'), JSON.stringify({ workspace: ['apps/*'] }));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('returns the nearest matching ancestor when nested monorepos exist', () => {
		const { root, cleanup } = createTempTree();
		try {
			const innerRoot = join(root, 'inner');
			const appDir = join(innerRoot, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "**/*"\n');
			writeFileSync(join(innerRoot, 'nx.json'), '{}');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(innerRoot);
		} finally {
			cleanup();
		}
	});

	it('ignores package.json without a workspaces field', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'not-a-monorepo' }));
			writeFileSync(join(appDir, 'package.json'), JSON.stringify({ name: 'app' }));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(null);
		} finally {
			cleanup();
		}
	});

	it('returns the start dir when the start dir itself is the workspace root', () => {
		const { root, cleanup } = createTempTree();
		try {
			writeFileSync(join(root, 'nx.json'), '{}');
			expect(findMonorepoWorkspaceRoot(root)).toBe(root);
		} finally {
			cleanup();
		}
	});
});

describe('getMonorepoWorkspaceRoot (memoized)', () => {
	beforeEach(() => clearMonorepoWorkspaceRootCache());
	afterEach(() => clearMonorepoWorkspaceRootCache());

	it('returns the same answer as findMonorepoWorkspaceRoot', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'nx.json'), '{}');
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(root);
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(findMonorepoWorkspaceRoot(appDir));
		} finally {
			cleanup();
		}
	});

	it('memoizes results: deleting markers after first call does not change the answer', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'nx.json'), '{}');
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(root);

			rmSync(join(root, 'nx.json'));
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(null);
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('clearMonorepoWorkspaceRootCache forces re-evaluation', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'nx.json'), '{}');
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(root);

			rmSync(join(root, 'nx.json'));
			clearMonorepoWorkspaceRootCache();
			expect(getMonorepoWorkspaceRoot(appDir)).toBe(null);
		} finally {
			cleanup();
		}
	});
});
