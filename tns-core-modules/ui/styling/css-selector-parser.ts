/// <reference path="./css-selector-parser.d.ts" />
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

export function isUniversal(sel: SimpleSelector): sel is UniversalSelector {
    return sel.type === "*";
}
export function isType(sel: SimpleSelector): sel is TypeSelector {
    return sel.type === "";
}
export function isClass(sel: SimpleSelector): sel is ClassSelector {
    return sel.type === ".";
}
export function isId(sel: SimpleSelector): sel is IdSelector {
    return sel.type === "#";
}
export function isPseudo(sel: SimpleSelector): sel is PseudoClassSelector {
    return sel.type === ":";
}
export function isAttribute(sel: SimpleSelector): sel is AttributeSelector {
    return sel.type === "[]";
}

var regex = /(\s*)(?:(\*)|(#|\.|:|\b)([_-\w][_-\w\d]*)|\[\s*([_-\w][_-\w\d]*)\s*(?:(=|\^=|\$=|\*=|\~=|\|=)\s*(?:([_-\w][_-\w\d]*)|"((?:[^\\"]|\\(?:"|n|r|f|\\|0-9a-f))*)"|'((?:[^\\']|\\(?:'|n|r|f|\\|0-9a-f))*)')\s*)?\])(?:\s*(\+|~|>|\s))?/g;
// no lead ws     univ   type pref and ident          [    prop                   =                            ident    -or-    "string escapes \" \00aaff"    -or-   'string    escapes \' urf-8: \00aaff'       ]        combinator

export function parse(selector: string): SimpleSelector[] {
    let selectors: any[] = [];

    var result: RegExpExecArray;
    var lastIndex = regex.lastIndex = 0;
    while(result = regex.exec(selector)) {
        let pos = result.index;
        if (lastIndex !== pos) {
            throw new Error(`Unexpected characters at index, near: ${lastIndex}: ${result.input.substr(lastIndex, 32)}`);
        } else if (!result[0] || result[0].length === 0) {
            throw new Error(`Last selector match got zero character result at index ${lastIndex}, near: ${result.input.substr(lastIndex, 32)}`);
        }
        pos += getLeadingWhiteSpace(result).length;
        lastIndex = regex.lastIndex;

        var type = getType(result);
        let selector: SimpleSelector | SimpleIdentifierSelector | AttributeSelector;
        switch(type) {
            case "*":
                selector = { pos, type };
                break;
            case "#":
            case ".":
            case ":":
            case "":
                let ident = getIdentifier(result);
                selector = { pos, type, ident };
                break;
            case "[]":
                let prop = getProperty(result);
                let test = getPropertyTest(result);
                // TODO: Unescape escape sequences. Unescape UTF-8 characters.
                let value = getPropertyValue(result);
                selector = test ? { pos, type, prop, test, value } : { pos, type, prop };
                break;
            default:
                throw new Error("Unhandled type.");
        }

        let comb = getCombinator(result);
        if (comb) {
            selector.comb = comb;
        }
        selectors.push(selector);
    }

    if (selectors.length > 0) {
        delete selectors[selectors.length - 1].comb;
    }
    return selectors;
}
function getLeadingWhiteSpace(result: RegExpExecArray): string {
    return result[1] || "";
}
function getType(result: RegExpExecArray): "" | "*" | "." | "#" | ":" | "[]" {
    return <"[]">(result[5] && "[]") || <"*">result[2] || <"" | "." | "#" | ":">result[3];
}
function getIdentifier(result: RegExpExecArray): string {
    return result[4];
}
function getProperty(result: RegExpExecArray): string {
    return result[5];
}
function getPropertyTest(result: RegExpExecArray): string {
    return result[6] || undefined;
}
function getPropertyValue(result: RegExpExecArray): string {
    return result[7] || result[8] || result[9];
}
function getCombinator(result: RegExpExecArray): "+" | "~" | ">" | " " {
    return <("+" | "~" | ">" | " ")>result[result.length - 1] || undefined;
}
