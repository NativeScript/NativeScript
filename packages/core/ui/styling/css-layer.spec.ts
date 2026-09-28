import { cssTreeParse } from '../../css/css-tree-parser';
import { RuleSet, StyleSheetSelectorScope } from './css-selector';
import { _populateRules } from './style-scope';

describe('cascade layers', () => {
	function create(css: string, source = 'css-layer.ts@test'): { rulesets: RuleSet[]; keyframes: any[]; selectorScope: StyleSheetSelectorScope<any> } {
		const parsed = cssTreeParse(css, source);
		const rulesets: RuleSet[] = [];
		const keyframes = [];

		_populateRules(parsed.stylesheet.rules, rulesets, keyframes);

		return { rulesets, keyframes, selectorScope: new StyleSheetSelectorScope(rulesets) };
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
});
