import { DockLayout as DockLayoutDefinition } from "ui/layouts/dock-layout";
import { LayoutBase, View, Property, isIOS, booleanConverter } from "ui/layouts/layout-base";

function validateArgs(element: View): View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

export * from "ui/layouts/layout-base";

declare module "ui/core/view" {
    interface View {
        dock: "left" | "top" | "right" | "bottom";
    }
}

View.prototype.dock = "left";

export class DockLayoutBase extends LayoutBase implements DockLayoutDefinition {

    public static getDock(element: View): "left" | "top" | "right" | "bottom" {
        return validateArgs(element).dock;
    }

    public static setDock(element: View, value: "left" | "top" | "right" | "bottom"): void {
        validateArgs(element).dock = value;
    }

    public stretchLastChild: boolean;

    public onDockChanged(view: View, oldValue: "left" | "top" | "right" | "bottom", newValue: "left" | "top" | "right" | "bottom") {
        //
    }
}

export const dockProperty = new Property<View, "left" | "top" | "right" | "bottom">({
    name: "dock", defaultValue: "left", valueChanged: (target, oldValue, newValue) => {
        if (target instanceof View) {
            const layout = target.parent;
            if (layout instanceof DockLayoutBase) {
                layout.onDockChanged(target, oldValue, newValue);
            }
        }
    }, valueConverter: (v) => {
        if (v === "left" || v === "top" || v === "right" || v === "bottom") {
            return <"left" | "top" | "right" | "bottom">v;
        }

        throw new Error(`Invalid value for dock property: ${v}`);
    }
});
dockProperty.register(DockLayoutBase);

export const stretchLastChildProperty = new Property<DockLayoutBase, boolean>({
    name: "stretchLastChild", defaultValue: true, affectsLayout: isIOS, valueConverter: booleanConverter
});
stretchLastChildProperty.register(DockLayoutBase);