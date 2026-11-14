import { vi } from 'vitest';
import { cssTreeParse } from '../../css/css-tree-parser';
import { parse as reworkCssParse } from '../../css/reworkcss.js';
import { RuleSet, StyleSheetSelectorScope } from './css-selector';
import { _populateRules, StyleScope } from './style-scope';

// Imported sheets resolve through global.loadModule, keyed by module name.
vi.mock('../../module-name-resolver', () => ({ resolveModuleName: (name: string) => name }));

describe('cascade layers', () => {
	function createWith(parse: (css: string, source: string) => any, css: string): { rulesets: RuleSet[]; keyframes: any[]; selectorScope: StyleSheetSelectorScope<any> } {
		const parsed = parse(css, 'css-layer.ts@test');
		const rulesets: RuleSet[] = [];
		const keyframes = [];

		_populateRules(parsed.stylesheet.rules, rulesets, keyframes);

		return { rulesets, keyframes, selectorScope: new StyleSheetSelectorScope(rulesets) };
	}

	function create(css: string) {
		return createWith(cssTreeParse, css);
	}

	function winningValue(css: string, node: any, property = 'color') {
		const { selectorScope } = create(css);
		const { selectors } = selectorScope.query(node);
		const winner = selectors[selectors.length - 1];

		return winner?.ruleset.declarations.find((d) => d.property === property)?.value;
	}

	it('populates rules inside @layer blocks', () => {
		const { rulesets } = create(`@layer base { label { color: red; } }`);
		expect(rulesets.length).toBe(1);
		expect(rulesets[0].layerPath).toHaveLength(1);
		expect(typeof rulesets[0].layerPath[0]).toBe('number');
	});

	it('orders layers by the statement form regardless of specificity and position', () => {
		// #main outranks .login on both specificity and source order, but it sits in
		// `low` — declared before `high` — so the layered .login rule still wins.
		const winner = winningValue(
			`
			@layer low, high;
			@layer high { .login { color: green; } }
			@layer low { #main { color: blue; } }
			`,
			{ cssType: 'label', id: 'main', cssClasses: new Set(['login']) },
		);
		expect(winner).toBe('green');
	});

	it('orders layers by first block declaration when no statement exists', () => {
		const winner = winningValue(
			`
			@layer first { #main { color: blue; } }
			@layer second { .login { color: green; } }
			`,
			{ cssType: 'label', id: 'main', cssClasses: new Set(['login']) },
		);
		expect(winner).toBe('green');
	});

	it('lets unlayered rules beat every layered rule', () => {
		const winner = winningValue(
			`
			@layer base { label { color: red; } }
			* { color: blue; }
			`,
			{ cssType: 'label' },
		);
		expect(winner).toBe('blue');
	});

	it('lets unlayered rules win even when declared before the layer', () => {
		const winner = winningValue(
			`
			* { color: blue; }
			@layer base { label { color: red; } }
			`,
			{ cssType: 'label' },
		);
		expect(winner).toBe('blue');
	});

	it('matches nested layer blocks to dotted names', () => {
		const winner = winningValue(
			`
			@layer outer { @layer inner { .login { color: red; } } }
			@layer outer.inner { .login { color: green; } }
			`,
			{ cssType: 'label', cssClasses: new Set(['login']) },
		);
		// Both write to layer `outer.inner`; appended rules cascade by source order.
		expect(winner).toBe('green');
	});

	it('orders nested layers beneath their parents', () => {
		const winner = winningValue(
			`
			@layer a { .login { color: red; } }
			@layer b.inner { .login { color: green; } }
			`,
			{ cssType: 'label', cssClasses: new Set(['login']) },
		);
		// a (ordinal 0) vs b.inner (ordinal [1, …]) — top level decides, b wins.
		expect(winner).toBe('green');
	});

	it('gives each anonymous layer its own rank in source order', () => {
		const winner = winningValue(
			`
			@layer { .login { color: red; } }
			@layer { .login { color: green; } }
			`,
			{ cssType: 'label', cssClasses: new Set(['login']) },
		);
		expect(winner).toBe('green');
	});

	it('keeps unlayered rules stronger than anonymous layers', () => {
		const winner = winningValue(
			`
			@layer { .login { color: red; } }
			.login { color: blue; }
			`,
			{ cssType: 'label', cssClasses: new Set(['login']) },
		);
		expect(winner).toBe('blue');
	});

	it('preserves media queries on rules inside layers', () => {
		const { rulesets } = create(`
			@layer base {
				@media only screen and (min-width: 1) {
					.login { color: red; }
				}
			}
		`);
		expect(rulesets.length).toBe(1);
		expect(rulesets[0].mediaQueryString).toBe('only screen and (min-width: 1)');
		expect(rulesets[0].layerPath?.length).toBe(1);
	});

	it('collects keyframes declared inside layers', () => {
		const { keyframes } = create(`
			@layer base {
				@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
			}
		`);
		expect(keyframes.length).toBe(1);
		expect(keyframes[0].name).toBe('fade');
	});

	it('leaves ruleset layerPath unset for unlayered rules', () => {
		const { rulesets } = create(`.login { color: red; }`);
		expect(rulesets[0].layerPath).toBeUndefined();
	});

	it('parses @layer through the legacy rework parser (build-time css2json path)', () => {
		// The rework AST shape is also what css2json-loader and vite ship at build
		// time, so layer nodes in it must reach _populateRules.
		const { rulesets } = createWith(
			(css, source) => reworkCssParse(css, { source }),
			`
			@layer low, high;
			@layer high { .login { color: green; } }
			@layer low { #main { color: blue; } }
			`,
		);
		expect(rulesets.length).toBe(2);
		expect(rulesets[0].layerPath).toHaveLength(1);
		expect(rulesets[1].layerPath).toHaveLength(1);
	});

	describe('@import layer()', () => {
		const node = { cssType: 'label', id: 'main', cssClasses: new Set(['login']) } as any;
		let previousLoadModule: any;

		beforeEach(() => {
			previousLoadModule = (global as any).loadModule;
		});

		afterEach(() => {
			(global as any).loadModule = previousLoadModule;
		});

		function winningImportedValue(modules: Record<string, string>, css: string) {
			(global as any).loadModule = (name: string) => modules[name];
			const scope = new StyleScope();
			scope.addCss(css);
			scope.ensureSelectors();
			const selectors = scope.query(node);

			return selectors[selectors.length - 1]?.ruleset.declarations.find((d) => d.property === 'color')?.value;
		}

		it('ranks the import layer before layers the importer declares later', () => {
			// imp-shared inside the import is imp-vendor.imp-shared, a different layer
			// from the importer's own imp-shared, which comes after imp-vendor.
			const winner = winningImportedValue(
				{ vendor: '@layer imp-shared { #main { color: red; } }' },
				`@import url("vendor.css") layer(imp-vendor);
@layer imp-shared { .login { color: green; } }`,
			);
			expect(winner).toBe('green');
		});

		it("nests the imported sheet's layers so they cannot reorder the importer's layers", () => {
			// The imported sheet declares imp-base before imp-theme; the importer's own
			// statement puts imp-theme first, so its imp-base rule must still win.
			const winner = winningImportedValue(
				{ library: '@layer imp-base { .q { color: red; } } @layer imp-theme { .q { color: red; } }' },
				`@import url("library.css") layer(imp-library);
				@layer imp-theme, imp-base;
				@layer imp-theme { #main { color: blue; } }
				@layer imp-base { .login { color: green; } }`,
			);
			expect(winner).toBe('green');
		});

		it('keeps a plain import nested inside a layered import in that layer', () => {
			const winner = winningImportedValue(
				{ outer: '@import url("inner.css");', inner: '#main { color: red; }' },
				`@import url("outer.css") layer(imp-outer);
@layer imp-later { .login { color: green; } }`,
			);
			expect(winner).toBe('green');
		});
	});
});
