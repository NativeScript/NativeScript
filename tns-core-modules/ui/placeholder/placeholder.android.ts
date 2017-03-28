import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "."
import { View } from "../core/view"

export class Placeholder extends View implements PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    public createNativeView() {
        let args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: this._context };
        this.notify(args);
        return <android.view.View>args.view;
    }
}