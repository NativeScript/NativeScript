declare module "ui/styling/style-properties" {

    import { Color } from "color";
    import { Style, CssProperty, CssAnimationProperty, ShorthandProperty, InheritedCssProperty } from "ui/core/properties";
    import { Font, FontStyle, FontWeight } from "ui/styling/font";
    import { Background } from "ui/styling/background";

    export type Length = "auto" | number | {
        readonly unit: "dip" | "px";
        readonly value: number;
    }

    export namespace Length {
        export function parse(text: string): Length;
        export function equals(a: Length, b: Length): boolean;
        /**
         * Converts Length unit to device pixels.
         * @param length The Length to convert.
         * @param auto Value to use for conversion of "auto".
         */
        export function toDevicePixels(length: Length, auto: number): number;
        export function convertToString(length: Length): string;

    }

    export type PercentLength = "auto" | number | {
        readonly unit: "%" | "dip" | "px";
        /**
         * Length value. When unit is "%" the value is normalized (ex. for 5% the value is 0.05)
         */
        readonly value: number;
    }

    export namespace PercentLength {
        export function parse(text: string): PercentLength;
        export function equals(a: PercentLength, b: PercentLength): boolean;
        /**
         * Converts PercentLength unit to device pixels.
         * @param length The PercentLength to convert.
         * @param auto Value to use for conversion of "auto".
         * @param parentAvailableWidth Value to use as base when converting percent unit.
         */
        export function toDevicePixels(length: PercentLength, auto: number, parentAvailableWidth: number): number;
        export function convertToString(length: PercentLength): string;
    }

    export const zeroLength: Length;

    export const rotateProperty: CssAnimationProperty<Style, number>;
    export const scaleXProperty: CssAnimationProperty<Style, number>;
    export const scaleYProperty: CssAnimationProperty<Style, number>;
    export const translateXProperty: CssAnimationProperty<Style, Length>;
    export const translateYProperty: CssAnimationProperty<Style, Length>;

    export const clipPathProperty: CssProperty<Style, string>;
    export const colorProperty: InheritedCssProperty<Style, Color>;

    export const backgroundColorProperty: CssAnimationProperty<Style, Color>;
    export const backgroundImageProperty: CssProperty<Style, string>;
    export const backgroundRepeatProperty: CssProperty<Style, BackgroundRepeat>;
    export const backgroundSizeProperty: CssProperty<Style, string>;
    export const backgroundPositionProperty: CssProperty<Style, string>;

    export const borderColorProperty: ShorthandProperty<Style, string | Color>;
    export const borderTopColorProperty: CssProperty<Style, Color>;
    export const borderRightColorProperty: CssProperty<Style, Color>;
    export const borderBottomColorProperty: CssProperty<Style, Color>;
    export const borderLeftColorProperty: CssProperty<Style, Color>;

    export const borderWidthProperty: ShorthandProperty<Style, string | Length>;
    export const borderTopWidthProperty: CssProperty<Style, Length>;
    export const borderRightWidthProperty: CssProperty<Style, Length>;
    export const borderBottomWidthProperty: CssProperty<Style, Length>;
    export const borderLeftWidthProperty: CssProperty<Style, Length>;

    export const borderRadiusProperty: ShorthandProperty<Style, string | Length>;
    export const borderTopLeftRadiusProperty: CssProperty<Style, Length>;
    export const borderTopRightRadiusProperty: CssProperty<Style, Length>;
    export const borderBottomRightRadiusProperty: CssProperty<Style, Length>;
    export const borderBottomLeftRadiusProperty: CssProperty<Style, Length>;

    export const zIndexProperty: CssProperty<Style, number>;
    export const visibilityProperty: CssProperty<Style, Visibility>;
    export const opacityProperty: CssAnimationProperty<Style, number>;

    export const minWidthProperty: CssProperty<Style, Length>;
    export const minHeightProperty: CssProperty<Style, Length>;
    export const widthProperty: CssProperty<Style, Length>;
    export const heightProperty: CssProperty<Style, Length>;
    export const marginProperty: ShorthandProperty<Style, string | PercentLength>;
    export const marginLeftProperty: CssProperty<Style, PercentLength>;
    export const marginRightProperty: CssProperty<Style, PercentLength>;
    export const marginTopProperty: CssProperty<Style, PercentLength>;
    export const marginBottomProperty: CssProperty<Style, PercentLength>;

    export const paddingProperty: ShorthandProperty<Style, string | Length>;
    export const paddingLeftProperty: CssProperty<Style, Length>;
    export const paddingRightProperty: CssProperty<Style, Length>;
    export const paddingTopProperty: CssProperty<Style, Length>;
    export const paddingBottomProperty: CssProperty<Style, Length>;

    export const horizontalAlignmentProperty: CssProperty<Style, HorizontalAlignment>;
    export const verticalAlignmentProperty: CssProperty<Style, VerticalAlignment>;

    export const fontSizeProperty: InheritedCssProperty<Style, number>;
    export const fontFamilyProperty: InheritedCssProperty<Style, string>;
    export const fontStyleProperty: InheritedCssProperty<Style, FontStyle>;
    export const fontWeightProperty: InheritedCssProperty<Style, FontWeight>;

    export const backgroundInternalProperty: CssProperty<Style, Background>;
    export const fontInternalProperty: InheritedCssProperty<Style, Font>;

    export type BackgroundRepeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
    export namespace BackgroundRepeat {
        export const REPEAT: "repeat";
        export const REPEAT_X: "repeat-x";
        export const REPEAT_Y: "repeat-y";
        export const NO_REPEAT: "no-repeat";
        export function isValid(value: any): boolean;
        export function parse(value: string): BackgroundRepeat;
    }

    export type Visibility = "visible" | "hidden" | "collapse";
    export namespace Visibility {
        export const VISIBLE: "visible";
        export const HIDDEN: "hidden";
        export const COLLAPSE: "collapse";
        export function isValid(value: any): boolean;
        export function parse(value: string): Visibility;
    }

    export type HorizontalAlignment = "left" | "center" | "right" | "stretch";
    export namespace HorizontalAlignment {
        export const LEFT: "left";
        export const CENTER: "center";
        export const RIGHT: "right";
        export const STRETCH: "stretch";
        export function isValid(value: any): boolean;
        export function parse(value: string): HorizontalAlignment;
    }

    export type VerticalAlignment = "top" | "middle" | "bottom" | "stretch";
    export namespace VerticalAlignment {
        export const TOP: "top";
        export const MIDDLE: "middle";
        export const BOTTOM: "bottom";
        export const STRETCH: "stretch";
        export function isValid(value: any): boolean;
        export function parse(value: string): VerticalAlignment;
    }
}