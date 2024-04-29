import { ViewBase } from '../core/view-base';
import { View } from '../core/view';
import { unsetValue, _evaluateCssVariableExpression, _evaluateCssCalcExpression, isCssVariable, isCssVariableExpression, isCssCalcExpression } from '../core/properties';
import * as ReworkCSS from '../../css';

import { RuleSet, StyleSheetSelectorScope, SelectorCore, SelectorsMatch, ChangeMap, fromAstNode, Node, MEDIA_QUERY_SEPARATOR, matchMediaQueryString } from './css-selector';
import { Trace } from '../../trace';
import { File, knownFolders, path } from '../../file-system';
import { Application, CssChangedEventData, LoadAppCSSEventData } from '../../application';
import { profile } from '../../profiling';

import * as kam from '../animation/keyframe-animation';
let keyframeAnimationModule: typeof kam;
function ensureKeyframeAnimationModule() {
	if (!keyframeAnimationModule) {
		keyframeAnimationModule = require('../animation/keyframe-animation');
	}
}

import * as capm from './css-animation-parser';
import { sanitizeModuleName } from '../../utils/common';
import { resolveModuleName } from '../../module-name-resolver';
import { cleanupImportantFlags } from './css-utils';
import { Observable, PropertyChangeData } from '../../data/observable';

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

type KeyframesMap = Map<string, kam.Keyframes[]>;

let mergedApplicationCssSelectors: RuleSet[] = [];
let applicationCssSelectors: RuleSet[] = [];
const applicationAdditionalSelectors: RuleSet[] = [];

let mergedApplicationCssKeyframes: kam.Keyframes[] = [];
let applicationCssKeyframes: kam.Keyframes[] = [];
const applicationAdditionalKeyframes: kam.Keyframes[] = [];

let applicationCssSelectorVersion = 0;

const tagToScopeTag: Map<string | number, string> = new Map();
let currentScopeTag: string = null;

const animationsSymbol = Symbol('animations');
const kebabCasePattern = /-([a-z])/g;
const pattern = /('|")(.*?)\1/;

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
	mergedApplicationCssSelectors = applicationCssSelectors.slice();
	mergedApplicationCssSelectors.push(...applicationAdditionalSelectors);
}

export function mergeCssKeyframes(): void {
	mergedApplicationCssKeyframes = applicationCssKeyframes.slice();
	mergedApplicationCssKeyframes.push(...applicationAdditionalKeyframes);
}

class CSSSource {
	private _selectors: RuleSet[] = [];
	private _keyframes: kam.Keyframes[] = [];

	private constructor(
		private _ast: ReworkCSS.SyntaxTree,
		private _url: string,
		private _file: string,
		private _source: string,
	) {
		this.parse();
	}

	public static fromDetect(cssOrAst: any, fileName?: string): CSSSource {
		if (typeof cssOrAst === 'string') {
			// raw-loader
			return CSSSource.fromSource(cssOrAst, fileName);
		} else if (typeof cssOrAst === 'object') {
			if (cssOrAst.default) {
				cssOrAst = cssOrAst.default;
			}

			if (cssOrAst.type === 'stylesheet' && cssOrAst.stylesheet && cssOrAst.stylesheet.rules) {
				// css-loader
				return CSSSource.fromAST(cssOrAst, fileName);
			}
		}

		// css2json-loader
		return CSSSource.fromSource(cssOrAst.toString(), fileName);
	}

	public static fromURI(uri: string): CSSSource {
		// webpack modules require all file paths to be relative to /app folder
		const appRelativeUri = CSSSource.pathRelativeToApp(uri);
		const sanitizedModuleName = sanitizeModuleName(appRelativeUri);
		const resolvedModuleName = resolveModuleName(sanitizedModuleName, 'css');

		try {
			const cssOrAst = global.loadModule(resolvedModuleName, true);
			if (cssOrAst) {
				return CSSSource.fromDetect(cssOrAst, resolvedModuleName);
			}
		} catch (e) {
			if (Trace.isEnabled()) {
				Trace.write(`Could not load CSS from ${uri}: ${e}`, Trace.categories.Error, Trace.messageType.warn);
			}
		}

		return CSSSource.fromFile(appRelativeUri);
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

		const relativeUri = `.${uri.substring(appPath.length)}`;

		return relativeUri;
	}

	public static fromFile(url: string): CSSSource {
		// .scss, .sass, etc. css files in vanilla app are usually compiled to .css so we will try to load a compiled file first.
		const cssFileUrl = url.replace(/\..\w+$/, '.css');
		if (cssFileUrl !== url) {
			const cssFile = CSSSource.resolveCSSPathFromURL(cssFileUrl);
			if (cssFile) {
				return new CSSSource(undefined, url, cssFile, undefined);
			}
		}

		const file = CSSSource.resolveCSSPathFromURL(url);

		return new CSSSource(undefined, url, file, undefined);
	}

	public static fromFileImport(url: string, importSource: string): CSSSource {
		const file = CSSSource.resolveCSSPathFromURL(url, importSource);

		return new CSSSource(undefined, url, file, undefined);
	}

	@profile
	public static resolveCSSPathFromURL(url: string, importSource?: string): string {
		const app = knownFolders.currentApp().path;
		const file = resolveFileNameFromUrl(url, app, File.exists, importSource);

		return file;
	}

	public static fromSource(source: string, url?: string): CSSSource {
		return new CSSSource(undefined, url, undefined, source);
	}

	public static fromAST(ast: ReworkCSS.SyntaxTree, url?: string): CSSSource {
		return new CSSSource(ast, url, undefined, undefined);
	}

	get selectors(): RuleSet[] {
		return this._selectors;
	}

	get keyframes(): kam.Keyframes[] {
		return this._keyframes;
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
				this.createSelectorsAndKeyframes();
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
	private createSelectorsAndKeyframes() {
		if (this._ast) {
			const nodes = this._ast.stylesheet.rules;

			const rulesets: RuleSet[] = [];
			const keyframes: kam.Keyframes[] = [];

			// When css2json-loader is enabled, imports are handled there and removed from AST rules
			this.populateRulesFromImports(nodes, rulesets, keyframes);
			this.populateRules(nodes, rulesets, keyframes, null);

			if (rulesets && rulesets.length) {
				ensureCssAnimationParserModule();

				rulesets.forEach((rule) => {
					rule[animationsSymbol] = cssAnimationParserModule.CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations);
				});
			}

			this._selectors = rulesets;
			this._keyframes = keyframes;
		}
	}

	private populateRulesFromImports(nodes: ReworkCSS.Node[], rulesets: RuleSet[], keyframes: kam.Keyframes[]): void {
		const imports = nodes.filter((r) => r.type === 'import');
		if (!imports.length) {
			return;
		}

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

		const getCssFile = ({ url, source }) => (source ? CSSSource.fromFileImport(url, source) : CSSSource.fromURI(url));

		const cssFiles = imports
			.map(toUrlSourcePair)
			.filter(({ url }) => !!url)
			.map(getCssFile);

		for (const cssFile of cssFiles) {
			if (cssFile) {
				rulesets.push(...cssFile.selectors);
				keyframes.push(...cssFile.keyframes);
			}
		}
	}

	private populateRules(nodes: ReworkCSS.Node[], rulesets: RuleSet[], keyframes: kam.Keyframes[], mediaQueryString: string): void {
		for (const node of nodes) {
			if (isKeyframe(node)) {
				const keyframeRule: kam.Keyframes = {
					name: node.name,
					keyframes: node.keyframes,
					mediaQueryString: mediaQueryString,
				};

				keyframes.push(keyframeRule);
			} else if (isMedia(node)) {
				// Media query is composite in the case of nested media queries
				const compositeMediaQuery = mediaQueryString ? mediaQueryString + MEDIA_QUERY_SEPARATOR + node.media : node.media;

				this.populateRules(node.rules, rulesets, keyframes, compositeMediaQuery);
			} else if (isRule(node)) {
				const ruleset = fromAstNode(node);
				ruleset.mediaQueryString = mediaQueryString;

				rulesets.push(ruleset);
			}
		}
	}

	toString(): string {
		return this._file || this._url || '(in-memory)';
	}
}

export function removeTaggedAdditionalCSS(tag: string | number): boolean {
	let selectorsChanged = false;
	let keyframesChanged = false;
	let updated = false;

	for (let i = 0; i < applicationAdditionalSelectors.length; i++) {
		if (applicationAdditionalSelectors[i].tag === tag) {
			applicationAdditionalSelectors.splice(i, 1);
			i--;
			selectorsChanged = true;
		}
	}

	for (let i = 0; i < applicationAdditionalKeyframes.length; i++) {
		if (applicationAdditionalKeyframes[i].tag === tag) {
			applicationAdditionalKeyframes.splice(i, 1);
			i--;
			keyframesChanged = true;
		}
	}

	if (selectorsChanged) {
		mergeCssSelectors();
		updated = true;
	}

	if (keyframesChanged) {
		mergeCssKeyframes();
		updated = true;
	}

	if (updated) {
		applicationCssSelectorVersion++;
	}

	return updated;
}

export function addTaggedAdditionalCSS(cssText: string, tag?: string | number): boolean {
	const { selectors, keyframes } = CSSSource.fromDetect(cssText, undefined);
	const tagScope = currentScopeTag || (tag && tagToScopeTag.has(tag) && tagToScopeTag.get(tag)) || null;

	if (tagScope && tag) {
		tagToScopeTag.set(tag, tagScope);
	}

	let selectorsChanged = false;
	let keyframesChanged = false;
	let updated = false;

	if (selectors && selectors.length) {
		selectorsChanged = true;

		if (tag != null || tagScope != null) {
			for (let i = 0, length = selectors.length; i < length; i++) {
				selectors[i].tag = tag;
				selectors[i].scopedTag = tagScope;
			}
		}

		applicationAdditionalSelectors.push(...selectors);
		mergeCssSelectors();
		updated = true;
	}

	if (keyframes && keyframes.length) {
		keyframesChanged = true;

		if (tag != null || tagScope != null) {
			for (let i = 0, length = keyframes.length; i < length; i++) {
				keyframes[i].tag = tag;
				keyframes[i].scopedTag = tagScope;
			}
		}

		applicationAdditionalKeyframes.push(...keyframes);
		mergeCssKeyframes();
		updated = true;
	}

	if (updated) {
		applicationCssSelectorVersion++;
	}

	return updated;
}

const onCssChanged = profile('"style-scope".onCssChanged', (args: CssChangedEventData) => {
	if (args.cssText) {
		const { selectors, keyframes } = CSSSource.fromSource(args.cssText, args.cssFile);
		let updated = false;

		if (selectors) {
			applicationAdditionalSelectors.push(...selectors);
			mergeCssSelectors();
			updated = true;
		}

		if (keyframes) {
			applicationAdditionalKeyframes.push(...keyframes);
			mergeCssKeyframes();
			updated = true;
		}

		if (updated) {
			applicationCssSelectorVersion++;
		}
	} else if (args.cssFile) {
		loadCss(args.cssFile, null, null);
	}
});

function onLiveSync(args: CssChangedEventData): void {
	loadCss(Application.getCssFileName(), null, null);
}

const loadCss = profile(`"style-scope".loadCss`, (cssModule: string): void => {
	if (!cssModule) {
		return;
	}

	// safely remove "./" as global CSS should be resolved relative to app folder
	if (cssModule.startsWith('./')) {
		cssModule = cssModule.substring(2);
	}

	const { selectors, keyframes } = CSSSource.fromURI(cssModule);
	let updated = false;

	// Check for existing application css selectors too in case the app is undergoing a live-sync
	if (selectors.length > 0 || applicationCssSelectors.length > 0) {
		applicationCssSelectors = selectors;
		mergeCssSelectors();
		updated = true;
	}

	// Check for existing application css keyframes too in case the app is undergoing a live-sync
	if (keyframes.length > 0 || applicationCssKeyframes.length > 0) {
		applicationCssKeyframes = keyframes;
		mergeCssKeyframes();
		updated = true;
	}

	if (updated) {
		applicationCssSelectorVersion++;
	}
});

global.NativeScriptGlobals.events.on('cssChanged', <any>onCssChanged);
global.NativeScriptGlobals.events.on('livesync', onLiveSync);

// Call to this method is injected in the application in:
//  - no-snapshot - code injected in app.ts by [bundle-config-loader](https://github.com/NativeScript/nativescript-dev-webpack/blob/9b1e34d8ef838006c9b575285c42d2304f5f02b5/bundle-config-loader.ts#L85-L92)
//  - with-snapshot - code injected in snapshot bundle by [NativeScriptSnapshotPlugin](https://github.com/NativeScript/nativescript-dev-webpack/blob/48b26f412fd70c19dc0b9c7763e08e9505a0ae11/plugins/NativeScriptSnapshotPlugin/index.js#L48-L56)
// Having the app.css loaded in snapshot provides significant boost in startup (when using the ns-theme ~150 ms). However, because app.css is resolved at build-time,
// when the snapshot is created - there is no way to use file qualifiers or change the name of on app.css
export const loadAppCSS = profile('"style-scope".loadAppCSS', (args: LoadAppCSSEventData) => {
	loadCss(args.cssFile, null, null);
	global.NativeScriptGlobals.events.off('loadAppCss', loadAppCSS);
});

if (Application.hasLaunched()) {
	loadAppCSS(
		{
			eventName: 'loadAppCss',
			object: Application,
			cssFile: Application.getCssFileName(),
		},
		null,
		null,
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

	private _dynamicUpdateListenerMap: Map<ViewBase, (t: any) => void> = new Map();

	constructor(private viewRef: WeakRef<ViewBase>) {
		this._onDynamicStateChangeHandler = () => this.updateDynamicState();
	}

	/**
	 * Called when a change had occurred that may invalidate the statically matching selectors (class, id, ancestor selectors).
	 * As a result, at some point in time, the selectors matched have to be requerried from the style scope and applied to the view.
	 */
	public onChange(): void {
		const view = this.viewRef.get();
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
		const view = this.viewRef.get();
		if (!view) {
			Trace.write(`isSelectorsLatestVersionApplied returns default value "false" because "this.viewRef" cleared.`, Trace.categories.Style, Trace.messageType.warn);

			return false;
		}

		return this.viewRef.get()._styleScope.getSelectorsVersion() === this._appliedSelectorsVersion;
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
		const view = this.viewRef.get();
		if (view && view._styleScope) {
			this._match = view._styleScope.matchSelectors(view) ?? CssState.emptyMatch;
			this._appliedSelectorsVersion = view._styleScope.getSelectorsVersion();
		} else {
			this._match = CssState.emptyMatch;
		}

		this._matchInvalid = false;
	}

	@profile
	private updateDynamicState(): void {
		const view = this.viewRef.get();
		if (!view) {
			Trace.write(`updateDynamicState not executed to view because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

			return;
		}

		const matchingSelectors = this._match.selectors.filter((sel) => (sel.dynamic ? sel.match(view) : true));

		// Ideally we should return here if there are no matching selectors, however
		// if there are property removals, returning here would not remove them
		// this is seen in STYLE test in automated.
		// if (!matchingSelectors || matchingSelectors.length === 0) {
		// 		return;
		// }

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
			const view = this.viewRef.get();
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

		const view = this.viewRef.get();
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
		const view = this.viewRef.get();
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
		const replacementFunc = (g) => g[1].toUpperCase();

		for (const property in newPropertyValues) {
			const value = cleanupImportantFlags(newPropertyValues[property], property);

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
				const camelCasedProperty = property.replace(kebabCasePattern, replacementFunc);
				view[camelCasedProperty] = unsetValue;
			}
		}
		// Set new values to the style
		for (const property in valuesToApply) {
			const value = valuesToApply[property];
			try {
				if (property in view.style) {
					view.style[`css:${property}`] = value;
				} else {
					const camelCasedProperty = property.replace(kebabCasePattern, replacementFunc);
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
				const attributes = changes.attributes;
				const listener = (args: PropertyChangeData) => {
					if (attributes.has(args.propertyName)) {
						this._onDynamicStateChangeHandler();
					}
				};
				this._dynamicUpdateListenerMap.set(view, listener);
				view.addEventListener(Observable.propertyChangeEvent, listener);
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
			if (this._dynamicUpdateListenerMap.has(view)) {
				view.removeEventListener(Observable.propertyChangeEvent, this._dynamicUpdateListenerMap.get(view));
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
		this._dynamicUpdateListenerMap.clear();
		this._appliedChangeMap = CssState.emptyChangeMap;
	}

	toString(): string {
		const view = this.viewRef.get();
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
	private _selectorScope: StyleSheetSelectorScope<any>;
	private _css = '';

	private _mergedCssSelectors: RuleSet[];
	private _mergedCssKeyframes: kam.Keyframes[];

	private _localCssSelectors: RuleSet[] = [];
	private _localCssKeyframes: kam.Keyframes[] = [];
	private _localCssSelectorVersion = 0;

	private _localCssSelectorsAppliedVersion = 0;
	private _applicationCssSelectorsAppliedVersion = 0;
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

		const cssFile = CSSSource.fromURI(cssFileName);

		currentScopeTag = null;
		this._css = cssFile.source;
		this._localCssSelectors = cssFile.selectors;
		this._localCssKeyframes = cssFile.keyframes;
		this._localCssSelectorVersion++;
		this.ensureSelectors();
	}

	@profile
	private setCss(cssString: string, cssFileName?): void {
		this._css = cssString;

		const cssFile = CSSSource.fromSource(cssString, cssFileName);
		this._localCssSelectors = cssFile.selectors;
		this._localCssKeyframes = cssFile.keyframes;
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

		const cssFile = cssString ? CSSSource.fromSource(cssString, cssFileName) : CSSSource.fromURI(cssFileName);

		currentScopeTag = null;
		this._css = this._css + cssFile.source;
		this._localCssSelectors.push(...cssFile.selectors);
		this._localCssKeyframes.push(...cssFile.keyframes);
		this._localCssSelectorVersion++;
		this.ensureSelectors();
	}

	public getKeyframeAnimationWithName(animationName: string): kam.KeyframeAnimationInfo {
		if (!this._mergedCssKeyframes) {
			return null;
		}

		const keyframeRule = this.findKeyframeRule(animationName);

		ensureKeyframeAnimationModule();
		const animation = new keyframeAnimationModule.KeyframeAnimationInfo();
		ensureCssAnimationParserModule();
		animation.keyframes = keyframeRule ? cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(keyframeRule.keyframes) : null;

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
		const toMerge: RuleSet[] = [];
		const toMergeKeyframes: kam.Keyframes[] = [];

		toMerge.push(...mergedApplicationCssSelectors.filter((v) => !v.scopedTag || this._cssFiles.indexOf(v.scopedTag) >= 0));
		toMergeKeyframes.push(...mergedApplicationCssKeyframes.filter((v) => !v.scopedTag || this._cssFiles.indexOf(v.scopedTag) >= 0));
		this._applicationCssSelectorsAppliedVersion = applicationCssSelectorVersion;

		toMerge.push(...this._localCssSelectors);
		toMergeKeyframes.push(...this._localCssKeyframes);
		this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;

		if (toMerge.length > 0) {
			this._mergedCssSelectors = toMerge;
			this._selectorScope = new StyleSheetSelectorScope(this._mergedCssSelectors);
		} else {
			this._mergedCssSelectors = null;
			this._selectorScope = null;
		}

		this._mergedCssKeyframes = toMergeKeyframes.length > 0 ? toMergeKeyframes : null;
	}

	// HACK: This @profile decorator creates a circular dependency
	// HACK: because the function parameter type is evaluated with 'typeof'
	@profile
	public matchSelectors(view): SelectorsMatch<ViewBase> {
		let match: SelectorsMatch<ViewBase>;

		// should be (view: ViewBase): SelectorsMatch<ViewBase>
		this.ensureSelectors();

		if (this._selectorScope) {
			match = this._selectorScope.query(view);

			// Make sure to re-apply keyframes to matching selectors as a media query keyframe might be applicable at this point
			this._applyKeyframesToSelectors(match.selectors);
		} else {
			match = null;
		}

		return match;
	}

	public query(node: Node): SelectorCore[] {
		this.ensureSelectors();

		const match = this.matchSelectors(node);
		return match ? match.selectors : [];
	}

	getSelectorsVersion() {
		// The counters can only go up. So we can return just appVersion + localVersion
		// The 100000 * appVersion is just for easier debugging
		return 100000 * this._applicationCssSelectorsAppliedVersion + this._localCssSelectorsAppliedVersion;
	}

	private _applyKeyframesToSelectors(selectors: SelectorCore[]) {
		if (!selectors?.length) {
			return;
		}

		for (let i = selectors.length - 1; i >= 0; i--) {
			const ruleset = selectors[i].ruleset;
			const animations: kam.KeyframeAnimationInfo[] = ruleset[animationsSymbol];

			if (animations != null && animations.length) {
				ensureCssAnimationParserModule();

				for (const animation of animations) {
					const keyframeRule = this.findKeyframeRule(animation.name);
					animation.keyframes = keyframeRule ? cssAnimationParserModule.CssAnimationParser.keyframesArrayFromCSS(keyframeRule.keyframes) : null;
				}
			}
		}
	}

	public getAnimations(ruleset: RuleSet): kam.KeyframeAnimationInfo[] {
		return ruleset[animationsSymbol];
	}

	private findKeyframeRule(animationName: string): kam.Keyframes {
		if (!this._mergedCssKeyframes) {
			return null;
		}

		// Cache media query results to avoid validations of other identical queries
		let validatedMediaQueries: string[];

		// Iterate in reverse order as the last usable keyframe rule matters the most
		for (let i = this._mergedCssKeyframes.length - 1; i >= 0; i--) {
			const rule = this._mergedCssKeyframes[i];
			if (rule.name !== animationName) {
				continue;
			}

			if (!rule.mediaQueryString) {
				return rule;
			}

			if (!validatedMediaQueries) {
				validatedMediaQueries = [];
			}

			const isMatchingAllQueries = matchMediaQueryString(rule.mediaQueryString, validatedMediaQueries);
			if (isMatchingAllQueries) {
				return rule;
			}
		}

		return null;
	}
}

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
			fileName = fileName.substring(1);
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
	const inlineRuleSet = CSSSource.fromSource(localStyle).selectors;

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

function isMedia(node: ReworkCSS.Node): node is ReworkCSS.Media {
	return node.type === 'media';
}

function isKeyframe(node: ReworkCSS.Node): node is ReworkCSS.Keyframes {
	return node.type === 'keyframes';
}

function isRule(node: ReworkCSS.Node): node is ReworkCSS.Rule {
	return node.type === 'rule';
}
