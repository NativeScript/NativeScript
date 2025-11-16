import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

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

	it('adds scripts, dependencies, gitignore and vite.config.ts', async () => {
		const root = createTempProject();
		tempRoot = root;
		process.chdir(root);
		try {
			await runInitHelper();

			const pkgRaw = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
			const pkg = JSON.parse(pkgRaw);

			expect(pkg.devDependencies).toHaveProperty('concurrently');
			expect(pkg.devDependencies).toHaveProperty('wait-on');
			expect(pkg.dependencies).toHaveProperty('@valor/nativescript-websockets');

			expect(pkg.scripts['dev:ios']).toBeDefined();
			expect(pkg.scripts['dev:android']).toBeDefined();
			expect(pkg.scripts['dev:server:ios']).toBeDefined();
			expect(pkg.scripts['dev:server:android']).toBeDefined();
			expect(pkg.scripts['ios']).toBeDefined();
			expect(pkg.scripts['android']).toBeDefined();

			const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
			expect(gitignore.split(/\r?\n/)).toContain('.ns-vite-build');

			const viteConfigExists = fs.existsSync(path.join(root, 'vite.config.ts'));
			expect(viteConfigExists).toBe(true);
		} finally {
			process.chdir(cwd);
			if (tempRoot && fs.existsSync(tempRoot)) {
				fs.rmSync(tempRoot, { recursive: true, force: true });
			}
		}
	});
});
