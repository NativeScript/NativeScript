import { parse } from '../../../css/reworkcss';
import * as selector from '.';

describe('css-selector', () => {
	it('button[attr]', () => {
		const sel = selector.createSelector('button[testAttr]');
		expect(
			sel.match(<any>{
				cssType: 'button',
				testAttr: true,
			})
		).toBeTruthy();
		expect(
			sel.match(<any>{
				cssType: 'button',
			})
		).toBeFalsy();
	});

	function create(css: string, source = 'css-selectors.ts@test'): { rules: selector.RuleSet[]; map: selector.SelectorsMap<any> } {
		const parsed = parse(css, { source });
		const rulesAst = parsed.stylesheet.rules.filter((n) => n.type === 'rule');
		const rules = selector.fromAstNodes(rulesAst);
		const map = new selector.SelectorsMap(rules);

		return { rules, map };
	}

	function createOne(css: string, source = 'css-selectors.ts@test'): selector.RuleSet {
		const { rules } = create(css, source);
		expect(rules.length).toBe(1);

		return rules[0];
	}

	it('single selector', () => {
		const rule = createOne(`* { color: red; }`);
		expect(rule.selectors[0].match({ cssType: 'button' })).toBeTruthy();
		expect(rule.selectors[0].match({ cssType: 'image' })).toBeTruthy();
	});

	// it('two selectors', () => {
	// 	const rule = createOne(`button, image { color: red; }`);
	// 	assert.isTrue(rule.selectors[0].match({ cssType: 'button' }));
	// 	assert.isTrue(rule.selectors[1].match({ cssType: 'image' }));
	// 	assert.isFalse(rule.selectors[0].match({ cssType: 'stacklayout' }));
	// 	assert.isFalse(rule.selectors[1].match({ cssType: 'stacklayout' }));
	// });

	// it('narrow selection', () => {
	// 	const { map } = create(`
	//         .login { color: blue; }
	//         button { color: red; }
	//         image { color: green; }
	//     `);

	// 	const buttonQuerry = map.query({ cssType: 'button' }).selectors;
	// 	assert.equal(buttonQuerry.length, 1);
	// 	assert.includeDeepMembers(buttonQuerry[0].ruleset.declarations, [{ property: 'color', value: 'red' }]);

	// 	const imageQuerry = map.query({ cssType: 'image', cssClasses: new Set(['login']) }).selectors;
	// 	assert.equal(imageQuerry.length, 2);
	// 	// Note class before type
	// 	assert.includeDeepMembers(imageQuerry[0].ruleset.declarations, [{ property: 'color', value: 'green' }]);
	// 	assert.includeDeepMembers(imageQuerry[1].ruleset.declarations, [{ property: 'color', value: 'blue' }]);
	// });

	// const positiveMatches = {
	// 	'*': (view) => true,
	// 	type: (view) => view.cssType === 'type',
	// 	'#id': (view) => view.id === 'id',
	// 	'.class': (view) => view.cssClasses.has('class'),
	// 	':pseudo': (view) => view.cssPseudoClasses.has('pseudo'),
	// 	'[src1]': (view) => 'src1' in view,
	// 	"[src2='src-value']": (view) => view['src2'] === 'src-value',
	// };

	// const positivelyMatchingView = {
	// 	cssType: 'type',
	// 	id: 'id',
	// 	cssClasses: new Set(['class']),
	// 	cssPseudoClasses: new Set(['pseudo']),
	// 	src1: 'src',
	// 	src2: 'src-value',
	// };

	// const negativelyMatchingView = {
	// 	cssType: 'nottype',
	// 	id: 'notid',
	// 	cssClasses: new Set(['notclass']),
	// 	cssPseudoClasses: new Set(['notpseudo']),
	// 	// Has no "src1"
	// 	src2: 'not-src-value',
	// };

	// it('simple selectors match', () => {
	// 	for (const sel in positiveMatches) {
	// 		const css = sel + ' { color: red; }';
	// 		const rule = createOne(css);
	// 		assert.isTrue(rule.selectors[0].match(positivelyMatchingView), 'Expected successful match for: ' + css);
	// 		if (sel !== '*') {
	// 			assert.isFalse(rule.selectors[0].match(negativelyMatchingView), 'Expected match failure for: ' + css);
	// 		}
	// 	}
	// });

	// it('two selector sequence positive match', () => {
	// 	for (const firstStr in positiveMatches) {
	// 		for (const secondStr in positiveMatches) {
	// 			if (secondStr !== firstStr && secondStr !== '*' && secondStr !== 'type') {
	// 				const css = firstStr + secondStr + ' { color: red; }';
	// 				const rule = createOne(css);
	// 				assert.isTrue(rule.selectors[0].match(positivelyMatchingView), 'Expected successful match for: ' + css);
	// 				if (firstStr !== '*') {
	// 					assert.isFalse(rule.selectors[0].match(negativelyMatchingView), 'Expected match failure for: ' + css);
	// 				}
	// 			}
	// 		}
	// 	}
	// });

	// it('direct parent combinator', () => {
	// 	const rule = createOne(`listview > item:selected { color: red; }`);
	// 	assert.isTrue(
	// 		rule.selectors[0].match({
	// 			cssType: 'item',
	// 			cssPseudoClasses: new Set(['selected']),
	// 			parent: {
	// 				cssType: 'listview',
	// 			},
	// 		}),
	// 		'Item in list view expected to match'
	// 	);
	// 	assert.isFalse(
	// 		rule.selectors[0].match({
	// 			cssType: 'item',
	// 			cssPseudoClasses: new Set(['selected']),
	// 			parent: {
	// 				cssType: 'stacklayout',
	// 				parent: {
	// 					cssType: 'listview',
	// 				},
	// 			},
	// 		}),
	// 		'Item in stack in list view NOT expected to match.'
	// 	);
	// });

	// it('ancestor combinator', () => {
	// 	const rule = createOne(`listview item:selected { color: red; }`);
	// 	assert.isTrue(
	// 		rule.selectors[0].match({
	// 			cssType: 'item',
	// 			cssPseudoClasses: new Set(['selected']),
	// 			parent: {
	// 				cssType: 'listview',
	// 			},
	// 		}),
	// 		'Item in list view expected to match'
	// 	);
	// 	assert.isTrue(
	// 		rule.selectors[0].match({
	// 			cssType: 'item',
	// 			cssPseudoClasses: new Set(['selected']),
	// 			parent: {
	// 				cssType: 'stacklayout',
	// 				parent: {
	// 					cssType: 'listview',
	// 				},
	// 			},
	// 		}),
	// 		'Item in stack in list view expected to match.'
	// 	);
	// 	assert.isFalse(
	// 		rule.selectors[0].match({
	// 			cssType: 'item',
	// 			cssPseudoClasses: new Set(['selected']),
	// 			parent: {
	// 				cssType: 'stacklayout',
	// 				parent: {
	// 					cssType: 'page',
	// 				},
	// 			},
	// 		}),
	// 		'Item in stack in page NOT expected to match.'
	// 	);
	// });

	// it('backtracking css selector', () => {
	// 	const sel = createOne(`a>b c { color: red; }`).selectors[0];
	// 	const child = {
	// 		cssType: 'c',
	// 		parent: {
	// 			cssType: 'b',
	// 			parent: {
	// 				cssType: 'fail',
	// 				parent: {
	// 					cssType: 'b',
	// 					parent: {
	// 						cssType: 'a',
	// 					},
	// 				},
	// 			},
	// 		},
	// 	};

	// 	assert.isTrue(sel.match(child));
	// });

	// function toString() {
	// 	return this.cssType;
	// }

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
	// 	assert.equal(match.selectors.length, 1, 'Expected match to have one selector.');

	// 	const expected = new Map<selector.Node, selector.Changes>().set(grid, { attributes: new Set(['promotion']) }).set(button, { pseudoClasses: new Set(['highlighted']) });

	// 	assert.deepEqual(match.changeMap, expected);
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
	// 	assert.equal(match.selectors.length, 1, 'Expected match to have one selector.');

	// 	const expected = new Map<selector.Node, selector.Changes>().set(prod, { attributes: new Set(['special']) });
	// 	assert.deepEqual(match.changeMap, expected);
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
	// 	assert.equal(match.selectors.length, 1, 'Expected match to have one selector.');

	// 	const expected = new Map<selector.Node, selector.Changes>().set(disabledButton, { pseudoClasses: new Set(['disabled']) }).set(button, { pseudoClasses: new Set(['highlighted']) });

	// 	assert.deepEqual(match.changeMap, expected);
	// });
});
