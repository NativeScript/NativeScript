/**
 * `css-tree/lib/data-patch.js` runs `import { createRequire } from 'module'`.
 * The base config aliases `module` (`aliasCssTree`) and `node:module`
 * (`resolveConfig.alias`) to local polyfills exporting `createRequire`. The
 * dep optimizer applies those aliases too, so a pre-bundle of css-tree would
 * inline its own copy of the polyfill. Both specifiers therefore stay in
 * `NS_OPTIMIZE_DEPS_EXCLUDE`: the pre-bundle keeps a bare import, which
 * import analysis resolves through the alias to the one served polyfill.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_PKG_ROOT = path.resolve(__dirname, '..');

function readSource(relativePath: string): string {
	return fs.readFileSync(path.join(VITE_PKG_ROOT, relativePath), 'utf8');
}

/**
 * Extract the contents of a `const <name> = [...]` literal from a TS file so
 * we don't rely on importing `base.ts` (which would force us to mock the
 * full project resolution chain just to read a constant).
 */
function extractArrayLiteral(source: string, name: string): string[] {
	const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`);
	const match = source.match(re);
	if (!match) {
		throw new Error(`Could not find array literal: ${name}`);
	}
	const body = match[1];
	const items: string[] = [];
	const itemRe = /['"`]([^'"`]+)['"`]/g;
	let m: RegExpExecArray | null;
	while ((m = itemRe.exec(body)) !== null) {
		items.push(m[1]);
	}
	return items;
}

describe('css-tree createRequire polyfill protection', () => {
	const baseSource = readSource('configuration/base.ts');

	it('keeps bare `module` and `node:module` external to every pre-bundle', () => {
		const optimizeDepsSource = readSource('helpers/optimize-deps.ts');
		const exclude = extractArrayLiteral(optimizeDepsSource, 'NS_OPTIMIZE_DEPS_EXCLUDE');
		expect(exclude).toContain('module');
		expect(exclude).toContain('node:module');
		// The dev optimizeDeps config must consume the shared constant (not re-list it inline).
		expect(readSource('helpers/dev-optimize-deps.ts')).toContain('NS_OPTIMIZE_DEPS_EXCLUDE');
	});

	it('aliases the bare `module` specifier to the local css-tree polyfill', () => {
		const cssTreeSource = readSource('helpers/css-tree.ts');
		expect(cssTreeSource).toMatch(/find:\s*['"]module['"]/);
		expect(cssTreeSource).toMatch(/polyfills\/module\.js/);
	});

	it('aliases `node:module` to the NS runtime shim', () => {
		expect(baseSource).toMatch(/find:\s*\/\^node:module\$\//);
		expect(baseSource).toMatch(/shims\/node-module\.js/);
	});

	it('exposes a `createRequire` symbol from the css-tree polyfill', () => {
		// Final guard: the polyfill itself must actually export
		// `createRequire`. Tests in the chain above only confirm the alias
		// points at this file; this confirms the file fulfills the contract
		// css-tree depends on.
		const polyfillSource = readSource('polyfills/module.ts');
		expect(polyfillSource).toMatch(/export\s+function\s+createRequire/);
	});

	it('exposes a `createRequire` symbol from the node-module shim', () => {
		const shimSource = readSource('shims/node-module.ts');
		expect(shimSource).toMatch(/export\s+function\s+createRequire/);
	});
});
