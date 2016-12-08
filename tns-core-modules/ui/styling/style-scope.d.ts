//@private
declare module "ui/styling/style-scope" {
    import { ViewBase } from "ui/core/view-base";
    import { SyntaxTree } from "css";
    import { RuleSet, Node, SelectorCore, ChangeMap } from "ui/styling/css-selector";
    import { KeyframeAnimationInfo } from "ui/animation/keyframe-animation";

    export class CssState {
        /**
         * Re-evaluate the selectors and apply any changes to the underlying view.
         */
        public apply(): void;

        /**
         * Gets the static selectors that match the view and the dynamic selectors that may potentially match the view.
         */
        public changeMap: ChangeMap<ViewBase>;
    }

    export class StyleScope {
        public css: string;
        public addCss(cssString: string, cssFileName: string): void;

        public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): RuleSet[];
        public static createSelectorsFromImports(tree: SyntaxTree, keyframes: Object): RuleSet[];
        public ensureSelectors(): boolean;

        public applySelectors(view: ViewBase): void
        public query(options: Node): SelectorCore[];

        public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo;
        public getAnimations(ruleset: RuleSet): KeyframeAnimationInfo[];
    }

    export function resolveFileNameFromUrl(url: string, appDirectory: string, fileExists: (string) => boolean): string;
    export function applyInlineSyle(view: ViewBase, style: string): void;
}