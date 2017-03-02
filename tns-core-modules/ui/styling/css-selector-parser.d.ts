//@private
export interface SimpleSelector {
    pos: number;
    type: "" | "*" | "#" | "." | ":" | "[]";
    comb?: "+" | "~" | ">" | " ";
}
export interface SimpleIdentifierSelector extends SimpleSelector {
    ident: string;
}
export interface UniversalSelector extends SimpleSelector {
    type: "*";
}
export interface TypeSelector extends SimpleIdentifierSelector {
    type: "";
}
export interface ClassSelector extends SimpleIdentifierSelector {
    type: ".";
}
export interface IdSelector extends SimpleIdentifierSelector {
    type: "#";
}
export interface PseudoClassSelector extends SimpleIdentifierSelector {
    type: ":";
}
export interface AttributeSelector extends SimpleSelector {
    type: "[]";
    prop: string;
    test?: "=" | "^=" | "$=" | "*=" | "=" | "~=" | "|=";
    value?: string;
}
export function isUniversal(sel: SimpleSelector): sel is UniversalSelector;
export function isType(sel: SimpleSelector): sel is TypeSelector;
export function isClass(sel: SimpleSelector): sel is ClassSelector;
export function isId(sel: SimpleSelector): sel is IdSelector;
export function isPseudo(sel: SimpleSelector): sel is PseudoClassSelector;
export function isAttribute(sel: SimpleSelector): sel is AttributeSelector;
export function parse(selector: string): SimpleSelector[];
