import {LayoutBase} from "ui/layouts/layout-base";
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyMetadataSettings, PropertyChangeData} from "ui/core/dependency-observable";
import {registerSpecialProperty} from "ui/builder/special-properties";
import {isAndroid} from "platform";

export type Basis = "auto" | number;

const ORDER_DEFAULT = 1;
const FLEX_GROW_DEFAULT = 0.0;
const FLEX_SHRINK_DEFAULT = 1.0;

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var affectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export namespace FlexDirection {
    export const ROW: "row" = "row";
    export const ROW_REVERSE: "row-reverse" = "row-reverse";
    export const COLUMN: "column" = "column";
    export const COLUMN_REVERSE: "column-reverse" = "column-reverse";
}

let validFlexDirection = {
    "row": true,
    "row-reverse": true,
    "column": true,
    "column-reverse": true
};

function validateFlexDirection(value: any): boolean {
    return value in validFlexDirection;
}

export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export namespace FlexWrap {
    export const NOWRAP: "nowrap" = "nowrap";
    export const WRAP: "wrap" = "wrap";
    export const WRAP_REVERSE: "wrap-reverse" = "wrap-reverse";
}

let validFlexWrap = {
    "nowrap": true,
    "wrap": true,
    "wrap-reverse": true
};

function validateFlexWrap(value: any): boolean {
    return value in validFlexWrap;
}

export type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
export namespace JustifyContent {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const SPACE_BETWEEN: "space-between" = "space-between";
    export const SPACE_AROUND: "space-around" = "space-around";
}

let validJustifyContent = {
    "flex-start": true,
    "flex-end": true,
    "center": true,
    "space-between": true,
    "space-around": true
}

export type FlexBasisPercent = number;
export namespace FlexBasisPercent {
    export const DEFAULT: number = -1;
}

function validateJustifyContent(value: any): boolean {
    return value in validJustifyContent;
}

export type AlignItems = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
export namespace AlignItems {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const BASELINE: "baseline" = "baseline";
    export const STRETCH: "stretch" = "stretch";
}

let validAlignItems = {
    "flex-start": true,
    "flex-end": true,
    "center": true,
    "baseline": true,
    "stretch": true
};

function validateAlignItems(value: any): boolean {
    return value in validAlignItems;
}

export type AlignContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "stretch";
export namespace AlignContent {
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const SPACE_BETWEEN: "space-between" = "space-between";
    export const SPACE_AROUND: "space-around" = "space-around";
    export const STRETCH: "stretch" = "stretch";
}

let validAlignContent = {
    "flex-start": true,
    "flex-end": true,
    "center": true,
    "space-between": true,
    "space-around": true,
    "stretch": true
};

function validateAlignContent(value: any): boolean {
    return value in validAlignContent;
}

export type AlignSelf = "auto" | AlignItems;
export namespace AlignSelf {
    export const AUTO: "auto" = "auto";
    export const FLEX_START: "flex-start" = "flex-start";
    export const FLEX_END: "flex-end" = "flex-end";
    export const CENTER: "center" = "center";
    export const BASELINE: "baseline" = "baseline";
    export const STRETCH: "stretch" = "stretch";
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

    public static flexDirectionProperty = new Property("flexDirection", "FlexboxLayout", new PropertyMetadata("row", affectsLayout, undefined, validateFlexDirection, (args: any) => args.object.setNativeFlexDirection(args.newValue)));
    public static flexWrapProperty = new Property("flexWrap", "FlexboxLayout", new PropertyMetadata("nowrap", affectsLayout, undefined, validateFlexWrap, (args: any) => args.object.setNativeFlexWrap(args.newValue)));
    public static justifyContentProperty = new Property("justifyContent", "FlexboxLayout", new PropertyMetadata("flex-start", affectsLayout, undefined, validateJustifyContent, (args: any) => args.object.setNativeJustifyContent(args.newValue)));
    public static alignItemsProperty = new Property("alignItems", "FlexboxLayout", new PropertyMetadata("stretch", affectsLayout, undefined, validateAlignItems, (args: any) => args.object.setNativeAlignItems(args.newValue)));
    public static alignContentProperty = new Property("alignContent", "FlexboxLayout", new PropertyMetadata("stretch", affectsLayout, undefined, validateAlignContent, (args: any) => args.object.setNativeAlignContent(args.newValue)));

    // TODO: Validation:
    public static orderProperty = new Property("order", "FlexboxLayout", new PropertyMetadata(ORDER_DEFAULT, PropertyMetadataSettings.None, FlexboxLayoutBase.childHandler));
    public static flexGrowProperty = new Property("flexGrow", "FlexboxLayout", new PropertyMetadata(FLEX_GROW_DEFAULT, PropertyMetadataSettings.None, FlexboxLayoutBase.childHandler));
    public static flexShrinkProperty = new Property("flexShrink", "FlexboxLayout", new PropertyMetadata(FLEX_SHRINK_DEFAULT, PropertyMetadataSettings.None, FlexboxLayoutBase.childHandler));
    public static flexWrapBeforeProperty = new Property("flexWrapBefore", "FlexboxLayout", new PropertyMetadata(false, PropertyMetadataSettings.None, FlexboxLayoutBase.childHandler));
    public static alignSelfProperty = new Property("alignSelf", "FlexboxLayout", new PropertyMetadata(AlignSelf.AUTO, PropertyMetadataSettings.None, FlexboxLayoutBase.childHandler));

    constructor() {
        super();
    }

    get flexDirection(): FlexDirection {
        return this._getValue(FlexboxLayoutBase.flexDirectionProperty);
    }
    set flexDirection(value: FlexDirection) {
        this._setValue(FlexboxLayoutBase.flexDirectionProperty, value);
    }

    get flexWrap(): FlexWrap {
        return this._getValue(FlexboxLayoutBase.flexWrapProperty);
    }
    set flexWrap(value: FlexWrap) {
        this._setValue(FlexboxLayoutBase.flexWrapProperty, value);
    }

    get justifyContent(): JustifyContent {
        return this._getValue(FlexboxLayoutBase.justifyContentProperty);
    }
    set justifyContent(value: JustifyContent) {
        this._setValue(FlexboxLayoutBase.justifyContentProperty, value);
    }

    get alignItems(): AlignItems {
        return this._getValue(FlexboxLayoutBase.alignItemsProperty);
    }
    set alignItems(value: AlignItems) {
        this._setValue(FlexboxLayoutBase.alignItemsProperty, value);
    }

    get alignContent(): AlignContent {
        return this._getValue(FlexboxLayoutBase.alignContentProperty);
    }
    set alignContent(value: AlignContent) {
        this._setValue(FlexboxLayoutBase.alignContentProperty, value);
    }

    public static setOrder(view: View, order: number) {
        validateArgs(view)._setValue(FlexboxLayoutBase.orderProperty, order);
    }
    public static getOrder(view: View): number {
        return validateArgs(view)._getValue(FlexboxLayoutBase.orderProperty);
    }

    public static setFlexGrow(view: View, grow: number) {
        validateArgs(view)._setValue(FlexboxLayoutBase.flexGrowProperty, grow);
    }
    public static getFlexGrow(view: View) {
        return validateArgs(view)._getValue(FlexboxLayoutBase.flexGrowProperty);
    }

    public static setFlexShrink(view: View, shrink: number) {
        validateArgs(view)._setValue(FlexboxLayoutBase.flexShrinkProperty, shrink);
    }
    public static getFlexShrink(view: View): number {
        return validateArgs(view)._getValue(FlexboxLayoutBase.flexShrinkProperty);
    }

    public static setAlignSelf(view: View, align: AlignSelf) {
        validateArgs(view)._setValue(FlexboxLayoutBase.alignSelfProperty, align);
    }
    public static getAlignSelf(view: View): AlignSelf {
        return validateArgs(view)._getValue(FlexboxLayoutBase.alignSelfProperty);
    }

    public static setFlexWrapBefore(view: View, wrap: boolean) {
        view._setValue(FlexboxLayoutBase.flexWrapBeforeProperty, wrap);
    }
    public static getFlexWrapBefore(view: View): boolean {
        return view._getValue(FlexboxLayoutBase.flexWrapBeforeProperty);
    }

    protected abstract setNativeFlexDirection(flexDirection: FlexDirection);
    protected abstract setNativeFlexWrap(flexWrap: FlexWrap);
    protected abstract setNativeJustifyContent(justifyContent: JustifyContent);
    protected abstract setNativeAlignItems(alignItems: AlignItems);
    protected abstract setNativeAlignContent(alignContent: AlignContent);

    private static childHandler<V>(args: PropertyChangeData) {
        let element = args.object as View;
        if (!(element instanceof View)) {
            throw new Error("Element is not View or its descendant.");
        }
        let flexbox = element.parent;
        if (flexbox instanceof FlexboxLayoutBase) {
            flexbox.invalidate();
        }
    }

    protected abstract invalidate();
}

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
    FlexboxLayoutBase.setFlexWrapBefore(instance, propertyValue);
});
// No flex-basis in our implementation.