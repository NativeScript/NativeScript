import definition = require("ui/activity-indicator");
import {View} from "ui/core/view";
import {Property} from "ui/core/dependency-observable";
import {PropertyMetadata} from "ui/core/proxy";

let busyProperty = new Property("busy", "ActivityIndicator", new PropertyMetadata(false));

export class ActivityIndicator extends View implements definition.ActivityIndicator {

    public static busyProperty = busyProperty;

    get busy(): boolean {
        return this._getValue(ActivityIndicator.busyProperty);
    }
    set busy(value: boolean) {
        this._setValue(ActivityIndicator.busyProperty, value);
    }
}