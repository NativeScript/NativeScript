import layouts = require("ui/layouts/layout-base");
import definition = require("ui/layouts/absolute-layout");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");

function validateArgs(element: view.View): view.View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

export class AbsoluteLayout extends layouts.LayoutBase implements definition.AbsoluteLayout {

    private static isValid(value: number): boolean {
        return isFinite(value);
    }

    private static onLeftPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var uiView = data.object;
        if (uiView instanceof view.View) {
            var layout = uiView.parent;
            if (layout instanceof AbsoluteLayout) {
                layout.onLeftChanged(uiView, data.oldValue, data.newValue);
            }
        }
    }

    private static onTopPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var uiView = data.object;
        if (uiView instanceof view.View) {
            var layout = uiView.parent;
            if (layout instanceof AbsoluteLayout) {
                layout.onTopChanged(uiView, data.oldValue, data.newValue);
            }
        }
    }

    public static leftProperty = new dependencyObservable.Property("left", "AbsoluteLayout",
        new proxy.PropertyMetadata(0, undefined, AbsoluteLayout.onLeftPropertyChanged, AbsoluteLayout.isValid));

    public static topProperty = new dependencyObservable.Property("top", "AbsoluteLayout",
        new proxy.PropertyMetadata(0, undefined, AbsoluteLayout.onTopPropertyChanged, AbsoluteLayout.isValid));

    public static getLeft(element: view.View): number {
        return validateArgs(element)._getValue(AbsoluteLayout.leftProperty);
    }

    public static setLeft(element: view.View, value: number): void {
        validateArgs(element)._setValue(AbsoluteLayout.leftProperty, value);
    }

    public static getTop(element: view.View): number {
        return validateArgs(element)._getValue(AbsoluteLayout.topProperty);
    }

    public static setTop(element: view.View, value: number): void {
        validateArgs(element)._setValue(AbsoluteLayout.topProperty, value);
    }

    protected onLeftChanged(view: view.View, oldValue: number, newValue: number) {
        //
    }

    protected onTopChanged(view: view.View, oldValue: number, newValue: number) {
        //
    }
}