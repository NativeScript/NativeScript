/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export declare class CssSelector {
    element: string;
    classNames: List<any>;
    attrs: List<any>;
    static parse(selector: string): CssSelector;
    constructor();
    setElement(element?: string): void;
    addAttribute(name: string, value?: string): void;
    addClassName(name: string): void;
    toString(): string;
}
/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export declare class SelectorMatcher {
    _elementMap: Map<any, any>;
    _elementPartialMap: Map<any, any>;
    _classMap: Map<any, any>;
    _classPartialMap: Map<any, any>;
    _attrValueMap: Map<any, any>;
    _attrValuePartialMap: Map<any, any>;
    constructor();
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param selectable An opaque object that will be given to the callback of the `match` function
     */
    addSelectable(cssSelector: CssSelector, selectable: any): void;
    _addTerminal(map: Map<string, string>, name: string, selectable: any): void;
    _addPartial(map: Map<string, string>, name: string): any;
    /**
     * Find the objects that have been added via `addSelectable`
     * whose css selector is contained in the given css selector.
     * @param cssSelector A css selector
     * @param matchedCallback This callback will be called with the object handed into `addSelectable`
    */
    match(cssSelector: CssSelector, matchedCallback: Function): void;
    _matchTerminal(map?: Map<string, string>, name?: any, matchedCallback?: any): void;
    _matchPartial(map?: Map<string, string>, name?: any, cssSelector?: any, matchedCallback?: any): void;
}
