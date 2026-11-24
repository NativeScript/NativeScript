import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getMajorVersion, getProjectSvelteVersion } from './svelte-version.js';

const tempRoots: string[] = [];

function createProject(svelteVersion?: string): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-vite-svelte-version-'));
	tempRoots.push(root);
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'app' }));
	if (svelteVersion) {
		writeSvelteManifest(root, svelteVersion);
	}
	return root;
}

function writeSvelteManifest(root: string, version: string): void {
	const dir = path.join(root, 'node_modules', 'svelte');
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'svelte', version, exports: { './package.json': './package.json' } }));
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

describe('getProjectSvelteVersion', () => {
	it('reads Svelte 5 from the project', () => {
		expect(getProjectSvelteVersion(createProject('5.59.0'))).toBe('5.59.0');
	});

	it('reads Svelte 4 from the project', () => {
		expect(getProjectSvelteVersion(createProject('4.2.19'))).toBe('4.2.19');
	});

	it('returns null when svelte is not installed', () => {
		expect(getProjectSvelteVersion(createProject())).toBeNull();
	});

	it('finds a copy hoisted to the workspace root', () => {
		const workspace = createProject('5.59.0');
		const app = path.join(workspace, 'apps', 'mobile');
		fs.mkdirSync(app, { recursive: true });
		fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'mobile' }));
		expect(getProjectSvelteVersion(app)).toBe('5.59.0');
	});

	it('prefers the app copy over a hoisted one', () => {
		const workspace = createProject('5.59.0');
		const app = path.join(workspace, 'apps', 'mobile');
		fs.mkdirSync(app, { recursive: true });
		fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'mobile' }));
		writeSvelteManifest(app, '4.2.19');
		expect(getProjectSvelteVersion(app)).toBe('4.2.19');
	});
});

describe('getMajorVersion', () => {
	it('parses release and prerelease versions', () => {
		expect(getMajorVersion('5.59.0')).toBe(5);
		expect(getMajorVersion('4.2.19')).toBe(4);
		expect(getMajorVersion('5.0.0-next.1')).toBe(5);
	});

	it('returns null for an unparseable version', () => {
		expect(getMajorVersion('latest')).toBeNull();
	});
});
