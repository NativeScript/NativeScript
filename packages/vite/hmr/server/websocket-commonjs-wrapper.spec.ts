import { afterEach, describe, expect, it } from 'vitest';
import { wrapCommonJsModuleForDevice } from './websocket.js';
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
});
