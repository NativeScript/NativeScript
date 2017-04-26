import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "."
import { View } from "../core/view"

export class Placeholder extends View implements PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    public createNativeView() {
        const args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: undefined };
        this.notify(args);
        return <UIView>args.view;
    }
}