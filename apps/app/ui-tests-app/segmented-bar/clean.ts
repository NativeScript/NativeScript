import * as frame from "ui/frame";

export function navigate(args) {
    frame.topmost().goBack();
}