import { ActivityIndicator as ActivityIndicatorDefinition } from ".";
import { View, Property, booleanConverter } from "../core/view";

export * from "../core/view";

export class ActivityIndicatorBase extends View implements ActivityIndicatorDefinition {
    public busy: boolean;
}

ActivityIndicatorBase.prototype.recycleNativeView = true;

export const busyProperty = new Property<ActivityIndicatorBase, boolean>({ name: "busy", defaultValue: false, valueConverter: booleanConverter });
busyProperty.register(ActivityIndicatorBase);
