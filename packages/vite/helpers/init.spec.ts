import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Detection reads a package.json cached at import, not the temp project's.
vi.mock('./flavor.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('./flavor.js')>();
	return { ...actual, determineProjectFlavor: vi.fn(actual.determineProjectFlavor) };
});

import { determineProjectFlavor } from './flavor.js';

// We will import the compiled helper in real builds; for tests we can
// import the TS source via ts-node/vitest-transform, but here we just
// require the module path as written.
import { runInit as runInitHelper } from './init.js';

function createTempProject() {
	const root = fs.mkdtempSync(path.join(process.cwd(), 'ns-vite-init-test-'));
	const pkg = {
		name: 'ns-vite-init-test-app',
		version: '1.0.0',
		dependencies: {
			'@nativescript/core': '~8.0.0',
		},
	};
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2));
	fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules\n');
	return root;
}

describe('init helper', () => {
	let cwd: string;
	let tempRoot: string | undefined;

	beforeEach(() => {
		cwd = process.cwd();
		tempRoot = undefined;
	});

	it('adds dependencies, gitignore and vite.config.mts', async () => {
		const root = createTempProject();
		tempRoot = root;
		process.chdir(root);
		try {
			await runInitHelper();

			const pkgRaw = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
			const pkg = JSON.parse(pkgRaw);

			expect(pkg.dependencies).toHaveProperty('@valor/nativescript-websockets');

			const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
			expect(gitignore.split(/\r?\n/)).toContain('.ns-vite-build');

			const viteConfigExists = fs.existsSync(path.join(root, 'vite.config.mts'));
			expect(viteConfigExists).toBe(true);
		} finally {
			process.chdir(cwd);
			if (tempRoot && fs.existsSync(tempRoot)) {
				fs.rmSync(tempRoot, { recursive: true, force: true });
			}
		}
	});

	it('does not scaffold vite.config.mts when a vite config already exists', async () => {
		const root = createTempProject();
		tempRoot = root;
		process.chdir(root);
		try {
			const existing = 'export default {};\n';
			fs.writeFileSync(path.join(root, 'vite.config.ts'), existing);

			await runInitHelper();

			expect(fs.existsSync(path.join(root, 'vite.config.mts'))).toBe(false);
			expect(fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8')).toBe(existing);
		} finally {
			process.chdir(cwd);
			if (tempRoot && fs.existsSync(tempRoot)) {
				fs.rmSync(tempRoot, { recursive: true, force: true });
			}
		}
	});

	it('scaffolds svelteConfig for a svelte project', async () => {
		const root = createTempProject();
		tempRoot = root;
		process.chdir(root);
		vi.mocked(determineProjectFlavor).mockReturnValueOnce('svelte');
		try {
			await runInitHelper();

			const viteConfig = fs.readFileSync(path.join(root, 'vite.config.mts'), 'utf8');
			expect(viteConfig).toContain("import { svelteConfig } from '@nativescript/vite/svelte';");
			expect(viteConfig).toContain('svelteConfig({ mode })');
		} finally {
			process.chdir(cwd);
			if (tempRoot && fs.existsSync(tempRoot)) {
				fs.rmSync(tempRoot, { recursive: true, force: true });
			}
		}
	});
});
