import { describe, it, expect } from 'vitest';
import { rewriteVendorVueSpec } from './vendor-rewrite';

describe('rewriteVendorVueSpec', () => {
	const origin = 'http://localhost:5173';
	const ver = 123;
	const rt = `${origin}/ns/rt/${ver}`;

	it('rewrites from "vue" and from "nativescript-vue"', () => {
		const input = `
import { ref } from 'vue';
import Vue, { createApp } from "nativescript-vue";
export { reactive } from 'vue';
`;
		const out = rewriteVendorVueSpec(input, origin, ver);
		expect(out).toContain(`from '${rt}'`);
		expect(out).toContain(`from "${rt}"`);
	});

	it('rewrites side-effect and dynamic imports', () => {
		const input = `
import 'vue';
const m = await import("nativescript-vue");
`;
		const out = rewriteVendorVueSpec(input, origin, ver);
		expect(out).toContain(`import '${rt}'`);
		expect(out).toContain(`import("${rt}")`);
	});

	it('rewrites require calls defensively', () => {
		const input = `
const v = require('vue');
`;
		const out = rewriteVendorVueSpec(input, origin, ver);
		expect(out).toContain(`require('${rt}')`);
	});
});
