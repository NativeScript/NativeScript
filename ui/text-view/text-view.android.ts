import observable = require("ui/core/observable");
import view = require("ui/core/view");

export class TextView extends view.View {
    public android: android.widget.TextView;

    get text(): string {
        if (this.android) {
            return this.android.getText().toString();
        }

        return undefined;
    }
    set text(value: string) {

    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO:
    }
} 