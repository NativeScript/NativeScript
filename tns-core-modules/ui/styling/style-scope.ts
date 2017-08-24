import { Keyframes } from "../animation/keyframe-animation";
import { ViewBase } from "../core/view-base";
import { View } from "../core/view";
import { resetCSSProperties } from "../core/properties";
import {
    SyntaxTree,
    Keyframes as KeyframesDefinition,
    parse as parseCss,
    Node as CssNode,
} from "../../css";
import {
    RuleSet,
    SelectorsMap,
    SelectorCore,
    SelectorsMatch,
    ChangeMap,
    fromAstNodes,
    Node,
} from "./css-selector";
import {
    write as traceWrite,
    categories as traceCategories,
    messageType as traceMessageType,
} from "../../trace";
import { File, knownFolders, path } from "../../file-system";
import * as application from "../../application";
import { profile } from "../../profiling";

import * as kam from "../animation/keyframe-animation";
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
const pattern: RegExp = /('|")(.*?)\1/;

class CSSSource {
    private _selectors: RuleSet[] = [];
    private _ast: SyntaxTree;

    private static cssFilesCache: { [path: string]: CSSSource } = {};

    private constructor(private _url: string, private _file: string, private _keyframes: KeyframesMap, private _source?: string) {
        if (this._file && !this._source) {
            this.load();
        }
        this.parse();
    }

    public static fromFile(url: string, keyframes: KeyframesMap): CSSSource {
        const app = knownFolders.currentApp().path;
        const file = resolveFileNameFromUrl(url, app, File.exists);
        return new CSSSource(url, file, keyframes, undefined);
    }

    public static fromSource(source: string, keyframes: KeyframesMap, url?: string): CSSSource {
        return new CSSSource(url, undefined, keyframes, source);
    }

    get selectors(): RuleSet[] { return this._selectors; }

    @profile
    private load(): void {
        const file = File.fromPath(this._file);
        this._source = file.readTextSync();
    }

    @profile
    private parse(): void {
        if (this._source) {
            try {
                this._ast = this._source ? parseCss(this._source, { source: this._file }) : null;
                // TODO: Don't merge arrays, instead chain the css files.
                if (this._ast) {
                    this._selectors = [
                        ...this.createSelectorsFromImports(),
                        ...this.createSelectorsFromSyntaxTree()
                    ];
                }
            } catch (e) {
                traceWrite("Css styling failed: " + e, traceCategories.Error, traceMessageType.error);
            }
        } else {
            this._selectors = [];
        }
    }

    private createSelectorsFromImports(): RuleSet[] {
        let selectors: RuleSet[] = [];
        const imports = this._ast["stylesheet"]["rules"].filter(r => r.type === "import");
        for (let i = 0; i < imports.length; i++) {
            const importItem = imports[i]["import"];

            const match = importItem && (<string>importItem).match(pattern);
            const url = match && match[2];

            if (url !== null && url !== undefined) {
                const cssFile = CSSSource.fromFile(url, this._keyframes);
                selectors = selectors.concat(cssFile.selectors);
            }
        }

        return selectors;
    }

    private createSelectorsFromSyntaxTree(): RuleSet[] {
        const nodes = this._ast.stylesheet.rules;
        (<KeyframesDefinition[]>nodes.filter(isKeyframe)).forEach(node => this._keyframes[node.name] = node);

        const rulesets = fromAstNodes(nodes);
        if (rulesets && rulesets.length) {
            ensureCssAnimationParserModule();

            rulesets.forEach(rule => {
                rule[animationsSymbol] = cssAnimationParserModule.CssAnimationParser
                    .keyframeAnimationsFromCSSDeclarations(rule.declarations);
            });
        }

        return rulesets;
    }

    toString(): string {
        return this._file || this._url || "(in-memory)";
    }
}

const onCssChanged = profile('"style-scope".onCssChanged', (args: application.CssChangedEventData) => {
    if (args.cssText) {
        const parsed = CSSSource.fromSource(args.cssText, applicationKeyframes, args.cssFile).selectors;
        if (parsed) {
            applicationAdditionalSelectors.push.apply(applicationAdditionalSelectors, parsed);
            mergeCssSelectors();
        }
    } else if (args.cssFile) {
        loadCss(args.cssFile);
    }
});

function onLiveSync(args: application.CssChangedEventData): void {
    loadCss(application.getCssFileName());
}

const loadCss = profile(`"style-scope".loadCss`, (cssFile: string) => {
    if (!cssFile) {
        return undefined;
    }

    const result = CSSSource.fromFile(cssFile, applicationKeyframes).selectors;
    if (result.length > 0) {
        applicationSelectors = result;
        mergeCssSelectors();
    }
});

application.on("cssChanged", onCssChanged);
application.on("livesync", onLiveSync);

export const loadCssOnLaunch = profile('"style-scope".loadCssOnLaunch', () => {
    loadCss(application.getCssFileName());
    application.off("launch", loadCssOnLaunch);
});

if (application.hasLaunched()) {
    loadCssOnLaunch();
} else {
    application.on("launch", loadCssOnLaunch);
}

export class CssState {
    private _pendingKeyframeAnimations: SelectorCore[];

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

        matchingSelectors.forEach(s => this.applyDescriptors(s.ruleset));
        this._pendingKeyframeAnimations = matchingSelectors;
        this.playPendingKeyframeAnimations();
    }

    public playPendingKeyframeAnimations() {
        if (this._pendingKeyframeAnimations && this.view.nativeViewProtected) {
            this._pendingKeyframeAnimations.forEach(s => this.playKeyframeAnimationsFromRuleSet(s.ruleset));
            this._pendingKeyframeAnimations = null;
        }
    }

    private applyDescriptors(ruleset: RuleSet): void {
        let style = this.view.style;
        ruleset.declarations.forEach(d => {
            try {
                // Use the "css:" prefixed name, so that CSS value source is set.
                let cssPropName = `css:${d.property}`;
                if (cssPropName in style) {
                    style[cssPropName] = d.value;
                } else {
                    this.view[d.property] = d.value;
                }
            } catch (e) {
                traceWrite(`Failed to apply property [${d.property}] with value [${d.value}] to ${this.view}. ${e}`, traceCategories.Error, traceMessageType.error);
            }
        });
    }

    private playKeyframeAnimationsFromRuleSet(ruleset: RuleSet): void {
        let ruleAnimations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
        if (ruleAnimations) {
            ensureKeyframeAnimationModule();
            for (let animationInfo of ruleAnimations) {
                let animation = keyframeAnimationModule.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
                if (animation) {
                    this.view._registerAnimation(animation);
                    animation.play(<View>this.view)
                        .then(() => { this.view._unregisterAnimation(animation); })
                        .catch((e) => { this.view._unregisterAnimation(animation); });
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
    private _keyframes = new Map<string, Keyframes>();

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

    @profile
    private setCss(cssString: string, cssFileName?): void {
        this._css = cssString;
        this._reset();

        const cssFile = CSSSource.fromSource(cssString, this._keyframes, cssFileName);
        this._localCssSelectors = cssFile.selectors;
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    @profile
    private appendCss(cssString: string, cssFileName?): void {
        if (!cssString) {
            return;
        }

        this._css = this._css + cssString;
        this._reset();
        let parsedCssSelectors = CSSSource.fromSource(cssString, this._keyframes, cssFileName);
        this._localCssSelectors.push.apply(this._localCssSelectors, parsedCssSelectors);
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    public getKeyframeAnimationWithName(animationName: string): kam.KeyframeAnimationInfo {
        const cssKeyframes  = this._keyframes[animationName];
        if (!cssKeyframes) {
            return;
        }

        ensureKeyframeAnimationModule();
        const animation = new keyframeAnimationModule.KeyframeAnimationInfo();
        ensureCssAnimationParserModule();
        animation.keyframes = cssAnimationParserModule
            .CssAnimationParser.keyframesArrayFromCSS(cssKeyframes.keyframes);

        return animation;
    }

    public ensureSelectors(): number {
        if (this._applicationCssSelectorsAppliedVersion !== applicationCssSelectorVersion ||
            this._localCssSelectorVersion !== this._localCssSelectorsAppliedVersion ||
            !this._mergedCssSelectors) {

            this._createSelectors();
        }

        return this._getSelectorsVersion();
    }

    @profile
    private _createSelectors() {
        let toMerge: RuleSet[][] = [];
        toMerge.push(applicationCssSelectors);
        this._applicationCssSelectorsAppliedVersion = applicationCssSelectorVersion;
        toMerge.push(this._localCssSelectors);
        this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;
        for (let keyframe in applicationKeyframes) {
            this._keyframes[keyframe] = applicationKeyframes[keyframe];
        }

        if (toMerge.length > 0) {
            this._mergedCssSelectors = toMerge.filter(m => !!m).reduce((merged, next) => merged.concat(next), []);
            this._applyKeyframesOnSelectors();
            this._selectors = new SelectorsMap(this._mergedCssSelectors);
        }
    }

    @profile
    public matchSelectors(view: ViewBase): void {
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

    private _getSelectorsVersion() {
        // The counters can only go up. So we can return just appVersion + localVersion
        // The 100000 * appVersion is just for easier debugging
        return 100000 * this._applicationCssSelectorsAppliedVersion + this._localCssSelectorsAppliedVersion;
    }

    private _applyKeyframesOnSelectors() {
        for (let i = this._mergedCssSelectors.length - 1; i >= 0; i--) {
            let ruleset = this._mergedCssSelectors[i];
            let animations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
            if (animations !== undefined && animations.length) {
                ensureCssAnimationParserModule();
                for (let animation of animations) {
                    const cssKeyframe = this._keyframes[animation.name];
                    if (cssKeyframe !== undefined) {
                        animation.keyframes = cssAnimationParserModule
                            .CssAnimationParser.keyframesArrayFromCSS(cssKeyframe.keyframes);
                    }
                }
            }
        }
    }

    public getAnimations(ruleset: RuleSet): kam.KeyframeAnimationInfo[] {
        return ruleset[animationsSymbol];
    }
}

type KeyframesMap = Map<string, Keyframes>;

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
    let inlineRuleSet = CSSSource.fromSource(localStyle, new Map()).selectors;
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

function isKeyframe(node: CssNode): node is KeyframesDefinition {
    return node.type === "keyframes";
}

class InlineSelector implements SelectorCore {
    constructor(ruleSet: RuleSet) {
        this.ruleset = ruleSet;
    }

    public specificity = 0x01000000;
    public rarity = 0;
    public dynamic: boolean = false;
    public ruleset: RuleSet;
    public match(node: Node): boolean { return true; }
}
