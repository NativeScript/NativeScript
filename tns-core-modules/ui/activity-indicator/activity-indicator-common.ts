import {ActivityIndicator as ActivityIndicatorDefinition} from "ui/activity-indicator";
import {View} from "ui/core/view";
import {Property} from "ui/core/properties";

export class ActivityIndicatorBase extends View implements ActivityIndicatorDefinition {
    public busy: boolean;
}

export let busyProperty = new Property<ActivityIndicatorBase, boolean>({ name: "busy", defaultValue: false });
busyProperty.register(ActivityIndicatorBase);