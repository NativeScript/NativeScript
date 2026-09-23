import { describe, it, expect } from 'vitest';
import { normalizeStrayCoreStringLiterals, fixDanglingCoreFrom, normalizeAnyCoreSpecToBridge, isDirectoryIndexFilename, resolveRelativeCoreSub, rewriteSpecifiersForDevice, type RelativeBase } from './core-sanitize';

describe('normalizeStrayCoreStringLiterals', () => {
	it('rewrites "@nativescript/core/index.js" literal to the main /ns/core bridge import', () => {
		const input = '"@nativescript/core/index.js";\nconst x = 1;';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toContain('import "/ns/core";');
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
		expect(out).toBe('import "/ns/core";\nimport { x } from "/foo";');
	});

	it('does not rewrite JSON object keys for core', () => {
		const input = '{\n  "@nativescript/core": "alpha",\n  "name": "ok"\n}';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toBe(input);
	});

	it('merges dangling from with next core import', () => {
		const src = 'import { A, B } from\nimport "/ns/core";';
		const out = fixDanglingCoreFrom(src);
		expect(out).toBe('import { A, B } from "/ns/core";');
	});

	it('merges dangling from when next line has core import followed by another import on same line', () => {
		const src = ['import { A, B } from', 'import "http://localhost:5173/ns/core";import { useX } from "http://localhost:5173/ns/m/x";'].join('\n');
		const out = fixDanglingCoreFrom(src);
		expect(out).toContain('import { A, B } from "http://localhost:5173/ns/core";');
		expect(out).toContain('import { useX } from "http://localhost:5173/ns/m/x";');
		const coreCount = out.match(/ns\/core/g)?.length || 0;
		expect(coreCount).toBe(1);
	});

	it('handles concatenated import before a multiline named import that dangles from', () => {
		const src = ['import App from "http://localhost:5173/ns/sfc/0/src/components/App.vue";import {', '  TouchManager,', '  CoreTypes,', '  Frame', '} from', 'import "http://localhost:5173/ns/core";import { useServices } from "http://localhost:5173/ns/m/core/v4/pinia/services";'].join('\n');
		const norm = normalizeStrayCoreStringLiterals(src);
		const out = fixDanglingCoreFrom(norm);
		expect(out).toContain('import {');
		expect(out).toContain('} from "http://localhost:5173/ns/core";');
		expect(out).toContain('import App from "http://localhost:5173/ns/sfc/0/src/components/App.vue";');
		expect(out).toContain('import { useServices } from "http://localhost:5173/ns/m/core/v4/pinia/services";');
	});

	it('is idempotent when no core literal present', () => {
		const input = 'import x from "/ns/core";\nconst y = "ok";';
		const out = normalizeStrayCoreStringLiterals(input);
		expect(out).toBe(input);
	});

	it('normalizes bare core package entry import to the main bridge', () => {
		const src = 'import { isAndroid } from "@nativescript/core/index.js";';
		const out = normalizeAnyCoreSpecToBridge(src);
		expect(out).toBe('import { isAndroid } from "/ns/core";');
	});

	it('normalizes resolved node_modules core entry import to the main bridge', () => {
		const src = 'import { isAndroid } from "/node_modules/@nativescript/core/index.js?v=abc123";';
		const out = normalizeAnyCoreSpecToBridge(src);
		expect(out).toBe('import { isAndroid } from "/ns/core";');
	});
});

describe('isDirectoryIndexFilename', () => {
	it('detects platform-suffixed index files', () => {
		expect(isDirectoryIndexFilename('/abs/path/index.android.ts')).toBe(true);
		expect(isDirectoryIndexFilename('/abs/path/index.ios.js')).toBe(true);
		expect(isDirectoryIndexFilename('/abs/path/index.visionos.mjs')).toBe(true);
	});

	it('detects plain index files', () => {
		expect(isDirectoryIndexFilename('/abs/index.js')).toBe(true);
		expect(isDirectoryIndexFilename('/abs/index.ts')).toBe(true);
		expect(isDirectoryIndexFilename('/abs/index.mjs')).toBe(true);
	});

	it('rejects non-index files', () => {
		expect(isDirectoryIndexFilename('/abs/path/layout-helper-common.ts')).toBe(false);
		expect(isDirectoryIndexFilename('/abs/path/native-helper.android.ts')).toBe(false);
		expect(isDirectoryIndexFilename('/abs/path/utils.js')).toBe(false);
	});

	it('tolerates query and hash suffixes', () => {
		expect(isDirectoryIndexFilename('/abs/index.android.ts?v=abc')).toBe(true);
		expect(isDirectoryIndexFilename('/abs/index.ios.js#cache')).toBe(true);
	});

	it('returns false for empty or non-string input', () => {
		expect(isDirectoryIndexFilename('')).toBe(false);
		expect(isDirectoryIndexFilename(null as unknown as string)).toBe(false);
	});
});

describe('resolveRelativeCoreSub', () => {
	const dirIndex = (sub: string): RelativeBase => ({ sub, isDirectoryIndex: true });
	const fileMod = (sub: string): RelativeBase => ({ sub, isDirectoryIndex: false });

	it('resolves sibling import from a directory-index module into a child sub-path', () => {
		// utils/layout-helper/index.android.ts importing ./layout-helper-common
		expect(resolveRelativeCoreSub('./layout-helper-common', dirIndex('utils/layout-helper'))).toBe('utils/layout-helper/layout-helper-common');
	});

	it('resolves sibling import from a plain file module against the parent directory', () => {
		// utils/native-helper.android.ts importing ./types
		expect(resolveRelativeCoreSub('./types', fileMod('utils/native-helper'))).toBe('utils/types');
	});

	it('walks up with ../ from a plain file module', () => {
		// ui/core/view-base/utils importing ../view → ui/core/view
		expect(resolveRelativeCoreSub('../view', fileMod('ui/core/view-base/utils'))).toBe('ui/core/view');
	});

	it('walks up with ../ from a directory-index module', () => {
		// ui/core/view/index.ts (dirIndex sub = 'ui/core/view') importing ../../core-types:
		//   start dir = ui/core/view → ../ → ui/core → ../ → ui → core-types → ui/core-types
		expect(resolveRelativeCoreSub('../../core-types', dirIndex('ui/core/view'))).toBe('ui/core-types');
	});

	it('strips .ts/.js/.mjs extensions from the resolved path', () => {
		expect(resolveRelativeCoreSub('./layout-helper-common.ts', dirIndex('utils/layout-helper'))).toBe('utils/layout-helper/layout-helper-common');
		expect(resolveRelativeCoreSub('./layout-helper-common.mjs', dirIndex('utils/layout-helper'))).toBe('utils/layout-helper/layout-helper-common');
	});

	it('returns null for non-relative specifiers', () => {
		expect(resolveRelativeCoreSub('/abs/path', dirIndex('x'))).toBeNull();
		expect(resolveRelativeCoreSub('bare-spec', dirIndex('x'))).toBeNull();
		expect(resolveRelativeCoreSub('', dirIndex('x'))).toBeNull();
	});

	it('returns null when .. tries to escape the @nativescript/core root', () => {
		expect(resolveRelativeCoreSub('../outside', fileMod('top-level'))).toBeNull();
	});
});

describe('rewriteSpecifiersForDevice — relative imports with RelativeBase', () => {
	const origin = 'http://localhost:5173';

	it('rewrites a sibling import from a directory-index core module into an absolute /ns/core URL', () => {
		const src = 'import * as layoutCommon from "./layout-helper-common";';
		const out = rewriteSpecifiersForDevice(src, origin, 0, { sub: 'utils/layout-helper', isDirectoryIndex: true });
		expect(out).toContain('"/ns/core/utils/layout-helper/layout-helper-common"');
		expect(out).not.toContain('"./layout-helper-common"');
	});

	it('rewrites a parent-relative import from a plain core file', () => {
		const src = 'import { android } from "../native-helper";';
		const out = rewriteSpecifiersForDevice(src, origin, 0, { sub: 'utils/layout-helper/layout-helper-common', isDirectoryIndex: false });
		expect(out).toContain('"/ns/core/utils/native-helper"');
	});

	it('leaves relative imports unchanged when no RelativeBase is supplied (legacy callers)', () => {
		const src = 'import x from "./y";';
		const out = rewriteSpecifiersForDevice(src, origin, 0);
		expect(out).toBe(src);
	});

	it('does not touch absolute or bridge specifiers when rewriting relatives', () => {
		const src = ['import a from "./local";', 'import b from "/ns/core/utils";', 'import c from "http://localhost:5173/ns/m/x";'].join('\n');
		const out = rewriteSpecifiersForDevice(src, origin, 0, { sub: 'utils/layout-helper', isDirectoryIndex: true });
		expect(out).toContain('"/ns/core/utils/layout-helper/local"');
		expect(out).toContain('"/ns/core/utils"');
		expect(out).toContain('"http://localhost:5173/ns/m/x"');
	});

	it('rewrites dynamic import("./x") with RelativeBase', () => {
		const src = 'const m = import("./sibling-dynamic");';
		const out = rewriteSpecifiersForDevice(src, origin, 0, { sub: 'utils/layout-helper', isDirectoryIndex: true });
		expect(out).toContain('import("/ns/core/utils/layout-helper/sibling-dynamic")');
	});
});
