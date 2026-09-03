import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveInternalRuntimePluginBareSpecifier } from './websocket-module-specifiers.js';

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
