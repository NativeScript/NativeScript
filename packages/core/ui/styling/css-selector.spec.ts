import { parse } from '../../css/reworkcss';
import { createSelector, RuleSet, StyleSheetSelectorScope, fromAstNode, Node, Changes } from './css-selector';

describe('css-selector', () => {
	it('button[attr]', () => {
		const sel = createSelector('button[testAttr]');
		expect(
			sel.match(<any>{
				cssType: 'button',
				testAttr: true,
			}),
		).toBeTruthy();
		expect(
			sel.match(<any>{
				cssType: 'button',
			}),
		).toBeFalsy();
	});

	function create(css: string, source = 'css-selectors.ts@test'): { rules: RuleSet[]; map: StyleSheetSelectorScope<any> } {
		const parsed = parse(css, { source });
		const rulesAst = parsed.stylesheet.rules.filter((n) => n.type === 'rule');
		const rules = rulesAst.map((rule) => fromAstNode(rule, null));
		const map = new StyleSheetSelectorScope(rules);

		return { rules, map };
	}

	function createOne(css: string, source = 'css-selectors.ts@test'): RuleSet {
		const { rules } = create(css, source);
		expect(rules.length).toBe(1);

		return rules[0];
	}

	it('single selector', () => {
		const rule = createOne(`* { color: red; }`);
		expect(rule.selectors[0].match({ cssType: 'button' })).toBeTruthy();
		expect(rule.selectors[0].match({ cssType: 'image' })).toBeTruthy();
	});

	it('two selectors', () => {
		const rule = createOne(`button, image { color: red; }`);
		expect(rule.selectors[0].match({ cssType: 'button' })).toBeTruthy();
		expect(rule.selectors[1].match({ cssType: 'image' })).toBeTruthy();
		expect(rule.selectors[0].match({ cssType: 'stacklayout' })).toBeFalsy();
		expect(rule.selectors[1].match({ cssType: 'stacklayout' })).toBeFalsy();
	});

	it('narrow selection', () => {
		const { map } = create(`
	        .login { color: blue; }
	        button { color: red; }
	        image { color: green; }
	    `);

		const buttonQuerry = map.query({ cssType: 'button' }).selectors;
		expect(buttonQuerry.length).toBe(1);
		expect(buttonQuerry[0].ruleset.declarations).toEqual([{ property: 'color', value: 'red' }]);

		const imageQuerry = map.query({ cssType: 'image', cssClasses: new Set(['login']) }).selectors;
		expect(imageQuerry.length).toBe(2);
		// Note class before type
		expect(imageQuerry[0].ruleset.declarations).toEqual([{ property: 'color', value: 'blue' }]);
		expect(imageQuerry[1].ruleset.declarations).toEqual([{ property: 'color', value: 'green' }]);
	});

	const positiveMatches = {
		'*': (view) => true,
		type: (view) => view.cssType === 'type',
		'#id': (view) => view.id === 'id',
		'.class': (view) => view.cssClasses.has('class'),
		':pseudo': (view) => view.cssPseudoClasses.has('pseudo'),
		'[src1]': (view) => 'src1' in view,
		"[src2='src-value']": (view) => view['src2'] === 'src-value',
	};

	const positivelyMatchingView = {
		cssType: 'type',
		id: 'id',
		cssClasses: new Set(['class']),
		cssPseudoClasses: new Set(['pseudo']),
		src1: 'src',
		src2: 'src-value',
	};

	const negativelyMatchingView = {
		cssType: 'nottype',
		id: 'notid',
		cssClasses: new Set(['notclass']),
		cssPseudoClasses: new Set(['notpseudo']),
		// Has no "src1"
		src2: 'not-src-value',
	};

	it('simple selectors match', () => {
		for (const sel in positiveMatches) {
			const css = sel + ' { color: red; }';
			const rule = createOne(css);
			expect(rule.selectors[0].match(positivelyMatchingView)).toBe(true);
			if (sel !== '*') {
				expect(rule.selectors[0].match(negativelyMatchingView)).toBe(false);
			}
		}
	});

	it('two selector sequence positive match', () => {
		for (const firstStr in positiveMatches) {
			for (const secondStr in positiveMatches) {
				if (secondStr !== firstStr && secondStr !== '*' && secondStr !== 'type') {
					const css = firstStr + secondStr + ' { color: red; }';
					const rule = createOne(css);
					expect(rule.selectors[0].match(positivelyMatchingView)).toBe(true);
					if (firstStr !== '*') {
						expect(rule.selectors[0].match(negativelyMatchingView)).toBe(false);
					}
				}
			}
		}
	});

	it('direct child combinator', () => {
		const rule = createOne(`listview > item:selected { color: red; }`);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'stacklayout',
					parent: {
						cssType: 'listview',
					},
				},
			}),
		).toBe(false);
	});

	it('descendant combinator', () => {
		const rule = createOne(`listview item:selected { color: red; }`);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'stacklayout',
					parent: {
						cssType: 'listview',
					},
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'stacklayout',
					parent: {
						cssType: 'page',
					},
				},
			}),
		).toBe(false);
	});

	it('backtracking css selector', () => {
		const sel = createOne(`a>b c { color: red; }`).selectors[0];
		const child = {
			cssType: 'c',
			parent: {
				cssType: 'b',
				parent: {
					cssType: 'fail',
					parent: {
						cssType: 'b',
						parent: {
							cssType: 'a',
						},
					},
				},
			},
		};

		expect(sel.match(child)).toBe(true);
	});

	it(':not() pseudo-class', () => {
		const rule = createOne(`listview :not(item:selected) { color: red; }`);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(false);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'label',
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
	});

	it(':is() pseudo-class', () => {
		const rule = createOne(`listview :is(item:selected) { color: red; }`);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(false);
	});

	it(':where() pseudo-class', () => {
		const rule = createOne(`listview :is(item:selected) { color: red; }`);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				cssPseudoClasses: new Set(['selected']),
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(true);
		expect(
			rule.selectors[0].match({
				cssType: 'item',
				parent: {
					cssType: 'listview',
				},
			}),
		).toBe(false);
		// TODO: Re-add this when decorators actually work with ts-jest
		//expect(rule.selectors[0].specificity).toEqual(0);
	});

	function toString() {
		return this.cssType;
	}

	// it('simple query match', () => {
	// 	const { map } = create(`list grid[promotion] button:highlighted { color: red; }`);

	// 	let list, grid, button;

	// 	button = {
	// 		cssType: 'button',
	// 		cssPseudoClasses: new Set<string>(['highlighted']),
	// 		toString,
	// 		parent: (grid = {
	// 			cssType: 'grid',
	// 			promotion: true,
	// 			toString,
	// 			parent: (list = {
	// 				cssType: 'list',
	// 				toString,
	// 			}),
	// 		}),
	// 	};

	// 	const match = map.query(button);
	// 	expect(match.selectors.length).toBe(1);

	// 	const expected = new Map<Node, Changes>().set(grid, { attributes: new Set(['promotion']) }).set(button, { pseudoClasses: new Set(['highlighted']) });

	// 	expect(match.changeMap).toEqual(expected);
	// });

	// it('query match one child group', () => {
	// 	const { map } = create(`#prod[special] > gridlayout { color: red; }`);
	// 	let gridlayout, prod;

	// 	gridlayout = {
	// 		cssType: 'gridlayout',
	// 		toString,
	// 		parent: (prod = {
	// 			id: 'prod',
	// 			cssType: 'listview',
	// 			toString,
	// 		}),
	// 	};

	// 	const match = map.query(gridlayout);
	// 	expect(match.selectors.length).toBe(1);

	// 	const expected = new Map<Node, Changes>().set(prod, { attributes: new Set(['special']) });
	// 	expect(match.changeMap).toEqual(expected);
	// });

	// it('query match one sibling group (deepEqual does not compare Map?)', () => {
	// 	const { map } = create(`list button:highlighted+button:disabled { color: red; }`);
	// 	let list, button, disabledButton;

	// 	list = {
	// 		cssType: 'list',
	// 		toString,
	// 		getChildIndex: () => 1,
	// 		getChildAt: () => button,
	// 	};

	// 	button = {
	// 		cssType: 'button',
	// 		cssPseudoClasses: new Set<string>(['highlighted']),
	// 		toString,
	// 		parent: list,
	// 	};

	// 	disabledButton = {
	// 		cssType: 'button',
	// 		cssPseudoClasses: new Set<string>(['disabled']),
	// 		toString,
	// 		parent: list,
	// 	};

	// 	const match = map.query(disabledButton);
	// 	expect(match.selectors.length).toBe(1);

	// 	const expected = new Map<Node, Changes>().set(disabledButton, { pseudoClasses: new Set(['disabled']) }).set(button, { pseudoClasses: new Set(['highlighted']) });

	// 	expect(match.changeMap).toEqual(expected);
	// });
});
