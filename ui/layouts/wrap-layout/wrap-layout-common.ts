import layouts = require("ui/layouts/layout-base");
import definition = require("ui/layouts/wrap-layout");
import dependencyObservable = require("ui/core/dependency-observable");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");

// on Android we explicitly set propertySettings to None because android will invalidate its layout (so we skip unnecessary native call).
var AffectsLayout = global.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;

function isWidthHeightValid(value: any): boolean {
    return (value >= 0.0 && value !== Number.POSITIVE_INFINITY);
}

function isValidOrientation(value: any): boolean {
    return value === enums.Orientation.vertical || value === enums.Orientation.horizontal;
}

export class WrapLayout extends layouts.LayoutBase implements definition.WrapLayout {

    public static orientationProperty = new dependencyObservable.Property("orientation", "WrapLayout",
        new proxy.PropertyMetadata(enums.Orientation.horizontal, AffectsLayout, undefined, isValidOrientation));

    public static itemWidthProperty = new dependencyObservable.Property("itemWidth", "WrapLayout",
        new proxy.PropertyMetadata(0, AffectsLayout, undefined, isWidthHeightValid));

    public static itemHeightProperty = new dependencyObservable.Property("itemHeight", "WrapLayout",
        new proxy.PropertyMetadata(0, AffectsLayout, undefined, isWidthHeightValid));

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