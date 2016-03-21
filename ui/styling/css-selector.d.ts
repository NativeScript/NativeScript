declare module "ui/styling/css-selector" {
    import view = require("ui/core/view");
    import cssParser = require("css");
    import styleProperty = require("ui/styling/style-property");
    import keyframeAnimation = require("ui/animation/keyframe-animation");

    export class CssSelector {
        constructor(expression: string, declarations: cssParser.Declaration[]);

        expression: string;
        attrExpression: string;

        declarations(): Array<{ property: string; value: any }>;

        specificity: number;

        animations: Array<keyframeAnimation.KeyframeAnimationInfo>;

        matches(view: view.View): boolean;

        apply(view: view.View);

        eachSetter(callback: (property: styleProperty.Property, resolvedValue: any) => void);

    }

    class CssTypeSelector extends CssSelector {
        specificity: number;
        matches(view: view.View): boolean;
    }

    class CssIdSelector extends CssSelector {
        specificity: number;
        matches(view: view.View): boolean;
    }

    class CssClassSelector extends CssSelector {
        specificity: number;
        matches(view: view.View): boolean;
    }

    export class CssVisualStateSelector extends CssSelector {
        specificity: number;

        key: string;

        state: string;

        constructor(expression: string, declarations: cssParser.Declaration[]);
        matches(view: view.View): boolean;
    }

    export function createSelector(expression: string, declarations: cssParser.Declaration[]): CssSelector;

    class InlineStyleSelector extends CssSelector {
        constructor(declarations: cssParser.Declaration[]);
        apply(view: view.View);
    }

    export function applyInlineSyle(view: view.View, declarations: cssParser.Declaration[]);
}
