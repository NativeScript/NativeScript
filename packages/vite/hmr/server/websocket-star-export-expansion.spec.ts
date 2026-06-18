import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { expandStarExports } from './websocket-served-module-helpers.js';

// The /ns/m star-export expansion replaces `export * from "url"` with an
// explicit named list (the device's HTTP ESM loader does not propagate
// star re-exports across HTTP module boundaries). These tests pin the
// TRANSITIVE semantics of that name collection: the regression that
// motivated them was @nativescript-community/ui-canvas, where
// `index.ios.js → export * from './canvas'` →
// `canvas.ios.js → export * from './canvas.common'` defines `createRectF` —
// a shallow (direct-names-only) expansion dropped it and the device failed
// with "does not provide an export named 'createRectF'".

const NM = '/node_modules/@nativescript-community/ui-canvas';

function makeServer(modules: Record<string, string>) {
	const calls: string[] = [];
	const transformer = async (url: string) => {
		calls.push(url);
		const code = modules[url];
		return code != null ? { code } : null;
	};
	return { server: { transformRequest: transformer }, transformer, calls };
}

function exportedList(out: string, url: string): string[] {
	const m = out.match(new RegExp(`export \\{ ([^}]+) \\} from ${JSON.stringify(url).replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}`));
	if (!m) return [];
	return m[1].split(',').map((s) => s.trim());
}

describe('expandStarExports — transitive star re-export chains', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});
	afterEach(() => {
		warnSpy.mockRestore();
	});

	it('collects names through nested export* chains (ui-canvas shape)', async () => {
		// index.ios.js (the importer) star-exports ./canvas → canvas.ios.js,
		// which star-exports ./canvas.common and ./utils; canvas.common
		// star-exports ./shapes. createRectF lives two levels down.
		const importer = [`import { CSSType } from "http://localhost:5173/ns/core";`, `export * from "/ns/m${NM}/canvas.ios.js";`, `export function adjustMinMaxFontScale(value, view) { return 1; }`, `export { CanvasView };`].join('\n');
		const { server, transformer } = makeServer({
			[`${NM}/canvas.ios.js`]: [`export * from "${NM}/canvas.common.js";`, `export * from "${NM}/utils.js";`, `export class Rect {}`, `export class RectF extends Rect {}`, `export class Paint {}`, `export var Style;`].join('\n'),
			[`${NM}/canvas.common.js`]: [`import { Rect, RectF } from "${NM}/canvas.ios.js";`, `export * from "${NM}/shapes/index.js";`, `export const sdkVersion = 26;`, `export function createRect(x, y, w, h) {}`, `export function createRectF(x, y, w, h) {}`].join('\n'),
			[`${NM}/utils.js`]: `export function parseCap(value) {}\nexport function parseShadow(value) {}`,
			[`${NM}/shapes/index.js`]: `import Rectangle from "${NM}/shapes/rectangle.js";\nexport { Rectangle };`,
		});

		const out = await expandStarExports(importer, server, '/', false, transformer, 'index.ios.js');
		const names = exportedList(out, `/ns/m${NM}/canvas.ios.js`);

		// Direct exports of the star target
		expect(names).toContain('Rect');
		expect(names).toContain('Paint');
		// One level down (the regression)
		expect(names).toContain('createRectF');
		expect(names).toContain('sdkVersion');
		expect(names).toContain('parseCap');
		// Two levels down
		expect(names).toContain('Rectangle');
		expect(out).not.toMatch(/export \* from/);
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('terminates on export* cycles and still collects both sides', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/a.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/a.js': `export * from "/node_modules/pkg/b.js";\nexport const fromA = 1;`,
			'/node_modules/pkg/b.js': `export * from "/node_modules/pkg/a.js";\nexport const fromB = 2;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		const names = exportedList(out, '/ns/m/node_modules/pkg/a.js');
		expect(names).toContain('fromA');
		expect(names).toContain('fromB');
	});

	it('counts named re-exports and export-star-as in the target surface', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/index.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': [`export { default as Foo, bar as renamedBar } from "/node_modules/pkg/impl.js";`, `export * as nsBundle from "/node_modules/pkg/other.js";`].join('\n'),
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		const names = exportedList(out, '/ns/m/node_modules/pkg/index.js');
		expect(names).toContain('Foo');
		expect(names).toContain('renamedBar');
		expect(names).toContain('nsBundle');
		expect(names).not.toContain('bar');
		expect(names).not.toContain('default');
	});

	it('never re-exports default through a star chain', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/index.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': `export default class Widget {}\nexport const named = 1;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		const names = exportedList(out, '/ns/m/node_modules/pkg/index.js');
		expect(names).toEqual(['named']);
	});

	it('excludes names the importer already exports lexically (spec shadowing, avoids duplicate-export SyntaxError)', async () => {
		const importer = [`export * from "/ns/m/node_modules/pkg/index.js";`, `export function shared() {}`].join('\n');
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': `export const shared = 1;\nexport const unique = 2;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		const names = exportedList(out, '/ns/m/node_modules/pkg/index.js');
		expect(names).toEqual(['unique']);
	});

	it('emits overlapping sibling-star names only once (first star wins)', async () => {
		const importer = [`export * from "/ns/m/node_modules/pkg/a.js";`, `export * from "/ns/m/node_modules/pkg/b.js";`].join('\n');
		const { server, transformer } = makeServer({
			'/node_modules/pkg/a.js': `export const overlap = 1;\nexport const onlyA = 2;`,
			'/node_modules/pkg/b.js': `export const overlap = 3;\nexport const onlyB = 4;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(exportedList(out, '/ns/m/node_modules/pkg/a.js')).toEqual(expect.arrayContaining(['overlap', 'onlyA']));
		const bNames = exportedList(out, '/ns/m/node_modules/pkg/b.js');
		expect(bNames).toContain('onlyB');
		expect(bNames).not.toContain('overlap');
	});

	it('resolves relative nested star specifiers against the parent module path', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/index.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': `export * from "./nested/common.js";`,
			'/node_modules/pkg/nested/common.js': `export const nestedName = 1;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(exportedList(out, '/ns/m/node_modules/pkg/index.js')).toContain('nestedName');
	});

	it('tolerates trailing comments on star-export lines in walked targets', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/index.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': `export * from "/node_modules/pkg/impl.js"; // barrel export`,
			'/node_modules/pkg/impl.js': `export const behindComment = 1;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(exportedList(out, '/ns/m/node_modules/pkg/index.js')).toContain('behindComment');
	});

	it('leaves the star untouched and warns when the target cannot be transformed', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/missing.js";`;
		const { server, transformer } = makeServer({});
		const out = await expandStarExports(importer, server, '/', false, transformer, 'importer.js');
		expect(out).toBe(importer);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('incomplete star-export expansion'));
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('importer.js'));
	});

	it('warns but keeps collected names when a nested target fails', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/index.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/index.js': `export * from "/node_modules/pkg/gone.js";\nexport const stillHere = 1;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(exportedList(out, '/ns/m/node_modules/pkg/index.js')).toContain('stillHere');
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('/node_modules/pkg/gone.js'));
	});

	it('replaces an exportless star target with a side-effect import to keep the dependency edge', async () => {
		const importer = `export * from "/ns/m/node_modules/pkg/side-effects.js";`;
		const { server, transformer } = makeServer({
			'/node_modules/pkg/side-effects.js': `globalThis.__patched = true;`,
		});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(out).toContain(`import "/ns/m/node_modules/pkg/side-effects.js";`);
		expect(out).not.toMatch(/export \* from/);
	});

	it('does not expand non-node_modules star exports', async () => {
		const importer = `export * from "/ns/m/src/barrel.ts";`;
		const { server, transformer, calls } = makeServer({});
		const out = await expandStarExports(importer, server, '/', false, transformer);
		expect(out).toBe(importer);
		expect(calls).toEqual([]);
	});

	it('resolves an exports-gated node_modules sub-path via /@fs instead of mis-reporting it unresolvable', async () => {
		// Vite refuses to transform a bare `/node_modules/<pkg>/<internal>.js`
		// URL when the package's `exports` map doesn't expose that sub-path,
		// even though the file is on disk — and in a monorepo the package is
		// hoisted above the app root so the bare path doesn't resolve at all.
		// This was the css-what/css-tree/rxjs `[ns/m][export*] ... unresolvable
		// star-export target` regression. The expansion must resolve the target
		// to a concrete `/@fs/<abs>` path (mirroring the main /ns/m route) or it
		// silently drops the target's runtime names. Model the gate by serving
		// ONLY the `/@fs` form from a real on-disk fixture.
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-star-fs-'));
		try {
			const pkgDir = path.join(root, 'node_modules', 'fakepkg', 'dist', 'esm');
			fs.mkdirSync(pkgDir, { recursive: true });
			const typesAbs = path.join(pkgDir, 'types.js');
			fs.writeFileSync(typesAbs, 'export const SelectorType = {};\nexport const AttributeAction = {};\n');

			const bareUrl = '/node_modules/fakepkg/dist/esm/types.js';
			const typesAbsPosix = typesAbs.replace(/\\/g, '/');
			const fsUrl = `/@fs${typesAbsPosix.startsWith('/') ? '' : '/'}${typesAbsPosix}`;

			const calls: string[] = [];
			const transformer = async (url: string) => {
				calls.push(url);
				// Bare exports-gated sub-path: refused (Vite returns nothing).
				if (url === bareUrl) return null;
				// Resolved absolute path: served.
				if (url === fsUrl) return { code: fs.readFileSync(typesAbs, 'utf-8') };
				return null;
			};
			const server = { transformRequest: transformer };

			const importer = `export * from "/ns/m${bareUrl}";`;
			const out = await expandStarExports(importer, server, root, false, transformer, 'index.js');
			const names = exportedList(out, `/ns/m${bareUrl}`);

			expect(names).toContain('SelectorType');
			expect(names).toContain('AttributeAction');
			// Proves the /@fs resolution actually fired.
			expect(calls).toContain(fsUrl);
			expect(warnSpy).not.toHaveBeenCalled();
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});
