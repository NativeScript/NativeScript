declare module "ui/styling/css-selector" {
    import * as parser from "css";

    /**
     * An interface describing the shape of a type on which the selectors may apply.
     * Note, the ui/core/view.View implements Node.
     */
    interface Node {
        parent?: Node;

        id?: string;
        cssType?: string;
        cssClasses?: Set<string>;
        cssPseudoClasses?: Set<string>;
    }

    interface Declaration {
        property: string;
        value: string;
    }

    class SelectorCore {
        /**
         * Dynamic selectors depend on attributes and pseudo classes.
         */
        dynamic: boolean;
        match(node: Node): boolean;
        ruleset: RuleSet;
    }

    class RuleSet {
        /**
         * Gets the selectors in this ruleset's selector group.
         */
        selectors: SelectorCore[];

        /**
         * Gets the key-value list of declarations for the ruleset.
         */
        declarations: Declaration[];
    }

    class SelectorsMap {
        constructor(rules: RuleSet[]);

        /**
         * Get a list of selectors that are likely to match the node.
         */
        query<T extends Node>(node: T): SelectorsMatch<T>;
    }

    type ChangeMap<T extends Node> = Map<T, Changes>;

    interface Changes {
        attributes?: Set<string>;
        pseudoClasses?: Set<string>;
    }

    class SelectorsMatch<T extends Node> {
        /**
         * Gets the static selectors that match the queried node and the dynamic selectors that may potentially match the queried node.
         */
        selectors: SelectorCore[];

        /**
         * Gets a map of nodes to attributes and pseudo classes, that may affect the state of the dynamic 
         */
        changeMap: ChangeMap<T>;
    }

    export function fromAstNodes(astRules: parser.Node[]): RuleSet[];
}
