import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, describe, expect, it } from 'vitest';

import { resolveNativeScriptPlatformFile, resolveNativeScriptPlatformModule } from './utils.js';

describe('resolveNativeScriptPlatformFile', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-resolve-'));
	const write = (file: string) => {
		const full = path.join(root, file);
		fs.mkdirSync(path.dirname(full), { recursive: true });
		fs.writeFileSync(full, '');
		return full;
	};

	afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

	it('prefers a file over a directory of the same name, as Node does', () => {
		const file = write('pkg/platform.js');
		write('pkg/platform/index.ios.js');
		expect(resolveNativeScriptPlatformFile(path.join(root, 'pkg/platform.js'), 'ios')).toBe(file);
	});

	it('prefers the platform file over the plain one', () => {
		write('a/view.js');
		const platform = write('a/view.ios.js');
		expect(resolveNativeScriptPlatformFile(path.join(root, 'a/view.js'), 'ios')).toBe(platform);
	});

	it('falls back to the directory barrel', () => {
		const index = write('b/application/index.ios.js');
		expect(path.normalize(resolveNativeScriptPlatformFile(path.join(root, 'b/application.js'), 'ios')!)).toBe(index);
	});

	it('returns undefined when nothing matches', () => {
		expect(resolveNativeScriptPlatformFile(path.join(root, 'missing.js'), 'ios')).toBeUndefined();
	});
});

describe('resolveNativeScriptPlatformModule', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-resolve-module-'));
	const write = (file: string) => {
		const full = path.join(root, file);
		fs.mkdirSync(path.dirname(full), { recursive: true });
		fs.writeFileSync(full, '');
		return full;
	};

	afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

	it('prefers a file with a later extension over a directory barrel with an earlier one', () => {
		const file = write('pkg/platform.js');
		write('pkg/platform/index.ios.ts');
		expect(resolveNativeScriptPlatformModule(path.join(root, 'pkg/platform'), ['.ts', '.js'], 'ios')).toBe(file);
	});

	it('falls back to the directory barrel', () => {
		const index = write('b/application/index.ios.js');
		expect(resolveNativeScriptPlatformModule(path.join(root, 'b/application'), ['.ts', '.js'], 'ios')).toBe(index);
	});
});
