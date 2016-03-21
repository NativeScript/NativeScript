import view = require("ui/core/view");
import trace = require("trace");
import cssSelector = require("ui/styling/css-selector");
import cssParser = require("css");
import application = require("application");
import * as typesModule from "utils/types";
import * as utilsModule from "utils/utils";
import * as fileSystemModule from "file-system";
import * as visualStateModule from "./visual-state";
import keyframeAnimation = require("ui/animation/keyframe-animation");
import cssAnimationParser = require("./css-animation-parser");

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
    private _cssSelectors: Array<cssSelector.CssSelector>;
    private _keyframes = {};

    get css(): string {
        return this._css;
    }

    set css(value: string) {
        this._css = value;
        this._cssFileName = undefined;
        this._cssSelectors = undefined;
        this._reset();
    }

    public addCss(cssString: string, cssFileName: string): void {
        this._css = this._css ? this._css + cssString : cssString;
        this._cssFileName = cssFileName;

        this._reset();

        if (!this._cssSelectors) {
            // Always add app.css when initializing selectors
            if (application.cssSelectorsCache) {
                this._cssSelectors = StyleScope._joinCssSelectorsArrays([application.cssSelectorsCache]);
            }
            else {
                this._cssSelectors = new Array<cssSelector.CssSelector>();
            }
        }

        let selectorsFromFile = StyleScope.createSelectorsFromCss(cssString, cssFileName, this._keyframes);
        this._cssSelectors = StyleScope._joinCssSelectorsArrays([this._cssSelectors, selectorsFromFile]);

        this._applyKeyframesOnSelectors();
    }

    public removeSelectors(selectorExpression: string) {
        for (let i = this._cssSelectors.length - 1; i >= 0; i--) {
            let selector = this._cssSelectors[i];
            if (selector.expression === selectorExpression) {
                this._cssSelectors.splice(i, 1);
            }
        }
    }

    public getKeyframeAnimationWithName(animationName: string): keyframeAnimation.KeyframeAnimationInfo {
        let keyframes = this._keyframes[animationName];
        if (keyframes !== undefined) {
            let animation = new keyframeAnimation.KeyframeAnimationInfo();
            animation.keyframes = cssAnimationParser.CssAnimationParser.keyframesArrayFromCSS(keyframes);
            return animation;
        }
        return undefined;
    }

    public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): cssSelector.CssSelector[] {
        try {
            let pageCssSyntaxTree = css ? cssParser.parse(css, { source: cssFileName }) : null;
            let pageCssSelectors = new Array<cssSelector.CssSelector>();
            if (pageCssSyntaxTree) {
                pageCssSelectors = StyleScope._joinCssSelectorsArrays([pageCssSelectors, StyleScope.createSelectorsFromImports(pageCssSyntaxTree, keyframes)]);
                pageCssSelectors = StyleScope._joinCssSelectorsArrays([pageCssSelectors, StyleScope.createSelectorsFromSyntaxTree(pageCssSyntaxTree, keyframes)]);
            }
            return pageCssSelectors;
        }
        catch (e) {
            trace.write("Css styling failed: " + e, trace.categories.Error, trace.messageType.error);
        }
    }

    public static createSelectorsFromImports(tree: cssParser.SyntaxTree, keyframes: Object): cssSelector.CssSelector[] {
        let selectors = new Array<cssSelector.CssSelector>();
        ensureTypes();

        if (!types.isNullOrUndefined(tree)) {
            let imports = tree["stylesheet"]["rules"].filter(r=> r.type === "import");

            for (let i = 0; i < imports.length; i++) {
                let importItem = imports[i]["import"];

                let match = importItem && (<string>importItem).match(pattern);
                let url = match && match[2];

                if (!types.isNullOrUndefined(url)) {
                    ensureUtils();

                    if (utils.isFileOrResourcePath(url)) {
                        ensureFS();

                        let fileName = types.isString(url) ? url.trim() : "";
                        if (fileName.indexOf("~/") === 0) {
                            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
                        }

                        if (fs.File.exists(fileName)) {
                            let file = fs.File.fromPath(fileName);
                            let text = file.readTextSync();
                            if (text) {
                                selectors = StyleScope._joinCssSelectorsArrays([selectors, StyleScope.createSelectorsFromCss(text, fileName, keyframes)]);
                            }
                        }
                    }
                }
            }
        }

        return selectors;
    }

    public ensureSelectors() {
        if (!this._cssSelectors && (this._css || application.cssSelectorsCache)) {
            let applicationCssSelectors = application.cssSelectorsCache ? application.cssSelectorsCache : null;
            let pageCssSelectors = StyleScope.createSelectorsFromCss(this._css, this._cssFileName, this._keyframes);
            this._cssSelectors = StyleScope._joinCssSelectorsArrays([applicationCssSelectors, pageCssSelectors]);
            this._applyKeyframesOnSelectors();
        }
    }

    private static _joinCssSelectorsArrays(arrays: Array<Array<cssSelector.CssSelector>>): Array<cssSelector.CssSelector> {
        let mergedResult = [];
        let i;
        for (i = 0; i < arrays.length; i++) {
            if (arrays[i]) {
                mergedResult.push.apply(mergedResult, arrays[i]);
            }
        }
        mergedResult.sort((a, b) => a.specificity - b.specificity);

        return mergedResult;
    }

    public applySelectors(view: view.View) {
        if (!this._cssSelectors) {
            return;
        }

        view.style._beginUpdate();
        let i,
            selector: cssSelector.CssSelector,
            matchedStateSelectors = new Array<cssSelector.CssVisualStateSelector>()

        // Go trough all selectors - and directly apply all non-state selectors
        for (i = 0; i < this._cssSelectors.length; i++) {
            selector = this._cssSelectors[i];
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
            let key: string = "";
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
        let key = this._viewIdToKey[view._domId];
        if (key === undefined) {
            return undefined;
        }

        return this._statesByKey[key];
    }

    private _createVisualsStatesForSelectors(key: string, matchedStateSelectors: Array<cssSelector.CssVisualStateSelector>) {
        let i,
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

            // add all stateSelectors instead of adding setters
            if (stateSelector.animations && stateSelector.animations.length > 0) {
                visualState.animations.push(stateSelector);
            }
            else {
                stateSelector.eachSetter((property, value) => {
                    visualState.setters[property.name] = value;
                });
            }
        }
    }

    private static createSelectorsFromSyntaxTree(ast: cssParser.SyntaxTree, keyframes: Object): Array<cssSelector.CssSelector> {
        let result: Array<cssSelector.CssSelector> = [];
        let rules = ast.stylesheet.rules;
        let rule: cssParser.Rule;
        let i;
        let j;

        // Create selectors form AST
        for (i = 0; i < rules.length; i++) {
            rule = rules[i];
            // Skip comment nodes.
            if (rule.type === "rule") {

                // Filter comment nodes.
                let filteredDeclarations = [];
                if (rule.declarations) {
                    for (j = 0; j < rule.declarations.length; j++) {
                        let declaration = rule.declarations[j];
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
            }
            else if (rule.type === "keyframes") {
                keyframes[(<any>rule).name] = rule;
            }
        }

        return result;
    }

    private _reset() {
        this._statesByKey = {};
        this._viewIdToKey = {};
    }

    private _applyKeyframesOnSelectors() {
        for (let i = this._cssSelectors.length - 1; i >= 0; i --) {
            let selector = this._cssSelectors[i];
            if (selector.animations !== undefined) {
                for (let animation of selector.animations) {
                    let keyframe = this._keyframes[animation.name];
                    if (keyframe !== undefined) {
                        animation.keyframes = cssAnimationParser.CssAnimationParser.keyframesArrayFromCSS(keyframe);
                    }
                }
            }
        }
    }
}

export function applyInlineSyle(view: view.View, style: string) {
    try {
        let syntaxTree = cssParser.parse("local { " + style + " }", undefined);
        let filteredDeclarations = syntaxTree.stylesheet.rules[0].declarations.filter((val, i, arr) => { return val.type === "declaration" });
        cssSelector.applyInlineSyle(view, filteredDeclarations);
    } catch (ex) {
        trace.write("Applying local style failed: " + ex, trace.categories.Error, trace.messageType.error);
    }
}
