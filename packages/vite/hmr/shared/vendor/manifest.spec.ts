import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { __test_collectVendorModules as collectVendorModules } from './manifest.js';

describe('collectVendorModules', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('always includes stacktrace-js to keep the stacktrace runtime on one vendor path', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', 'stacktrace-js'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: {} }, null, 2));
		writeFileSync(join(root, 'node_modules', 'stacktrace-js', 'package.json'), JSON.stringify({ name: 'stacktrace-js', version: '1.0.0' }, null, 2));

		const collected = collectVendorModules(root, 'ios', 'angular');

		expect(collected.entries).toContain('stacktrace-js');
	});
});
