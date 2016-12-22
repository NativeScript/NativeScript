import { AbsoluteLayout as AbsoluteLayoutDefinition } from "ui/layouts/absolute-layout";
import { LayoutBase, View, Property, Length, zeroLength, getLengthEffectiveValue } from "ui/layouts/layout-base";

export * from "ui/layouts/layout-base";

declare module "ui/core/view" {
    interface View {
        left: Length;
        top: Length;
        effectiveLeft: number;
        effectiveTop: number;
    }
}

View.prototype.effectiveLeft = 0;
View.prototype.effectiveTop = 0;

function validateArgs(element: View): View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

export class AbsoluteLayoutBase extends LayoutBase implements AbsoluteLayoutDefinition {
    // TODO: Do we still need this? it can be get like view.left
    public static getLeft(element: View): Length {
        return validateArgs(element).left;
    }

    // TODO: Do we still need this? it can be set like view.left=value
    public static setLeft(element: View, value: Length): void {
        validateArgs(element).left = value;
    }

    // TODO: Do we still need this? it can be get like view.top
    public static getTop(element: View): Length {
        return validateArgs(element).top;
    }

    // TODO: Do we still need this? it can be set like view.top=value
    public static setTop(element: View, value: Length): void {
        validateArgs(element).top = value;
    }

    onLeftChanged(view: View, oldValue: Length, newValue: Length) {
        //
    }

    onTopChanged(view: View, oldValue: Length, newValue: Length) {
        //
    }
}

export const leftProperty = new Property<View, Length>({
    name: "left", defaultValue: zeroLength,
    valueChanged: (target, oldValue, newValue) => {
        target.effectiveLeft = getLengthEffectiveValue(newValue);
        const layout = target.parent;
        if (layout instanceof AbsoluteLayoutBase) {
            layout.onLeftChanged(target, oldValue, newValue);
        }
    }, valueConverter: (v) => Length.parse(v)
});
leftProperty.register(AbsoluteLayoutBase);

export const topProperty = new Property<View, Length>({
    name: "top", defaultValue: zeroLength,
    valueChanged: (target, oldValue, newValue) => {
        target.effectiveTop = getLengthEffectiveValue(newValue);
        const layout = target.parent;
        if (layout instanceof AbsoluteLayoutBase) {
            layout.onTopChanged(target, oldValue, newValue);
        }
    }, valueConverter: (v) => Length.parse(v)
});
topProperty.register(AbsoluteLayoutBase);