import * as frame from "@nativescript/core/ui/frame";

export function buttonTap(args) {
    frame.topmost().goBack();
}
