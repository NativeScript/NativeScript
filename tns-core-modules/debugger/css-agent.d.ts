export interface CSSProperty {
    name: string;
    value: string;
    disabled: boolean;
}
export interface ShorthandEntry {
    name: string;
    value: string;
}
export interface CSSStyle {
    cssProperties: CSSProperty[];
    shorthandEntries: ShorthandEntry[];
    cssText?: string;
}
export interface Value {
    text: string;
}
export interface SelectorList {
    selectors: Value[];
    text: string;
}
export interface CSSRule {
    selectorList: SelectorList;
    origin: string;
    style: CSSStyle;
    styleSheetId?: string;
}
export interface RuleMatch {
    rule: CSSRule;
    matchingSelectors: number[];
}
export interface InheritedStyleEntry {
    matchedCSSRules: RuleMatch[];
    inlineStyle?: CSSStyle;
}
export interface CSSComputedStyleProperty {
    name: string;
    value: string;
}
export interface PlatformFontUsage {
    familyName: string;
    glyphCount: number;
    isCustomFont: boolean;
}
export interface CSSStyleSheetHeader {
    styleSheetId: string;
    frameId: string;
    sourceUrl: string;
    origin: string;
    title: string;
    disabled: boolean;
    isInLine: boolean;
    startLine: number;
    startColumn: number;
}
export interface PseudoElementMatches {
    pseudoType: string;
    matches: RuleMatch[];
}
