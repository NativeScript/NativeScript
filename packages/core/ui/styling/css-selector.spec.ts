import { parse } from '../../css/reworkcss.js';
import { Screen } from '../../platform';
import { createSelector, RuleSet, StyleSheetSelectorScope, SelectorTier, fromAstNode, Node, Changes, matchSelectorCandidates } from './css-selector';
import { _populateRules } from './style-scope';

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

	function create(css: string, source = 'css-selectors.ts@test'): { rulesets: RuleSet[]; selectorScope: StyleSheetSelectorScope<any> } {
		const parsed = parse(css, { source });
		const rulesAst = parsed.stylesheet.rules;
		const rulesets = [];

		_populateRules(rulesAst, rulesets, []);

		const selectorScope = new StyleSheetSelectorScope(rulesets);

		return { rulesets, selectorScope };
	}

	function createOne(css: string, source = 'css-selectors.ts@test'): RuleSet {
		const { rulesets } = create(css, source);
		expect(rulesets.length).toBe(1);

		return rulesets[0];
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
		const { selectorScope } = create(`
	        .login { color: blue; }
	        button { color: red; }
	        image { color: green; }
	    `);

		const buttonQuery = selectorScope.query({ cssType: 'button' }).selectors;
		expect(buttonQuery.length).toBe(1);
		expect(buttonQuery[0].ruleset.declarations).toEqual([{ property: 'color', value: 'red' }]);

		const imageQuery = selectorScope.query({ cssType: 'image', cssClasses: new Set(['login']) }).selectors;
		expect(imageQuery.length).toBe(2);
		expect(imageQuery[0].ruleset.declarations).toEqual([{ property: 'color', value: 'green' }]);
		expect(imageQuery[1].ruleset.declarations).toEqual([{ property: 'color', value: 'blue' }]);
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
		// TODO: Re-add this when decorators actually work properly on ts-jest
		//expect(rule.selectors[0].specificity).toEqual(0);
	});

	describe('sibling combinator flags', () => {
		it('adjacent combinator sets hasAdjacentCombinator', () => {
			const sel = createSelector('.spaced > * + *');
			expect(sel.hasAdjacentCombinator).toBe(true);
			expect(sel.hasSiblingCombinator).toBe(false);
		});

		it('general sibling combinator sets hasSiblingCombinator', () => {
			const sel = createSelector('.spaced > * ~ *');
			expect(sel.hasSiblingCombinator).toBe(true);
			expect(sel.hasAdjacentCombinator).toBe(false);
		});

		it('selector without sibling combinators sets neither flag', () => {
			const sel = createSelector('.spaced > .child');
			expect(sel.hasAdjacentCombinator).toBe(false);
			expect(sel.hasSiblingCombinator).toBe(false);
		});

		it(':is() selector list propagates combinator flags', () => {
			const sel = createSelector(':is(.a + .b)');
			expect(sel.hasAdjacentCombinator).toBe(true);
			expect(sel.hasSiblingCombinator).toBe(false);
		});

		it('compound selector propagates combinator flags of functional pseudo-class', () => {
			const sel = createSelector('.list :is(.a ~ .b).c');
			expect(sel.hasSiblingCombinator).toBe(true);
		});

		it('scope accumulates combinator flags from rulesets', () => {
			const { selectorScope } = create(`
				.a { color: red; }
				.spaced > * + * { margin-top: 8; }
			`);
			expect(selectorScope.hasAdjacentCombinatorSelectors).toBe(true);
			expect(selectorScope.hasSiblingCombinatorSelectors).toBe(false);
		});

		it('scope without sibling combinators keeps flags false', () => {
			const { selectorScope } = create(`.a { color: red; }`);
			expect(selectorScope.hasAdjacentCombinatorSelectors).toBe(false);
			expect(selectorScope.hasSiblingCombinatorSelectors).toBe(false);
		});

		it('scope rolls up combinator flags from media query rules', () => {
			const { selectorScope } = create(`
				@media only screen and (max-width: 10000) {
					.spaced > * ~ * { margin-top: 8; }
				}
			`);
			expect(selectorScope.hasSiblingCombinatorSelectors).toBe(true);
			expect(selectorScope.hasAdjacentCombinatorSelectors).toBe(false);
		});
	});

	it('attribute selector with case-insensitive flag matches repeatedly', () => {
		const rule = createOne(`button[testAttr='VaLuE' i] { color: red; }`);
		const matching = { cssType: 'button', testAttr: 'vAlUe' };
		const nonMatching = { cssType: 'button', testAttr: 'other' };

		// Run multiple times to ensure matching does not depend on per-match state
		for (let i = 0; i < 3; i++) {
			expect(rule.selectors[0].match(matching)).toBe(true);
			expect(rule.selectors[0].match(nonMatching)).toBe(false);
		}
	});

	describe('attribute selectors', () => {
		class Widget {
			public cssType = 'widget';
			public cssClasses = new Set<string>();
			private _text: string;
			get text(): string {
				return this._text;
			}
			set text(value: string) {
				this._text = value;
			}
		}

		it('does not match a node that does not know the attribute', () => {
			const rule = createOne(`.title[_ngcontent-c7] { color: red; }`);
			const node = { cssType: 'label', cssClasses: new Set(['title']), '_ngcontent-c3': '' };

			expect(rule.selectors[0].accumulateChanges(<any>node, undefined)).toBe(false);
		});

		it('matches a node carrying the attribute', () => {
			const rule = createOne(`.title[_ngcontent-c3] { color: red; }`);
			const node = { cssType: 'label', cssClasses: new Set(['title']), '_ngcontent-c3': '' };

			expect(rule.selectors[0].accumulateChanges(<any>node, undefined)).toBe(true);
		});

		it('does not subscribe for attributes that cannot raise change events', () => {
			const rule = createOne(`[_ngcontent-c3] { color: red; }`);
			const node = { cssType: 'label', '_ngcontent-c3': '' };
			const changes: Array<string> = [];

			rule.selectors[0].accumulateChanges(
				<any>node,
				<any>{
					addAttribute: (_n, attribute: string) => changes.push(attribute),
					addPseudoClass: () => {},
				},
			);

			expect(changes).toEqual([]);
		});

		it('subscribes for attributes backed by a property', () => {
			const rule = createOne(`widget[text] { color: red; }`);
			const node = new Widget();
			node.text = 'hello';
			const changes: Array<string> = [];

			rule.selectors[0].accumulateChanges(
				<any>node,
				<any>{
					addAttribute: (_n, attribute: string) => changes.push(attribute),
					addPseudoClass: () => {},
				},
			);

			expect(changes).toEqual(['text']);
		});

		it('matches a property backed attribute even when it is unset', () => {
			const rule = createOne(`widget[text] { color: red; }`);

			// The value can still be assigned later, and assigning it raises `textChange`.
			const accumulator = <any>{ addAttribute: () => {}, addPseudoClass: () => {} };
			expect(rule.selectors[0].accumulateChanges(<any>new Widget(), accumulator)).toBe(true);
		});
	});

	it('strips the unsupported !important flag while parsing', () => {
		const rule = createOne(`button { color: red !important; }`);
		expect(rule.declarations).toEqual([{ property: 'color', value: 'red' }]);
	});

	describe('candidate resolution across scopes', () => {
		it('breaks a specificity tie on the scope tier before the position', () => {
			const application = create(`label { color: red; }`).selectorScope;
			const local = new StyleSheetSelectorScope(create(`label { color: blue; }`).rulesets, SelectorTier.Local);

			const node = { cssType: 'label', cssClasses: new Set<string>() };
			const candidates = local.collectCandidates(<any>node, application.collectCandidates(<any>node));
			const { selectors } = matchSelectorCandidates(<any>node, candidates);

			// Local styles are a later "stylesheet", so they win the tie regardless of
			// the position each selector got inside its own scope.
			expect(selectors.length).toBe(2);
			expect(selectors[1].ruleset.declarations[0].value).toBe('blue');
		});

		it('drops rules scoped to a stylesheet the caller did not load', () => {
			const { rulesets, selectorScope } = create(`label { color: red; } label { color: blue; }`);
			rulesets[1].scopedTag = 'other.css';

			const node = { cssType: 'label', cssClasses: new Set<string>() };
			const { selectors } = matchSelectorCandidates(<any>node, selectorScope.collectCandidates(<any>node), new Set(['mine.css']));

			expect(selectors.length).toBe(1);
			expect(selectors[0].ruleset.declarations[0].value).toBe('red');
		});

		it('keeps rules scoped to a stylesheet the caller did load', () => {
			const { rulesets, selectorScope } = create(`label { color: red; } label { color: blue; }`);
			rulesets[1].scopedTag = 'mine.css';

			const node = { cssType: 'label', cssClasses: new Set<string>() };
			const { selectors } = matchSelectorCandidates(<any>node, selectorScope.collectCandidates(<any>node), new Set(['mine.css']));

			expect(selectors.length).toBe(2);
		});
	});

	it('query returns selectors sorted by specificity then position', () => {
		const { selectorScope } = create(`
	        button { color: red; }
	        .login { color: blue; }
	        button.login { color: green; }
	        #main { color: yellow; }
	    `);

		const { selectors } = selectorScope.query({ cssType: 'button', id: 'main', cssClasses: new Set(['login']) });
		expect(selectors.length).toBe(4);
		expect(selectors.map((sel) => sel.toString().trim())).toEqual(['button', '.login', 'button.login', '#main']);
	});

	describe('media queries', () => {
		const { widthDIPs } = Screen.mainScreen;

		it('should apply css rules of matching media query', () => {
			const { selectorScope } = create(`
				@media only screen and (max-width: ${widthDIPs}) {
	        .login { color: blue; }
	        button { color: red; }
	        image { color: green; }
				}
	    `);

			const { selectors: buttonSelectors } = selectorScope.query({ cssType: 'button' });
			expect(buttonSelectors.length).toBe(1);
			expect(buttonSelectors[0].ruleset.declarations).toEqual([{ property: 'color', value: 'red' }]);

			const { selectors: imageSelectors } = selectorScope.query({ cssType: 'image', cssClasses: new Set(['login']) });
			expect(imageSelectors.length).toBe(2);
			expect(imageSelectors[0].ruleset.declarations).toEqual([{ property: 'color', value: 'green' }]);
			expect(imageSelectors[1].ruleset.declarations).toEqual([{ property: 'color', value: 'blue' }]);
		});

		it('should not apply css rules of non-matching media query', () => {
			const { selectorScope } = create(`
				@media only screen and (max-width: ${widthDIPs - 1}) {
	        .login { color: blue; }
	        button { color: red; }
	        image { color: green; }
				}
	    `);

			const { selectors: buttonSelectors } = selectorScope.query({ cssType: 'button' });
			expect(buttonSelectors.length).toBe(0);

			const { selectors: imageSelectors } = selectorScope.query({ cssType: 'image', cssClasses: new Set(['login']) });
			expect(imageSelectors.length).toBe(0);
		});

		it('should apply css rules of matching media and nested media queries', () => {
			const { selectorScope } = create(`
				@media only screen and (max-width: ${widthDIPs}) {
	        .login { color: blue; }
	        button { color: red; }
					@media only screen and (orientation: portrait) {
	        	image { color: green; }
					}
				}
	    `);

			const { selectors: buttonSelectors } = selectorScope.query({ cssType: 'button' });
			expect(buttonSelectors.length).toBe(1);
			expect(buttonSelectors[0].ruleset.declarations).toEqual([{ property: 'color', value: 'red' }]);

			const { selectors: imageSelectors } = selectorScope.query({ cssType: 'image', cssClasses: new Set(['login']) });
			expect(imageSelectors.length).toBe(2);
			expect(imageSelectors[0].ruleset.declarations).toEqual([{ property: 'color', value: 'green' }]);
			expect(imageSelectors[1].ruleset.declarations).toEqual([{ property: 'color', value: 'blue' }]);
		});

		it('should apply css rules of matching media queries but not non-matching nested media queries', () => {
			const { selectorScope } = create(`
				@media only screen and (max-width: ${widthDIPs}) {
	        .login { color: blue; }

					@media only screen and (orientation: none) {
						button { color: red; }
	        	image { color: green; }
					}
				}
	    `);

			const { selectors: buttonSelectors } = selectorScope.query({ cssType: 'button' });
			expect(buttonSelectors.length).toBe(0);

			const { selectors: imageSelectors } = selectorScope.query({ cssType: 'image', cssClasses: new Set(['login']) });
			expect(imageSelectors.length).toBe(1);

			expect(imageSelectors[0].ruleset.declarations).toEqual([{ property: 'color', value: 'blue' }]);
		});
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
