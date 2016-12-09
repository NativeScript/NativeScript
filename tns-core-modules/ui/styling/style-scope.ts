import { ViewBase } from "ui/core/view-base";
import { SyntaxTree, Keyframes, parse as parseCss, Rule, Declaration, Node } from "css";
import { RuleSet, SelectorsMap, SelectorCore, SelectorsMatch, ChangeMap, fromAstNodes } from "ui/styling/css-selector";
import { KeyframeAnimationInfo, KeyframeAnimation } from "ui/animation/keyframe-animation";
import { write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";
import { File, knownFolders, path } from "file-system";
import { CssAnimationParser } from "./css-animation-parser";
import { isFileOrResourcePath } from "utils/utils";

import application = require("application");

const animationsSymbol: symbol = Symbol("animations");


let pattern: RegExp = /('|")(.*?)\1/;

export class CssState {
    constructor(private view: ViewBase, private match: SelectorsMatch<ViewBase>) {
    }

    public get changeMap(): ChangeMap<ViewBase> {
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
    private _mergedCssSelectors: RuleSet[];
    private _localCssSelectors: RuleSet[] = [];
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

    public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo {
        let keyframes = this._keyframes[animationName];
        if (keyframes !== undefined) {
            let animation = new KeyframeAnimationInfo();
            animation.keyframes = CssAnimationParser.keyframesArrayFromCSS(keyframes);
            return animation;
        }
        return undefined;
    }

    public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): RuleSet[] {
        try {
            let pageCssSyntaxTree = css ? parseCss(css, { source: cssFileName }) : null;
            let pageCssSelectors: RuleSet[] = [];
            if (pageCssSyntaxTree) {
                pageCssSelectors = pageCssSelectors.concat(StyleScope.createSelectorsFromImports(pageCssSyntaxTree, keyframes));
                pageCssSelectors = pageCssSelectors.concat(StyleScope.createSelectorsFromSyntaxTree(pageCssSyntaxTree, keyframes));
            }
            return pageCssSelectors;
        } catch (e) {
            traceWrite("Css styling failed: " + e, traceCategories.Error, traceMessageType.error);
        }
    }

    public static createSelectorsFromImports(tree: SyntaxTree, keyframes: Object): RuleSet[] {
        let selectors: RuleSet[] = [];

        if (tree !== null && tree !== undefined) {
            let imports = tree["stylesheet"]["rules"].filter(r => r.type === "import");

            for (let i = 0; i < imports.length; i++) {
                let importItem = imports[i]["import"];

                let match = importItem && (<string>importItem).match(pattern);
                let url = match && match[2];

                if (url !== null && url !== undefined) {
		    let appDirectory = knownFolders.currentApp().path;
                    let fileName = resolveFileNameFromUrl(url, appDirectory, File.exists);

                    if (fileName !== null) {
                        let file = File.fromPath(fileName);
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
        let toMerge = [];
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

    public applySelectors(view: ViewBase): void {
        this.ensureSelectors();

        let state = this._selectors.query(view);

        let nextState = new CssState(view, state);
        view._setCssState(nextState);
    }

    public query(node: Node): SelectorCore[] {
        this.ensureSelectors();
        return this._selectors.query(node).selectors;
    }

    private static createSelectorsFromSyntaxTree(ast: SyntaxTree, keyframes: Object): RuleSet[] {
        let nodes = ast.stylesheet.rules;
        (<Keyframes[]>nodes.filter(isKeyframe)).forEach(node => keyframes[node.name] = node);

        let rulesets = fromAstNodes(nodes);
        rulesets.forEach(rule => rule[animationsSymbol] = CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations));

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
                        animation.keyframes = CssAnimationParser.keyframesArrayFromCSS(keyframe);
                    }
                }
            }
        }
    }

    public getAnimations(ruleset: RuleSet): KeyframeAnimationInfo[] {
        return ruleset[animationsSymbol];
    }
}

export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (string) => boolean): string {
    let fileName: string = typeof url === "string" ? url.trim() : "";

    if (fileName.indexOf("~/") === 0) {
        fileName = fileName.replace("~/", "");
    }

    let local = path.join(appDirectory, fileName);
    if (fileExists(local)) {
        return local;
    }

    let external = path.join(appDirectory, "tns_modules", fileName);
    if (fileExists(external)) {
        return external;
    }

    return null;
}

export function applyInlineSyle(view: ViewBase, style: string) {
    try {
        let syntaxTree = parseCss("local { " + style + " }", undefined);
        let filteredDeclarations = <Declaration[]>(<Rule[]>syntaxTree.stylesheet.rules.filter(isRule))[0].declarations.filter(isDeclaration);
        applyInlineStyle(view, filteredDeclarations);
    } catch (ex) {
        traceWrite("Applying local style failed: " + ex, traceCategories.Error, traceMessageType.error);
    }
}

function isRule(node: Node): node is Rule {
    return node.type === "rule";
}
function isDeclaration(node: Node): node is Declaration {
    return node.type === "declaration";
}
function isKeyframe(node: Node): node is Keyframes {
    return node.type === "keyframes";
}

function applyDescriptors(view: ViewBase, ruleset: RuleSet): void {
    let style = view.style;
    ruleset.declarations.forEach(d => {
        let name = `css-${d.property}`;
        if (name in style) {
            style[name] = d.value;
        } else {
            view[name] = d.value;
        }
    });

    // let modifier = observable.ValueSource.Css;
    // ruleset.declarations.forEach(d => withStyleProperty(d.property, d.value, (property, value) => {
    //     if (types.isString(property)) {
    //         const propertyName = <string>property;
    //         let attrHandled = false;
    //         let specialSetter = getSpecialPropertySetter(propertyName);

    //         if (!attrHandled && specialSetter) {
    //             specialSetter(view, value);
    //             attrHandled = true;
    //         }

    //         if (!attrHandled && propertyName in view) {
    //             view[propertyName] = convertString(value);
    //         }
    //     } else {
    //         const resolvedProperty = <StyleProperty>property;
    //         try {
    //             view.style._setValue(resolvedProperty, value, modifier);
    //         } catch (ex) {
    //             if (traceEnabled) {
    //                 traceWrite("Error setting property: " + resolvedProperty.name + " view: " + view + " value: " + value + " " + ex, traceCategories.Style, trace.messageType.error);
    //             }
    //         }
    //     }
    // }));

    let ruleAnimations: KeyframeAnimationInfo[] = ruleset[animationsSymbol];
    if (ruleAnimations && view.isLoaded && view.nativeView !== undefined) {
        for (let animationInfo of ruleAnimations) {
            let animation = KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
            if (animation) {
                view._registerAnimation(animation);
                animation.play(view)
                    .then(() => { view._unregisterAnimation(animation); })
                    .catch((e) => { view._unregisterAnimation(animation); });
            }
        }
    }
}

function applyInlineStyle(view: ViewBase, declarations: Declaration[]): void {
    let style = view.style;
    declarations.forEach(d => {
        let name = d.property;
        if (name in style) {
            style[name] = d.value;
        } else {
            view[name] = d.value;
        }
    });

    // declarations.forEach(d => withStyleProperty(d.property, d.value, (property, value) => {
    //     const resolvedProperty = <StyleProperty>property;
    //     view.style._setValue(resolvedProperty, value, observable.ValueSource.Local);
    // }));
}
