import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");

function isValidOrientation(value: any): boolean {
    return value === enums.Orientation.vertical || value === enums.Orientation.horizontal;
}

export var orientationProperty = new dependencyObservable.Property(
    "orientation",
    "ScrollView",
    new proxy.PropertyMetadata(enums.Orientation.vertical,
        dependencyObservable.PropertyMetadataSettings.AffectsLayout,
        undefined,
        isValidOrientation)
    );