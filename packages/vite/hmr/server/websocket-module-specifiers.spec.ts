import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveCandidateFilePath, resolveInternalRuntimePluginBareSpecifier } from './websocket-module-specifiers.js';

const CORE_PEER = { peerDependencies: { '@nativescript/core': '>=9.0.0' } };

function writePackage(root: string, name: string, pkg: Record<string, unknown>): void {
	const dir = join(root, 'node_modules', ...name.split('/'));
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version: '1.0.0', ...pkg }));
}

// Package names are unique per case: the exports reverse map is cached by name alone.
describe('resolveInternalRuntimePluginBareSpecifier', () => {
	let root: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'ns-vite-plugin-specifier-'));
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
	});

	it('folds the root export of an exports-map plugin onto its bare package id', () => {
		writePackage(root, '@nativescript-community/exports-root-fixture', {
			...CORE_PEER,
			exports: {
				'./package.json': './package.json',
				'.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
				'./config': './dist/config.js',
			},
		});
		expect(resolveInternalRuntimePluginBareSpecifier('/node_modules/@nativescript-community/exports-root-fixture/dist/index.js', root)).toBe('@nativescript-community/exports-root-fixture');
	});

	it('leaves a subpath export to the vendor resolver', () => {
		writePackage(root, '@nativescript-community/exports-subpath-fixture', {
			...CORE_PEER,
			exports: { '.': './dist/index.js', './config': './dist/config.js' },
		});
		expect(resolveInternalRuntimePluginBareSpecifier('/node_modules/@nativescript-community/exports-subpath-fixture/dist/config.js', root)).toBeNull();
	});

	it('keeps a package-internal file of an exports-map plugin as the concrete specifier', () => {
		writePackage(root, '@nativescript-community/exports-internal-fixture', {
			...CORE_PEER,
			exports: { '.': './dist/index.js' },
		});
		expect(resolveInternalRuntimePluginBareSpecifier('/node_modules/@nativescript-community/exports-internal-fixture/dist/driver.js', root)).toBe('@nativescript-community/exports-internal-fixture/dist/driver.js');
	});

	it('folds a main-field plugin entry resolved to a platform file onto its bare package id', () => {
		writePackage(root, '@nativescript-community/main-field-fixture', { ...CORE_PEER, main: 'dist/index' });
		expect(resolveInternalRuntimePluginBareSpecifier('/node_modules/@nativescript-community/main-field-fixture/dist/index.ios.js', root)).toBe('@nativescript-community/main-field-fixture');
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
		// pnpm isolated layout: the app has no node_modules entry for the
		// transitive dep; only packages/gif's private node_modules does.
		const appRoot = join(ws, 'apps/demo');
		const depFile = join(ws, 'packages/gif/node_modules/@scope/transitive-dep/index.js');
		mkdirSync(appRoot, { recursive: true });
		mkdirSync(join(ws, 'packages/gif/node_modules/@scope/transitive-dep'), { recursive: true });
		writeFileSync(depFile, 'export {}
');

		expect(resolveCandidateFilePath('/node_modules/@scope/transitive-dep/index.js', appRoot, ws)).toBe(depFile);
	});

	it('prefers app-root and workspace-root hits over the fallback', () => {
		const appRoot = join(ws, 'apps/demo');
		const appHit = join(appRoot, 'node_modules/pkg/index.js');
		mkdirSync(join(appRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(appHit, 'export {}
');

		expect(resolveCandidateFilePath('/node_modules/pkg/index.js', appRoot, ws)).toBe(appHit);
	});

	it('returns null when the file exists nowhere', () => {
		const appRoot = join(ws, 'apps/demo');
		mkdirSync(appRoot, { recursive: true });
		expect(resolveCandidateFilePath('/node_modules/pkg/nope.js', appRoot, ws)).toBeNull();
	});
});
