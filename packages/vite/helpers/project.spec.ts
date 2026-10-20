import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { clearLinkedDependencyRootsCache, clearMonorepoWorkspaceRootCache, findMonorepoWorkspaceRoot, getDevServerFsAllow, getLinkedDependencyRoots, getMonorepoWorkspaceRoot } from './project.js';

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

	it('walks past a settings-only pnpm-workspace.yaml (no packages key) to the real root', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'nx.json'), '{}');
			// pnpm >= 10 settings file pinning install behavior for the app only.
			writeFileSync(join(appDir, 'pnpm-workspace.yaml'), 'nodeLinker: hoisted\nignoreScripts: true\n');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(root);
		} finally {
			cleanup();
		}
	});

	it('does not treat a settings-only pnpm-workspace.yaml as a workspace root by itself', () => {
		const { root, cleanup } = createTempTree();
		try {
			const appDir = join(root, 'apps', 'a');
			mkdirSync(appDir, { recursive: true });
			writeFileSync(join(root, 'pnpm-workspace.yaml'), 'nodeLinker: hoisted\n');
			expect(findMonorepoWorkspaceRoot(appDir)).toBe(null);
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

describe('getLinkedDependencyRoots', () => {
	beforeEach(() => {
		clearLinkedDependencyRootsCache();
		clearMonorepoWorkspaceRootCache();
	});

	it('returns only real source checkouts, in declaration order', () => {
		const { root, cleanup } = createTempTree();
		try {
			const sandbox = realpathSync(root);
			const app = join(sandbox, 'app');
			mkdirSync(join(app, 'node_modules'), { recursive: true });

			const checkout = join(sandbox, 'checkout');
			const linkedIcons = join(sandbox, 'linked-icons');
			const themeCheckout = join(sandbox, 'theme-checkout');
			mkdirSync(checkout, { recursive: true });
			mkdirSync(linkedIcons, { recursive: true });
			mkdirSync(themeCheckout, { recursive: true });

			// Registry-looking spec satisfied by an install-time symlink (a
			// pnpm readPackage hook can produce this without changing the
			// manifest).
			symlinkSync('../../checkout', join(app, 'node_modules/auth'), 'dir');
			// A registry store entry realpaths under node_modules — not a
			// source checkout.
			mkdirSync(join(sandbox, 'store/node_modules/dep'), { recursive: true });
			symlinkSync('../../store/node_modules/dep', join(app, 'node_modules/dep'), 'dir');
			// `file:` can name a tarball; only directories can be served.
			writeFileSync(join(app, 'pkg.tgz'), 'tar-bytes');

			writeFileSync(
				join(app, 'package.json'),
				JSON.stringify({
					name: 'app',
					version: '1.0.0',
					dependencies: {
						auth: '1.0.0',
						icons: 'link:../linked-icons',
						theme: 'file:../theme-checkout',
						lib: 'file:./pkg.tgz',
						dep: '1.0.0',
						gone: '1.0.0',
					},
				}),
			);

			expect(getLinkedDependencyRoots(app)).toEqual([checkout, linkedIcons, themeCheckout]);
		} finally {
			cleanup();
		}
	});
});

describe('getDevServerFsAllow', () => {
	beforeEach(() => {
		clearLinkedDependencyRootsCache();
		clearMonorepoWorkspaceRootCache();
	});

	it('returns [] when nothing needs widening', () => {
		const { root, cleanup } = createTempTree();
		try {
			const app = join(root, 'app');
			mkdirSync(app, { recursive: true });
			writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));

			expect(getDevServerFsAllow(app)).toEqual([]);
		} finally {
			cleanup();
		}
	});

	it('allows the linked checkout workspace root alongside the app', () => {
		const { root, cleanup } = createTempTree();
		try {
			const sandbox = realpathSync(root);
			const app = join(sandbox, 'app');
			const checkout = join(sandbox, 'checkout');
			mkdirSync(join(app, 'node_modules'), { recursive: true });
			mkdirSync(join(checkout, 'packages/auth'), { recursive: true });
			writeFileSync(join(checkout, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
			writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', dependencies: { auth: '1.0.0' } }));
			symlinkSync('../../checkout/packages/auth', join(app, 'node_modules/auth'), 'dir');

			expect(getDevServerFsAllow(app)).toEqual([app, checkout]);
		} finally {
			cleanup();
		}
	});

	it('returns [] for a link: dep that stays inside the project root', () => {
		const { root, cleanup } = createTempTree();
		try {
			const app = join(root, 'app');
			mkdirSync(join(app, 'framework/packages/auth'), { recursive: true });
			writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', dependencies: { auth: 'link:./framework/packages/auth' } }));

			expect(getDevServerFsAllow(app)).toEqual([]);
		} finally {
			cleanup();
		}
	});
});
