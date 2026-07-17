import { bench, describe } from 'vitest';
import { parse } from '../../css/reworkcss.js';
import { AttributeSelector, createSelector, RuleSet, StyleSheetSelectorScope } from '../../ui/styling/css-selector';
import { _populateRules } from '../../ui/styling/style-scope';

function createScope(css: string): StyleSheetSelectorScope<any> {
	const parsed = parse(css, { source: 'css-selector.bench.ts' });
	const rulesets: RuleSet[] = [];
	_populateRules(parsed.stylesheet.rules, rulesets, []);

	return new StyleSheetSelectorScope(rulesets);
}

// Build a stylesheet shaped like a typical themed app (theme-core ships
// thousands of selectors): universal rules, sizable per-type buckets, many
// class-variant buckets, ids and a couple of media queries.
function buildStylesheet(): string {
	const parts: string[] = ['* { font-family: sans-serif; }', '* { font-size: 14; }', 'view { color: black; }'];

	const types = ['button', 'label', 'stacklayout', 'gridlayout', 'image', 'textfield', 'listview', 'scrollview'];
	for (const type of types) {
		for (let i = 0; i < 12; i++) {
			parts.push(`${type}.variant-${i} { color: red; margin: ${i}; }`);
		}
		parts.push(`${type} { color: red; }`);
		parts.push(`${type}.accent { color: blue; }`);
	}

	for (let i = 0; i < 60; i++) {
		for (let j = 0; j < 6; j++) {
			parts.push(`.cls-${i}.mod-${j} { margin: ${i + j}; }`);
		}
		parts.push(`.cls-${i} { margin: ${i}; }`);
		parts.push(`.cls-${i} .child-${i} { padding: ${i}; }`);
	}

	for (let i = 0; i < 10; i++) {
		parts.push(`#id-${i} { color: green; }`);
	}

	parts.push('@media only screen and (min-width: 400) { button { color: purple; } .cls-1 { color: orange; } }');
	parts.push('@media only screen and (min-width: 400) and (max-width: 5000) { label { color: yellow; } }');

	return parts.join('\n');
}

const scope = createScope(buildStylesheet());

const buttonNode = {
	cssType: 'button',
	id: 'id-5',
	cssClasses: new Set(['accent', 'cls-1', 'cls-2', 'cls-30']),
	cssPseudoClasses: new Set<string>(),
};

const plainLabelNode = {
	cssType: 'label',
	cssClasses: new Set<string>(),
	cssPseudoClasses: new Set<string>(),
};

// Simulates list recycling: rows cycle through a small set of distinct
// (type, classes) signatures, so candidate lookups repeat constantly.
const recycledRows = Array.from({ length: 20 }, (_, i) => ({
	cssType: i % 2 === 0 ? 'label' : 'stacklayout',
	cssClasses: new Set(['accent', `cls-${i % 5}`, `variant-${i % 3}`, `variant-${7 + (i % 2)}`]),
	cssPseudoClasses: new Set<string>(),
}));

describe('StyleSheetSelectorScope.query', () => {
	bench('query - button with id and 4 classes', () => {
		scope.query(buttonNode);
	});

	bench('query - plain label', () => {
		scope.query(plainLabelNode);
	});

	bench('query - 20 recycled list rows', () => {
		for (let i = 0; i < recycledRows.length; i++) {
			scope.query(recycledRows[i]);
		}
	});
});

describe('selector match', () => {
	const sequenceSelector = createSelector('button.accent.cls-1');
	const sequenceNode = { cssType: 'button', cssClasses: new Set(['accent', 'cls-1']) };

	bench('SimpleSelectorSequence.match', () => {
		sequenceSelector.match(sequenceNode);
	});

	const complexSelector = createSelector('stacklayout > label.title');
	const parentNode = { cssType: 'stacklayout', cssClasses: new Set<string>() };
	const childNode = { cssType: 'label', cssClasses: new Set(['title']), parent: parentNode };

	bench('ComplexSelector.match (child combinator)', () => {
		complexSelector.match(childNode);
	});

	const attributeSelector = new AttributeSelector('testAttr', 'equals', 'SOME-value', true);
	const attributeNode = { cssType: 'button', testAttr: 'some-VALUE' };

	bench('AttributeSelector.match (ignoreCase)', () => {
		attributeSelector.match(attributeNode);
	});
});
