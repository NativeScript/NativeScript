import definition = require("ui/layouts/dock-layout");
import platform = require("platform");
import {Dock} from "ui/enums";
import {LayoutBase} from "ui/layouts/layout-base";
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyChangeData, PropertyMetadataSettings} from "ui/core/dependency-observable";
import {registerSpecialProperty} from "ui/builder/special-properties";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

function isDockValid(value: any): boolean {
    return value === Dock.left || value === Dock.top || value === Dock.right || value === Dock.bottom;
}

function validateArgs(element: View): View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

registerSpecialProperty("dock", (instance, propertyValue) => {
    DockLayout.setDock(instance, propertyValue);
});

export class DockLayout extends LayoutBase implements definition.DockLayout {

    private static onDockPropertyChanged(data: PropertyChangeData) {
        var view = data.object;
        if (view instanceof View) {
            var layout = view.parent;
            if (layout instanceof DockLayout) {
                layout.onDockChanged(view, data.oldValue, data.newValue);
            }
        }
    }

    public static dockProperty = new Property(
        "dock", "DockLayout", new PropertyMetadata(Dock.left, undefined, DockLayout.onDockPropertyChanged, isDockValid));

    public static stretchLastChildProperty = new Property(
        "stretchLastChild", "DockLayout", new PropertyMetadata(true, AffectsLayout));

    public static getDock(element: View): string {
        return validateArgs(element)._getValue(DockLayout.dockProperty);
    }

    public static setDock(element: View, value: string): void {
        validateArgs(element)._setValue(DockLayout.dockProperty, value);
    }

    get stretchLastChild(): boolean {
        return this._getValue(DockLayout.stretchLastChildProperty);
    }
    set stretchLastChild(value: boolean) {
        this._setValue(DockLayout.stretchLastChildProperty, value);
    }

    protected onDockChanged(view: View, oldValue: number, newValue: number) {
        //
    }
}