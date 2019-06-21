import * as frame from "tns-core-modules/ui/frame";

export function navigate() {
    frame.topmost().navigate("action-bar/clean-page");
}
