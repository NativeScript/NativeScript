/**
 * @module "ui/styling/css-selector"
 */ /** */

import { Node as ParserNode } from "../../../css";

/**
 * An interface describing the shape of a type on which the selectors may apply.
 * Note, the ui/core/view.View implements Node.
 */
export interface Node {
    parent?: Node;

    id?: string;
    cssType?: string;
    cssClasses?: Set<string>;
    cssPseudoClasses?: Set<string>;
    getChildIndex?(node: Node): number
    getChildAt?(index: number): Node
}

export interface Declaration {
    property: string;
    value: string;
}

export interface SelectorCore {
    /**
     * Dynamic selectors depend on attributes and pseudo classes.
     */
    dynamic: boolean;
    match(node: Node): boolean;
    ruleset: RuleSet;
}

export class RuleSet {
    /**
     * Gets the selectors in this ruleset's selector group.
     */
    selectors: SelectorCore[];

    /**
     * Gets the key-value list of declarations for the ruleset.
     */
    declarations: Declaration[];

    /**
     *  Optional Tag for rules
     **/
    tag: string | Number;
}

export class SelectorsMap {
    constructor(rules: RuleSet[]);

    /**
     * Get a list of selectors that are likely to match the node.
     */
    query<T extends Node>(node: T): SelectorsMatch<T>;
}

export type ChangeMap<T extends Node> = Map<T, Changes>;

export interface Changes {
    attributes?: Set<string>;
    pseudoClasses?: Set<string>;
}

export class SelectorsMatch<T extends Node> {
    /**
     * Gets the static selectors that match the queried node and the dynamic selectors that may potentially match the queried node.
     */
    selectors: SelectorCore[];

    /**
     * Gets a map of nodes to attributes and pseudo classes, that may affect the state of the dynamic
     */
    changeMap: ChangeMap<T>;
}

export function fromAstNodes(astRules: ParserNode[]): RuleSet[];

export function createSelector(sel: string): SelectorCore;
