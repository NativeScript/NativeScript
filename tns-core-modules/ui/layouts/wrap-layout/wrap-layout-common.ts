import definition = require("ui/layouts/wrap-layout");
import platform = require("platform");
import {LayoutBase} from "ui/layouts/layout-base";
import {Orientation} from "ui/enums";
import {PropertyMetadata} from "ui/core/proxy";
import {Property, PropertyMetadataSettings} from "ui/core/dependency-observable";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (so we skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

function isWidthHeightValid(value: any): boolean {
    return (value >= 0.0 && value !== Number.POSITIVE_INFINITY);
}

function isValidOrientation(value: any): boolean {
    return value === Orientation.vertical || value === Orientation.horizontal;
}

export class WrapLayout extends LayoutBase implements definition.WrapLayout {
    public static orientationProperty = new Property("orientation", "WrapLayout", new PropertyMetadata(Orientation.horizontal, AffectsLayout, undefined, isValidOrientation));
    public static itemWidthProperty = new Property("itemWidth", "WrapLayout", new PropertyMetadata(0, AffectsLayout, undefined, isWidthHeightValid));
    public static itemHeightProperty = new Property("itemHeight", "WrapLayout", new PropertyMetadata(0, AffectsLayout, undefined, isWidthHeightValid));

    get orientation(): string {
        return this._getValue(WrapLayout.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(WrapLayout.orientationProperty, value);
    }

    get itemWidth(): number {
        return this._getValue(WrapLayout.itemWidthProperty);
    }
    set itemWidth(value: number) {
        this._setValue(WrapLayout.itemWidthProperty, value);
    }

    get itemHeight(): number {
        return this._getValue(WrapLayout.itemHeightProperty);
    }
    set itemHeight(value: number) {
        this._setValue(WrapLayout.itemHeightProperty, value);
    }
}
