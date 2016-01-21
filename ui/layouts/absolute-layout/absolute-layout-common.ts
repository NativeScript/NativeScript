import definition = require("ui/layouts/absolute-layout");
import {LayoutBase} from "ui/layouts/layout-base";
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyChangeData} from "ui/core/dependency-observable";
import {registerSpecialProperty} from "ui/builder/special-properties";

function validateArgs(element: View): View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

registerSpecialProperty("left", (instance, propertyValue) => {
    AbsoluteLayout.setLeft(instance, !isNaN(+propertyValue) && +propertyValue);
});
registerSpecialProperty("top", (instance, propertyValue) => {
    AbsoluteLayout.setTop(instance, !isNaN(+propertyValue) && +propertyValue);
});

export class AbsoluteLayout extends LayoutBase implements definition.AbsoluteLayout {
    private static isValid(value: number): boolean {
        return isFinite(value);
    }

    private static onLeftPropertyChanged(data: PropertyChangeData) {
        var view = data.object;
        if (view instanceof View) {
            var layout = view.parent;
            if (layout instanceof AbsoluteLayout) {
                layout.onLeftChanged(view, data.oldValue, data.newValue);
            }
        }
    }

    private static onTopPropertyChanged(data: PropertyChangeData) {
        var view = data.object;
        if (view instanceof View) {
            var layout = view.parent;
            if (layout instanceof AbsoluteLayout) {
                layout.onTopChanged(view, data.oldValue, data.newValue);
            }
        }
    }

    public static leftProperty = new Property("left", "AbsoluteLayout",
        new PropertyMetadata(0, undefined, AbsoluteLayout.onLeftPropertyChanged, AbsoluteLayout.isValid));

    public static topProperty = new Property("top", "AbsoluteLayout",
        new PropertyMetadata(0, undefined, AbsoluteLayout.onTopPropertyChanged, AbsoluteLayout.isValid));

    public static getLeft(element: View): number {
        return validateArgs(element)._getValue(AbsoluteLayout.leftProperty);
    }

    public static setLeft(element: View, value: number): void {
        validateArgs(element)._setValue(AbsoluteLayout.leftProperty, value);
    }

    public static getTop(element: View): number {
        return validateArgs(element)._getValue(AbsoluteLayout.topProperty);
    }

    public static setTop(element: View, value: number): void {
        validateArgs(element)._setValue(AbsoluteLayout.topProperty, value);
    }

    protected onLeftChanged(view: View, oldValue: number, newValue: number) {
        //
    }

    protected onTopChanged(view: View, oldValue: number, newValue: number) {
        //
    }
}