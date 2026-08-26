import { getNativeScriptGlobals } from '../../globals/global-utils';
import { ViewBase } from '../core/view-base';
import { View } from '../core/view';
import { _evaluateCssVariableExpression, _evaluateCssCalcExpression, _expandCssShorthand, _isCssPendingSubstitution, CssPendingSubstitution, isCssVariable, isCssVariableExpression, isCssCalcExpression } from '../core/properties';
import { unsetValue } from '../core/properties/property-shared';
import * as ReworkCSS from '../../css';

import { RuleSet, StyleSheetSelectorScope, SelectorCore, SelectorTier, SelectorsMatch, ChangeMap, Changes, fromAstNode, Node, matchMediaQueryString, matchSelectorCandidates } from './css-selector';
import { Trace } from './styling-shared';
import { File, knownFolders, path } from '../../file-system';
import { Application, CssChangedEventData, LoadAppCSSEventData } from '../../application';
import { profile } from './styling-profile';

import { Keyframes, KeyframeAnimationInfo, KeyframeAnimation } from '../animation/keyframe-animation';

import { CssAnimationParser } from './css-animation-parser';
import { sanitizeModuleName } from '../../utils/common';
import { resolveModuleName } from '../../module-name-resolver';
import { cssTreeParse } from '../../css/css-tree-parser';
import { CSS3Parser } from '../../css/CSS3Parser';
import { CSSNativeScript } from '../../css/CSSNativeScript';
import { parse as parseCss } from '../../css/lib/parse';
// @ts-ignore apps resolve this at runtime with path alias in project bundlers
import appConfig from '~/package.json';

let parser: 'rework' | 'nativescript' | 'css-tree' = 'css-tree';
try {
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

type KeyframesMap = Map<string, Keyframes[]>;

let mergedApplicationCssSelectors: RuleSet[] = [];
let applicationCssSelectors: RuleSet[] = [];
const applicationAdditionalSelectors: RuleSet[] = [];
let mergedApplicationCssSelectorsInvalid = false;

let mergedApplicationCssKeyframes: Keyframes[] = [];
let applicationCssKeyframes: Keyframes[] = [];
const applicationAdditionalKeyframes: Keyframes[] = [];
let mergedApplicationCssKeyframesInvalid = false;

let applicationCssSelectorVersion = 0;

/**
 * The application stylesheets are the same for every style scope, so they are
 * indexed once here instead of once per scope. Rules that were registered on
 * behalf of a particular stylesheet stay in the index and are filtered out at
 * match time for scopes that never loaded it - see `matchSelectorCandidates`.
 */
let applicationSelectorScope: StyleSheetSelectorScope<any> = null;
let applicationSelectorScopeVersion = -1;
let applicationSelectorScopeRuleCount = 0;
let applicationSelectorsHaveScopedTags = false;
/**
 * Bumped whenever the application rules change in a way an append cannot express
 * - a stylesheet reload, or a tagged stylesheet being removed.
 */
let applicationSelectorsResetVersion = 0;
let applicationSelectorScopeResetVersion = -1;

const tagToScopeTag: Map<string | number, string> = new Map();
let currentScopeTag: string = null;

const animationsSymbol = Symbol('animations');
const kebabCasePattern = /-([a-z])/g;
const kebabCaseReplacementFunc = (g: string) => g[1].toUpperCase();
const pattern = /('|")(.*?)\1/;

/**
 * Resolve a pending-substitution value into the longhand values it stands for.
 *
 * The shorthand is only parsed here, once the expression it holds has been
 * evaluated against the view - which is the point of the placeholder. A shorthand
 * that does not survive evaluation leaves its longhands unset.
 */
function resolvePendingSubstitution(view: ViewBase, pending: CssPendingSubstitution): Record<string, unknown> {
	const value = evaluateCssExpressions(view, pending.shorthand, pending.value);
	if (value === unsetValue) {
		return CssState.emptyPropertyBag;
	}

	const expanded = _expandCssShorthand(pending.shorthand, value);
	if (!expanded) {
		Trace.write(`Failed to expand shorthand [${pending.shorthand}] resolved to [${value}] for ${view}.`, Trace.categories.Style, Trace.messageType.warn);

		return CssState.emptyPropertyBag;
	}

	const resolved: Record<string, unknown> = {};
	for (let i = 0, length = expanded.length; i < length; i++) {
		resolved[expanded[i][0]] = expanded[i][1];
	}

	return resolved;
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

/**
 * Frameworks register component stylesheets one at a time, so merging eagerly on
 * every call is O(stylesheets * rules). Mark the merged list dirty instead and
 * rebuild it the next time a style scope actually reads it.
 */
export function mergeCssSelectors(): void {
	mergedApplicationCssSelectorsInvalid = true;
}

export function mergeCssKeyframes(): void {
	mergedApplicationCssKeyframesInvalid = true;
}

function getMergedApplicationCssSelectors(): RuleSet[] {
	if (mergedApplicationCssSelectorsInvalid) {
		mergedApplicationCssSelectorsInvalid = false;
		mergedApplicationCssSelectors = concatRuleSets(applicationCssSelectors, applicationAdditionalSelectors);
	}

	return mergedApplicationCssSelectors;
}

function getMergedApplicationCssKeyframes(): Keyframes[] {
	if (mergedApplicationCssKeyframesInvalid) {
		mergedApplicationCssKeyframesInvalid = false;
		mergedApplicationCssKeyframes = concatRuleSets(applicationCssKeyframes, applicationAdditionalKeyframes);
	}

	return mergedApplicationCssKeyframes;
}

function getApplicationSelectorScope(): StyleSheetSelectorScope<any> {
	if (applicationSelectorScopeVersion === applicationCssSelectorVersion) {
		return applicationSelectorScope;
	}

	const rulesets = getMergedApplicationCssSelectors();
	const canAppend = applicationSelectorScope && applicationSelectorScopeResetVersion === applicationSelectorsResetVersion && rulesets.length >= applicationSelectorScopeRuleCount;

	if (canAppend) {
		applicationSelectorScope.appendRulesets(rulesets, applicationSelectorScopeRuleCount);
	} else {
		applicationSelectorScope = rulesets.length > 0 ? new StyleSheetSelectorScope(rulesets, SelectorTier.Application) : null;
		applicationSelectorsHaveScopedTags = false;
		applicationSelectorScopeRuleCount = 0;
	}

	for (let i = applicationSelectorScopeRuleCount, length = rulesets.length; i < length; i++) {
		if (rulesets[i].scopedTag) {
			applicationSelectorsHaveScopedTags = true;
			break;
		}
	}

	applicationSelectorScopeRuleCount = rulesets.length;
	applicationSelectorScopeVersion = applicationCssSelectorVersion;
	applicationSelectorScopeResetVersion = applicationSelectorsResetVersion;

	return applicationSelectorScope;
}

/**
 * `push(...arr)` passes every element as an argument, which allocates and blows
 * the stack once a stylesheet grows past the engine's argument limit.
 */
function concatRuleSets<T>(base: T[], additional: T[]): T[] {
	const baseLength = base.length;
	const merged: T[] = new Array(baseLength + additional.length);

	for (let i = 0; i < baseLength; i++) {
		merged[i] = base[i];
	}

	for (let i = 0, length = additional.length; i < length; i++) {
		merged[baseLength + i] = additional[i];
	}

	return merged;
}

class CSSSource {
	private _selectors: RuleSet[] = [];
	private _keyframes: Keyframes[] = [];

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

	get keyframes(): Keyframes[] {
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
	private parseCSSAst(): void {
		if (this._source) {
			if (__CSS_PARSER__ === 'css-tree') {
				this._ast = cssTreeParse(this._source, this._file);
			} else if (__CSS_PARSER__ === 'nativescript') {
				const cssparser = new CSS3Parser(this._source);
				const stylesheet = cssparser.parseAStylesheet();
				const cssNS = new CSSNativeScript();
				this._ast = cssNS.parseStylesheet(stylesheet);
			} else if (__CSS_PARSER__ === 'rework') {
				this._ast = parseCss(this._source, { source: this._file });
			}
		}
	}

	@profile
	private createSelectorsAndKeyframes() {
		if (this._ast) {
			const nodes = this._ast.stylesheet.rules;

			const rulesets: RuleSet[] = [];
			const keyframes: Keyframes[] = [];

			// When css2json-loader is enabled, imports are handled there and removed from AST rules
			populateRulesFromImports(nodes, rulesets, keyframes);
			_populateRules(nodes, rulesets, keyframes);

			if (rulesets && rulesets.length) {
				rulesets.forEach((rule) => {
					rule[animationsSymbol] = CssAnimationParser.keyframeAnimationsFromCSSDeclarations(rule.declarations);
				});
			}

			this._selectors = rulesets;
			this._keyframes = keyframes;
		}
	}

	toString(): string {
		return this._file || this._url || '(in-memory)';
	}
}

function populateRulesFromImports(nodes: ReworkCSS.Node[], rulesets: RuleSet[], keyframes: Keyframes[]): void {
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

export function _populateRules(nodes: ReworkCSS.Node[], rulesets: RuleSet[], keyframes: Keyframes[], mediaQueryString?: string | string[]): void {
	for (const node of nodes) {
		if (isKeyframe(node)) {
			const keyframeRule: Keyframes = {
				name: node.name,
				keyframes: node.keyframes,
				mediaQueryString: mediaQueryString,
			};

			keyframes.push(keyframeRule);
		} else if (isMedia(node)) {
			// Media query can be an array of strings in case of nested queries
			let compositeMediaQuery: string | string[];

			if (mediaQueryString) {
				if (typeof mediaQueryString === 'string') {
					compositeMediaQuery = [mediaQueryString, node.media];
				} else {
					mediaQueryString.push(node.media);
					compositeMediaQuery = mediaQueryString;
				}
			} else {
				compositeMediaQuery = node.media;
			}

			_populateRules(node.rules, rulesets, keyframes, compositeMediaQuery);
		} else if (isRule(node)) {
			const ruleset = fromAstNode(node);
			ruleset.mediaQueryString = mediaQueryString;

			rulesets.push(ruleset);
		}
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
		// Rules were dropped from the middle of the list, so the index has to be rebuilt.
		applicationSelectorsResetVersion++;
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
		// The base stylesheet is replaced rather than appended to.
		applicationSelectorsResetVersion++;
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

getNativeScriptGlobals().events.on('cssChanged', <any>onCssChanged);
getNativeScriptGlobals().events.on('livesync', onLiveSync);

// Call to this method is injected in the application in:
//  - no-snapshot - code injected in app.ts by [bundle-config-loader](https://github.com/NativeScript/nativescript-dev-webpack/blob/9b1e34d8ef838006c9b575285c42d2304f5f02b5/bundle-config-loader.ts#L85-L92)
//  - with-snapshot - code injected in snapshot bundle by [NativeScriptSnapshotPlugin](https://github.com/NativeScript/nativescript-dev-webpack/blob/48b26f412fd70c19dc0b9c7763e08e9505a0ae11/plugins/NativeScriptSnapshotPlugin/index.js#L48-L56)
// Having the app.css loaded in snapshot provides significant boost in startup (when using the ns-theme ~150 ms). However, because app.css is resolved at build-time,
// when the snapshot is created - there is no way to use file qualifiers or change the name of on app.css
export const loadAppCSS = profile('"style-scope".loadAppCSS', (args: LoadAppCSSEventData) => {
	loadCss(args.cssFile, null, null);
	getNativeScriptGlobals().events.off('loadAppCss', loadAppCSS);
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
	getNativeScriptGlobals().events.on('loadAppCss', loadAppCSS);
}

function trackedNamesEqual(a: Set<string> | undefined, b: Set<string> | undefined): boolean {
	if (a === b) {
		return true;
	}

	if (!a || !b || a.size !== b.size) {
		return false;
	}

	for (const name of a) {
		if (!b.has(name)) {
			return false;
		}
	}

	return true;
}

/**
 * Whether two change maps subscribe to exactly the same things.
 *
 * Re-matching usually lands on the same dependencies - the same view, the same
 * pseudo classes - so this decides whether the listeners have to be touched at
 * all. Both empty maps count as equal even though they are different objects.
 */
function changeMapsEqual(applied: Readonly<ChangeMap<ViewBase>>, current: ChangeMap<ViewBase>): boolean {
	if (applied === current) {
		return true;
	}

	if (applied.size !== current.size) {
		return false;
	}

	for (const [view, changes] of applied) {
		const currentChanges: Changes = current.get(view);
		if (!currentChanges || !trackedNamesEqual(changes.attributes, currentChanges.attributes) || !trackedNamesEqual(changes.pseudoClasses, currentChanges.pseudoClasses)) {
			return false;
		}
	}

	return true;
}

export class CssState {
	static emptyChangeMap: Readonly<ChangeMap<ViewBase>> = Object.freeze(new Map());
	static emptyPropertyBag: Record<string, unknown> = {};
	static emptyAnimationArray: ReadonlyArray<KeyframeAnimation> = Object.freeze([]);
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
	_appliedAnimations: ReadonlyArray<KeyframeAnimation>;
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
		const view = this.viewRef.get();
		if (view && view.isLoaded) {
			// Matching does not read the subscriptions, so the new match can be computed
			// first and its dependencies compared against the ones already subscribed to.
			// They are usually identical, and tearing every listener down only to add the
			// same ones back is pure churn - it also toggles the widget-level pseudo class
			// handlers off and on for nothing.
			this.updateMatch();

			if (!changeMapsEqual(this._appliedChangeMap, this._match.changeMap)) {
				this.unsubscribeFromDynamicUpdates();
				this.subscribeForDynamicUpdates();
			}

			this.updateDynamicState();
		} else {
			this._matchInvalid = true;
		}
	}

	/**
	 * Checks whether style scope and CSS state selectors are in sync.
	 */
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

		const selectors = this._match.selectors;
		const matchingSelectors: SelectorCore[] = [];
		for (let i = 0, length = selectors.length; i < length; i++) {
			const sel = selectors[i];
			if (!sel.dynamic || sel.match(view)) {
				matchingSelectors.push(sel);
			}
		}

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
		const animations: KeyframeAnimation[] = [];

		matchingSelectors.forEach((selector) => {
			const ruleAnimations: KeyframeAnimationInfo[] = selector.ruleset?.[animationsSymbol];
			if (ruleAnimations) {
				for (const animationInfo of ruleAnimations) {
					const animation = KeyframeAnimation.keyframeAnimationFromInfo(animationInfo);
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

		// These stay empty in the common case (nothing changed, no css expressions), so
		// they are only allocated once there is something to put in them.
		let valuesToApply: Record<string, unknown>;
		let cssExpsProperties: Record<string, string>;
		let pendingProperties: Record<string, CssPendingSubstitution>;

		for (const property in newPropertyValues) {
			const value = newPropertyValues[property];

			if (_isCssPendingSubstitution(value)) {
				// The shorthand behind it can only be parsed once its expression has been
				// evaluated, which needs the css variables below to be up to date first.
				if (!pendingProperties) {
					pendingProperties = {};
				}
				pendingProperties[property] = value;
				continue;
			}

			// Expanded shorthands carry already-converted values, which can never be
			// an expression.
			const isCssExp = typeof value === 'string' && (isCssVariableExpression(value) || isCssCalcExpression(value));

			if (isCssExp) {
				// we handle css exp separately because css vars must be evaluated first
				if (!cssExpsProperties) {
					cssExpsProperties = {};
				}
				cssExpsProperties[property] = value;
				continue;
			}

			// Consume the entry - whatever is left in oldProperties once every new
			// value has been visited was removed and has to be unset.
			const hadOldValue = property in oldProperties;
			const unchanged = hadOldValue && oldProperties[property] === value;
			if (hadOldValue) {
				delete oldProperties[property];
			}

			if (isCssVariable(property)) {
				// The scoped css-variables were just reset, so they always have to be re-registered.
				view.style.setScopedCssVariable(property, value);
				delete newPropertyValues[property];
				continue;
			}

			if (unchanged) {
				// Skip unchanged values
				continue;
			}

			if (!valuesToApply) {
				valuesToApply = {};
			}
			valuesToApply[property] = value;
		}
		//we need to parse CSS vars first before evaluating css expressions
		for (const property in cssExpsProperties) {
			const hadOldValue = property in oldProperties;
			const oldValue = hadOldValue ? oldProperties[property] : undefined;
			if (hadOldValue) {
				delete oldProperties[property];
			}

			const value = evaluateCssExpressions(view, property, cssExpsProperties[property]);

			if (isCssVariable(property)) {
				view.style.setScopedCssVariable(property, value);
				delete newPropertyValues[property];
				continue;
			}

			if (value === unsetValue) {
				delete newPropertyValues[property];
			} else {
				// Store the evaluated value so the next update can tell whether the
				// expression still resolves to what is currently applied.
				newPropertyValues[property] = value;
			}

			if (hadOldValue && oldValue === value) {
				// Skip unchanged values
				continue;
			}

			if (!valuesToApply) {
				valuesToApply = {};
			}
			valuesToApply[property] = value;
		}
		// Each shorthand is resolved once, however many longhands point at it.
		let resolvedShorthands: Map<CssPendingSubstitution, Record<string, unknown>>;
		for (const property in pendingProperties) {
			const pending = pendingProperties[property];

			if (!resolvedShorthands) {
				resolvedShorthands = new Map();
			}

			let resolved = resolvedShorthands.get(pending);
			if (!resolved) {
				resolved = resolvePendingSubstitution(view, pending);
				resolvedShorthands.set(pending, resolved);
			}

			const value = property in resolved ? resolved[property] : unsetValue;

			const hadOldValue = property in oldProperties;
			const oldValue = hadOldValue ? oldProperties[property] : undefined;
			if (hadOldValue) {
				delete oldProperties[property];
			}

			if (value === unsetValue) {
				delete newPropertyValues[property];
			} else {
				// Remember the resolved value so the next update can tell whether the
				// shorthand still resolves to what is currently applied.
				newPropertyValues[property] = value;
			}

			if (hadOldValue && oldValue === value) {
				// Skip unchanged values
				continue;
			}

			if (!valuesToApply) {
				valuesToApply = {};
			}
			valuesToApply[property] = value;
		}

		// Unset removed values. The bag is keyed by longhands only, so no two entries
		// write the same style property and unsetting one cannot clear another.
		for (const property in oldProperties) {
			if (property in view.style) {
				view.style[`css:${property}`] = unsetValue;
			} else {
				const camelCasedProperty = property.replace(kebabCasePattern, kebabCaseReplacementFunc);
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
					const camelCasedProperty = property.replace(kebabCasePattern, kebabCaseReplacementFunc);
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
						view[eventName](true);
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
						view[eventName](false);
					}
				});
			}
		});
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
	private _localSelectorScope: StyleSheetSelectorScope<any>;
	private _css = '';

	private _hasSelectors = false;
	private _mergedCssKeyframes: Keyframes[];

	private _localCssSelectors: RuleSet[] = [];
	private _localCssKeyframes: Keyframes[] = [];
	private _localCssSelectorVersion = 0;

	private _localCssSelectorsAppliedVersion = 0;
	private _applicationCssSelectorsAppliedVersion = 0;
	private _cssFiles = new Set<string>();

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
		this._cssFiles.add(cssFileName);
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
			this._cssFiles.add(cssFileName);
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

	public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo {
		if (!this._mergedCssKeyframes) {
			return null;
		}

		const keyframeRule = this.findKeyframeRule(animationName);

		const animation = new KeyframeAnimationInfo();
		animation.keyframes = keyframeRule ? CssAnimationParser.keyframesArrayFromCSS(keyframeRule.keyframes) : null;

		return animation;
	}

	public ensureSelectors(): number {
		if (!this.isApplicationCssSelectorsLatestVersionApplied() || !this.isLocalCssSelectorsLatestVersionApplied()) {
			this._createSelectors();
		}

		return this.getSelectorsVersion();
	}

	/**
	 * True when any selector in the scope contains an adjacent sibling ('+') combinator.
	 */
	get hasAdjacentCombinatorSelectors(): boolean {
		this.ensureSelectors();

		return !!applicationSelectorScope?.hasAdjacentCombinatorSelectors || !!this._localSelectorScope?.hasAdjacentCombinatorSelectors;
	}

	/**
	 * True when any selector in the scope contains a general sibling ('~') combinator.
	 */
	get hasSiblingCombinatorSelectors(): boolean {
		this.ensureSelectors();

		return !!applicationSelectorScope?.hasSiblingCombinatorSelectors || !!this._localSelectorScope?.hasSiblingCombinatorSelectors;
	}

	/**
	 * Increase the application CSS selector version.
	 */
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
		const cssFiles = this._cssFiles;
		const applicationScope = getApplicationSelectorScope();
		this._applicationCssSelectorsAppliedVersion = applicationCssSelectorVersion;

		if (!this.isLocalCssSelectorsLatestVersionApplied() || (!this._localSelectorScope && this._localCssSelectors.length > 0)) {
			this._localSelectorScope = this._localCssSelectors.length > 0 ? new StyleSheetSelectorScope(this._localCssSelectors, SelectorTier.Local) : null;
		}

		this._localCssSelectorsAppliedVersion = this._localCssSelectorVersion;
		this._hasSelectors = !!applicationScope || !!this._localSelectorScope;

		const toMergeKeyframes: Keyframes[] = [];
		const applicationKeyframes = getMergedApplicationCssKeyframes();
		for (let i = 0, length = applicationKeyframes.length; i < length; i++) {
			const keyframe = applicationKeyframes[i];
			if (!keyframe.scopedTag || cssFiles.has(keyframe.scopedTag)) {
				toMergeKeyframes.push(keyframe);
			}
		}

		const localKeyframes = this._localCssKeyframes;
		for (let i = 0, length = localKeyframes.length; i < length; i++) {
			toMergeKeyframes.push(localKeyframes[i]);
		}

		this._mergedCssKeyframes = toMergeKeyframes.length > 0 ? toMergeKeyframes : null;
	}

	// HACK: This @profile decorator creates a circular dependency
	// HACK: because the function parameter type is evaluated with 'typeof'
	@profile
	public matchSelectors(view): SelectorsMatch<ViewBase> {
		// should be (view: ViewBase): SelectorsMatch<ViewBase>
		this.ensureSelectors();

		if (!this._hasSelectors) {
			return null;
		}

		// The application and the scope's own stylesheets are indexed separately, so
		// their candidates are gathered into one array and resolved together - the
		// cascade needs to see them as a single ordered set.
		const candidates: SelectorCore[] = [];
		applicationSelectorScope?.collectCandidates(view, candidates);
		this._localSelectorScope?.collectCandidates(view, candidates);

		const match = matchSelectorCandidates<ViewBase>(view, candidates, applicationSelectorsHaveScopedTags ? this._cssFiles : undefined);

		// Make sure to re-apply keyframes to matching selectors as a media query keyframe might be applicable at this point
		this._applyKeyframesToSelectors(match.selectors);

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
			const animations: KeyframeAnimationInfo[] = ruleset[animationsSymbol];

			if (animations != null && animations.length) {
				for (const animation of animations) {
					const keyframeRule = this.findKeyframeRule(animation.name);
					animation.keyframes = keyframeRule ? CssAnimationParser.keyframesArrayFromCSS(keyframeRule.keyframes) : null;
				}
			}
		}
	}

	public getAnimations(ruleset: RuleSet): KeyframeAnimationInfo[] {
		return ruleset[animationsSymbol];
	}

	private findKeyframeRule(animationName: string): Keyframes {
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

export const applyInlineStyle = profile('applyInlineStyle', function applyInlineStyle(view: ViewBase, styleStr: string) {
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

	// A shorthand that could not be expanded while parsing left a pending-substitution
	// value on each of its longhands; resolving it once serves all of them.
	let resolvedShorthands: Map<CssPendingSubstitution, Record<string, unknown>>;

	inlineRuleSet[0].declarations.forEach((d) => {
		// Use the actual property name so that a local value is set.
		const property = d.property;
		try {
			if (isCssVariable(property)) {
				// Skip css-variables, they have been handled
				return;
			}

			let value: unknown;
			if (_isCssPendingSubstitution(d.value)) {
				if (!resolvedShorthands) {
					resolvedShorthands = new Map();
				}

				let resolved = resolvedShorthands.get(d.value);
				if (!resolved) {
					resolved = resolvePendingSubstitution(view, d.value);
					resolvedShorthands.set(d.value, resolved);
				}

				value = property in resolved ? resolved[property] : unsetValue;
			} else {
				value = evaluateCssExpressions(view, property, d.value);
			}

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
