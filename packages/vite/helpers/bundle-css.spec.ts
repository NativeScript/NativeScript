import { describe, expect, it } from 'vitest';

import { BUNDLE_CSS_AST_SENTINEL, collectBundleCssAssets, inlineBundleCss } from './bundle-css.js';

const css = (fileName: string, source: string) => ({ type: 'asset', fileName, source });
const chunk = (fileName: string, extra: Record<string, unknown> = {}) => ({ type: 'chunk', fileName, code: '', imports: [], dynamicImports: [], viteMetadata: { importedCss: new Set<string>() }, ...extra });

function appBundle() {
	return {
		'bundle.mjs': chunk('bundle.mjs', {
			isEntry: true,
			code: `try{m(\`${BUNDLE_CSS_AST_SENTINEL}\`,\`ns-bundle-css\`)}catch{}`,
			imports: ['vendor.mjs'],
			dynamicImports: ['lazy.mjs'],
			viteMetadata: { importedCss: new Set(['assets/bundle.css']) },
		}),
		'vendor.mjs': chunk('vendor.mjs', { viteMetadata: { importedCss: new Set(['assets/vendor.css']) } }),
		'lazy.mjs': chunk('lazy.mjs', { viteMetadata: { importedCss: new Set(['assets/lazy.css']) } }),
		'assets/bundle.css': css('assets/bundle.css', '.btn{color:app}'),
		'assets/lazy.css': css('assets/lazy.css', '.lazy{color:red}'),
		'assets/vendor.css': css('assets/vendor.css', '.btn{color:vendor}'),
	} as Record<string, any>;
}

describe('collectBundleCssAssets', () => {
	it('orders static imports before the importer and dynamic imports after', () => {
		expect(collectBundleCssAssets(appBundle()).map((a) => a.fileName)).toEqual(['assets/vendor.css', 'assets/bundle.css', 'assets/lazy.css']);
	});

	it('appends CSS no chunk claims', () => {
		const bundle = appBundle();
		bundle['assets/orphan.css'] = css('assets/orphan.css', '');
		expect(
			collectBundleCssAssets(bundle)
				.map((a) => a.fileName)
				.at(-1),
		).toBe('assets/orphan.css');
	});
});

describe('inlineBundleCss', () => {
	it('replaces a template-literal sentinel with the AST, in import order', () => {
		const bundle = appBundle();
		const result = inlineBundleCss(bundle, (cssText) => JSON.stringify(cssText));

		expect(result).toMatchObject({ assetCount: 3, replaced: true });
		expect(bundle['bundle.mjs'].code).toBe(`try{m(${JSON.stringify('.btn{color:vendor}\n.btn{color:app}\n.lazy{color:red}\n')},\`ns-bundle-css\`)}catch{}`);
		expect(Object.keys(bundle).filter((k) => k.endsWith('.css'))).toEqual([]);
	});

	it.each([`'`, `"`])('replaces a %s-quoted sentinel', (quote) => {
		const bundle = appBundle();
		bundle['bundle.mjs'].code = `m(${quote}${BUNDLE_CSS_AST_SENTINEL}${quote})`;
		expect(inlineBundleCss(bundle, () => '{}').replaced).toBe(true);
		expect(bundle['bundle.mjs'].code).toBe('m({})');
	});

	it('keeps the CSS assets when no chunk carries the sentinel', () => {
		const bundle = appBundle();
		bundle['bundle.mjs'].code = '';
		expect(inlineBundleCss(bundle, () => '{}').replaced).toBe(false);
		expect(bundle['assets/vendor.css']).toBeDefined();
	});
});
