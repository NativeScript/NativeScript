declare module "ui/layouts/flexbox-layout" {

    import {View} from "ui/core/view";
    import {LayoutBase} from "ui/layouts/layout-base";
    import {PropertyMetadata} from "ui/core/proxy";

    export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
    export namespace FlexDirection {
        export const ROW: "row";
        export const ROW_REVERSE: "row-reverse";
        export const COLUMN: "column";
        export const COLUMN_REVERSE: "column-reverse";
    }

    export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
    export namespace FlexWrap {
        export const NOWRAP: "nowrap";
        export const WRAP: "wrap";
        export const WRAP_REVERSE: "wrap-reverse";
    }

    export type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
    export namespace JustifyContent {
        export const FLEX_START: "flex-start";
        export const FLEX_END: "flex-end";
        export const CENTER: "center";
        export const SPACE_BETWEEN: "space-between";
        export const SPACE_AROUND: "space-around";
    }

    export type AlignItems = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
    export namespace AlignItems {
        export const FLEX_START: "flex-start";
        export const FLEX_END: "flex-end";
        export const CENTER: "center";
        export const BASELINE: "baseline";
        export const STRETCH: "stretch";
    }

    export type AlignContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "stretch";
    export namespace AlignContent {
        export const FLEX_START: "flex-start";
        export const FLEX_END: "flex-end";
        export const CENTER: "center";
        export const SPACE_BETWEEN: "space-between";
        export const SPACE_AROUND: "space-around";
        export const STRETCH: "stretch";
    }

    export type AlignSelf = "auto" | AlignItems;
    export namespace AlignSelf {
        export const AUTO: "auto";
        export const FLEX_START: "flex-start";
        export const FLEX_END: "flex-end";
        export const CENTER: "center";
        export const BASELINE: "baseline";
        export const STRETCH: "stretch";
    }

    export class FlexboxLayout extends LayoutBase {
        public static flexDirectionProperty: PropertyMetadata;
        public static flexWrapProperty: PropertyMetadata;
        public static justifyContentProperty: PropertyMetadata;
        public static alignItemsProperty: PropertyMetadata;

        public flexDirection: FlexDirection;
        public flexWrap: FlexWrap;
        public justifyContent: JustifyContent;
        public alignItems: AlignItems;
        public alignContent: AlignContent;

        public static setOrder(view: View, order: number);
        public static getOrder(view: View): number;

        public static setFlexGrow(view: View, grow: number);
        public static getFlexGrow(view: View);

        public static setFlexShrink(view: View, shrink: number);
        public static getFlexShrink(view: View): number;

        public static setAlignSelf(view: View, align: AlignSelf);
        public static getAlignSelf(view: View): AlignSelf;

        public static setFlexWrapBefore(view: View, wrap: boolean);
        public static getFlexWrapBefore(view: View): boolean;
    }
}