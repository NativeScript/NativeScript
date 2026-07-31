import { describe, expect, it } from 'vitest';
import { findNearestSfcBoundaries, normalizeDepGraphKey, type DepGraphModuleLike } from './dep-propagation.js';

function makeGraph(entries: Array<[string, string[]]>): Map<string, DepGraphModuleLike> {
	return new Map(entries.map(([id, deps]) => [id, { id, deps }]));
}

describe('normalizeDepGraphKey', () => {
	it('strips queries and script extensions, ensures a leading slash', () => {
		expect(normalizeDepGraphKey('/src/test2.ts')).toBe('/src/test2');
		expect(normalizeDepGraphKey('/src/test2.ts?t=123')).toBe('/src/test2');
		expect(normalizeDepGraphKey('src/test2.tsx')).toBe('/src/test2');
		expect(normalizeDepGraphKey('/src/util.mjs')).toBe('/src/util');
		expect(normalizeDepGraphKey('')).toBe('');
	});

	it('preserves non-script extensions (.vue stays a distinct key)', () => {
		expect(normalizeDepGraphKey('/src/components/Home.vue')).toBe('/src/components/Home.vue');
		expect(normalizeDepGraphKey('/src/app.css')).toBe('/src/app.css');
	});
});

describe('findNearestSfcBoundaries', () => {
	// The exact repro shape: Home.vue imports test2.ts; editing test2.ts must
	// surface Home.vue as the remount boundary.
	it('finds the .vue importer of a directly-changed .ts module', () => {
		const graph = makeGraph([
			['/src/app.ts', ['/src/components/Home.vue']],
			['/src/components/Home.vue', ['/src/test.ts', '/src/test2.ts', '/src/components/Details.vue']],
			['/src/components/Details.vue', []],
			['/src/test.ts', []],
			['/src/test2.ts', []],
		]);
		expect(findNearestSfcBoundaries(['/src/test2.ts'], graph)).toEqual(['/src/components/Home.vue']);
	});

	it('walks transitively through non-vue modules up to the boundary', () => {
		const graph = makeGraph([
			['/src/components/Home.vue', ['/src/store.ts']],
			['/src/store.ts', ['/src/helpers/format.ts']],
			['/src/helpers/format.ts', []],
		]);
		expect(findNearestSfcBoundaries(['/src/helpers/format.ts'], graph)).toEqual(['/src/components/Home.vue']);
	});

	it('matches when the graph records the dep without a script extension', () => {
		const graph = makeGraph([['/src/components/Home.vue', ['/src/test2']]]);
		expect(findNearestSfcBoundaries(['/src/test2.ts'], graph)).toEqual(['/src/components/Home.vue']);
	});

	it('matches when the changed id has no extension but the graph dep does', () => {
		const graph = makeGraph([['/src/components/Home.vue', ['/src/test2.ts']]]);
		expect(findNearestSfcBoundaries(['/src/test2'], graph)).toEqual(['/src/components/Home.vue']);
	});

	it('stops at the nearest .vue boundary and does not walk past it', () => {
		const graph = makeGraph([
			['/src/App.vue', ['/src/components/Child.vue']],
			['/src/components/Child.vue', ['/src/util.ts']],
			['/src/util.ts', []],
		]);
		expect(findNearestSfcBoundaries(['/src/util.ts'], graph)).toEqual(['/src/components/Child.vue']);
	});

	it('returns multiple boundaries deduplicated in discovery order', () => {
		const graph = makeGraph([
			['/src/components/Home.vue', ['/src/shared.ts']],
			['/src/components/Details.vue', ['/src/shared.ts']],
			['/src/shared.ts', []],
		]);
		expect(findNearestSfcBoundaries(['/src/shared.ts'], graph)).toEqual(['/src/components/Home.vue', '/src/components/Details.vue']);
	});

	it('ignores changed ids that are themselves .vue files', () => {
		const graph = makeGraph([
			['/src/App.vue', ['/src/components/Home.vue']],
			['/src/components/Home.vue', []],
		]);
		expect(findNearestSfcBoundaries(['/src/components/Home.vue'], graph)).toEqual([]);
	});

	it('returns empty when no .vue module imports the change', () => {
		const graph = makeGraph([
			['/src/app.ts', ['/src/util.ts']],
			['/src/util.ts', []],
		]);
		expect(findNearestSfcBoundaries(['/src/util.ts'], graph)).toEqual([]);
	});

	it('terminates on import cycles between non-vue modules', () => {
		const graph = makeGraph([
			['/src/a.ts', ['/src/b.ts']],
			['/src/b.ts', ['/src/a.ts']],
		]);
		expect(findNearestSfcBoundaries(['/src/a.ts'], graph)).toEqual([]);
	});

	it('strips queries from importer ids before boundary checks', () => {
		const graph = makeGraph([['/src/components/Home.vue?vue&type=script', ['/src/test2.ts']]]);
		expect(findNearestSfcBoundaries(['/src/test2.ts'], graph)).toEqual(['/src/components/Home.vue']);
	});

	it('handles empty inputs safely', () => {
		expect(findNearestSfcBoundaries([], makeGraph([['/src/a.ts', []]]))).toEqual([]);
		expect(findNearestSfcBoundaries(['/src/a.ts'], new Map())).toEqual([]);
	});
});
