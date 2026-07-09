import { describe, expect, it } from 'vitest';

import { rewriteImports } from './rewrite-imports.js';

// astNormalizeModuleImportsAndHelpers (babel generate with retainLines: true)
// can emit multiple statements on ONE line, e.g.
//   `const { Color } = __ns_core_ns_1;export * from "/@fs/...";`
// Every IMPORT/EXPORT pattern anchors on `(?:^|\n)`, so a glued re-export is
// invisible to the rewriter. The miss is not cosmetic: the raw `/@fs/<abs>`
// specifier survives while sibling imports of the SAME file are rewritten to
// the canonical `/ns/m/...` URL — two URLs for one file split its module
// identity on device, and V8 reports "contains conflicting star exports for
// name ..." in any importer whose star exports reach both instances
// (observed with `plugins/src/ui-helper` in a monorepo app).
describe('rewriteImports — glued re-export normalization', () => {
	const ORIGIN = 'http://localhost:5173';
	const rewrite = (code: string, importer: string) => rewriteImports(code, importer, new Map(), new Map(), '/repo', false, undefined, ORIGIN, true);

	it('rewrites `export * from "/@fs/..."` glued onto the previous statement', () => {
		const input = `const { Color } = __ns_core_ns_1;export * from "/@fs/repo/plugins/src/ui-helper/ui-helper-common.ts";\n`;
		const out = rewrite(input, '/plugins/src/ui-helper/ui-helper.ios.ts');
		expect(out).toContain(`export * from "${ORIGIN}/ns/m/plugins/src/ui-helper/ui-helper-common.ts"`);
		expect(out).not.toContain('/@fs/');
	});

	it('rewrites a glued named re-export', () => {
		const input = `const x = 1;export { deepLink$ } from "/@fs/repo/plugins/src/ui-helper/ui-helper-common.ts";\n`;
		const out = rewrite(input, '/plugins/src/ui-helper/index.ts');
		expect(out).toContain(`export { deepLink$ } from "${ORIGIN}/ns/m/plugins/src/ui-helper/ui-helper-common.ts"`);
		expect(out).not.toContain('/@fs/');
	});

	it('still rewrites the same re-exports when already on their own line', () => {
		const input = `export * from "/@fs/repo/plugins/src/ui-helper/ui-helper-common.ts";\n`;
		const out = rewrite(input, '/plugins/src/ui-helper/index.ts');
		expect(out).toContain(`export * from "${ORIGIN}/ns/m/plugins/src/ui-helper/ui-helper-common.ts"`);
	});

	it('does not split `export default` or plain `export const` statements', () => {
		const input = `const x = 1;export default x;\nexport const banner = 'hi';\n`;
		const out = rewrite(input, '/src/x.ts');
		expect(out).toContain(`const x = 1;export default x;`);
		expect(out).toContain(`export const banner = 'hi';`);
	});
});
