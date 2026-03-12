import { describe, it, expect } from 'vitest';
import { stripRtCoreSentinel, stripDanglingViteCjsImports } from './sanitize';

describe('sanitize.stripRtCoreSentinel', () => {
	it('removes standalone sentinel destructure that would collide with core import', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
const { ns_core_ns_1: __ns_core_ns_1 } = __ns_rt_ns_1;
import __ns_core_ns_1 from '/ns/core';
`;
		const out = stripRtCoreSentinel(input);
		expect(out).not.toMatch(/\{\s*ns_core_ns_1\s*:\s*__ns_core_ns_1\s*\}/);
		expect(out).toMatch(/import __ns_core_ns_1 from '\/ns\/core';/);
	});

	it('removes inline sentinel property from multi-prop destructure and preserves others', () => {
		const input = `
import __ns_rt_ns_1 from '/ns/rt';
const { ns_core_ns_1: __ns_core_ns_1, defineComponent: _defineComponent, resolveComponent: _resolveComponent } = __ns_rt_ns_1;
`;
		const out = stripRtCoreSentinel(input);
		expect(out).not.toMatch(/ns_core_ns_1\s*:\s*__ns_core_ns_1/);
		expect(out).toMatch(/\{\s*defineComponent:\s*_defineComponent,\s*resolveComponent:\s*_resolveComponent\s*\}\s*=\s*__ns_rt_ns_1\s*;/);
	});
});

describe('sanitize.stripDanglingViteCjsImports', () => {
	it('neutralizes helper property access when helper was stripped', () => {
		const input = `
// helper import was removed earlier
const initLibrary = __vite__cjsImport4__library["init"];
`;
		const out = stripDanglingViteCjsImports(input);
		expect(out).toMatch(/const\s+initLibrary\s*=\s*undefined/);
	});

	it('does not touch when helper is declared', () => {
		const input = `
const __vite__cjsImport4__pkg = {};
const feature = __vite__cjsImport4__pkg["f"];
`;
		const out = stripDanglingViteCjsImports(input);
		expect(out).toContain('const feature = __vite__cjsImport4__pkg["f"];');
	});
});
