import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Contract: `typescript` is an optional peer of this package.
 *
 * A plain JavaScript NativeScript app installs `@nativescript/vite` without
 * `typescript`, then loads `@nativescript/vite/javascript` from its vite config.
 * Any module in that import graph that imports `typescript` at load time turns
 * every `ns run` / `ns debug` into
 *   ERR_MODULE_NOT_FOUND: Cannot find package 'typescript'
 * before a single plugin runs. TypeScript projects never notice because the
 * package resolves from their own copy, which is what made the mistake easy.
 *
 * Rules the two tests below enforce:
 *  - Runtime access to the compiler goes through `loadTypeScript()` in
 *    `helpers/typescript.ts`, which resolves it lazily and returns null when it
 *    is absent; call it inside a hook, never at module scope.
 *  - Types come from `import type * as TS from 'typescript'`, which is erased.
 *  - Flavors that genuinely need the compiler at load time (Angular's
 *    compiler-cli) live behind their own subpath and are not in the list below.
 */

const RULE = "Import types with `import type * as TS from 'typescript'` and load the compiler lazily with loadTypeScript() from helpers/typescript.ts. Plain JavaScript apps do not install typescript, so a module-scope import breaks `ns run` for them with ERR_MODULE_NOT_FOUND.";

vi.mock('typescript', () => {
	throw new Error(`'typescript' was imported at module load time. ${RULE}`);
});

// Every subpath a JavaScript app (or the shared tooling it uses) can reach from
// its vite config. Framework subpaths with a hard compiler dependency are
// deliberately absent.
const JS_APP_ENTRIES = ['./configuration/javascript.js', './configuration/base.js', './configuration/typescript.js', './framework.js', './index.js'];

describe('typescript is optional for plain JavaScript apps', () => {
	it('the mock really blocks a module-scope import of typescript', async () => {
		await expect(import('typescript')).rejects.toThrow();
	});

	it.each(JS_APP_ENTRIES)('%s loads with the typescript package unavailable', async (entry) => {
		try {
			await import(entry);
		} catch (error) {
			const cause = (error as { cause?: { message?: string } })?.cause?.message ?? (error as Error)?.message ?? String(error);
			throw new Error(`${entry} (or a module it imports) loads 'typescript' at module scope, which breaks plain JavaScript apps. ${RULE}\nOriginal error: ${cause}`);
		}
	});
});

const packageRoot = import.meta.dirname;
const LOADER = path.join('helpers', 'typescript.ts');
const SOURCE_FILE = /\.(ts|js|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage']);

function collectSources(dir: string, out: string[] = []): string[] {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (SKIP_DIRS.has(entry.name)) continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectSources(full, out);
		} else if (SOURCE_FILE.test(entry.name) && !entry.name.endsWith('.d.ts') && !/\.spec\.[cm]?[jt]s$/.test(entry.name)) {
			out.push(full);
		}
	}
	return out;
}

// A value import (`import ts from`, `import * as ts from`, `import { x } from`),
// a `require('typescript')`, or a dynamic `import('typescript')`. `import type`
// and `typeof import('typescript')` are erased by tsc and stay allowed.
const RUNTIME_TYPESCRIPT_IMPORT = /^\s*import\s+(?!type\b)[^;]*?\bfrom\s+['"]typescript['"]|(?<!typeof\s)\b(?:require|import)\(\s*['"]typescript['"]\s*\)/m;

describe('typescript is only loaded through helpers/typescript.ts', () => {
	it('no other source file imports it at runtime', () => {
		const offenders = collectSources(packageRoot)
			.map((file) => path.relative(packageRoot, file))
			.filter((file) => file !== LOADER)
			.filter((file) => RUNTIME_TYPESCRIPT_IMPORT.test(fs.readFileSync(path.join(packageRoot, file), 'utf8')));
		expect(offenders, `These files import 'typescript' at runtime: ${offenders.join(', ')}. ${RULE}`).toEqual([]);
	});
});
