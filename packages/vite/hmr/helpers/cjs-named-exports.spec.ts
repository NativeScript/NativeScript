import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearCjsNamedExportsCache, getCjsNamedExports, getCjsNamedExportsCacheSize, normalizeAbsolutePathForRequire } from './cjs-named-exports.js';

let fixtureRoot: string | null = null;

function makeFixture(): string {
	fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-cjs-named-exports-'));
	return fixtureRoot;
}

beforeEach(() => {
	clearCjsNamedExportsCache();
});

afterEach(() => {
	if (fixtureRoot) {
		rmSync(fixtureRoot, { recursive: true, force: true });
		fixtureRoot = null;
	}
});

describe('normalizeAbsolutePathForRequire', () => {
	it('returns null for nullish input', () => {
		expect(normalizeAbsolutePathForRequire(undefined)).toBeNull();
		expect(normalizeAbsolutePathForRequire(null)).toBeNull();
		expect(normalizeAbsolutePathForRequire('')).toBeNull();
	});

	it('returns null for non-existent paths', () => {
		expect(normalizeAbsolutePathForRequire('/this/path/definitely/does/not/exist.js')).toBeNull();
	});

	it('returns null for relative paths', () => {
		expect(normalizeAbsolutePathForRequire('./relative.js')).toBeNull();
		expect(normalizeAbsolutePathForRequire('relative.js')).toBeNull();
	});

	it('strips ?query and #hash before checking', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/foo'), { recursive: true });
		const target = join(root, 'node_modules/foo/index.js');
		writeFileSync(target, 'module.exports = {};\n');

		expect(normalizeAbsolutePathForRequire(`${target}?import`)).toBe(target);
		expect(normalizeAbsolutePathForRequire(`${target}#frag`)).toBe(target);
		expect(normalizeAbsolutePathForRequire(`${target}?v=123#x`)).toBe(target);
	});

	it('strips Vite /@fs/ prefix', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/foo'), { recursive: true });
		const target = join(root, 'node_modules/foo/index.js');
		writeFileSync(target, 'module.exports = {};\n');

		expect(normalizeAbsolutePathForRequire(`/@fs${target}`)).toBe(target);
		expect(normalizeAbsolutePathForRequire(`/@fs${target}?import`)).toBe(target);
	});
});

describe('getCjsNamedExports', () => {
	it('returns [] for nullish or non-node_modules paths', () => {
		expect(getCjsNamedExports(undefined)).toEqual([]);
		expect(getCjsNamedExports(null)).toEqual([]);
		expect(getCjsNamedExports('')).toEqual([]);
	});

	it('refuses to load files outside node_modules', () => {
		const root = makeFixture();
		const target = join(root, 'src/index.js');
		mkdirSync(join(root, 'src'), { recursive: true });
		writeFileSync(target, 'module.exports = { hello: 1 };\n');

		expect(getCjsNamedExports(target)).toEqual([]);
	});

	it('returns named keys for plain `exports.foo = ...` modules', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/plain-cjs'), { recursive: true });
		const target = join(root, 'node_modules/plain-cjs/index.js');
		writeFileSync(target, ['exports.alpha = 1;', 'exports.beta = 2;', 'exports.gamma = function () { return 3; };'].join('\n'));

		const keys = getCjsNamedExports(target).sort();
		expect(keys).toEqual(['alpha', 'beta', 'gamma']);
	});

	it('returns named keys for runtime-attached methods on a function (lodash shape)', () => {
		// Mimic lodash's pattern: a function exported as module.exports with
		// methods attached at runtime inside an IIFE. Static analysis sees zero
		// `exports.foo = ...` patterns; only runtime enumeration finds them.
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/fake-lodash'), { recursive: true });
		const target = join(root, 'node_modules/fake-lodash/index.js');
		writeFileSync(target, ['(function() {', '  function lodash(value) { return { __wrapped: value }; }', "  ['capitalize', 'chunk', 'debounce'].forEach(function (m) {", '    lodash[m] = function () { return m; };', '  });', '  module.exports = lodash;', '}.call(this));'].join('\n'));

		const keys = getCjsNamedExports(target).sort();
		expect(keys).toContain('capitalize');
		expect(keys).toContain('chunk');
		expect(keys).toContain('debounce');
	});

	it('strips `default` and `__esModule` from the result', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/with-default'), { recursive: true });
		const target = join(root, 'node_modules/with-default/index.js');
		writeFileSync(target, ['Object.defineProperty(exports, "__esModule", { value: true });', 'exports.default = function () {};', 'exports.named = 1;'].join('\n'));

		const keys = getCjsNamedExports(target);
		expect(keys).toContain('named');
		expect(keys).not.toContain('default');
		expect(keys).not.toContain('__esModule');
	});

	it('strips Function.prototype internals when the export is a function', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/fn-export'), { recursive: true });
		const target = join(root, 'node_modules/fn-export/index.js');
		writeFileSync(target, ['function fn() {}', 'fn.foo = 1;', 'module.exports = fn;'].join('\n'));

		const keys = getCjsNamedExports(target);
		expect(keys).toContain('foo');
		// `length`, `name`, `prototype` are JS function internals — never real exports.
		expect(keys).not.toContain('length');
		expect(keys).not.toContain('name');
		expect(keys).not.toContain('prototype');
	});

	it('returns [] when the module throws on load', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/throws'), { recursive: true });
		const target = join(root, 'node_modules/throws/index.js');
		writeFileSync(target, ['throw new Error("module load failure");', 'module.exports = { unreachable: true };'].join('\n'));

		expect(getCjsNamedExports(target)).toEqual([]);
	});

	it('returns [] for a primitive default export', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/primitive'), { recursive: true });
		const target = join(root, 'node_modules/primitive/index.js');
		writeFileSync(target, 'module.exports = "hello world";\n');

		expect(getCjsNamedExports(target)).toEqual([]);
	});

	it('rejects keys that are not valid JS identifiers', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/weird'), { recursive: true });
		const target = join(root, 'node_modules/weird/index.js');
		writeFileSync(target, ['module.exports = { ok: 1 };', 'module.exports["with space"] = 2;', 'module.exports["1leading-digit"] = 3;'].join('\n'));

		const keys = getCjsNamedExports(target);
		expect(keys).toContain('ok');
		expect(keys).not.toContain('with space');
		expect(keys).not.toContain('1leading-digit');
	});

	it('caches results across calls and clears on demand', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/cached'), { recursive: true });
		const target = join(root, 'node_modules/cached/index.js');
		writeFileSync(target, 'exports.alpha = 1;\nexports.beta = 2;\n');

		expect(getCjsNamedExportsCacheSize()).toBe(0);
		const keys1 = getCjsNamedExports(target).sort();
		expect(keys1).toEqual(['alpha', 'beta']);
		expect(getCjsNamedExportsCacheSize()).toBe(1);

		// Mutate the file. Cache should still return the original result.
		writeFileSync(target, 'exports.alpha = 1;\n');
		const keys2 = getCjsNamedExports(target).sort();
		expect(keys2).toEqual(['alpha', 'beta']);

		clearCjsNamedExportsCache();
		expect(getCjsNamedExportsCacheSize()).toBe(0);
	});

	it('handles paths with /@fs/ prefix and ?query', () => {
		const root = makeFixture();
		mkdirSync(join(root, 'node_modules/with-prefix'), { recursive: true });
		const target = join(root, 'node_modules/with-prefix/index.js');
		writeFileSync(target, 'exports.named = 1;\n');

		const keys = getCjsNamedExports(`/@fs${target}?import`);
		expect(keys).toEqual(['named']);
	});
});
