import view = require("ui/core/view");
import trace = require("trace");
import cssSelector = require("ui/styling/css-selector");
import cssParser = require("css");
import application = require("application");
import * as typesModule from "utils/types";
import * as fileSystemModule from "file-system";

import keyframeAnimation = require("ui/animation/keyframe-animation");
import cssAnimationParser = require("./css-animation-parser");
import observable = require("ui/core/dependency-observable");

import { convertString } from "utils/utils";
import { RuleSet, Node, SelectorsMap, SelectorCore, SelectorsMatch, ChangeMap } from "ui/styling/css-selector";
import { StyleProperty, withStyleProperty } from "ui/styling/style-property";
import { getSpecialPropertySetter } from "ui/builder/special-properties";

const animationsSymbol: symbol = Symbol("animations");

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

var fs: typeof fileSystemModule;
function ensureFS() {
    if (!fs) {
        fs = require("file-system");
    }
}

var pattern: RegExp = /('|")(.*?)\1/;

export class CssState {
    constructor(private view: view.View, private match: SelectorsMatch<view.View>) {
    }

    public get changeMap(): ChangeMap<view.View> {
        return this.match.changeMap;
    }

    public apply(): void {
        this.view.style._resetCssValues();
        let matchingSelectors = this.match.selectors.filter(sel => sel.dynamic ? sel.match(this.view) : true);
        matchingSelectors.forEach(s => applyDescriptors(this.view, s.ruleset));
    }
}

export class StyleScope {

    private _selectors: SelectorsMap;

    // caches all the visual states by the key of the visual state selectors
    private _statesByKey = {};
    private _viewIdToKey = {};

    private _css: string;
    private _cssFileName: string;
    private _mergedCssSelectors: cssSelector.RuleSet[];
    private _localCssSelectors: cssSelector.RuleSet[] = [];
    private _localCssSelectorVersion: number = 0;
    private _localCssSelectorsAppliedVersion: number = 0;
    private _applicationCssSelectorsAppliedVersion: number = 0;
    private _keyframes = {};

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
        this._css = this._css && append ? this._css + cssString : cssString;
        if (cssFileName) {
            this._cssFileName = cssFileName;
        }

        this._reset();

        const parsedSelectors = StyleScope.createSelectorsFromCss(this._css, cssFileName, this._keyframes);

        if (append) {
            this._localCssSelectors.push.apply(this._localCssSelectors, parsedSelectors);
        } else {
            this._localCssSelectors = parsedSelectors;
        }

        this._localCssSelectorVersion++;
        this.ensureSelectors();
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

    public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): cssSelector.RuleSet[] {
        try {
            let pageCssSyntaxTree = css ? cssParser.parse(css, { source: cssFileName }) : null;
            let pageCssSelectors: cssSelector.RuleSet[] = [];
            if (pageCssSyntaxTree) {
                pageCssSelectors = pageCssSelectors.concat(StyleScope.createSelectorsFromImports(pageCssSyntaxTree, keyframes));
                pageCssSelectors = pageCssSelectors.concat(StyleScope.createSelectorsFromSyntaxTree(pageCssSyntaxTree, keyframes));
            }
            return pageCssSelectors;
        } catch (e) {
            trace.write("Css styling failed: " + e, trace.categories.Error, trace.messageType.error);
        }
    }

    public static createSelectorsFromImports(tree: cssParser.SyntaxTree, keyframes: Object): cssSelector.RuleSet[] {
        let selectors: cssSelector.RuleSet[] = [];
        ensureTypes();

        if (!types.isNullOrUndefined(tree)) {
            let imports = tree["stylesheet"]["rules"].filter(r => r.type === "import");

            for (let i = 0; i < imports.length; i++) {
                let importItem = imports[i]["import"];

                let match = importItem && (<string>importItem).match(pattern);
                let url = match && match[2];

                if (!types.isNullOrUndefined(url)) {
                    ensureFS();

                    let appDirectory = fs.knownFolders.currentApp().path;
                    let fileName = resolveFileNameFromUrl(url, appDirectory, fs.File.exists);

                    if (fileName !== null) {
                        let file: fileSystemModule.File = fs.File.fromPath(fileName);
                        let text = file.readTextSync();
                        if (text) {
                            selectors = selectors.concat(StyleScope.createSelectorsFromCss(text, fileName, keyframes));
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
            for (let keyframe in application.keyframes) {
                this._keyframes[keyframe] = application.keyframes[keyframe];
            }
        }

        if (toMerge.length > 0) {
            this._mergedCssSelectors = toMerge.filter(m => !!m).reduce((merged, next) => merged.concat(next), []);
            this._applyKeyframesOnSelectors();
        } else {
            return false;
        }

        this._selectors = new SelectorsMap(this._mergedCssSelectors);

        return true;
    }

    public applySelectors(view: view.View): void {
        this.ensureSelectors();

        let state = this._selectors.query(view);

        let nextState = new CssState(view, state);
        view._setCssState(nextState);
    }

    public query(node: Node): SelectorCore[] {
        this.ensureSelectors();
        return this._selectors.query(node).selectors;
    }

    private static createSelectorsFromSyntaxTree(ast: cssParser.SyntaxTree, keyframes: Object): RuleSet[] {
        let nodes = ast.stylesheet.rules;
        (<cssParser.Keyframes[]>nodes.filter(isKeyframe)).forEach(node => keyframes[node.name] = node);

        let rulesets = cssSelector.fromAstNodes(nodes);
        rulesets.forEach(rule => rule[animationsSymbol] = cssAnimationParser.CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations));

        return rulesets;
    }

    private _reset() {
        this._statesByKey = {};
        this._viewIdToKey = {};
    }

    private _applyKeyframesOnSelectors() {
        for (let i = this._mergedCssSelectors.length - 1; i >= 0; i--) {
            let ruleset = this._mergedCssSelectors[i];
            let animations = ruleset[animationsSymbol];
            if (animations !== undefined) {
                for (let animation of animations) {
                    let keyframe = this._keyframes[animation.name];
                    if (keyframe !== undefined) {
                        animation.keyframes = cssAnimationParser.CssAnimationParser.keyframesArrayFromCSS(keyframe);
                    }
                }
            }
        }
    }

    public getAnimations(ruleset: RuleSet): keyframeAnimation.KeyframeAnimationInfo[] {
        return ruleset[animationsSymbol];
    }
}

export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (string) => boolean): string {
    let fileName: string = types.isString(url) ? url.trim() : "";

    if (fileName.indexOf("~/") === 0) {
        fileName = fileName.replace("~/", "");
    }

    let local = fs.path.join(appDirectory, fileName);
    if (fileExists(local)) {
        return local;
    }

    let external = fs.path.join(appDirectory, "tns_modules", fileName);
    if (fileExists(external)) {
        return external;
    }

    return null;
}

export function applyInlineSyle(view: view.View, style: string) {
    try {
        let syntaxTree = cssParser.parse("local { " + style + " }", undefined);
        let filteredDeclarations = <cssParser.Declaration[]>(<cssParser.Rule[]>syntaxTree.stylesheet.rules.filter(isRule))[0].declarations.filter(isDeclaration);
        applyInlineStyle(view, filteredDeclarations);
    } catch (ex) {
        trace.write("Applying local style failed: " + ex, trace.categories.Error, trace.messageType.error);
    }
}

function isRule(node: cssParser.Node): node is cssParser.Rule {
    return node.type === "rule";
}
function isDeclaration(node: cssParser.Node): node is cssParser.Declaration {
    return node.type === "declaration";
}
function isKeyframe(node: cssParser.Node): node is cssParser.Keyframes {
    return node.type === "keyframes";
}

function applyDescriptors(view: view.View, ruleset: RuleSet): void {
    let modifier = observable.ValueSource.Css;

    ruleset.declarations.forEach(d => withStyleProperty(d.property, d.value, (property, value) => {
        if (types.isString(property)) {
            const propertyName = <string>property;
            let attrHandled = false;
            let specialSetter = getSpecialPropertySetter(propertyName);

            if (!attrHandled && specialSetter) {
                specialSetter(view, value);
                attrHandled = true;
            }

            if (!attrHandled && propertyName in view) {
                view[propertyName] = convertString(value);
            }
        } else {
            const resolvedProperty = <StyleProperty>property;
            try {
                view.style._setValue(resolvedProperty, value, modifier);
            } catch (ex) {
                if (trace.enabled) {
                    trace.write("Error setting property: " + resolvedProperty.name + " view: " + view + " value: " + value + " " + ex, trace.categories.Style, trace.messageType.error);
                }
            }
        }
    }));

    let ruleAnimations: keyframeAnimation.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
    if (ruleAnimations && view.isLoaded && view._nativeView !== undefined) {
        for (let animationInfo of ruleAnimations) {
            let animation = keyframeAnimation.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo, modifier);
            if (animation) {
                view._registerAnimation(animation);
                animation.play(view)
                    .then(() => { view._unregisterAnimation(animation);  })
                    .catch((e) => { view._unregisterAnimation(animation); });
            }
        }
    }
}

function applyInlineStyle(view: view.View, declarations: cssSelector.Declaration[]): void {
    declarations.forEach(d => withStyleProperty(d.property, d.value, (property, value) => {
        const resolvedProperty = <StyleProperty>property;
        view.style._setValue(resolvedProperty, value, observable.ValueSource.Local);
    }));
}