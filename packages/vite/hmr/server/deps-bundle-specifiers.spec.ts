import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getBlockedDeviceNodeModulesReason, resolveCandidateFilePath } from './deps-bundle-specifiers.js';
import { clearLinkedDependencyRootsCache, clearMonorepoWorkspaceRootCache } from '../../helpers/project.js';

describe('device build-time package guards', () => {
	it('blocks NativeScript Vite build-time roots and configuration modules', () => {
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite')).toBe('build-time NativeScript Vite package root is not device-loadable');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/configuration/base.js')).toBe('build-time NativeScript Vite module is not device-loadable: @nativescript/vite/configuration/base.js');
	});

	it('allows NativeScript Vite runtime subpaths that are served over HTTP', () => {
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/angular/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/hmr/frameworks/vue/client/index.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('@nativescript/vite/runtime/core-aliases-early.js')).toBeNull();
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@nativescript/vite/shims/angular-animations-stub.js')).toBeNull();
	});

	it('blocks other known build-time packages from device loading', () => {
		expect(getBlockedDeviceNodeModulesReason('vite')).toBe('build-time package is not device-loadable: vite');
		expect(getBlockedDeviceNodeModulesReason('/node_modules/@vitejs/plugin-vue/dist/index.js')).toBe('build-time package is not device-loadable: @vitejs/plugin-vue');
	});
});

describe('resolveCandidateFilePath — pnpm-isolated transitive deps', () => {
	let ws: string;

	beforeEach(() => {
		ws = mkdtempSync(join(tmpdir(), 'ns-vite-pnpm-isolated-'));
	});

	afterEach(() => {
		rmSync(ws, { recursive: true, force: true });
	});

	it('finds a dep that only exists under a workspace package node_modules', () => {
		const appRoot = join(ws, 'apps/demo');
		const depFile = join(ws, 'packages/gif/node_modules/@scope/transitive-dep/index.js');
		mkdirSync(appRoot, { recursive: true });
		mkdirSync(join(ws, 'packages/gif/node_modules/@scope/transitive-dep'), { recursive: true });
		writeFileSync(depFile, 'export {}\n');

		expect(resolveCandidateFilePath('/node_modules/@scope/transitive-dep/index.js', appRoot, ws)).toBe(depFile);
	});

	it('prefers app-root and workspace-root hits over the fallback', () => {
		const appRoot = join(ws, 'apps/demo');
		const appHit = join(appRoot, 'node_modules/pkg/index.js');
		mkdirSync(join(appRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(appHit, 'export {}\n');

		expect(resolveCandidateFilePath('/node_modules/pkg/index.js', appRoot, ws)).toBe(appHit);
	});

	it('finds a dep that only exists in the pnpm virtual store', () => {
		const appRoot = join(ws, 'apps/demo');
		const depDir = join(ws, 'node_modules/.pnpm/node_modules/@scope/store-only');
		mkdirSync(appRoot, { recursive: true });
		mkdirSync(depDir, { recursive: true });
		writeFileSync(join(depDir, 'index.js'), 'export {}\n');

		expect(resolveCandidateFilePath('/node_modules/@scope/store-only/index.js', appRoot, ws)).toBe(join(depDir, 'index.js'));
	});

	it('does not let the fallback escape a node_modules dir', () => {
		const appRoot = join(ws, 'apps/demo');
		mkdirSync(appRoot, { recursive: true });
		mkdirSync(join(ws, 'packages/gif/node_modules'), { recursive: true });
		writeFileSync(join(ws, 'packages/gif/secret.txt'), 'x');

		expect(resolveCandidateFilePath('/node_modules/../secret.txt', appRoot, ws)).toBeNull();
	});

	it('returns null when the file exists nowhere', () => {
		const appRoot = join(ws, 'apps/demo');
		mkdirSync(appRoot, { recursive: true });
		expect(resolveCandidateFilePath('/node_modules/pkg/nope.js', appRoot, ws)).toBeNull();
	});
});

interface LinkedDepSandbox {
	sandbox: string;
	app: string;
	checkout: string;
}

/**
 * `sandbox/app` is the projectRoot (a real app dir with its own
 * package.json); `sandbox/checkout` is an external source checkout the
 * app depends on via an `app/node_modules/<name>` symlink — the layout a
 * pnpm `readPackage` hook, `link:` or `portal:` install produces when the
 * manifest keeps a registry-looking spec.
 */
function createLinkedDepSandbox(dependencies: Record<string, string> = { auth: '1.0.0' }): LinkedDepSandbox {
	const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'ns-vite-linked-deps-')));
	const app = join(sandbox, 'app');
	const checkout = join(sandbox, 'checkout');
	mkdirSync(join(app, 'node_modules'), { recursive: true });
	mkdirSync(join(checkout, 'packages/auth'), { recursive: true });
	writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', dependencies }));
	writeFileSync(join(checkout, 'packages/auth/package.json'), JSON.stringify({ name: 'auth', version: '1.0.0' }));
	if ('auth' in dependencies) {
		symlinkSync('../../checkout/packages/auth', join(app, 'node_modules/auth'), 'dir');
	}
	return { sandbox, app, checkout };
}

function writeSandboxFile(root: string, relPath: string): string {
	const filePath = join(root, relPath);
	mkdirSync(join(filePath, '..'), { recursive: true });
	writeFileSync(filePath, 'export {}\n');
	return filePath;
}

describe('resolveCandidateFilePath — linked dependency roots', () => {
	let sandbox: string | null = null;

	beforeEach(() => {
		clearLinkedDependencyRootsCache();
		clearMonorepoWorkspaceRootCache();
	});

	afterEach(() => {
		if (sandbox) {
			rmSync(sandbox, { recursive: true, force: true });
			sandbox = null;
		}
	});

	it('finds a private plugin in a hook-linked dependency checkout', () => {
		const tree = createLinkedDepSandbox();
		sandbox = tree.sandbox;
		const pluginFile = writeSandboxFile(tree.checkout, 'packages/auth/node_modules/@scope/sign-in/index.android.js');

		expect(resolveCandidateFilePath('/node_modules/@scope/sign-in/index.android.js', tree.app, null)).toBe(pluginFile);
	});

	it('finds a private plugin in a sibling package of the linked checkout workspace', () => {
		const tree = createLinkedDepSandbox();
		sandbox = tree.sandbox;
		writeFileSync(join(tree.checkout, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
		const pluginFile = writeSandboxFile(tree.checkout, 'packages/secure-storage/node_modules/@nativescript/secure-storage/index.android.js');

		expect(resolveCandidateFilePath('/node_modules/@nativescript/secure-storage/index.android.js', tree.app, null)).toBe(pluginFile);
	});

	it('finds a private plugin behind a link: dependency spec', () => {
		const sandbox2 = realpathSync(mkdtempSync(join(tmpdir(), 'ns-vite-linked-deps-')));
		sandbox = sandbox2;
		const app = join(sandbox2, 'app');
		mkdirSync(app, { recursive: true });
		writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', dependencies: { icons: 'link:../linked-icons' } }));
		const pluginFile = writeSandboxFile(sandbox2, 'linked-icons/node_modules/@iconify/utils/lib/index.mjs');

		expect(resolveCandidateFilePath('/node_modules/@iconify/utils/lib/index.mjs', app, null)).toBe(pluginFile);
	});

	it('does not treat a registry store symlink as a source checkout', () => {
		const sandbox3 = realpathSync(mkdtempSync(join(tmpdir(), 'ns-vite-linked-deps-')));
		sandbox = sandbox3;
		const app = join(sandbox3, 'app');
		mkdirSync(join(app, 'node_modules'), { recursive: true });
		writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', dependencies: { dep: '1.0.0' } }));
		mkdirSync(join(sandbox3, 'store/node_modules/dep'), { recursive: true });
		symlinkSync('../../store/node_modules/dep', join(app, 'node_modules/dep'), 'dir');
		writeSandboxFile(sandbox3, 'store/node_modules/dep/node_modules/@scope/hidden/index.js');

		expect(resolveCandidateFilePath('/node_modules/@scope/hidden/index.js', app, null)).toBeNull();
	});

	it('prefers the app-local file over the linked checkout fallback', () => {
		const tree = createLinkedDepSandbox();
		sandbox = tree.sandbox;
		writeSandboxFile(tree.checkout, 'packages/auth/node_modules/@scope/sign-in/index.android.js');
		const appFile = writeSandboxFile(tree.app, 'node_modules/@scope/sign-in/index.android.js');

		expect(resolveCandidateFilePath('/node_modules/@scope/sign-in/index.android.js', tree.app, null)).toBe(appFile);
	});

	it('does not let the linked-dependency fallback escape a node_modules dir', () => {
		const tree = createLinkedDepSandbox();
		sandbox = tree.sandbox;
		writeSandboxFile(tree.checkout, 'packages/auth/node_modules/.keep/index.js');
		writeSandboxFile(tree.sandbox, 'outside.js');

		expect(resolveCandidateFilePath('/node_modules/../../outside.js', tree.app, null)).toBeNull();
	});
});
