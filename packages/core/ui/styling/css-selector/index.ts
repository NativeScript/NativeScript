import '../../../globals';
import { isNullOrUndefined } from '../../../utils/types';

import * as cssParser from '../../../css';
import * as parser from '../../../css/parser';

/**
 * An interface describing the shape of a type on which the selectors may apply.
 * Note, the ui/core/view.View implements Node.
 */
export interface Node {
	parent?: Node;

	id?: string;
	nodeName?: string;
	cssType?: string;
	cssClasses?: Set<string>;
	cssPseudoClasses?: Set<string>;
	getChildIndex?(node: Node): number;
	getChildAt?(index: number): Node;
}

export interface Declaration {
	property: string;
	value: string;
}

export type ChangeMap<T extends Node> = Map<T, Changes>;

export interface Changes {
	attributes?: Set<string>;
	pseudoClasses?: Set<string>;
}

const enum Specificity {
	Inline = 1000,
	Id = 100,
	Attribute = 10,
	Class = 10,
	PseudoClass = 10,
	Type = 1,
	Universal = 0,
	Invalid = 0,
}

const enum Rarity {
	Invalid = 4,
	Id = 3,
	Class = 2,
	Type = 1,
	PseudoClass = 0,
	Attribute = 0,
	Universal = 0,
	Inline = 0,
}

interface LookupSorter {
	sortById(id: string, sel: SelectorCore);
	sortByClass(cssClass: string, sel: SelectorCore);
	sortByType(cssType: string, sel: SelectorCore);
	sortAsUniversal(sel: SelectorCore);
}

namespace Match {
	/**
	 * Depends on attributes or pseudoclasses state;
	 */
	export const Dynamic = true;
	/**
	 * Depends only on the tree structure.
	 */
	export const Static = false;
}

function getNodeDirectSibling(node): null | Node {
	if (!node.parent || !node.parent.getChildIndex || !node.parent.getChildAt) {
		return null;
	}
	const nodeIndex = node.parent.getChildIndex(node);
	if (nodeIndex === 0) {
		return null;
	}

	return node.parent.getChildAt(nodeIndex - 1);
}

function SelectorProperties(specificity: Specificity, rarity: Rarity, dynamic: boolean = false): ClassDecorator {
	return (cls) => {
		cls.prototype.specificity = specificity;
		cls.prototype.rarity = rarity;
		cls.prototype.combinator = undefined;
		cls.prototype.dynamic = dynamic;

		return cls;
	};
}

declare type Combinator = '+' | '>' | '~' | ' ';
@SelectorProperties(Specificity.Universal, Rarity.Universal, Match.Static)
export abstract class SelectorCore {
	public pos: number;
	public specificity: number;
	public rarity: Rarity;
	public combinator: Combinator;
	public ruleset: RuleSet;
	/**
	 * Dynamic selectors depend on attributes and pseudo classes.
	 */
	public dynamic: boolean;
	public abstract match(node: Node): boolean;
	/**
	 * If the selector is static returns if it matches the node.
	 * If the selector is dynamic returns if it may match the node, and accumulates any changes that may affect its state.
	 */
	public abstract accumulateChanges(node: Node, map: ChangeAccumulator): boolean;
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		sorter.sortAsUniversal(base || this);
	}
}

export abstract class SimpleSelector extends SelectorCore {
	public accumulateChanges(node: Node, map?: ChangeAccumulator): boolean {
		if (!this.dynamic) {
			return this.match(node);
		} else if (this.mayMatch(node)) {
			this.trackChanges(node, map);

			return true;
		}

		return false;
	}
	public mayMatch(node: Node): boolean {
		return this.match(node);
	}
	public trackChanges(node: Node, map: ChangeAccumulator): void {
		// No-op, silence the tslint 'block is empty'.
		// Some derived classes (dynamic) will actually fill the map with stuff here, some (static) won't do anything.
	}
}

function wrap(text: string): string {
	return text ? ` ${text} ` : '';
}

@SelectorProperties(Specificity.Invalid, Rarity.Invalid, Match.Static)
export class InvalidSelector extends SimpleSelector {
	constructor(public e: Error) {
		super();
	}
	public toString(): string {
		return `<error: ${this.e}>`;
	}
	public match(node: Node): boolean {
		return false;
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		// No-op, silence the tslint 'block is empty'.
		// It feels like tslint has problems with simple polymorphism...
		// This selector is invalid and will never match so we won't bother sorting it to further appear in queries.
	}
}

@SelectorProperties(Specificity.Universal, Rarity.Universal, Match.Static)
export class UniversalSelector extends SimpleSelector {
	public toString(): string {
		return `*${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return true;
	}
}

@SelectorProperties(Specificity.Id, Rarity.Id, Match.Static)
export class IdSelector extends SimpleSelector {
	constructor(public id: string) {
		super();
	}
	public toString(): string {
		return `#${this.id}${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return node.id === this.id;
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		sorter.sortById(this.id, base || this);
	}
}

@SelectorProperties(Specificity.Type, Rarity.Type, Match.Static)
export class TypeSelector extends SimpleSelector {
	constructor(public cssType: string) {
		super();
	}
	public toString(): string {
		return `${this.cssType}${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return node.cssType === this.cssType;
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		sorter.sortByType(this.cssType, base || this);
	}
}

@SelectorProperties(Specificity.Class, Rarity.Class, Match.Static)
export class ClassSelector extends SimpleSelector {
	constructor(public cssClass: string) {
		super();
	}
	public toString(): string {
		return `.${this.cssClass}${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return node.cssClasses && node.cssClasses.has(this.cssClass);
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		sorter.sortByClass(this.cssClass, base || this);
	}
}

declare type AttributeTest = '=' | '^=' | '$=' | '*=' | '=' | '~=' | '|=';
@SelectorProperties(Specificity.Attribute, Rarity.Attribute, Match.Dynamic)
export class AttributeSelector extends SimpleSelector {
	constructor(public attribute: string, public test?: AttributeTest, public value?: string) {
		super();

		if (!test) {
			// HasAttribute
			this.match = (node) => !isNullOrUndefined(node[attribute]);

			return;
		}

		if (!value) {
			this.match = (node) => false;
		}

		this.match = (node) => {
			const attr = node[attribute] + '';

			if (test === '=') {
				// Equals
				return attr === value;
			}

			if (test === '^=') {
				// PrefixMatch
				return attr.startsWith(value);
			}

			if (test === '$=') {
				// SuffixMatch
				return attr.endsWith(value);
			}

			if (test === '*=') {
				// SubstringMatch
				return attr.indexOf(value) !== -1;
			}

			if (test === '~=') {
				// Includes
				const words = attr.split(' ');

				return words && words.indexOf(value) !== -1;
			}

			if (test === '|=') {
				// DashMatch
				return attr === value || attr.startsWith(value + '-');
			}
		};
	}
	public toString(): string {
		return `[${this.attribute}${wrap(this.test)}${(this.test && this.value) || ''}]${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return false;
	}
	public mayMatch(node: Node): boolean {
		return true;
	}
	public trackChanges(node: Node, map: ChangeAccumulator): void {
		map.addAttribute(node, this.attribute);
	}
}

@SelectorProperties(Specificity.PseudoClass, Rarity.PseudoClass, Match.Dynamic)
export class PseudoClassSelector extends SimpleSelector {
	constructor(public cssPseudoClass: string) {
		super();
	}
	public toString(): string {
		return `:${this.cssPseudoClass}${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return node.cssPseudoClasses && node.cssPseudoClasses.has(this.cssPseudoClass);
	}
	public mayMatch(node: Node): boolean {
		return true;
	}
	public trackChanges(node: Node, map: ChangeAccumulator): void {
		map.addPseudoClass(node, this.cssPseudoClass);
	}
}

export class SimpleSelectorSequence extends SimpleSelector {
	private head: SimpleSelector;
	constructor(public selectors: SimpleSelector[]) {
		super();
		this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
		this.head = this.selectors.reduce((prev, curr) => (!prev || curr.rarity > prev.rarity ? curr : prev), null);
		this.dynamic = selectors.some((sel) => sel.dynamic);
	}
	public toString(): string {
		return `${this.selectors.join('')}${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return this.selectors.every((sel) => sel.match(node));
	}
	public mayMatch(node: Node): boolean {
		return this.selectors.every((sel) => sel.mayMatch(node));
	}
	public trackChanges(node, map): void {
		this.selectors.forEach((sel) => sel.trackChanges(node, map));
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		this.head.lookupSort(sorter, base || this);
	}
}

export class Selector extends SelectorCore {
	// Grouped by ancestor combinators, then by direct child combinators.
	private groups: Selector.ChildGroup[];
	private last: SelectorCore;

	constructor(public selectors: SimpleSelector[]) {
		super();
		const supportedCombinator = [undefined, ' ', '>', '+'];
		let siblingGroup: SimpleSelector[];
		let lastGroup: SimpleSelector[][];
		let groups: SimpleSelector[][][] = [];

		this.specificity = 0;
		this.dynamic = false;

		for (let i = selectors.length - 1; i > -1; i--) {
			const sel = selectors[i];

			if (supportedCombinator.indexOf(sel.combinator) === -1) {
				throw new Error(`Unsupported combinator "${sel.combinator}".`);
			}
			if (sel.combinator === undefined || sel.combinator === ' ') {
				groups.push((lastGroup = [(siblingGroup = [])]));
			}
			if (sel.combinator === '>') {
				lastGroup.push((siblingGroup = []));
			}

			this.specificity += sel.specificity;

			if (sel.dynamic) {
				this.dynamic = true;
			}

			siblingGroup.push(sel);
		}

		this.groups = groups.map((g) => new Selector.ChildGroup(g.map((sg) => new Selector.SiblingGroup(sg))));
		this.last = selectors[selectors.length - 1];
	}

	public toString(): string {
		return this.selectors.join('');
	}

	public match(node: Node): boolean {
		return this.groups.every((group, i) => {
			if (i === 0) {
				node = group.match(node);

				return !!node;
			} else {
				let ancestor = node;
				while ((ancestor = ancestor.parent)) {
					if ((node = group.match(ancestor))) {
						return true;
					}
				}

				return false;
			}
		});
	}

	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		this.last.lookupSort(sorter, this);
	}

	public accumulateChanges(node: Node, map?: ChangeAccumulator): boolean {
		if (!this.dynamic) {
			return this.match(node);
		}

		let bounds: Selector.Bound[] = [];
		let mayMatch = this.groups.every((group, i) => {
			if (i === 0) {
				let nextNode = group.mayMatch(node);
				bounds.push({ left: node, right: node });
				node = nextNode;

				return !!node;
			} else {
				let ancestor = node;
				while ((ancestor = ancestor.parent)) {
					let nextNode = group.mayMatch(ancestor);
					if (nextNode) {
						bounds.push({ left: ancestor, right: null });
						node = nextNode;

						return true;
					}
				}

				return false;
			}
		});

		// Calculating the right bounds for each selectors won't save much
		if (!mayMatch) {
			return false;
		}

		if (!map) {
			return mayMatch;
		}

		for (let i = 0; i < this.groups.length; i++) {
			let group = this.groups[i];
			if (!group.dynamic) {
				continue;
			}
			let bound = bounds[i];
			let node = bound.left;
			do {
				if (group.mayMatch(node)) {
					group.trackChanges(node, map);
				}
			} while (node !== bound.right && (node = node.parent));
		}

		return mayMatch;
	}
}
export namespace Selector {
	// Non-spec. Selector sequences are grouped by ancestor then by child combinators for easier backtracking.
	export class ChildGroup {
		public dynamic: boolean;

		constructor(private selectors: SiblingGroup[]) {
			this.dynamic = selectors.some((sel) => sel.dynamic);
		}

		public match(node: Node): Node {
			return this.selectors.every((sel, i) => (node = i === 0 ? node : node.parent) && sel.match(node)) ? node : null;
		}

		public mayMatch(node: Node): Node {
			return this.selectors.every((sel, i) => (node = i === 0 ? node : node.parent) && sel.mayMatch(node)) ? node : null;
		}

		public trackChanges(node: Node, map: ChangeAccumulator) {
			this.selectors.forEach((sel, i) => (node = i === 0 ? node : node.parent) && sel.trackChanges(node, map));
		}
	}
	export class SiblingGroup {
		public dynamic: boolean;

		constructor(private selectors: SimpleSelector[]) {
			this.dynamic = selectors.some((sel) => sel.dynamic);
		}

		public match(node: Node): Node {
			return this.selectors.every((sel, i) => (node = i === 0 ? node : getNodeDirectSibling(node)) && sel.match(node)) ? node : null;
		}

		public mayMatch(node: Node): Node {
			return this.selectors.every((sel, i) => (node = i === 0 ? node : getNodeDirectSibling(node)) && sel.mayMatch(node)) ? node : null;
		}

		public trackChanges(node: Node, map: ChangeAccumulator) {
			this.selectors.forEach((sel, i) => (node = i === 0 ? node : getNodeDirectSibling(node)) && sel.trackChanges(node, map));
		}
	}
	export interface Bound {
		left: Node;
		right: Node;
	}
}

export class RuleSet {
	tag: string | Number;
	constructor(public selectors: SelectorCore[], public declarations: Declaration[]) {
		this.selectors.forEach((sel) => (sel.ruleset = this));
	}
	public toString(): string {
		return `${this.selectors.join(', ')} {${this.declarations.map((d, i) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`).join('; ')} }`;
	}
	public lookupSort(sorter: LookupSorter): void {
		this.selectors.forEach((sel) => sel.lookupSort(sorter));
	}
}

export function fromAstNodes(astRules: cssParser.Node[]): RuleSet[] {
	return (<cssParser.Rule[]>astRules.filter(isRule)).map((rule) => {
		let declarations = rule.declarations.filter(isDeclaration).map(createDeclaration);
		let selectors = rule.selectors.map(createSelector);

		return new RuleSet(selectors, declarations);
	});
}

function createDeclaration(decl: cssParser.Declaration): any {
	return { property: decl.property.toLowerCase(), value: decl.value };
}

function createSimpleSelectorFromAst(ast: parser.SimpleSelector): SimpleSelector {
	if (ast.type === '.') {
		return new ClassSelector(ast.identifier);
	}

	if (ast.type === '') {
		return new TypeSelector(ast.identifier.replace('-', '').toLowerCase());
	}

	if (ast.type === '#') {
		return new IdSelector(ast.identifier);
	}

	if (ast.type === '[]') {
		return new AttributeSelector(ast.property, ast.test, ast.test && ast.value);
	}

	if (ast.type === ':') {
		return new PseudoClassSelector(ast.identifier);
	}

	if (ast.type === '*') {
		return new UniversalSelector();
	}
}

function createSimpleSelectorSequenceFromAst(ast: parser.SimpleSelectorSequence): SimpleSelectorSequence | SimpleSelector {
	if (ast.length === 0) {
		return new InvalidSelector(new Error('Empty simple selector sequence.'));
	} else if (ast.length === 1) {
		return createSimpleSelectorFromAst(ast[0]);
	} else {
		return new SimpleSelectorSequence(ast.map(createSimpleSelectorFromAst));
	}
}

function createSelectorFromAst(ast: parser.Selector): SimpleSelector | SimpleSelectorSequence | Selector {
	if (ast.length === 0) {
		return new InvalidSelector(new Error('Empty selector.'));
	} else if (ast.length === 1) {
		return createSimpleSelectorSequenceFromAst(ast[0][0]);
	} else {
		let simpleSelectorSequences = [];
		let simpleSelectorSequence: SimpleSelectorSequence | SimpleSelector;
		let combinator: parser.Combinator;
		for (let i = 0; i < ast.length; i++) {
			simpleSelectorSequence = createSimpleSelectorSequenceFromAst(<parser.SimpleSelectorSequence>ast[i][0]);
			combinator = <parser.Combinator>ast[i][1];
			if (combinator) {
				simpleSelectorSequence.combinator = combinator;
			}
			simpleSelectorSequences.push(simpleSelectorSequence);
		}

		return new Selector(simpleSelectorSequences);
	}
}

export function createSelector(sel: string): SimpleSelector | SimpleSelectorSequence | Selector {
	try {
		let parsedSelector = parser.parseSelector(sel);
		if (!parsedSelector) {
			return new InvalidSelector(new Error('Empty selector'));
		}

		return createSelectorFromAst(parsedSelector.value);
	} catch (e) {
		return new InvalidSelector(e);
	}
}

function isRule(node: cssParser.Node): node is cssParser.Rule {
	return node.type === 'rule';
}
function isDeclaration(node: cssParser.Node): node is cssParser.Declaration {
	return node.type === 'declaration';
}

interface SelectorMap {
	[key: string]: SelectorCore[];
}
export class SelectorsMap<T extends Node> implements LookupSorter {
	private id: SelectorMap = {};
	private class: SelectorMap = {};
	private type: SelectorMap = {};
	private universal: SelectorCore[] = [];

	private position = 0;

	constructor(rulesets: RuleSet[]) {
		rulesets.forEach((rule) => rule.lookupSort(this));
	}

	query(node: T): SelectorsMatch<T> {
		const selectorsMatch = new SelectorsMatch<T>();
		const { cssClasses, id, cssType } = node;
		const selectorClasses = [this.universal, this.id[id], this.type[cssType]];

		if (cssClasses && cssClasses.size) {
			cssClasses.forEach((c) => selectorClasses.push(this.class[c]));
		}

		const selectors = selectorClasses.reduce((cur, next) => cur.concat(next || []), []);

		selectorsMatch.selectors = selectors.filter((sel) => sel.accumulateChanges(node, selectorsMatch)).sort((a, b) => a.specificity - b.specificity || a.pos - b.pos);

		return selectorsMatch;
	}

	sortById(id: string, sel: SelectorCore): void {
		this.addToMap(this.id, id, sel);
	}
	sortByClass(cssClass: string, sel: SelectorCore): void {
		this.addToMap(this.class, cssClass, sel);
	}
	sortByType(cssType: string, sel: SelectorCore): void {
		this.addToMap(this.type, cssType, sel);
	}
	sortAsUniversal(sel: SelectorCore): void {
		this.universal.push(this.makeDocSelector(sel));
	}

	private addToMap(map: SelectorMap, head: string, sel: SelectorCore): void {
		if (!map[head]) {
			map[head] = [];
		}

		map[head].push(this.makeDocSelector(sel));
	}

	private makeDocSelector(sel: SelectorCore): SelectorCore {
		sel.pos = this.position++;

		return sel;
	}
}

interface ChangeAccumulator {
	addAttribute(node: Node, attribute: string): void;
	addPseudoClass(node: Node, pseudoClass: string): void;
}

export class SelectorsMatch<T extends Node> implements ChangeAccumulator {
	public changeMap: ChangeMap<T> = new Map<T, Changes>();
	public selectors;

	public addAttribute(node: T, attribute: string): void {
		let deps: Changes = this.properties(node);
		if (!deps.attributes) {
			deps.attributes = new Set();
		}
		deps.attributes.add(attribute);
	}

	public addPseudoClass(node: T, pseudoClass: string): void {
		let deps: Changes = this.properties(node);
		if (!deps.pseudoClasses) {
			deps.pseudoClasses = new Set();
		}
		deps.pseudoClasses.add(pseudoClass);
	}

	public properties(node: T): Changes {
		let set = this.changeMap.get(node);
		if (!set) {
			this.changeMap.set(node, (set = {}));
		}

		return set;
	}
}

export const CSSHelper = {
	createSelector,
	SelectorCore,
	SimpleSelector,
	InvalidSelector,
	UniversalSelector,
	TypeSelector,
	ClassSelector,
	AttributeSelector,
	PseudoClassSelector,
	SimpleSelectorSequence,
	Selector,
	RuleSet,
	SelectorsMap,
	fromAstNodes,
	SelectorsMatch,
};
