import { parse as convertToCSSWhatSelector, Selector as CSSWhatSelector, DataType as CSSWhatDataType } from 'css-what';
import '../../globals';
import { isCssVariable } from '../core/properties';
import { Trace, CoreTypes } from './styling-shared';
import { isNullOrUndefined } from '../../utils/types';

import * as ReworkCSS from '../../css';
import { checkIfMediaQueryMatches } from '../../media-query-list';

export const MEDIA_QUERY_SEPARATOR = '&&';

/**
 * An interface describing the shape of a type on which the selectors may apply.
 * Note, the ui/core/view.View implements Node.
 */
export interface Node {
	parent?: Node;
	_modalParent?: Node;

	id?: string;
	nodeName?: string;
	cssType?: string;
	cssClasses?: Set<string>;
	cssPseudoClasses?: Set<string>;
	getChildIndex?(node: Node): number;
	getChildAt?(index: number): Node;
	getChildrenCount?(): number;
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

/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
const enum Specificity {
	Inline = 1000,
	Id = 100,
	Attribute = 10,
	Class = 10,
	PseudoClass = 10,
	Type = 1,
	Universal = 0,
	Invalid = 0,
	Zero = 0,
	/**
	 * Selector has the specificity of the selector with the highest specificity inside selector list.
	 */
	SelectorListHighest = -1,
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
/* eslint-enable @typescript-eslint/no-duplicate-enum-values */

const enum PseudoClassSelectorList {
	Regular = 0,
	Forgiving = 1,
	Relative = 2,
}

enum Combinator {
	'descendant' = ' ',
	'child' = '>',
	'adjacent' = '+',
	'sibling' = '~',

	// Not supported
	'parent' = '<',
	'column-combinator' = '||',
}

enum AttributeSelectorOperator {
	exists = '',
	equals = '=',
	start = '^=',
	end = '$=',
	any = '*=',
	element = '~=',
	hyphen = '|=',
}

declare type AttributeTest = 'exists' | 'equals' | 'start' | 'end' | 'any' | 'element' | 'hyphen';

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

function eachNodePreviousGeneralSibling(node: Node, callback: (sibling: Node) => boolean): void {
	if (!node.parent || !node.parent.getChildIndex || !node.parent.getChildAt || !node.parent.getChildrenCount) {
		return;
	}

	const nodeIndex = node.parent.getChildIndex(node);
	if (nodeIndex === 0) {
		return;
	}

	const count = node.parent.getChildrenCount();
	let retVal: boolean = true;

	for (let i = nodeIndex - 1; i >= 0 && retVal; i--) {
		const sibling = node.parent.getChildAt(i);
		retVal = callback(sibling);
	}
}

function getNodePreviousDirectSibling(node: Node): null | Node {
	if (!node.parent || !node.parent.getChildIndex || !node.parent.getChildAt) {
		return null;
	}
	const nodeIndex = node.parent.getChildIndex(node);
	if (nodeIndex === 0) {
		return null;
	}

	return node.parent.getChildAt(nodeIndex - 1);
}

function SelectorProperties(specificity: Specificity, rarity: Rarity, dynamic = false): ClassDecorator {
	return (cls) => {
		cls.prototype.specificity = specificity;
		cls.prototype.rarity = rarity;
		cls.prototype.combinator = undefined;
		cls.prototype.dynamic = dynamic;

		return cls;
	};
}

function FunctionalPseudoClassProperties(specificity: Specificity, rarity: Rarity, pseudoSelectorListType: PseudoClassSelectorList): ClassDecorator {
	return (cls) => {
		cls.prototype.specificity = specificity;
		cls.prototype.rarity = rarity;
		cls.prototype.combinator = undefined;
		cls.prototype.dynamic = false;
		cls.prototype.pseudoSelectorListType = pseudoSelectorListType;

		return cls;
	};
}

export abstract class SelectorBase {
	/**
	 * Dynamic selectors depend on attributes and pseudo classes.
	 */
	public dynamic: boolean;
	public abstract match(node: Node): boolean;
	public abstract mayMatch(node: Node): boolean;
	public abstract trackChanges(node: Node, map: ChangeAccumulator): void;
}

@SelectorProperties(Specificity.Universal, Rarity.Universal, Match.Static)
export abstract class SelectorCore extends SelectorBase {
	public pos: number;
	public specificity: number;
	public rarity: Rarity;
	public combinator: Combinator;
	public ruleset: RuleSet;

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
		return `<${this.e}>`;
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

@SelectorProperties(Specificity.Attribute, Rarity.Attribute, Match.Dynamic)
export class AttributeSelector extends SimpleSelector {
	constructor(
		public attribute: string,
		public test: AttributeTest,
		public value: string,
		public ignoreCase: boolean,
	) {
		super();
	}
	public toString(): string {
		return `[${this.attribute}${wrap(AttributeSelectorOperator[this.test] ?? this.test)}${this.value || ''}]${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		let attr = node[this.attribute];

		if (this.test === 'exists') {
			return !isNullOrUndefined(attr);
		}

		if (!this.value) {
			return false;
		}

		// Now, convert value to string
		attr += '';

		if (this.ignoreCase) {
			attr = attr.toLowerCase();
			this.value = this.value.toLowerCase();
		}

		// =
		if (this.test === 'equals') {
			return attr === this.value;
		}

		// ^=
		if (this.test === 'start') {
			return attr.startsWith(this.value);
		}

		// $=
		if (this.test === 'end') {
			return attr.endsWith(this.value);
		}

		// *=
		if (this.test === 'any') {
			return attr.indexOf(this.value) !== -1;
		}

		// ~=
		if (this.test === 'element') {
			const words = attr.split(' ');
			return words && words.indexOf(this.value) !== -1;
		}

		// |=
		if (this.test === 'hyphen') {
			return attr === this.value || attr.startsWith(this.value + '-');
		}
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

export abstract class FunctionalPseudoClassSelector extends PseudoClassSelector {
	protected selectors: Array<SimpleSelector | SimpleSelectorSequence | ComplexSelector>;
	protected selectorListType?: PseudoClassSelectorList;

	constructor(cssPseudoClass: string, dataType: CSSWhatDataType) {
		super(cssPseudoClass);

		const selectors: Array<SimpleSelector | SimpleSelectorSequence | ComplexSelector> = [];
		const needsHighestSpecificity: boolean = this.specificity === Specificity.SelectorListHighest;

		let specificity: number = 0;

		if (Array.isArray(dataType)) {
			for (const asts of dataType) {
				const selector: SimpleSelector | SimpleSelectorSequence | ComplexSelector = createSelectorFromAst(asts);

				if (selector instanceof InvalidSelector) {
					// Only forgiving selector list can ignore invalid selectors
					if (this.selectorListType !== PseudoClassSelectorList.Forgiving) {
						selectors.splice(0);
						specificity = 0;
						break;
					}

					continue;
				}

				// The specificity of some pseudo-classes is replaced by the specificity of the most specific selector in its comma-separated argument of selectors
				if (needsHighestSpecificity && selector.specificity > specificity) {
					specificity = selector.specificity;
				}

				selectors.push(selector);
			}
		}

		this.selectors = selectors;
		this.specificity = specificity;
		// Functional pseudo-classes become dynamic based on selectors in selector list
		this.dynamic = this.selectors.some((sel) => sel.dynamic);
	}
	public toString(): string {
		return `:${this.cssPseudoClass}(${this.selectors.join(', ')})${wrap(this.combinator)}`;
	}
	public match(node: Node): boolean {
		return false;
	}
	public mayMatch(node: Node): boolean {
		return true;
	}
	public trackChanges(node: Node, map: ChangeAccumulator): void {
		this.selectors.forEach((sel) => sel.trackChanges(node, map));
	}
}

@FunctionalPseudoClassProperties(Specificity.SelectorListHighest, Rarity.PseudoClass, PseudoClassSelectorList.Regular)
export class NotFunctionalPseudoClassSelector extends FunctionalPseudoClassSelector {
	public match(node: Node): boolean {
		return !this.selectors.some((sel) => sel.match(node));
	}
}

@FunctionalPseudoClassProperties(Specificity.SelectorListHighest, Rarity.PseudoClass, PseudoClassSelectorList.Forgiving)
export class IsFunctionalPseudoClassSelector extends FunctionalPseudoClassSelector {
	public match(node: Node): boolean {
		return this.selectors.some((sel) => sel.match(node));
	}

	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		// A faster lookup can be performed when selector list contains just a single selector
		if (this.selectors.length === 1) {
			this.selectors[0].lookupSort(sorter, base || this);
		} else {
			super.lookupSort(sorter, base || this);
		}
	}
}

@FunctionalPseudoClassProperties(Specificity.Zero, Rarity.PseudoClass, PseudoClassSelectorList.Forgiving)
export class WhereFunctionalPseudoClassSelector extends FunctionalPseudoClassSelector {
	public match(node: Node): boolean {
		return this.selectors.some((sel) => sel.match(node));
	}

	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		// A faster lookup can be performed when selector list contains just a single selector
		if (this.selectors.length === 1) {
			this.selectors[0].lookupSort(sorter, base || this);
		} else {
			super.lookupSort(sorter, base || this);
		}
	}
}

export class SimpleSelectorSequence extends SimpleSelector {
	private head: SimpleSelector;

	constructor(public selectors: SimpleSelector[]) {
		super();
		this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
		this.head = selectors.reduce((prev, curr) => (!prev || curr.rarity > prev.rarity ? curr : prev), null);
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
	public trackChanges(node: Node, map: ChangeAccumulator): void {
		this.selectors.forEach((sel) => sel.trackChanges(node, map));
	}
	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		this.head.lookupSort(sorter, base || this);
	}
}

export class ComplexSelector extends SelectorCore {
	// Grouped by ancestor combinators, then by child combinators.
	private groups: Selector.ChildGroup[];
	private last: SelectorCore;

	constructor(public selectors: SimpleSelector[]) {
		super();

		let siblingsToGroup: SimpleSelector[];
		let currentGroup: SimpleSelector[][];
		const groups: SimpleSelector[][][] = [];

		this.specificity = 0;
		this.dynamic = false;

		for (let i = selectors.length - 1; i >= 0; i--) {
			const sel = selectors[i];

			switch (sel.combinator) {
				case undefined:
				case Combinator.descendant:
					siblingsToGroup = [];
					currentGroup = [siblingsToGroup];

					groups.push(currentGroup);
					break;
				case Combinator.child:
					siblingsToGroup = [];

					currentGroup.push(siblingsToGroup);
					break;
				case Combinator.adjacent:
				case Combinator.sibling:
					break;
				default:
					throw new Error(`Unsupported combinator "${sel.combinator}" for selector ${sel}.`);
			}

			this.specificity += sel.specificity;

			if (sel.dynamic) {
				this.dynamic = true;
			}

			siblingsToGroup.push(sel);
		}

		this.groups = groups.map((g) => new Selector.ChildGroup(g.map((selectors) => (selectors.length > 1 ? new Selector.SiblingGroup(selectors) : selectors[0]))));
		this.last = selectors[selectors.length - 1];
	}

	public toString(): string {
		return this.selectors.join('');
	}

	public match(node: Node): boolean {
		return this.groups.every((group, i) => {
			if (i === 0) {
				node = group.getMatchingNode(node, true);

				return !!node;
			} else {
				let ancestor = node;
				while ((ancestor = ancestor.parent ?? ancestor._modalParent)) {
					if ((node = group.getMatchingNode(ancestor, true))) {
						return true;
					}
				}

				return false;
			}
		});
	}

	public mayMatch(node: Node): boolean {
		return false;
	}

	public trackChanges(node: Node, map: ChangeAccumulator): void {
		this.selectors.forEach((sel) => sel.trackChanges(node, map));
	}

	public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
		this.last.lookupSort(sorter, base || this);
	}

	public accumulateChanges(node: Node, map?: ChangeAccumulator): boolean {
		if (!this.dynamic) {
			return this.match(node);
		}

		const bounds: Selector.Bound[] = [];
		const mayMatch = this.groups.every((group, i) => {
			if (i === 0) {
				const nextNode = group.getMatchingNode(node, false);
				bounds.push({ left: node, right: node });
				node = nextNode;

				return !!node;
			} else {
				let ancestor = node;
				while ((ancestor = ancestor.parent)) {
					const nextNode = group.getMatchingNode(ancestor, false);
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
			const group = this.groups[i];
			if (!group.dynamic) {
				continue;
			}
			const bound = bounds[i];
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
	export class ChildGroup extends SelectorBase {
		constructor(private selectors: SelectorBase[]) {
			super();

			this.dynamic = selectors.some((sel) => sel.dynamic);
		}

		public getMatchingNode(node: Node, strict: boolean) {
			const funcName = strict ? 'match' : 'mayMatch';
			return this.selectors.every((sel, i) => (node = i === 0 ? node : node.parent) && sel[funcName](node)) ? node : null;
		}

		public match(node: Node): boolean {
			return this.getMatchingNode(node, true) != null;
		}

		public mayMatch(node: Node): boolean {
			return this.getMatchingNode(node, false) != null;
		}

		public trackChanges(node: Node, map: ChangeAccumulator): void {
			this.selectors.forEach((sel, i) => {
				if (i === 0) {
					node && sel.trackChanges(node, map);
				} else {
					node = node.parent;

					if (node && sel.mayMatch(node)) {
						sel.trackChanges(node, map);
					}
				}
			});
		}
	}

	export class SiblingGroup extends SelectorBase {
		constructor(private selectors: SimpleSelector[]) {
			super();

			this.dynamic = selectors.some((sel) => sel.dynamic);
		}

		public match(node: Node): boolean {
			return this.selectors.every((sel, i) => {
				if (i === 0) {
					return node && sel.match(node);
				}

				if (sel.combinator === Combinator.adjacent) {
					node = getNodePreviousDirectSibling(node);
					return node && sel.match(node);
				}

				// Sibling combinator
				let isMatching: boolean = false;

				eachNodePreviousGeneralSibling(node, (sibling) => {
					isMatching = sel.match(sibling);
					return !isMatching;
				});

				return isMatching;
			});
		}

		public mayMatch(node: Node): boolean {
			return this.selectors.every((sel, i) => {
				if (i === 0) {
					return node && sel.mayMatch(node);
				}

				if (sel.combinator === Combinator.adjacent) {
					node = getNodePreviousDirectSibling(node);
					return node && sel.mayMatch(node);
				}

				// Sibling combinator
				let isMatching: boolean = false;

				eachNodePreviousGeneralSibling(node, (sibling) => {
					isMatching = sel.mayMatch(sibling);
					return !isMatching;
				});

				return isMatching;
			});
		}

		public trackChanges(node: Node, map: ChangeAccumulator): void {
			this.selectors.forEach((sel, i) => {
				if (i === 0) {
					if (node) {
						sel.trackChanges(node, map);
					}
				} else {
					if (sel.combinator === Combinator.adjacent) {
						node = getNodePreviousDirectSibling(node);
						if (node && sel.mayMatch(node)) {
							sel.trackChanges(node, map);
						}
					} else {
						// Sibling combinator
						let matchingSibling: Node;

						eachNodePreviousGeneralSibling(node, (sibling) => {
							const isMatching = sel.mayMatch(sibling);
							if (isMatching) {
								matchingSibling = sibling;
							}

							return !isMatching;
						});

						if (matchingSibling) {
							sel.trackChanges(matchingSibling, map);
						}
					}
				}
			});
		}
	}

	export interface Bound {
		left: Node;
		right: Node;
	}
}

export class RuleSet {
	public selectors: SelectorCore[];
	public declarations: Declaration[];
	public mediaQueryString: string;
	public tag?: string | number;
	public scopedTag?: string;

	constructor(selectors: SelectorCore[], declarations: Declaration[]) {
		this.selectors = selectors;
		this.declarations = declarations;
		this.selectors.forEach((sel) => (sel.ruleset = this));
	}
	public toString(): string {
		let desc = `${this.selectors.join(', ')} {${this.declarations.map((d, i) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`).join('; ')} }`;
		if (this.mediaQueryString) {
			desc = `@media ${this.mediaQueryString} { ${desc} }`;
		}
		return desc;
	}
	public lookupSort(sorter: LookupSorter): void {
		this.selectors.forEach((sel) => sel.lookupSort(sorter));
	}
}

export function fromAstNode(astRule: ReworkCSS.Rule): RuleSet {
	const declarations = astRule.declarations.filter(isDeclaration).map(createDeclaration);
	const selectors = astRule.selectors.map(createSelector);

	return new RuleSet(selectors, declarations);
}

function createDeclaration(decl: ReworkCSS.Declaration): any {
	return { property: isCssVariable(decl.property) ? decl.property : decl.property.toLowerCase(), value: decl.value };
}

function createSimpleSelectorFromAst(ast: CSSWhatSelector): SimpleSelector {
	if (ast.type === 'attribute') {
		if (ast.name === 'class') {
			return new ClassSelector(ast.value);
		}

		if (ast.name === 'id') {
			return new IdSelector(ast.value);
		}

		return new AttributeSelector(ast.name, <AttributeTest>ast.action, ast.value, !!ast.ignoreCase);
	}

	if (ast.type === 'tag') {
		return new TypeSelector(ast.name.replace('-', '').toLowerCase());
	}

	if (ast.type === 'pseudo') {
		if (ast.name === 'is') {
			return new IsFunctionalPseudoClassSelector(ast.name, ast.data);
		}

		if (ast.name === 'where') {
			return new WhereFunctionalPseudoClassSelector(ast.name, ast.data);
		}

		if (ast.name === 'not') {
			return new NotFunctionalPseudoClassSelector(ast.name, ast.data);
		}

		return new PseudoClassSelector(ast.name);
	}

	if (ast.type === 'universal') {
		return new UniversalSelector();
	}

	return new InvalidSelector(new Error(ast.type));
}

function createSimpleSelectorSequenceFromAst(asts: CSSWhatSelector[]): SimpleSelectorSequence | SimpleSelector {
	if (asts.length === 0) {
		return new InvalidSelector(new Error('Empty simple selector sequence.'));
	}

	if (asts.length === 1) {
		return createSimpleSelectorFromAst(asts[0]);
	}

	const sequenceSelectors: SimpleSelector[] = [];

	for (const ast of asts) {
		const selector = createSimpleSelectorFromAst(ast);
		if (selector instanceof InvalidSelector) {
			return selector;
		}

		sequenceSelectors.push(selector);
	}

	return new SimpleSelectorSequence(sequenceSelectors);
}

function createSelectorFromAst(asts: Array<CSSWhatSelector>): SimpleSelector | SimpleSelectorSequence | ComplexSelector {
	let result: SimpleSelector | SimpleSelectorSequence | ComplexSelector;

	if (asts.length === 0) {
		return new InvalidSelector(new Error('Empty selector.'));
	}

	if (asts.length === 1) {
		return createSimpleSelectorFromAst(asts[0]);
	}

	const simpleSelectorSequences: Array<SimpleSelector | SimpleSelectorSequence> = [];

	let sequenceAsts: CSSWhatSelector[] = [];
	let combinatorCount: number = 0;

	for (const ast of asts) {
		const combinator = Combinator[ast.type];

		// Combinator means the end of a sequence
		if (combinator != null) {
			const selector = createSimpleSelectorSequenceFromAst(sequenceAsts);

			if (selector instanceof InvalidSelector) {
				return selector;
			}

			selector.combinator = combinator;
			simpleSelectorSequences.push(selector);

			combinatorCount++;
			// Cleanup stored selectors for the new sequence to take place
			sequenceAsts = [];
		} else {
			sequenceAsts.push(ast);
		}
	}

	if (combinatorCount > 0) {
		// Create a sequence using the remaining selectors after the last combinator
		if (sequenceAsts.length) {
			const selector = createSimpleSelectorSequenceFromAst(sequenceAsts);

			if (selector instanceof InvalidSelector) {
				return selector;
			}

			simpleSelectorSequences.push(selector);
		}
		return new ComplexSelector(simpleSelectorSequences);
	}

	return createSimpleSelectorSequenceFromAst(sequenceAsts);
}

export function createSelector(sel: string): SimpleSelector | SimpleSelectorSequence | ComplexSelector {
	try {
		const result = convertToCSSWhatSelector(sel);
		if (!result?.length) {
			return new InvalidSelector(new Error('Empty selector'));
		}

		return createSelectorFromAst(result[0]);
	} catch (e) {
		return new InvalidSelector(e);
	}
}

function isDeclaration(node: ReworkCSS.Node): node is ReworkCSS.Declaration {
	return node.type === 'declaration';
}

export function matchMediaQueryString(mediaQueryString: string, cachedQueries: string[]): boolean {
	// It can be a single or multiple queries in case of nested media queries
	const mediaQueryStrings = mediaQueryString.split(MEDIA_QUERY_SEPARATOR);

	return mediaQueryStrings.every((mq) => {
		let isMatching: boolean;

		// Query has already been validated
		if (cachedQueries.includes(mq)) {
			isMatching = true;
		} else {
			isMatching = checkIfMediaQueryMatches(mq);
			if (isMatching) {
				cachedQueries.push(mq);
			}
		}
		return isMatching;
	});
}

interface SelectorMap {
	[key: string]: SelectorCore[];
}

export abstract class SelectorScope<T extends Node> implements LookupSorter {
	private id: SelectorMap = {};
	private class: SelectorMap = {};
	private type: SelectorMap = {};
	private universal: SelectorCore[] = [];

	public position: number = 0;

	getSelectorCandidates(node: T) {
		const { cssClasses, id, cssType } = node;
		const selectorClasses = [this.universal, this.id[id], this.type[cssType]];

		if (cssClasses && cssClasses.size) {
			cssClasses.forEach((c) => selectorClasses.push(this.class[c]));
		}

		return selectorClasses.reduce((cur, next) => cur.concat(next || []), []);
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

export class MediaQuerySelectorScope<T extends Node> extends SelectorScope<T> {
	private _mediaQueryString: string;

	constructor(mediaQueryString: string) {
		super();

		this._mediaQueryString = mediaQueryString;
	}

	get mediaQueryString(): string {
		return this._mediaQueryString;
	}
}

export class StyleSheetSelectorScope<T extends Node> extends SelectorScope<T> {
	private mediaQuerySelectorScopes: MediaQuerySelectorScope<T>[];

	constructor(rulesets: RuleSet[]) {
		super();

		this.lookupRulesets(rulesets);
	}

	private createMediaQuerySelectorScope(mediaQueryString: string): MediaQuerySelectorScope<T> {
		const selectorScope = new MediaQuerySelectorScope(mediaQueryString);
		selectorScope.position = this.position;

		if (this.mediaQuerySelectorScopes) {
			this.mediaQuerySelectorScopes.push(selectorScope);
		} else {
			this.mediaQuerySelectorScopes = [selectorScope];
		}

		return selectorScope;
	}

	private lookupRulesets(rulesets: RuleSet[]) {
		let lastMediaSelectorScope: MediaQuerySelectorScope<T>;

		for (let i = 0, length = rulesets.length; i < length; i++) {
			const ruleset = rulesets[i];

			if (lastMediaSelectorScope && lastMediaSelectorScope.mediaQueryString !== ruleset.mediaQueryString) {
				// Once done with current media query scope, update stylesheet scope position
				this.position = lastMediaSelectorScope.position;
				lastMediaSelectorScope = null;
			}

			if (ruleset.mediaQueryString) {
				// Create media query selector scope and register selector lookups there
				if (!lastMediaSelectorScope) {
					lastMediaSelectorScope = this.createMediaQuerySelectorScope(ruleset.mediaQueryString);
				}

				ruleset.lookupSort(lastMediaSelectorScope);
			} else {
				ruleset.lookupSort(this);
			}
		}

		// If reference of last media selector scope is still kept, update stylesheet scope position
		if (lastMediaSelectorScope) {
			this.position = lastMediaSelectorScope.position;
			lastMediaSelectorScope = null;
		}
	}

	query(node: T): SelectorsMatch<T> {
		const selectorsMatch = new SelectorsMatch<T>();
		const selectors = this.getSelectorCandidates(node);

		// Validate media queries and include their selectors if needed
		if (this.mediaQuerySelectorScopes) {
			// Cache media query results to avoid validations of other identical queries
			const validatedMediaQueries: string[] = [];

			for (let i = 0, length = this.mediaQuerySelectorScopes.length; i < length; i++) {
				const selectorScope = this.mediaQuerySelectorScopes[i];
				const isMatchingAllQueries = matchMediaQueryString(selectorScope.mediaQueryString, validatedMediaQueries);

				if (isMatchingAllQueries) {
					const mediaQuerySelectors = selectorScope.getSelectorCandidates(node);
					selectors.push(...mediaQuerySelectors);
				}
			}
		}

		selectorsMatch.selectors = selectors.filter((sel) => sel.accumulateChanges(node, selectorsMatch)).sort((a, b) => a.specificity - b.specificity || a.pos - b.pos);

		return selectorsMatch;
	}
}

interface ChangeAccumulator {
	addAttribute(node: Node, attribute: string): void;
	addPseudoClass(node: Node, pseudoClass: string): void;
}

export class SelectorsMatch<T extends Node> implements ChangeAccumulator {
	public changeMap: ChangeMap<T> = new Map<T, Changes>();
	public selectors: SelectorCore[];

	public addAttribute(node: T, attribute: string): void {
		const deps: Changes = this.properties(node);
		if (!deps.attributes) {
			deps.attributes = new Set();
		}
		deps.attributes.add(attribute);
	}

	public addPseudoClass(node: T, pseudoClass: string): void {
		const deps: Changes = this.properties(node);
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
	SelectorScope,
	MediaQuerySelectorScope,
	StyleSheetSelectorScope,
	fromAstNode,
	SelectorsMatch,
};
