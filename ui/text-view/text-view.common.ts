import observable = require("ui/core/observable");
import view = require("ui/core/view");

export class TextView extends view.View {
    public static textProperty = "text";

    get text(): string {
        return this.getProperty(TextView.textProperty);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO:
    }
} 