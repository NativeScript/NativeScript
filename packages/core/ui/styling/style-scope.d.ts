//@private
import { ViewBase } from '../core/view-base';
import { SyntaxTree } from '../../css';
import { RuleSet, Node, SelectorCore, ChangeMap } from '../styling/css-selector';
import { KeyframeAnimationInfo } from '../animation/keyframe-animation';

export class CssState {
	/**
	 * Re-evaluate the selectors and apply any changes to the underlying view.
	 */
	public apply(): void;

	/**
	 * Gets the static selectors that match the view and the dynamic selectors that may potentially match the view.
	 */
	public changeMap: ChangeMap<ViewBase>;

	/**
	 * Checks whether style scope and CSS state selectors are in sync.
	 */
	public isSelectorsLatestVersionApplied(): boolean;
}

export class StyleScope {
	public css: string;
	public addCss(cssString: string, cssFileName?: string): void;
	public addCssFile(cssFileName: string): void;
	public changeCssFile(cssFileName: string): void;

	public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): RuleSet[];
	public static createSelectorsFromImports(tree: SyntaxTree, keyframes: Object): RuleSet[];
	public ensureSelectors(): number;

	/**
	 * Increase the application CSS selector version.
	 */
	public _increaseApplicationCssSelectorVersion(): void;
	public isApplicationCssSelectorsLatestVersionApplied(): boolean;
	public isLocalCssSelectorsLatestVersionApplied(): boolean;

	public applySelectors(view: ViewBase): void;
	public query(options: Node): SelectorCore[];

	public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo;
	public getAnimations(ruleset: RuleSet): KeyframeAnimationInfo[];
}

export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (filepath: string) => boolean, importSource?: string): string;
export function applyInlineStyle(view: ViewBase, style: string): void;
export function addTaggedAdditionalCSS(cssText: string, tag?: string | Number): boolean;
export function removeTaggedAdditionalCSS(tag: String | Number): boolean;
