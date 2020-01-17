import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";

export function onLoaded(args) {
    const page = args.object;
    const textField = <TextField>page.getViewById("textField");
    const textView = <TextView>page.getViewById("textView");

    attachToEvent(textField, "blur");
    attachToEvent(textField, "focus");
    attachToEvent(textView, "blur");
    attachToEvent(textView, "focus");
}

function attachToEvent(control, event) {
    control.on(event, () => {
        control.text = event + " is thrown";
    });
}
