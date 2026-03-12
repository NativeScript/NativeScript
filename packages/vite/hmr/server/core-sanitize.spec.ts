import { describe, it, expect } from 'vitest';
import { normalizeStrayCoreStringLiterals, fixDanglingCoreFrom, normalizeAnyCoreSpecToBridge } from './core-sanitize';

describe('normalizeStrayCoreStringLiterals', () => {
	it('rewrites "@nativescript/core/index.js" literal to /ns/core import with query', () => {
		const input = '"@nativescript/core/index.js";\nconst x = 1;';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toContain('import "/ns/core?p=index.js";');
		expect(out).not.toContain('@nativescript/core/index.js');
	});

	it('rewrites "@nativescript/core" literal to /ns/core import', () => {
		const input = "  '@nativescript/core';\nexport {}";
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toContain('import "/ns/core";');
		expect(out).not.toMatch(/['\"]@nativescript\/core['\"]/);
	});

	it('rewrites literal when followed by additional code on same line', () => {
		const input = '"@nativescript/core/index.js";import { x } from "/foo";';
		const out = normalizeStrayCoreStringLiterals(input);
		// We normalize concatenated imports to a new line
		expect(out).toBe('import "/ns/core?p=index.js";\nimport { x } from "/foo";');
	});

	it('does not rewrite JSON object keys for core', () => {
		const input = '{\n  "@nativescript/core": "alpha",\n  "name": "ok"\n}';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toBe(input);
	});

	it('merges dangling from with next core import', () => {
		const src = 'import { A, B } from\nimport "/ns/core?p=index.js";';
		const out = fixDanglingCoreFrom(src);
		expect(out).toBe('import { A, B } from "/ns/core?p=index.js";');
	});

	it('merges dangling from when next line has core import followed by another import on same line', () => {
		const src = ['import { A, B } from', 'import "http://localhost:5173/ns/core/0?p=index.js";import { useX } from "http://localhost:5173/ns/m/x";'].join('\n');
		const out = fixDanglingCoreFrom(src);
		expect(out).toContain('import { A, B } from "http://localhost:5173/ns/core/0?p=index.js";');
		// ensure the trailing import remains on a new line
		expect(out).toContain('import { useX } from "http://localhost:5173/ns/m/x";');
		// and only one core import remains
		const coreCount = out.match(/ns\/core\//g)?.length || 0;
		expect(coreCount).toBe(1);
	});

	it('handles concatenated import before a multiline named import that dangles from', () => {
		const src = ['import App from "http://localhost:5173/ns/sfc/0/src/components/App.vue";import {', '  TouchManager,', '  CoreTypes,', '  Frame', '} from', 'import "http://localhost:5173/ns/core/0?p=index.js";import { useServices } from "http://localhost:5173/ns/m/core/v4/pinia/services";'].join('\n');
		const norm = normalizeStrayCoreStringLiterals(src);
		const out = fixDanglingCoreFrom(norm);
		expect(out).toContain('import {');
		expect(out).toContain('} from "http://localhost:5173/ns/core/0?p=index.js";');
		expect(out).toContain('import App from "http://localhost:5173/ns/sfc/0/src/components/App.vue";');
		expect(out).toContain('import { useServices } from "http://localhost:5173/ns/m/core/v4/pinia/services";');
	});

	it('is idempotent when no core literal present', () => {
		const input = 'import x from "/ns/core";\nconst y = "ok";';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toBe(input);
	});

	it('normalizes bare core subpath import to bridge', () => {
		const src = 'import { isAndroid } from "@nativescript/core/index.js";';
		const out = normalizeAnyCoreSpecToBridge(src);
		expect(out).toBe('import { isAndroid } from "/ns/core?p=index.js";');
	});

	it('normalizes resolved node_modules core import to bridge', () => {
		const src = 'import { isAndroid } from "/node_modules/@nativescript/core/index.js?v=abc123";';
		const out = normalizeAnyCoreSpecToBridge(src);
		expect(out).toBe('import { isAndroid } from "/ns/core?p=index.js";');
	});
});
