import {LayoutBase} from "ui/layouts/layout-base";
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable";
import {registerSpecialProperty} from "ui/builder/special-properties";
import {isAndroid} from "platform";
import {isString, isBoolean} from "utils/types";
import styleProperty = require("ui/styling/style-property");
import * as style from "ui/styling/style";
import * as flexbox from "ui/layouts/flexbox-layout";

declare module "ui/layouts/flexbox-layout" {
    export function _onNativeOrderPropertyChanged(view: View, newValue: number): void;
    export function _onNativeFlexGrowPropertyChanged(view: View, newValue: number): void;
    export function _onNativeFlexShrinkPropertyChanged(view: View, newValue: number): void;
    export function _onNativeAlignSelfPropertyChanged(view: View, newValue: AlignSelf): void;
    export function _onNativeFlexWrapBeforePropertyChanged(view: View, newValue: boolean): void;
}

export type Basis = "auto" | number;

const ORDER_DEFAULT = 1;
const FLEX_GROW_DEFAULT = 0.0;
const FLEX_SHRINK_DEFAULT = 1.0;

function makeValidator<T>(... values: T[]): (value: any) => value is T {
    const set = new Set(values);
    return (value: any): value is T => set.has(value);
}
function makeParser<T>(isValid: (value: any) => boolean, def: T): (value: any) => T {
    return value => {
        const lower = value && value.toLowerCase();
        return isValid(lower) ? lower : def;
    }
}

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export namespace FlexDirection {
    export const ROW: "row" = "row";
    export const ROW_REVERSE: "row-reverse" = "row-reverse";
    export const COLUMN: "column" = "column";
    export const COLUMN_REVERSE: "column-reverse" = "column-reverse";

    export const isValid = makeValidator<FlexDirection>(ROW, ROW_REVERSE, COLUMN, COLUMN_REVERSE);
    export const parse = makeParser(isValid, ROW);
}

export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export namespace FlexWrap {
    export const NOWRAP: "nowrap" = "nowrap";
    export const WRAP: "wrap" = "wrap";
    export const WRAP_REVERSE: "wrap-reverse" = "wrap-reverse";

    export const isValid = makeValidator<FlexWrap>(NOWRAP, WRAP, WRAP_REVERSE);
    export const parse = makeParser(isValid, NOWRAP);
}

export type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
export namespace JustifyContent {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const SPACE_BETWEEN: "space-between" = "space-between";
    export const SPACE_AROUND: "space-around" = "space-around";

    export const isValid = makeValidator<JustifyContent>(FLEX_START, FLEX_END, CENTER, SPACE_BETWEEN, SPACE_AROUND);
    export const parse = makeParser(isValid, FLEX_START);
}

export type FlexBasisPercent = number;
export namespace FlexBasisPercent {
    export const DEFAULT: number = -1;
}

export type AlignItems = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
export namespace AlignItems {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const BASELINE: "baseline" = "baseline";
    export const STRETCH: "stretch" = "stretch";

    export const isValid = makeValidator<AlignItems>(FLEX_START, FLEX_END, CENTER, BASELINE, STRETCH);
    export const parse = makeParser(isValid, FLEX_START);
}

export type AlignContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "stretch";
export namespace AlignContent {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const SPACE_BETWEEN: "space-between" = "space-between";
    export const SPACE_AROUND: "space-around" = "space-around";
    export const STRETCH: "stretch" = "stretch";

    export const isValid = makeValidator<AlignContent>(FLEX_START, FLEX_END, CENTER, SPACE_BETWEEN, SPACE_AROUND, STRETCH);
    export const parse = makeParser(isValid, FLEX_START);
}

export type Order = number;
export namespace Order {
    export function isValid(value): boolean {
         return isFinite(parseInt(value));
    }
    export const parse = parseInt;
}

export type FlexGrow = number;
export namespace FlexGrow {
    export function isValid(value: any): boolean {
        const parsed = parseInt(value);
        return isFinite(parsed) && value >= 0;
    }
    export const parse = parseFloat;
}

export type FlexShrink = number;
export namespace FlexShrink {
    export function isValid(value: any): boolean {
        const parsed = parseInt(value);
        return isFinite(parsed) && value >= 0;
    }
    export const parse = parseFloat;
}

export type FlexWrapBefore = boolean;
export namespace FlexWrapBefore {
    export function isValid(value) {
        if (isBoolean(value)) {
            return true;
        }
        if (isString(value)) {
            const str = value.trim().toLowerCase();
            return str === "true" || str === "false";
        }
        return false;
    }
    export function parse(value: string): FlexWrapBefore {
        return value && value.toString().trim().toLowerCase() === "true";
    }
}

export type AlignSelf = "auto" | AlignItems;
export namespace AlignSelf {
    export const AUTO: "auto" = "auto";
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const BASELINE: "baseline" = "baseline";
    export const STRETCH: "stretch" = "stretch";

    export const isValid = makeValidator<AlignSelf>(AUTO, FLEX_START, FLEX_END, CENTER, BASELINE, STRETCH);
    export const parse = makeParser(isValid, AUTO);
}

function validateArgs(element: View): View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

/**
 * A common base class for all cross platform flexbox layout implementations.
 */
export abstract class FlexboxLayoutBase extends LayoutBase {

    constructor() {
        super();
    }

    get flexDirection(): FlexDirection {
        return this.style._getValue(flexDirectionProperty);
    }
    set flexDirection(value: FlexDirection) {
        this.style._setValue(flexDirectionProperty, value);
    }

    get flexWrap(): FlexWrap {
        return this.style._getValue(flexWrapProperty);
    }
    set flexWrap(value: FlexWrap) {
        this.style._setValue(flexWrapProperty, value);
    }

    get justifyContent(): JustifyContent {
        return this.style._getValue(justifyContentProperty);
    }
    set justifyContent(value: JustifyContent) {
        this.style._setValue(justifyContentProperty, value);
    }

    get alignItems(): AlignItems {
        return this.style._getValue(alignItemsProperty);
    }
    set alignItems(value: AlignItems) {
        this.style._setValue(alignItemsProperty, value);
    }

    get alignContent(): AlignContent {
        return this.style._getValue(alignContentProperty);
    }
    set alignContent(value: AlignContent) {
        this.style._setValue(alignContentProperty, value);
    }

    public static setOrder(view: View, order: number) {
        validateArgs(view).style._setValue(orderProperty, order);
    }
    public static getOrder(view: View): number {
        return validateArgs(view).style._getValue(orderProperty);
    }

    public static setFlexGrow(view: View, grow: number) {
        validateArgs(view).style._setValue(flexGrowProperty, grow);
    }
    public static getFlexGrow(view: View) {
        return validateArgs(view).style._getValue(flexGrowProperty);
    }

    public static setFlexShrink(view: View, shrink: number) {
        validateArgs(view).style._setValue(flexShrinkProperty, shrink);
    }
    public static getFlexShrink(view: View): number {
        return validateArgs(view).style._getValue(flexShrinkProperty);
    }

    public static setAlignSelf(view: View, align: AlignSelf) {
        validateArgs(view).style._setValue(alignSelfProperty, align);
    }
    public static getAlignSelf(view: View): AlignSelf {
        return validateArgs(view).style._getValue(alignSelfProperty);
    }

    public static setFlexWrapBefore(view: View, wrap: boolean) {
        validateArgs(view).style._setValue(flexWrapBeforeProperty, wrap);
    }
    public static getFlexWrapBefore(view: View): boolean {
        return validateArgs(view).style._getValue(flexWrapBeforeProperty);
    }

    abstract _setNativeFlexDirection(flexDirection: FlexDirection);
    abstract _setNativeFlexWrap(flexWrap: FlexWrap);
    abstract _setNativeJustifyContent(justifyContent: JustifyContent);
    abstract _setNativeAlignItems(alignItems: AlignItems);
    abstract _setNativeAlignContent(alignContent: AlignContent);
}

const flexboxAffectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

export const flexDirectionProperty = new styleProperty.Property("flexDirection", "flex-direction", new PropertyMetadata(FlexDirection.ROW, flexboxAffectsLayout, undefined, FlexDirection.isValid), FlexDirection.parse);
export const flexWrapProperty = new styleProperty.Property("flexWrap", "flex-wrap", new PropertyMetadata(FlexWrap.NOWRAP, flexboxAffectsLayout, undefined, FlexWrap.isValid), FlexWrap.parse);
export const justifyContentProperty = new styleProperty.Property("justifyContent", "justify-content", new PropertyMetadata(JustifyContent.FLEX_START, flexboxAffectsLayout, undefined, JustifyContent.isValid), JustifyContent.parse);
export const alignItemsProperty = new styleProperty.Property("alignItems", "align-items", new PropertyMetadata(AlignItems.STRETCH, flexboxAffectsLayout, undefined, AlignItems.isValid), AlignItems.parse);
export const alignContentProperty = new styleProperty.Property("alignContent", "align-content", new PropertyMetadata(AlignContent.STRETCH, flexboxAffectsLayout, undefined, AlignContent.isValid), AlignContent.parse);

export const orderProperty = new styleProperty.Property("order", "order", new PropertyMetadata(ORDER_DEFAULT, PropertyMetadataSettings.None, undefined, Order.isValid), Order.parse);
export const flexGrowProperty = new styleProperty.Property("flexGrow", "flex-grow", new PropertyMetadata(FLEX_GROW_DEFAULT, PropertyMetadataSettings.None, undefined, FlexGrow.isValid), FlexGrow.parse);
export const flexShrinkProperty = new styleProperty.Property("flexShrink", "flex-shrink", new PropertyMetadata(FLEX_SHRINK_DEFAULT, PropertyMetadataSettings.None, undefined, FlexShrink.isValid), FlexShrink.parse);
export const flexWrapBeforeProperty = new styleProperty.Property("flexWrapBefore", "flex-wrap-before", new PropertyMetadata(false, PropertyMetadataSettings.None, undefined, FlexWrapBefore.isValid), FlexWrapBefore.parse);
export const alignSelfProperty = new styleProperty.Property("alignSelf", "align-self", new PropertyMetadata(AlignSelf.AUTO, PropertyMetadataSettings.None, undefined, AlignSelf.isValid), AlignSelf.parse);

registerSpecialProperty("order", (instance, propertyValue) => {
    FlexboxLayoutBase.setOrder(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("flexGrow", (instance, propertyValue) => {
    FlexboxLayoutBase.setFlexGrow(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("flexShrink", (instance, propertyValue) => {
    FlexboxLayoutBase.setFlexShrink(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("alignSelf", (instance, propertyValue) => {
    FlexboxLayoutBase.setAlignSelf(instance, propertyValue);
});
registerSpecialProperty("flexWrapBefore", (instance, propertyValue) => {
    FlexboxLayoutBase.setFlexWrapBefore(instance, isString(propertyValue) ? FlexWrapBefore.parse(propertyValue) : propertyValue);
});

const flexboxGuard = <T>(handler: (flexbox: FlexboxLayoutBase, newValue: any) => void) => (view: View, newValue: any) => view instanceof FlexboxLayoutBase ? handler(view, newValue) : void 0;
style.registerHandler(flexDirectionProperty, new style.StylePropertyChangedHandler(
    flexboxGuard((flexbox, newValue) => flexbox._setNativeFlexDirection(newValue)),
    flexboxGuard((flexbox, newValue) => flexbox._setNativeFlexDirection(FlexDirection.ROW))), "FlexboxLayout");
style.registerHandler(flexWrapProperty, new style.StylePropertyChangedHandler(
    flexboxGuard((flexbox, newValue) => flexbox._setNativeFlexWrap(newValue)),
    flexboxGuard((flexbox, newValue) => flexbox._setNativeFlexWrap(FlexWrap.NOWRAP))), "FlexboxLayout");
style.registerHandler(justifyContentProperty, new style.StylePropertyChangedHandler(
    flexboxGuard((flexbox, newValue) => flexbox._setNativeJustifyContent(newValue)),
    flexboxGuard((flexbox, newValue) => flexbox._setNativeJustifyContent(JustifyContent.FLEX_START))), "FlexboxLayout");
style.registerHandler(alignItemsProperty, new style.StylePropertyChangedHandler(
    flexboxGuard((flexbox, newValue) => flexbox._setNativeAlignItems(newValue)),
    flexboxGuard((flexbox, newValue) => flexbox._setNativeAlignItems(AlignItems.STRETCH))), "FlexboxLayout");
style.registerHandler(alignContentProperty, new style.StylePropertyChangedHandler(
    flexboxGuard((flexbox, newValue) => flexbox._setNativeAlignContent(newValue)),
    flexboxGuard((flexbox, newValue) => flexbox._setNativeAlignContent(AlignContent.STRETCH))), "FlexboxLayout");

style.registerHandler(orderProperty, new style.StylePropertyChangedHandler(
    (view, value) => flexbox._onNativeOrderPropertyChanged(view, value),
    (view, value) => flexbox._onNativeOrderPropertyChanged(view, 1)), "View");
style.registerHandler(flexGrowProperty, new style.StylePropertyChangedHandler(
    (view, value) => flexbox._onNativeFlexGrowPropertyChanged(view, value),
    (view, value) => flexbox._onNativeFlexGrowPropertyChanged(view, 0)), "View");
style.registerHandler(flexShrinkProperty, new style.StylePropertyChangedHandler(
    (view, value) => flexbox._onNativeFlexShrinkPropertyChanged(view, value),
    (view, value) => flexbox._onNativeFlexShrinkPropertyChanged(view, 1)), "View");
style.registerHandler(flexWrapBeforeProperty, new style.StylePropertyChangedHandler(
    (view, value) => flexbox._onNativeFlexWrapBeforePropertyChanged(view, value),
    (view, value) => flexbox._onNativeFlexWrapBeforePropertyChanged(view, false)), "View");
style.registerHandler(alignSelfProperty, new style.StylePropertyChangedHandler(
    (view, value) => flexbox._onNativeAlignSelfPropertyChanged(view, value),
    (view, value) => flexbox._onNativeAlignSelfPropertyChanged(view, AlignSelf.AUTO)), "View");

// flex-flow: <flex-direction> || <flex-wrap>
styleProperty.registerShorthandCallback("flex-flow", value => {
    const properties: styleProperty.KeyValuePair<styleProperty.Property, any>[] = [];
    const trimmed = value && value.trim();
    if (trimmed) {
        let values = trimmed.split(/\s+/);
        if (values.length >= 1 && FlexDirection.isValid(values[0])) {
            properties.push({ property: flexDirectionProperty, value: FlexDirection.parse(values[0]) });
        }
        if (value.length >= 2 && FlexWrap.isValid(values[1])) {
            properties.push({ property: flexWrapProperty, value: FlexWrap.parse(values[1]) });
        }
    }
    return properties;
});

// flex: inital | auto | none | <flex-grow> <flex-shrink> || <flex-basis>
styleProperty.registerShorthandCallback("flex", value => {
    const properties: styleProperty.KeyValuePair<styleProperty.Property, any>[] = [];
    const trimmed = value && value.trim();
    if (trimmed) {
        let values = trimmed.split(/\s+/);
        if (values.length === 1) {
            switch(values[0]) {
                case "inital":
                    properties.push({ property: flexGrowProperty, value: 0});
                    properties.push({ property: flexShrinkProperty, value: 1});
                    // properties.push({ property: flexBasisProperty, value: FlexBasis.AUTO})
                    break;
                case "auto":
                    properties.push({ property: flexGrowProperty, value: 1});
                    properties.push({ property: flexShrinkProperty, value: 1});
                    // properties.push({ property: flexBasisProperty, value: FlexBasis.AUTO})
                    break;
                case "none":
                    properties.push({ property: flexGrowProperty, value: 0});
                    properties.push({ property: flexShrinkProperty, value: 0});
                    // properties.push({ property: flexBasisProperty, value: FlexBasis.AUTO})
                    break;
                default:
                    if (FlexGrow.isValid(values[0])) {
                        properties.push({ property: flexGrowProperty, value: FlexGrow.parse(values[0])});
                        properties.push({ property: flexShrinkProperty, value: 1});
                        // properties.push({ property: flexBasisProperty, value: 0})
                    }
            }
        }
        if (values.length >= 2) {
            if (FlexGrow.isValid(values[0]) && FlexShrink.isValid(values[1])) {
                properties.push({ property: flexGrowProperty, value: FlexGrow.parse(values[0])});
                properties.push({ property: flexShrinkProperty, value: FlexShrink.parse(values[1])});
            }
        }
        // if (value.length >= 3) {
        //     properties.push({ property: flexBasisProperty, value: FlexBasis.parse(values[2])})
        // }
    }
    return properties;
});

// No flex-basis in our implementation.
