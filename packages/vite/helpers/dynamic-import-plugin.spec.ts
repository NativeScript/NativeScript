import { describe, expect, it } from 'vitest';
import { transformDynamicImports } from './dynamic-import-plugin.js';

const vitePreloadHelper = `const scriptRel = /* @__PURE__ */ (function detectScriptRel() {
  const relList = typeof document !== "undefined" && document.createElement("link").relList;
  return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
})();const assetsURL = function(dep) { return "/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    const link = document.createElement("link");
    seen[assetsURL(deps[0], importerUrl)] = link;
  }
  return promise.then(() => baseModule());
};`;

describe('dynamic import plugin', () => {
	it('removes the complete browser preload helper from development bundles', () => {
		const result = transformDynamicImports(`${vitePreloadHelper}\nconst page = () => __vitePreload(() => import('./page.js'), []);`);

		expect(result).not.toContain('scriptRel');
		expect(result).not.toContain('assetsURL');
		expect(result).not.toContain('const seen');
		expect(result).not.toContain('document');
		expect(result).toContain('const __vitePreload = function preload');
		expect(result).toContain("import('~/page.js')");
	});

	it('does not remove unrelated declarations when the Vite preamble is absent', () => {
		const source = `const scriptRel = "application-value";\nconst __vitePreload = function preload(baseModule) { return baseModule(); };`;
		const result = transformDynamicImports(source);

		expect(result).toContain('const scriptRel = "application-value";');
		expect(result).toContain('const __vitePreload = function preload');
	});

	it('leaves chunks without dynamic imports or the Vite helper unchanged', () => {
		const source = 'export const value = 42;';
		expect(transformDynamicImports(source)).toBe(source);
	});
});
