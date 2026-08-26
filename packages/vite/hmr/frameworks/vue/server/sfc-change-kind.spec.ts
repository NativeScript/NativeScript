import { describe, expect, it } from 'vitest';
import { classifySfcChange, seedSfcSignature, sfcScriptSignature, type SfcSignatureStore } from './sfc-change-kind';

const FILE = '/app/screens/Radio.vue';

function sfc(parts: { template?: string; script?: string; scriptSetup?: string; style?: string }): string {
	const blocks: string[] = [];
	if (parts.template !== undefined) blocks.push(`<template>${parts.template}</template>`);
	if (parts.script !== undefined) blocks.push(`<script lang="ts">${parts.script}</script>`);
	if (parts.scriptSetup !== undefined) blocks.push(`<script setup lang="ts">${parts.scriptSetup}</script>`);
	if (parts.style !== undefined) blocks.push(`<style>${parts.style}</style>`);
	return blocks.join('\n');
}

describe('sfcScriptSignature', () => {
	it('ignores template and style content', async () => {
		const a = await sfcScriptSignature(sfc({ template: '<Label text="a" />', scriptSetup: 'const x = 1;', style: '.a { color: red; }' }), FILE);
		const b = await sfcScriptSignature(sfc({ template: '<Label text="b" />', scriptSetup: 'const x = 1;', style: '.a { color: blue; }' }), FILE);
		expect(a).not.toBeNull();
		expect(a).toBe(b);
	});

	it('separates a changed script from an unchanged one', async () => {
		const a = await sfcScriptSignature(sfc({ template: '<Label />', scriptSetup: 'const x = 1;' }), FILE);
		const b = await sfcScriptSignature(sfc({ template: '<Label />', scriptSetup: 'const x = 2;' }), FILE);
		expect(a).not.toBe(b);
	});

	it('distinguishes <script setup> from a plain <script> with the same body', async () => {
		const a = await sfcScriptSignature(sfc({ template: '<Label />', script: 'const x = 1;' }), FILE);
		const b = await sfcScriptSignature(sfc({ template: '<Label />', scriptSetup: 'const x = 1;' }), FILE);
		expect(a).not.toBe(b);
	});

	it('returns null for a source it cannot parse', async () => {
		expect(await sfcScriptSignature('<template><Label></template', FILE)).toBeNull();
	});
});

describe('classifySfcChange', () => {
	it('is full the first time a path is seen', async () => {
		const store: SfcSignatureStore = new Map();
		expect(await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const x = 1;' }), FILE, store)).toBe('full');
	});

	it('is render-only when only the template changed', async () => {
		const store: SfcSignatureStore = new Map();
		await classifySfcChange(FILE, sfc({ template: '<Label text="a" />', scriptSetup: 'const x = 1;' }), FILE, store);
		expect(await classifySfcChange(FILE, sfc({ template: '<Label text="b" />', scriptSetup: 'const x = 1;' }), FILE, store)).toBe('render-only');
	});

	it('is render-only when only a style block changed', async () => {
		const store: SfcSignatureStore = new Map();
		await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const x = 1;', style: '.a { color: red; }' }), FILE, store);
		expect(await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const x = 1;', style: '.a { color: blue; }' }), FILE, store)).toBe('render-only');
	});

	it('is full when the script changed', async () => {
		const store: SfcSignatureStore = new Map();
		await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const x = 1;' }), FILE, store);
		expect(await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const x = 2;' }), FILE, store)).toBe('full');
	});

	it('is full again after an unparseable save, and does not claim render-only on the recovery', async () => {
		const store: SfcSignatureStore = new Map();
		const good = sfc({ template: '<Label />', scriptSetup: 'const x = 1;' });
		await classifySfcChange(FILE, good, FILE, store);
		expect(await classifySfcChange(FILE, '<template><Label></template', FILE, store)).toBe('full');
		// The broken save dropped the baseline, so the next one cannot be proven
		// render-only even though its scripts match the last good version.
		expect(await classifySfcChange(FILE, good, FILE, store)).toBe('full');
	});

	it('tracks paths independently', async () => {
		const store: SfcSignatureStore = new Map();
		const other = '/app/screens/Library.vue';
		await classifySfcChange(FILE, sfc({ template: '<Label text="a" />', scriptSetup: 'const x = 1;' }), FILE, store);
		await classifySfcChange(other, sfc({ template: '<Label text="a" />', scriptSetup: 'const y = 1;' }), other, store);
		expect(await classifySfcChange(FILE, sfc({ template: '<Label text="b" />', scriptSetup: 'const x = 1;' }), FILE, store)).toBe('render-only');
		expect(await classifySfcChange(other, sfc({ template: '<Label text="a" />', scriptSetup: 'const y = 2;' }), other, store)).toBe('full');
	});
});

describe('seedSfcSignature', () => {
	it('lets the first edit of a session be classified', async () => {
		const store: SfcSignatureStore = new Map();
		await seedSfcSignature(FILE, sfc({ template: '<Label text="a" />', scriptSetup: 'const x = 1;' }), FILE, store);
		expect(await classifySfcChange(FILE, sfc({ template: '<Label text="b" />', scriptSetup: 'const x = 1;' }), FILE, store)).toBe('render-only');
	});

	it('never overwrites a signature recorded by a live edit', async () => {
		const store: SfcSignatureStore = new Map();
		await classifySfcChange(FILE, sfc({ template: '<Label />', scriptSetup: 'const edited = 1;' }), FILE, store);
		const afterEdit = store.get(FILE);
		await seedSfcSignature(FILE, sfc({ template: '<Label />', scriptSetup: 'const stale = 1;' }), FILE, store);
		expect(store.get(FILE)).toBe(afterEdit);
	});

	it('records nothing for a source it cannot parse', async () => {
		const store: SfcSignatureStore = new Map();
		await seedSfcSignature(FILE, '<template><Label></template', FILE, store);
		expect(store.has(FILE)).toBe(false);
	});
});
