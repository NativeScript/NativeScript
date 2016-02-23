import definition = require("ui/layouts/stack-layout");
import platform = require("platform");
import {LayoutBase} from "ui/layouts/layout-base";
import {Orientation} from "ui/enums";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

function validateOrientation(value: any): boolean {
    return value === Orientation.vertical || value === Orientation.horizontal;
}

export class StackLayout extends LayoutBase implements definition.StackLayout {
    public static orientationProperty = new Property("orientation", "StackLayout", new PropertyMetadata(Orientation.vertical, AffectsLayout, undefined, validateOrientation));

    get orientation(): string {
        return this._getValue(StackLayout.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(StackLayout.orientationProperty, value);
    }
}
