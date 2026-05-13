/**
 * Regression tests for the `HTTP import failed: /ns/utils (status=404)`
 * runtime crash that surfaced in `ConsumerApp` (NativeScript Vue) under
 * Vite 8 HMR after the `createRequire` polyfill landed.
 *
 * Symptom chain:
 *
 *   1. A Vue SFC like `src/components/App.vue` has a relative TS import
 *      such as `import { $goTo, $openModal } from "../utils";` alongside
 *      a `.vue` import.
 *   2. The `/ns/asm/<ver>?path=<spec>` SFC assembler pipeline runs the
 *      script body through `astNormalizeModuleImportsAndHelpers`, which
 *      uses Babel's `genCode(ast, { retainLines: true, compact: false })`.
 *      Babel preserves the original line numbers of the *first* generated
 *      node but otherwise packs multiple top-level statements onto the
 *      same physical line, producing output like:
 *        `} = __ns_rt_ns_1;import { $goTo } from "../utils";import PageWrapper from ".../PageWrapper.vue&mode=inline";...`
 *   3. `rewriteImports` then runs against this single-line blob. Every
 *      import-matching regex (`IMPORT_PATTERN_1`, `_2`, `_3`,
 *      `IMPORT_PATTERN_SIDE_EFFECT`) anchors on `(?:^|\n)\s*import`, so
 *      only the *first* import on a packed line is matched — the
 *      subsequent imports are silently passed through unchanged.
 *   4. The unrewritten relative imports survive into the served module.
 *      The iOS HTTP ESM loader resolves `../utils` against the importer
 *      URL `http://localhost:5173/ns/asm/0?path=...`, which collapses to
 *      `http://localhost:5173/ns/utils`. The dev server has no such
 *      route, so the import fails with a 404 and the app boot aborts at
 *      `startBrowserRuntimeSession`.
 *
 * The fix is a one-line normalization at the very top of `rewriteImports`
 * that splits `;import` boundaries onto their own lines so the existing
 * patterns can see every import. The same `;\s*import\s+` → `;\nimport `
 * normalization is already used by `normalizeStrayCoreStringLiterals` in
 * `core-sanitize.ts`; we centralize it at the rewriter entry point so
 * every caller — SFC asm, served modules, dep bundling, ns-m finalize —
 * benefits without having to opt in.
 *
 * These tests pin both the contract (every import in a packed line gets
 * rewritten) and the regression scenario (the exact App.vue payload from
 * the original repro).
 */
import { describe, expect, it } from 'vitest';
import { rewriteImports } from '../hmr/server/websocket.js';

const PROJECT_ROOT = '/Users/test/project';
const SERVER_ORIGIN = 'http://localhost:5173';

describe('rewriteImports: concatenated `;import` normalization', () => {
	it('rewrites every import when multiple statements share a single line', () => {
		// The exact packed line shape produced by Babel's retainLines:true
		// after `astNormalizeModuleImportsAndHelpers` runs over an SFC.
		const input = `} = __ns_rt_ns_1;import { $goTo, $openModal } from "../utils";import PageWrapper from "/ns/asm/0?path=%2Fsrc%2Fcomponents%2Forganisms%2FPageWrapper.vue&mode=inline";import { useStore } from "../../core/v4/pinia/store";let __ns_sfc__;`;
		const out = rewriteImports(input, '/src/components/App.vue', new Map(), new Map(), PROJECT_ROOT, false, undefined, SERVER_ORIGIN);

		// Every relative TS import must be canonicalized to /ns/m/<path>;
		// leaving any of them as `../utils` or `../../core/...` would let
		// the iOS HTTP ESM loader resolve them against the /ns/asm URL and
		// 404 on /ns/utils.
		expect(out).toContain('/ns/m/src/utils');
		expect(out).toContain('/ns/m/core/v4/pinia/store');
		expect(out).not.toMatch(/from\s+["']\.\.\/utils["']/);
		expect(out).not.toMatch(/from\s+["']\.\.\/\.\.\/core\/v4\/pinia\/store["']/);
	});

	it('preserves the leading non-import statement on a packed line', () => {
		// The pre-normalization splits at `;import`, so the destructure
		// close-brace and `__ns_rt_ns_1` identifier must remain intact.
		// `../bar` from `/src/views/Page.ts` (importerDir `/src/views`)
		// resolves to `/src/bar`, then maps to `/ns/m/src/bar`.
		const input = `} = __ns_rt_ns_1;import { x } from "../bar";`;
		const out = rewriteImports(input, '/src/views/Page.ts', new Map(), new Map(), PROJECT_ROOT, false, undefined, SERVER_ORIGIN);

		expect(out).toMatch(/} = __ns_rt_ns_1;/);
		expect(out).toContain('/ns/m/src/bar');
	});

	it('handles three or more concatenated relative imports on a single line', () => {
		// Stress test: the App.vue case had five imports in a row; this
		// makes sure the regex doesn't bail out mid-line (each rewrite must
		// happen independently because they share a single source line).
		const input = `;import { a } from "../a";import { b } from "../b";import { c } from "../c";import { d } from "../d";`;
		const out = rewriteImports(input, '/src/views/Page.ts', new Map(), new Map(), PROJECT_ROOT, false, undefined, SERVER_ORIGIN);

		expect(out).toContain('/ns/m/src/a');
		expect(out).toContain('/ns/m/src/b');
		expect(out).toContain('/ns/m/src/c');
		expect(out).toContain('/ns/m/src/d');
	});

	it('does not split `;import` inside the natural multi-line case', () => {
		// Idempotency: input that is already correctly formatted (each
		// import on its own line) must round-trip without spurious extra
		// blank lines or breakage.
		const input = `import { a } from "../a";\nimport { b } from "../b";\n`;
		const out = rewriteImports(input, '/src/views/Page.ts', new Map(), new Map(), PROJECT_ROOT, false, undefined, SERVER_ORIGIN);

		expect(out).toContain('/ns/m/src/a');
		expect(out).toContain('/ns/m/src/b');
		// No collapsed `;import` sequences should reappear in the output.
		expect(out).not.toMatch(/;import\s+/);
	});

	it('rewrites the canonical /ns/asm-relative App.vue payload end-to-end', () => {
		// This is the exact payload `rewriteImports` received in the
		// ConsumerApp repro (taken from `/tmp/inlineCode2-before-rewrite.js`),
		// trimmed to the load-bearing line. Before the fix, only the
		// `/ns/rt` default import got the http:// prefix; every relative
		// import after the `;` was passed through verbatim.
		const input = ['/* [ast-normalized] */', '// [sfc-asm] /src/components/App.vue (inline-compiled)', '// [sfc-asm][canonical]', `import __ns_rt_ns_1 from "/ns/rt";const { onMounted: onMounted } = __ns_rt_ns_1;import { $goTo, $openModal } from "../utils";import PageWrapper from "/ns/asm/0?path=%2Fsrc%2Fcomponents%2Forganisms%2FPageWrapper.vue&mode=inline";import { useStore } from "../../core/v4/pinia/store";import { useSettings } from "../../core/v4/pinia/settings";import { useTheme } from "../../core/v4/pinia/theme"; /* [asm-fix] re-hoisted 6 imports */let __ns_sfc__;`].join('\n');

		const out = rewriteImports(input, '/src/components/App.vue', new Map(), new Map(), PROJECT_ROOT, false, undefined, SERVER_ORIGIN);

		// Positive: every previously-untouched import lands on the HMR
		// canonical URL form so the iOS HTTP ESM loader can fetch it.
		expect(out).toContain('/ns/m/src/utils');
		expect(out).toContain('/ns/m/core/v4/pinia/store');
		expect(out).toContain('/ns/m/core/v4/pinia/settings');
		expect(out).toContain('/ns/m/core/v4/pinia/theme');
		// Negative: zero bare relative specifiers may survive — any leftover
		// would re-introduce the /ns/utils 404 on device boot.
		expect(out).not.toMatch(/from\s+["']\.\.\/utils["']/);
		expect(out).not.toMatch(/from\s+["']\.\.\/\.\.\/core\//);
	});
});
