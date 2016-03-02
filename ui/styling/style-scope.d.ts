//@private
declare module "ui/styling/style-scope" {
    import view = require("ui/core/view");
    import cssSelector = require("ui/styling/css-selector");
    import cssParser = require("css");
    import animationGroupModule = require("ui/animation/animationgroup");

    export class StyleScope {
        public css: string;
        public addCss(cssString: string, cssFileName: string): void;

        public static createSelectorsFromCss(css: string, cssFileName: string): cssSelector.CssSelector[];
        public static createSelectorsFromImports(tree: cssParser.SyntaxTree): cssSelector.CssSelector[];
        public ensureSelectors();

        public applySelectors(view: view.View): void
        public getVisualStates(view: view.View): Object;

        public removeSelectors(selectorExpression: string);
        public getKeyframesAnimation(animationName: string): animationGroupModule.AnimationGroup;
    }

    export function applyInlineSyle(view: view.View, style: string): void;
}
