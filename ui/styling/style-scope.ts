import view = require("ui/core/view");
import trace = require("trace");
import cssSelector = require("ui/styling/css-selector");
import cssParser = require("css");
import application = require("application");
import * as typesModule from "utils/types";
import * as utilsModule from "utils/utils";
import * as fileSystemModule from "file-system";
import * as visualStateModule from "./visual-state";

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

var utils: typeof utilsModule;
function ensureUtils() {
    if (!utils) {
        utils = require("utils/utils");
    }
}

var fs: typeof fileSystemModule;
function ensureFS() {
    if (!fs) {
        fs = require("file-system");
    }
}

var vs: typeof visualStateModule;
function ensureVisualState() {
    if (!vs) {
        vs = require("./visual-state");
    }
}

var pattern: RegExp = /('|")(.*?)\1/;

export class StyleScope {
    // caches all the visual states by the key of the visual state selectors
    private _statesByKey = {};
    private _viewIdToKey = {};

    private _css: string;
    private _cssFileName: string;
    private _mergedCssSelectors: Array<cssSelector.CssSelector>;
    private _localCssSelectors: Array<cssSelector.CssSelector> = [];
    private _localCssSelectorVersion: number = 0;
    private _localCssSelectorsAppliedVersion: number = 0;
    private _applicationCssSelectorsAppliedVersion: number = 0;

    get css(): string {
        return this._css;
    }
    set css(value: string) {
        this._cssFileName = undefined;
        this.setCss(value);
    }

    public addCss(cssString: string, cssFileName?: string): void {
        this.setCss(cssString, cssFileName, true);
    }

    private setCss(cssString: string, cssFileName?: string, append: boolean = false): void {
        this._css = this._css ? this._css + cssString : cssString;
        if (cssFileName) {
            this._cssFileName = cssFileName
        }

        this._reset();

        const parsedSelectors = StyleScope.createSelectorsFromCss(cssString, cssFileName);
        if (append) {
            this._localCssSelectors.push.apply(this._localCssSelectors, parsedSelectors);
        } else {
            this._localCssSelectors = parsedSelectors;
        }

        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    public static createSelectorsFromCss(css: string, cssFileName: string): cssSelector.CssSelector[] {
        try {
            var pageCssSyntaxTree = css ? cssParser.parse(css, { source: cssFileName }) : null;

            var pageCssSelectors = new Array<cssSelector.CssSelector>();

            if (pageCssSyntaxTree) {
                pageCssSelectors = StyleScope._joinCssSelectorsArrays([pageCssSelectors, StyleScope.createSelectorsFromImports(pageCssSyntaxTree)]);
                pageCssSelectors = StyleScope._joinCssSelectorsArrays([pageCssSelectors, StyleScope.createSelectorsFromSyntaxTree(pageCssSyntaxTree)]);
            }

            return pageCssSelectors;
        } catch (e) {
            trace.write("Css styling failed: " + e, trace.categories.Error, trace.messageType.error);
        }
    }

    public static createSelectorsFromImports(tree: cssParser.SyntaxTree): cssSelector.CssSelector[] {
        var selectors = new Array<cssSelector.CssSelector>();
        ensureTypes();

        if (!types.isNullOrUndefined(tree)) {
            var imports = tree["stylesheet"]["rules"].filter(r=> r.type === "import");

            for (var i = 0; i < imports.length; i++) {
                var importItem = imports[i]["import"];

                var match = importItem && (<string>importItem).match(pattern);
                var url = match && match[2];

                if (!types.isNullOrUndefined(url)) {
                    ensureUtils();

                    if (utils.isFileOrResourcePath(url)) {
                        ensureFS();

                        var fileName = types.isString(url) ? url.trim() : "";
                        if (fileName.indexOf("~/") === 0) {
                            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
                        }

                        if (fs.File.exists(fileName)) {
                            var file = fs.File.fromPath(fileName);
                            var text = file.readTextSync();
                            if (text) {
                                selectors = StyleScope._joinCssSelectorsArrays([selectors, StyleScope.createSelectorsFromCss(text, fileName)]);
                            }
                        }
                    }
                }
            }
        }

        return selectors;
    }

    public ensureSelectors(): boolean {
        let toMerge = []
        if ((this._applicationCssSelectorsAppliedVersion !== application.cssSelectorVersion) ||
            (this._localCssSelectorVersion !== this._localCssSelectorsAppliedVersion) ||

            (!this._mergedCssSelectors)) {
            toMerge.push(application.cssSelectors);
            this._applicationCssSelectorsAppliedVersion = application.cssSelectorVersion;
            toMerge.push(this._localCssSelectors);
            this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;
        }

        if (toMerge.length > 0) {
            this._mergedCssSelectors = StyleScope._joinCssSelectorsArrays(toMerge);
            return true;
        } else {
            return false;
        }
    }

    private static _joinCssSelectorsArrays(arrays: Array<Array<cssSelector.CssSelector>>): Array<cssSelector.CssSelector> {
        var mergedResult = [];
        var i;
        for (i = 0; i < arrays.length; i++) {
            if (arrays[i]) {
                mergedResult.push.apply(mergedResult, arrays[i]);
            }
        }
        mergedResult.sort((a, b) => a.specificity - b.specificity);

        return mergedResult;
    }

    public applySelectors(view: view.View) {
        this.ensureSelectors();

        view.style._beginUpdate();

        var i,
            selector: cssSelector.CssSelector,
            matchedStateSelectors = new Array<cssSelector.CssVisualStateSelector>()

        // Go trough all selectors - and directly apply all non-state selectors
        for (i = 0; i < this._mergedCssSelectors.length; i++) {
            selector = this._mergedCssSelectors[i];
            if (selector.matches(view)) {
                if (selector instanceof cssSelector.CssVisualStateSelector) {
                    matchedStateSelectors.push(<cssSelector.CssVisualStateSelector>selector);
                } else {
                    selector.apply(view);
                }
            }
        }

        if (matchedStateSelectors.length > 0) {
            // Create a key for all matched selectors for this element
            var key: string = "";
            matchedStateSelectors.forEach((s) => key += s.key + "|");

            // Associate the view to the created key
            this._viewIdToKey[view._domId] = key;

            // Create visual states for this key if there aren't already created
            if (!this._statesByKey[key]) {
                this._createVisualsStatesForSelectors(key, matchedStateSelectors);
            }
        }

        view.style._endUpdate();
    }

    public getVisualStates(view: view.View): Object {
        var key = this._viewIdToKey[view._domId];
        if (key === undefined) {
            return undefined;
        }

        return this._statesByKey[key];
    }

    private _createVisualsStatesForSelectors(key: string, matchedStateSelectors: Array<cssSelector.CssVisualStateSelector>) {
        var i,
            allStates = {},
            stateSelector: cssSelector.CssVisualStateSelector;

        this._statesByKey[key] = allStates;
        ensureVisualState();

        for (i = 0; i < matchedStateSelectors.length; i++) {
            stateSelector = matchedStateSelectors[i];

            var visualState = allStates[stateSelector.state];
            if (!visualState) {
                visualState = new vs.VisualState();
                allStates[stateSelector.state] = visualState;
            }

            stateSelector.eachSetter((property, value) => {
                visualState.setters[property.name] = value;
            });
        }
    }

    private static createSelectorsFromSyntaxTree(ast: cssParser.SyntaxTree): Array<cssSelector.CssSelector> {
        var result: Array<cssSelector.CssSelector> = [];

        var rules = ast.stylesheet.rules;
        var rule: cssParser.Rule;
        var i;
        var j;

        // Create selectors form AST
        for (i = 0; i < rules.length; i++) {
            rule = rules[i];
            // Skip comment nodes.
            if (rule.type === "rule") {

                // Filter comment nodes.
                var filteredDeclarations = [];
                if (rule.declarations) {
                    for (j = 0; j < rule.declarations.length; j++) {
                        var declaration = rule.declarations[j];
                        if (declaration.type === "declaration") {
                            filteredDeclarations.push({
                                property: declaration.property.toLowerCase(),
                                value: declaration.value
                            });
                        }
                    }
                }

                    for (j = 0; j < rule.selectors.length; j++) {
                        result.push(cssSelector.createSelector(rule.selectors[j], filteredDeclarations));
                    }
                //}
            }
        }

        return result;
    }

    private _reset() {
        this._statesByKey = {};
        this._viewIdToKey = {};
    }
}

export function applyInlineSyle(view: view.View, style: string) {
    try {
        var syntaxTree = cssParser.parse("local { " + style + " }", undefined);
        var filteredDeclarations = syntaxTree.stylesheet.rules[0].declarations.filter((val, i, arr) => { return val.type === "declaration" });
        cssSelector.applyInlineSyle(view, filteredDeclarations);
    } catch (ex) {
        trace.write("Applying local style failed: " + ex, trace.categories.Error, trace.messageType.error);
    }
}
