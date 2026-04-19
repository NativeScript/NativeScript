import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { extractRootPackageName, getPackageRuntimeInfo } from './package-classifier.js';

describe('package-classifier', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('extracts the scoped root package name', () => {
		expect(extractRootPackageName('@angular/common/fesm2022/common.mjs')).toBe('@angular/common');
	});

	it('extracts the unscoped root package name', () => {
		expect(extractRootPackageName('tslib/tslib.es6.mjs')).toBe('tslib');
	});

	it('detects NativeScript metadata and main entries from package.json', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-package-classifier-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', '@norrix', 'client-sdk'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0' }, null, 2));
		writeFileSync(
			join(root, 'node_modules', '@norrix', 'client-sdk', 'package.json'),
			JSON.stringify(
				{
					name: '@norrix/client-sdk',
					main: './dist/index.commonjs.js',
					peerDependencies: {
						'@nativescript/core': '>=8.0.0',
					},
					nativescript: {
						platforms: {
							ios: '8.0.0',
						},
					},
				},
				null,
				2,
			),
		);

		const info = getPackageRuntimeInfo('@norrix/client-sdk/dist/index.commonjs.js', root);

		expect(info.rootPackageName).toBe('@norrix/client-sdk');
		expect(info.hasPackageJson).toBe(true);
		expect(info.hasNativeScriptMetadata).toBe(true);
		expect(info.hasExports).toBe(false);
		expect(Array.from(info.mainEntries)).toContain('dist/index.commonjs.js');
	});
});
