import { ViewBase } from "ui/core/view-base";
import { View } from "ui/core/view";
import { resetCSSProperties } from "ui/core/properties";
import { SyntaxTree, Keyframes, parse as parseCss, Node as CssNode } from "css";
import { RuleSet, SelectorsMap, SelectorCore, SelectorsMatch, ChangeMap, fromAstNodes, Node } from "ui/styling/css-selector";
import { write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";
import { File, knownFolders, path } from "file-system";
import * as application from "application";

import * as kam from "ui/animation/keyframe-animation";
let keyframeAnimationModule: typeof kam;
function ensureKeyframeAnimationModule() {
    if (!keyframeAnimationModule) {
        keyframeAnimationModule = require("ui/animation/keyframe-animation");
    }
}

import * as capm from "./css-animation-parser";
let cssAnimationParserModule: typeof capm;
function ensureCssAnimationParserModule() {
    if (!cssAnimationParserModule) {
        cssAnimationParserModule = require("./css-animation-parser");
    }
}

export function mergeCssSelectors(): void {
    applicationCssSelectors = applicationSelectors.slice();
    applicationCssSelectors.push.apply(applicationCssSelectors, applicationAdditionalSelectors);
    applicationCssSelectorVersion++;
}

let applicationCssSelectors: RuleSet[] = [];
let applicationCssSelectorVersion: number = 0;
let applicationSelectors: RuleSet[] = [];
const applicationAdditionalSelectors: RuleSet[] = [];
const applicationKeyframes: any = {};

const animationsSymbol: symbol = Symbol("animations");

function onCssChanged(args: application.CssChangedEventData): void {
    if (args.cssText) {
        const parsed = createSelectorsFromCss(args.cssText, args.cssFile, applicationKeyframes);
        if (parsed) {
            applicationAdditionalSelectors.push.apply(applicationAdditionalSelectors, parsed);
            mergeCssSelectors();
        }
    } else if (args.cssFile) {
        loadCss(args.cssFile);
    }
}

function onLiveSync(args: application.CssChangedEventData): void {
    loadCss(args.cssFile)
}

function loadCss(cssFile?: string): RuleSet[] {
    if (!cssFile) {
        return undefined;
    }

    let result: RuleSet[];

    const cssFileName = path.join(knownFolders.currentApp().path, cssFile);
    if (File.exists(cssFileName)) {
        const file = File.fromPath(cssFileName);
        const applicationCss = file.readTextSync();
        if (applicationCss) {
            result = createSelectorsFromCss(applicationCss, cssFileName, applicationKeyframes);
            applicationSelectors = result;
            mergeCssSelectors();
        }
    }
}

application.on("cssChanged", onCssChanged);
application.on("livesync", onLiveSync);

let pattern: RegExp = /('|")(.*?)\1/;

export class CssState {
    constructor(private view: ViewBase, private match: SelectorsMatch<ViewBase>) {
    }

    public get changeMap(): ChangeMap<ViewBase> {
        return this.match.changeMap;
    }

    public apply(): void {
        this.view._cancelAllAnimations();
        resetCSSProperties(this.view.style);

        let matchingSelectors = this.match.selectors.filter(sel => sel.dynamic ? sel.match(this.view) : true);
        if (this.view.inlineStyleSelector) {
            matchingSelectors.push(this.view.inlineStyleSelector);
        }

        matchingSelectors.forEach(s => this.applyDescriptors(this.view, s.ruleset));
    }

    private applyDescriptors(view: ViewBase, ruleset: RuleSet): void {
        let style = view.style;
        ruleset.declarations.forEach(d => {
            try {
                // Use the "css:" prefixed name, so that CSS value source is set.
                let cssPropName = `css:${d.property}`;
                if (cssPropName in style) {
                    style[cssPropName] = d.value;
                } else {
                    view[d.property] = d.value;
                }
            } catch (e) {
                traceWrite(`Failed to apply property [${d.property}] with value [${d.value}] to ${view}. ${e}`, traceCategories.Error, traceMessageType.error);
            }
        });

        let ruleAnimations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
        if (ruleAnimations && view.isLoaded && view.nativeView !== undefined) {
            ensureKeyframeAnimationModule();
            for (let animationInfo of ruleAnimations) {
                let animation = keyframeAnimationModule.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
                if (animation) {
                    view._registerAnimation(animation);
                    animation.play(<View>view)
                        .then(() => { view._unregisterAnimation(animation); })
                        .catch((e) => { view._unregisterAnimation(animation); });
                }
            }
        }
    }
}

export class StyleScope {

    private _selectors: SelectorsMap;

    // caches all the visual states by the key of the visual state selectors
    private _statesByKey = {};
    private _viewIdToKey = {};

    private _css: string = "";
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
        this.appendCss(cssString, cssFileName)
    }

    private setCss(cssString: string, cssFileName?): void {
        this._css = cssString;
        this._reset();
        this._localCssSelectors = createSelectorsFromCss(this._css, cssFileName, this._keyframes);
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    private appendCss(cssString: string, cssFileName?): void {
        if (!cssString) {
            return;
        }

        this._css = this._css + cssString;
        this._reset();
        let parsedCssSelectors = createSelectorsFromCss(cssString, cssFileName, this._keyframes);
        this._localCssSelectors.push.apply(this._localCssSelectors, parsedCssSelectors);
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    public getKeyframeAnimationWithName(animationName: string): kam.KeyframeAnimationInfo {
        let keyframes = this._keyframes[animationName];
        if (keyframes !== undefined) {
            ensureKeyframeAnimationModule();
            let animation = new keyframeAnimationModule.KeyframeAnimationInfo();
            ensureCssAnimationParserModule();
            animation.keyframes = cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(keyframes);
            return animation;
        }
        return undefined;
    }

    public ensureSelectors(): boolean {
        let toMerge: RuleSet[][];
        if (this._applicationCssSelectorsAppliedVersion !== applicationCssSelectorVersion ||
            this._localCssSelectorVersion !== this._localCssSelectorsAppliedVersion ||
            !this._mergedCssSelectors) {
            toMerge = [];
            toMerge.push(applicationCssSelectors);
            this._applicationCssSelectorsAppliedVersion = applicationCssSelectorVersion;
            toMerge.push(this._localCssSelectors);
            this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;
            for (let keyframe in applicationKeyframes) {
                this._keyframes[keyframe] = applicationKeyframes[keyframe];
            }
        }

        if (toMerge && toMerge.length > 0) {
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

    private _reset() {
        this._statesByKey = {};
        this._viewIdToKey = {};
    }

    private _applyKeyframesOnSelectors() {
        for (let i = this._mergedCssSelectors.length - 1; i >= 0; i--) {
            let ruleset = this._mergedCssSelectors[i];
            let animations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
            if (animations !== undefined && animations.length) {
                ensureCssAnimationParserModule();
                for (let animation of animations) {
                    let keyframe = this._keyframes[animation.name];
                    if (keyframe !== undefined) {
                        animation.keyframes = cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(keyframe);
                    }
                }
            }
        }
    }

    public getAnimations(ruleset: RuleSet): kam.KeyframeAnimationInfo[] {
        return ruleset[animationsSymbol];
    }
}

function createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): RuleSet[] {
    try {
        const pageCssSyntaxTree = css ? parseCss(css, { source: cssFileName }) : null;
        let pageCssSelectors: RuleSet[] = [];
        if (pageCssSyntaxTree) {
            pageCssSelectors = pageCssSelectors.concat(createSelectorsFromImports(pageCssSyntaxTree, keyframes));
            pageCssSelectors = pageCssSelectors.concat(createSelectorsFromSyntaxTree(pageCssSyntaxTree, keyframes));
        }
        return pageCssSelectors;
    } catch (e) {
        traceWrite("Css styling failed: " + e, traceCategories.Error, traceMessageType.error);
    }
}

function createSelectorsFromImports(tree: SyntaxTree, keyframes: Object): RuleSet[] {
    let selectors: RuleSet[] = [];

    if (tree !== null && tree !== undefined) {
        const imports = tree["stylesheet"]["rules"].filter(r => r.type === "import");

        for (let i = 0; i < imports.length; i++) {
            const importItem = imports[i]["import"];

            const match = importItem && (<string>importItem).match(pattern);
            const url = match && match[2];

            if (url !== null && url !== undefined) {
                const appDirectory = knownFolders.currentApp().path;
                const fileName = resolveFileNameFromUrl(url, appDirectory, File.exists);

                if (fileName !== null) {
                    const file = File.fromPath(fileName);
                    const text = file.readTextSync();
                    if (text) {
                        selectors = selectors.concat(createSelectorsFromCss(text, fileName, keyframes));
                    }
                }
            }
        }
    }

    return selectors;
}

function createSelectorsFromSyntaxTree(ast: SyntaxTree, keyframes: Object): RuleSet[] {
    const nodes = ast.stylesheet.rules;
    (<Keyframes[]>nodes.filter(isKeyframe)).forEach(node => keyframes[node.name] = node);

    const rulesets = fromAstNodes(nodes);
    if (rulesets && rulesets.length) {
        ensureCssAnimationParserModule();
        rulesets.forEach(rule => rule[animationsSymbol] = cssAnimationParserModule.CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations));
    }

    return rulesets;
}

export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (name: string) => boolean): string {
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

export function applyInlineStyle(view: ViewBase, styleStr: string) {
    let localStyle = `local { ${styleStr} }`;
    let inlineRuleSet = createSelectorsFromCss(localStyle, null, {});
    const style = view.style;

    inlineRuleSet[0].declarations.forEach(d => {
        // Use the actual property name so that a local value is set.
        let name = d.property;
        try {
            if (name in style) {
                style[name] = d.value;
            } else {
                view[name] = d.value;
            }
        } catch (e) {
            traceWrite(`Failed to apply property [${d.property}] with value [${d.value}] to ${view}. ${e}`, traceCategories.Error, traceMessageType.error);
        }
    });
}

function isKeyframe(node: CssNode): node is Keyframes {
    return node.type === "keyframes";
}

class InlineSelector extends SelectorCore {
    constructor(ruleSet: RuleSet) {
        super();
        this.ruleset = ruleSet;
    }

    public specificity = 0x01000000;
    public rarity = 0;
    public dynamic: boolean = false;
    public ruleset: RuleSet;
    public match(node: Node): boolean { return true; }
}

loadCss(application.cssFile);
