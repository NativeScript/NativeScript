import { Node, Declaration, Changes, ChangeMap } from "ui/styling/css-selector";
import { isNullOrUndefined } from "utils/types";
import { escapeRegexSymbols } from "utils/utils";

import * as cssParser from "css";
import * as selectorParser from "../css-selector-parser";

const enum Specificity {
    Inline =        0x01000000,
    Id =            0x00010000,
    Attribute =     0x00000100,
    Class =         0x00000100,
    PseudoClass =   0x00000100,
    Type =          0x00000001,
    Universal =     0x00000000,
    Invalid =       0x00000000
}

const enum Rarity {
    Invalid = 4,
    Id = 3,
    Class = 2,
    Type = 1,
    PseudoClass = 0,
    Attribute = 0,
    Universal = 0,
    Inline = 0
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
    export var Dynamic = true;
    /**
     * Depends only on the tree structure.
     */
    export var Static = false;
}

function SelectorProperties(specificity: Specificity, rarity: Rarity, dynamic: boolean = false): ClassDecorator {
    return cls => {
        cls.prototype.specificity = specificity;
        cls.prototype.rarity = rarity;
        cls.prototype.combinator = "";
        cls.prototype.dynamic = dynamic;
        return cls;
    }
}

declare type Combinator = "+" | ">" | "~" | " ";
@SelectorProperties(Specificity.Universal, Rarity.Universal, Match.Static)
export abstract class SelectorCore {
    public specificity: number;
    public rarity: Rarity;
    public combinator: Combinator;
    public ruleset: RuleSet;
    public dynamic: boolean;
    public abstract match(node: Node): boolean;
    /**
     * If the selector is static returns if it matches the node.
     * If the selector is dynamic returns if it may match the node, and accumulates any changes that may affect its state.
     */
    public abstract accumulateChanges(node: Node, map: ChangeAccumulator): boolean;
    public lookupSort(sorter: LookupSorter, base?: SelectorCore): void { sorter.sortAsUniversal(base || this); }
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
    public mayMatch(node: Node): boolean { return this.match(node); }
    public trackChanges(node: Node, map: ChangeAccumulator): void {
        // No-op, silence the tslint 'block is empty'.
        // Some derived classes (dynamic) will actually fill the map with stuff here, some (static) won't do anything.
    }
}

function wrap(text: string): string {
    return text ? ` ${text} ` : "";
}

@SelectorProperties(Specificity.Invalid, Rarity.Invalid, Match.Static)
export class InvalidSelector extends SimpleSelector {
    constructor(public e: Error) { super(); }
    public toString(): string { return `<error: ${this.e}>`; }
    public match(node: Node): boolean { return false; }
    public lookupSort(sorter: LookupSorter, base?: SelectorCore): void {
        // No-op, silence the tslint 'block is empty'.
        // It feels like tslint has problems with simple polymorphism...
        // This selector is invalid and will never match so we won't bother sorting it to further appear in queries.
    }
}

@SelectorProperties(Specificity.Universal, Rarity.Universal, Match.Static)
export class UniversalSelector extends SimpleSelector {
    public toString(): string { return `*${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return true; }
}

@SelectorProperties(Specificity.Id, Rarity.Id, Match.Static)
export class IdSelector extends SimpleSelector {
    constructor(public id: string) { super(); }
    public toString(): string { return `#${this.id}${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return node.id === this.id; }
    public lookupSort(sorter: LookupSorter, base?: SelectorCore): void { sorter.sortById(this.id, base || this); }
}

@SelectorProperties(Specificity.Type, Rarity.Type, Match.Static)
export class TypeSelector extends SimpleSelector {
    constructor(public cssType: string) { super(); }
    public toString(): string { return `${this.cssType}${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return node.cssType === this.cssType; }
    public lookupSort(sorter: LookupSorter, base?: SelectorCore): void { sorter.sortByType(this.cssType, base || this); }
}

@SelectorProperties(Specificity.Class, Rarity.Class, Match.Static)
export class ClassSelector extends SimpleSelector {
    constructor(public cssClass: string) { super(); }
    public toString(): string { return `.${this.cssClass}${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return node.cssClasses && node.cssClasses.has(this.cssClass); }
    public lookupSort(sorter: LookupSorter, base?: SelectorCore): void { sorter.sortByClass(this.cssClass, base || this); }
}

declare type AttributeTest = "=" | "^=" | "$=" | "*=" | "=" | "~=" | "|=";
@SelectorProperties(Specificity.Attribute, Rarity.Attribute, Match.Dynamic)
export class AttributeSelector extends SimpleSelector {
    constructor(public attribute: string, public test?: AttributeTest, public value?: string) {
        super();

        if (!test) {
            // HasAttribute
            this.match = node => !isNullOrUndefined(node[attribute]);
            return;
        }

        if (!value) {
            this.match = node => false;
        }

        let escapedValue = escapeRegexSymbols(value);
        let regexp: RegExp = null;
        switch(test) {
            case "^=": // PrefixMatch
                regexp = new RegExp("^" + escapedValue);
                break;
            case "$=": // SuffixMatch
                regexp = new RegExp(escapedValue + "$");
                break;
            case "*=": // SubstringMatch
                regexp = new RegExp(escapedValue);
                break;
            case "=": // Equals
                regexp = new RegExp("^" + escapedValue + "$");
                break;
            case "~=": // Includes
                if (/\s/.test(value)) {
                    this.match = node => false;
                    return;
                }
                regexp = new RegExp("(^|\\s)" + escapedValue + "(\\s|$)");
                break;
            case "|=": // DashMatch
                regexp = new RegExp("^" + escapedValue + "(-|$)");
                break;
        }

        if (regexp) {
            this.match = node => regexp.test(node[attribute] + "");
            return;
        } else {
            this.match = node => false;
            return;
        }
    }
    public toString(): string { return `[${this.attribute}${wrap(this.test)}${(this.test && this.value) || ''}]${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return false; }
    public mayMatch(node: Node): boolean { return true; }
    public trackChanges(node: Node, map: ChangeAccumulator): void { map.addAttribute(node, this.attribute); }
}

@SelectorProperties(Specificity.PseudoClass, Rarity.PseudoClass, Match.Dynamic)
export class PseudoClassSelector extends SimpleSelector {
    constructor(public cssPseudoClass: string) { super(); }
    public toString(): string { return `:${this.cssPseudoClass}${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return node.cssPseudoClasses && node.cssPseudoClasses.has(this.cssPseudoClass); }
    public mayMatch(node: Node): boolean { return true; }
    public trackChanges(node: Node, map: ChangeAccumulator): void { map.addPseudoClass(node, this.cssPseudoClass); }
}

export class SimpleSelectorSequence extends SimpleSelector {
    private head: SimpleSelector;
    constructor(public selectors: SimpleSelector[]) {
        super();
        this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
        this.head = this.selectors.reduce((prev, curr) => !prev || (curr.rarity > prev.rarity) ? curr : prev, null);
        this.dynamic = selectors.some(sel => sel.dynamic);
    }
    public toString(): string { return `${this.selectors.join("")}${wrap(this.combinator)}`; }
    public match(node: Node): boolean { return this.selectors.every(sel => sel.match(node)); }
    public mayMatch(node: Node): boolean {
        return this.selectors.every(sel => sel.mayMatch(node));
    }
    public trackChanges(node, map): void {
        this.selectors.forEach(sel => sel.trackChanges(node, map));
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
        let lastGroup: SimpleSelector[];
        let groups: SimpleSelector[][] = [];
        selectors.reverse().forEach(sel => {
            switch(sel.combinator) {
                case undefined:
                case " ":
                    groups.push(lastGroup = []);
                case ">":
                    lastGroup.push(sel);
                    break;
                default:
                    throw new Error(`Unsupported combinator "${sel.combinator}".`);
            }
        });
        this.groups = groups.map(g => new Selector.ChildGroup(g));
        this.last = selectors[0];
        this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
        this.dynamic = selectors.some(sel => sel.dynamic);
    }

    public toString(): string { return this.selectors.join(""); }

    public match(node: Node): boolean {
        return this.groups.every((group, i) => {
            if (i === 0) {
                node = group.match(node);
                return !!node;
            } else {
                let ancestor = node;
                while(ancestor = ancestor.parent) {
                    if (node = group.match(ancestor)) {
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
                while(ancestor = ancestor.parent) {
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
            } while((node !== bound.right) && (node = node.parent));
        }

        return mayMatch;
    }
}
export namespace Selector {
    // Non-spec. Selector sequences are grouped by ancestor then by child combinators for easier backtracking.
    export class ChildGroup {
        public dynamic: boolean;

        constructor(private selectors: SimpleSelector[]) {
            this.dynamic = selectors.some(sel => sel.dynamic);
        }

        public match(node: Node): Node {
            return this.selectors.every((sel, i) => (i === 0 ? node : node = node.parent) && sel.match(node)) ? node : null;
        }

        public mayMatch(node: Node): Node {
            return this.selectors.every((sel, i) => (i === 0 ? node : node = node.parent) && sel.mayMatch(node)) ? node : null;
        }

        public trackChanges(node: Node, map: ChangeAccumulator) {
            this.selectors.forEach((sel, i) => (i === 0 ? node : node = node.parent) && sel.trackChanges(node, map));
        }
    }
    export interface Bound {
        left: Node;
        right: Node;
    }
}

export class RuleSet {
    constructor(public selectors: SelectorCore[], private declarations: Declaration[]) {
        this.selectors.forEach(sel => sel.ruleset = this);
    }
    public toString(): string { return `${this.selectors.join(", ")} {${this.declarations.map((d, i) => `${i === 0 ? " ": ""}${d.property}: ${d.value}`).join("; ")} }`; }
    public lookupSort(sorter: LookupSorter): void { this.selectors.forEach(sel => sel.lookupSort(sorter)); }
}

export function fromAstNodes(astRules: cssParser.Node[]): RuleSet[] {
    return (<cssParser.Rule[]>astRules.filter(isRule)).map(rule => {
        let declarations = rule.declarations.filter(isDeclaration).map(createDeclaration);
        let selectors = rule.selectors.map(createSelector);
        let ruleset = new RuleSet(selectors, declarations);
        return ruleset;
    });
}

function createDeclaration(decl: cssParser.Declaration): any {
    return { property: decl.property.toLowerCase(), value: decl.value };
}

function createSelector(sel: string): SimpleSelector | SimpleSelectorSequence | Selector {
    try {
        let ast = selectorParser.parse(sel);
        if (ast.length === 0) {
            return new InvalidSelector(new Error("Empty selector"));
        }

        let selectors = ast.map(createSimpleSelector);
        let sequences: (SimpleSelector | SimpleSelectorSequence)[] = [];

        // Join simple selectors into sequences, set combinators
        for (let seqStart = 0, seqEnd = 0, last = selectors.length - 1; seqEnd <= last; seqEnd++) {
            let sel = selectors[seqEnd];
            let astComb = ast[seqEnd].comb;
            if (astComb || seqEnd === last) {
                if (seqStart === seqEnd) {
                    // This is a sequnce with single SimpleSelector, so we will not combine it into SimpleSelectorSequence.
                    sel.combinator = astComb;
                    sequences.push(sel);
                } else {
                    let sequence = new SimpleSelectorSequence(selectors.slice(seqStart, seqEnd + 1));
                    sequence.combinator = astComb;
                    sequences.push(sequence);
                }
                seqStart = seqEnd + 1;
            }
        }

        if (sequences.length === 1) {
            // This is a selector with a single SinmpleSelectorSequence so we will not combine it into Selector.
            return sequences[0];
        } else {
            return new Selector(sequences);
        }
    } catch(e) {
        return new InvalidSelector(e);
    }
}

function createSimpleSelector(sel: selectorParser.SimpleSelector): SimpleSelector {
    if (selectorParser.isUniversal(sel)) {
        return new UniversalSelector();
    } else if (selectorParser.isId(sel)) {
        return new IdSelector(sel.ident);
    } else if (selectorParser.isType(sel)) {
        return new TypeSelector(sel.ident.replace(/-/, '').toLowerCase());
    } else if (selectorParser.isClass(sel)) {
        return new ClassSelector(sel.ident);
    } else if (selectorParser.isPseudo(sel)) {
        return new PseudoClassSelector(sel.ident);
    } else if (selectorParser.isAttribute(sel)) {
        if (sel.test) {
            return new AttributeSelector(sel.prop, sel.test, sel.value);
        } else {
            return new AttributeSelector(sel.prop)
        }
    }
}

function isRule(node: cssParser.Node): node is cssParser.Rule {
    return node.type === "rule";
}
function isDeclaration(node: cssParser.Node): node is cssParser.Declaration {
    return node.type === "declaration";
}

interface SelectorInDocument {
    pos: number;
    sel: SelectorCore;
}
interface SelectorMap {
    [key: string]: SelectorInDocument[]
}
export class SelectorsMap<T extends Node> implements LookupSorter {
    private id: SelectorMap = {};
    private class: SelectorMap = {};
    private type: SelectorMap = {};
    private universal: SelectorInDocument[] = [];

    private position = 0;

    constructor(rulesets: RuleSet[]) {
        rulesets.forEach(rule => rule.lookupSort(this));
    }

    query(node: T): SelectorsMatch<T> {
        let selectorClasses = [
            this.universal,
            this.id[node.id],
            this.type[node.cssType]
        ];
        if (node.cssClasses) {
            node.cssClasses.forEach(c => selectorClasses.push(this.class[c]));
        }
        let selectors = selectorClasses
            .filter(arr => !!arr)
            .reduce((cur, next) => cur.concat(next), []);
        
        let selectorsMatch = new SelectorsMatch<T>();

        selectorsMatch.selectors = selectors
            .filter(sel => sel.sel.accumulateChanges(node, selectorsMatch))
            .sort((a, b) => a.sel.specificity - b.sel.specificity || a.pos - b.pos)
            .map(docSel => docSel.sel);

        return selectorsMatch;
    }

    sortById(id: string, sel: SelectorCore): void { this.addToMap(this.id, id, sel); }
    sortByClass(cssClass: string, sel: SelectorCore): void {
        this.addToMap(this.class, cssClass, sel);
    }
    sortByType(cssType: string, sel: SelectorCore): void {
        this.addToMap(this.type, cssType, sel);
    }
    sortAsUniversal(sel: SelectorCore): void { this.universal.push(this.makeDocSelector(sel)); }

    private addToMap(map: SelectorMap, head: string, sel: SelectorCore): void {
        this.position++;
        let list = map[head];
        if (list) {
            list.push(this.makeDocSelector(sel));
        } else {
            map[head] = [this.makeDocSelector(sel)];
        }
    }

    private makeDocSelector(sel: SelectorCore): SelectorInDocument {
        return { sel, pos: this.position++ };
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

    private properties(node: T): Changes {
        let set = this.changeMap.get(node);
        if (!set) {
            this.changeMap.set(node, set = {});
        }
        return set;
    }
}
