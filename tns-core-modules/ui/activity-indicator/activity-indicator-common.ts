import {View} from "ui/core/view";
import definition = require("ui/activity-indicator");
import {PropertyMetadataSettings, Property} from "ui/core/dependency-observable";
import proxy = require("ui/core/proxy");

let busyProperty = new Property("busy", "ActivityIndicator", new proxy.PropertyMetadata(false));

export class ActivityIndicator extends View implements definition.ActivityIndicator {

    public static busyProperty = busyProperty;

    get busy(): boolean {
        return this._getValue(ActivityIndicator.busyProperty);
    }
    set busy(value: boolean) {
        this._setValue(ActivityIndicator.busyProperty, value);
    }
}