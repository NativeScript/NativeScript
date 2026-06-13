import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resolveMainFieldPlatformVariant } from './resolve-main-field-platform.js';

// Characterization tests for the shared main-field platform-variant resolution
// used by both `enforce:'pre'` package resolvers. Builds a temp package dir per
// scenario and asserts which file the resolver picks.

let pkg: string;
function file(rel: string) {
	const abs = path.join(pkg, rel);
	mkdirSync(path.dirname(abs), { recursive: true });
	writeFileSync(abs, '// ' + rel);
	return abs;
}
const norm = (p: string) => p.replace(/\\/g, '/');

describe('resolveMainFieldPlatformVariant', () => {
	beforeAll(() => {
		pkg = mkdtempSync(path.join(tmpdir(), 'ns-mainfield-'));
	});
	afterAll(() => {
		rmSync(pkg, { recursive: true, force: true });
	});

	it('extensionless main: prefers <main>.<platform>.js over <main>.js', () => {
		const dir = path.join(pkg, 'p1');
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'index.js'), '// generic');
		writeFileSync(path.join(dir, 'index.ios.js'), '// ios');
		expect(norm(resolveMainFieldPlatformVariant(dir, 'index', 'ios') || '')).toBe(norm(path.join(dir, 'index.ios.js')));
		expect(norm(resolveMainFieldPlatformVariant(dir, 'index', 'android') || '')).toBe(norm(path.join(dir, 'index.js')));
	});

	it('extensionless main: falls back to <main>.js when no platform variant exists', () => {
		const dir = path.join(pkg, 'p2');
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'main.js'), '// generic');
		expect(norm(resolveMainFieldPlatformVariant(dir, 'main', 'ios') || '')).toBe(norm(path.join(dir, 'main.js')));
	});

	it('extensionless main: returns null when nothing exists', () => {
		const dir = path.join(pkg, 'p3');
		mkdirSync(dir, { recursive: true });
		expect(resolveMainFieldPlatformVariant(dir, 'missing', 'ios')).toBeNull();
	});

	it('main with extension that is missing: resolves <base>.<platform><ext>', () => {
		const dir = path.join(pkg, 'p4');
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'entry.android.js'), '// android');
		expect(norm(resolveMainFieldPlatformVariant(dir, 'entry.js', 'android') || '')).toBe(norm(path.join(dir, 'entry.android.js')));
	});

	it('main with extension that exists: returns null (generic wins — current behavior)', () => {
		const dir = path.join(pkg, 'p5');
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'index.js'), '// generic');
		writeFileSync(path.join(dir, 'index.ios.js'), '// ios sibling (currently shadowed)');
		expect(resolveMainFieldPlatformVariant(dir, 'index.js', 'ios')).toBeNull();
	});

	it('returns a normalizeModuleId-canonical (forward-slash) id', () => {
		const dir = path.join(pkg, 'p6');
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'index.ios.js'), '// ios');
		const out = resolveMainFieldPlatformVariant(dir, 'index', 'ios') || '';
		expect(out.includes('\\')).toBe(false);
	});

	it('empty/falsy main returns null', () => {
		expect(resolveMainFieldPlatformVariant(pkg, '', 'ios')).toBeNull();
		expect(resolveMainFieldPlatformVariant(pkg, undefined, 'ios')).toBeNull();
	});
});
