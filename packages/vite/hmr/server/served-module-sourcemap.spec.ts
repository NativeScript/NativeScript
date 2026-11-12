import { decode } from '@jridgewell/sourcemap-codec';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';

import { appendInlineSourceMap, buildServedModuleSourceMap, type InputSourceMap } from './served-module-sourcemap.js';

const MODULE_FILE = '/project/src/components/counter.ts';

const SOURCE = [
	`import { signal } from 'solid-js';`, // 1
	``, // 2
	`interface Props {`, // 3
	`  start: number;`, // 4
	`}`, // 5
	``, // 6
	`export function counter(props: Props) {`, // 7
	`  const [count, setCount] = signal<number>(props.start);`, // 8
	`  const bump = (by: number) => setCount(count() + by);`, // 9
	`  const lazy = () => import('./lazy');`, // 10
	`  return { count, bump, lazy };`, // 11
	`}`, // 12
].join('\n');

function transform(): { code: string; map: InputSourceMap } {
	const result = transformSync(SOURCE, { loader: 'ts', format: 'esm', sourcemap: 'external', sourcefile: 'counter.ts' });
	return { code: result.code, map: JSON.parse(result.map) };
}

/** 1-based source line that generated position (line 1-based, column 0-based) maps to. */
function sourceLineAt(mappings: string, line: number, column: number): number | undefined {
	const segments = decode(mappings)[line - 1] ?? [];
	let hit: number[] | undefined;
	for (const segment of segments) {
		if (segment[0] <= column && segment.length > 1) hit = segment;
	}
	return hit ? hit[2] + 1 : undefined;
}

function lineOf(code: string, needle: string): number {
	const index = code.split('\n').findIndex((line) => line.includes(needle));
	if (index < 0) throw new Error(`"${needle}" not in code`);
	return index + 1;
}

describe('buildServedModuleSourceMap', () => {
	it('maps the module body to the original source through a prepended preamble and rewritten lines', () => {
		const { code, map } = transform();
		const served = [`const __nsBootGlobal = globalThis;`, `try { __nsBootGlobal.__NS_HMR_BOOT_LAST_MODULE__ = "/src/components/counter"; } catch {}`, `;(function(){ /* require guard */ })();`, code.replace(`from "solid-js"`, `from "http://localhost:5173/ns/m/node_modules/solid-js/dist/solid.dev.js"`).replace(`import("./lazy")`, `__nsDynamicImport("http://localhost:5173/ns/m/src/components/lazy")`)].join('\n');

		const result = buildServedModuleSourceMap(code, served, map, MODULE_FILE)!;

		expect(result.sources).toEqual(['file:///project/src/components/counter.ts']);
		expect(result.sourcesContent).toEqual([SOURCE]);
		expect(sourceLineAt(result.mappings, 1, 0)).toBeUndefined();
		expect(sourceLineAt(result.mappings, 2, 0)).toBeUndefined();

		const bumpLine = lineOf(served, 'const bump');
		const bumpColumn = served.split('\n')[bumpLine - 1].indexOf('setCount(count()');
		expect(sourceLineAt(result.mappings, bumpLine, bumpColumn)).toBe(9);
		expect(sourceLineAt(result.mappings, lineOf(served, 'return {'), 2)).toBe(11);
		expect(sourceLineAt(result.mappings, lineOf(served, '__nsDynamicImport'), 0)).toBe(10);
	});

	it('leaves lines that only exist in the served code unmapped', () => {
		const { code, map } = transform();
		const served = code.replace('  const bump', '  const __injected = 1;\n  const bump');

		const result = buildServedModuleSourceMap(code, served, map, MODULE_FILE)!;

		expect(sourceLineAt(result.mappings, lineOf(served, '__injected'), 0)).toBeUndefined();
		expect(sourceLineAt(result.mappings, lineOf(served, 'const bump'), 2)).toBe(9);
	});

	it('follows lines that were only re-indented, shifting columns by the indentation change', () => {
		const { code, map } = transform();
		const served = `/* [ast-normalized] */\n${code.replace(/^ {2}/gm, '\t\t')}`;
		const bumpLine = lineOf(served, 'const bump');
		const bumpColumn = served.split('\n')[bumpLine - 1].indexOf('setCount(count()');
		const vite = code.split('\n')[lineOf(code, 'const bump') - 1];
		const viteColumn = vite.indexOf('setCount(count()');

		const result = buildServedModuleSourceMap(code, served, map, MODULE_FILE)!;

		expect(sourceLineAt(result.mappings, bumpLine, bumpColumn)).toBe(9);
		const segment = decode(result.mappings)[bumpLine - 1].find((s) => s[0] === bumpColumn);
		const original = decode(map.mappings)[lineOf(code, 'const bump') - 1].find((s) => s[0] === viteColumn);
		expect(segment?.slice(1)).toEqual(original?.slice(1));
	});

	it('resolves sources against sourceRoot and keeps URL sources as they are', () => {
		const { code, map } = transform();
		const result = buildServedModuleSourceMap(code, code, { ...map, sources: ['counter.ts', 'virtual:helpers'], sourceRoot: '../../original' }, MODULE_FILE)!;

		expect(result.sources).toEqual(['file:///project/original/counter.ts', 'virtual:helpers']);
	});

	it('returns null without usable mappings', () => {
		const { code, map } = transform();
		expect(buildServedModuleSourceMap(code, code, null, MODULE_FILE)).toBeNull();
		expect(buildServedModuleSourceMap(code, code, { ...map, mappings: '' }, MODULE_FILE)).toBeNull();
		expect(buildServedModuleSourceMap(code, 'export {};\n', map, MODULE_FILE)).toBeNull();
	});
});

describe('appendInlineSourceMap', () => {
	it('appends a base64 data URL that round-trips the map', () => {
		const { code, map } = transform();
		const sourceMap = buildServedModuleSourceMap(code, code, map, MODULE_FILE);

		const out = appendInlineSourceMap('export {};', sourceMap);

		const [, base64] = out.match(/\n\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,(\S+)\n$/)!;
		expect(JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))).toEqual(sourceMap);
	});

	it('does not add a second map to code that already references one', () => {
		const { code, map } = transform();
		const existing = 'export {};\n//# sourceMappingURL=lib.js.map\n';

		expect(appendInlineSourceMap(existing, buildServedModuleSourceMap(code, code, map, MODULE_FILE))).toBe(existing);
		expect(appendInlineSourceMap('export {};', null)).toBe('export {};');
	});
});
