import { Keyframes } from '../animation/keyframe-animation';
import { ViewBase } from '../core/view-base';
import { View } from '../core/view';
import { unsetValue, _evaluateCssVariableExpression, _evaluateCssCalcExpression, isCssVariable, isCssVariableExpression, isCssCalcExpression } from '../core/properties';
import { SyntaxTree, Keyframes as KeyframesDefinition, parse as parseCss, Node as CssNode } from '../../css';

import { RuleSet, SelectorsMap, SelectorCore, SelectorsMatch, ChangeMap, fromAstNodes, Node } from './css-selector';
import { Trace } from '../../trace';
import { File, knownFolders, path } from '../../file-system';
import * as application from '../../application';
import { profile } from '../../profiling';

import * as kam from '../animation/keyframe-animation';
let keyframeAnimationModule: typeof kam;
function ensureKeyframeAnimationModule() {
	if (!keyframeAnimationModule) {
		keyframeAnimationModule = require('../animation/keyframe-animation');
	}
}

import * as capm from './css-animation-parser';
import { sanitizeModuleName } from '../builder/module-name-sanitizer';
import { resolveModuleName } from '../../module-name-resolver';

let cssAnimationParserModule: typeof capm;
function ensureCssAnimationParserModule() {
	if (!cssAnimationParserModule) {
		cssAnimationParserModule = require('./css-animation-parser');
	}
}

let parser: 'rework' | 'nativescript' | 'css-tree' = 'css-tree';
try {
	const appConfig = require('~/package.json');
	if (appConfig) {
		if (appConfig.cssParser === 'rework') {
			parser = 'rework';
		} else if (appConfig.cssParser === 'nativescript') {
			parser = 'nativescript';
		}
	}
} catch (e) {
	//
}

/**
 * Evaluate css-variable and css-calc expressions
 */
function evaluateCssExpressions(view: ViewBase, property: string, value: string) {
	const newValue = _evaluateCssVariableExpression(view, property, value);
	if (newValue === 'unset') {
		return unsetValue;
	}

	value = newValue;

	try {
		value = _evaluateCssCalcExpression(value);
	} catch (e) {
		Trace.write(`Failed to evaluate css-calc for property [${property}] for expression [${value}] to ${view}. ${e.stack}`, Trace.categories.Error, Trace.messageType.error);

		return unsetValue;
	}

	return value;
}

export function mergeCssSelectors(): void {
	applicationCssSelectors = applicationSelectors.slice();
	applicationCssSelectors.push(...applicationAdditionalSelectors);
	applicationCssSelectorVersion++;
}

let applicationCssSelectors: RuleSet[] = [];
let applicationCssSelectorVersion = 0;
let applicationSelectors: RuleSet[] = [];
const tagToScopeTag: Map<string | number, string> = new Map();
let currentScopeTag: string = null;
const applicationAdditionalSelectors: RuleSet[] = [];
const applicationKeyframes: any = {};
const animationsSymbol = Symbol('animations');
const pattern = /('|")(.*?)\1/;

class CSSSource {
	private _selectors: RuleSet[] = [];

	private constructor(private _ast: SyntaxTree, private _url: string, private _file: string, private _keyframes: KeyframesMap, private _source: string) {
		this.parse();
	}

	public static fromDetect(cssOrAst: any, keyframes: KeyframesMap, fileName?: string): CSSSource {
		if (typeof cssOrAst === 'string') {
			// raw-loader
			return CSSSource.fromSource(cssOrAst, keyframes, fileName);
		} else if (typeof cssOrAst === 'object') {
			if (cssOrAst.default) {
				cssOrAst = cssOrAst.default;
			}

			if (cssOrAst.type === 'stylesheet' && cssOrAst.stylesheet && cssOrAst.stylesheet.rules) {
				// css-loader
				return CSSSource.fromAST(cssOrAst, keyframes, fileName);
			}
		}

		// css2json-loader
		return CSSSource.fromSource(cssOrAst.toString(), keyframes, fileName);
	}

	public static fromURI(uri: string, keyframes: KeyframesMap): CSSSource {
		// webpack modules require all file paths to be relative to /app folder
		const appRelativeUri = CSSSource.pathRelativeToApp(uri);
		const sanitizedModuleName = sanitizeModuleName(appRelativeUri);
		const resolvedModuleName = resolveModuleName(sanitizedModuleName, 'css');

		try {
			const cssOrAst = global.loadModule(resolvedModuleName, true);
			if (cssOrAst) {
				return CSSSource.fromDetect(cssOrAst, keyframes, resolvedModuleName);
			}
		} catch (e) {
			if (Trace.isEnabled()) {
				Trace.write(`Could not load CSS from ${uri}: ${e}`, Trace.categories.Error, Trace.messageType.warn);
			}
		}

		return CSSSource.fromFile(appRelativeUri, keyframes);
	}

	private static pathRelativeToApp(uri: string): string {
		if (!uri.startsWith('/')) {
			return uri;
		}

		const appPath = knownFolders.currentApp().path;
		if (!uri.startsWith(appPath)) {
			Trace.write(`${uri} does not start with ${appPath}`, Trace.categories.Error, Trace.messageType.error);

			return uri;
		}

		const relativeUri = `.${uri.substr(appPath.length)}`;

		return relativeUri;
	}

	public static fromFile(url: string, keyframes: KeyframesMap): CSSSource {
		// .scss, .sass, etc. css files in vanilla app are usually compiled to .css so we will try to load a compiled file first.
		const cssFileUrl = url.replace(/\..\w+$/, '.css');
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

	get selectors(): RuleSet[] {
		return this._selectors;
	}
	get source(): string {
		return this._source;
	}

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
				// [object Object] check guards against empty app.css file
				if (this._source && this.source !== '[object Object]') {
					this.parseCSSAst();
				}
			}
			if (this._ast) {
				this.createSelectors();
			} else {
				this._selectors = [];
			}
		} catch (e) {
			if (Trace.isEnabled()) {
				Trace.write('Css styling failed: ' + e, Trace.categories.Style, Trace.messageType.error);
			}
			this._selectors = [];
		}
	}

	@profile
	private parseCSSAst() {
		if (this._source) {
			if (__CSS_PARSER__ === 'css-tree') {
				const cssTreeParse = require('../../css/css-tree-parser').cssTreeParse;
				this._ast = cssTreeParse(this._source, this._file);
			} else if (__CSS_PARSER__ === 'nativescript') {
				const CSS3Parser = require('../../css/CSS3Parser').CSS3Parser;
				const CSSNativeScript = require('../../css/CSSNativeScript').CSSNativeScript;
				const cssparser = new CSS3Parser(this._source);
				const stylesheet = cssparser.parseAStylesheet();
				const cssNS = new CSSNativeScript();
				this._ast = cssNS.parseStylesheet(stylesheet);
			} else if (__CSS_PARSER__ === 'rework') {
				const parseCss = require('../../css').parse;
				this._ast = parseCss(this._source, { source: this._file });
			}
		}
	}

	@profile
	private createSelectors() {
		if (this._ast) {
			this._selectors = [...this.createSelectorsFromImports(), ...this.createSelectorsFromSyntaxTree()];
		}
	}

	private createSelectorsFromImports(): RuleSet[] {
		const imports = this._ast['stylesheet']['rules'].filter((r) => r.type === 'import');

		const urlFromImportObject = (importObject) => {
			const importItem = importObject['import'] as string;
			const urlMatch = importItem && importItem.match(pattern);

			return urlMatch && urlMatch[2];
		};

		const sourceFromImportObject = (importObject) => importObject['position'] && importObject['position']['source'];

		const toUrlSourcePair = (importObject) => ({
			url: urlFromImportObject(importObject),
			source: sourceFromImportObject(importObject),
		});

		const getCssFile = ({ url, source }) => (source ? CSSSource.fromFileImport(url, this._keyframes, source) : CSSSource.fromURI(url, this._keyframes));

		const cssFiles = imports
			.map(toUrlSourcePair)
			.filter(({ url }) => !!url)
			.map(getCssFile);

		const selectors = cssFiles.map((file) => (file && file.selectors) || []);

		return selectors.reduce((acc, val) => acc.concat(val), []);
	}

	private createSelectorsFromSyntaxTree(): RuleSet[] {
		const nodes = this._ast.stylesheet.rules;
		(<KeyframesDefinition[]>nodes.filter(isKeyframe)).forEach((node) => (this._keyframes[node.name] = node));

		const rulesets = fromAstNodes(nodes);
		if (rulesets && rulesets.length) {
			ensureCssAnimationParserModule();

			rulesets.forEach((rule) => {
				rule[animationsSymbol] = cssAnimationParserModule.CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations);
			});
		}

		return rulesets;
	}

	toString(): string {
		return this._file || this._url || '(in-memory)';
	}
}

export function removeTaggedAdditionalCSS(tag: string | number): boolean {
	let changed = false;
	for (let i = 0; i < applicationAdditionalSelectors.length; i++) {
		if (applicationAdditionalSelectors[i].tag === tag) {
			applicationAdditionalSelectors.splice(i, 1);
			i--;
			changed = true;
		}
	}
	if (changed) {
		mergeCssSelectors();
	}

	return changed;
}

export function addTaggedAdditionalCSS(cssText: string, tag?: string | number): boolean {
	const parsed: RuleSet[] = CSSSource.fromDetect(cssText, applicationKeyframes, undefined).selectors;
	const tagScope = currentScopeTag || (tag && tagToScopeTag.has(tag) && tagToScopeTag.get(tag)) || null;
	if (tagScope && tag) {
		tagToScopeTag.set(tag, tagScope);
	}
	let changed = false;
	if (parsed && parsed.length) {
		changed = true;
		if (tag != null || tagScope != null) {
			for (let i = 0; i < parsed.length; i++) {
				parsed[i].tag = tag;
				parsed[i].scopedTag = tagScope;
			}
		}
		applicationAdditionalSelectors.push(...parsed);
		mergeCssSelectors();
	}

	return changed;
}

const onCssChanged = profile('"style-scope".onCssChanged', (args: application.CssChangedEventData) => {
	if (args.cssText) {
		const parsed = CSSSource.fromSource(args.cssText, applicationKeyframes, args.cssFile).selectors;
		if (parsed) {
			applicationAdditionalSelectors.push(...parsed);
			mergeCssSelectors();
		}
	} else if (args.cssFile) {
		loadCss(args.cssFile, null, null);
	}
});

function onLiveSync(args: application.CssChangedEventData): void {
	loadCss(application.getCssFileName(), null, null);
}

const loadCss = profile(`"style-scope".loadCss`, (cssModule: string) => {
	if (!cssModule) {
		return undefined;
	}

	// safely remove "./" as global CSS should be resolved relative to app folder
	if (cssModule.startsWith('./')) {
		cssModule = cssModule.substr(2);
	}

	const result = CSSSource.fromURI(cssModule, applicationKeyframes).selectors;
	if (result.length > 0) {
		applicationSelectors = result;
		mergeCssSelectors();
	}
});

global.NativeScriptGlobals.events.on('cssChanged', <any>onCssChanged);
global.NativeScriptGlobals.events.on('livesync', onLiveSync);

// Call to this method is injected in the application in:
//  - no-snapshot - code injected in app.ts by [bundle-config-loader](https://github.com/NativeScript/nativescript-dev-webpack/blob/9b1e34d8ef838006c9b575285c42d2304f5f02b5/bundle-config-loader.ts#L85-L92)
//  - with-snapshot - code injected in snapshot bundle by [NativeScriptSnapshotPlugin](https://github.com/NativeScript/nativescript-dev-webpack/blob/48b26f412fd70c19dc0b9c7763e08e9505a0ae11/plugins/NativeScriptSnapshotPlugin/index.js#L48-L56)
// Having the app.css loaded in snapshot provides significant boost in startup (when using the ns-theme ~150 ms). However, because app.css is resolved at build-time,
// when the snapshot is created - there is no way to use file qualifiers or change the name of on app.css
export const loadAppCSS = profile('"style-scope".loadAppCSS', (args: application.LoadAppCSSEventData) => {
	loadCss(args.cssFile, null, null);
	global.NativeScriptGlobals.events.off('loadAppCss', loadAppCSS);
});

if (application.hasLaunched()) {
	loadAppCSS(
		{
			eventName: 'loadAppCss',
			object: <any>application,
			cssFile: application.getCssFileName(),
		},
		null,
		null
	);
} else {
	global.NativeScriptGlobals.events.on('loadAppCss', loadAppCSS);
}

export class CssState {
	static emptyChangeMap: Readonly<ChangeMap<ViewBase>> = Object.freeze(new Map());
	static emptyPropertyBag: Record<string, unknown> = {};
	static emptyAnimationArray: ReadonlyArray<kam.KeyframeAnimation> = Object.freeze([]);
	static emptyMatch: Readonly<SelectorsMatch<ViewBase>> = {
		selectors: [],
		changeMap: new Map(),
		addAttribute: () => {},
		addPseudoClass: () => {},
		properties: null,
	};

	_onDynamicStateChangeHandler: () => void;
	_appliedChangeMap: Readonly<ChangeMap<ViewBase>>;
	private _appliedPropertyValues: Record<string, unknown> = CssState.emptyPropertyBag;
	_appliedAnimations: ReadonlyArray<kam.KeyframeAnimation>;
	_appliedSelectorsVersion: number;

	_match: SelectorsMatch<ViewBase>;
	_matchInvalid: boolean;
	_playsKeyframeAnimations: boolean;

	constructor(private viewRef: WeakRef<ViewBase>) {
		this._onDynamicStateChangeHandler = () => this.updateDynamicState();
	}

	/**
	 * Called when a change had occurred that may invalidate the statically matching selectors (class, id, ancestor selectors).
	 * As a result, at some point in time, the selectors matched have to be requerried from the style scope and applied to the view.
	 */
	public onChange(): void {
		const view = this.viewRef.deref();
		if (view && view.isLoaded) {
			this.unsubscribeFromDynamicUpdates();
			this.updateMatch();
			this.subscribeForDynamicUpdates();
			this.updateDynamicState();
		} else {
			this._matchInvalid = true;
		}
	}

	public isSelectorsLatestVersionApplied(): boolean {
		const view = this.viewRef.deref();
		if (!view) {
			Trace.write(`isSelectorsLatestVersionApplied returns default value "false" because "this.viewRef" cleared.`, Trace.categories.Style, Trace.messageType.warn);

			return false;
		}

		return this.viewRef.deref()._styleScope.getSelectorsVersion() === this._appliedSelectorsVersion;
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
		this.stopKeyframeAnimations();
	}

	@profile
	private updateMatch() {
		const view = this.viewRef.deref();
		if (view && view._styleScope) {
			this._match = view._styleScope.matchSelectors(view);
			this._appliedSelectorsVersion = view._styleScope.getSelectorsVersion();
		} else {
			this._match = CssState.emptyMatch;
		}

		this._matchInvalid = false;
	}

	@profile
	private updateDynamicState(): void {
		const view = this.viewRef.deref();
		if (!view) {
			Trace.write(`updateDynamicState not executed to view because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

			return;
		}

		const matchingSelectors = this._match.selectors.filter((sel) => (sel.dynamic ? sel.match(view) : true));
		if (!matchingSelectors || matchingSelectors.length === 0) {
			// Ideally we should return here if there are no matching selectors, however
			// if there are property removals, returning here would not remove them
			// this is seen in STYLE test in automated.
			// return;
		}
		view._batchUpdate(() => {
			this.stopKeyframeAnimations();
			this.setPropertyValues(matchingSelectors);
			this.playKeyframeAnimations(matchingSelectors);
		});
	}

	private playKeyframeAnimations(matchingSelectors: SelectorCore[]): void {
		const animations: kam.KeyframeAnimation[] = [];

		matchingSelectors.forEach((selector) => {
			const ruleAnimations: kam.KeyframeAnimationInfo[] = selector.ruleset[animationsSymbol];
			if (ruleAnimations) {
				ensureKeyframeAnimationModule();
				for (const animationInfo of ruleAnimations) {
					const animation = keyframeAnimationModule.KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
					if (animation) {
						animations.push(animation);
					}
				}
			}
		});

		if ((this._playsKeyframeAnimations = animations.length > 0)) {
			const view = this.viewRef.deref();
			if (!view) {
				Trace.write(`KeyframeAnimations cannot play because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

				return;
			}

			animations.map((animation) => animation.play(<View>view));
			Object.freeze(animations);
			this._appliedAnimations = animations;
		}
	}

	private stopKeyframeAnimations(): void {
		if (!this._playsKeyframeAnimations) {
			return;
		}

		this._appliedAnimations.filter((animation) => animation.isPlaying).forEach((animation) => animation.cancel());
		this._appliedAnimations = CssState.emptyAnimationArray;

		const view = this.viewRef.deref();
		if (view) {
			view.style['keyframe:rotate'] = unsetValue;
			view.style['keyframe:rotateX'] = unsetValue;
			view.style['keyframe:rotateY'] = unsetValue;
			view.style['keyframe:scaleX'] = unsetValue;
			view.style['keyframe:scaleY'] = unsetValue;
			view.style['keyframe:translateX'] = unsetValue;
			view.style['keyframe:translateY'] = unsetValue;
			view.style['keyframe:backgroundColor'] = unsetValue;
			view.style['keyframe:opacity'] = unsetValue;
		} else {
			Trace.write(`KeyframeAnimations cannot be stopped because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);
		}

		this._playsKeyframeAnimations = false;
	}

	/**
	 * Calculate the difference between the previously applied property values,
	 * and the new set of property values that have to be applied for the provided selectors.
	 * Apply the values and ensure each property setter is called at most once to avoid excessive change notifications.
	 * @param matchingSelectors
	 */
	private setPropertyValues(matchingSelectors: SelectorCore[]): void {
		const view = this.viewRef.deref();
		if (!view) {
			Trace.write(`${matchingSelectors} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

			return;
		}

		const newPropertyValues = new view.style.PropertyBag();
		matchingSelectors.forEach((selector) => selector.ruleset.declarations.forEach((declaration) => (newPropertyValues[declaration.property] = declaration.value)));

		const oldProperties = this._appliedPropertyValues;
		// Update values for the scope's css-variables
		view.style.resetScopedCssVariables();

		const valuesToApply = {};
		const cssExpsProperties = {};

		for (const property in newPropertyValues) {
			const value = newPropertyValues[property];
			const isCssExp = isCssVariableExpression(value) || isCssCalcExpression(value);

			if (isCssExp) {
				// we handle css exp separately because css vars must be evaluated first
				cssExpsProperties[property] = value;
				continue;
			}
			delete oldProperties[property];
			if (property in oldProperties && oldProperties[property] === value) {
				// Skip unchanged values
				continue;
			}
			if (isCssVariable(property)) {
				view.style.setScopedCssVariable(property, value);
				delete newPropertyValues[property];
				continue;
			}
			valuesToApply[property] = value;
		}
		//we need to parse CSS vars first before evaluating css expressions
		for (const property in cssExpsProperties) {
			delete oldProperties[property];
			const value = evaluateCssExpressions(view, property, cssExpsProperties[property]);
			if (property in oldProperties && oldProperties[property] === value) {
				// Skip unchanged values
				continue;
			}
			if (value === unsetValue) {
				delete newPropertyValues[property];
			}
			if (isCssVariable(property)) {
				view.style.setScopedCssVariable(property, value);
				delete newPropertyValues[property];
			}

			valuesToApply[property] = value;
		}

		// Unset removed values
		for (const property in oldProperties) {
			if (property in view.style) {
				view.style[`css:${property}`] = unsetValue;
			} else {
				// TRICKY: How do we unset local value?
			}
		}
		// Set new values to the style
		for (const property in valuesToApply) {
			const value = valuesToApply[property];
			try {
				if (property in view.style) {
					view.style[`css:${property}`] = value;
				} else {
					const camelCasedProperty = property.replace(/-([a-z])/g, function (g) {
						return g[1].toUpperCase();
					});
					view[camelCasedProperty] = value;
				}
			} catch (e) {
				Trace.write(`Failed to apply property [${property}] with value [${value}] to ${view}. ${e.stack}`, Trace.categories.Error, Trace.messageType.error);
			}
		}

		this._appliedPropertyValues = newPropertyValues;
	}

	private subscribeForDynamicUpdates(): void {
		const changeMap = this._match.changeMap;
		changeMap.forEach((changes, view) => {
			if (changes.attributes) {
				changes.attributes.forEach((attribute) => {
					view.addEventListener(attribute + 'Change', this._onDynamicStateChangeHandler);
				});
			}
			if (changes.pseudoClasses) {
				changes.pseudoClasses.forEach((pseudoClass) => {
					const eventName = ':' + pseudoClass;
					view.addEventListener(':' + pseudoClass, this._onDynamicStateChangeHandler);
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
				changes.attributes.forEach((attribute) => {
					view.removeEventListener(attribute + 'Change', this._onDynamicStateChangeHandler);
				});
			}
			if (changes.pseudoClasses) {
				changes.pseudoClasses.forEach((pseudoClass) => {
					const eventName = ':' + pseudoClass;
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
		const view = this.viewRef.deref();
		if (!view) {
			Trace.write(`toString() of CssState cannot execute correctly because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

			return '';
		}

		return `${view}._cssState`;
	}
}
CssState.prototype._appliedChangeMap = CssState.emptyChangeMap;
CssState.prototype._appliedAnimations = CssState.emptyAnimationArray;
CssState.prototype._matchInvalid = true;

export class StyleScope {
	private _selectors: SelectorsMap<any>;
	private _css = '';
	private _mergedCssSelectors: RuleSet[];
	private _localCssSelectors: RuleSet[] = [];
	private _localCssSelectorVersion = 0;
	private _localCssSelectorsAppliedVersion = 0;
	private _applicationCssSelectorsAppliedVersion = 0;
	private _keyframes = new Map<string, Keyframes>();
	private _cssFiles: string[] = [];

	get css(): string {
		return this._css;
	}

	set css(value: string) {
		this.setCss(value);
	}

	public addCss(cssString: string, cssFileName?: string): void {
		this.appendCss(cssString, cssFileName);
	}

	public addCssFile(cssFileName: string): void {
		this.appendCss(null, cssFileName);
	}

	public changeCssFile(cssFileName: string): void {
		if (!cssFileName) {
			return;
		}
		this._cssFiles.push(cssFileName);
		currentScopeTag = cssFileName;

		const cssSelectors = CSSSource.fromURI(cssFileName, this._keyframes);
		currentScopeTag = null;
		this._css = cssSelectors.source;
		this._localCssSelectors = cssSelectors.selectors;
		this._localCssSelectorVersion++;
		this.ensureSelectors();
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
		if (cssFileName) {
			this._cssFiles.push(cssFileName);
			currentScopeTag = cssFileName;
		}

		const parsedCssSelectors = cssString ? CSSSource.fromSource(cssString, this._keyframes, cssFileName) : CSSSource.fromURI(cssFileName, this._keyframes);
		currentScopeTag = null;
		this._css = this._css + parsedCssSelectors.source;
		this._localCssSelectors.push(...parsedCssSelectors.selectors);
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
		animation.keyframes = cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(cssKeyframes.keyframes);

		return animation;
	}

	public ensureSelectors(): number {
		if (!this.isApplicationCssSelectorsLatestVersionApplied() || !this.isLocalCssSelectorsLatestVersionApplied() || !this._mergedCssSelectors) {
			this._createSelectors();
		}

		return this.getSelectorsVersion();
	}

	public _increaseApplicationCssSelectorVersion(): void {
		applicationCssSelectorVersion++;
	}

	public isApplicationCssSelectorsLatestVersionApplied(): boolean {
		return this._applicationCssSelectorsAppliedVersion === applicationCssSelectorVersion;
	}

	public isLocalCssSelectorsLatestVersionApplied(): boolean {
		return this._localCssSelectorsAppliedVersion === this._localCssSelectorVersion;
	}

	@profile
	private _createSelectors() {
		const toMerge: RuleSet[][] = [];
		toMerge.push(applicationCssSelectors.filter((v) => !v.scopedTag || this._cssFiles.indexOf(v.scopedTag) >= 0));
		this._applicationCssSelectorsAppliedVersion = applicationCssSelectorVersion;
		toMerge.push(this._localCssSelectors);
		this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;
		for (const keyframe in applicationKeyframes) {
			this._keyframes[keyframe] = applicationKeyframes[keyframe];
		}

		if (toMerge.length > 0) {
			this._mergedCssSelectors = toMerge.reduce((merged, next) => merged.concat(next || []), []);
			this._applyKeyframesOnSelectors();
			this._selectors = new SelectorsMap(this._mergedCssSelectors);
		}
	}

	// HACK: This @profile decorator creates a circular dependency
	// HACK: because the function parameter type is evaluated with 'typeof'
	@profile
	public matchSelectors(view): SelectorsMatch<ViewBase> {
		// should be (view: ViewBase): SelectorsMatch<ViewBase>
		this.ensureSelectors();

		return this._selectors.query(view);
	}

	public query(node: Node): SelectorCore[] {
		this.ensureSelectors();

		return this._selectors.query(node).selectors;
	}

	getSelectorsVersion() {
		// The counters can only go up. So we can return just appVersion + localVersion
		// The 100000 * appVersion is just for easier debugging
		return 100000 * this._applicationCssSelectorsAppliedVersion + this._localCssSelectorsAppliedVersion;
	}

	private _applyKeyframesOnSelectors() {
		for (let i = this._mergedCssSelectors.length - 1; i >= 0; i--) {
			const ruleset = this._mergedCssSelectors[i];
			const animations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];
			if (animations !== undefined && animations.length) {
				ensureCssAnimationParserModule();
				for (const animation of animations) {
					const cssKeyframe = this._keyframes[animation.name];
					if (cssKeyframe !== undefined) {
						animation.keyframes = cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(cssKeyframe.keyframes);
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
	let fileName: string = typeof url === 'string' ? url.trim() : '';
	if (fileName.indexOf('~/') === 0) {
		fileName = fileName.replace('~/', '');
	}

	const isAbsolutePath = fileName.indexOf('/') === 0;
	const absolutePath = isAbsolutePath ? fileName : path.join(appDirectory, fileName);
	if (fileExists(absolutePath)) {
		return absolutePath;
	}

	if (!isAbsolutePath) {
		if (fileName[0] === '~' && fileName[1] !== '/' && fileName[1] !== '"') {
			fileName = fileName.substr(1);
		}

		if (importSource) {
			const importFile = resolveFilePathFromImport(importSource, fileName);
			if (fileExists(importFile)) {
				return importFile;
			}
		}

		const external = path.join(appDirectory, 'tns_modules', fileName);
		if (fileExists(external)) {
			return external;
		}
	}

	return null;
}

function resolveFilePathFromImport(importSource: string, fileName: string): string {
	const importSourceParts = importSource.split(path.separator);
	const fileNameParts = fileName
		.split(path.separator)
		// exclude the dot-segment for current directory
		.filter((p) => !isCurrentDirectory(p));

	// remove current file name
	importSourceParts.pop();
	// remove element in case of dot-segment for parent directory or add file name
	fileNameParts.forEach((p) => (isParentDirectory(p) ? importSourceParts.pop() : importSourceParts.push(p)));

	return importSourceParts.join(path.separator);
}

export const applyInlineStyle = profile(function applyInlineStyle(view: ViewBase, styleStr: string) {
	const localStyle = `local { ${styleStr} }`;
	const inlineRuleSet = CSSSource.fromSource(localStyle, new Map()).selectors;

	// Reset unscoped css-variables
	view.style.resetUnscopedCssVariables();

	// Set all the css-variables first, so we can be sure they are up-to-date
	inlineRuleSet[0].declarations.forEach((d) => {
		// Use the actual property name so that a local value is set.
		const property = d.property;
		if (isCssVariable(property)) {
			view.style.setUnscopedCssVariable(property, d.value);
		}
	});

	inlineRuleSet[0].declarations.forEach((d) => {
		// Use the actual property name so that a local value is set.
		const property = d.property;
		try {
			if (isCssVariable(property)) {
				// Skip css-variables, they have been handled
				return;
			}

			const value = evaluateCssExpressions(view, property, d.value);
			if (property in view.style) {
				view.style[property] = value;
			} else {
				view[property] = value;
			}
		} catch (e) {
			Trace.write(`Failed to apply property [${d.property}] with value [${d.value}] to ${view}. ${e}`, Trace.categories.Error, Trace.messageType.error);
		}
	});

	// This is needed in case of changes to css-variable or css-calc expressions.
	view._onCssStateChange();
});

function isCurrentDirectory(uriPart: string): boolean {
	return uriPart === '.';
}

function isParentDirectory(uriPart: string): boolean {
	return uriPart === '..';
}

function isKeyframe(node: CssNode): node is KeyframesDefinition {
	return node.type === 'keyframes';
}
