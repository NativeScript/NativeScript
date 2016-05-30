import view = require("ui/core/view");
import definition = require("ui/activity-indicator");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

var busyProperty = new dependencyObservable.Property(
    "busy",
    "ActivityIndicator",
    new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

export class ActivityIndicator extends view.View implements definition.ActivityIndicator {

    public static busyProperty = busyProperty;

    get busy(): boolean {
        return this._getValue(ActivityIndicator.busyProperty);
    }
    set busy(value: boolean) {
        this._setValue(ActivityIndicator.busyProperty, value);
    }
}