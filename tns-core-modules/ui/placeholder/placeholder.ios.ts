import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "."
import { View } from "../core/view"

export class Placeholder extends View implements PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    private _ios: UIView;

    get ios(): UIView {
        if (!this._ios) {
            var args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: undefined };
            super.notify(args);
            this.nativeView = this._ios = args.view;
        }
        return this._ios;
    }
}