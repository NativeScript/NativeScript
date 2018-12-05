import { Keyframes } from "../animation/keyframe-animation";
import { ViewBase } from "../core/view-base";
import { View } from "../core/view";
import { unsetValue } from "../core/properties";
import {
    SyntaxTree,
    Keyframes as KeyframesDefinition,
    parse as parseCss,
    Node as CssNode,
} from "../../css";
import {
    CSS3Parser,
    CSSNativeScript
} from "../../css/parser";

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
import * as applicationCommon from "../../application/application-common";
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

let parser: "rework" | "nativescript" = "rework";
try {
    const appConfig = require("~/package.json");
    if (appConfig && appConfig.cssParser === "nativescript") {
        parser = "nativescript";
    }
} catch (e) {
    //
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

    private constructor(private _ast: SyntaxTree, private _url: string, private _file: string, private _keyframes: KeyframesMap, private _source: string) {
        this.parse();
    }

    public static fromURI(uri: string, keyframes: KeyframesMap): CSSSource {
        // webpack modules require all file paths to be relative to /app folder
        let appRelativeUri = CSSSource.pathRelativeToApp(uri);

        try {
            const cssOrAst = global.loadModule(appRelativeUri);
            if (cssOrAst) {
                if (typeof cssOrAst === "string") {
                    // raw-loader
                    return CSSSource.fromSource(cssOrAst, keyframes, appRelativeUri);
                } else if (typeof cssOrAst === "object" && cssOrAst.type === "stylesheet" && cssOrAst.stylesheet && cssOrAst.stylesheet.rules) {
                    // css-loader
                    return CSSSource.fromAST(cssOrAst, keyframes, appRelativeUri);
                } else {
                    // css2json-loader
                    return CSSSource.fromSource(cssOrAst.toString(), keyframes, appRelativeUri);
                }
            }
        } catch (e) {
            //
        }

        return CSSSource.fromFile(appRelativeUri, keyframes);
    }

    private static pathRelativeToApp(uri: string): string {
        if (!uri.startsWith("/")) {
            return uri;
        }

        const appPath = knownFolders.currentApp().path;
        if (!uri.startsWith(appPath)) {
            traceWrite(`${uri} does not start with ${appPath}`, traceCategories.Error, traceMessageType.error);
            return uri;
        }

        const relativeUri = `.${uri.substr(appPath.length)}`;
        return relativeUri;
    }

    public static fromFile(url: string, keyframes: KeyframesMap): CSSSource {
        // .scss, .sass, etc. css files in vanilla app are usually compiled to .css so we will try to load a compiled file first.
        let cssFileUrl = url.replace(/\..\w+$/, ".css");
        if (cssFileUrl !== url) {
            const cssFile = CSSSource.resolveCSSPathFromURL(cssFileUrl);
            if (cssFile) {
                return new CSSSource(undefined, url, cssFile, keyframes, undefined);
            }
        }

        const file = CSSSource.resolveCSSPathFromURL(url);
        return new CSSSource(undefined, url, file, keyframes, undefined);
    }

    public static fromFileImport(url: string, keyframes: KeyframesMap, importSource: string): CSSSource {
        const file = CSSSource.resolveCSSPathFromURL(url, importSource);
        return new CSSSource(undefined, url, file, keyframes, undefined);
    }

    @profile
    public static resolveCSSPathFromURL(url: string, importSource?: string): string {
        const app = knownFolders.currentApp().path;
        const file = resolveFileNameFromUrl(url, app, File.exists, importSource);
        return file;
    }

    public static fromSource(source: string, keyframes: KeyframesMap, url?: string): CSSSource {
        return new CSSSource(undefined, url, undefined, keyframes, source);
    }

    public static fromAST(ast: SyntaxTree, keyframes: KeyframesMap, url?: string): CSSSource {
        return new CSSSource(ast, url, undefined, keyframes, undefined);
    }

    get selectors(): RuleSet[] { return this._selectors; }
    get source(): string { return this._source; }

    @profile
    private load(): void {
        const file = File.fromPath(this._file);
        this._source = file.readTextSync();
    }

    @profile
    private parse(): void {
        try {
            if (!this._ast) {
                if (!this._source && this._file) {
                    this.load();
                }
                if (this._source) {
                    this.parseCSSAst();
                }
            }
            if (this._ast) {
                this.createSelectors();
            } else {
                this._selectors = [];
            }
        } catch (e) {
            traceWrite("Css styling failed: " + e, traceCategories.Error, traceMessageType.error);
            this._selectors = [];
        }
    }

    @profile
    private parseCSSAst() {
        if (this._source) {
            switch (parser) {
                case "nativescript":
                    const cssparser = new CSS3Parser(this._source);
                    const stylesheet = cssparser.parseAStylesheet();
                    const cssNS = new CSSNativeScript();
                    this._ast = cssNS.parseStylesheet(stylesheet);
                    return;
                case "rework":
                    this._ast = parseCss(this._source, { source: this._file });
                    return;
            }
        }
    }

    @profile
    private createSelectors() {
        if (this._ast) {
            this._selectors = [
                ...this.createSelectorsFromImports(),
                ...this.createSelectorsFromSyntaxTree()
            ];
        }
    }

    private createSelectorsFromImports(): RuleSet[] {
        const imports = this._ast["stylesheet"]["rules"].filter(r => r.type === "import");

        const urlFromImportObject = importObject => {
            const importItem = importObject["import"] as string;
            const urlMatch = importItem && importItem.match(pattern);
            return urlMatch && urlMatch[2];
        };

        const sourceFromImportObject = importObject =>
            importObject["position"] && importObject["position"]["source"];

        const toUrlSourcePair = importObject => ({
            url: urlFromImportObject(importObject),
            source: sourceFromImportObject(importObject),
        });

        const getCssFile = ({ url, source }) => source ?
            CSSSource.fromFileImport(url, this._keyframes, source) :
            CSSSource.fromURI(url, this._keyframes);

        const cssFiles = imports
            .map(toUrlSourcePair)
            .filter(({ url }) => !!url)
            .map(getCssFile);

        const selectors = cssFiles.map(file => (file && file.selectors) || []);
        return selectors.reduce((acc, val) => acc.concat(val), []);
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

export function removeTaggedAdditionalCSS(tag: String | Number): Boolean {
    let changed = false;
    for (let i = 0; i < applicationAdditionalSelectors.length; i++) {
        if (applicationAdditionalSelectors[i].tag === tag) {
            applicationAdditionalSelectors.splice(i, 1);
            i--;
            changed = true;
        }
    }
    if (changed) { mergeCssSelectors(); }
    return changed;
}

export function addTaggedAdditionalCSS(cssText: string, tag?: string | Number): Boolean {
    const parsed: RuleSet[] = CSSSource.fromSource(cssText, applicationKeyframes, undefined).selectors;
    let changed = false;
    if (parsed && parsed.length) {
        changed = true;
        if (tag != null) {
            for (let i = 0; i < parsed.length; i++) {
                parsed[i].tag = tag;
            }
        }
        applicationAdditionalSelectors.push.apply(applicationAdditionalSelectors, parsed);
        mergeCssSelectors();
    }
    return changed;
}

const onCssChanged = profile("\"style-scope\".onCssChanged", (args: applicationCommon.CssChangedEventData) => {
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

function onLiveSync(args: applicationCommon.CssChangedEventData): void {
    loadCss(applicationCommon.getCssFileName());
}

const loadCss = profile(`"style-scope".loadCss`, (cssFile: string) => {
    if (!cssFile) {
        return undefined;
    }

    const result = CSSSource.fromURI(cssFile, applicationKeyframes).selectors;
    if (result.length > 0) {
        applicationSelectors = result;
        mergeCssSelectors();
    }
});

applicationCommon.on("cssChanged", onCssChanged);
applicationCommon.on("livesync", onLiveSync);

export const loadAppCSS = profile("\"style-scope\".loadAppCSS", (args: applicationCommon.LoadAppCSSEventData) => {
    loadCss(args.cssFile);
    applicationCommon.off("loadAppCss", loadAppCSS);
});

if (applicationCommon.hasLaunched()) {
    loadAppCSS({ eventName: "loadAppCss", object: <any>applicationCommon, cssFile: applicationCommon.getCssFileName() });
} else {
    applicationCommon.on("loadAppCss", loadAppCSS);
}

export class CssState {
    static emptyChangeMap: Readonly<ChangeMap<ViewBase>> = Object.freeze(new Map());
    static emptyPropertyBag: Readonly<{}> = Object.freeze({});
    static emptyAnimationArray: ReadonlyArray<kam.KeyframeAnimation> = Object.freeze([]);
    static emptyMatch: Readonly<SelectorsMatch<ViewBase>> = { selectors: [], changeMap: new Map() };

    _onDynamicStateChangeHandler: () => void;
    _appliedChangeMap: Readonly<ChangeMap<ViewBase>>;
    _appliedPropertyValues: Readonly<{}>;
    _appliedAnimations: ReadonlyArray<kam.KeyframeAnimation>;
    _appliedSelectorsVersion: number;

    _match: SelectorsMatch<ViewBase>;
    _matchInvalid: boolean;
    _playsKeyframeAnimations: boolean;

    constructor(private view: ViewBase) {
        this._onDynamicStateChangeHandler = () => this.updateDynamicState();
    }

    /**
     * Called when a change had occurred that may invalidate the statically matching selectors (class, id, ancestor selectors).
     * As a result, at some point in time, the selectors matched have to be requerried from the style scope and applied to the view.
     */
    public onChange(): void {
        if (this.view && this.view.isLoaded) {
            this.unsubscribeFromDynamicUpdates();
            this.updateMatch();
            this.subscribeForDynamicUpdates();
            this.updateDynamicState();
        } else {
            this._matchInvalid = true;
        }
    }

    public isSelectorsLatestVersionApplied(): boolean {
        return this.view._styleScope._getSelectorsVersion() === this._appliedSelectorsVersion;
    }

    public onLoaded(): void {
        if (this._matchInvalid) {
            this.updateMatch();
        }
        this.subscribeForDynamicUpdates();
        this.updateDynamicState();
    }

    public onUnloaded(): void {
        this.unsubscribeFromDynamicUpdates();
    }

    @profile
    private updateMatch() {
        this._appliedSelectorsVersion = this.view._styleScope._getSelectorsVersion();
        this._match = this.view._styleScope ? this.view._styleScope.matchSelectors(this.view) : CssState.emptyMatch;
        this._matchInvalid = false;
    }

    @profile
    private updateDynamicState(): void {
        const matchingSelectors = this._match.selectors.filter(sel => sel.dynamic ? sel.match(this.view) : true);

        this.view._batchUpdate(() => {
            this.stopKeyframeAnimations();
            this.setPropertyValues(matchingSelectors);
            this.playKeyframeAnimations(matchingSelectors);
        });
    }

    private playKeyframeAnimations(matchingSelectors: SelectorCore[]): void {
        const animations: kam.KeyframeAnimation[] = [];

        matchingSelectors.forEach(selector => {
            let ruleAnimations: kam.KeyframeAnimationInfo[] = selector.ruleset[animationsSymbol];
            if (ruleAnimations) {
                ensureKeyframeAnimationModule();
                for (let animationInfo of ruleAnimations) {
                    let animation = keyframeAnimationModule.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
                    if (animation) {
                        animations.push(animation);
                    }
                }
            }
        });

        if (this._playsKeyframeAnimations = animations.length > 0) {
            animations.map(animation => animation.play(<View>this.view));
            Object.freeze(animations);
            this._appliedAnimations = animations;
        }
    }

    private stopKeyframeAnimations(): void {
        if (!this._playsKeyframeAnimations) {
            return;
        }

        this._appliedAnimations
            .filter(animation => animation.isPlaying)
            .forEach(animation => animation.cancel());
        this._appliedAnimations = CssState.emptyAnimationArray;

        this.view.style["keyframe:rotate"] = unsetValue;
        this.view.style["keyframe:scaleX"] = unsetValue;
        this.view.style["keyframe:scaleY"] = unsetValue;
        this.view.style["keyframe:translateX"] = unsetValue;
        this.view.style["keyframe:translateY"] = unsetValue;
        this.view.style["keyframe:backgroundColor"] = unsetValue;
        this.view.style["keyframe:opacity"] = unsetValue;
        this._playsKeyframeAnimations = false;
    }

    /**
     * Calculate the difference between the previously applied property values,
     * and the new set of property values that have to be applied for the provided selectors.
     * Apply the values and ensure each property setter is called at most once to avoid excessive change notifications.
     * @param matchingSelectors
     */
    private setPropertyValues(matchingSelectors: SelectorCore[]): void {
        const newPropertyValues = new this.view.style.PropertyBag();
        matchingSelectors.forEach(selector =>
            selector.ruleset.declarations.forEach(declaration =>
                newPropertyValues[declaration.property] = declaration.value));
        Object.freeze(newPropertyValues);

        const oldProperties = this._appliedPropertyValues;
        for (const key in oldProperties) {
            if (!(key in newPropertyValues)) {
                if (key in this.view.style) {
                    this.view.style[`css:${key}`] = unsetValue;
                } else {
                    // TRICKY: How do we unset local value?
                }
            }
        }
        for (const property in newPropertyValues) {
            if (oldProperties && property in oldProperties && oldProperties[property] === newPropertyValues[property]) {
                continue;
            }
            const value = newPropertyValues[property];
            try {
                if (property in this.view.style) {
                    this.view.style[`css:${property}`] = value;
                } else {
                    this.view[property] = value;
                }
            } catch (e) {
                traceWrite(`Failed to apply property [${property}] with value [${value}] to ${this.view}. ${e}`, traceCategories.Error, traceMessageType.error);
            }
        }

        this._appliedPropertyValues = newPropertyValues;
    }

    private subscribeForDynamicUpdates(): void {
        const changeMap = this._match.changeMap;
        changeMap.forEach((changes, view) => {
            if (changes.attributes) {
                changes.attributes.forEach(attribute => {
                    view.addEventListener(attribute + "Change", this._onDynamicStateChangeHandler);
                });
            }
            if (changes.pseudoClasses) {
                changes.pseudoClasses.forEach(pseudoClass => {
                    let eventName = ":" + pseudoClass;
                    view.addEventListener(":" + pseudoClass, this._onDynamicStateChangeHandler);
                    if (view[eventName]) {
                        view[eventName](+1);
                    }
                });
            }
        });
        this._appliedChangeMap = changeMap;
    }

    private unsubscribeFromDynamicUpdates(): void {
        this._appliedChangeMap.forEach((changes, view) => {
            if (changes.attributes) {
                changes.attributes.forEach(attribute => {
                    view.removeEventListener(attribute + "Change", this._onDynamicStateChangeHandler);
                });
            }
            if (changes.pseudoClasses) {
                changes.pseudoClasses.forEach(pseudoClass => {
                    let eventName = ":" + pseudoClass;
                    view.removeEventListener(eventName, this._onDynamicStateChangeHandler);
                    if (view[eventName]) {
                        view[eventName](-1);
                    }
                });
            }
        });
        this._appliedChangeMap = CssState.emptyChangeMap;
    }

    toString(): string {
        return `${this.view}._cssState`;
    }
}
CssState.prototype._appliedChangeMap = CssState.emptyChangeMap;
CssState.prototype._appliedPropertyValues = CssState.emptyPropertyBag;
CssState.prototype._appliedAnimations = CssState.emptyAnimationArray;
CssState.prototype._matchInvalid = true;

export class StyleScope {

    private _selectors: SelectorsMap;
    private _css: string = "";
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
        this.setCss(value);
    }

    public addCss(cssString: string, cssFileName?: string): void {
        this.appendCss(cssString, cssFileName)
    }

    public addCssFile(cssFileName: string): void {
        this.appendCss(null, cssFileName);
    }

    @profile
    private setCss(cssString: string, cssFileName?): void {
        this._css = cssString;

        const cssFile = CSSSource.fromSource(cssString, this._keyframes, cssFileName);
        this._localCssSelectors = cssFile.selectors;
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    @profile
    private appendCss(cssString: string, cssFileName?): void {
        if (!cssString && !cssFileName) {
            return;
        }

        let parsedCssSelectors = cssString ? CSSSource.fromSource(cssString, this._keyframes, cssFileName) : CSSSource.fromURI(cssFileName, this._keyframes);
        this._css = this._css + parsedCssSelectors.source;
        this._localCssSelectors.push.apply(this._localCssSelectors, parsedCssSelectors.selectors);
        this._localCssSelectorVersion++;
        this.ensureSelectors();
    }

    public getKeyframeAnimationWithName(animationName: string): kam.KeyframeAnimationInfo {
        const cssKeyframes = this._keyframes[animationName];
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
        if (!this.isApplicationCssSelectorsLatestVersionApplied() ||
            !this.isLocalCssSelectorsLatestVersionApplied() ||
            !this._mergedCssSelectors) {

            this._createSelectors();
        }

        return this._getSelectorsVersion();
    }

    public isApplicationCssSelectorsLatestVersionApplied(): boolean {
        return this._applicationCssSelectorsAppliedVersion === applicationCssSelectorVersion;
    }

    public isLocalCssSelectorsLatestVersionApplied(): boolean {
        return this._localCssSelectorsAppliedVersion === this._localCssSelectorVersion;
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
    public matchSelectors(view: ViewBase): SelectorsMatch<ViewBase> {
        this.ensureSelectors();
        return this._selectors.query(view);
    }

    public query(node: Node): SelectorCore[] {
        this.ensureSelectors();
        return this._selectors.query(node).selectors;
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

export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (name: string) => boolean, importSource?: string): string {

    let fileName: string = typeof url === "string" ? url.trim() : "";
    if (fileName.indexOf("~/") === 0) {
        fileName = fileName.replace("~/", "");
    }

    const isAbsolutePath = fileName.indexOf("/") === 0;
    const absolutePath = isAbsolutePath ? fileName : path.join(appDirectory, fileName);
    if (fileExists(absolutePath)) {
        return absolutePath;
    }

    if (!isAbsolutePath) {
        if (fileName[0] === "~" && fileName[1] !== "/" && fileName[1] !== "\"") {
            fileName = fileName.substr(1);
        }

        if (importSource) {
            const importFile = resolveFilePathFromImport(importSource, fileName);
            if (fileExists(importFile)) {
                return importFile;
            }
        }

        const external = path.join(appDirectory, "tns_modules", fileName);
        if (fileExists(external)) {
            return external;
        }
    }

    return null;
}

function resolveFilePathFromImport(importSource: string, fileName: string): string {
    const importSourceParts = importSource.split(path.separator);
    const fileNameParts = fileName.split(path.separator)
        // exclude the dot-segment for current directory
        .filter(p => !isCurrentDirectory(p));

    // remove current file name
    importSourceParts.pop();
    // remove element in case of dot-segment for parent directory or add file name
    fileNameParts.forEach(p => isParentDirectory(p) ? importSourceParts.pop() : importSourceParts.push(p));
    return importSourceParts.join(path.separator);
}

export const applyInlineStyle = profile(function applyInlineStyle(view: ViewBase, styleStr: string) {
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
});

function isCurrentDirectory(uriPart: string): boolean {
    return uriPart === ".";
}

function isParentDirectory(uriPart: string): boolean {
    return uriPart === "..";
}

function isKeyframe(node: CssNode): node is KeyframesDefinition {
    return node.type === "keyframes";
}

// class InlineSelector implements SelectorCore {
//     constructor(ruleSet: RuleSet) {
//         this.ruleset = ruleSet;
//     }

//     public specificity = 0x01000000;
//     public rarity = 0;
//     public dynamic: boolean = false;
//     public ruleset: RuleSet;
//     public match(node: Node): boolean { return true; }
// }
