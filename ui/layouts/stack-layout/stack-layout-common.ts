import layouts = require("ui/layouts/layout-base");
import definition = require("ui/layouts/stack-layout");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = global.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;

function validateOrientation(value: any): boolean {
    return value === enums.Orientation.vertical || value === enums.Orientation.horizontal;
}

export class StackLayout extends layouts.LayoutBase implements definition.StackLayout {

    public static orientationProperty = new dependencyObservable.Property("orientation","StackLayout",
        new proxy.PropertyMetadata(enums.Orientation.vertical, AffectsLayout, undefined, validateOrientation));

    get orientation(): string {
        return this._getValue(StackLayout.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(StackLayout.orientationProperty, value);
    }
}