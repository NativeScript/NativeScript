import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { wrapCommonJsModuleForDevice } from './websocket.js';
import { clearCjsNamedExportsCache } from '../helpers/cjs-named-exports.js';
import { installModuleProvenanceRecorder } from '../shared/runtime/module-provenance.js';

describe('wrapCommonJsModuleForDevice', () => {
	afterEach(() => {
		delete (globalThis as any).__nsBaseRequire;
		delete (globalThis as any).__nsRequire;
		delete (globalThis as any).__NS_RECORD_MODULE_PROVENANCE__;
		delete (globalThis as any).__NS_GET_MODULE_PROVENANCE__;
		delete (globalThis as any).__NS_MODULE_PROVENANCE__;
	});

	it('unwraps default-only namespace results for local require calls', async () => {
		class FakeStackTraceGPS {}

		(globalThis as any).__nsRequire = (specifier: string) => {
			if (specifier === 'stacktrace-gps') {
				return { default: FakeStackTraceGPS };
			}

			throw new Error(`Unexpected require: ${specifier}`);
		};

		const source = ['(function(root, factory) {', "  if (typeof exports === 'object') {", "    module.exports = factory(require('stacktrace-gps'));", '  }', '}(this, function(StackTraceGPS) {', '  return { ok: new StackTraceGPS() instanceof StackTraceGPS };', '}));'].join('\n');

		const wrapped = wrapCommonJsModuleForDevice(source);
		const encoded = Buffer.from(wrapped, 'utf8').toString('base64');
		const mod = await import(`data:text/javascript;base64,${encoded}#provenance`);

		expect(mod.default).toEqual({ ok: true });
	});

	it('prefers __nsBaseRequire over shimmed __nsRequire when available', async () => {
		class FakeStackTraceGPS {}

		(globalThis as any).__nsBaseRequire = (specifier: string) => {
			if (specifier === 'stacktrace-gps') {
				return FakeStackTraceGPS;
			}

			throw new Error(`Unexpected base require: ${specifier}`);
		};

		(globalThis as any).__nsRequire = (_specifier: string) => ({ default: { wrong: true }, helper: true });

		const source = ['(function(root, factory) {', "  if (typeof exports === 'object') {", "    module.exports = factory(require('stacktrace-gps'));", '  }', '}(this, function(StackTraceGPS) {', '  return { ok: new StackTraceGPS() instanceof StackTraceGPS };', '}));'].join('\n');

		const wrapped = wrapCommonJsModuleForDevice(source);
		const encoded = Buffer.from(wrapped, 'utf8').toString('base64');
		const mod = await import(`data:text/javascript;base64,${encoded}`);

		expect(mod.default).toEqual({ ok: true });
	});

	it('records provenance for wrapped CommonJS require calls', () => {
		installModuleProvenanceRecorder();
		const source = ['(function(root, factory) {', "  if (typeof exports === 'object') {", "    module.exports = factory(require('stacktrace-gps'));", '  }', '}(this, function(StackTraceGPS) {', '  return { ok: new StackTraceGPS() instanceof StackTraceGPS };', '}));'].join('\n');

		const wrapped = wrapCommonJsModuleForDevice(source);
		expect(wrapped).toContain('__NS_RECORD_MODULE_PROVENANCE__');
		expect(wrapped).toContain("__nsRecord(String(spec), { kind: __ns_cjs_require_kind, specifier: String(spec), via: 'cjs-wrapper'");
	});

	it('preserves named exports from CommonJS assignments', () => {
		const wrapped = wrapCommonJsModuleForDevice('exports.answer = 42;\nexports.version = 1;\n');

		expect(wrapped).toContain('export default __cjs_mod;');
		expect(wrapped).toContain('as answer');
		expect(wrapped).toContain('as version');
	});

	it('returns existing esm modules unchanged', () => {
		const source = 'export const value = 1;\n';

		expect(wrapCommonJsModuleForDevice(source)).toBe(source);
	});

	it('synthesizes named exports from runtime-loaded module when given absolute path (lodash shape)', () => {
		// Lodash assigns its entire surface to a function inside an IIFE and
		// only `module.exports = thatFunction`. There are zero `exports.foo = ...`
		// patterns in the source — static analysis returns nothing, so the wrapper
		// would emit only `export default`. With the absolute-path arg the wrapper
		// loads the module in Node and merges runtime-enumerated keys, satisfying
		// `import { capitalize } from 'lodash'` at parse time on the device.
		clearCjsNamedExportsCache();
		const fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-cjs-wrap-'));
		try {
			mkdirSync(join(fixtureRoot, 'node_modules/fake-lodash'), { recursive: true });
			const target = join(fixtureRoot, 'node_modules/fake-lodash/index.js');
			const source = ['(function () {', '  function _(value) { return { __wrapped: value }; }', "  ['capitalize', 'chunk', 'debounce'].forEach(function (m) {", '    _[m] = function () { return m; };', '  });', '  module.exports = _;', '}.call(this));'].join('\n');
			writeFileSync(target, source);

			const wrapped = wrapCommonJsModuleForDevice(source, target);

			expect(wrapped).toContain('export default __cjs_mod;');
			expect(wrapped).toContain('as capitalize');
			expect(wrapped).toContain('as chunk');
			expect(wrapped).toContain('as debounce');
		} finally {
			rmSync(fixtureRoot, { recursive: true, force: true });
			clearCjsNamedExportsCache();
		}
	});

	it('falls back to static analysis when the module fails to load at runtime', () => {
		clearCjsNamedExportsCache();
		const fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-cjs-wrap-'));
		try {
			mkdirSync(join(fixtureRoot, 'node_modules/throws-pkg'), { recursive: true });
			const target = join(fixtureRoot, 'node_modules/throws-pkg/index.js');
			// `exports.named` is statically detectable, but the throw means runtime
			// enumeration returns []. The static regex result must still be honored.
			const source = ['exports.named = 1;', 'throw new Error("boom");'].join('\n');
			writeFileSync(target, source);

			const wrapped = wrapCommonJsModuleForDevice(source, target);
			expect(wrapped).toContain('as named');
		} finally {
			rmSync(fixtureRoot, { recursive: true, force: true });
			clearCjsNamedExportsCache();
		}
	});

	it('merges static `exports.foo = ...` keys with runtime-enumerated keys without duplicates', () => {
		clearCjsNamedExportsCache();
		const fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-cjs-wrap-'));
		try {
			mkdirSync(join(fixtureRoot, 'node_modules/mixed-pkg'), { recursive: true });
			const target = join(fixtureRoot, 'node_modules/mixed-pkg/index.js');
			const source = ['exports.staticKey = 1;', 'exports.shared = 2;', 'Object.assign(exports, { runtimeKey: 3, shared: 4 });'].join('\n');
			writeFileSync(target, source);

			const wrapped = wrapCommonJsModuleForDevice(source, target);

			expect(wrapped).toContain('as staticKey');
			expect(wrapped).toContain('as runtimeKey');
			// `shared` should appear exactly once.
			const sharedMatches = (wrapped.match(/as shared\b/g) || []).length;
			expect(sharedMatches).toBe(1);
		} finally {
			rmSync(fixtureRoot, { recursive: true, force: true });
			clearCjsNamedExportsCache();
		}
	});
});
