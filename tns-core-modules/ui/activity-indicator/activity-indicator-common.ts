import { ActivityIndicator as ActivityIndicatorDefinition } from "ui/activity-indicator";
import { View, Property, booleanConverter } from "ui/core/view";

export * from "ui/core/view";

export class ActivityIndicatorBase extends View implements ActivityIndicatorDefinition {
    public busy: boolean;
}

export const busyProperty = new Property<ActivityIndicatorBase, boolean>({ name: "busy", defaultValue: false, valueConverter: booleanConverter });
busyProperty.register(ActivityIndicatorBase);