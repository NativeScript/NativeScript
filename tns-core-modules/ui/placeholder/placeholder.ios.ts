import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "ui/placeholder"

export class Placeholder extends PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    private _ios: UIView;

    get ios(): UIView {
        if (!this._ios) {
            var args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: undefined };
            super.notify(args);
            this._ios = args.view;
        }
        return this._ios;
    }

    get _nativeView(): UIView {
        return this.ios;
    }
}