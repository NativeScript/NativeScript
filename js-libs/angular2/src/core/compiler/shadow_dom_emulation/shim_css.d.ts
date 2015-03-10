export declare function shimCssText(css: string, tag: string): string;
export declare class CssShim {
    _tag: string;
    _attr: string;
    constructor(tag: string);
    shimCssText(css: string): string;
    convertColonHost(css: string): string;
    cssToRules(css: string): List<_Rule>;
    scopeRules(rules: List<_Rule>): string;
    extractContent(rule: _Rule): string;
    ruleToString(rule: _Rule): string;
    scopeStrictMode(rule: _Rule): string;
    scopeNonStrictMode(rule: _Rule): string;
    scopeSelector(selector: string, strict: boolean): any;
    replaceCombinators(selector: string): string;
    scopeSimpleSelector(selector: string, strict: boolean): string;
    replaceColonSelectors(css: string): string;
    insertTagToEverySelectorPart(selector: string): string;
    insertAttrSuffixIntoSelectorPart(p: string): string;
    insertAttr(selector: string): string;
    handleIsSelector(selector: string): string;
}
export declare class _Rule {
    selectorText: string;
    body: string;
    rules: List<_Rule>;
    constructor(selectorText: string, body: string, rules: List<_Rule>);
    hasNestedRules(): boolean;
}
