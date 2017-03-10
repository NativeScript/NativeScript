import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "."
import { View } from "../core/view"

export class Placeholder extends View implements PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    private _android: android.view.View;

    public _createNativeView() {
        let args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: this._context };
        this.notify(args);
        const view = this._android = <android.view.View>args.view;
        return view;
    }

    get android(): android.view.View {
        return this._android;
    }

    get _nativeView(): android.view.View {
        return this._android;
    }
}
