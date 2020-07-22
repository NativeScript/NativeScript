import * as frame from "tns-core-modules/ui/frame";

export function navigate() {
    frame.topmost().goBack();
}
