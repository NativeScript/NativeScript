import layouts = require("ui/layouts/layout-base");
import definition = require("ui/layouts/dock-layout");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");
import {registerSpecialProperty} from "ui/builder/special-properties";
import platform = require("platform");

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;

function isDockValid(value: any): boolean {
    return value === enums.Dock.left || value === enums.Dock.top || value === enums.Dock.right || value === enums.Dock.bottom;
}

function validateArgs(element: view.View): view.View {
    if (!element) {
        throw new Error("element cannot be null or undefinied.");
    }
    return element;
}

registerSpecialProperty("dock", (instance, propertyValue) => {
    DockLayout.setDock(instance, propertyValue);
});

export class DockLayout extends layouts.LayoutBase implements definition.DockLayout {

    private static onDockPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var uiView = data.object;
        if (uiView instanceof view.View) {
            var layout = uiView.parent;
            if (layout instanceof DockLayout) {
                layout.onDockChanged(uiView, data.oldValue, data.newValue);
            }
        }
    }

    public static dockProperty = new dependencyObservable.Property(
        "dock", "DockLayout", new proxy.PropertyMetadata(enums.Dock.left, undefined, DockLayout.onDockPropertyChanged, isDockValid));

    public static stretchLastChildProperty = new dependencyObservable.Property(
        "stretchLastChild", "DockLayout", new proxy.PropertyMetadata(true, AffectsLayout));

    public static getDock(element: view.View): string {
        return validateArgs(element)._getValue(DockLayout.dockProperty);
    }

    public static setDock(element: view.View, value: string): void {
        validateArgs(element)._setValue(DockLayout.dockProperty, value);
    }

    get stretchLastChild(): boolean {
        return this._getValue(DockLayout.stretchLastChildProperty);
    }
    set stretchLastChild(value: boolean) {
        this._setValue(DockLayout.stretchLastChildProperty, value);
    }

    protected onDockChanged(view: view.View, oldValue: number, newValue: number) {
        //
    }
}
